import React from 'react';
import { observer } from 'mobx-react';
import AssetOnHover from '@kernel/Canvas/AssetOnHover';
import AssetOnMove from '@kernel/Canvas/AssetOnMove';
import AssetOnTransform from '@kernel/Canvas/AssetOnTransform';
import TextEditor from '@kernel/Canvas/TextEditor';
// import ImageClipper from '@kernel/Canvas/ImageClipper';
import AssetHighlight from '@kernel/Canvas/AssetHighlight';
import MultiSelect from '@kernel/Canvas/MultiSelect';
import ModuleItemActive from '@kernel/Canvas/ModuleItemActive';
import MaskClipper from './MaskClipper';
import CameraSelection from './CameraSelection';
import EditPathAnimation from './EditPathAnimation';
import PathAnimationAsset from './PathAnimationAsset';
import WhirlAnimationWrap from './WhirlAnimation';

const CanvasHandler = observer(() => (
  <div className="hc-core-canvas-handler">
    <AssetOnHover />
    <AssetOnMove />
    <AssetOnTransform />
    <TextEditor />
    {/* <ImageClipper /> */}
    <MaskClipper />
    <AssetHighlight />
    <MultiSelect />
    <ModuleItemActive />
    {/* 镜头交互 */}
    <CameraSelection />

    {/* 停留特效自由打点 */}
    <EditPathAnimation />
    {/* 停留特效选中元素展现操作 */}
    <PathAnimationAsset />
    {/* 旋转动画设置旋转中心 */}
    <WhirlAnimationWrap />
  </div>
));
export default CanvasHandler;
