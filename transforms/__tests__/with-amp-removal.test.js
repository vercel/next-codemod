/* global jest */
jest.autoMockOff();
const defineTest = require('jscodeshift/dist/testUtils').defineTest;

const fixtures = [
	'remove-import',
	'remove-import-renamed',
	'remove-import-single',
	'full-amp',
	'full-amp-inline',
	'full-amp-with-config',
	'full-amp-with-config-dupe',
	'full-amp-with-config-var'
];

for (const fixture of fixtures) {
	defineTest(
		__dirname,
		'with-amp-removal',
		null,
		`with-amp-removal/${fixture}`
	);
}
