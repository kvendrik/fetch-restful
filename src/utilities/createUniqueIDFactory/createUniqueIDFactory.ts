export default function createUniqueIDFactory(prefix: string) {
  let index = 0;
  return () => {
    index += 1;
    return `${prefix}${index}`;
  };
}
