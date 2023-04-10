import {
  useSetTemplateBackgroundColorByObserver,
  toJS,
  pauseVideo,
  observer,
} from '@hc/editor-core';
import { CirclePicker, ChromePicker } from 'react-color';
import OverwritePopover from '@/components/OverwritePopover';
import { useState, useEffect } from 'react';
import { useThrottleFn, useSessionStorageState } from 'ahooks';
import Caihong from '@/assets/image/colorIcon.png';
import { RGBAToString } from '@/utils/single';
import styles from './index.less';

const Color = (props: any) => {
  const [historyColor = [], setHistoryColor] = useSessionStorageState(
    'XIUDODO_BACKGROUND_COLOR',
  );
  const [chooseColor, setChooseColor] = useState({});
  const { backgroundColor } = useSetTemplateBackgroundColorByObserver();
  const [visible, setVisible] = useState(false);
  const [list, setList] = useState([]);
  useEffect(() => {
    if (historyColor.length > 0) {
      let historyColorList = JSON.parse(JSON.stringify(historyColor));
      if (historyColorList.length > 5) {
        historyColorList = historyColorList.slice(-5);
      }
      setList(historyColorList);
    }
  }, [historyColor]);
  const { run: onChange } = useThrottleFn(
    color => {
      pauseVideo();
      props?.changedColor(color);
    },
    { wait: 200 },
  );

  return (
    <OverwritePopover
      visible={visible}
      trigger="click"
      onVisibleChange={vis => {
        setVisible(false);
        if (chooseColor?.r) {
          setHistoryColor([...historyColor, RGBAToString(chooseColor)]);
        }
        setChooseColor({});
      }}
      overlayInnerStyle={{ marginTop: 30, marginLeft: 10 }}
      content={
        <ChromePicker
          width={200}
          color={toJS(backgroundColor)}
          onChange={(color: { rgb: {} }) => {
            onChange(color.rgb);
            setChooseColor(color.rgb);
          }}
        />
      }
    >
      <div className={styles.toolColorView}>
        <div className={styles.toolColorViewItem}>
          <p
            onClick={() => {
              setVisible(false);
              if (chooseColor?.r) {
                setHistoryColor([...historyColor, RGBAToString(chooseColor)]);
              }
              setChooseColor({});
            }}
          >
            背景颜色
          </p>
          <div className={styles.toolColorViewItemView}>
            <div
              className={styles.caihong}
              onClick={e => {
                e.stopPropagation();
                setVisible(true);
                setChooseColor({});
              }}
            >
              <img src={Caihong} alt="" />
            </div>
            <CirclePicker
              circleSize={20}
              onChange={(color: { rgb: {} }) => {
                onChange(color.rgb);
              }}
              colors={list}
            />
          </div>
        </div>
        <div className={styles.toolColorViewItem}>
          <p>预设颜色</p>
          <CirclePicker
            circleSize={20}
            onChange={(color: { rgb: {} }) => {
              onChange(color.rgb);
            }}
            colors={[
              '#98C2EC',
              '#A0DD9E',
              '#F7E7A2',
              '#F7C098',
              '#F6A4A4',
              '#BBA5E1',
              '#3385D9',
              '#42BB3F',
              '#F1D044',
              '#EE8034',
              '#EE4949',
              '#774BC4',
              '#FFFFFF',
              '#C7C7C7',
              '#969696',
              '#5F5F5F',
              '#3B3B3B',
              '#000000',
            ]}
          />
        </div>
      </div>
    </OverwritePopover>
  );
};
export default observer(Color);
