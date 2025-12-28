import type { Meta } from "@storybook/react-vite";

export const STYLE_COLOR_ARGTYPE = {
  control: "radio",
  options: [
    undefined,
    "primary",
    "secondary",
    "sub",
    "danger",
  ] satisfies (StyleColor | undefined)[],
  defaultValue: undefined,
} as const satisfies Exclude<Meta["argTypes"], undefined>[string];
