import { mainHost } from '@/config/http';

// 获取角色主页列表
export function getMixrole() {
  return mainHost.get(`/creator-api/resource/mix-role`);
}

// 获取角色图片列表
export function getRoleImage(data: { class_id: string | number }) {
  return mainHost.get(
    `/creator-api/resource/lottie-role?class_id=${data.class_id}`,
  );
}
