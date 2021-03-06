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

  it('converts an array into a query string array', () => {
    const queryString = queryObjectToString({
      limit: 20,
      skip: 30,
      exclude: [213, 216, 892],
    });
    expect(queryString).toBe(
      encodeURI(
        '?limit=20&skip=30&exclude[0]=213&exclude[1]=216&exclude[2]=892',
      ),
    );
  });

  it('allows for nested query parameters', () => {
    const queryString = queryObjectToString({
      exclude: {
        id: 2166271,
      },
      include: {
        users: {
          ids: [216172, 216787],
          language: 'en-US',
        },
      },
    });
    expect(queryString).toBe(
      encodeURI(
        '?exclude[id]=2166271&include[users][ids][0]=216172&include[users][ids][1]=216787&include[users][language]=en-US',
      ),
    );
  });
});
