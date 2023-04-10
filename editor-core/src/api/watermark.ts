import { mainHost } from '@/config/http';

// 执行合成
export function execCompound(data) {
  const formData = new FormData();
  Object.keys(data).forEach(item => {
    formData.append(item, data[item]);
  });

  return mainHost.post(`/watermark-video/exec-compound`, {
    body: JSON.stringify(data),
  });
}

// 检测水印合成结果
export function checkWatermarkRes(id: number | string) {
  return mainHost.get(`/watermark-video/check-watermark-res?id=${id}`);
}

// 获取视频信息
export function watermarkdetail(id: number | string) {
  return mainHost.get(`/watermark-video/watermark-detail?id=${id}`);
}

// 获取oss临时上传凭证
export function watermarkOss(filename: string, cdnName: string, id: number) {
  return mainHost.get(
    `/watermark-video/get-oss-up-params?filename=${filename}&cdnName=${cdnName}&type=pic&id=${id}`,
  );
}

// 获取文件路径以及名称生成
export function watermarkCdnName(filename: string) {
  return mainHost.get(
    `/video-tools/get-cdn-name?filename=${filename}&root=video_watermark`,
  );
}

// 手机验证码
export function getTelLogin(num: number) {
  return mainHost.get(`/site-api/send-tel-login-code?num=${num}&noCodeImg=1`);
}

// 手机绑定
export function bindPh(param: any) {
  let data = {
    num: param?.phoneNum,
    code: param?.phoneMsgNum,
    confirm_bind: param?.confirm_bind,
  };
  return mainHost.post(`/user/bind-tel`, {
    data,
  });
}

// 获取合成下载地址
export function binddownloadlink(id: number | string) {
  return mainHost.get(`/video-tools/get-download-link?id=${id}`);
}
// 获取草稿封面上传直传参数
export function coverUpload(data: {
  name: string;
  type: string;
  size: number;
}) {
  return mainHost.get(
    `/user-upload/draft-payload?source_type=draft_cover&name=${data.name}&type=${data.type}&size=${data.size}`,
  );
}
