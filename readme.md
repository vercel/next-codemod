# Next.js codemod

codemod transformations for [jscodeshift](https://github.com/facebook/jscodeshift) to help upgrading Next.js codebases

## How to use

### Setup

Install [jscodeshift](https://github.com/facebook/jscodeshift):

```
npm install -g jscodeshift
```

## Transforms

### `url-to-withrouter`

Tranforms the deprecated automatically injected `url` property on top level pages to using `withRouter` and the `router` property it injects. Read more here: [err.sh/next.js/url-deprecated](https://err.sh/next.js/url-deprecated)

For example:

```js
// From
import React from 'react'
export default class extends React.Component {
  render() {
    const {pathname} = this.props.url
    return <div>Current pathname: {pathname}</div>
  }
}
```

```js
// To
import React from 'react'
import {withRouter} from 'next/router'
export default withRouter(class extends React.Component {
  render() {
    const {pathname} = this.props.router
    return <div>Current pathname: {pathname}</div>
  }
})
```

This is just one case. All the cases that are transformed (and tested) can be found in the [`__testfixtures__` directory](./transforms/__testfixtures__/url-to-withrouter).

#### Usage

Go to your project

```
cd path-to-your-project
```

Download the codemod:

```
curl https://github.com/zeit/next-codemod/archive/master.tar.gz | tar -xz --strip=2 next-codemod-master/transforms/url-to-withrouter.js
```

Run the transformation:

```
jscodeshift -t ./url-to-withrouter.js pages/**/*.js
```

After the transformation is done the `url-to-withrouter.js` file in the root of your project can be removed.
