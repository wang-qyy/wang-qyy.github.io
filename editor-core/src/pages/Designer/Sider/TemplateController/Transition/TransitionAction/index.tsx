import { InputNumber, Popover, Slider } from 'antd';
import { useSize } from 'ahooks';
import {
  getCurrentTemplate,
  useTranstionAction,
  observer,
  isLottieType,
} from '@hc/editor-core';
import { RGBAToString } from '@/utils/single';
import CustomColor from '@/pages/Content/Main/Canvas/QuickActions/CustomColor';
import {
  TRANSITION_MAX_DURATION,
  TRANSITION_MIN_DURATION,
} from '@/config/basicVariable';
import styles from './index.less';

const TransitionAction = ({
  itemRef,
  listRef,
}: {
  itemRef: any;
  listRef: any;
}) => {
  const size = useSize(listRef);
  const { updateColor, changeDuration } = useTranstionAction();
  // 当前片段
  const currentTemplate = getCurrentTemplate();
  //   是否是lottie转场
  const hasTransferLottie = isLottieType(currentTemplate.endTransfer);
  const colors = currentTemplate?.endTransfer?.attribute?.colors;
  const duration = currentTemplate?.endTransfer?.attribute.totalTime;
  // 修改转场时长
  const changeTranstionDuration = (val: number) => {
    changeDuration(val);
  };
  const Max = () => {
    if (!hasTransferLottie) {
      return 0;
    }
    if (currentTemplate.pageAttr.pageInfo.offsetTime) {
      return Math.min(
        TRANSITION_MAX_DURATION,
        currentTemplate.pageAttr.pageInfo.pageTime -
          currentTemplate.pageAttr.pageInfo.offsetTime[1] -
          500,
      );
    }
    return Math.min(
      TRANSITION_MAX_DURATION,
      currentTemplate.pageAttr.pageInfo.pageTime - 500,
    );
  };

  const style = {
    width: size.width,
    marginLeft: -itemRef?.current?.offsetLeft + 16,
  };
  if (!hasTransferLottie) {
    return null;
  }
  return (
    <div className={styles.transAction} style={style}>
      <div className={styles.transActionItem}>
        <div className={styles.transActionItemRow}>
          时长
          <InputNumber
            min={TRANSITION_MIN_DURATION}
            max={Max()}
            value={duration}
            className={styles.rowTip}
            formatter={value => {
              return `${Number((value ?? 0) / 1000).toFixed(1)}s`;
            }}
            onChange={val => {
              changeTranstionDuration(val);
            }}
          />
        </div>
        <div className={styles.transActionItemRow} style={{ marginLeft: 5 }}>
          <Slider
            value={duration}
            min={TRANSITION_MIN_DURATION}
            max={Max()}
            tipFormatter={value => {
              return <>{Number((value ?? 0) / 1000).toFixed(1)}s</>;
            }}
            onChange={val => {
              changeTranstionDuration(val);
            }}
          />
        </div>
      </div>
      <div className={styles.transActionItem}>
        <div className={styles.transActionItemRow}>颜色</div>
        {colors &&
          Object.keys(colors).map(item => {
            return (
              <Popover
                destroyTooltipOnHide
                getPopupContainer={ele => ele.parentNode?.parentNode}
                key={item}
                placement="topRight"
                trigger="click"
                // className={styles.ColorPopover}
                //   overlayClassName={styles.ColorPopover}
                content={
                  <CustomColor
                    color={RGBAToString(colors[item])}
                    onChange={res => {
                      updateColor(res.rgb, item);
                    }}
                  />
                }
              >
                <div
                  className={styles.transActionItemRowColor}
                  style={{
                    backgroundColor: RGBAToString(colors[item]),
                  }}
                />
              </Popover>
            );
          })}
      </div>
    </div>
  );
};
export default observer(TransitionAction);
