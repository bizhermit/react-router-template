import { generateApiAccessor } from "~/api/fetch";
import type { components, paths } from "./internal+";

export type InternalApiPaths = paths;
export type InternalApiSchemas = components["schemas"];

export const internalApi = generateApiAccessor<InternalApiPaths>();
