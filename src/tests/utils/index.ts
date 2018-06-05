import MockSpecialFetch, {AbortWindow} from './MockSpecialFetch';

export interface MockLocalStorage {
  [key: string]: string;
}

export const mockSpecialFetch = new MockSpecialFetch();
export {AbortWindow};
