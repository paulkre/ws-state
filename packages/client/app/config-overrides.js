const { alias, configPaths } = require("react-app-rewire-alias");

module.exports = (config) =>
  alias(configPaths("./tsconfig.paths.json"))(config);
