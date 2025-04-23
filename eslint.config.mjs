import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Removed unused 'compat' variable
const eslintConfig = {
  extends: [
    "next/core-web-vitals",
    "next/typescript"
  ],
  rules: {
    "preferConst": "off",
    "no-unused-vars": "off",
    "no-unused-expressions": "off"
  }
};

export default eslintConfig;
