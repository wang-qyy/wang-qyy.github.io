import './index.less';

export default function ModulePreview({ url }: { url: string }) {
  return (
    <div className="module-preview-modal">
      <video src={url} width="100%" height="100%" autoPlay loop />
    </div>
  );
}
