import { generateApiAccessor } from "$/shared/fetch/core";
import type { components, paths } from "./external+";

export type ExternalApiPaths = paths;
export type ExternalApiSchemas = components["schemas"];

export const externalApi = generateApiAccessor<ExternalApiPaths>();
