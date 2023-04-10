import {
  PropsWithChildren,
  ReactElement,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { Button, message, Upload } from 'antd';
import { FileZipOutlined, FileOutlined } from '@ant-design/icons';
import { VideoDimension } from '@/utils/uploader';

import { useFileUpload, UploadType } from '../uploader';
import { ModuleType } from '.';

import './index.less';

/**
 * @description 视频文件格式说明
 * */
export function VideoUploadDesc() {
  return (
    <>
      <p>文件上传规范：</p>
      <p>1.命名为tgs_00000，例：tgs_00001；</p>
      <p>2.30帧/秒，导出PNG序列（含透明图层）；</p>
      <p>3.将PNG序列去除最后一帧后压缩为zip上传；</p>
      <p>3.压缩包中不可包含有文件夹。</p>
    </>
  );
}

/**
 * @description 源文件格式说明
 * */
export function SourceFileUploadDesc() {
  return (
    <>
      <p style={{ textAlign: 'center' }}>工程源文件支持格式：psd、Ae、Pr等</p>
      <p style={{ textAlign: 'center' }}>
        将工程文件和素材压缩成一个zip文件上传
      </p>
    </>
  );
}

/**
 * @description 预览图上传格式说明
 * */
export function PreviewUploadDesc() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <p>文件格式：jpg、png</p>
      <p>规格：16:9、9:16</p>
      <p>文件大小不超过20M</p>
    </div>
  );
}

interface UploadProcessProps {
  file: File;
  uploadType: UploadType;
  onSucceed: (res: any) => void;
  onChange: (file: File) => void;
  moduleType: ModuleType;
  accept: string;
}

export function UploadProcess(props: UploadProcessProps) {
  const { file, onSucceed, uploadType, onChange, moduleType, accept } = props;

  const [progress, setProgress] = useState(20);

  const { start: startUpload } = useFileUpload({
    moduleType,
    setProgress,
    onSucceed(res: any) {
      setProgress(100);
      onSucceed(res);
    },
    onError(err: any) {
      console.log('onError', err);
      message.info(err.type);
    },
  });

  useEffect(() => {
    if (file) {
      setProgress(0);
      startUpload(file, uploadType);
    }
  }, [file]);

  return (
    <div className="upload-progress">
      {progress === 100 ? (
        <>
          {uploadType === 'preview' ? (
            <FileOutlined className="uploaded-file-icon" />
          ) : (
            <FileZipOutlined className="uploaded-file-icon" />
          )}
          <p className="uploaded-file-title">{file.name}</p>
          <Upload
            accept={accept}
            showUploadList={false}
            beforeUpload={onChange}
          >
            <Button size="small" type="primary">
              重新上传
            </Button>
          </Upload>
        </>
      ) : (
        <>
          <div style={{ display: 'flex' }}>
            正在上传
            <span
              style={{
                maxWidth: '140px',
                display: 'inline-block',
                color: '#5A4CDB',
                marginLeft: '16px',
              }}
              className="upload-ellipsis"
            >
              {file.name}
            </span>
          </div>
          <div className="upload-progress-bg">
            <div
              className="upload-progress-success-bg"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{`${progress}%`}</span>
        </>
      )}
    </div>
  );
}

interface FileUploadProps {
  desc: ReactElement;
  accept: string;
  limitSize?: number;
  upload_type: 'source' | 'preview' | 'frame';
  moduleType: ModuleType;
}

/**
 * @descript
 * @param upload_type 上传类型
 * @eg upload_type:frame-视频帧文件上传，限制zip格式；
 * @eg upload_type:source-工程源文件上传，限制zip格式
 * @eg upload_type:preview-预览图上传，限制png、jpg、jpeg格式
 */
export default function FileUpload(props: PropsWithChildren<FileUploadProps>) {
  const { desc, accept, limitSize, onChange, upload_type, moduleType } = props;

  const [uploadFile, setUploadFile] = useState<File>();
  const [fileInfo, setFileInfo] = useState<{ width: number; height: number }>();

  /**
   * @description 文件上传前的一些格式验证
   * */
  async function beforeUpload(file: File) {
    const { size, type } = file;

    if (accept.indexOf(type) < 0) {
      message.info(`不支持上传${type}类型的文件`);
      return false;
    }

    if (limitSize) {
      const max_size = limitSize * 1024 * 1024;
      if (size > max_size) {
        message.info(`请勿上传超过${limitSize}M的${accept}文件`);
        return false;
      }
    }

    const { getImageInfo } = VideoDimension(file);
    if (type.indexOf('image') >= 0) {
      const image = await getImageInfo();
      setFileInfo({ ...image, mime: type });
    }

    setUploadFile(file);

    return false;
  }

  function onSucceed(res: any) {
    // todo 文件上传成功 更新form value
    onChange({ path: res.path, ...fileInfo });
  }

  return (
    <>
      {uploadFile ? (
        <div className="file-upload">
          <UploadProcess
            accept={accept}
            file={uploadFile}
            onSucceed={onSucceed}
            onChange={beforeUpload}
            uploadType={upload_type}
            moduleType={moduleType}
          />
        </div>
      ) : (
        <div className="file-upload file-upload-default">
          <Upload
            accept={accept}
            showUploadList={false}
            beforeUpload={beforeUpload}
          >
            <Button size="small" type="primary">
              选择文件
            </Button>
          </Upload>
          {desc}
        </div>
      )}
    </>
  );
}
