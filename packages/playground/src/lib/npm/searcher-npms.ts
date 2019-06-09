// Work around for "Registry API returns an incorrect version: 0.0.0"
// https://npm.community/t/registry-api-returns-an-incorrect-version-0-0-0/7912/3

export type NpmSearchResultUser = {
  username: string;
};

export type NpmPackage = {
  main: string;
  typings: string;
  types: string;
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

export class Searcher {
  async search(
    query: string,
    config: { page: number; perPage: number }
  ): Promise<NpmSearchResult> {
    const params = new URLSearchParams();
    params.set("q", query);
    params.set("size", String(config.perPage));
    params.set("from", String(config.page * config.perPage));

    // @ts-ignore npms returns `results` but we need compatible to npm registry API
    const { results, total } = await fetch(
      `https://api.npms.io/v2/search?${params.toString()}`
    ).then(res => res.json() as Promise<NpmSearchResult>);

    return { objects: results, total };
  }
}
