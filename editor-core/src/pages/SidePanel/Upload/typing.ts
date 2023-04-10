/**
 * @description 文件状态
 * @enum 0-等待上传（）、1-上传成功、2-视频转码中、3-上传中、4-beforeupload 验证成功、-1上传失败、-2上传违规
 * */
export type FileState =
  | 0 // 等待上传
  | 4 // beforeupload 验证成功
  | 3 // 上传中
  | 1 // 完成
  | 2 // 转码中;
  | -1 // 上传失败
  | -2; // 上传违规;

/**
 * @description 文件违规状态
 * @enum 0-待检测、1-检测通过、2-疑似违规、3-确认违规
 * */
export type ScanFlag =
  | 0 // 待检测
  | 1 // 检测通过
  | 2 // 疑似违规
  | 3; // 确定违规

/**
 * @description  文件类型
 * @enum 1-文件 2-文件夹
 */
export type FileType = 1 | 2;

export interface FileInfo {
  state: FileState;
  file: File;
  cover_path?: string; // 原图
  small_cover_path?: string; // 缩略图
  mime_type?: string;
  file_format?: string;
  transcode?: { hd?: string; sd: string; mp3?: string };
  streams?: {
    audio: {
      Bitrate: string;
      Channels: string;
      Duration: string;
      StartTime: string;
    };
  }[];
  values?: { duration: string };
  width?: number;
  height?: number;
}
