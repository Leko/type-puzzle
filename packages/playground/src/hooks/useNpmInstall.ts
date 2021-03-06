import { useState, useCallback } from "react";

export function useNpmInstall() {
  const [dependencies, setDependencies] = useState<
    { name: string; version: string }[]
  >([]);

  const append = useCallback(
    (pkgs: { name: string; version: string }[]) => {
      setDependencies(dependencies.concat(pkgs));
    },
    [dependencies]
  );

  const remove = (name: string, version: string) => {
    const index = dependencies.findIndex(
      dep => dep.name === name && dep.version == version
    );
    if (index === -1) {
      throw new Error(`${name}@${version} is not installed`);
    }
    const newDependencies = dependencies
      .slice(0, index)
      .concat(dependencies.slice(index + 1));
    setDependencies(newDependencies);
  };

  return {
    append,
    remove,
    dependencies
  };
}
