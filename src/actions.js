import {
  REQUEST_START,
  REQUEST_COMPLETE
} from './actionTypes'

let requestID = 0
export function request (method, url, opts = {}) {
  const {
    onStart,
    onComplete,
    onError
  } = opts

  const requestOpts = Object.assign({}, opts)
  delete opts.onStart
  delete opts.onComplete
  delete opts.onError

  requestID += 1

  return {
    type: REQUEST_START,
    payload: Object.assign(requestOpts, {
      method,
      url
    }),
    meta: {
      onStart,
      onComplete,
      onError,
      id: requestID
    }
  }
}

export function requestComplete (response, meta) {
  return {
    type: REQUEST_COMPLETE,
    payload: response,
    meta
  }
}

export function requestCompleteError (error, meta) {
  return {
    type: REQUEST_COMPLETE,
    error: true,
    payload: error,
    meta
  }
}

export const get = (url, opts) =>
  request('get', url, opts)

export const post = (url, data, opts = {}) =>
  request('post', url, Object.assign({ data }, opts))

export const put = (url, data, opts = {}) =>
  request('put', url, Object.assign({ data }, opts))

export const del = (url, data, opts = {}) =>
  request('delete', url, Object.assign({ data }, opts))
