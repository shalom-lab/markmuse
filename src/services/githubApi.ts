/**
 * GitHub API 服务
 * 封装 GitHub REST API v3 的调用
 */

interface GitHubFile {
  path: string;
  content: string;
  sha?: string;
  type: 'file' | 'dir';
  size?: number;
}

interface GitHubApiResponse {
  content?: string;
  sha?: string;
  encoding?: string;
  size?: number;
  path?: string;
  type?: string;
}

class GitHubApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export class GitHubApi {
  private token: string;
  private owner: string;
  private repo: string;
  private baseUrl = 'https://api.github.com';

  constructor(token: string, repo: string) {
    this.token = token;
    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
      throw new Error('仓库格式错误，应为 owner/repo');
    }
    this.owner = owner;
    this.repo = repoName;
  }

  /**
   * 发送 API 请求
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    // 对路径进行 URL 编码，确保中文字符等特殊字符正确处理
    // 需要将路径分段编码，因为 GitHub API 需要路径中的 / 保持原样
    const encodedPath = path.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${encodedPath}`;
    
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `token ${this.token}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        // 403 处理：权限不足或资源不可访问
        if (response.status === 403) {
          const errorMessage = data.message || '权限不足';
          // 检查是否是 Token 权限问题
          if (errorMessage.includes('personal access token') || 
              errorMessage.includes('Resource not accessible') ||
              errorMessage.includes('insufficient_scope')) {
            throw new GitHubApiError(
              `Token 权限不足: ${errorMessage}。请检查：1) Token 是否有 'repo' 权限 2) Token 是否已过期 3) 仓库是否为私有仓库且 Token 有访问权限`,
              response.status,
              data
            );
          }
          throw new GitHubApiError(
            `访问被拒绝 (403): ${errorMessage}。请检查 Token 权限和仓库访问权限`,
            response.status,
            data
          );
        }
        // 404 处理：GET 请求的 404 是正常的（文件不存在），但 PUT/DELETE 的 404 是错误
        if (response.status === 404) {
          // GET 请求：文件不存在，返回 null（正常情况）
          if (method === 'GET') {
            return null as T;
          }
          // PUT/DELETE 请求：404 表示操作失败（文件不存在或路径错误）
          throw new GitHubApiError(
            data.message || `文件不存在或路径错误: ${path}`,
            response.status,
            data
          );
        }
        // 422 处理：通常表示验证错误（路径无效、文件太大等）
        if (response.status === 422) {
          const errorMessage = data.message || '请求验证失败';
          const errors = data.errors || [];
          const errorDetails = errors.length > 0 
            ? errors.map((e: any) => e.message || e).join('; ')
            : '';
          throw new GitHubApiError(
            `${errorMessage}${errorDetails ? `: ${errorDetails}` : ''}。路径: ${path}`,
            response.status,
            data
          );
        }
        throw new GitHubApiError(
          data.message || `GitHub API 错误: ${response.status}`,
          response.status,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(
        `网络错误: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 获取文件内容
   */
  async getFile(path: string): Promise<{ content: string; sha: string } | null> {
    try {
      const data = await this.request<GitHubApiResponse>('GET', path);
      
      if (!data || !data.content) {
        return null;
      }

      // GitHub API 返回的 content 是 Base64 编码的
      const content = atob(data.content.replace(/\s/g, ''));
      
      return {
        content,
        sha: data.sha || '',
      };
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 创建或更新文件
   */
  async putFile(
    path: string,
    content: string,
    sha?: string,
    message: string = 'Update file'
  ): Promise<{ sha: string }> {
    // 检查文件大小（GitHub 限制 100MB，但建议小于 50MB）
    const sizeInMB = new Blob([content]).size / (1024 * 1024);
    if (sizeInMB > 50) {
      console.warn(`文件 ${path} 大小 ${sizeInMB.toFixed(2)}MB，超过建议大小 50MB`);
    }
    if (sizeInMB > 100) {
      throw new Error(`文件 ${path} 大小 ${sizeInMB.toFixed(2)}MB，超过 GitHub 限制 100MB`);
    }

    // 将内容编码为 Base64
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    const body: any = {
      message,
      content: encodedContent,
    };

    // 如果提供了 sha，表示更新文件
    if (sha) {
      body.sha = sha;
    }

    try {
      const data = await this.request<{ content?: { sha?: string }; commit?: { sha?: string } }>(
        'PUT',
        path,
        body
      );

      // PUT 请求不应该返回 null（因为 404 会抛出错误）
      if (!data) {
        throw new GitHubApiError('创建文件失败：服务器返回空响应', 500);
      }

      // GitHub API 返回的响应中，sha 可能在 content 中，也可能在 commit 中
      const sha = data.content?.sha || data.commit?.sha;
      if (!sha) {
        console.error('GitHub API 响应格式异常:', data);
        throw new GitHubApiError(
          `创建文件失败：响应中未找到 SHA 值。路径: ${path}`,
          500
        );
      }

      return {
        sha,
      };
    } catch (error) {
      // 如果是更新文件时遇到 404，说明文件不存在，需要创建（不使用 sha）
      if (error instanceof GitHubApiError && error.status === 404 && sha) {
        // 重新尝试创建文件（不使用 sha）
        const createBody: any = {
          message,
          content: encodedContent,
        };
        try {
          const data = await this.request<{ content?: { sha?: string }; commit?: { sha?: string } }>(
            'PUT',
            path,
            createBody
          );
          if (!data) {
            throw new GitHubApiError('创建文件失败：服务器返回空响应', 500);
          }
          
          const sha = data.content?.sha || data.commit?.sha;
          if (!sha) {
            console.error('GitHub API 响应格式异常:', data);
            throw new GitHubApiError(
              `创建文件失败：响应中未找到 SHA 值。路径: ${path}`,
              500
            );
          }
          
          return {
            sha,
          };
        } catch (retryError) {
          // 如果重试仍然失败，抛出更详细的错误
          throw new GitHubApiError(
            `创建文件失败: ${retryError instanceof Error ? retryError.message : '未知错误'}`,
            retryError instanceof GitHubApiError ? retryError.status : 500
          );
        }
      }
      
      // 如果是创建新文件时遇到 404，可能是权限问题或路径问题
      if (error instanceof GitHubApiError && error.status === 404 && !sha) {
        const errorMessage = error.response?.message || error.message;
        throw new GitHubApiError(
          `创建文件失败 (404): ${errorMessage}。请检查：1) Token 是否有写入权限 2) 仓库路径是否正确 3) 路径: ${path}`,
          404,
          error.response
        );
      }
      
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(
    path: string,
    sha: string,
    message: string = 'Delete file'
  ): Promise<void> {
    await this.request('DELETE', path, {
      message,
      sha,
    });
  }

  /**
   * 获取目录下的文件列表
   */
  async getDirectory(path: string): Promise<GitHubFile[]> {
    try {
      const data = await this.request<GitHubApiResponse[]>('GET', path);
      
      if (!data || !Array.isArray(data)) {
        return [];
      }

      return data
        .filter((item: any) => item.type === 'file' || item.type === 'dir')
        .map((item: any) => ({
          path: item.path,
          content: item.type === 'file' ? '' : '', // 目录没有内容
          sha: item.sha,
          type: item.type as 'file' | 'dir',
          size: item.size,
        }));
    } catch (error) {
      if (error instanceof GitHubApiError && error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  /**
   * 检查仓库是否存在且有权限
   */
  async checkRepository(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${this.token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

