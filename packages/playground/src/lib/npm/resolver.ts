import {
  createSourceFile,
  CompilerOptions,
  ScriptTarget,
  SourceFile
} from "typescript";
import { NpmPackage } from "./searcher";
import { UnPkg, MetaFile, MetaDirectry } from "../unpkg";

export type Files = {
  uri: string;
  code: string;
}[];

const getTargetFiles = (entry: MetaDirectry) => {
  const files: MetaFile[] = entry.files.flatMap(
    (entry: MetaDirectry | MetaFile) =>
      entry.type === "directory" ? getTargetFiles(entry) : entry
  );
  return files.filter(({ path }) => {
    const extMatched = extensions.some(ext => path.endsWith(ext));
    const inBlacklist = blackList.some(subStr => path.includes(subStr));
    return extMatched && !inBlacklist;
  });
};

const withRetry = <T = {}>(
  fn: () => Promise<T>,
  limit: number,
  onError: (e: Error) => void = () => {}
): Promise<T> => {
  return fn().catch(e => {
    onError(e);
    if (limit === 0) {
      throw e;
    }

    return withRetry(fn, limit - 1);
  });
};

const blackList = ["package.json"];
const extensions = [".ts", ".tsx", ".js", ".jsx"];

export class Resolver {
  cache: Map<string, Files>;

  constructor() {
    this.cache = new Map();
  }

  async fetchFilesAll(
    pkgs: { name: string; version: string }[],
    compilerOptions: CompilerOptions
  ): Promise<SourceFile[][]> {
    return Promise.all(
      pkgs.map(({ name, version }) => {
        return this.fetchFiles(name, version, compilerOptions);
      })
    );
  }

  async fetchFiles(
    name: string,
    version: string,
    compilerOptions: CompilerOptions,
    prefix = ""
  ): Promise<SourceFile[]> {
    const unpkg = new UnPkg(name, version);
    const pkgJson = await unpkg.fetchAsJson<NpmPackage>("/package.json");
    const fileTree = await unpkg.fetchFiles();
    const files = getTargetFiles(fileTree);

    const dependencySourceFiles = await Promise.all(
      Object.entries(pkgJson.dependencies || {}).map(([pkgName, semver]) =>
        this.fetchFiles(
          pkgName,
          semver,
          compilerOptions,
          prefix + `/node_modules/${pkgName}`
        )
      )
    );

    const sourceFiles = await Promise.all(
      files.map(file =>
        withRetry(() => unpkg.fetchAsText(file.path), 5).then(txt =>
          createSourceFile(
            prefix + file.path,
            txt,
            compilerOptions.target || ScriptTarget.ES5
          )
        )
      )
    );

    return sourceFiles.concat(dependencySourceFiles.flat());
  }
}
