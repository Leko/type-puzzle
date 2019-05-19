import React from "react";
import { editor } from "monaco-editor";
import MonacoEditor from "react-monaco-editor";

type Props = {
  model: editor.ITextModel;
  value: string;
  onChange: (code: string) => void;
  editorDidMount: (editor: editor.IStandaloneCodeEditor) => void;
};

export default function CodeEditor({ model, value, onChange, editorDidMount }: Props) {
  return (
    <MonacoEditor
      language="typescript"
      theme="vs-dark"
      value={value}
      onChange={onChange}
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
