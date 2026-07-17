/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0F2A4A",
          800: "#14335A",
          700: "#1A4270",
          600: "#22548C",
          500: "#2E6BB3",
          50: "#EEF3F9",
        },
        sogan: {
          600: "#A9722F",
          100: "#F4E9DA",
        },
        ink: {
          DEFAULT: "#1E2733",
          soft: "#5B6572",
          faint: "#8A93A0",
        },
        line: "#E6E9EE",
        surface: "#F7F8FA",
        good: { DEFAULT: "#1E7A50", bg: "#E9F6EF" },
        warn: { DEFAULT: "#A9722F", bg: "#FBF1E3" },
        danger: "#B23B3B",
        "stamp-empty": "#C7CFDA",
        "btn-disabled": "#B9C2CE",
      },
      fontFamily: {
        display: ["PlusJakartaSans_700Bold"],
        "display-extra": ["PlusJakartaSans_800ExtraBold"],
        "display-semibold": ["PlusJakartaSans_600SemiBold"],
        "display-medium": ["PlusJakartaSans_500Medium"],
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        "sans-bold": ["Inter_700Bold"],
      },
      borderRadius: {
        card: "16px",
        btn: "14px",
        sheet: "24px",
        pill: "9999px",
      },
    },
  },
  plugins: [],
};
