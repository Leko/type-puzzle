import React from "react";
import { PageHeader, Tag, Popover, Button } from "antd";
import { ShareDialog } from "./ShareDialog";

type Props = {
  version: string;
  shareUrl?: string;
  onRequestShare: () => void;
  onCopy: () => void;
};

export default function AppBar({
  version,
  shareUrl,
  onRequestShare,
  onCopy
}: Props) {
  return (
    <PageHeader
      title={<a href="/">TypeScript playground</a>}
      tags={<Tag>{version}</Tag>}
      extra={[
        <Popover
          key="1"
          placement="bottomRight"
          title={"Share"}
          content={<ShareDialog url={shareUrl} onCopy={onCopy} />}
          trigger="click"
        >
          <Button type="primary" onClick={onRequestShare}>
            Share
          </Button>
        </Popover>
      ]}
    >
      <p style={{ margin: 0 }}>
        The unofficial TypeScript <strong>type checker</strong> for advanced
        users. It can install npm packages and highly configurable.
      </p>
    </PageHeader>
  );
}
