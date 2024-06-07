export const isInstanceOf = (value: unknown, cls: new () => any) => {
  return "prototype" in cls && cls.name
};
