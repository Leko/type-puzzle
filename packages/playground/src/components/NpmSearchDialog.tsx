import React, { useCallback } from "react";
import { Modal, Alert, List, Button, Input, Icon, Divider, Avatar } from "antd";
import { NpmSearchResultItem, NpmPackageSummary } from "../lib/npm/searcher";

type Props = {
  isOpen: boolean;
  loading: boolean;
  error: Error | null;
  objects: NpmSearchResultItem[];
  onRequestClose: () => void;
  onChangeQuery: (query: string) => void;
  onRequestInstall: (pkgs: NpmPackageSummary[]) => void;
};

function PackageAvatar({ pkg }: { pkg: NpmPackageSummary }) {
  if (!pkg.links.repository) {
    return <Avatar icon="user" />;
  }

  const matched = pkg.links.repository.match(/github.com\/([^\/]+)/);
  if (!matched) {
    return <Avatar icon="user" />;
  }

  const [, username] = matched;
  if (username) {
    return <Avatar src={`https://github.com/${username}.png?size=36`} />;
  } else {
    return <Avatar icon="user" />;
  }
}

export default function NpmSearchDialog({
  isOpen,
  onRequestClose,
  loading,
  error,
  objects,
  onChangeQuery,
  onRequestInstall
}: Props) {
  const handleChange = useCallback(event => {
    onChangeQuery(event.target.value);
  }, []);

  return (
    <Modal
      title="Add dependencies"
      visible={isOpen}
      footer={[
        <Button key="close" onClick={onRequestClose}>
          Done
        </Button>
      ]}
      onCancel={onRequestClose}
      bodyStyle={{
        maxHeight: 480,
        overflowY: "scroll"
      }}
    >
      <Input
        placeholder="@types/lodash"
        onChange={handleChange}
        prefix={<Icon type="search" />}
      />
      <Divider />
      {loading ? <Alert message="Fetching..." /> : null}
      {error ? <Alert message={<pre>{error.stack}</pre>} type="error" /> : null}
      {objects.length > 0 ? (
        <>
          <List
            itemLayout="horizontal"
            dataSource={objects}
            renderItem={object => (
              <List.Item
                key={object.package.name}
                style={{ cursor: "pointer" }}
                onClick={() => onRequestInstall([object.package])}
              >
                <List.Item.Meta
                  avatar={<PackageAvatar pkg={object.package} />}
                  title={`${object.package.name}@${object.package.version}`}
                  description={object.package.description}
                />
              </List.Item>
            )}
          />
        </>
      ) : null}
    </Modal>
  );
}
