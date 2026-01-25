import { FlatCompat } from "@eslint/eslintrc";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // 사용하지 않는 import 자동 제거
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        { 
          "vars": "all", 
          "varsIgnorePattern": "^_", 
          "args": "after-used", 
          "argsIgnorePattern": "^_" 
        }
      ],
      
      // Import 정렬 규칙
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // React와 Next.js 관련
            ["^react", "^next", "^@?\\w"],
            // 절대 경로 imports
            ["^@/"],
            // 상대 경로 imports
            ["^\\."],
            // 스타일 imports
            ["^.+\\.?(css|scss|less)$"]
          ]
        }
      ],
      "simple-import-sort/exports": "error",
      "import/order": "off", // simple-import-sort와 충돌 방지
      
      // 들여쓰기 관련 규칙 강화
      "indent": ["error", 2, { "SwitchCase": 1 }],
      
      // 코드 블록 간 간격
      "padding-line-between-statements": [
        "error",
        { "blankLine": "always", "prev": "*", "next": "return" },
        { "blankLine": "always", "prev": ["const", "let", "var"], "next": "*" },
        { "blankLine": "any", "prev": ["const", "let", "var"], "next": ["const", "let", "var"] }
      ],
    },
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
  },
];

export default eslintConfig;
