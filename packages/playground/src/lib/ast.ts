import { Node } from "typescript";

export function traverse(root: Node, fn: (n: Node) => any) {
  fn(root);
  root.forEachChild(n => traverse(n, fn));
}
