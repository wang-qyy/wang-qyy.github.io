import React, { useState, useEffect } from 'react';
import { getFontDetail } from '@/api/upload';

function ShowFont(props: { id: string }) {
  const { id } = props;
  const [uploadFontSrc, setUploadFontSrc] = useState('');

  // 上传字体获取显示字体链接
  useEffect(() => {
    getFontDetail(id).then(res => {
      if (res.code === 0) {
        setUploadFontSrc(res.data?.fileInfo?.cover_path);
      }
    });
  }, [id]);
  return (
    <div className="selected-fontFamily">
      {uploadFontSrc && <img src={uploadFontSrc} alt="text" height={22} />}
    </div>
  );
}

export default ShowFont;
