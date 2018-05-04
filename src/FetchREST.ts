import 'whatwg-fetch';
import queryObjectToString, {QueryObject} from './queryObjectToString';

export type Payload = RequestInit['body'] | object;

export interface Response {
  success: boolean;
  status: number;
  body: Payload;
}

type RequestMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';

export type RequestOptionsLiteral = RequestInit & {
  apiUrl?: string;
  body?: undefined;
  method?: undefined;
};

export type RequestOptions = RequestOptionsLiteral | RequestOptionsGetter;
export type RequestOptionsGetter = () => RequestOptionsLiteral;

export type GlobalRequestOptionsLiteral = RequestOptionsLiteral & {
  apiUrl: string;
};

export type GlobalRequestOptions =
  | GlobalRequestOptionsLiteral
  | GlobalRequestOptionsGetter;
export type GlobalRequestOptionsGetter = () => GlobalRequestOptionsLiteral;

export type Middleware = (response: Promise<Response>) => Promise<Response>;

export default class FetchREST {
  private globalOptions: GlobalRequestOptions;
  private requestMiddleware: Middleware;

  constructor(options: GlobalRequestOptions) {
    this.globalOptions = options;
  }

  middleware(middleware: Middleware) {
    this.requestMiddleware = middleware;
  }

  get(endpoint: string, query: QueryObject = {}, options: RequestOptions = {}) {
    const queryString = queryObjectToString(query);
    return this.request('GET', `${endpoint}${queryString}`, null, options);
  }

  post(
    endpoint: string,
    payload: Payload = null,
    options: RequestOptions = {},
  ) {
    return this.request('POST', endpoint, payload, options);
  }

  patch(
    endpoint: string,
    payload: Payload = null,
    options: RequestOptions = {},
  ) {
    return this.request('PATCH', endpoint, payload, options);
  }

  put(endpoint: string, payload: Payload = null, options: RequestOptions = {}) {
    return this.request('PUT', endpoint, payload, options);
  }

  delete(
    endpoint: string,
    payload: Payload = null,
    options: RequestOptions = {},
  ) {
    return this.request('DELETE', endpoint, payload, options);
  }

  private request(
    method: RequestMethod,
    endpoint: string,
    payload: Payload,
    givenOptions: RequestOptions,
  ) {
    const {globalOptions: givenGlobalOptions} = this;

    const globalOptions = getOptionsFromOptionsGetter(givenGlobalOptions);
    const options = getOptionsFromOptionsGetter(givenOptions);

    const fetchOptions = {
      ...(globalOptions as RequestInit),
      ...options,
    };

    if (globalOptions.headers && options.headers) {
      fetchOptions.headers = {
        ...globalOptions.headers,
        ...options.headers,
      };
    }

    const {apiUrl} = fetchOptions;
    delete fetchOptions.apiUrl;

    fetchOptions.method = method;
    fetchOptions.body =
      payload !== null && typeof payload === 'object'
        ? JSON.stringify(payload)
        : payload;

    const baseRequest = fetch(`${apiUrl}${endpoint}`, fetchOptions).then(
      async res => {
        const resData: Response = {
          success: res.ok,
          status: res.status,
          body: {},
        };

        if (!res.body) {
          return {...resData, body: null};
        }

        const textBody = await res.text();

        let finalBody;
        try {
          finalBody = JSON.parse(textBody);
        } catch (error) {
          finalBody = textBody;
        }

        return {...resData, body: finalBody};
      },
    );

    if (!this.requestMiddleware) {
      return baseRequest;
    }

    return this.requestMiddleware(baseRequest);
  }
}

function getOptionsFromOptionsGetter(
  options: RequestOptions | GlobalRequestOptions,
) {
  if (typeof options === 'function') {
    return options();
  }
  return options;
}
