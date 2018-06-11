jest.autoMockOff();
const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(__dirname, 'transformurl', null, 'with-router-import');
defineTest(__dirname, 'transformurl', null, 'without-import');
defineTest(__dirname, 'transformurl', null, 'already-using-withrouter');
defineTest(__dirname, 'transformurl', null, 'using-inline-class');
defineTest(__dirname, 'transformurl', null, 'export-default-variable');
