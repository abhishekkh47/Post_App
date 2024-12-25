import i18n from "i18n";
import path from "path";

i18n.configure({
  locales: ["en", "fr"], // Add your locales
  directory: path.join(__dirname, "locales"),
  defaultLocale: "en",
  objectNotation: true,
});

export default i18n;
