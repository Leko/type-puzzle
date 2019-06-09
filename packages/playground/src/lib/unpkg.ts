function _fetch(
  name: string,
  version: string,
  path: string
): Promise<Response> {
  return fetch(`https://unpkg.com/${name}@${version}${path}`).then(
    (res: Response) => {
      return res.status === 404
        ? Promise.reject(new Error("404 Not found"))
        : res;
    }
  );
}

export type MetaFile = {
  path: string;
  type: "file";
  contentType: string; // FIXME: more strictly
  integrity: string;
  lastModified: string;
  size: number;
};
export type MetaDirectry = {
  path: string;
  type: "directory";
  files: (MetaFile | MetaDirectry)[];
};

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

  fetchFiles(): Promise<MetaDirectry> {
    return fetchAsJson<MetaDirectry>(this.name, this.version, "/?meta");
  }
}
