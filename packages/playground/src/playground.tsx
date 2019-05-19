import React, { useState, useCallback } from "react";
import { render } from "react-dom";
import { message, Layout, Typography, Button, Tabs, List } from "antd";
import { parseConfigFileTextToJson, CompilerOptions } from "typescript";
import { Uri, editor, languages } from "monaco-editor";
import MonacoEditor from "react-monaco-editor";

import { version } from "../package.json";
import defaultTSConfig from "raw-loader!./tsconfig.default.txt";
import { AppBar } from "./components/AppBar";
import { NpmSearchDialog } from "./components/NpmSearchDialog";
import { useNpmSearch } from "./hooks/useNpmSearch";
import { useNpmInstall } from "./hooks/useNpmInstall";
import { NpmPackageSummary } from "./lib/npm/searcher";
import { Installer } from "./lib/npm/installer";
import { Resolver } from "./lib/npm/resolver";

import "./style.css";
import "antd/dist/antd.less";

const primaryEditorModel = editor.createModel(
  `import * as x from "external"\nconst tt : string = x.next();`,
  "typescript",
  Uri.parse("file:///main.tsx")
);
const tsconfigEditorModel = editor.createModel(
  defaultTSConfig,
  "json",
  Uri.parse("file:///tsconfig.json")
);

languages.json.jsonDefaults.setDiagnosticsOptions({
  validate: true,
  enableSchemaRequest: true,
  allowComments: true,
  schemas: [
    {
      uri: "http://json.schemastore.org/tsconfig",
      fileMatch: ["*.json"]
    }
  ]
});

const resolver = new Resolver();
const installer = new Installer(languages.typescript.typescriptDefaults);

function App() {
  const [
    primaryEditor,
    setPrimaryEditor
  ] = useState<editor.IStandaloneCodeEditor | null>(null);
  const [compilerOptions, setCompilerOptions] = useState<CompilerOptions>({});
  const [dialogVisivility, setDialogVisivility] = useState<boolean>(false);
  const { loading, error, objects, setQuery } = useNpmSearch();
  const { dependencies, append, remove } = useNpmInstall();

  // useEffect(() => {
  //   const initialSettings = queryString.parse(location.search.slice(1));
  //   console.log(initialSettings);
  // });

  const handleChangeTSConfig = useCallback((tsconfig: string) => {
    const { config, error } = parseConfigFileTextToJson(
      "tsconfig.json",
      tsconfig
    );
    if (error) {
      console.error(error);
    } else {
      setCompilerOptions(config.compilerOptions);
      languages.typescript.typescriptDefaults.setCompilerOptions(
        config.compilerOptions
      );
    }
  }, []);
  const handleOpenDialog = useCallback(() => {
    setDialogVisivility(true);
  }, []);
  const handleCloseDialog = useCallback(() => {
    setDialogVisivility(false);
  }, []);
  const handleChangeQuery = useCallback(e => {
    setQuery(e.target.value);
  }, []);
  const handleInstall = useCallback((pkg: NpmPackageSummary) => {
    message.loading(`Install ${pkg.name}@${pkg.version} ...`, 10000);
    resolver
      .fetchFiles(pkg.name, pkg.version, compilerOptions)
      .then(files => {
        installer.install(pkg.name, pkg.version, files);
        append(pkg.name, pkg.version);
        message.destroy();
        message.success(`Installed ${pkg.name}@${pkg.version}`);
      })
      .catch(e => {
        message.destroy();
        if (e.message.includes("404")) {
          message.error(
            `Install failed: ${pkg.name}@${
              pkg.version
            }\nIt does not provide type definitions.`
          );
          return;
        }
        console.error(e);
        message.error(
          `Install failed: ${pkg.name}@${pkg.version}\n${e.message}`
        );
      });
  }, []);
  const handleRequestShare = useCallback(() => {
    console.log("TODO:");
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "100%"
        }}
      >
        <AppBar
          version={version}
          shareUrl={location.href}
          onRequestShare={handleRequestShare}
          onCopy={() => message.success("Copied")}
        />
        <div
          style={{
            display: "flex",
            flex: 1
          }}
        >
          <div
            style={{
              padding: 8,
              width: 220,
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div>
              <Typography.Text strong>Dependencies</Typography.Text>
            </div>
            <List
              itemLayout="horizontal"
              dataSource={dependencies}
              renderItem={({ name, version }) => (
                <List.Item key={name}>
                  <List.Item.Meta title={`${name}@${version}`} />
                </List.Item>
              )}
            />
            <Button type="primary" onClick={handleOpenDialog}>
              Add dependencies
            </Button>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="main.tsx" key="1" />
            </Tabs>
            <div style={{ flex: 1 }}>
              <MonacoEditor
                language="typescript"
                theme="vs-dark"
                editorDidMount={editor => {
                  setPrimaryEditor(editor);
                  handleChangeTSConfig(defaultTSConfig);
                }}
                options={{
                  model: primaryEditorModel,
                  automaticLayout: true,
                  minimap: { enabled: false },
                  renderControlCharacters: true
                }}
              />
            </div>
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="tsconfig.json" key="1" />
            </Tabs>
            <div style={{ flex: 1 }}>
              {primaryEditor ? (
                <MonacoEditor
                  language="json"
                  theme="vs-dark"
                  onChange={handleChangeTSConfig}
                  options={{
                    model: tsconfigEditorModel,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    renderControlCharacters: true
                  }}
                />
              ) : (
                <span>Loading...</span>
              )}
            </div>
          </div>
        </div>
        <Layout.Footer style={{ textAlign: "center" }}>
          &copy; 2019-{new Date().getFullYear()}{" "}
          <a href="https://github.com/Leko" target="_blank">
            Leko
          </a>
          {" / "}
          <a
            href="https://github.com/Leko/type-puzzle/tree/master/packages/playground"
            target="_blank"
          >
            GitHub repository
          </a>
        </Layout.Footer>
      </div>
      <NpmSearchDialog
        isOpen={dialogVisivility}
        loading={loading}
        error={error}
        objects={objects}
        onRequestClose={handleCloseDialog}
        onChangeQuery={handleChangeQuery}
        onRequestInstall={handleInstall}
      />
    </>
  );
}

const div = document.createElement("div");
div.setAttribute("id", "root");
document.body.appendChild(div);

render(<App />, document.getElementById("root"));
