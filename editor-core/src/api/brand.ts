import { mainHost } from '@/config/http';

// 添加品牌
export const brandAdd = (title: string) => {
  return mainHost.post(`/brand/add`, {
    body: `title=${title}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// 品牌列表
export function getBrandList() {
  return mainHost.get(`/brand/list`);
}

/**
 * @description 添加品牌logo
 */
export function getAddLogo(params: any) {
  const formData = new FormData();
  Object.keys(params).forEach(item => {
    formData.append(item, params[item]);
  });

  return mainHost.post(`/brand/add-logo`, { data: formData });
}

// 删除品牌
export const getDelBrand = (brand_id: string | number) => {
  return mainHost.post(`/brand/del`, {
    brand_id,
  });
};
// 品牌logo列表
export function getLogoList(brand_id: string | number) {
  return mainHost.get(`/brand/logo-list?brand_id=${brand_id}`, {});
}

// 添加品牌颜色
export const getAddColor = (params: any) => {
  const formData = new FormData();
  Object.keys(params).forEach(item => {
    formData.append(item, params[item]);
  });

  return mainHost.post(`/brand/add-color-group`, { data: formData });
};

// 品牌颜色列表
export function getColorList(brand_id: string | number) {
  return mainHost.get(`/brand/color-list?brand_id=${brand_id}`);
}

// 品牌工具箱重命名
export const getBrandRename = (params: any) => {
  return mainHost.post(`/brand/rename`, {
    body: `brand_id=${params.brand_id}&title=${params.title}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// 品牌颜色组重命名
export const getBrandColorRename = (params: any) => {
  return mainHost.post(`/brand/color-group-rename`, {
    body: `group_id=${params.group_id}&title=${params.title}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// 品牌颜色组删除
export const getBrandColorDel = (group_id: string | number) => {
  return mainHost.post(`/brand/del-color-group`, {
    body: `group_id=${group_id}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};
// 品牌logo删除
export const getBrandDelLogo = (logo_id: string | number) => {
  return mainHost.post(`/brand/del-logo`, {
    body: `logo_id=${logo_id}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// 品牌单个颜色删除
export const getBrandDelColor = (group_id: string | number, color: string) => {
  return mainHost.post(`/brand/del-color`, {
    body: `group_id=${group_id}&color=${color}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// 品牌单个颜色新增
export const getBrandAddColor = (
  group_id: string | number,
  color: string,
  r_color: string,
) => {
  return mainHost.post(`/brand/add-color`, {
    body: `group_id=${group_id}&color=${color}&r_color=${r_color}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// 品牌字体设置列表
export function getFontDetail(brand_id: string | number) {
  return mainHost.get(`/brand/font-detail?brand_id=${brand_id}`);
}

// 品牌字体设置
export const getBrandFontSet = (
  brand_id: string | number,
  text_type: string,
  source_type: string,
  font: any,
  font_size: string | number,
) => {
  return mainHost.post(`/brand/font-set`, {
    body: `brand_id=${brand_id}&text_type=${text_type}&source_type=${source_type}&font=${font}&font_size=${font_size}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

// 品牌字体预设颜色列表
export function getSystemColorList(page: number, pageSize: number) {
  return mainHost.get(
    `/brand/system-color-list?page=${page}&pageSize=${pageSize}`,
  );
}

// 获取当前选择品牌
export function getActiveBrand(brand_id?: number | string) {
  const req = brand_id
    ? `/brand/get-active-brand?brand_id=${brand_id}`
    : `/brand/get-active-brand`;
  return mainHost.get(req);
}
