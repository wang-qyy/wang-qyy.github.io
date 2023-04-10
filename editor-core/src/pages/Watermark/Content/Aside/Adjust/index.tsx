import { message, Popover, Switch } from 'antd';
import { useSetState } from 'ahooks';
import {
  useWatermarkColorByObserver,
  useWatermarkFontSizeByObserver,
  useWatermarkFontFamilyByObserver,
  useWatermarkOpacityByObserver,
  useWatermarkImgSizeByObserver,
  getTemplateWatermark,
  useSetWatermarkPositionByObserver,
  observer,
  toJS,
} from '@hc/editor-core';
import { SketchPicker } from 'react-color';
import ColorPickup from '@/components/ColorPickup';

import { SelectedFontFamily } from '@/pages/TopToolBar/FontFamily';
import colorIcon from '@/assets/image/color.png';
import { dataWatermark } from '@/utils/webLog';

import PositionWarp from '../PositionWarp';
import Sliders from '../Sliders';
import {
  calcImgWatermarkSizeForEditor,
  convertImageSizeToPercent,
  editorPositionForView,
  calcWatermarkPositionForEditor,
} from '../../../handler';

import styles from './index.modules.less';

function Adjust(props: any) {
  const { visible, text, tiledShow } = props;
  const [state, setState] = useSetState({
    colorPopover: false,
    colorPickerSelected: {},
    activeIndex: -1,
  });

  const watermarkInfo = getTemplateWatermark();

  const [fontColor, updateFontColor] = useWatermarkColorByObserver();
  const [fontSize, updateFontSize] = useWatermarkFontSizeByObserver();
  const [fontFamily, updateFontFamily] = useWatermarkFontFamilyByObserver();
  const [opacity, updateOpacity] = useWatermarkOpacityByObserver();
  const [imageSize, updateImageSize] = useWatermarkImgSizeByObserver();

  const [value, setWatermarkPosition] = useSetWatermarkPositionByObserver();
  const position = editorPositionForView(value);

  const isInputValue = () => {
    if (toJS(text) == undefined || toJS(text)[0] == '') {
      message.warning('请输入水印内容');
    }
  };

  // console.log('watermarkColor', watermarkColor);
  const handleSetWatermarkSize = (size: number) => {
    if (watermarkInfo?.meta.type === 'text') {
      // 文字水印大小
      // setFontSize(size);
      updateFontSize(size);
    } else {
      // 图片水印大小
      updateImageSize(calcImgWatermarkSizeForEditor(size));
      setWatermarkPosition(calcWatermarkPositionForEditor(position));
    }
  };

  function getWatermarkSize() {
    let watermarkSize = 0;

    if (watermarkInfo?.meta) {
      if (watermarkInfo?.meta.type === 'text') {
        watermarkSize = fontSize;
      } else {
        watermarkSize = convertImageSizeToPercent(imageSize);
      }
    }

    return watermarkSize;
  }

  // 图片平铺
  function onChange(checked: boolean) {
    console.log(`switch to ${checked}`);
  }

  return (
    <div hidden={!visible}>
      <div
        hidden={watermarkInfo?.meta?.type === 'image'}
        className={styles.textStyles}
      >
        <SelectedFontFamily
          fontFamilyListStyle={{ width: '294px', height: '40vh' }}
          fontFamily={fontFamily}
          onChange={fontFamily => {
            isInputValue();
            updateFontFamily(fontFamily);
            dataWatermark('VideoWmEdit', 'fontFamily');
          }}
        />
        <div className={styles.fontcolor}>
          <Popover
            visible={state.colorPopover}
            trigger="click"
            placement="rightBottom"
            overlayClassName="color-picker"
            onVisibleChange={visible => {
              isInputValue();
              if (text) {
                setState({ colorPopover: visible });
                if (visible) {
                  dataWatermark('VideoWmEdit', 'color');
                }
              }
            }}
            getTooltipContainer={trigger => trigger.parentNode as HTMLElement}
            content={
              <div style={{ width: '270px', padding: '10px' }}>
                <ColorPickup
                  color={fontColor}
                  onChange={(color: { rgb: {} }) => {
                    updateFontColor(color.rgb);
                  }}
                />
              </div>
            }
          >
            <div className={styles.fontcolorIcon}>
              <img src={colorIcon} alt="colorIcon" width={30} height={36} />
              <div className={styles.toolsVipCard}>VIP</div>
            </div>
          </Popover>
        </div>
      </div>
      {tiledShow && (
        <div className={styles.tiled}>
          <div className={styles.left}>图片平铺</div>
          <div className={styles.right}>
            <Switch defaultChecked onChange={onChange} />
          </div>
        </div>
      )}

      <Sliders
        title="不透明度"
        min={0}
        num={opacity || 0}
        bindChange={(opacity: number) => {
          updateOpacity(opacity);
        }}
        onAfterChange={() => {
          dataWatermark('VideoWmEdit', 'opacity');
        }}
      />

      <Sliders
        title="水印大小"
        num={getWatermarkSize()}
        bindChange={(size: number) => {
          handleSetWatermarkSize(size);
        }}
        onAfterChange={() => {
          dataWatermark('VideoWmEdit', 'size');
        }}
        min={25}
      />

      <div className={styles.watermarkPosition}>
        <div className={styles.watermarkname}>水印位置</div>
        <PositionWarp />
      </div>
    </div>
  );
}

export default observer(Adjust);
