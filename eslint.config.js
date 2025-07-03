import pluginJs from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config({
  files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
  ignores: [
    "node_modules/**/*",
    "dist/**/*",
    "build/**/*",
    ".react-router/**/*",
  ],
  extends: [
    pluginJs.configs.recommended,
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    pluginReactHooks.configs["recommended-latest"],
    stylistic.configs.recommended,
  ],
  rules: {
    "@stylistic/eol-last": "warn",
    "@stylistic/quotes": [
      "warn",
      "double",
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    "@stylistic/semi": [
      "warn",
      "always",
    ],
    "@stylistic/member-delimiter-style": [
      "warn",
      {
        multiline: {
          delimiter: "semi",
          requireLast: true,
        },
        singleline: {
          delimiter: "semi",
          requireLast: true,
        },
      },
    ],
    "@stylistic/comma-dangle": [
      "warn",
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "ignore",
      },
    ],
    "@stylistic/brace-style": [
      "warn",
      "1tbs",
    ],
    "@stylistic/padded-blocks": [
      "warn",
      {
        blocks: "never",
        classes: "always",
        switches: "never",
      },
    ],
    "@stylistic/arrow-parens": "off",
    "@stylistic/operator-linebreak": "off",
    "@stylistic/multiline-ternary": [
      "warn",
      "always-multiline",
    ],
    "@stylistic/jsx-wrap-multilines": [
      "warn",
      {
        declaration: "parens-new-line",
        assignment: "parens-new-line",
        return: "parens-new-line",
        arrow: "parens-new-line",
        condition: "ignore",
        logical: "ignore",
        prop: "ignore",
      },
    ],
    "@stylistic/jsx-curly-newline": [
      "warn",
      {
        multiline: "consistent",
        singleline: "forbid",
      },
    ],
    "no-fallthrough": "warn",
    "no-control-regex": "off",
    // Typescript
    "@typescript-eslint/no-empty-object-type": "off",
    "no-unused-expressions": "off",
    "@typescript-eslint/no-unused-expressions": [
      "warn",
      {
        allowShortCircuit: true,
        allowTernary: true,
      },
    ],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        args: "after-used",
        argsIgnorePattern: "^_",
        caughtErrors: "none",
        destructuredArrayIgnorePattern: "^_",
        ignoreRestSiblings: true,
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-explicit-any": "off",
    // React
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react/display-name": "off",
    "react/no-children-prop": "off",
    "react-hooks/exhaustive-deps": "off",
  },
});
