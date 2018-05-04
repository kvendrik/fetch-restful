import * as qs from 'qs';

export type QueryObject = any;

export default function queryObjectToString(queryObject: QueryObject) {
  const queryString = qs.stringify(queryObject);

  if (queryString.length < 1) {
    return '';
  }

  return `?${queryString}`;
}
