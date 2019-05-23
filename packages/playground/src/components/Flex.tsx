import React from "react";

type Props = {
  children: React.ReactNode;
  direction?: "column" | "row";
  flex?: "auto" | number;
  style?: React.CSSProperties;
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
