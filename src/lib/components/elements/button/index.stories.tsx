import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { STYLE_COLOR_ARGTYPE } from "$/storybook/consts";
import { Button$ } from ".";
import { GearIcon, PlusIcon } from "../icon";

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
    round: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    processing: {
      control: "boolean",
    },
  },
  args: {
    children: "Button",
    onClick: fn(),
  },
} satisfies Meta<typeof Button$>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
};

export const Fill: Story = {
  args: {
    appearance: "fill",
    color: "primary",
    children: "Filled Button",
  },
};

export const Text: Story = {
  args: {
    appearance: "text",
    color: "secondary",
    children: "Text Button",
  },
};

export const Round: Story = {
  args: {
    appearance: "fill",
    round: true,
    color: "secondary",
    children: "Round Button",
  },
};

export const Processing: Story = {
  args: {
    processing: true,
    children: "Processing...",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <span>Add Item</span>
        <PlusIcon />
      </>
    ),
  },
};

export const OnlyIcon: Story = {
  args: {
    children: <GearIcon />,
  },
};
