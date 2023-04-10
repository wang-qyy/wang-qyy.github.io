import React, { useEffect, useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { cdnHost } from '@/config/urls';
import {
  useFontFamilyByObserver,
  useUserFontFamilyByObserver,
  observer,
} from '@hc/editor-core';
import classnames from 'classnames';
import { getFontDetail } from '@/api/upload';

function SelectedFontFamily(props: { onClick: () => void }) {
  const { onClick } = props;
  const [fontFamily] = useFontFamilyByObserver();
  const { value } = useUserFontFamilyByObserver();
  const [uploadFontSrc, setUploadFontSrc] = useState('');

  // 上传字体获取显示字体链接
  useEffect(() => {
    if (value?.resId) {
      getFontDetail(value.resId.slice(1)).then(res => {
        if (res.code === 0) {
          setUploadFontSrc(res.data?.fileInfo?.cover_path);
        }
      });
    } else {
      setUploadFontSrc('');
    }
  }, [value]);

  return (
    <div className={classnames('font-family-wrap')} onClick={onClick}>
      <div className="selected-fontFamily">
        {uploadFontSrc ? (
          <img src={uploadFontSrc} alt="text" height={22} />
        ) : (
          fontFamily && (
            <img
              src={`${cdnHost}/index_img/fonts/${fontFamily}.svg`}
              alt="text"
              height={22}
            />
          )
        )}
      </div>
      <DownOutlined />
    </div>
  );
}

export default observer(SelectedFontFamily);
