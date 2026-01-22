import { Octokit } from '@octokit/rest';
import type { GitHubConfig } from '../types/type';

export class GitHubClient {
  private octokit: Octokit;
  private cfg: GitHubConfig;

  constructor(cfg: GitHubConfig) {
    this.cfg = cfg;
    this.octokit = new Octokit({ auth: cfg.token });
  }

  /**
   * 将本地路径转换为远程仓库路径
   * - .md 文件 → {basePath}/.markmuse/files/{path}
   * - .themes/*.css → {basePath}/.markmuse/.themes/{id}.css
   */
  private fullPath(path: string): string {
    const base = this.cfg.basePath ? `${this.cfg.basePath}/` : '';
    
    // 主题文件：.themes/{id}.css → .markmuse/.themes/{id}.css
    if (path.startsWith('.themes/')) {
      return `${base}.markmuse/${path}`;
    }
    
    // Markdown 文件：xxx.md → .markmuse/files/xxx.md
    return `${base}.markmuse/files/${path}`;
  }

  async getFile(path: string): Promise<{ sha: string; content: string } | null> {
    const full = this.fullPath(path);
    try {
      const res = await this.octokit.repos.getContent({
        owner: this.cfg.owner,
        repo: this.cfg.repo,
        path: full,
        ref: this.cfg.branch
      });

      if (Array.isArray(res.data)) {
        return null;
      }

      if (!('content' in res.data) || !res.data.content) {
        return null;
      }

      const base64Content = res.data.content.replace(/\s/g, '');
      const binaryString = atob(base64Content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const content = new TextDecoder('utf-8').decode(bytes);

      return {
        sha: res.data.sha || '',
        content
      };
    } catch (e: any) {
      if (e.status === 404) {
        return null;
      }
      throw e;
    }
  }

  async putFile(path: string, content: string, sha?: string, message?: string): Promise<void> {
    const full = this.fullPath(path);

    const encodedContent = btoa(
      new TextEncoder().encode(content).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.cfg.owner,
      repo: this.cfg.repo,
      branch: this.cfg.branch,
      path: full,
      message: message || `Update ${path}`,
      content: encodedContent,
      sha
    });
  }

  /**
   * 删除远程文件
   */
  async deleteFile(path: string, sha: string, message?: string): Promise<void> {
    const full = this.fullPath(path);
    await this.octokit.repos.deleteFile({
      owner: this.cfg.owner,
      repo: this.cfg.repo,
      branch: this.cfg.branch,
      path: full,
      message: message || `Delete ${path}`,
      sha
    });
  }

  /**
   * 列出远程 .markmuse 目录下的所有文件
   * 返回格式：{ repoPath: 远程完整路径, sha: 文件 SHA, localPath: 本地逻辑路径 }
   */
  async listMarkMuseFiles(): Promise<Array<{ repoPath: string; sha: string; localPath: string }>> {
    const base = this.cfg.basePath ? `${this.cfg.basePath}/` : '';
    const markMusePath = `${base}.markmuse`;
    const result: Array<{ repoPath: string; sha: string; localPath: string }> = [];

    async function walkDir(
      octokit: Octokit,
      owner: string,
      repo: string,
      branch: string,
      dirPath: string,
      basePath: string
    ): Promise<void> {
      try {
        const res = await octokit.repos.getContent({
          owner,
          repo,
          path: dirPath,
          ref: branch
        });

        if (Array.isArray(res.data)) {
          // 目录
          for (const item of res.data) {
            if (item.type === 'file') {
              // 转换为本地路径
              let localPath = item.path;
              // 去掉 basePath/.markmuse/ 前缀
              if (localPath.startsWith(basePath + '.markmuse/')) {
                localPath = localPath.slice((basePath + '.markmuse/').length);
              }
              
              // files/xxx.md → xxx.md
              if (localPath.startsWith('files/')) {
                localPath = localPath.slice(6);
              }
              // .themes/xxx.css → .themes/xxx.css (保持不变)

              result.push({
                repoPath: item.path,
                sha: item.sha,
                localPath
              });
            } else if (item.type === 'dir') {
              // 递归遍历子目录
              await walkDir(octokit, owner, repo, branch, item.path, basePath);
            }
          }
        }
      } catch (e: any) {
        if (e.status !== 404) {
          throw e;
        }
      }
    }

    await walkDir(this.octokit, this.cfg.owner, this.cfg.repo, this.cfg.branch, markMusePath, base);
    return result;
  }
}


