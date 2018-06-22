# Next.js codemod

codemod transformations for [jscodeshift](https://github.com/facebook/jscodeshift) to help upgrading Next.js codebases

## How to use

### Setup

Install `[jscodeshift](https://github.com/facebook/jscodeshift)`:

```
npm install -g jscodeshift
```

### Transforms

#### url-to-withrouter

Tranforms the deprecated automatically injected `url` property to using `withRouter` and the `router` property it injects. Read more here: [err.sh/next.js/url-deprecated](https://err.sh/next.js/url-deprecated)

Download the codemod:

```
curl https://codeload.github.com/zeit/next-codemod/tar.gz/master | tar -xz --strip=2 next-codemod-master/transforms/url-to-withrouter.js
```

Run it:

```
jscodeshift -t url-to-withrouter.js pages/**/*.js
```
