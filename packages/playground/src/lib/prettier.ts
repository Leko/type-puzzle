import prettier from "prettier/standalone";
import typescript from "prettier/parser-typescript";

const plugins = [typescript];

export class Prettier {
  async format(
    code: string,
    parser: "typescript" = "typescript"
  ): Promise<string> {
    return prettier.format(code, { parser, plugins });
  }
}
