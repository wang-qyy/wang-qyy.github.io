import { message } from 'antd';
import { getFontList, deleteFiles } from '@/api/upload';
import {
  useActiveBrand,
  useUserBindPhoneModal,
} from '@/store/adapter/useGlobalStatus';

import {
  brandAdd,
  getBrandList,
  getAddColor,
  getColorList,
  getBrandRename,
  getBrandDelLogo,
  getBrandColorRename,
  getBrandColorDel,
  getBrandDelColor,
  getBrandAddColor,
  getFontDetail,
  getBrandFontSet,
  getSystemColorList,
  getLogoList,
  getActiveBrand,
} from '@/api/brand';

export const useBrand = () => {
  const { activeBrand } = useActiveBrand();
  const { showBindPhoneModal } = useUserBindPhoneModal();

  // 上传logo提取颜色保存
  const logoColorSave = value => {
    console.log('value', value);
  };

  // 更新上传字体列表
  const updateFontList = (callback: (data: any) => void) => {
    getFontList({ page: 1, pageSize: 100 }).then(res => {
      if (res.code === 0) {
        callback(res.data);
      } else {
        message.error(res.msg);
      }
    });
  };

  // 删除字体
  const delFont = (ids, callback) => {
    deleteFiles(ids, '0').then(res => {
      if (res?.code === 0) {
        message.success('删除成功');
        callback && callback(res.data);
      }
    });
  };

  // 获取logo列表
  const brandLogoList = (id: string, callback?: (data: any) => void) => {
    getLogoList(id).then(res => {
      if (res.code === 0) {
        callback && callback(res.data);
      }
    });
  };

  // 更新品牌列表
  const updateBranfList = (callback?: (data: any) => void) => {
    getBrandList().then(res => {
      if (res.code === 0) {
        callback && callback(res.data);
      }
    });
  };

  // 新增品牌工具箱
  const addBrand = (title: string, callback) => {
    brandAdd(title).then(async res => {
      if (res.code === 0) {
        await callback(res.data);
        updateBranfList();
      } else {
        if (res.data?.message == 'bindPhone') {
          showBindPhoneModal();
        } else {
          message.error(res.msg);
        }
      }
    });
  };
  // 颜色列表
  const updateColorList = (id, callback?: (data) => void) => {
    getColorList(id).then(res => {
      if (res.code === 0) {
        callback && callback(res.data);
      }
    });
  };

  // 删除颜色组
  const delBrandColor = (group_id: string | number, callback) => {
    getBrandColorDel(group_id).then(res => {
      if (res?.code === 0) {
        message.success('删除成功');
        callback && callback(res.data);
      }
    });
  };
  // 新增品牌颜色
  const addBrandColor = (
    pram: {
      title: string;
      colors: string[];
    },
    callback,
  ) => {
    getAddColor({
      ...pram,
      brand_id: activeBrand?.id,
    }).then(res => {
      if (res.code === 0) {
        callback(res.data);
      } else {
        if (res.data?.message == 'bindPhone') {
          showBindPhoneModal();
        } else {
          message.error(res.msg);
        }
      }
    });
  };

  // 修改品牌名字
  const modifyName = (title: string, callback?: (data: any) => void) => {
    getBrandRename({
      title,
      brand_id: activeBrand?.id,
    }).then(res => {
      if (res.code === 0) {
        message.success('修改成功');
        callback && callback(res.data);
      } else {
        if (res.data?.message == 'bindPhone') {
          showBindPhoneModal();
        } else {
          message.error(res.msg);
        }
      }
    });
  };

  // 删除log
  const delLogo = (id: string | number, callback?: (data: any) => void) => {
    getBrandDelLogo(id).then(res => {
      if (res.code === 0) {
        message.success('删除成功');
        callback && callback(res.data);
      } else {
        message.error(res.msg);
      }
    });
  };

  // 删除单个颜色
  const delColor = (
    id: string | number,
    color: string,
    callback?: (data: any) => void,
  ) => {
    getBrandDelColor(id, color).then(res => {
      if (res.code === 0) {
        callback && callback(res.data);
      } else {
        message.error(res.msg);
      }
    });
  };

  // 新增单个颜色
  const addColor = (
    id: string | number,
    color: string,
    r_color: string,
    callback?: (data: any) => void,
  ) => {
    getBrandAddColor(id, color, r_color).then(res => {
      if (res.code === 0) {
        callback && callback(res.data);
      } else {
        message.error(res.msg);
      }
    });
  };

  // 修改调色板名字
  const modifyPaletteName = (
    title: string,
    group_id: string,
    callback: (data: any) => void,
  ) => {
    getBrandColorRename({
      title,
      group_id,
    }).then(res => {
      if (res.code === 0) {
        message.success('修改成功');
        callback && callback(res.data);
      } else {
        if (res.data?.message == 'bindPhone') {
          showBindPhoneModal();
        } else {
          message.error(res.msg);
        }
      }
    });
  };

  // 获取当前品牌详情id
  const bindBrandDetail = (item: any) => { };

  // 获取字体设置列表
  const bindFontDetail = callback => {
    if (activeBrand?.id) {
      getFontDetail(activeBrand?.id).then(res => {
        if (res.code === 0) {
          callback && callback(res.data);
        } else {
          message.error(res.msg);
        }
      });
    }
  };

  // 获取预设颜色列表
  const bindSystemColorList = (page, pasgeSize, callback) => {
    getSystemColorList(page, pasgeSize).then(res => {
      if (res.code === 0) {
        callback && callback(res.data);
      } else {
        message.error(res.msg);
      }
    });
  };

  // 获取字体设置列表
  const bindFontSet = (text_type, source_type, font, font_size, callback) => {
    getBrandFontSet(
      activeBrand?.id,
      text_type,
      source_type,
      font,
      font_size,
    ).then(res => {
      if (res.code === 0) {
        callback && callback(res.data);
      } else {
        message.error(res.msg);
      }
    });
  };

  // 获取当前选中品牌
  const bindActiveBrand = (callback, brand_id?: number | string) => {
    getActiveBrand(brand_id || '').then(res => {
      if (res.code === 0) {
        callback && callback(res.data);
      } else {
        message.error(res.msg);
      }
    });
  };
  return {
    logoColorSave,
    addBrand,
    modifyName,
    modifyPaletteName,
    bindBrandDetail,
    updateFontList,
    delFont,
    updateBranfList,
    addBrandColor,
    updateColorList,
    delLogo,
    delBrandColor,
    delColor,
    addColor,
    bindFontDetail,
    bindFontSet,
    bindSystemColorList,
    brandLogoList,
    bindActiveBrand,
  };
};
