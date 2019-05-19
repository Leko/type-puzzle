import React, { StyleHTMLAttributes } from "react";

type Props = {
  children: React.ReactNode;
  direction?: "column" | "row";
  flex?: "auto" | number;
  style?: StyleHTMLAttributes<{}>;
};

export function Flex({
  children,
  flex = "auto",
  direction = "row",
  style
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        flex: flex,
        ...style
      }}
    >
      {children}
    </div>
  );
}
