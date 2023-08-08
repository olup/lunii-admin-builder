export const deepCopy = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    // eslint-disable-next-line
    const copyArr: any[] = [];
    for (const item of obj) {
      copyArr.push(deepCopy(item));
    }
    return copyArr as T;
  }

  const copyObj = {};
  for (const key in obj) {
    // eslint-disable-next-line
    if (obj.hasOwnProperty(key)) {
      // eslint-disable-next-line
      // @ts-ignore
      copyObj[key] = deepCopy(obj[key]);
    }
  }
  return copyObj as T;
};
