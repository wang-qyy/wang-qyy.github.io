import { Modal } from 'antd';
import { useRef } from 'react';

function PreviewVideo({ src }: { src: string }) {
  const video = useRef<HTMLVideoElement>(null);
  function onCanPlay() {
    if (video.current) {
      video.current.play();
    }
  }
  return (
    <div className="template-preview">
      <video src={src} controls ref={video} onCanPlay={onCanPlay} />
    </div>
  );
}

interface TemplatePreviewProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
  videoSrc: string;
  width: number;
  picId: string;
}

function TemplatePreview({
  videoSrc,
  picId,
  onOk,
  ...res
}: TemplatePreviewProps) {
  return (
    <Modal
      // title={`使用此模板后，当前页面内容将会被替换。  当前模板id:${picId}`}
      title="使用此模板后，当前页面内容将会被替换。"
      centered
      destroyOnClose
      okText="替换"
      cancelText="取消"
      onOk={() => onOk()}
      getContainer={document.getElementById('xiudodo')}
      {...res}
    >
      <PreviewVideo src={videoSrc} />
    </Modal>
  );
}

export default TemplatePreview;
