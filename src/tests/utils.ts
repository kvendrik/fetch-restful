import * as fetchMock from 'fetch-mock';

export interface MockLocalStorage {
  [key: string]: string;
}

export type MockRequestOptions = fetchMock.MockResponseObject;

export function mockFailingFetch() {
  window.fetch = () =>
    new Promise(() => {
      throw new Error('Network request failed.');
    });
}

export function mockAbortableFetch() {
  let lastOptions: RequestInit = {};

  window.fetch = (url, options = {}) =>
    new Promise((resolve, reject) => {
      const abortSignal = options.signal;

      if (!abortSignal) {
        reject(new Error('No signal given.'));
        return;
      }

      lastOptions = options;

      abortSignal.onabort = () =>
        reject(new Error('DOMException: The user aborted a request.'));
    });

  return {
    lastOptions() {
      return lastOptions;
    },
  };
}
