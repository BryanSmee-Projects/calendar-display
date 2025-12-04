import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./*.{js,ts,jsx,tsx}", // Include root files like App.tsx
    ],
    theme: {
        extend: {},
    },
    plugins: [],
    darkMode: 'class',
};
export default config;
