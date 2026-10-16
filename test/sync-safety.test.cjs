const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../node_modules/typescript');

// Load the actual TypeScript with isolated storage/network adapters; no GitHub writes.
function load(file, mocks = {}, globals = {}) {
  const exports = {};
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, {
    exports, require: name => {
      if (!(name in mocks)) throw new Error('Missing mock: ' + name);
      return mocks[name];
    }, console, ...globals,
  });
  return exports;
}

const cfg = { owner: 'owner', repo: 'notes', branch: 'main', basePath: '', token: 'test' };
function storage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
}
function setup({ local = 'new', remote = 'old', baseline, failWrite = false } = {}) {
  const writes = [];
  const baselines = load('src/storage/syncBaseline.ts', {}, { localStorage: storage() });
  if (baseline) baselines.updateFileBaseline('note.md', baseline, cfg);
  const coordinator = load('src/sync/syncCoordinator.ts');
  const engine = load('src/sync/syncEngine.ts', {
    './syncCoordinator': coordinator,
    '../storage/syncBaseline': baselines,
    '../storage/opfsFs': {
      listAllEntries: async () => [{ path: 'files/note.md', isDirectory: false }],
      readTextFile: async () => local,
    },
    './githubClient': { GitHubClient: class {
      async listMarkMuseFiles() { return remote ? [{ localPath: 'note.md', sha: remote }] : []; }
      async putFile(...args) {
        writes.push(args);
        if (failWrite) throw Object.assign(new Error('sha changed'), { status: 422 });
      }
      async getFile() { throw new Error('Must not fetch a new SHA and overwrite'); }
    } },
    './gitSha': { gitBlobSha1: async text => text },
    '../storage/pathUtils': { toLogicalPath: p => p.replace(/^files\//, ''), toPhysicalPath: p => 'files/' + p },
  });
  return { engine, coordinator, baselines, writes };
}

for (const scenario of [
  { name: 'push local-only changes with baseline SHA', baseline: 'old', pushed: 1 },
  { name: 'block first-sync same-name differences', pushed: 0 },
  { name: 'block remote-only changes', local: 'old', remote: 'remote-new', baseline: 'old', pushed: 0 },
  { name: 'block simultaneous changes', remote: 'remote-new', baseline: 'old', pushed: 0 },
  { name: 'block resurrection of remotely deleted file', remote: undefined, baseline: 'old', pushed: 0, deleted: true },
  { name: 'create new file when both remote and baseline absent', remote: undefined, pushed: 1, deleted: true },
]) {
  test(scenario.name, async () => {
    const context = setup({ ...scenario, ...(scenario.deleted ? { remote: null } : {}) });
    const result = await context.engine.syncAllMarkdownFiles(cfg);
    assert.equal(result.pushed, scenario.pushed);
    assert.equal(context.writes.length, scenario.pushed);
    assert.equal(result.errors.length, scenario.pushed ? 0 : 1);
    if (scenario.pushed) assert.equal(context.baselines.getFileBaseline('note.md', cfg), 'new');
  });
}

test('equal files establish baseline without uploading', async () => {
  const { engine, baselines, writes } = setup({ local: 'same', remote: 'same' });
  const result = await engine.syncAllMarkdownFiles(cfg);
  assert.equal(result.skipped, 1);
  assert.equal(writes.length, 0);
  assert.equal(baselines.getFileBaseline('note.md', cfg), 'same');
});

test('concurrent remote update does not retry or advance baseline', async () => {
  const { engine, writes, baselines } = setup({ baseline: 'old', failWrite: true });
  const result = await engine.syncAllMarkdownFiles(cfg);
  assert.equal(result.errors.length, 1);
  assert.equal(writes.length, 1);
  assert.equal(baselines.getFileBaseline('note.md', cfg), 'old');
});

test('baselines are isolated by repository, branch and directory', () => {
  const { baselines } = setup({ baseline: 'old' });
  for (const change of [{ repo: 'other' }, { branch: 'other' }, { basePath: 'other' }]) {
    assert.equal(baselines.getFileBaseline('note.md', { ...cfg, ...change }), undefined);
  }
});

test('pre-sync save failure stops all uploads and releases the lock', async () => {
  const { engine, coordinator, writes } = setup({ baseline: 'old' });
  const unregister = coordinator.registerSyncPreparation(async () => { throw new Error('disk full'); });
  await assert.rejects(engine.syncAllMarkdownFiles(cfg), /disk full/);
  assert.equal(writes.length, 0);
  unregister();
  assert.equal((await engine.syncAllMarkdownFiles(cfg)).pushed, 1);
});

test('manual and automatic sync cannot overlap', async () => {
  const { coordinator } = setup();
  let release;
  const first = coordinator.withSyncLock(() => new Promise(resolve => { release = resolve; }));
  await assert.rejects(coordinator.withSyncLock(async () => {}), /正在执行/);
  release();
  await first;
  await coordinator.withSyncLock(async () => {});
});

test('a different browser tab holding the lock prevents preparation', async () => {
  const coordinator = load('src/sync/syncCoordinator.ts', {}, {
    navigator: { locks: { request: async (_name, _options, callback) => callback(null) } },
  });
  let saved = false;
  coordinator.registerSyncPreparation(async () => { saved = true; });
  await assert.rejects(coordinator.withSyncLock(async () => {}), /其他页面/);
  assert.equal(saved, false);
});

test('quick file switch flushes edits without waiting for debounce', async () => {
  const { DraftSession } = load('src/storage/draftSession.ts');
  const writes = [];
  const draft = new DraftSession(async (...args) => writes.push(args));
  draft.open('a.md', 'old');
  draft.edit('latest');
  await draft.flush();
  draft.open('b.md', 'other');
  assert.deepEqual(writes, [['a.md', 'latest']]);
});

test('edits during a save are serialized and newest text remains dirty until saved', async () => {
  const { DraftSession } = load('src/storage/draftSession.ts');
  const writes = [];
  let release;
  const draft = new DraftSession(async (_path, text) => {
    writes.push(text);
    if (writes.length === 1) await new Promise(resolve => { release = resolve; });
  });
  draft.open('a.md', 'old');
  draft.edit('first');
  const first = draft.flush();
  await Promise.resolve();
  draft.edit('second');
  const second = draft.flush();
  release();
  await first;
  await second;
  assert.deepEqual(writes, ['first', 'second']);
  assert.equal(draft.dirty, false);
});

test('failed save preserves draft and later save retries successfully', async () => {
  const { DraftSession } = load('src/storage/draftSession.ts');
  let fail = true;
  const draft = new DraftSession(async () => { if (fail) throw new Error('disk full'); });
  draft.open('a.md', 'old');
  draft.edit('latest');
  await assert.rejects(draft.flush(), /disk full/);
  assert.equal(draft.content, 'latest');
  assert.equal(draft.dirty, true);
  fail = false;
  await draft.flush();
  assert.equal(draft.dirty, false);
});

function editorHarness() {
  const hooks = [];
  let cursor = 0;
  let fail = false;
  const files = new Map([['folder/a.md', 'old'], ['b.md', 'other']]);
  const notices = [];
  const jsx = (type, props) => ({ type, props });
  const mocks = {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in hooks)) hooks[index] = initial;
        return [hooks[index], value => { hooks[index] = value; }];
      },
      useRef(initial) {
        const index = cursor++;
        if (!(index in hooks)) hooks[index] = { current: initial };
        return hooks[index];
      },
      useEffect() {},
    },
    '../storage/draftSession': load('src/storage/draftSession.ts'),
    '../sync/syncCoordinator': { registerSyncPreparation() {} },
    '../services/settingsStorage': {},
    '../utils/toast': { showToast: text => notices.push(text) },
    '../storage/fileTreeService': {
      getFileContent: async path => files.get(path) ?? null,
      saveFileContent: async (path, content) => {
        if (fail) throw new Error('disk full');
        files.set(path, content);
      },
    },
  };
  for (const name of ['Toolbar', 'FileTree', 'MarkdownEditor', 'SettingsPanel', 'ThemeManagePanel']) {
    mocks['../components/' + name] = { default: name };
  }
  const { default: EditorPage } = load('src/pages/EditorPage.tsx', mocks, {
    setTimeout: () => 1, clearTimeout() {},
  });
  function component(name) {
    cursor = 0;
    const visit = node => {
      if (!node || typeof node !== 'object') return undefined;
      if (node.type === name) return node.props;
      for (const child of [node.props?.children].flat()) {
        const found = visit(child);
        if (found) return found;
      }
    };
    return visit(EditorPage());
  }
  return { component, files, notices, failSave: () => { fail = true; } };
}

test('EditorPage actually flushes pending edits before changing selected file', async () => {
  const { component, files } = editorHarness();
  await component('FileTree').onSelectFile('folder/a.md');
  component('MarkdownEditor').onChange('latest');
  await component('FileTree').onSelectFile('b.md');
  assert.equal(files.get('folder/a.md'), 'latest');
  assert.equal(component('MarkdownEditor').currentFilePath, 'b.md');
});

test('EditorPage preserves selection and text when saving fails', async () => {
  const { component, failSave, files, notices } = editorHarness();
  await component('FileTree').onSelectFile('folder/a.md');
  component('MarkdownEditor').onChange('latest');
  failSave();
  await component('FileTree').onSelectFile('b.md');
  assert.equal(component('MarkdownEditor').content, 'latest');
  assert.equal(component('MarkdownEditor').currentFilePath, 'folder/a.md');
  assert.equal(files.get('folder/a.md'), 'old');
  assert.equal(notices.length, 1);
});

test('renaming a parent folder moves the editor path and subsequent saves', async () => {
  const { component, files } = editorHarness();
  await component('FileTree').onSelectFile('folder/a.md');
  component('MarkdownEditor').onChange('before rename');
  await component('FileTree').onMutate('folder', async () => {
    files.set('renamed/a.md', files.get('folder/a.md'));
    files.delete('folder/a.md');
    return 'renamed';
  });
  assert.equal(component('MarkdownEditor').currentFilePath, 'renamed/a.md');
  component('MarkdownEditor').onChange('after rename');
  await component('FileTree').onSelectFile('b.md');
  assert.equal(files.has('folder/a.md'), false);
  assert.equal(files.get('renamed/a.md'), 'after rename');
});

test('deleting the active folder closes the editor without resurrecting the file', async () => {
  const { component, files } = editorHarness();
  await component('FileTree').onSelectFile('folder/a.md');
  component('MarkdownEditor').onChange('latest');
  await component('FileTree').onMutate('folder', async () => {
    files.delete('folder/a.md');
    return null;
  });
  assert.equal(component('MarkdownEditor'), undefined);
  await component('FileTree').onSelectFile('b.md');
  assert.equal(files.has('folder/a.md'), false);
});

test('failed save prevents destructive file operation from running', async () => {
  const { component, failSave } = editorHarness();
  await component('FileTree').onSelectFile('folder/a.md');
  component('MarkdownEditor').onChange('latest');
  failSave();
  let deleted = false;
  await assert.rejects(component('FileTree').onMutate('folder', async () => {
    deleted = true;
    return null;
  }), /disk full/);
  assert.equal(deleted, false);
  assert.equal(component('MarkdownEditor').content, 'latest');
});
