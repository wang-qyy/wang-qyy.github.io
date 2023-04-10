import { PropsWithChildren } from 'react';
import { useSetState } from 'ahooks';

import { Radio } from 'antd';
import XiuIcon from '@/components/XiuIcon';
import { clickActionWeblog } from '@/utils/webLog';

import Video from '../Video';

import styles from './index.modules.less';

export default function Main({
  watermark,
}: PropsWithChildren<{ watermark?: boolean }>) {
  const [state, setState] = useSetState({ type: 'default' });

  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <div
          style={{
            color: 'rgba(0, 0, 0, 0.5)',
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          视频预览中包含的音乐人声水印，将在下载后自动去除
        </div>

        <Video type={state.type} watermark={watermark} />
        <div className={styles.type}>
          <span style={{ marginRight: 16 }}>场景样机预览</span>
          <Radio.Group
            value={state.type}
            onChange={e => {
              setState({ type: e.target.value });

              clickActionWeblog('download_002', {
                action_label: e.target.value,
              });
            }}
          >
            <Radio value="default">默认</Radio>
            <Radio value="ShiPinHao">
              <XiuIcon type="icona-shipinhao1" />
              视频号
            </Radio>
            <Radio value="DouYin">
              <XiuIcon type="icondouyin" />
              抖音
            </Radio>
            iconkuaishou
            <Radio value="KuaiShou">
              <XiuIcon type="iconkuaishou" />
              快手
            </Radio>
          </Radio.Group>
          <div>样机仅供预览展示，下载不带样机效果</div>
        </div>
      </div>
    </div>
  );
}
