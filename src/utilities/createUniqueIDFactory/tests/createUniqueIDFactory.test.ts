import createUniqueIDFactory from '../createUniqueIDFactory';

describe('createUniqueIDFactory', () => {
  it('returns a new function that returns a string', () => {
    const factory = createUniqueIDFactory('unique-token');
    expect(typeof factory()).toBe('string');
  });

  it('prefixes the number with the given prefix', () => {
    const factory = createUniqueIDFactory('unique-token');
    expect(factory()).toBe('unique-token1');
  });

  it('increases the appended number every time its called', () => {
    const factory = createUniqueIDFactory('unique-token');
    expect(factory()).toBe('unique-token1');
    expect(factory()).toBe('unique-token2');
    expect(factory()).toBe('unique-token3');
    expect(factory()).toBe('unique-token4');
  });
});
