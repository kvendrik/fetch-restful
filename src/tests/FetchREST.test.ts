import * as fetchMock from 'fetch-mock';
import FetchREST from '../';

type MockRequestOptions = fetchMock.MockResponseObject;

beforeEach(() => fetchMock.restore());

describe('GET', () => {
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
});

describe('POST', () => {
  it('sends a given JSON payload', async () => {
    const requestMock = fetchMock.postOnce('*', {
      status: 200,
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
    });

    const payload = {
      userId: 214121,
    };

    await request.post('/users', payload);
    const {body} = requestMock.lastOptions() as MockRequestOptions;
    expect(body).toBe(JSON.stringify(payload));
  });

  it('sends a given plain text payload', async () => {
    const requestMock = fetchMock.postOnce('*', {
      status: 200,
    });

    const request = new FetchREST({
      apiUrl: 'https://testapi.com',
    });

    const payload = 'userid=214121&paid=true&registered=true';

    await request.post('/users', payload);
    const {body} = requestMock.lastOptions() as MockRequestOptions;
    expect(body).toBe(payload);
  });
});
