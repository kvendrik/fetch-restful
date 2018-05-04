import * as fetchMock from 'fetch-mock';
import FetchREST, {Response} from '../';

type MockRequestOptions = fetchMock.MockResponseObject;

beforeEach(() => fetchMock.restore());

describe('get', () => {
  it('does a request to the correct endpoint and API URL', async () => {
    const requestMock = fetchMock.getOnce('*', {
      status: 200,
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
    });

    await request.get('/users');
    expect(requestMock.lastUrl()).toBe('https://testapi.com/users');
  });

  it('sends the defined headers', async () => {
    const requestMock = fetchMock.getOnce('*', {
      status: 200,
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    await request.get('/users');
    const {headers} = requestMock.lastOptions() as MockRequestOptions;
    expect(headers!.Accept).toBe('application/json');
    expect(headers!['Content-Type']).toBe('application/json');
  });

  it('allows for local overwrite of options', async () => {
    const requestMock = fetchMock.getOnce('*', {
      status: 200,
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
      headers: {
        Accept: 'application/json',
      },
    });

    await request.get(
      '/users',
      {},
      {
        apiUrl: 'https://superapi.com',
        headers: {
          Accept: 'text/xml',
        },
      },
    );

    const {headers} = requestMock.lastOptions() as MockRequestOptions;
    expect(headers!.Accept).toBe('text/xml');
    expect(requestMock.lastUrl()).toBe('https://superapi.com/users');
  });

  it('merges global headers with nested local headers', async () => {
    const requestMock = fetchMock.getOnce('*', {
      status: 200,
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    await request.get(
      '/users',
      {},
      {
        headers: {
          Accept: 'text/xml',
        },
      },
    );

    const {headers} = requestMock.lastOptions() as MockRequestOptions;
    expect(headers!.Accept).toBe('text/xml');
    expect(headers!['Content-Type']).toBe('application/json');
  });

  it('does not pass the API URL to the fetch options', async () => {
    const requestMock = fetchMock.getOnce('*', {
      status: 200,
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
    });

    await request.get('/users');

    const {apiUrl} = requestMock.lastOptions() as MockRequestOptions & {
      apiUrl?: string;
    };
    expect(apiUrl).toBeUndefined();
  });

  it('returns JSON it gets back as an object', async () => {
    fetchMock.getOnce('*', {
      status: 200,
      body: JSON.stringify({data: '12345'}),
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
    });

    const {body} = await request.get('/users');
    expect(typeof body).toBe('object');
  });

  it('returns non-JSON it gets back as plain text', async () => {
    fetchMock.getOnce('*', {
      status: 403,
      body: 'Forbidden.',
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
    });

    const {body} = await request.get('/users');
    expect(body).toBe('Forbidden.');
  });

  it('returns a success boolean', async () => {
    fetchMock.getOnce('*', {
      status: 200,
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
    });

    const {success} = await request.get('/users');
    expect(success).toBeTruthy();
  });

  it('send a false success boolean when the status is not 200', async () => {
    fetchMock.getOnce('*', {
      status: 404,
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
    });

    const {success} = await request.get('/users/2617281');
    expect(success).toBeFalsy();
  });

  it('returns the response status', async () => {
    fetchMock.getOnce('*', {
      status: 200,
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
    });

    const {status} = await request.get('/users');
    expect(status).toBe(200);
  });

  it('allows a query to be added to the URL', async () => {
    const requestMock = fetchMock.getOnce('*', {
      status: 200,
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
    });

    await request.get('/search', {
      limit: 20,
      skip: 10,
      sort: 'desc',
    });

    expect(requestMock.lastUrl()).toBe(
      'https://testapi.com/search?limit=20&skip=10&sort=desc',
    );
  });

  it('allows a catch method to catch errors', done => {
    const request = new FetchREST({
      apiUrl: 'https://url/that/is/not/valid.com',
    });

    window.fetch = () =>
      new Promise(() => {
        throw new Error('Network request failed.');
      });

    request.get('/users').catch(error => {
      expect(error).toBeInstanceOf(Error);
      done();
    });
  });
});

for (const method of ['post', 'put', 'patch', 'delete']) {
  describe(method, () => {
    it('allows for local overwrite of options', async () => {
      const mockMethodName = `${method}Once`;
      const requestMock = (fetchMock as any)[mockMethodName]('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
        headers: {
          Accept: 'application/json',
        },
      });

      await (request as any)[method]('/users', null, {
        apiUrl: 'https://superapi.com',
        headers: {
          Accept: 'text/xml',
        },
      });

      const {headers} = requestMock.lastOptions() as MockRequestOptions;
      expect(headers!.Accept).toBe('text/xml');
      expect(requestMock.lastUrl()).toBe('https://superapi.com/users');
    });

    it('allows a request without a payload', async () => {
      const mockMethodName = `${method}Once`;
      const requestMock = (fetchMock as any)[mockMethodName]('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      await (request as any)[method]('/users');

      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBeNull();
    });

    it('sends a given JSON payload', async () => {
      const mockMethodName = `${method}Once`;
      const requestMock = (fetchMock as any)[mockMethodName]('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      const payload = {
        userId: 214121,
      };

      await (request as any)[method]('/users', payload);
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBe(JSON.stringify(payload));
    });

    it('sends a given plain text payload', async () => {
      const mockMethodName = `${method}Once`;
      const requestMock = (fetchMock as any)[mockMethodName]('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      const payload = 'userid=214121&paid=true&registered=true';

      await (request as any)[method]('/users', payload);
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBe(payload);
    });
  });
}

describe('middleware', () => {
  it('routes all requests through the defined middleware', async () => {
    fetchMock.postOnce('*', {
      status: 200,
    });

    const fetchRest = new FetchREST({
      apiUrl: 'https://testapi.com',
    });

    fetchRest.middleware(request =>
      request.then(response => ({...response, date: '14-04-2017'})),
    );

    const {date} = (await fetchRest.post('/users')) as Response & {
      date: string;
    };
    expect(date).toBe('14-04-2017');
  });

  it('allows for a global error handler to be set', async () => {
    const requestErrorHandler = jest.fn();
    const fetchRest = new FetchREST({
      apiUrl: 'https://url/that/is/not/valid.com',
    });

    window.fetch = () =>
      new Promise(() => {
        throw new Error('Network request failed.');
      });

    fetchRest.middleware(request => request.catch(requestErrorHandler));

    const response = await fetchRest.get('/users').catch(requestErrorHandler);
    expect(requestErrorHandler.mock.calls.length).toBe(1);
    expect(response).toBeUndefined();
  });

  it('allows for a combination of both a global and a local error handler', async () => {
    const requestErrorHandler = jest.fn();
    const fetchRest = new FetchREST({
      apiUrl: 'https://url/that/is/not/valid.com',
    });

    window.fetch = () =>
      new Promise(() => {
        throw new Error('Network request failed.');
      });

    fetchRest.middleware(request =>
      request.catch(error => {
        requestErrorHandler();
        throw error;
      }),
    );

    await fetchRest.get('/users/kvendrik').catch(requestErrorHandler);
    expect(requestErrorHandler.mock.calls.length).toBe(2);
  });

  it('allows for a global error handler to resolve errors', async () => {
    const fetchRest = new FetchREST({
      apiUrl: 'https://url/that/is/not/valid.com',
    });

    window.fetch = () =>
      new Promise(() => {
        throw new Error('Network request failed.');
      });

    fetchRest.middleware(request =>
      request.catch(() => ({body: null, status: 0, success: false})),
    );

    const response = await fetchRest.get('/users/kvendrik');
    expect(response).toEqual({body: null, status: 0, success: false});
  });
});
