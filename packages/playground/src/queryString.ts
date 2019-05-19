const queryString = {
  parse<T extends {} = {}>(queryWithoutQuestion: string): T | null {
    if (queryWithoutQuestion === "") {
      return null;
    }
    return queryWithoutQuestion
      .split("&")
      .map(part => part.split("="))
      .reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: decodeURIComponent(value)
        }),
        {} as T
      );
  },
  stringify(params: Record<string, any>): string {
    return Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");
  }
};
