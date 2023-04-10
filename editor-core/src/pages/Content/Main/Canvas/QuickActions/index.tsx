import { CSSProperties, useState } from 'react';

import colorIcon from '@/assets/image/color.png';
import {
  useReplaceStatusByObserver,
  AssetClass,
  useGetCurrentAsset,
  useMaskClipByObserver,
  useVideoEVoicedByObserver,
  useVideoEVolumeByObserver,
  observer,
  assetHasParent,
  setVideoClipTime,
  useRotateStatusByObserver,
  useMoveStatusByObserver,
  getEditAsset,
  isMaskType,
  useActiveAssetLoading,
  assetIsEditable,
} from '@hc/editor-core';

import { stopPropagation } from '@/utils/single';

import { useRemoveAsset } from '@/hooks/useAssetActions';
import VideoClipModal from '@/pages/GlobalMobal/VideoClipModal';
import {
  useDropdownVisible,
  useSettingPanelInfo,
} from '@/store/adapter/useGlobalStatus';
import { clickActionWeblog } from '@/utils/webLog';

// import classNames from 'classnames';
import AssetItemState from '@/kernel/store/assetHandler/asset';
import { useCheckLoginStatus } from '@/hooks/loginChecker';
import { useGetCanvasInfo } from '@/kernel/store';
import FontSize from './Actions/FontSize';
import Color from './Actions/Color';
import StaticButton from './Actions/StaticButton';
import FontWeight from './Actions/FontWeight';

import styles from './index.modules.less';
import { mediaTypes } from './options';
import Volume from './Actions/Volume';
// import { comOptions } from './options';

interface ActionHelperProps {
  asset: AssetClass;
  activeAsset: AssetClass;
  containerSizeScale: { width: number; height: number };
  assetPositionScale: { left: number; top: number };
}

const actionHeight = 32; // 操作栏高度
const actionMargin = 8; // 操作栏距离元素的边距

const ActionHelper = observer(
  ({
    asset,
    activeAsset,
    containerSizeScale,
    assetPositionScale,
  }: ActionHelperProps) => {
    const {
      attribute,
      meta,
      assetTransform,
      // assetPositionScale,
      // containerSizeScale,
      assets,
      // assetAbsolutePositionScale,
    } = asset;
    const isHasMaskChild =
      isMaskType(asset) && asset?.assets && asset?.assets.length > 0;
    const { rotate = 0 } = assetTransform;
    const {
      effectColorful,
      effectVariant,
      startTime,
      endTime,
      rt_url,
      rt_total_time,
      height,
      width,
    } = attribute;

    const { height: tempHeight, scale } = useGetCanvasInfo();
    const canvasHeight = tempHeight * scale;

    const { cst = 0, cet = Math.min(startTime - endTime, rt_total_time) } =
      attribute;

    let top =
      activeAsset.auxiliary.vertical.start - (actionHeight + actionMargin);
    // 位置超出画布顶部时，定位到元素下方
    if (top < 0) {
      top = activeAsset.auxiliary.vertical.end + actionMargin;
    }
    // 位置超出画布底部时，定位到画布顶部
    if (top > canvasHeight - actionHeight) {
      top = 0;
    }

    const isSpecific = effectColorful || effectVariant;

    const style = {
      // ...containerSizeScale,
      left: Math.max(assetPositionScale.left, 0),
      top,
      // ...assetPositionScale,
    };
    // asset.ax
    const { type } = meta;
    // 当前选中是否为组件子元素
    const isModuleItem = assetHasParent(asset);
    const { checkLoginStatus } = useCheckLoginStatus();
    const { startReplace } = useReplaceStatusByObserver();
    const { inMask, startMask } = useMaskClipByObserver();
    const { handleRemoveAsset } = useRemoveAsset();
    const [volume, setVolume] = useVideoEVolumeByObserver();
    const [voiced, setVoiced] = useVideoEVoicedByObserver();

    const { open: openSettingPanel } = useSettingPanelInfo();

    const [clipModal, setClipModal] = useState(false);
    // const {
    //   check,
    //   state: clipInfo,
    //   openClipModal,
    //   closeClipModal,
    // } = useBeforeAddVideo({
    //   data: { ...attribute, duration: attribute.rt_total_time },
    //   meta: { type },
    // });

    const reverseStyle: CSSProperties = {
      top: -40,
      // transform: `rotate(${-rotate}deg)`,
    };

    if (rotate >= 0 && rotate < 180) {
      reverseStyle.transformOrigin = '0% 0%';
    } else if (rotate >= 180 && rotate < 360) {
      reverseStyle.transformOrigin = '100% 0%';
      reverseStyle.right = containerSizeScale.width;
    }

    // const currentComponents = comOptions[type];

    const options = [
      {
        key: 'fontSize',
        show: type === 'text' && !asset?.parent,
        render() {
          return <FontSize key="fontSize" />;
        },
      },
      {
        key: 'color',
        show: type === 'text' && !isSpecific, // 普通文本
        render() {
          return <Color key="color" />;
        },
      },
      {
        key: 'fontColor',
        show: type === 'text' && isSpecific, // 特效字、花字
        text: <img src={colorIcon} alt="colorIcon" width={20} height={20} />,
        onClick: () => {
          openSettingPanel('tool-fontColor');
          clickActionWeblog('QuickActions3');
        },
      },
      {
        key: 'fontWeight',
        show: type === 'text',
        render() {
          return <FontWeight key="fontWeight" />;
        },
      },
      {
        key: 'fontFamily',
        show: type === 'text',
        text: '字体',
        onClick: () => {
          openSettingPanel('tool-fontFamily');
          clickActionWeblog('QuickActions3');
        },
      },
      {
        key: 'fontEffects',
        show: type === 'text' && isSpecific,
        text: '字体特效',
        onClick: () => {
          openSettingPanel('tool-fontEffects');
        },
      },
      {
        key: 'replace',
        // show: ['mask', 'image', 'video', 'videoE'].includes(type),
        show:
          // !inMask &&
          // !['text', 'module', '__module', 'mask'].includes(
          //   asset?.meta.type || '',
          // ),
          [
            'image',
            'video',
            'videoE',
            'pic',
            'SVG',
            'svgPath',
            'lottie',
          ].includes(asset?.meta.type),
        text: '替换',
        iconType: 'beijingtihuan',
        onClick: () => {
          if (!checkLoginStatus()) {
            startReplace();
            const mediaType = mediaTypes[type];
            clickActionWeblog(`QuickActions5_${mediaType}`);
          }
        },
      },
      {
        key: 'replaceMask',
        show: ['mask'].includes(type),
        text: isHasMaskChild ? '替换' : '添加',
        iconType: isHasMaskChild ? 'beijingtihuan' : 'add-one',
        onClick: () => {
          if (!checkLoginStatus()) {
            startReplace();
            const mediaType = mediaTypes[type];
            clickActionWeblog(`QuickActions5_${mediaType}`);
          }
        },
      },
      {
        key: 'animation',
        show: [
          'image',
          'pic',
          'text',
          'lottie',
          'mask',
          'SVG',
          'videoE',
          'svgPath',
        ].includes(type),
        text: '动画',
        iconType: 'donghua',
        onClick: () => {
          openSettingPanel('tool-animation');
          const mediaType = mediaTypes[type];
          clickActionWeblog(`QuickActions4_${mediaType}`);
        },
      },
      {
        key: 'mask-clip',
        show:
          !isModuleItem &&
          !inMask &&
          (['image', 'pic'].includes(type) ||
            (type === 'mask' && assets?.length > 0)),
        iconType: 'tailoring',
        text: '裁剪',
        onClick: () => {
          startMask();
          clickActionWeblog('QuickActions7');
        },
      },
      // {
      //   key: 'clip',
      //   show: ['video', 'videoE'].includes(type),
      //   iconType: 'iconjianji',
      //   text: '视频剪辑',
      //   onClick: () => {
      //     // openClipModal();
      //     setClipModal(true);
      //     clickActionWeblog('QuickActions10');
      //   },
      // },
      {
        key: 'volume',
        show:
          !inMask &&
          !asset?.meta.isOverlay &&
          (['videoE', 'video'].includes(asset?.meta.type) ||
            (asset?.meta.type === 'mask' &&
              asset.assets &&
              asset.assets.length > 0 &&
              ['videoE', 'video'].includes(asset.assets[0]?.meta.type))),
        // iconType: volume ? 'volume-small' : 'volume-mute',
        // text: volume ? '声音' : '静音',
        // onClick: () => {
        //   clickActionWeblog('QuickActions15');
        //   setVoiced(!volume);
        //   setVolume(volume ? 0 : 100);
        // },
        render() {
          return <Volume />;
        },
      },
      {
        key: 'asset_delete',
        show: ['image', 'pic', 'video', 'videoE', 'mask'].includes(type),
        text: '删除',
        iconType: 'delete',
        onClick: () => {
          handleRemoveAsset(asset);
          clickActionWeblog('QuickActions11');
        },
      },
    ];

    const currentOptions = options.filter(t => t.show);

    if (!currentOptions.length) return null;

    return (
      <>
        <div className={styles.ActionHelper} style={{ ...style }}>
          <div
            className={styles.content}
            // style={reverseStyle}
            onMouseDown={stopPropagation}
          >
            <VideoClipModal
              visible={clipModal}
              onCancel={() => setClipModal(false)}
              contentProps={{
                data: {
                  duration: rt_total_time,
                  preview_video: rt_url,
                  cst,
                  cet,
                  height,
                  width,
                },
                actionType: 'cut',
                onOk: cut => {
                  setVideoClipTime({ startTime: cut.cst, endTime: cut.cet });
                  setClipModal(false);
                },
              }}
            />
            {currentOptions.map(record => {
              const { iconType, text, onClick, key } = record;
              if (record.render) {
                return record.render();
              }
              return (
                <StaticButton
                  key={key}
                  text={text}
                  iconType={iconType}
                  onClick={onClick!}
                />
              );
            })}
          </div>
        </div>
      </>
    );
  },
);

function QuickActions() {
  const editAsset = useGetCurrentAsset();
  const activeAsset = getEditAsset() as AssetItemState;
  const { inRotating } = useRotateStatusByObserver();
  const inMoving = useMoveStatusByObserver();
  const { inMask } = useMaskClipByObserver();
  const isLocked = editAsset?.meta.locked;
  const { assetPositionScale, containerSizeScale } = activeAsset || {};
  const { dropdownVisible } = useDropdownVisible();
  const [mattingLoadding] = useActiveAssetLoading(editAsset); // 抠图状态
  const isEditable = assetIsEditable(activeAsset);

  return (
    <>
      {editAsset &&
        activeAsset &&
        isEditable &&
        !inMask &&
        !inRotating &&
        !inMoving &&
        !dropdownVisible &&
        !isLocked &&
        !mattingLoadding && (
          <ActionHelper
            asset={editAsset}
            activeAsset={activeAsset}
            containerSizeScale={containerSizeScale}
            assetPositionScale={assetPositionScale}
          />
        )}
    </>
  );
}

export default observer(QuickActions);
