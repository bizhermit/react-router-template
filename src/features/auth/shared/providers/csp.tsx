import { createContext } from "react";

type CspContextProps = {
  nonce?: string;
};

export const CspContext = createContext<CspContextProps>({});
