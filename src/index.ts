import 'whatwg-fetch';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';

export {
  default,
  Payload,
  Response,
  RequestOptionsGetter,
  RequestOptions,
  GlobalRequestOptions,
  GlobalRequestOptionsGetter,
  Middleware,
} from './FetchREST';
export {QueryObject} from './queryObjectToString';
