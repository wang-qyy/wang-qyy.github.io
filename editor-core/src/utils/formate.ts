export const formatCategories = (
  name: string,
  key: string,
  data: any,
  type?: 'radio' | 'button',
) => {
  // 比例 shape
  // 分类 classes.g
  // // 用途 classes.c
  // // 场景 classes.d
  // // 行业 classes.i
  // 风格 tags.st
  let options;
  if (type === 'radio') {
    options = data.map(item => ({
      label: item.name,
      value: item.id,
    }));
  } else {
    options = data.map(item => ({
      label: item.name,
      value: item.params,
      checked: !!item.active,
      key: item.id,
    }));
  }

  return { key, label: name, type, options };
};
