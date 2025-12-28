import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { STYLE_COLOR_ARGTYPE } from "$/storybook/consts";
import { Button$ } from ".";

const meta = {
  title: "lib/elements/Button",
  component: Button$,
  argTypes: {
    color: STYLE_COLOR_ARGTYPE,
    appearance: {
      control: "radio",
      options: [
        undefined,
        "outline",
        "fill",
        "text",
      ],
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button$>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};
