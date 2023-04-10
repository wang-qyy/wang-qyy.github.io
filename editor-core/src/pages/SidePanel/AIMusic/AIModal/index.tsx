import { PropsWithChildren, useEffect, useState } from 'react';
import { useUpdateEffect } from 'ahooks';
import { Input, Spin, Button, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import {
  getAbsoluteCurrentTime,
  useAllTemplateVideoTimeByObserver,
  AssetClass,
  getCurrentTemplateIndex,
  getTemplateTimeScale,
} from '@hc/editor-core';
import { uploadAiAudio, getAudioInfo } from '@/api/music';
import { useSetMusic } from '@/hooks/useSetMusic';
import NoTitleModal from '@/components/NoTitleModal';
import { stopPropagation } from '@/utils/single';
import { clickActionWeblog } from '@/utils/webLog';
import {
  useRechargeModal,
  useUserLoginModal,
  useUserBindPhoneModal,
} from '@/store/adapter/useGlobalStatus';

import { getUserInfo, useUserInfo } from '@/store/adapter/useUserInfo';
import { WarnModal } from '@/components/WarnModal';

import AWSC from '@/components/AWSC';
import RoleList from './RoleList';
import SliderInput from './SliderInput';
import AIItemSpecial from '../component/AIItem/specialIndex';

import './index.less';

const { TextArea } = Input;
interface AIModalProps {
  // 回调
  onChange?: (sign: boolean) => void;
  onClose?: () => void;
  asset?: AssetClass;
}
// AI文字转语音 弹窗
const AIModal = (props: PropsWithChildren<AIModalProps>) => {
  const { asset, onChange, onClose } = props;

  const { open: openRechargeModal } = useRechargeModal();
  const { showLoginModal } = useUserLoginModal();
  const userInfo = useUserInfo();
  const { showBindPhoneModal } = useUserBindPhoneModal();

  const [visible, setVisible] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [audioInfo, setAudioInfo] = useState();
  const initText = () => {
    let assText: string[] | undefined;
    if (asset) {
      assText = asset?.attribute.text;
      if (assText instanceof Array) {
        return (assText || []).join('');
      }
    }
    return '';
  };
  // 转化的文字
  const [text, setText] = useState(initText);
  // 音量
  const [volume, setVolume] = useState(50);
  // 语速
  const [rate, setRate] = useState(1);
  const [AWSCvisible, setAWSCvisible] = useState(false);

  // 下载次数
  const [count, setCount] = useState(0);
  // 是否vip
  const [isVip, setIsVip] = useState(false);

  // 角色
  const [role, setRole] = useState('xiaoyun');
  const [activeKey, setActiveKey] = useState('通用');
  const { bindAddAudio } = useSetMusic();
  // 监听用户是否输入过
  const [isInput, setIsInput] = useState(false);
  const [videoTotalTime] = useAllTemplateVideoTimeByObserver();
  // 添加录音
  const add = (data: any) => {
    const startTime = asset
      ? asset.assetDuration.startTime +
      getTemplateTimeScale()[getCurrentTemplateIndex()][0]
      : getAbsoluteCurrentTime();
    const endTime = startTime + data.ai_audio.total_time;

    const obj = {
      rt_title: data.ai_audio.text,
      resId: data.audio_info.id,
      type: 2, // bgm:1  其他配乐:2
      rt_url: data.audio_url,
      // 音频出入场时间
      startTime,
      endTime: endTime > videoTotalTime ? videoTotalTime : endTime,
      volume: data.ai_audio.volume,
      isLoop: false,
      // 音频时长
      rt_duration: data.ai_audio.total_time,
      rt_sourceType: 2,
    };
    bindAddAudio(obj);
  };

  // 打开充值提醒
  const openWarnModal = (isVip: number) => {
    if (isVip === 1) {
      WarnModal({
        title: '当前套餐AI语音次数已用完!',
        content: '继续使用?需要升级会员套餐',
        button: '升级会员',
        onOk: () => {
          openRechargeModal();
        },
        onCancel: () => { },
        width: 375,
      });
    } else {
      WarnModal({
        title: '普通用户赠送次数已用完',
        content: '继续使用?升级成秀多多会员!',
        button: '充值会员',
        onOk: () => {
          openRechargeModal();
        },
        onCancel: () => { },
        width: 375,
      });
    }
  };
  /**
   * 合成录音
   * */
  const syntheticRecord = async (type: string, params = null) => {
    // 是否是汉字  ----前端暂时不校验
    // const reg = /[\u4e00-\u9fa5]/g;
    // if (activeKey === '英文') {
    //   if (reg.test(text)) {
    //     message.info('只能输入英文');
    //     return false;
    //   }
    // }

    if (!(userInfo && userInfo?.id > 0)) {
      showLoginModal();
      return;
    }
    if (getUserInfo()?.bind_phone !== 1) {
      showBindPhoneModal();
      return;
    }
    if (role && text && volume) {
      setSpinning(true);
      const param = params
        ? {
          type,
          text,
          voice_key: role,
          speed: rate,
          volume,
          nc_sessionId: params?.sessionId,
          nc_sig: params?.sig,
          nc_token: params?.token,
        }
        : {
          type,
          text,
          voice_key: role,
          speed: rate,
          volume,
        };

      const res = await uploadAiAudio(param);

      if (res.code === 0 && res.data) {
        setAudioInfo({
          id: role,
          total_time: res.data.ai_audio.total_time / 1000,
          preview: res.data.audio_url,
        });
        if (type === '1') {
          // 成功生成AI配音 -埋点
          clickActionWeblog('ai_audio_002', { action_label: role });
          if (asset) {
            add(res.data);
          }
          // 回调
          onChange && onChange(true);
          setVisible(false);
          onClose && onClose();
        }
      } else if (res.code === 1005 && res.data.next === 'open_pay') {
        // ai 语音权益用完 充值升级
        openWarnModal(res.data.is_vip);
      } else if (res?.code === 1005 && res?.data?.next === 'displayNC') {
        setAWSCvisible(true);
        setSpinning(false);
        return;
      } else if (res.data?.next === 'contentBlock') {
        message.error('系统检测当前文本存在违规嫌疑');
      } else {
        message.error(res.msg);
      }
      setSpinning(false);
    }
  };

  // 获取剩余下载次数 是否vip
  const bindAudioInfo = () => {
    getAudioInfo().then(res => {
      if (res.code === 0) {
        const count =
          res.data?.today_value == -1 ? '无限' : res.data?.today_value;
        setCount(count);
        setIsVip(res.data?.is_vip === 1);
      }
    });
  };

  useEffect(() => {
    const dom = document.querySelector('.ai-modal') as HTMLInputElement;
    bindAudioInfo();
    if (dom) {
      dom.focus();
    }
  }, []);

  useUpdateEffect(() => {
    // 文本框输入过文字 埋点
    clickActionWeblog('ai_audio_006');
  }, [isInput]);

  return (
    <NoTitleModal
      visible={visible}
      onCancel={() => {
        setVisible(false);
        onClose && onClose();
      }}
      footer={false}
      width={716}
      centered
      closeIcon={<CloseOutlined style={{ color: 'rgba(72, 78, 95, 1)' }} />}
      zIndex={999}
    >
      <Spin tip="正在合成语音" spinning={spinning}>
        <div className="ai-modal" tabIndex={1} onKeyDown={stopPropagation}>
          <div className="ai-modal-title">文字转语音</div>
          {asset ? (
            <div className="ai-modal-name">{text}</div>
          ) : (
            <div className="ai-modal-input">
              <TextArea
                rows={2}
                placeholder="输入你需要转化的文字"
                maxLength={300}
                value={text}
                onCopy={stopPropagation}
                onPaste={stopPropagation}
                onChange={e => {
                  setIsInput(true);
                  setAudioInfo();
                  setText(e.target.value);
                }}
                showCount={{
                  formatter: (args: { count: number; maxLength?: number }) => {
                    return `你还可以输入${args.maxLength - args.count}字`;
                  },
                }}
              />
            </div>
          )}
          <div className="ai-modal-row">
            <span>选择角色：</span>
            <RoleList
              role={role}
              onSelect={val => {
                setAudioInfo();
                setRole(val.role);
                setActiveKey(val.roleType);
              }}
            />
          </div>
          <div className="ai-modal-row">
            <span>音量：</span>
            <SliderInput
              onChange={val => {
                setAudioInfo();
                setVolume(val);
              }}
              value={volume}
              min={1}
              step={1}
              max={100}
            />
          </div>
          <div className="ai-modal-row">
            <span>语速：</span>
            <SliderInput
              onChange={val => {
                setAudioInfo();
                setRate(val);
              }}
              value={rate}
              min={0.5}
              step={0.1}
              max={2}
            />
          </div>

          <div
            className={`ai-modal-row noWrap ${text || asset ? '' : 'opcity45'}`}
          >
            {/* <div className="row-title-tip">限免</div> */}
            <span>试听：</span>
            <AIItemSpecial
              className="row-AI"
              disabled={!(text || asset)}
              playing
              data={audioInfo}
              onClick={() => {
                // 点击试听埋点
                clickActionWeblog('ai_audio_007');
                syntheticRecord('0');
              }}
            />
          </div>
          {userInfo?.id > 0 && (
            <div className="ai-modal-text">
              {isVip
                ? `今日AI语音应用次数 还剩`
                : `当前赠送AI语音应用次数 还剩`}
              <span>{count}</span>次
            </div>
          )}
          <Button
            type="primary"
            className={`ai-modal-button ${text || asset ? '' : 'opcity45'}`}
            onClick={() => {
              syntheticRecord('1');
              // 点击确认应用 埋点
              clickActionWeblog('ai_audio_008');
            }}
          >
            确定应用
          </Button>
        </div>
        {AWSCvisible && (
          <AWSC
            visible={AWSCvisible}
            setVisible={setAWSCvisible}
            onSuccess={data => {
              setAWSCvisible(false);
              syntheticRecord('0', data);
            }}
          />
        )}
      </Spin>
    </NoTitleModal>
  );
};
export default AIModal;
