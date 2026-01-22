// 计算 Git Blob SHA-1：sha1("blob " + len + "\0" + content)

export async function gitBlobSha1(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const body = encoder.encode(content);
  const header = encoder.encode(`blob ${body.length}\0`);

  const full = new Uint8Array(header.length + body.length);
  full.set(header, 0);
  full.set(body, header.length);

  const hashBuffer = await crypto.subtle.digest('SHA-1', full);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}


