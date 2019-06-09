// Exmerimental
import * as path from "path";
import {
  createSourceFile,
  CompilerOptions,
  ScriptTarget,
  SourceFile,
  isExportDeclaration,
  isImportDeclaration
} from "typescript";
import { NpmPackage } from "./searcher";
import { UnPkg } from "../unpkg";
import { traverse } from "../ast";

export type Files = {
  uri: string;
  code: string;
}[];

const getEntryTypeFileName = (pkg: NpmPackage) => {
  if (pkg.typings) {
    return pkg.typings.replace(/^\.\//, "/");
  }
  if (pkg.types) {
    if (pkg.types.endsWith(".d.ts")) {
      return `/${pkg.types}`;
    }
    return `/${pkg.types}.d.ts`;
  }

  return "/" + pkg.main.replace(".js", ".d.ts").replace(/^\.\//, "/");
};

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
    compilerOptions: CompilerOptions
  ): Promise<SourceFile[]> {
    const unpkg = new UnPkg(name, version);
    const pkgDetail = await unpkg.fetchAsJson<NpmPackage>("/package.json");
    const entryTypePath = getEntryTypeFileName(pkgDetail);
    const visited: SourceFile[] = [];
    const open: string[] = [entryTypePath];

    while (open.length) {
      let node = open.shift()!;
      if (visited.some(n => n.fileName === node)) {
        continue;
      }

      const sourceFile = createSourceFile(
        node,
        await unpkg.fetchAsText(node),
        compilerOptions.target || ScriptTarget.ES5
      );

      visited.push(sourceFile);
      const referencePaths = sourceFile.referencedFiles.map(file => {
        return path.resolve(path.dirname(node), file.fileName);
      });

      const importPaths: string[] = [];
      traverse(sourceFile, n => {
        if (!isImportDeclaration(n) && !isExportDeclaration(n)) {
          return;
        }
        const { moduleSpecifier } = n;
        if (!moduleSpecifier) {
          return;
        }

        // @ts-ignore Property 'text' does not exist on type 'Expression'.
        const specifier = moduleSpecifier.text;
        if (!specifier.startsWith(".")) {
          console.log(`TODO: Install npm module recursively: ${specifier}`);
          return;
        }

        const _newFilePath = path.resolve(path.dirname(node), specifier);
        const newFilePath = _newFilePath.endsWith(".d.ts")
          ? _newFilePath
          : _newFilePath + ".d.ts";
        importPaths.push(newFilePath);
      });
      open.push(...referencePaths, ...importPaths);
    }

    return visited;
  }
}
