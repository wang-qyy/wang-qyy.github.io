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
import BackgroundCrop from './BackgroundCrop';

const CanvasHandler = observer(() => (
  <div className="hc-core-canvas-handler">
    <AssetOnHover />
    <AssetOnMove />
    <AssetOnTransform />
    <TextEditor />
    {/* <ImageClipper /> */}
    <MaskClipper />
    <BackgroundCrop />
    <AssetHighlight />
    <MultiSelect />
    <ModuleItemActive />
  </div>
));
export default CanvasHandler;
