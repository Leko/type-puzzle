function _fetch(name: string, version: string, path: string) {
  return fetch(`https://unpkg.com/${name}@${version}${path}`).then(res => {
    return res.status === 404
      ? Promise.reject(new Error("404 Not found"))
      : res;
  });
}

function fetchAsJson<T>(
  name: string,
  version: string,
  path: string
): Promise<T> {
  return _fetch(name, version, path).then(res => res.json());
}

function fetchAsText(
  name: string,
  version: string,
  path: string
): Promise<string> {
  return _fetch(name, version, path).then(res => res.text());
}

export class UnPkg {
  constructor(private name: string, private version: string) {}

  fetchAsText(path: string) {
    return fetchAsText(this.name, this.version, path);
  }

  fetchAsJson<T extends {} = {}>(path: string) {
    return fetchAsJson<T>(this.name, this.version, path);
  }
}
