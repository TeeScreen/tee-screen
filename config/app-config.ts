import packageJson from "@/package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Tee Screen",
  version: packageJson.version,
  copyright: `© ${currentYear}, Tee Screen`,
  meta: {
    title: "Tee Screen - Modern Next.js Dashboard Starter Template",
    description:
      "Tee Screen is a UK‑based company specialising in outdoor, weatherproof interactive digital signage, primarily serving golf courses, football clubs, and leisure venues.\n",
  },
};
