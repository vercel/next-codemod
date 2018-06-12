jest.autoMockOff();
const defineTest = require('jscodeshift/dist/testUtils').defineTest;

defineTest(__dirname, 'transform-url', null, 'with-router-import');
defineTest(__dirname, 'transform-url', null, 'without-import');
defineTest(__dirname, 'transform-url', null, 'already-using-withrouter');
defineTest(__dirname, 'transform-url', null, 'using-inline-class');
defineTest(__dirname, 'transform-url', null, 'export-default-variable');
defineTest(__dirname, 'transform-url', null, 'no-transform');
