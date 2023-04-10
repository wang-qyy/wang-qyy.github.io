// 列表默认的请求参数
export interface BaseListParams {
  page: number;
  pageSize?: number;
}

export interface Size {
  width: number;
  height: number;
}

export type FileFormat = 'png' | 'jpg';
