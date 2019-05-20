import React from "react";
import { Icon as ANTDIcon, Tooltip } from "antd";

type Props = {
  title: string;
  type: string;
};

export function Icon({ title, type }: Props) {
  return (
    <Tooltip title={title}>
      <ANTDIcon type={type} />
    </Tooltip>
  );
}
