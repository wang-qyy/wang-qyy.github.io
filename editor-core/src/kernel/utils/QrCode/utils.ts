import { QrCodeOpt } from '.';

/**
 * 计算矩阵点的前景色
 * @param {Obj} config
 * @param {Number} config.row 点x坐标
 * @param {Number} config.col 点y坐标
 * @param {Number} config.count 矩阵大小
 * @param {Number} config.options 组件的options
 * @return {String}
 */
export const checkPdGround = function (config: {
  row: number;
  col: number;
  count: number;
  options: QrCodeOpt;
}) {
  const { options } = config;
  if (
    options.pdGround &&
    ((config.row > 1 && config.row < 5 && config.col > 1 && config.col < 5) ||
      (config.row > config.count - 6 &&
        config.row < config.count - 2 &&
        config.col > 1 &&
        config.col < 5) ||
      (config.row > 1 &&
        config.row < 5 &&
        config.col > config.count - 6 &&
        config.col < config.count - 2))
  ) {
    return true;
  }
  return false;
};

export const loadImage = (url: string) => {
  return new Promise<HTMLImageElement>(resolve => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      resolve(img);
      img.onload = null;
    };
  });
};