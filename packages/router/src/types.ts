export type RequestRouter<T> = {
  match: (request: Request) => T | undefined;
  matchAll: (request: Request) => T[];
};

export type RouteInput<T> = { path: string; methods: string[]; payload: T };
