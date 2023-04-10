class IdCreator {
  id = 1;

  prefix?: string;

  constructor(prefix?: string) {
    this.prefix = prefix;
  }

  createId() {
    const { id } = this;
    this.id += 1;
    if (this.prefix) {
      return `${this.prefix}-${id}`;
    }
    return id;
  }
}

const nId = new IdCreator();
const domId = new IdCreator('dom');

export function newId() {
  return nId.createId() as number;
}

/**
 * @description 生成唯一的dom id。使用该方法要注意，每次重载页面会出现id重复情况，如果需要唯一性，请使用uuid
 */
export function newDomId() {
  return domId.createId();
}

/**
 * @description 生成uuid
 */
export function gradientId() {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 5; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  // s = ["a", "b", "c"];
  const uuid = `${s.join('')}_gradient`;
  return uuid;
}
