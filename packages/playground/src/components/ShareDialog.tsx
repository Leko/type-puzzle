import React, { useRef, useLayoutEffect, useCallback } from "react";
import { Input } from "antd";
import CopyToClipboard from "react-copy-to-clipboard";
import { Icon } from "./Icon";

type Props = {
  url?: string;
  onCopy: () => void;
};

export function ShareDialog({ url, onCopy }: Props) {
  const inputRef = useRef<Input>(null);
  const onFocus = useCallback(e => {
    e.target.select();
  }, []);

  useLayoutEffect(() => {
    if (!inputRef.current || !url) {
      return;
    }

    inputRef.current.input.select();
  }, [url]);

  return (
    <div>
      <Input
        ref={inputRef}
        onFocus={onFocus}
        value={url}
        suffix={
          url ? (
            <CopyToClipboard text={url} onCopy={onCopy}>
              <Icon title="Copy to clipboard" type="copy" />
            </CopyToClipboard>
          ) : null
        }
      />
    </div>
  );
}
