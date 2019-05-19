import React, { lazy, Suspense, useState, useCallback, useEffect } from "react";
import { render } from "react-dom";
import { message, Layout, Tabs } from "antd";
import { parseConfigFileTextToJson, CompilerOptions } from "typescript";
import { editor, languages } from "monaco-editor";

import { version } from "../package.json";
import { codeEditorModel, tsConfigEditorModel } from "./models";
import { useNpmSearch } from "./hooks/useNpmSearch";
import { useNpmInstall } from "./hooks/useNpmInstall";
import { Installer } from "./lib/npm/installer";
import { Resolver } from "./lib/npm/resolver";
import Share from "comlink-loader!./lib/share";
import { Flex } from "./components/Flex";

import "./style.css";
import "antd/dist/antd.less";

const AppBar = lazy(() =>
  import(/* webpackChunkName: "AppBar" */ "./components/AppBar")
);
const NpmSearchDialog = lazy(() =>
  import(
    /* webpackChunkName: "NpmSearchDialog" */ "./components/NpmSearchDialog"
  )
);
const DependencyList = lazy(() =>
  import(/* webpackChunkName: "DependencyList" */ "./components/DependencyList")
);
const TSConfigEditor = lazy(() =>
  import(/* webpackChunkName: "TSConfigEditor" */ "./components/TSConfigEditor")
);
const CodeEditor = lazy(() =>
  import(/* webpackChunkName: "CodeEditor" */ "./components/CodeEditor")
);

const resolver = new Resolver();
const installer = new Installer(languages.typescript.typescriptDefaults);

function App() {
  const [
    primaryEditor,
    setPrimaryEditor
  ] = useState<editor.IStandaloneCodeEditor | null>(null);
  const [code, setCode] = useState<string>("");
  const [compilerOptionsStr, setCompilerOptionsStr] = useState<string>("");
  const [compilerOptions, setCompilerOptions] = useState<CompilerOptions>({});
  const [sharableConfig, setSharableConfig] = useState<string>("");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const { loading, error, objects, setQuery } = useNpmSearch();
  const { dependencies, append, remove } = useNpmInstall();

  const handleChangeTSConfig = useCallback((tsconfig: string) => {
    setCompilerOptionsStr(tsconfig);
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
  const handleInstall = useCallback(
    (pkg: { name: string; version: string }) => {
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
    },
    []
  );
  const handleRequestShare = useCallback(() => {
    const config = {
      code: code,
      tsconfig: compilerOptions,
      dependencies
    };
    new Share()
      .then(share => share.encode(config))
      .then(str => setSharableConfig(str));
  }, [code, compilerOptions, dependencies]);

  useEffect(() => {
    if (location.search === "") {
      return;
    }
    const params = new URLSearchParams(location.search);
    const configStr = params.get("c");
    if (!configStr) {
      return;
    }

    new Share()
      .then(share => share.decode(configStr))
      .then(config => {
        setCode(config.code);
        handleChangeTSConfig(JSON.stringify(config.tsconfig, null, 2));
        config.dependencies.map(pkg => handleInstall(pkg));
      });
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <Flex direction="column" flex={1} style={{ height: "100%" }}>
          <AppBar
            version={version}
            shareUrl={`${location.origin}?c=${sharableConfig}`}
            onRequestShare={handleRequestShare}
            onCopy={() => message.success("Copied")}
          />
          <Flex flex={1}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: 8,
                width: 220
              }}
            >
              <DependencyList
                dependencies={dependencies}
                onRequestRemove={remove}
                onRequestOpenDialog={() => setShowDialog(true)}
              />
            </div>
            <Flex flex={1} direction="column">
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="main.tsx" key="1" />
              </Tabs>
              <div style={{ flex: 1 }}>
                <CodeEditor
                  model={codeEditorModel}
                  value={code}
                  onChange={setCode}
                  editorDidMount={editor => {
                    setPrimaryEditor(editor);
                    setCode(codeEditorModel.getValue());
                    handleChangeTSConfig(tsConfigEditorModel.getValue());
                  }}
                />
              </div>
            </Flex>
            <Flex flex={1} direction="column">
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="tsconfig.json" key="1" />
              </Tabs>
              <div style={{ flex: 1 }}>
                {primaryEditor ? (
                  <TSConfigEditor
                    model={tsConfigEditorModel}
                    value={compilerOptionsStr}
                    onChange={handleChangeTSConfig}
                  />
                ) : (
                  <span>Loading...</span>
                )}
              </div>
            </Flex>
          </Flex>
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
        </Flex>
        <NpmSearchDialog
          isOpen={showDialog}
          loading={loading}
          error={error}
          objects={objects}
          onRequestClose={() => setShowDialog(false)}
          onChangeQuery={setQuery}
          onRequestInstall={handleInstall}
        />
      </Suspense>
    </>
  );
}

const div = document.createElement("div");
div.setAttribute("id", "root");
document.body.appendChild(div);

render(<App />, document.getElementById("root"));
