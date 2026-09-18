/**
 * The minimal call signature a shaped handle needs from `fetch`, matching
 * `@intx/harness`'s own `FetchLike` so a caller can inject a stub in tests
 * without pulling the full `fetch` type's extra members.
 */
export type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;
