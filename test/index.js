var test = require('tape')
var createStore = require('redux').createStore
var applyMiddleware = require('redux').applyMiddleware
var mf = require('../')

function noop () { return {} }

function response (json) {
  return Promise.resolve({
    status: 200,
    ok: true,
    json: () => Promise.resolve(json)
  })
}

test('concat urls', function (t) {
  t.plan(2)

  var store = createStore(noop, applyMiddleware(mf.middleware({
    baseUrl: '/api/',
    fetch (url) {
      return response({ url })
    }
  })))
  var storeNoSlash = createStore(noop, applyMiddleware(mf.middleware({
    baseUrl: '/api',
    fetch (url) {
      return response({ url })
    }
  })))

  store.dispatch(mf.request('get', '/whatever')).then((res) => {
    t.equal(res.url, '/api/whatever')
  }).catch(t.error)
  storeNoSlash.dispatch(mf.request('get', '/whatever')).then((res) => {
    t.equal(res.url, '/api/whatever')
  }).catch(t.error)
})

test('onStart', function (t) {
  t.plan(3)

  var started = false
  var store = createStore(function (s, action) {
    if (action.type === 'start') {
      t.pass('custom action was dispatched')
    }
    return {}
  }, applyMiddleware(mf.middleware({
    baseUrl: '/api',
    fetch () { return response({}) }
  })))

  var action = mf.request('get', '/beep', {
    onStart () {
      started = true
      return { type: 'start' }
    }
  })
  t.equal(started, false, 'should not call onStart yet when creating action')
  store.dispatch(action)
  t.equal(started, true, 'should call onStart when dispatched')
})

test('onComplete', function (t) {
  t.plan(3)

  var store = createStore(function (s, action) {
    if (action.type === 'test') {
      t.pass('action was dispatched')
    }
    return {}
  }, applyMiddleware(mf.middleware({
    baseUrl: '/api',
    fetch () {
      return response({
        xyz: 'yoink'
      })
    }
  })))

  var action = mf.request('get', '/boop', {
    onComplete (res) {
      t.equal(res.xyz, 'yoink', 'gets the result')
      return { type: 'test' }
    }
  })

  store.dispatch(action).then(function (result) {
    t.equal(result.type, 'test', 'resolution value is result from onComplete()')
  }).catch(t.error)
})

test('configure', function (t) {
  t.plan(1)

  var TOKEN = 'Bearer qwerty123'
  var store = createStore(noop, applyMiddleware(mf.middleware({
    baseUrl: '/',
    fetch (url, opts) {
      return response({
        auth: opts.headers.Authorization
      })
    },
    configure (opts) {
      opts.headers.Authorization = TOKEN
      return opts
    }
  })))

  store.dispatch(mf.put('/comment/1', { text: 'Hello' })).then(function (result) {
    t.equal(result.auth, TOKEN)
  }).catch(t.error)
})

test('json data', function (t) {
  t.plan(1)

  var store = createStore(noop, applyMiddleware(mf.middleware({
    baseUrl: '/',
    fetch (url, opts) {
      return response({
        string: opts.body
      })
    }
  })))

  store.dispatch(mf.request('post', '/', {
    data: { a: 'b', c: { nested: 'd' } }
  })).then(function (result) {
    t.equal(result.string, '{"a":"b","c":{"nested":"d"}}')
  }).catch(t.error)
})

test('query string', function (t) {
  t.plan(1)

  var store = createStore(noop, applyMiddleware(mf.middleware({
    baseUrl: '/',
    fetch (url, opts) {
      return response({
        string: url.slice(url.indexOf('?'))
      })
    }
  })))

  store.dispatch(mf.get('/', {
    qs: { a: 'b', c: { nested: 'd' } }
  })).then(function (result) {
    t.equal(result.string, '?a=b&c[nested]=d')
  }).catch(t.error)
})

test('get shorthand', function (t) {
  t.plan(2)

  var store = createStore(noop, applyMiddleware(mf.middleware({
    baseUrl: '/',
    fetch (url, opts) {
      return response({
        method: opts.method,
        url: url
      })
    }
  })))

  store.dispatch(mf.get('/')).then(function (result) {
    t.equal(result.method, 'get')
    t.equal(result.url, '/')
  }).catch(t.error)
})

test('post shorthand', function (t) {
  t.plan(3)

  var store = createStore(noop, applyMiddleware(mf.middleware({
    baseUrl: '/root',
    fetch (url, opts) {
      return response({
        method: opts.method,
        url: url,
        data: opts.body
      })
    }
  })))

  store.dispatch(mf.post('/new', {
    key: 'value'
  })).then(function (result) {
    t.equal(result.method, 'post')
    t.equal(result.url, '/root/new')
    t.equal(result.data, '{"key":"value"}')
  }).catch(t.error)
})

test('put shorthand', function (t) {
  t.plan(3)

  var store = createStore(noop, applyMiddleware(mf.middleware({
    baseUrl: '/root',
    fetch (url, opts) {
      return response({
        method: opts.method,
        url: url,
        data: opts.body
      })
    }
  })))

  store.dispatch(mf.put('/new', {
    key: 'value'
  })).then(function (result) {
    t.equal(result.method, 'put')
    t.equal(result.url, '/root/new')
    t.equal(result.data, '{"key":"value"}')
  }).catch(t.error)
})

test('delete shorthand', function (t) {
  t.plan(3)

  var store = createStore(noop, applyMiddleware(mf.middleware({
    baseUrl: '/comment',
    fetch (url, opts) {
      return response({
        method: opts.method,
        url: url,
        data: opts.body
      })
    }
  })))

  store.dispatch(mf.del('/0', { id: 1 })).then(function (result) {
    t.equal(result.method, 'delete')
    t.equal(result.url, '/comment/0')
    t.equal(result.data, '{"id":1}')
  }).catch(t.error)
})
