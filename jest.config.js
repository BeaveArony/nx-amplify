const { getJestProjects } = require('@nrwl/jest');

module.exports = {
  projects: [...getJestProjects(), '<rootDir>/e2e/amplify-e2e'],
};
