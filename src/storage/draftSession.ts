// Serializes writes and keeps unsaved text in memory when a write fails.
export class DraftSession {
  path: string | null = null;
  content = '';
  private saved = '';
  private writes: Promise<void> = Promise.resolve();

  constructor(private write: (path: string, content: string) => Promise<void>) {}

  get dirty() { return this.path !== null && this.content !== this.saved; }

  open(path: string | null, content = '') {
    this.path = path;
    this.content = this.saved = content;
  }

  edit(content: string) { this.content = content; }

  flush(): Promise<void> {
    const save = async () => {
      if (!this.path || !this.dirty) return;
      const path = this.path;
      const content = this.content;
      await this.write(path, content);
      if (this.path === path) this.saved = content;
    };
    const next = this.writes.then(save, save);
    this.writes = next;
    return next;
  }
}
