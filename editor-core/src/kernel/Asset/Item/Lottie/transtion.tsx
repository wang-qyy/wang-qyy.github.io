import React, { useEffect, useLayoutEffect, useReducer, useRef } from 'react';
import { observer } from 'mobx-react';
import { useSetState } from 'ahooks';
import type { AssetItemProps } from '@kernel/typing';
import Preview from '@AssetCore/Item/Lottie/preview';
import { PlayStatus } from '@kernel/utils/const';
import { toJS } from 'mobx';
import { stringify } from 'qs';
import { LottieHandler, useLottieStyle } from './utils';
// todo 待详细测试
export default observer((props: AssetItemProps) => {
  const { asset, showOnly, videoStatus, canvasInfo, prefix = '' } = props;
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
    cst = 0,
    colors,
    totalTime,
  } = asset.attribute;
  const { lottieWidth = -1 } = lottieHandler.current?.getAnimationData() ?? {};

  const { lottieId, containerStyle, lottieStyle } = useLottieStyle(
    asset,
    canvasInfo,
    showOnly,
    false,
    lottieWidth,
    prefix,
  );

  function onUpdate() {
    if (lottieHandler.current) {
      // 设置动画次数 ---  是否循环播放 lottieLoop==true时设置次数无效
      // if((!lottieReadOnly || isPreviewMovie) && currentTime <= endTime && (lottieLoop || (curLottieTime <= lottieTimes))){
      /* isLoop == false && loopTimes 找出其最后动画结束的时间记录 ---> endLoopTimes */
      const unEnd = currentTime <= endTime;
      const inStart = currentTime >= startTime;

      if (inStart && unEnd) {
        const frameTime = currentTime - startTime + cst;
        lottieHandler.current.play(frameTime, isLoop);
      } else {
        // 清空lottie画面
        lottieHandler.current.play(0, isLoop);
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
        lottieHandler.current.init(rt_url, isLoop, resId, true, asset);
      }
    } catch (e: any) {
      console.log(lottieId, e);
    }
  }, []);
  useLayoutEffect(() => {
    if (lottieHandler.current && rt_lottieLoaded) {
      // @ts-ignore
      lottieHandler.current.replace(rt_url, isLoop, resId, true, asset);
    }
  }, [rt_lottieLoaded, rt_url]);
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
  // 更新lottie播放速度
  useEffect(() => {
    if (lottieHandler.current && rt_lottieLoaded) {
      lottieHandler.current.updateSpeed(asset);
    }
  }, [totalTime]);

  useEffect(() => {
    // 测试更改颜色
    lottieHandler.current?.updateColor(colors, lottieId);
  }, [colors]);
  // 销毁lottie数据
  useEffect(() => {
    return () => {
      lottieHandler.current?.destroy();
    };
  }, []);
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
      />
    </div>
  );
});
