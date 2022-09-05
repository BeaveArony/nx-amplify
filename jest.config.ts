const { getJestProjects } = require('@nrwl/jest');

export default {
  projects: [...getJestProjects(), '<rootDir>/e2e/amplify-e2e'],
};
