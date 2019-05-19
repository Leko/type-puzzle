import React from "react";
import { editor } from "monaco-editor";
import MonacoEditor from "react-monaco-editor";

type Props = {
  model: editor.ITextModel;
  onChange: (text: string) => void;
};

export function TSConfigEditor({ model, onChange }: Props) {
  return (
    <MonacoEditor
      language="json"
      theme="vs-dark"
      onChange={onChange}
      options={{
        model,
        automaticLayout: true,
        minimap: { enabled: false },
        renderControlCharacters: true
      }}
    />
  );
}
