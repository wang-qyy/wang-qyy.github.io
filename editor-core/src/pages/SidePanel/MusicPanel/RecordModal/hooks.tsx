import React, { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import Recorder from 'js-audio-recorder';
import { useAudioUpload } from '@/hooks/useUploadAudio';
import { useRequest, useUnmount } from 'ahooks';
import { clickActionWeblog } from '@/utils/webLog';
import { getRecorderFolder } from '@/api/upload';
import styles from './index.less';
import { formatTimes, getNowFormatDate } from './util';

const recorder = new Recorder({
  sampleBits: 16,
  sampleRate: 16000,
  numChannels: 1,
  compiling: false,
});
// 状态map
const statusList = {
  ready: {
    name: '准备中',
    showTxt: '点击按钮录音',
    className: '',
    icon: 'luyin',
  },
  countDown: {
    name: '倒计时中',
    showTxt: '倒计时准备',
    className: '',
    icon: 'luyin',
  },
  recording: {
    name: '录音中',
    showTxt: '录音中…',
    className: styles.soundButtomRed,
    icon: 'icontuoyuanxing',
  },
  recorded: {
    name: '录音结束，待保存状态',
    showTxt: '',
    className: '',
    icon: 'iconbofang',
  },
  saved: {
    name: '保存结束',
    showTxt: '点击试听',
    className: '',
    icon: 'iconbofang',
  },
  uploading: {
    name: '上传中',
    showTxt: '上传中',
    className: '',
    icon: 'iconbofang',
  },
};
const useAudioRecorder = (onChange: () => void) => {
  const maxLength = 600;
  const [status, setStatus] = useState('ready');
  const statusInfo = useRef(statusList.ready);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [folder, setFolder] = useState('');
  // 获取我的录音文件夹
  useRequest(getRecorderFolder, {
    onSuccess: res => {
      setFolder(res.folder_id);
    },
  });
  const playRef = useRef();
  // 当前播放的时间
  const [currentTime, setCurrentTime] = useState(0);

  // 录音结束
  function recorderOver() {
    recorder.stop();
    setTime(parseInt(recorder.duration));
  }
  const { uploadStatRecorder } = useAudioUpload({
    setProgress: (progress: number) => {
      setProgress(progress);
    },
    onSucceed: (data: any) => {
      if (data.code === 0) {
        // 回调
        onChange && onChange();
        message.info('上传完毕!');
        setProgress(100);
        // 成功录音 埋点
        clickActionWeblog('mike_audio_003');
      }
    },
    onError: (err: any) => {
      message.error(err.msg);
    },
  });
  function uploadRecorderData() {
    const fileName = `录音${getNowFormatDate()}.mp3`;
    setFileName(fileName);
    uploadStatRecorder(recorder.getWAVBlob(), fileName, folder, 'recording');
    recorder.destroy();
  }
  // 保存当前录音
  const saveAudio = () => {
    // 结束录音 进入保存状态
    setStatus('saved');
    statusInfo.current = statusList.saved;
  };
  // 结束倒计时，开始录制
  const beginAudio = () => {
    setStatus('recording');
    statusInfo.current = statusList.recording;
    recorder.start();
  };
  // 重新录制
  const reset = () => {
    // 销毁之前的录制
    recorder.destroy();
    setTime(0);
    setStatus('countDown');
    statusInfo.current = statusList.countDown;
  };
  // 变更当前状态
  const changeStatus = (callBack?: () => void) => {
    switch (status) {
      case 'ready':
        setStatus('countDown');
        statusInfo.current = statusList.countDown;
        callBack && callBack();
        break;
      case 'countDown': {
        // 开始录音
        beginAudio();
        break;
      }
      case 'recording':
        // 结束录音
        setStatus('recorded');
        statusInfo.current = statusList.recorded;
        recorderOver();
        break;
      case 'recorded': {
        // 结束录音 试听 非后台录音，仅录音文件
        recorder.play();
        break;
      }
      case 'saved': {
        // 上传数据
        uploadRecorderData();
        setStatus('uploading');
        // 关闭弹窗
        break;
      }
    }
  };
  // 播放录音
  const playRecorder = () => {
    setIsPlaying(!isPlaying);
    clearInterval(playRef.current);
    if (isPlaying) {
      recorder.stopPlay();
    } else {
      recorder.play();
      playRef.current = setInterval(() => {
        setCurrentTime(t => t + 1);
      }, 1000);
    }
  };
  // 销毁录音
  const destroy = () => {
    recorder.destroy();
    clearInterval();
  };
  recorder.onprogress = function (params) {
    const duration = parseInt(params.duration);
    if (duration <= maxLength) {
      setTime(duration);
    }
  };
  useEffect(() => {
    // 当前时间超过录音总时长 结束播放
    if (currentTime > time) {
      clearInterval(playRef.current);
      setCurrentTime(0);
      recorder.stopPlay();
      setIsPlaying(false);
    }
  }, [currentTime]);

  return {
    time,
    currentTime,
    progress,
    formatCurrentTime: formatTimes(currentTime),
    formatTime: formatTimes(time),
    fileName,
    isPlaying,
    status,
    statusInfo: statusInfo.current,
    setStatus,
    changeStatus,
    beginAudio,
    saveAudio,
    reset,
    playRecorder,
    destroy,
  };
};
export default useAudioRecorder;
