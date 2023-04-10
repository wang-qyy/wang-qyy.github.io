export function isObjEqual(o1, o2) {
  const props1 = Object.getOwnPropertyNames(o1);
  const props2 = Object.getOwnPropertyNames(o2);
  if (props1.length != props2.length) {
    return false;
  }
  for (let i = 0, max = props1.length; i < max; i++) {
    const propName = props1[i];
    if (o1[propName] !== o2[propName]) {
      return false;
    }
  }
  return true;
}
