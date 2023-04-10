import { AssetClass, assetUpdater, observer } from '@hc/editor-core';
import { stopPropagation } from '@/utils/single';
import { Input } from 'antd';
import React, { useRef } from 'react';
import './index.less';
import CaluFontSize from '@/kernel/Canvas/TextEditor/caluFontSize';
import { reportChange } from '@/kernel/utils/config';

const { TextArea } = Input;
const TextAreaAutoSize = (props: { asset: AssetClass; onBlur?: Function }) => {
  const { asset, onBlur = () => {} } = props;
  const editorRef = useRef(null);
  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    assetUpdater(asset, {
      attribute: {
        text: e.target.value.split('\n'),
      },
    });
  };
  // 修改字体大小
  function changeFontSize(fontSize: number) {
    assetUpdater(asset, {
      attribute: {
        fontSize,
      },
    });
    asset?.setRtRelativeByParent();
  }
  return (
    <div className="layerItem-textArea">
      <TextArea
        ref={editorRef}
        rows={5}
        defaultValue={asset?.attribute.text?.join('\n')}
        placeholder="请输入文字"
        onChange={onChange}
        onKeyDown={stopPropagation}
        onBlur={() => {
          reportChange('changeText', true);
          onBlur();
        }}
        autoFocus
        onFocus={e => {
          e.target.select();
        }}
        onCopy={stopPropagation}
        onPaste={stopPropagation}
      />
      {asset && asset?.parent && (
        <CaluFontSize
          key={asset?.attribute.text}
          textEditAsset={asset}
          currentText={asset?.attribute.text?.join('<br/>')}
          onChange={changeFontSize}
        />
      )}
    </div>
  );
};
export default observer(TextAreaAutoSize);
