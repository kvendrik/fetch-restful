import * as fetchMock from 'fetch-mock';
import {MockLocalStorage, mockSpecialFetch, AbortWindow} from './utilities';
import FetchREST, {Response} from '../';

type MockRequestOptions = fetchMock.MockResponseObject;

describe('FetchREST', () => {
  beforeEach(() => {
    fetchMock.restore();
    mockSpecialFetch.restore();
    jest.useFakeTimers();
  });

  describe('request', () => {
    describe('options', () => {
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

      it('allows method instead of object literal as global request options', async () => {
        const mockLocalStorage: MockLocalStorage = {};
        const requestMock = fetchMock.get('*', {
          status: 200,
        });

        const request = new FetchREST(() => ({
          apiUrl: 'https://testapi.com',
          headers: {
            Authorization: mockLocalStorage.authToken,
          },
        }));

        await request.get('/users');
        const beforeOptions = requestMock.lastOptions() as MockRequestOptions;
        expect(beforeOptions.headers!.Authorization).toBeUndefined();

        mockLocalStorage.authToken = 'Bearer sahas2164sagafsg1245sfsax';

        await request.get('/users');

        const afterOptions = requestMock.lastOptions() as MockRequestOptions;
        expect(afterOptions.headers!.Authorization).toBe(
          'Bearer sahas2164sagafsg1245sfsax',
        );
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
    });

    describe('response', () => {
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

      it('allows a catch method to catch errors', done => {
        const request = new FetchREST({
          apiUrl: 'https://url/that/is/not/valid.com',
        });

        mockSpecialFetch.failingFetch();

        request.get('/users').catch(error => {
          expect(error).toBeInstanceOf(Error);
          done();
        });
      });
    });

    describe('timeout', () => {
      it('allows for a global timeout option to be set', () => {
        const fetchRest = new FetchREST({
          apiUrl: 'https://api.github.com',
          timeout: 100,
        });

        mockSpecialFetch.abortableFetch();

        const request = fetchRest.get('/users');
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);

        jest.advanceTimersByTime(100);

        return expect(request).rejects.toHaveProperty(
          'message',
          'DOMException: The user aborted a request.',
        );
      });

      it('allows for a local timeout option to be set', () => {
        const fetchRest = new FetchREST({
          apiUrl: 'https://api.github.com',
        });

        mockSpecialFetch.abortableFetch();

        const request = fetchRest.get('/users', {}, {timeout: 200});
        expect(setTimeout).toHaveBeenCalledTimes(1);
        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 200);

        jest.advanceTimersByTime(200);

        return expect(request).rejects.toHaveProperty(
          'message',
          'DOMException: The user aborted a request.',
        );
      });

      it('does not set a timeout when not specified', () => {
        fetchMock.getOnce('*', {
          status: 200,
        });

        const fetchRest = new FetchREST({
          apiUrl: 'https://api.github.com',
        });

        const request = fetchRest.get('/users');
        expect(setTimeout).not.toBeCalled();
        expect(request).resolves.toHaveProperty('status', 200);
      });
    });
  });

  describe('get', () => {
    it('sends the request to the right endpoint', async () => {
      const requestMock = fetchMock.getOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      await request.get('/users');

      const lastUrl = requestMock.lastUrl();
      expect(lastUrl).toBe('https://testapi.com/users');
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

      await request.get('/users', null, {
        apiUrl: 'https://superapi.com',
        headers: {
          Accept: 'text/xml',
        },
      });

      const {headers} = requestMock.lastOptions() as MockRequestOptions;
      expect(headers!.Accept).toBe('text/xml');
      expect(requestMock.lastUrl()).toBe('https://superapi.com/users');
    });

    it('allows a request without a query', async () => {
      const requestMock = fetchMock.getOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      await request.get('/users');
      const lastUrl = requestMock.lastUrl();
      expect(lastUrl).toBe('https://testapi.com/users');
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

  describe('post', () => {
    it('sends the request to the right endpoint', async () => {
      const requestMock = fetchMock.postOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      await request.post('/users');

      const lastUrl = requestMock.lastUrl();
      expect(lastUrl).toBe('https://testapi.com/users');
    });

    it('allows for local overwrite of options', async () => {
      const requestMock = fetchMock.postOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
        headers: {
          Accept: 'application/json',
        },
      });

      await request.post('/users', null, {
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
      const requestMock = fetchMock.postOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      await request.post('/users');
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBeNull();
    });

    it('sends a given object payload', async () => {
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

    it('sends a given array payload', async () => {
      const requestMock = fetchMock.postOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      const payload = [
        {
          userId: 214121,
        },
        {
          userId: 815642,
        },
      ];

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

  describe('put', () => {
    it('sends the request to the right endpoint', async () => {
      const requestMock = fetchMock.putOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      await request.put('/users');

      const lastUrl = requestMock.lastUrl();
      expect(lastUrl).toBe('https://testapi.com/users');
    });

    it('allows for local overwrite of options', async () => {
      const requestMock = fetchMock.putOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
        headers: {
          Accept: 'application/json',
        },
      });

      await request.put('/users', null, {
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
      const requestMock = fetchMock.putOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      await request.put('/users');
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBeNull();
    });

    it('sends a given object payload', async () => {
      const requestMock = fetchMock.putOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      const payload = {
        userId: 214121,
      };

      await request.put('/users', payload);
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBe(JSON.stringify(payload));
    });

    it('sends a given array payload', async () => {
      const requestMock = fetchMock.putOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      const payload = [
        {
          userId: 214121,
        },
        {
          userId: 815642,
        },
      ];

      await request.put('/users', payload);
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBe(JSON.stringify(payload));
    });

    it('sends a given plain text payload', async () => {
      const requestMock = fetchMock.putOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      const payload = 'userid=214121&paid=true&registered=true';

      await request.put('/users', payload);
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBe(payload);
    });
  });

  describe('patch', () => {
    it('sends the request to the right endpoint', async () => {
      const requestMock = fetchMock.patchOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      await request.patch('/users');

      const lastUrl = requestMock.lastUrl();
      expect(lastUrl).toBe('https://testapi.com/users');
    });

    it('allows for local overwrite of options', async () => {
      const requestMock = fetchMock.patchOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
        headers: {
          Accept: 'application/json',
        },
      });

      await request.patch('/users', null, {
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
      const requestMock = fetchMock.patchOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      await request.patch('/users');
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBeNull();
    });

    it('sends a given object payload', async () => {
      const requestMock = fetchMock.patchOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      const payload = {
        userId: 214121,
      };

      await request.patch('/users', payload);
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBe(JSON.stringify(payload));
    });

    it('sends a given array payload', async () => {
      const requestMock = fetchMock.patchOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      const payload = [
        {
          userId: 214121,
        },
        {
          userId: 815642,
        },
      ];

      await request.patch('/users', payload);
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBe(JSON.stringify(payload));
    });

    it('sends a given plain text payload', async () => {
      const requestMock = fetchMock.patchOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      const payload = 'userid=214121&paid=true&registered=true';

      await request.patch('/users', payload);
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBe(payload);
    });
  });

  describe('delete', () => {
    it('sends the request to the right endpoint', async () => {
      const requestMock = fetchMock.deleteOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      await request.delete('/users');

      const lastUrl = requestMock.lastUrl();
      expect(lastUrl).toBe('https://testapi.com/users');
    });

    it('allows for local overwrite of options', async () => {
      const requestMock = fetchMock.deleteOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
        headers: {
          Accept: 'application/json',
        },
      });

      await request.delete('/users', null, {
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
      const requestMock = fetchMock.deleteOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      await request.delete('/users');
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBeNull();
    });

    it('sends a given object payload', async () => {
      const requestMock = fetchMock.deleteOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      const payload = {
        userId: 214121,
      };

      await request.delete('/users', payload);
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBe(JSON.stringify(payload));
    });

    it('sends a given array payload', async () => {
      const requestMock = fetchMock.deleteOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      const payload = [
        {
          userId: 214121,
        },
        {
          userId: 815642,
        },
      ];

      await request.delete('/users', payload);
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBe(JSON.stringify(payload));
    });

    it('sends a given plain text payload', async () => {
      const requestMock = fetchMock.deleteOnce('*', {
        status: 200,
      });

      const request = new FetchREST({
        apiUrl: 'https://testapi.com',
      });

      const payload = 'userid=214121&paid=true&registered=true';

      await request.delete('/users', payload);
      const {body} = requestMock.lastOptions() as MockRequestOptions;
      expect(body).toBe(payload);
    });
  });

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

      mockSpecialFetch.failingFetch();

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

      mockSpecialFetch.failingFetch();

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

      mockSpecialFetch.failingFetch();

      fetchRest.middleware(request =>
        request.catch(() => ({body: null, status: 0, success: false})),
      );

      const response = await fetchRest.get('/users/kvendrik');
      expect(response).toEqual({body: null, status: 0, success: false});
    });
  });

  describe('getAbortToken', () => {
    it('returns an unique token', () => {
      const fetchRest = new FetchREST({
        apiUrl: 'https://api.github.com',
      });

      const tokens = [];

      for (let i = 0; i < 10; i += 1) {
        const newToken = fetchRest.getAbortToken();
        expect(tokens).not.toContain(newToken);
        tokens.push(newToken);
      }
    });
  });

  describe('abort', () => {
    it('allows for cancellation of the request', () => {
      const fetchRest = new FetchREST({
        apiUrl: 'https://api.github.com',
      });

      const mock = mockSpecialFetch.abortableFetch();

      const abortToken = fetchRest.getAbortToken();
      const request = fetchRest.get('/users', {}, {abortToken});

      const {signal} = mock.lastOptions();
      expect(signal).toBeInstanceOf((window as AbortWindow).AbortSignal);

      fetchRest.abort(abortToken);

      return expect(request).rejects.toHaveProperty(
        'message',
        'DOMException: The user aborted a request.',
      );
    });

    it('allows for cancellation of multiple requests', () => {
      const fetchRest = new FetchREST({
        apiUrl: 'https://api.github.com',
      });

      mockSpecialFetch.abortableFetch();

      const abortToken = fetchRest.getAbortToken();

      const request = fetchRest.get('/users', {}, {abortToken});
      const secondRequest = fetchRest.get('/users', {}, {abortToken});

      fetchRest.abort(abortToken);

      return Promise.all([
        expect(request).rejects.toHaveProperty(
          'message',
          'DOMException: The user aborted a request.',
        ),
        expect(secondRequest).rejects.toHaveProperty(
          'message',
          'DOMException: The user aborted a request.',
        ),
      ]);
    });

    it('calling abort with an invalid token throws an error', () => {
      const fetchRest = new FetchREST({
        apiUrl: 'https://api.github.com',
      });

      expect(() => fetchRest.abort('token-1')).toThrowError(
        'Invalid token "token-1".',
      );
    });
  });
});
