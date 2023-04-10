import { mainHost } from '@/config/http';

export function getUserInfo() {
  return mainHost.get(`/api/editor/user-info`);
}
