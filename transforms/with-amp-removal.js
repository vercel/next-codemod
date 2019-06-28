function injectAmp(j, o) {
	const init = o.node.init;

	switch (init.type) {
	case 'ObjectExpression': {
		const overwroteAmpKey = init.properties.some((prop) => {
			switch (prop.type) {
			case 'Property':
			case 'ObjectProperty':
				if (!(prop.key.type === 'Identifier' && prop.key.name === 'amp')) {
					return false;
				}

				prop.value = j.booleanLiteral(true);
				return true;
			default:
				return false;
			}
		});

		if (!overwroteAmpKey) {
			init.properties.push(
				j.objectProperty(j.identifier('amp'), j.booleanLiteral(true))
			);
		}

		return true;
	}
	default: {
		return false;
	}
	}
}

export default function transformer(file, api) {
	const j = api.jscodeshift;
	const root = j(file.source);
	const done = () => root.toSource();

	const imports = root.find(j.ImportDeclaration, {
		source: { value: 'next/amp' }
	});

	if (imports.length < 1) {
		return;
	}

	let hadWithAmp = false;
	const ampImportNames = [];

	imports.forEach((ampImport) => {
		const ampImportShift = j(ampImport);

		const withAmpImport = ampImportShift.find(j.ImportSpecifier, {
			imported: { name: 'withAmp' }
		});

		if (withAmpImport.length < 1) {
			return;
		}

		hadWithAmp = true;
		withAmpImport.forEach((element) => {
			ampImportNames.push(element.value.local.name);
			j(element).remove();
		});

		if (ampImport.value.specifiers.length === 0) {
			ampImportShift.remove();
		}
	});

	if (!hadWithAmp) {
		return done();
	}

	const defaultExportsShift = root.find(j.ExportDefaultDeclaration);
	if (defaultExportsShift.length < 1) {
		return done();
	}

	const defaultExport = defaultExportsShift.nodes()[0];
	const removedWrapper = ampImportNames.some((ampImportName) => {
		const ampWrapping = j(defaultExport).find(j.CallExpression, {
			callee: { name: ampImportName }
		});

		if (ampWrapping.length < 1) {
			return;
		}

		ampWrapping.forEach((e) => {
			j(e).replaceWith(e.value.arguments);
		});
		return true;
	});

	if (!removedWrapper) {
		return done();
	}

	const namedExportsShift = root.find(j.ExportNamedDeclaration);
	const hadExistingConfig = namedExportsShift.some((namedExport) => {
		const configExportedObject = j(namedExport).find(j.VariableDeclarator, {
			id: { name: 'config' }
		});
		if (configExportedObject.length > 0) {
			return configExportedObject.some((exportedObject) =>
				injectAmp(j, exportedObject));
		}

		const configReexported = j(namedExport).find(j.ExportSpecifier, {
			local: { name: 'config' }
		});
		if (configReexported.length > 0) {
			const configObjects = root
				.findVariableDeclarators('config')
				.filter((el) => el.scope.isGlobal);
			return configObjects.some((configObject) => injectAmp(j, configObject));
		}

		return false;
	});

	if (!hadExistingConfig) {
		defaultExportsShift.insertAfter(
			j.exportNamedDeclaration(
				j.variableDeclaration('const', [
					j.variableDeclarator(
						j.identifier('config'),
						j.objectExpression([
							j.objectProperty(j.identifier('amp'), j.booleanLiteral(true))
						])
					)
				])
			)
		);
	}

	return done();
}
