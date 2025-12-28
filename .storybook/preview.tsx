import type { Preview } from "@storybook/react-vite";
import "../src/lib/components/global.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story, { globals }) => {
      const theme = globals.backgrounds?.value || "light";
      document.documentElement.setAttribute("data-theme", theme);
      return <Story />;
    },
  ],
};

export default preview;
