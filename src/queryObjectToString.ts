import * as qs from 'qs';

export interface QueryObject {
  [key: string]: string | number | string[] | number[];
}

export default function queryObjectToString(queryObject: QueryObject) {
  const queryString = qs.stringify(queryObject);

  if (queryString.length < 1) {
    return '';
  }

  return `?${queryString}`;
}
