import { gzip, ungzip } from "pako";
import { CompilerOptions } from "typescript";

type Config = {
  code: string;
  tsconfig: CompilerOptions;
  dependencies: { name: string; version: string }[];
};

export class Share {
  async decode(queryParamStr: string): Promise<Config> {
    const base64String = decodeURIComponent(queryParamStr);
    const gziped = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
    const configStr = ungzip(gziped, { to: "string" });
    const config = JSON.parse(configStr);

    return config;
  }

  async encode(config: Config): Promise<string> {
    const configStr = JSON.stringify(config);
    const gziped: Uint8Array = gzip(configStr);
    const base64String = btoa(String.fromCharCode(...gziped));

    return encodeURIComponent(base64String);
  }
}
