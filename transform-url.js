function addWithRouterImport(j, root) {
  // We create an import specifier, this is the value of an import, eg:
  // import {withRouter} from 'next/router
  // The specifier would be `withRouter`
  const withRouterSpecifier = j.importSpecifier(j.identifier('withRouter'))

  // Check if this file is already import `next/router`
  // so that we can just attach `withRouter` instead of creating a new `import` node
  const originalRouterImport = root.find(j.ImportDeclaration, {
    source: {
      value: 'next/router'
    }
  })
  if(originalRouterImport.length > 0) {
    // Check if `withRouter` is already imported. In that case we don't have to do anything
    if(originalRouterImport.find(j.ImportSpecifier, {imported: {name: "withRouter"}}).length > 0) {
      return
    }

    // Attach `withRouter` to the existing `next/router` import node
    originalRouterImport.forEach((node) => {
      node.value.specifiers.push(withRouterSpecifier)
    })
    return
  }

  // Create import node
  // import {withRouter} from 'next/router'
  const withRouterImport = j.importDeclaration([
    withRouterSpecifier
  ], j.stringLiteral('next/router'))

  // Find the Program, this is the top level AST node
  const Program = root.find(j.Program)
  // Attach the import at the top of the body
  Program.forEach((node) => {
    node.value.body.unshift(withRouterImport)
  })
}

function getThisPropsUrlNodes(j, tree) {
  return tree.find(j.MemberExpression, {
    object: {
      type: "MemberExpression",
      object: {type: "ThisExpression"},
      property: {name: "props"}
    },
    property: {name: "url"}
  })
}

function turnUrlIntoRouter(j, tree) {
  tree.find(j.Identifier, {name: "url"}).replaceWith(j.identifier('router'))
}

export default function transformer(file, api) {
  // j is just a shorthand for the jscodeshift api
  const j = api.jscodeshift
  // this is the AST root on which we can call methods like `.find`
  const root = j(file.source)

  // We search for `export default`
  const defaultExports = root.find(j.ExportDefaultDeclaration)

  // We loop over the `export default` instances
  // This is just how jscodeshift works, there can only be one export default instance
  defaultExports.forEach((rule) => {
    // rule.value is an AST node
    const {value: node} = rule
    // declaration holds the AST node for what comes after `export default`
    const {declaration} = node
    
    // Wraps the provided node in a `withRouter` call
    function createWithRouterCall(node) {
      // If the node is a ClassDeclaration we have to turn it into a ClassExpression
      // since ClassDeclarations can't be wrapped in a function
      if(node.type === 'ClassDeclaration') {
        node.type = 'ClassExpression'
      }
      return j.callExpression(j.identifier('withRouter'), [node])
    }

    function wrapDefaultExportInWithRouter() {
      if(j(rule).find(j.CallExpression, {callee: {name: 'withRouter'}}).length > 0) {
        return
      }
      j(rule).replaceWith(j.exportDefaultDeclaration(createWithRouterCall(declaration)))
    }

    // The `Identifier` type is given in this case:
    // export default Test
    // where `Test` is the identifier
    if(declaration.type === 'Identifier') {
      // the variable name
      const {name} = declaration 

      // find the implementation of the variable, can be a class, function, etc
      const implementation = root.find(j.Declaration, {id: {name}}) 
      // Find usage of `this.props.url`
      const thisPropsUrlUsage = getThisPropsUrlNodes(j, implementation)

      if(thisPropsUrlUsage.length === 0) {
        return
      }

      // rename `url` to `router`
      turnUrlIntoRouter(j, thisPropsUrlUsage)
      wrapDefaultExportInWithRouter()
      addWithRouterImport(j, root)
      return
    }

    const thisPropsUrlUsage = getThisPropsUrlNodes(j, j(rule))

    if(thisPropsUrlUsage.length === 0) {
      return
    }

    // rename `url` to `router`
    turnUrlIntoRouter(j, thisPropsUrlUsage)
    wrapDefaultExportInWithRouter()
    addWithRouterImport(j, root)
    return
  })

  return root.toSource()
}
