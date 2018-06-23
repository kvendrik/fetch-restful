import 'whatwg-fetch';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';

export {
  default,
  Payload,
  Response,
  RequestOptions,
  GlobalRequestOptions,
  GlobalRequestOptionsGetter,
  Middleware,
} from './FetchREST';
export {QueryObject} from './utilities';
