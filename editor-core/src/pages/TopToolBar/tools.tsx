import { useSize, useThrottle } from 'ahooks';
import {
  useFontWeightByObserver,
  useFontStyleByObserver,
  useWritingModeByObserver,
  useGetCurrentAsset,
  useReplaceStatusByObserver,
  useMaskClipByObserver,
  ungroupModule,
  isModuleType,
  observer,
  groupModule,
  isTempModuleType,
  assetIsEditable,
  assetHasParent,
  isMaskType,
  useShowMattingPic,
  useAniPathEffect,
  useWhirlAnimationObserver,
  useShakeAnimationObserver,
} from '@hc/editor-core';
import { MaskChildAssetType } from '@/kernel/utils/const';

import {
  useBackgroundControl,
  useLayersVisit,
  useAiDubbingModal,
  useAssetReplaceModal,
  useQrCodeEditModal,
} from '@/store/adapter/useGlobalStatus';
import { getRealAsset, clipBoardPasteAsset, pasteAsset } from '@/utils/single';
import { useRemoveAsset } from '@/hooks/useAssetActions';
import { useSetActiveAudio } from '@/store/adapter/useAudioStatus';
import useCanvasPlayHandler from '@/hooks/useCanvasPlayHandler';
import { KEY_PRESS_Tooltip } from '@/config/basicVariable';

import { clickActionWeblog } from '@/utils/webLog';

import { setAssetEditStatus } from '@/utils/assetHandler';
import { useBackgroundSet } from '@/hooks/useBackgroundSet';
import AIModal from '@/pages/SidePanel/AIMusic/AIModal';
import { useCheckLoginStatus } from '@/hooks/loginChecker';

import OpacityController from './OpacityController';

import SelectedFontFamily from './SelectedFontFamily';
import FontSize from './FontSize';
import Typesetting from './Typesetting';
import Flip from './Flip';
import Color, { ColorOptions } from './Color';

import LayerSelect from './LayerSelect';
import VolumeController from './VolumeController';

import ClipMask from './ClipMask';
import SvgColorButton from './SvgColorButton';
import SvgPathColorButton from './SvgPathColorButton';
import FontBackground from './FontBackground';
import FontBackgroundColor from './FontBackground/main';
import FontColor from './FontColor';
import SvgStroke from './SvgStroke';
import AssetPosition from './AssetPosition';

import ToolItem, { ToolsItem } from './ToolItem';
import BackgroundSize from './BackgroundSize';
import SpeedTools from './SpeedTools';
import ToolMore from './ToolMore';
import BackgroundVolume from './BackgroundVolume';
import Matting from './Matting';
import { initCanvasScale } from '../Content/Main/CanvasScale/handler';
import './index.less';

export const Tools = observer(() => {
  const { activeAudio, inCliping } = useSetActiveAudio();
  const asset = useGetCurrentAsset();
  const { backgroundControl, startCliping } = useBackgroundControl();

  const {
    value: aiModal,
    open: openAiModal,
    close: closeAiModal,
  } = useAiDubbingModal();
  const [, setQrCodeVisible] = useQrCodeEditModal();

  const { open: openAssetReplaceModal } = useAssetReplaceModal();

  const { isPlaying } = useCanvasPlayHandler();

  const [writingMode, updateWritingMode] = useWritingModeByObserver(); // 文字方向
  const [fontWeight, updateFontWeight] = useFontWeightByObserver();
  const [fontStyle, updateFontStyle] = useFontStyleByObserver(); // 斜体
  const { handleRemoveAsset } = useRemoveAsset();
  const { checkLoginStatus } = useCheckLoginStatus();
  const { inReplacing, startReplace, endReplace } =
    useReplaceStatusByObserver();

  const { inMask, startMask, cancelMask, endMask, resetMask } =
    useMaskClipByObserver();
  const { backgroundDel, backSize, backgroundAsset } = useBackgroundSet();
  const { open: openLayers } = useLayersVisit();

  const commonShow = asset && assetIsEditable(asset);

  const realAsset = asset ? getRealAsset(asset) : undefined;

  // 是否展示背景调整操作
  const isBackground =
    !activeAudio && !asset && backgroundAsset && !backgroundAsset.meta.locked;

  // 当前选中是否为组件子元素
  const isModuleItem = assetHasParent(asset);
  //  mask类型获取选中元素类型
  const realType = realAsset?.meta?.type;
  const { value } = useShowMattingPic();

  // 工具导航宽度
  const { width } = useSize(
    document.querySelector('#xiudodo-topBar-content') as HTMLDivElement,
  );
  const throttledWidth = useThrottle(width, { wait: 50 }) || 0;

  const isHasMaskChild =
    isMaskType(asset) && asset?.assets && asset?.assets.length > 0;

  // 展示更多工具的起始最小宽度
  const startMinWidth = isModuleItem ? 1000 : 1200;

  const { start: startPathEffect } = useAniPathEffect();
  const { start: startWhirl } = useWhirlAnimationObserver();
  const { start: startShake } = useShakeAnimationObserver();
  // 右侧通用
  const commonTools = [
    {
      key: value ? 'kt002' : 'kt001',
      // name: '抠图',
      hover: true,
      show: commonShow && ['image', 'pic'].includes(realType || '') && !inMask,
      render(props) {
        return (
          <Matting
            key="matting"
            {...props}
            asset={asset}
            resId={realAsset?.attribute?.resId}
            u_file_id={realAsset?.attribute?.ufsId}
          />
        );
      },
    },
    {
      key: 'position',
      name: '调整位置',
      toolTip: '快速设置元素位置',
      // icon: 'icona-bianzu7',
      show: commonShow && !asset?.meta.isOverlay,
      // show: false,
      hover: true,
      minWidth: startMinWidth - 50 * 4,
      // render(props) {
      //   return <AssetPosition key="position" {...props} />;
      // },
      Dropdown: AssetPosition,
    },
    {
      key: 'isDivider1',
      isDivider: true,
    },
    {
      key: 'assetLayer',
      // name: '图层',
      toolTip: '图层',
      icon: 'tucengbeifen',
      show: true,
      hover: true,
      onClick: openLayers,
      // render(props) {
      //   return <LayerModal key="assetLayer" {...props} />;
      // },
    },
    {
      key: 'assetLayerZIndex',
      // name: '图层顺序',
      icon: 'tucengshunxu',
      toolTip: '图层顺序',
      show: commonShow && !isTempModuleType(asset),
      Dropdown: LayerSelect,
      hover: true,
      minWidth: startMinWidth - 50 * 5,
    },
    {
      key: 'asset_opacity',
      // name: '不透明度',
      toolTip: '不透明度',
      hover: true,
      show:
        commonShow &&
        !inMask &&
        !['__module'].includes(String(asset?.meta.type)),
      render(props) {
        return <OpacityController key="asset-opacity" {...props} />;
      },
    },
    {
      key: 'asset_copy',
      // name: '复制',
      toolTip: `拷贝 ${KEY_PRESS_Tooltip.noCopyPaste}`,
      icon: 'copy',
      hover: true,
      show: commonShow && !isTempModuleType(asset) && !inMask,
      minWidth: startMinWidth - 50 * 6,
      onClick(e: Event) {
        pasteAsset({ asset });
      },
    },
    {
      key: 'isDivider2',
      isDivider: true,
    },

    {
      key: 't_b_opacity',
      // name: '不透明度',
      toolTip: '设置背景不透明度',
      hover: true,
      show: isBackground,
      render(props) {
        return (
          <OpacityController key="asset-opacity" isBackground {...props} />
        );
      },
    },

    {
      key: 'video-volume',
      toolTip: '音量',
      hover: true,
      show:
        commonShow &&
        !inMask &&
        (['videoE', 'video'].includes(asset?.meta.type) ||
          (asset?.meta.type === 'mask' &&
            asset.assets &&
            asset.assets.length > 0 &&
            ['videoE', 'video'].includes(asset.assets[0]?.meta.type))),
      render(props) {
        return <VolumeController key="video-volume" {...props} />;
      },
    },
    {
      key: 'asset-lock',
      // name: '锁定',
      toolTip: asset && asset.meta.locked ? '解锁' : '锁定',
      hover: true,
      icon: asset && asset.meta.locked ? 'lock' : 'unlock',
      show: !isTempModuleType(asset) && !inMask && asset,
      onClick() {
        setAssetEditStatus(asset);
      },
    },
    {
      key: 't_b_lock',
      // name: '锁定',
      toolTip:
        backgroundAsset && backgroundAsset.meta.locked
          ? '解锁背景'
          : '锁定背景',
      hover: true,
      icon: backgroundAsset && backgroundAsset.meta.locked ? 'lock' : 'unlock',
      show: !asset && !activeAudio && backgroundAsset,
      onClick() {
        setAssetEditStatus(backgroundAsset);
      },
    },

    {
      key: 't_b_volume',
      toolTip: '背景视频音量',
      hover: true,
      icon: backgroundAsset?.attribute.voiced ? 'volume-small' : 'volume-mute',
      show:
        isBackground && ['video', 'videoE'].includes(backgroundAsset.meta.type),

      Dropdown: BackgroundVolume,
    },

    {
      key: 'asset_delete', // 删除元素
      // name: '删除',
      toolTip: `删除 ${KEY_PRESS_Tooltip.delete}`,
      hover: true,
      icon: 'delete',
      show:
        (commonShow && !(!asset || isTempModuleType(asset) || inMask)) ||
        asset?.meta.isBackground,
      onClick: () => handleRemoveAsset(asset),
    },
    {
      key: 't_b_delete', // 删除元素
      // name: '删除',
      toolTip: '删除背景',
      hover: true,
      icon: 'delete',
      show: isBackground,
      onClick: () => {
        backgroundDel();
      },
    },
  ];
  const tools = [
    {
      key: 'linear-animation',
      name: '路径动画',
      toolTip: '路径动画',
      icon: 'icontime',
      hover: true,
      show: false,
      onClick() {
        startPathEffect();
      },
    },
    {
      key: 'rotate-animation',
      name: '旋转动画',
      toolTip: '旋转动画',
      icon: 'icontime',
      hover: true,
      show: false,
      onClick() {
        startWhirl();
      },
    },
    {
      key: 'shake-animation',
      name: '抖动动画',
      toolTip: '抖动动画',
      icon: 'icontime',
      hover: true,
      show: false,
      onClick() {
        startShake();
      },
    },
    {
      key: 't_b_size',
      name: `${backSize}%`,
      toolTip: '设置背景大小',
      hover: true,
      show: isBackground,
      onClick() {
        initCanvasScale(document.querySelector('.xiudodo-main'));

        setTimeout(() => {
          startCliping();
        }, 100);
      },
    },

    {
      key: 'template_background_color',
      name: '设置背景颜色',
      className: 'showName',
      hover: true,
      show: !asset && !activeAudio,
      // Dropdown: ColorOptions,
      openSidePanel: true,
      render(props) {
        return <Color key="template_background_color" {...props} />;
      },
    },
    {
      key: 't_b_replace',
      className: 'showName',
      name: '替换背景',
      toolTip: '替换背景',
      icon: 'beijingtihuan',
      hover: true,
      show: isBackground,
      onClick: () => {
        openAssetReplaceModal('t_b_replace');
      },
    },

    {
      key: 't_b_add',
      name: '添加背景',
      toolTip: '添加背景',
      icon: 'add-one',
      hover: true,
      className: 'showName',
      show: !asset && !activeAudio && !backgroundAsset,
      onClick: () => openAssetReplaceModal('t_b_add'),
    },
    {
      key: 't_speed',
      name: '倍速',
      toolTip: '设置视频倍速',
      hover: true,
      icon: 'beisu',
      show: !asset,
      Dropdown: SpeedTools,
    },
    {
      key: 't_b_animation',
      icon: 'donghua',
      name: '背景动画',
      toolTip: '设置背景动画',
      className: 'showName',
      active: true,
      hover: true,
      // selected: inReplacing,
      openSidePanel: true,
      show: isBackground,
    },

    {
      key: 'fontFamily',
      name: '字体',
      show: commonShow && asset?.meta.type === 'text',
      openSidePanel: true,
      style: { height: 'inherit', margin: 'auto' },
      render(props) {
        return <SelectedFontFamily key="fontFamily" />;
      },
    },
    {
      key: 'fontSize',
      name: '字体大小',
      show: commonShow && asset?.meta.type === 'text' && !isModuleItem,
      className: 'font-sizeWrap',
      render(props) {
        return (
          <FontSize
            key="fontSize"
            {...props}
            style={{ height: 30, margin: 'auto', padding: 0 }}
          />
        );
      },
    },

    {
      key: 'fontWeight',
      // name: '加粗',
      toolTip: '加粗',
      icon: 'jiacu',
      hover: true,
      active: true,
      show: commonShow && asset?.meta.type === 'text',
      selected: fontWeight === 'bold',
      toolItemStyle: { margin: '5px 1px 5px 4px' },
      onClick: () =>
        updateFontWeight(fontWeight === 'bold' ? 'normal' : 'bold'),
    },
    {
      key: 'fontStyle',
      // name: '斜体',
      toolTip: '倾斜',
      icon: 'xieti',
      toolItemStyle: { margin: '5px 1px' },
      hover: true,
      active: true,
      show: commonShow && asset?.meta.type === 'text',
      selected: fontStyle === 'italic',
      onClick: () =>
        updateFontStyle(fontStyle === 'italic' ? 'normal' : 'italic'),
    },
    {
      key: 'fontWritingMode',
      // name: '方向',
      toolTip: '竖版文字',
      icon: 'wenbenpailie',
      hover: true,
      active: true,
      toolItemStyle: { margin: '5px 1px' },
      show: !isModuleItem && commonShow && asset?.meta.type === 'text',
      onClick: () =>
        updateWritingMode(
          writingMode === 'horizontal-tb' ? 'vertical-rl' : 'horizontal-tb',
        ),
    },
    {
      key: 'fontTypesetting',
      // name: '排版',
      toolTip: '间距/对齐',
      icon: 'duiqi',
      hover: true,
      toolItemStyle: { margin: '5px 1px' },
      show: !isModuleItem && commonShow && asset?.meta.type === 'text',
      Dropdown: Typesetting,
      minWidth: startMinWidth - 50,
    },
    {
      key: 'isDivider3',
      isDivider: true,
      dividerStyle: { marginLeft: '3px' },
    },
    {
      key: 'fontColor',
      // name: '文字颜色',
      // toolTip: '文字颜色',
      // icon: 'zitiyanse',
      active: true,
      hover: true,
      show: commonShow && asset?.meta.type === 'text',
      openSidePanel: true,
      render(props) {
        return <FontColor key="fontColor" {...props} />;
      },
    },
    {
      key: 'text_background_color',
      name: '文字背景',
      hover: true,
      show: commonShow && asset?.meta.type === 'text',
      Dropdown: FontBackgroundColor,
      minWidth: startMinWidth,
      render(props) {
        return <FontBackground key="color" {...props} />;
      },
    },
    {
      key: 'isDivider4',
      isDivider: true,
    },
    {
      key: 'fontEffects',
      toolTip: '字体特效',
      name: '字体特效',
      // icon: 'iconwenzi1',
      active: true,
      hover: true,
      show: commonShow && asset?.meta.type === 'text',
      openSidePanel: true,
      minWidth: startMinWidth - 50 * 3,
    },
    {
      key: 'text-AITool',
      toolTip: '为当前文字添加朗读配音',
      name: '文本朗读',
      icon: 'acoustic',
      hover: true,
      show: commonShow && asset?.meta.type === 'text',
      minWidth: startMinWidth - 50 * 2,
      onClick() {
        clickActionWeblog('quick_bar_001');
        openAiModal();
      },
    },
    {
      key: 'svg-color',
      name: 'svg颜色设置',
      toolTip: '颜色设置',
      hover: true,
      show: commonShow && ['SVG'].includes(asset?.meta.type),
      toolItemStyle: { padding: 0 },
      openSidePanel: true,
      render() {
        return <SvgColorButton />;
      },
    },
    {
      key: 'svg-path-color',
      name: 'svg颜色设置',
      toolTip: '颜色设置',
      hover: true,
      show:
        commonShow &&
        ['svgPath'].includes(asset?.meta.type) &&
        asset?.meta.shapeType !== 'line',
      toolItemStyle: { padding: 0 },
      openSidePanel: true,
      render() {
        return <SvgPathColorButton />;
      },
    },
    {
      key: 'svg-stroke',
      name: 'svg描边',
      toolTip: 'svg描边',
      hover: true,
      show:
        commonShow &&
        ((asset?.meta.type === 'SVG' &&
          asset.attribute?.svgStrokes &&
          asset.attribute?.svgStrokes.length === 1) ||
          asset?.meta.type === 'svgPath'),
      render(props) {
        return <SvgStroke {...props} key="svg-stroke" />;
      },
    },
    {
      key: 'replace',
      icon: 'beijingtihuan',
      name: '替换',
      toolTip: '替换',
      active: true,
      hover: true,
      selected: inReplacing,
      show:
        commonShow &&
        !asset?.meta.isOverlay &&
        !inMask &&
        !['text', 'module', '__module', 'mask', 'qrcode'].includes(
          asset?.meta.type || '',
        ),
      onClick: () => {
        if (!checkLoginStatus()) {
          startReplace();
        }
      },
    },
    {
      key: 'replaceMask',
      icon: isHasMaskChild ? 'beijingtihuan' : 'add-one',
      name: isHasMaskChild ? '替换' : '添加',
      toolTip: isHasMaskChild ? '替换' : '添加',
      active: true,
      hover: true,
      selected: inReplacing,
      show: commonShow && !inMask && isMaskType(asset),
      onClick: () => {
        if (!checkLoginStatus()) {
          startReplace();
        }
      },
    },
    {
      key: 'image-overturn',
      name: '翻转',
      icon: 'switch-contrast',
      toolTip: '翻转',
      hover: true,
      show:
        commonShow &&
        ['image', 'pic', 'lottie', 'SVG', 'mask', 'svgPath', 'videoE'].includes(
          asset?.meta.type || '',
        ) &&
        !inMask,
      Dropdown: Flip,
    },
    {
      key: 't_b_overturn',
      name: '背景翻转',
      icon: 'switch-contrast',
      toolTip: '背景翻转',
      className: 'showName',
      hover: true,
      show: isBackground,
      Dropdown: () => <Flip isBackground />,
    },
    {
      key: 'mask-clip',
      name: '裁剪',
      toolTip: '裁剪',
      icon: 'tailoring',
      hover: true,
      show:
        !isModuleItem &&
        commonShow &&
        !inMask &&
        !asset?.meta.isOverlay &&
        asset &&
        (MaskChildAssetType.includes(asset?.meta.type) ||
          (asset?.meta.type === 'mask' && asset.assets?.length > 0)),
      onClick: () => {
        startMask();
      },
      remark: '蒙版裁剪',
    },
    {
      key: 'asset-mask-clip',
      name: '蒙版裁剪',
      show:
        !isModuleItem &&
        inMask &&
        asset &&
        (MaskChildAssetType.includes(asset?.meta.type) ||
          (asset?.meta.type === 'mask' && asset.assets?.length > 0)),
      render(props) {
        /* 蒙版裁剪图形 */
        return <ClipMask key="asset-mask-clip" {...props} />;
      },
    },
    {
      key: 'asset-mask-cancel',
      name: '取消',
      toolTip: '取消',
      show: inMask,
      hover: true,
      icon: 'close-small',

      onClick() {
        cancelMask();
      },
    },
    {
      key: 'asset-mask-reset',
      name: '重置',
      toolTip: '重置',
      // 是裁剪的数据  && asset?.meta.isClip
      show: inMask,
      hover: true,
      icon: 'zhongzhi',

      onClick() {
        resetMask();
      },
    },
    {
      key: 'asset-mask-ok',
      name: '确定',
      toolTip: '确定',
      show: inMask,
      icon: 'check-small',

      hover: true,
      onClick() {
        endMask();
      },
    },
    {
      key: 'animation',
      name: '动画',
      toolTip: '动画',
      active: true,
      hover: true,
      icon: 'donghua',

      openSidePanel: true,
      show:
        !isModuleItem &&
        commonShow &&
        !inMask &&
        Boolean(
          [
            'image',
            'pic',
            'text',
            'lottie',
            'mask',
            'SVG',
            'videoE',
            'svgPath',
          ].includes(asset?.meta.type || ''),
        ),
    },
    {
      key: 'qrcode',
      name: '二维码设置',
      toolTip: '二维码设置',
      show: commonShow && realAsset?.meta.type === 'qrcode',
      hover: true,
      icon: 'iconerweima',
      onClick() {
        setQrCodeVisible(true);
      },
    },
    {
      key: 'filters',
      name: '滤镜',
      toolTip: '图片滤镜',
      active: true,
      hover: true,
      icon: 'lvjing',
      openSidePanel: true,
      show:
        !isModuleItem &&
        commonShow &&
        !inMask &&
        Boolean(['image', 'pic'].includes(realAsset?.meta.type || '')),
    },
    {
      key: 'filtersAdjust',
      name: '美化', // 滤镜调整
      toolTip: '图片美化',
      active: true,
      hover: true,
      icon: 'iconbeishu',
      openSidePanel: true,
      show:
        !isModuleItem &&
        commonShow &&
        !inMask &&
        Boolean(['image', 'pic'].includes(realAsset?.meta.type || '')),
    },
    // {
    //   key: 'effectLayer',
    //   name: '特效调整', // 特效层调整
    //   toolTip: '特效调整',
    //   active: true,
    //   hover: true,
    //   icon: 'iconbeishu',
    //   openSidePanel: true,
    //   show: realAsset?.meta.type === 'effect',
    // },
    {
      key: 'shadow',
      name: '投影', // 投影调整
      toolTip: '投影',
      active: true,
      hover: true,
      icon: 'huaban1-69j25b54',
      openSidePanel: true,
      show: !isModuleItem && commonShow && !inMask && !asset?.meta.isOverlay,
    },
    {
      key: 'asset_module_group',
      name: '组合',
      toolTip: `组合 ${KEY_PRESS_Tooltip.group}`,
      icon: 'zuhe',
      hover: true,
      show:
        isTempModuleType(asset) &&
        asset?.assets?.every(item => !isModuleType(item)),
      onClick() {
        groupModule();
      },
    },
    {
      key: 'asset_module_ungroup',
      name: '拆分组合',
      toolTip: `拆分组合 ${KEY_PRESS_Tooltip.unGroup}`,
      icon: 'chaifen',
      hover: true,
      show: isModuleType(asset),
      onClick() {
        ungroupModule(asset);
      },
    },
  ];

  return (
    <>
      {!isPlaying && (
        <>
          {backgroundControl.inClipping ? (
            <BackgroundSize />
          ) : (
            <>
              <div className="xiudd-tool-left" id="xiudd-tool-left">
                {tools.map(tool => (
                  <ToolItem
                    key={tool.key}
                    data={tool}
                    type={asset?.meta.type}
                    throttledWidth={throttledWidth}
                  />
                ))}
                <ToolMore
                  data={[...tools, ...commonTools]}
                  throttledWidth={throttledWidth}
                  type={asset?.meta.type}
                  commonShow={commonShow}
                />
              </div>
              <div className="xiudd-tool-right" id="xiudd-tool-right">
                {commonTools.map(tool => (
                  <ToolItem
                    key={tool.key}
                    data={tool}
                    type={asset?.meta.type}
                    throttledWidth={throttledWidth}
                  />
                ))}
              </div>
            </>
          )}

          {/* 元素替换 */}
          {/* <BackgroundReplace /> */}

          {aiModal && <AIModal asset={asset} onClose={closeAiModal} />}
        </>
      )}
    </>
  );
});
