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
   * 输入路径可能是物理路径（files/xxx.md 或 .themes/xxx.css）或逻辑路径（xxx.md）
   * - .themes/*.css → {basePath}/.markmuse/.themes/{id}.css
   * - files/xxx.md 或 xxx.md → {basePath}/.markmuse/files/{逻辑路径}
   */
  private fullPath(path: string): string {
    const base = this.cfg.basePath ? `${this.cfg.basePath}/` : '';
    
    // 主题文件：.themes/{id}.css → {basePath}/.markmuse/.themes/{id}.css
    if (path.startsWith('.themes/')) {
      return `${base}.markmuse/${path}`;
    }
    
    // Markdown 文件：处理物理路径和逻辑路径
    // 如果已经是 files/xxx.md 格式，去掉 files/ 前缀得到逻辑路径
    let logicalPath = path;
    if (path.startsWith('files/')) {
      logicalPath = path.slice(6); // 去掉 'files/' 前缀
    }
    
    // 返回 {basePath}/.markmuse/files/{逻辑路径}
    return `${base}.markmuse/files/${logicalPath}`;
  }

  async getFile(path: string): Promise<{ sha: string; content: string } | null> {
    // 验证配置
    if (!this.cfg.owner || !this.cfg.repo) {
      throw new Error(`GitHub 配置无效: owner=${this.cfg.owner}, repo=${this.cfg.repo}`);
    }
    
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

    try {
      const params: any = {
        owner: this.cfg.owner,
        repo: this.cfg.repo,
        branch: this.cfg.branch,
        path: full,
        message: message || `Update ${path}`,
        content: encodedContent,
      };
      // 只有在更新文件时才传递 sha（创建新文件时不传）
      if (sha) {
        params.sha = sha;
      }
      await this.octokit.repos.createOrUpdateFileContents(params);
    } catch (e: any) {
      // 403 错误：权限不足
      if (e.status === 403) {
        // 检查是否是分支保护或权限问题
        const errorMsg = e.message || '';
        if (errorMsg.includes('branch') || errorMsg.includes('protected')) {
          throw new Error(`分支 "${this.cfg.branch}" 可能受保护或 Token 对该分支没有写入权限。请检查分支保护规则或使用默认分支。`);
        }
        throw new Error(`GitHub Token 权限不足，无法写入文件。请检查：1) Token 是否有 "Contents" 的 "Read and write" 权限；2) 如果是 Fine-grained token，是否选择了正确的仓库和分支；3) 分支 "${this.cfg.branch}" 是否存在且可访问。路径: ${full}`);
      }
      // 404 错误：分支不存在或文件路径错误
      if (e.status === 404) {
        // 先检查是否是分支问题
        const errorMsg = e.message || '';
        if (errorMsg.includes('Not Found') || errorMsg.includes('branch')) {
          throw new Error(`分支 "${this.cfg.branch}" 不存在或仓库不存在。请检查分支名称和仓库配置。当前配置：owner=${this.cfg.owner}, repo=${this.cfg.repo}, branch=${this.cfg.branch}`);
        }
        throw new Error(`文件路径不存在：${full}。请检查路径是否正确。`);
      }
      throw e;
    }
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


