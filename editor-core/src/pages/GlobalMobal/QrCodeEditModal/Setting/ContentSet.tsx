import { QrcodeInfo } from '@/kernel';
import { Input, Radio } from 'antd';
import { getWxQrDecode } from '@/api/pub';

import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';

import LabelItem from '../LabelItem';
import styles from './index.less';
import { textTypeOptions } from './options';

const ContentSet = ({
  state,
  dispatch,
}: {
  state: QrcodeInfo;
  dispatch: React.Dispatch<Partial<QrcodeInfo>>;
}) => {
  const { text, wxText, textType } = state;

  const isWx = textType === 'wxUrl';

  async function onTextBlur(e) {
    if (!isWx) return;

    const text = e.target.value;
    if (text) {
      const res = await getWxQrDecode({ username: text });

      // console.log('获取二维码内容', res);
      // TODO: 接口获取二维码内容
      dispatch({ text: res.data.text });
    }
  }

  const cur = textTypeOptions[textType] || textTypeOptions.url;

  return (
    <div className={styles.ContentSet}>
      <LabelItem label="选择类型">
        <Radio.Group
          value={textType}
          buttonStyle="solid"
          onChange={({ target: { value } }) => {
            clickActionWeblog(`qrcode_${value}`);
            dispatch({ textType: value, text: '' });
          }}
        >
          {Object.values(textTypeOptions).map(opt => (
            <Radio.Button
              key={opt.key}
              value={opt.key}
              style={{ marginRight: 12 }}
            >
              {opt.text}
            </Radio.Button>
          ))}
        </Radio.Group>
      </LabelItem>
      {/* 文本框 */}
      <LabelItem label={cur.label}>
        <Input.TextArea
          value={isWx ? wxText : text}
          onBlur={onTextBlur}
          onChange={({ target: { value } }) => {
            isWx ? dispatch({ wxText: value }) : dispatch({ text: value });
          }}
          placeholder={cur.placeholder}
          autoSize={{ minRows: 2, maxRows: 8 }}
          maxLength={200}
          onPaste={stopPropagation}
        />
      </LabelItem>
    </div>
  );
};

export default ContentSet;
