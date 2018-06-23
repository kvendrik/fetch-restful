import {
  queryObjectToString,
  QueryObject,
  createUniqueIDFactory,
} from './utilities';

export type Payload = RequestInit['body'] | object;

export interface Response {
  success: boolean;
  status: number;
  body: Payload;
}

type RequestMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';

export type RequestOptions = RequestInit & {
  apiUrl?: string;
  timeout?: number;
  abortToken?: string;
  body?: undefined;
  method?: undefined;
};

export type GlobalRequestOptions = RequestOptions & {
  apiUrl: string;
  abortToken?: undefined;
};
export type GlobalRequestOptionsGetter = () => GlobalRequestOptions;

export type Middleware = (response: Promise<Response>) => Promise<Response>;

const getUniqueAbortToken = createUniqueIDFactory('abort-token');

export default class FetchREST {
  private globalOptions: GlobalRequestOptions | GlobalRequestOptionsGetter;
  private requestMiddleware: Middleware;
  private abortControllers: {
    [token: string]: AbortController[];
  } = {};

  constructor(options: GlobalRequestOptions | GlobalRequestOptionsGetter) {
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

  abort(token: string) {
    const controllers = this.abortControllers[token];

    if (!controllers) {
      throw new Error(`Invalid token "${token}".`);
    }

    delete this.abortControllers[token];

    for (const controller of controllers) {
      controller.abort();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getAbortToken() {
    return getUniqueAbortToken();
  }

  private request(
    method: RequestMethod,
    endpoint: string,
    payload: Payload,
    options: RequestOptions,
  ) {
    const {globalOptions: givenGlobalOptions} = this;
    const globalOptions = getGlobalOptionsFromOptionsGetter(givenGlobalOptions);

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

    if (fetchOptions.abortToken || fetchOptions.timeout) {
      const controller = new AbortController();
      fetchOptions.signal = controller.signal;
      const abortToken = fetchOptions.abortToken || this.getAbortToken();

      if (!this.abortControllers[abortToken]) {
        this.abortControllers[abortToken] = [];
      }

      this.abortControllers[abortToken].push(controller);

      if (fetchOptions.abortToken) {
        delete fetchOptions.abortToken;
      }

      if (fetchOptions.timeout) {
        const {timeout} = fetchOptions;
        setTimeout(() => this.abort(abortToken), timeout);
        delete fetchOptions.timeout;
      }
    }

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

function getGlobalOptionsFromOptionsGetter(
  options: GlobalRequestOptions | GlobalRequestOptionsGetter,
) {
  if (typeof options === 'function') {
    return options();
  }
  return options;
}
