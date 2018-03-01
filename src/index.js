import { REQUEST_START, REQUEST_COMPLETE } from './actionTypes'
import middleware from './middleware'
import { request, get, post, put, del } from './actions'

export default middleware
export {
  middleware,
  request,
  get,
  post,
  put,
  del,
  REQUEST_START,
  REQUEST_COMPLETE
}
