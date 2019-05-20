import { SourceFile } from "typescript";
import { languages, IDisposable } from "monaco-editor";

type LanguageServiceDefaults = languages.typescript.LanguageServiceDefaults;

export class Installer {
  private cache: Map<string, IDisposable[]>;
  private languageService: LanguageServiceDefaults;

  constructor(languageService: LanguageServiceDefaults) {
    this.cache = new Map();
    this.languageService = languageService;
  }

  async install(name: string, version: string, files: SourceFile[]) {
    const key = `${name}@${version}`;
    if (this.cache.has(key)) {
      throw new Error(`${key} already installed. Please uninstall before call`);
    }

    const disposables = files.map(file => {
      return this.languageService.addExtraLib(
        file.getFullText(),
        `file:///node_modules/${name}${file.fileName}`
      );
    });

    this.cache.set(key, disposables);
  }

  async uninstall(name: string, version: string) {
    const key = `${name}@${version}`;
    const cache = this.cache.get(key);
    if (!cache) {
      throw new Error(`${key} is not installed. Please install before call`);
    }

    cache.forEach(disposable => disposable.dispose());
  }
}
