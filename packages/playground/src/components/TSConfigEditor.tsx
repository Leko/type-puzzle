import React from "react";
import { editor } from "monaco-editor";
import MonacoEditor from "react-monaco-editor";

type Props = {
  model: editor.ITextModel;
  value: string;
  onChange: (text: string) => void;
};

export default function TSConfigEditor({ model, value, onChange }: Props) {
  return (
    <MonacoEditor
      language="json"
      theme="vs-dark"
      value={value}
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
