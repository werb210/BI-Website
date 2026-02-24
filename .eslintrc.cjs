/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    "no-undef": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    // 🚫 Block hex color usage + Tailwind blue utilities
    "no-restricted-syntax": [
      "error",
      {
        selector: "Literal[value=/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/]",
        message: "Hex colors are forbidden. Use brand tokens."
      },
      {
        selector: "Literal[value=/bg-blue-/]",
        message: "Do not use Tailwind blue utilities. Use brand tokens."
      },
      {
        selector: "Literal[value=/hover:bg-blue-/]",
        message: "Do not use Tailwind blue hover utilities. Use brand tokens."
      }
    ]
  }
};
