import React from "react";
import { editor } from "monaco-editor";
import MonacoEditor from "react-monaco-editor";

type Props = {
  model: editor.ITextModel;
  editorDidMount: (editor: editor.IStandaloneCodeEditor) => void;
};

export function CodeEditor({ model, editorDidMount }: Props) {
  return (
    <MonacoEditor
      language="typescript"
      theme="vs-dark"
      editorDidMount={editorDidMount}
      options={{
        model,
        automaticLayout: true,
        minimap: { enabled: false },
        renderControlCharacters: true
      }}
    />
  );
}
