import queryObjectToString from '../queryObjectToString';

describe('queryObjectToString', () => {
  it('converts a key:value object into a query string', () => {
    const queryString = queryObjectToString({
      limit: 20,
      skip: 30,
      open: 1,
    });
    expect(queryString).toBe('?limit=20&skip=30&open=1');
  });

  it('returns an empty string when the object is empty', () => {
    const queryString = queryObjectToString({});
    expect(queryString).toBe('');
  });
});
