import MockSpecialFetch from './MockSpecialFetch';

export interface MockLocalStorage {
  [key: string]: string;
}

export const mockSpecialFetch = new MockSpecialFetch();
