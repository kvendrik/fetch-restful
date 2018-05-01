export interface QueryObject {
  [key: string]: string | number;
}

export default function queryObjectToString(queryObject: QueryObject) {
  const keys = Object.keys(queryObject);

  if (keys.length < 1) {
    return '';
  }

  const queryParts = Object.keys(queryObject).map(key => {
    const value = queryObject[key];
    return `${key}=${value}`;
  });

  return `?${queryParts.join('&')}`;
}
