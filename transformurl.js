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

function replaceThisPropsUrlWithThisPropsRouter(j, root) {
  root.find(j.MemberExpression, {
    object: {
      type: "MemberExpression",
      object: {type: "ThisExpression"},
      property: {name: "props"}
    },
    property: {name: "url"}
  }).find(j.Identifier, {name: "url"}).replaceWith(j.identifier('router'))
}

function wrapComponentInWithRouter(j, root) {
  const thisPropsRouter = root.find(j.MemberExpression, {
    object: {
      type: "MemberExpression",
      object: {type: "ThisExpression"},
      property: {name: "props"}
    },
    property: {name: "router"}
  })


  const withRouterCall = (code) => j.callExpression(j.identifier('withRouter'), [code])
  thisPropsRouter.closest(j.ClassExpression).filter((path) => { 
    // If it's already wrapped we shouldn't wrap it again
    if(j(path).closest(j.CallExpression, {callee: {name: 'withRouter'}}).length > 0) {
      return false
    }

    return true
  }).replaceWith((path) => {
    return withRouterCall(path.node)
  })

  thisPropsRouter.closest(j.ClassDeclaration).filter((path) => {
    // If it's not a default export we can't just wrap the class
    if(j(path).closest(j.ExportDefaultDeclaration).length === 0) {
      return false
    }
    // If it's already wrapped we shouldn't wrap it again
    if(j(path).closest(j.CallExpression, {callee: {name: 'withRouter'}}).length > 0) {
      return false
    }
    return true
  }).replaceWith((path) => {
    path.node.type = 'ClassExpression' // ClassDeclaration has to be transformed into ClassExpression for it to be nested inside a function

    return withRouterCall(path.node)
  })
}

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source)

  addWithRouterImport(j, root)
  replaceThisPropsUrlWithThisPropsRouter(j, root)
  wrapComponentInWithRouter(j, root)

  return root.toSource()
}
