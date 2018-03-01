# redux-minifetch

small composable JSON HTTP requests for redux actions

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/redux-minifetch.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/redux-minifetch
[travis-image]: https://img.shields.io/travis/goto-bus-stop/redux-minifetch.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/redux-minifetch
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install redux-minifetch
```

## Usage

Add the middleware to your store:

```js
var minifetch = require('redux-minifetch').middleware

var middleware = applyMiddleware(
  minifetch({ baseUrl: 'https://mywebsite.com/api/' })
)

var store = createStore(reducer, middleware)
```

Then return minifetch actions from your action creators:

```js
var { post } = require('minifetch')
function doLogin () {
  return post('/auth/login', {
    email: 'email@address.com',
    password: 'qwerty123'
  })
}
```

## Middleware Options

```js
require('redux-minifetch').middleware({
  baseUrl: 'https://mywebsite.com/api/',
  fetch: global.fetch,
  configure: (opts) => {
    opts.headers['X-CSRF'] = global._csrf_token
    return opts
  }
})
```

### `baseUrl`

The base URL for requests. Defaults to the current URL "directory", eg:

 - If the current page is `https://mywebsite.com/whatever.html`, the baseUrl is `https://mywebsite.com/`
 - If the current page is `https://mywebsite.com/whatever/`, the baseUrl is `https://mywebsite.com/whatever/`

This should work pretty well for SPAs that don't do history-based routing but it's better to be explicit it anyway.

### `fetch`

A [fetch](https://mdn.io/fetch) function. Defaults to the global `fetch`. You can use this to use [unfetch](https://github.com/developit/unfetch) or [node-fetch](https://github.com/bitinn/node-fetch) or something.

### `configure(opts)`

A function to change the request options before they are passed to `fetch`. You can use this to set CSRF headers or authentication tokens for example. Return the changed options.

## Actions

### `request(method, url, opts)`

Create a new request. `method` is the HTTP method; `url` is the URL, which will be appended to the `baseUrl` option.
`opts` can have:

 - `opts.onStart()` - An action creator that will be dispatched to the Redux store when the request is being sent.
 - `opts.onComplete(response)` - An action creator that will be dispatched to the Redux store when the request has completed. Receives the response JSON in the first parameter. The return value of `dispatch(onComplete(response))` will be used as the resolution value of the `request()` Promise (see below).
 - `opts.onError(error)` - An action creator that will be dispatched to the Redux store when the request has errored. Receives the error object from `fetch` in the first parameter.

 - `opts.qs` - An object whose key/value pairs will be [stringified](https://github.com/goto-bus-stop/qs-stringify) and used as the query string. You can use a nested object and it will generate a query string like `obj[nested]=value`.
 - `opts.data` - An object with data that will be sent in the request body as JSON. Does nothing for `GET` requests.

When a `request()` is dispatched, it returns a Promise:

```js
dispatch(request('get', '/me', {
  // assuming the API's response format is { data: [ user ] }
  onComplete: (response) => (dispatch, getState) => {
    var user = response.data[0]
    dispatch({ type: 'USER_DATA', payload: user }) // Dispatch an action using `redux-thunk`
    return user // Return the user object.
  }
})).then((user) => {
  console.log(user)
})
```

### `get(url, opts)`

Shorthand to `request('get', url, opts)`.

### `post(url, data, opts)`

Shorthand to `request('post', url, { data, ...opts })`.

### `put(url, data, opts)`

Shorthand to `request('put', url, { data, ...opts })`.

### `del(url, data, opts)`

Shorthand to `request('delete', url, { data, ...opts })`.

## License

[Apache-2.0](LICENSE.md)
