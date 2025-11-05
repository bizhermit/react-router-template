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
    ".temp/**/*",
    "**/*.min.{js,mjs,cjs,jsx}",
  ],
  extends: [
    pluginJs.configs.recommended,
    tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    pluginReactHooks.configs["recommended-latest"],
    stylistic.configs.recommended,
  ],
  rules: {
    "@stylistic/linebreak-style": [
      "warn",
      "unix",
    ],
    "@stylistic/max-len": [
      "warn",
      {
        code: 120,
        tabWidth: 2,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    "@stylistic/eol-last": "warn",
    "@stylistic/no-multiple-empty-lines": "warn",
    "prefer-const": "warn",
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
    "@stylistic/indent": [
      "warn",
      2,
      {
        SwitchCase: 1,
        VariableDeclarator: "first",
        outerIIFEBody: 1,
        MemberExpression: 1,
        FunctionDeclaration: {
          body: 1,
          parameters: 1,
        },
        FunctionExpression: {
          body: 1,
          parameters: 1,
        },
        StaticBlock: {
          body: 1,
        },
        CallExpression: {
          arguments: 1,
        },
        ArrayExpression: 1,
        ObjectExpression: 1,
        ImportDeclaration: 1,
        ignoreComments: true,
        flatTernaryExpressions: true,
        offsetTernaryExpressions: false,
      },
    ],
    "@stylistic/indent-binary-ops": "off",
    "@stylistic/jsx-indent-props": "warn",
    "@stylistic/jsx-curly-brace-presence": "warn",
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
    "@stylistic/space-in-parens": "warn",
    "@stylistic/space-before-function-paren": [
      "warn",
      {
        anonymous: "always",
        named: "never",
        asyncArrow: "always",
        catch: "always",
      },
    ],
    "@stylistic/arrow-parens": "off",
    "@stylistic/operator-linebreak": "off",
    "@stylistic/multiline-ternary": "off",
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
    "@stylistic/jsx-closing-tag-location": [
      "warn",
      "line-aligned",
    ],
    "@stylistic/jsx-one-expression-per-line": [
      "warn",
      {
        allow: "single-line",
      },
    ],
    "@stylistic/jsx-closing-bracket-location": "warn",
    "@stylistic/no-trailing-spaces": "warn",
    "no-fallthrough": "warn",
    "no-control-regex": "off",
    "no-empty": "warn",
    "no-empty-pattern": "warn",
    "no-console": [
      "warn",
      {
        allow: ["warn", "error"],
      },
    ],
    "@stylistic/quote-props": "warn",
    // TypeScript
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
    "no-restricted-imports": [
      "warn",
      {
        paths: [
          {
            name: "react-router",
            importNames: ["Link"],
            message: `"react-router"のLinkを使用しています。"~/components/elements/link"を使用してください。`,
          },
        ],
      },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    // React
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react/display-name": "off",
    "react/no-children-prop": "off",
    "react-hooks/exhaustive-deps": "off",
  },
});
