const asVariants = <
  const T extends object,
  R
>(
  values: T,
  resolve: (value: T[keyof T], key: keyof T) => R
): Record<keyof T, R> => {
  return Object.fromEntries(
    Object.keys(values).map(key => {
      const typedKey = key as keyof T;

      return [
        typedKey,
        resolve(values[typedKey], typedKey),
      ];
    })
  ) as Record<keyof T, R>;
};

export default asVariants;
