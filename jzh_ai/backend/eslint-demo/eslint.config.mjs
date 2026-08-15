import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { globals: globals.node } ,
    rules: {
      // 禁用使用 var 关键字 2 =error 表示错误 1 =warn 表示警告 0 =off 表示关闭
      "no-var": 2,
      "no-console": 1, // 开发时用,上线后不用
      "quotes":["error", "double"], // 引号使用双引号
      "semi":["error", "always"], // 分号使用
      "indent":["error", 2], // 缩进使用 2 个空格
    },

  },
  tseslint.configs.recommended,

]);
