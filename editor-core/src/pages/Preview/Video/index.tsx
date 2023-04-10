import {} from 'react';

import PreviewVideo from '../PreviewVideo';

import './index.less';

export default function Video() {
  return (
    <div className="xiuduoduo-preview-wrap">
      <div className="xiuduoduo-preview-main">
        <div className="xiuduoduo-preview-video">
          <PreviewVideo />
        </div>
        <div className="xiuduoduo-preview-bottom"> bottom</div>
      </div>
    </div>
  );
}
