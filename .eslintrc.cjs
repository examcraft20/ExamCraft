module.exports = {
  root: true,
  ignorePatterns: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/.next-build/**",
    "**/.turbo/**",
    "coverage/**"
  ],
  overrides: [
    {
      files: ["apps/api/src/**/*.ts"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: ["./apps/api/tsconfig.json"],
        tsconfigRootDir: __dirname,
        sourceType: "module"
      },
      plugins: ["@typescript-eslint"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
      env: {
        node: true,
        es2022: true
      },
      rules: {
        "@typescript-eslint/no-explicit-any": "off"
      }
    },
    {
      files: ["apps/web/**/*.{ts,tsx}"],
      extends: ["next/core-web-vitals"]
    },
    {
      files: ["packages/**/*.{ts,tsx}"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: [
          "./packages/sdk/tsconfig.json",
          "./packages/types/tsconfig.json",
          "./packages/ui/tsconfig.json"
        ],
        tsconfigRootDir: __dirname,
        sourceType: "module"
      },
      plugins: ["@typescript-eslint"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
      env: {
        es2022: true,
        browser: true,
        node: true
      }
    }
  ]
};
