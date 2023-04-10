import React, { useEffect, useLayoutEffect, useReducer, useRef } from 'react';
import { observer } from 'mobx-react';
import { useSetState } from 'ahooks';
import type { AssetItemProps } from '@kernel/typing';
import Preview from '@AssetCore/Item/Lottie/preview';
import { assetIdPrefix, PlayStatus } from '@kernel/utils/const';
import { LottieHandler, useEditLottieEvent, useLottieStyle } from './utils';
// todo 待详细测试
export default observer((props: AssetItemProps) => {
  const {
    asset,
    showOnly,
    isPreviewMovie,
    videoStatus,
    canvasInfo,
    prefix = '',
  } = props;
  const editablePanelRef = useRef<HTMLDivElement>(null);
  const lottieHandler = useRef<LottieHandler>(null);
  const [state, setState] = useSetState({
    // 当前动画次数  第几次,
    curLottieTime: 1,
    // 设置次数循环次数时，结束次数循环时的时间
    endLoopTimes: 0,
    lottieToEnd: false,
    preview: false,
  });

  const { preview } = state;

  const { currentTime } = videoStatus;
  const {
    startTime = 0,
    endTime = 1000,
    loopTimes = 1,
    isLoop = false,
    textEditor,
    rt_url,
    rt_lottieLoaded,
    resId = -1,
    width,
    height,
  } = asset.attribute;

  const { isTextEditor = false } = asset.meta;
  const lottieReadOnly = showOnly;
  const { lottieWidth = -1 } = lottieHandler.current?.getAnimationData() ?? {};

  const { canEdit, lottieId, containerStyle, lottieStyle, editablePanelStyle } =
    useLottieStyle(asset, canvasInfo, showOnly, false, lottieWidth, prefix);

  function setTextEditor(text: string) {
    const newTextInfo = {
      ...textEditor,
      text: [text],
    };
    asset?.setTextEditor(newTextInfo);
  }

  const {
    blurEditableLottie,
    keyUpEditLottie,
    mouseDownEditLottie,
    keyDownEditLottie,
  } = useEditLottieEvent(editablePanelRef?.current, setTextEditor);

  function onUpdate() {
    if (lottieHandler.current) {
      // 设置动画次数 ---  是否循环播放 lottieLoop==true时设置次数无效
      // if((!lottieReadOnly || isPreviewMovie) && currentTime <= endTime && (lottieLoop || (curLottieTime <= lottieTimes))){
      /* isLoop == false && loopTimes 找出其最后动画结束的时间记录 ---> endLoopTimes */
      const unEnd = currentTime <= endTime;
      const inStart = currentTime >= startTime;

      if (inStart && unEnd) {
        const frameTime = currentTime - startTime;
        lottieHandler.current.play(frameTime, isLoop);
      }

      /* 动画字修改后判断是否需要修改dom */
      if (textEditor) {
        // || isImageEditor
        /* let editorIsSame = this.checkLottieTextIsSame(toolPanel.asset.attribute.textEditor , asset.attribute.textEditor ) ;
        if(!editorIsSame){ //更新dom
            console.log('更新 dom')
        } */
        lottieHandler.current?.OldLottieHandler?.updateTextLottieSvg(
          textEditor,
          width,
          height,
          1,
          asset,
        );
      }
      /* 动画字修改后判断是否需要修改dom */
    }
  }

  function onDomLoaded() {
    onUpdate();
  }

  useLayoutEffect(() => {
    try {
      // @ts-ignore
      lottieHandler.current = new LottieHandler(lottieId, onDomLoaded);
      if (rt_lottieLoaded) {
        lottieHandler.current.init(rt_url, isLoop, resId, false, asset);
      }
    } catch (e: any) {
      console.log(lottieId, e);
    }
  }, []);

  useLayoutEffect(() => {
    if (lottieHandler.current && rt_lottieLoaded) {
      // @ts-ignore
      lottieHandler.current.replace(rt_url, isLoop, resId, false, asset);
    }
  }, [rt_lottieLoaded, rt_url]);

  function editLottie() {
    if (!canEdit) {
      console.log('editLottie');
    }
  }

  /**
   * 选中所有文字
   * @param {*} element
   */
  const selectEditableLottieText = (element: Element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    window?.getSelection()?.removeAllRanges();
    window?.getSelection()?.addRange(range);
  };

  useEffect(() => {
    if (asset?.tempData?.rt_lottiePreview) {
      setState({
        preview: true,
      });
    }
  }, [rt_url]);

  useEffect(() => {
    onUpdate();
  }, [currentTime, width, height]);

  function focusEditLottie() {
    const editablePanelDom = editablePanelRef.current;
    if (editablePanelDom) {
      let tempText: any = [];
      textEditor?.[0].text.forEach((it: string) => {
        tempText.push(
          it
            .replace(/&/g, '&#38;')
            .replace(/</g, '&#60;')
            .replace(/>/g, '&#62;'),
        );
      });
      tempText = tempText
        .join('<br>')
        .replace(/(\s)/g, '&nbsp;')
        .replace(/(&nbsp;&nbsp;)/g, '&nbsp; ');
      editablePanelDom.innerHTML = tempText;
      selectEditableLottieText(editablePanelDom);
      editablePanelDom.focus();
    }
  }

  function replaceLottie() {}

  function previewOver() {
    setState({
      preview: false,
    });
    asset?.setTempData({
      rt_lottiePreview: false,
    });
  }

  const inPlay = videoStatus.playStatus === PlayStatus.Playing;
  const showPreview = !inPlay && !!asset?.tempData?.rt_lottiePreview;
  return (
    <div className="canvas-lottie-container" style={containerStyle}>
      {preview && (
        <Preview asset={asset} visible={showPreview} onPlayOver={previewOver} />
      )}

      <div
        className="canvas-lottie-animation"
        id={lottieId}
        style={{ ...lottieStyle, opacity: !showPreview ? 1 : 0 }}
        onDoubleClick={editLottie}
        data-asset-id={`${assetIdPrefix}${asset.id}`}
      />
      {/* <div className="lottie_show_area"
                    style = {editPanelShowStyle}
                    // onDoubleClick = {((isTextEditor || isImageEditor) && !assetProps.showOnly) ? this.editLottie.bind(this) : ''}
                    ref = {ref => this.lottieTextShowConRef = ref }
                >
                    {editPanelShowText}
                </div> */}
      {canEdit && (
        <div
          className="lottie-editable-panel"
          contentEditable
          onBlur={blurEditableLottie}
          onMouseDown={mouseDownEditLottie}
          onKeyDown={keyDownEditLottie}
          onKeyUp={keyUpEditLottie}
          style={editablePanelStyle}
          ref={editablePanelRef}
        />
      )}
    </div>
  );
});
