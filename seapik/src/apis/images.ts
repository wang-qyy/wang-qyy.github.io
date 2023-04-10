import { mainHost } from '@/config/http';
import { BaseListParams } from '@/typings';

export function getImages(params: BaseListParams) {
  return mainHost.get(`/editor/audio-list`);
}
