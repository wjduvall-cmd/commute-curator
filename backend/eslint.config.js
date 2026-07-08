const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const security = require("eslint-plugin-security");

module.exports = tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "output/**", "coverage/**", "fixtures/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  {
    rules: {
      // Foray's dedup/scoring code deliberately indexes objects/arrays with
      // computed keys (Map-backed union-find, candidate lookup tables) —
      // that's the normal pattern here, not attacker-controlled property
      // access. Keep the rule's other checks (regex, eval, child_process,
      // etc.) at their defaults.
      "security/detect-object-injection": "off"
    }
  },
  {
    files: ["test/**/*.ts"],
    rules: {
      // Test fixtures intentionally build regexes/paths from variables and
      // poke at internals; the injection-style rules are noise here.
      "security/detect-non-literal-regexp": "off",
      "security/detect-non-literal-fs-filename": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
);
