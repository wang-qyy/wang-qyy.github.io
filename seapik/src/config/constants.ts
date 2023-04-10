import getUrlParams from '@/utils/urlProps';

// 全局常量
class Config {
  constructor({ is_designer }) {
    this.is_designer = is_designer;
  }
  is_designer?: 0 | 1;
}

export const config = new Config({
  is_designer: getUrlParams().is_designer
    ? Number(getUrlParams().is_designer)
    : 0,
});
