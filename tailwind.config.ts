import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      //   fontFamily: {
      //   conerstone: ['conerstone', 'sans-serif'], // 커스텀 폰트 패밀리 추가
      // },
    },
  },
  plugins: [],
} satisfies Config;
