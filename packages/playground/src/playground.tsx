import React, { useState, useCallback } from "react";
import { render } from "react-dom";
import { message, Layout, Tabs } from "antd";
import { parseConfigFileTextToJson, CompilerOptions } from "typescript";
import { editor, languages } from "monaco-editor";

import { version } from "../package.json";
import { codeEditorModel, tsConfigEditorModel } from "./models";
import { AppBar } from "./components/AppBar";
import { NpmSearchDialog } from "./components/NpmSearchDialog";
import { DependencyList } from "./components/DependencyList";
import { TSConfigEditor } from "./components/TSConfigEditor";
import { CodeEditor } from "./components/CodeEditor";
import { useNpmSearch } from "./hooks/useNpmSearch";
import { useNpmInstall } from "./hooks/useNpmInstall";
import { NpmPackageSummary } from "./lib/npm/searcher";
import { Installer } from "./lib/npm/installer";
import { Resolver } from "./lib/npm/resolver";

import "./style.css";
import "antd/dist/antd.less";

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
  const handleOpenDialog = useCallback(() => {
    setDialogVisivility(true);
  }, []);
  const handleCloseDialog = useCallback(() => {
    setDialogVisivility(false);
  }, []);
  const handleChangeQuery = useCallback(e => {
    setQuery(e.target.value);
  }, []);

  const handleChangeTSConfig = useCallback((tsconfig: string) => {
    const { config, error } = parseConfigFileTextToJson(
      "tsconfig.json",
      tsconfig
    );
    if (error) {
      console.error(error);
      return;
    }
    setCompilerOptions(config.compilerOptions);
    languages.typescript.typescriptDefaults.setCompilerOptions(
      config.compilerOptions
    );
  }, []);
  const handleInstall = useCallback((pkg: NpmPackageSummary) => {
    const { name, version } = pkg;
    message.loading(`Install ${name}@${version} ...`, 10000);
    resolver
      .fetchFiles(name, version, compilerOptions)
      .then(files => {
        installer.install(name, version, files);
        append(name, version);
        message.destroy();
        message.success(`Installed ${name}@${version}`);
      })
      .catch(e => {
        message.destroy();
        if (e.message.includes("404")) {
          message.error(
            `Install failed: ${name}@${version}\nIt does not provide type definitions.`
          );
          return;
        }
        console.error(e);
        message.error(`Install failed: ${name}@${version}\n${e.message}`);
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
            <DependencyList
              dependencies={dependencies}
              onRequestRemove={remove}
              onRequestOpenDialog={handleOpenDialog}
            />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="main.tsx" key="1" />
            </Tabs>
            <div style={{ flex: 1 }}>
              <CodeEditor
                model={codeEditorModel}
                editorDidMount={editor => {
                  setPrimaryEditor(editor);
                  handleChangeTSConfig(tsConfigEditorModel.getValue());
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
                <TSConfigEditor
                  model={tsConfigEditorModel}
                  onChange={handleChangeTSConfig}
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
