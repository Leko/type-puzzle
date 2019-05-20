import React from "react";
import { Typography, Button, List, Tooltip } from "antd";

type Props = {
  dependencies: { name: string; version: string }[];
  onRequestRemove: (name: string, version: string) => void;
  onRequestOpenDialog: () => void;
};

export default function DependencyList({
  dependencies,
  onRequestRemove,
  onRequestOpenDialog
}: Props) {
  return (
    <>
      <div>
        <Typography.Text strong>Dependencies</Typography.Text>
      </div>
      <List
        size="small"
        // itemLayout="horizontal"
        dataSource={dependencies}
        renderItem={({ name, version }) => (
          <List.Item key={name}>
            <List.Item.Meta title={`${name}@${version}`} />
            <Tooltip title={`Remove ${name}@${version}`}>
              <Button
                icon="close"
                style={{ border: "none" }}
                onClick={() => onRequestRemove(name, version)}
              />
            </Tooltip>
          </List.Item>
        )}
      />
      <Button type="primary" onClick={onRequestOpenDialog}>
        Add dependencies
      </Button>
    </>
  );
}
