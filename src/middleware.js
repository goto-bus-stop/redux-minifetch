import qsStringify from 'qs-stringify'
import { REQUEST_START } from './actionTypes'
import {
  requestComplete,
  requestCompleteError
} from './actions'

function isEmpty (object) {
  return !object || Object.keys(object).length === 0
}

function makeUrl (path, params = {}) {
  let uri = path

  if (!isEmpty(params)) {
    // heh…
    uri += (uri.indexOf('?') !== -1 ? '&' : '?') + qsStringify(params)
  }

  return uri
}

function defaultConfigure (options) {
  return options
}

function defaultOnError (response) {
  const err = new Error(response.statusText)
  err.response = response
  return err
}

export default function middleware (opts = {}) {
  const baseUrl = opts.baseUrl
    ? opts.baseUrl.replace(/\/$/, '')
    : ''

  const configure = opts.configure || defaultConfigure
  const fetch = opts.fetch || global.fetch
  const onError = opts.onError || defaultOnError

  if (!fetch) throw new TypeError('redux-minifetch: must provide a `fetch` function or define it globally')

  function rejectNonOK (response) {
    if (!response.ok) {
      return Promise.resolve(onError(response))
        .then((err) => Promise.reject(err))
    }
    return response
  }

  return ({ dispatch, getState }) => (next) => (action) => {
    if (action.type !== REQUEST_START) {
      return next(action)
    }

    const {
      method,
      url,
      qs,
      data
    } = action.payload
    const {
      id,
      onStart,
      onComplete,
      onError
    } = action.meta

    const completedMeta = {
      id,
      method,
      url,
      qs,
      data
    }

    const requestUrl = makeUrl(baseUrl + url, qs)

    const requestOptions = configure({
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: method !== 'get' ? JSON.stringify(data) : undefined
    }, getState())

    if (onStart) {
      dispatch(onStart())
    }

    return fetch(requestUrl, requestOptions)
      .then(rejectNonOK)
      .then(res => res.json())
      .then((res) => {
        let responseValue = res
        if (onComplete) {
          responseValue = dispatch(onComplete(responseValue))
        }
        dispatch(requestComplete(res, completedMeta))
        return responseValue
      })
      .catch((error) => {
        if (onError) {
          dispatch(onError(error))
        }
        dispatch(requestCompleteError(error, completedMeta))
        throw error
      })
  }
}
