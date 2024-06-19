import { createBuilder } from "./handler";
export * as Route from "./helpers";
export * from "./helpers";
export type * from "./helpers";

// Export all types
export type * from "./handler";
export type * from "./handler/types";

/**
 * Initialises a route builder.
 *
 * @param {string?} Path
 * @returns
 */
export function route<TPath extends string | undefined = undefined>(
  Path?: TPath
) {
  return createBuilder<TPath>({ path: Path });
}
