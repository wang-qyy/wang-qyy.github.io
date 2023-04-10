// 加载单张数组
function loadingImage(imageURL: string) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => {
      reject(new Error('加载异常'));
    };
    img.onload = () => {
      // 移除非必要项
      // @ts-ignore
      delete img.onload;
      // @ts-ignore
      delete img.onerror;
      resolve(img);
    };
    img.src = imageURL;
  });
}
const resources: Map<string, any> = new Map();
export class CacheImage {
  classResources = new Map();

  cacheId: string;

  constructor(cacheId: string) {
    if (!resources.get(cacheId)) {
      resources.set(cacheId, new Map());
    } else {
      this.classResources = resources.get(cacheId);
    }
    this.cacheId = cacheId;
  }

  /** 同步
   *调用地方，在设置图层attr属性的时候调用 把dom结点提前加载出来，加载图片的地方直接取用
   * @param cacheKey 检查数据是否已经缓存过
   * @param params 参数
   * @param cacheParam 传入图片url或者数组 如未提前加载过图片，就加载
   */
  getImageDom = async (imgUrl: string) => {
    if (this.classResources.has(imgUrl)) {
      return this.classResources.get(imgUrl);
    }
    const imgDom = await loadingImage(imgUrl);
    this.classResources.set(imgUrl, imgDom);
    resources.set(this.cacheId, this.classResources);
    return imgDom;
  };
}
