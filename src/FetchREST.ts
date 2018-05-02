import 'whatwg-fetch';
import queryObjectToString, {QueryObject} from './queryObjectToString';

export type Payload = object | string | null;

export interface Response {
  success: boolean;
  status: number;
  body: Payload;
}

export interface Headers {
  [key: string]: string;
}

export interface RequestOptions {
  apiUrl?: string;
  headers?: Headers;
  mode?: 'cors' | 'no-cors' | 'same-origin';
  credentials?: 'omit' | 'same-origin' | 'include';
  cache?:
    | 'default'
    | 'no-store'
    | 'reload'
    | 'no-cache'
    | 'force-cache'
    | 'only-if-cached';
  redirect?: 'follow' | 'error' | 'manual';
  referrer?: string;
  referrerPolicy?:
    | 'referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'unsafe-url';
  integrity?: any;
}

export type GlobalRequestOptions = RequestOptions & {
  apiUrl: string;
};

export default class FetchREST {
  private globalOptions: GlobalRequestOptions;

  constructor(options: GlobalRequestOptions) {
    this.globalOptions = options;
  }

  get(endpoint: string, query: QueryObject = {}, options: RequestOptions = {}) {
    const queryString = queryObjectToString(query);
    return this.request('GET', `${endpoint}${queryString}`, null, options);
  }

  post(endpoint: string, payload: Payload = {}, options: RequestOptions = {}) {
    return this.request('POST', endpoint, payload, options);
  }

  patch(endpoint: string, payload: Payload = {}, options: RequestOptions = {}) {
    return this.request('PATCH', endpoint, payload, options);
  }

  put(endpoint: string, payload: Payload = {}, options: RequestOptions = {}) {
    return this.request('PUT', endpoint, payload, options);
  }

  delete(
    endpoint: string,
    payload: Payload = {},
    options: RequestOptions = {},
  ) {
    return this.request('DELETE', endpoint, payload, options);
  }

  private request(
    method: string,
    endpoint: string,
    payload: Payload,
    options: RequestOptions = {},
  ) {
    const fetchOptions = {...this.globalOptions, ...options};

    const {apiUrl} = fetchOptions;
    delete fetchOptions.apiUrl;

    fetchOptions.method = method.toUpperCase();
    fetchOptions.body =
      payload !== null && typeof payload === 'object'
        ? JSON.stringify(payload)
        : payload;

    return fetch(`${apiUrl}${endpoint}`, fetchOptions).then(async res => {
      const resData: Response = {
        success: res.ok,
        status: res.status,
        body: {},
      };

      if (!res.body) {
        return {...resData, body: null};
      }

      const textBody = await res.text();

      let jsonBody;
      try {
        jsonBody = JSON.parse(textBody);
      } catch (err) {
        throw err;
      }

      return {...resData, body: jsonBody};
    });
  }
}
