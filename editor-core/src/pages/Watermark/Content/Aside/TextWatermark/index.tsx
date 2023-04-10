import { Input, Popover } from 'antd';

import { useDebounceFn } from 'ahooks';
import {
  getTemplateWatermark,
  useWatermarkTextByObserver,
  getCanvasInfo,
  observer,
  toJS,
} from '@hc/editor-core';
import { useTextWatermarkPopover } from '@/store/adapter/useGlobalStatus';
import { dataWatermark } from '@/utils/webLog';

import { setWatermark } from '../../../handler';
import Adjust from '../Adjust';

import styles from './index.less';

const { TextArea } = Input;

const TextWatermark = () => {
  const { close, visible } = useTextWatermarkPopover();

  const [text, updateText] = useWatermarkTextByObserver();
  const watermarkInfo = getTemplateWatermark();

  const canvasInfo = getCanvasInfo();

  const { run: handleSetText } = useDebounceFn(
    e => {
      const width = canvasInfo.width - 48;

      const fontSize = 100;
      const height = fontSize * 1.5;

      const text = e.target.value;

      if (watermarkInfo) {
        updateText([text]);
        return;
      }

      setWatermark(
        {
          meta: {
            addOrigin: 'text',
            type: 'text',
          },
          attribute: {
            text: [text],
            width,
            height,
            fontSize: 50,
            textAlign: 'left',
            fontFamily: 'fnsyhtRegular',
          },
        },
        watermarkInfo?.meta.type ? 'replace' : 'add',
      );
    },
    { wait: 200 },
  );

  return (
    <div className={styles.warp}>
      <div className={styles.textarea}>
        <Popover
          placement="bottom"
          visible={visible}
          content={
            <div className={styles.PopoverWarp}>
              <div className={styles.PopoverText}>
                输入文字，即可在线实时生成文字水印
              </div>
              <div
                className={styles.Popoverbutton}
                onClick={() => {
                  close();
                }}
              >
                知道了
              </div>
            </div>
          }
        >
          <TextArea
            placeholder="输入水印内容"
            rows={4}
            onChange={handleSetText}
            // value={text}
            onFocus={() => {
              close();
              dataWatermark('VideoWmEdit', 'addFont');
            }}
          />
        </Popover>
      </div>

      <Adjust visible text={text} tiledShow={false} />
    </div>
  );
};

export default observer(TextWatermark);
