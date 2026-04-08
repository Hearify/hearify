export const shuffle = <T>(array: T[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const ArrayFactory = <T>(count: number, factory: (i: number) => T) => {
  const array: T[] = [];
  for (let i = 0; i < count; i++) {
    array.push(factory(i));
  }
  return array;
};
