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
