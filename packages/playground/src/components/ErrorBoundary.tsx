import React, { Component } from "react";
import * as Sentry from "@sentry/browser";
import { Alert, Button } from "antd";

type Props = {
  children: React.ReactNode;
};

type State = {
  error: Error | null;
  eventId?: string;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error });
    Sentry.withScope(scope => {
      scope.setExtras(errorInfo);
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    if (this.state.error) {
      return (
        <>
          <Alert message={<pre>{this.state.error.stack}</pre>} type="error" />
          <Button
            icon="notification"
            onClick={() =>
              Sentry.showReportDialog({ eventId: this.state.eventId })
            }
          >
            Report feedback
          </Button>
        </>
      );
    }

    return this.props.children;
  }
}
