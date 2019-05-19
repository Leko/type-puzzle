import React, { useRef, useLayoutEffect, useCallback } from "react";
import { Input, Icon, Tooltip } from "antd";
import { CopyToClipboard } from "react-copy-to-clipboard";

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
          <CopyToClipboard text={url} onCopy={onCopy}>
            <Tooltip title="Copy to clipboard">
              <Icon type="copy" />
            </Tooltip>
          </CopyToClipboard>
        }
      />
    </div>
  );
}
