import * as Sentry from "@sentry/browser";
import React from "react";
import { render } from "react-dom";
import { Playground } from "./playground";
import { ErrorBoundary } from "./components/ErrorBoundary";

Sentry.init({
  dsn: "https://55debfd43fff4a7ca6a41ec416d08771@sentry.io/1462921"
});

const App = () => (
  <ErrorBoundary>
    <Playground />
  </ErrorBoundary>
);

render(<App />, document.getElementById("root"));
