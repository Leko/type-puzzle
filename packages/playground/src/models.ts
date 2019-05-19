import { Uri, editor } from "monaco-editor";
import defaultTSConfig from "raw-loader!./tsconfig.default.txt";

export const codeEditorModel = editor.createModel(
  `import * as x from "external"\nconst tt : string = x.next();`,
  "typescript",
  Uri.parse("file:///main.tsx")
);

export const tsConfigEditorModel = editor.createModel(
  defaultTSConfig,
  "json",
  Uri.parse("file:///tsconfig.json")
);
