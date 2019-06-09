export type NpmSearchResultUser = {
  username: string;
};

export type NpmPackage = {
  main: string;
  typings: string;
  types: string;
  dependencies: Record<string, string>;
};

export type NpmPackageSummary = {
  name: string;
  scope: string;
  version: string;
  description: string;
  date: string;
  author: NpmSearchResultUser;
  publisher: NpmSearchResultUser;
  maintainers: NpmSearchResultUser[];
  links: {
    npm?: string;
    repository?: string;
  };
};

export type NpmSearchResultItem = {
  package: NpmPackageSummary;
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
  searchScore: number;
};

export type NpmSearchResult = {
  total: number;
  objects: NpmSearchResultItem[];
};

type FIXME_PackageJson = any;

function summarize(pkg: FIXME_PackageJson): NpmSearchResultItem {
  const [scope, name] = pkg.name.split("/");
  return {
    package: {
      name: pkg.name,
      scope: name ? scope : "unscoped",
      version: pkg.version,
      description: pkg.description,
      date: "",
      author: {
        username: ""
      },
      publisher: {
        username: ""
      },
      maintainers: [],
      links: {
        // TODO: Support custom npm registry
        npm: `https://npmjs.com/package/${pkg.name}`
        // TODO: Normalize repository URL
        // repository: pkg.repository.url
      }
    },
    score: {
      final: 1,
      detail: {
        quality: 1,
        popularity: 1,
        maintenance: 1
      }
    },
    searchScore: 1
  };
}

export class Searcher {
  async search(
    query: string,
    config: { page: number; perPage: number }
  ): Promise<NpmSearchResult> {
    const params = new URLSearchParams();
    params.set("text", query);
    params.set("size", String(config.perPage));
    params.set("from", String(config.page * config.perPage));

    const [{ objects, total }, exactMatch] = await Promise.all([
      fetch(`https://registry.npmjs.org/-/v1/search?${params.toString()}`).then(
        res => res.json()
      ) as Promise<NpmSearchResult>,
      fetch(`https://unpkg.com/${query}/package.json`).then(res => {
        return res.status === 200 ? res.json() : null;
      })
    ]);

    let includeExact = false;
    if (
      exactMatch &&
      objects.findIndex(obj => obj.package.name === exactMatch.name) === -1
    ) {
      objects.unshift(summarize(exactMatch));
      includeExact = true;
    }

    return { objects, total: includeExact ? total + 1 : total };
  }
}
