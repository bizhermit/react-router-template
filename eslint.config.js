import pluginJs from "@eslint/js"
import stylistic from "@stylistic/eslint-plugin"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import tseslint from "typescript-eslint"

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
    ],
    "@stylistic/semi": [
      "warn",
      "always",
    ],
  },
})
