function addWithRouterImport(j, root) {
  const withRouterSpecifier = j.importSpecifier(j.identifier('withRouter'))

  const originalRouterImport = root.find(j.ImportDeclaration, {
    source: {
      value: 'next/router'
    }
  })

  if(originalRouterImport.length > 0) {
    const hasWithRouterImported = originalRouterImport.find(j.ImportSpecifier, {
      imported: {name: "withRouter"}
    }).length > 0

    if(hasWithRouterImported) {
      return
    }

    originalRouterImport.forEach((node) => {
      node.value.specifiers.push(withRouterSpecifier)
    })
    return
  }

  const withRouterImport = j.importDeclaration([
    withRouterSpecifier
  ], j.stringLiteral('next/router'))

  const Program = root.find(j.Program)
  Program.forEach((node) => {
    node.value.body.unshift(withRouterImport)
  })
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source)

  const defaultExports = root.find(j.ExportDefaultDeclaration)

  defaultExports.forEach((rule) => {
    const {value: node} = rule   
    const {declaration} = node

    if(declaration.type === 'Identifier') {
      const {name} = declaration // the variable name

      const implementation = root.find(j.Declaration, {id: {name}}) // find the implementation of the variable, can be a class, function, etc
      // Find usage of `this.props.url`
      const thisPropsUrlUsage = implementation.find(j.MemberExpression, {
        object: {
          type: "MemberExpression",
          object: {type: "ThisExpression"},
          property: {name: "props"}
        },
        property: {name: "url"}
      })

      if(thisPropsUrlUsage.length === 0) {
        return
      }

      // rename `url` to `router`
      thisPropsUrlUsage.find(j.Identifier, {name: "url"}).replaceWith(j.identifier('router'))
      const withRouterCall = j.callExpression(j.identifier('withRouter'), [declaration])
      j(rule).replaceWith(j.exportDefaultDeclaration(withRouterCall))
      addWithRouterImport(j, root)
      return
    }

    if(declaration.type === 'ClassExpression') {
      const thisPropsUrlUsage = j(rule).find(j.MemberExpression, {
        object: {
          type: "MemberExpression",
          object: {type: "ThisExpression"},
          property: {name: "props"}
        },
        property: {name: "url"}
      })

      if(thisPropsUrlUsage.length === 0) {
        return
      }

      // rename `url` to `router`
      thisPropsUrlUsage.find(j.Identifier, {name: "url"}).replaceWith(j.identifier('router'))
      const withRouterCall = j.callExpression(j.identifier('withRouter'), [declaration])
      j(rule).replaceWith(j.exportDefaultDeclaration(withRouterCall))
      addWithRouterImport(j, root)
      return
    }

    if(declaration.type === 'ClassDeclaration') {
      const thisPropsUrlUsage = j(rule).find(j.MemberExpression, {
        object: {
          type: "MemberExpression",
          object: {type: "ThisExpression"},
          property: {name: "props"}
        },
        property: {name: "url"}
      })

      if(thisPropsUrlUsage.length === 0) {
        return
      }

      // rename `url` to `router`
      thisPropsUrlUsage.find(j.Identifier, {name: "url"}).replaceWith(j.identifier('router'))
      declaration.type = 'ClassExpression'
      const withRouterCall = j.callExpression(j.identifier('withRouter'), [declaration])
      j(rule).replaceWith(j.exportDefaultDeclaration(withRouterCall))
      addWithRouterImport(j, root)
      return
    }

    const thisPropsUrlUsage = j(rule).find(j.MemberExpression, {
      object: {
        type: "MemberExpression",
        object: {type: "ThisExpression"},
        property: {name: "props"}
      },
      property: {name: "url"}
    })

    if(thisPropsUrlUsage.length === 0) {
      return
    }

    // rename `url` to `router`
    thisPropsUrlUsage.find(j.Identifier, {name: "url"}).replaceWith(j.identifier('router'))
    if(j(rule).find(j.CallExpression, {callee: {name: 'withRouter'}}).length > 0) {
      return
    }
    const withRouterCall = j.callExpression(j.identifier('withRouter'), [declaration])
    j(rule).replaceWith(j.exportDefaultDeclaration(withRouterCall))
    addWithRouterImport(j, root)
    return
  })

  return root.toSource()
}
