import { Uri, editor } from "monaco-editor";
import defaultCode from "raw-loader!./assets/main.txt";
import defaultTSConfig from "raw-loader!./assets/tsconfig.txt";

export const codeEditorModel = editor.createModel(
  defaultCode,
  "typescript",
  Uri.parse("file:///main.tsx")
);

export const tsConfigEditorModel = editor.createModel(
  defaultTSConfig,
  "json",
  Uri.parse("file:///tsconfig.json")
);
