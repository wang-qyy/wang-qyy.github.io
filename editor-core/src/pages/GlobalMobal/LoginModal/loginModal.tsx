import React, { memo, useEffect, useRef, useState } from 'react';

import { useRequest, useCountDown } from 'ahooks';
import { message } from 'antd';
import classnames from 'classnames';
import { stopPropagation } from '@/utils/single';
import XiuIcon from '@/components/XiuIcon';
import { clickActionWeblog } from '@/utils/webLog';

import {
  getWeChatQrcode,
  qqLogin,
  checkWechatLoginStatus,
  wechatOfficialLogin,
  sendTelLoginCode,
  telLoginCallback,
  getUserInfo,
} from '@/api/user';

import './index.less';

const loginTypeList = [
  {
    type: 'qq',
    id: 'qq_refer',
    className: 'qq-login-logo',
    icon: 'iconQQ',
    text: 'QQ登录',
  },
  {
    type: 'phone',
    id: 'tel-login',
    className: 'tel-login-logo',
    icon: 'iconzu22',
    text: '手机登录',
  },
  {
    type: 'wx',
    id: 'wx-login',
    className: 'wx-login-logo',
    icon: 'iconzu30',
    text: '微信登录',
  },
];

export interface LoginPanelProps {
  loginCallback: (status: boolean, userInfo: any) => void;
  closeLoginModal: () => void;
}

function LoginPanel({ loginCallback, closeLoginModal }: LoginPanelProps) {
  const telNumber = useRef<HTMLInputElement>(null);
  const checkNumber = useRef<HTMLInputElement>(null);
  const [state, setState] = useState({
    loginType: 'wx',
    weChatLoginQrcodeSrc: '',
    weChatNumber: '',
    linkExtraStr: '',
    isInvalid: false,
    loginError: '',
    phoneSendDisabled: false,
  });

  const [countdown, setTargetDate] = useCountDown({
    onEnd: () => {
      setState(prev => ({
        ...prev,
        phoneSendDisabled: false,
      }));
    },
  });

  const fetchUserInfo = useRequest(getUserInfo, {
    manual: true,
    pollingInterval: 1000,
    onSuccess: userInfo => {
      if (userInfo.id > 0) {
        fetchUserInfo.cancel();
        message.success('登录成功！');
        closeLoginModal();
        loginCallback(true, userInfo);
      }
    },
  });

  const {
    loginType,
    weChatNumber,
    linkExtraStr,
    phoneSendDisabled,
    weChatLoginQrcodeSrc,
    loginError,
    isInvalid,
  } = state;

  function checkLoginStatus() {
    fetchUserInfo.run();
  }

  const fetchWechatOfficialLogin = useRequest(wechatOfficialLogin, {
    manual: true,
    onSuccess: () => {
      checkLoginStatus();
    },
  });

  const checkWechatLogin = useRequest(checkWechatLoginStatus, {
    manual: true,
    pollingInterval: 1000,
    onSuccess: resultData => {
      if (resultData.msg === 'invalid' || resultData.msg === 'expired') {
        checkWechatLogin.cancel();
        setState(prev => ({
          ...prev,
          isInvalid: true,
        }));
      }
      if (resultData.stat === 1) {
        checkWechatLogin.cancel();
        fetchWechatOfficialLogin.run({ weChatNumber, login_page: '' });
        // const urlProps = getProps();
        // fetchWechatOfficialLogin.run({
        //   weChatNumber,
        //   login_page: urlProps.isClientSide
        //     ? 'win_movie&isClientSide=1'
        //     : 'movie',
        // });
      }
    },
  });
  const weChatQrcode = useRequest(getWeChatQrcode, {
    manual: true,
    onSuccess: res => {
      const { stat, msg } = res;
      if (stat === 1) {
        setState(prev => ({
          ...prev,
          weChatNumber: msg.number,
          weChatLoginQrcodeSrc: msg.Qrcode,
          isInvalid: false,
        }));
        checkWechatLogin.run(msg.number);
      }
    },
  });

  const telLoginCode = useRequest(sendTelLoginCode, {
    manual: true,
    onSuccess: res => {
      const { stat, msg } = res;
      if (stat === 1) {
        setState(prev => ({
          ...prev,
          loginError: '',
          phoneSendDisabled: true,
        }));
        setTargetDate(Date.now() + 60000);
      } else {
        setState(prev => ({ ...prev, loginError: msg }));
      }
    },
  });
  const telLogin = useRequest(telLoginCallback, {
    manual: true,
    onSuccess: res => {
      const { stat, msg } = res;
      if (stat === 1) {
        setState(prev => ({ ...prev, loginError: '' }));
        checkLoginStatus();
      } else {
        setState(prev => ({
          ...prev,
          loginError: msg,
        }));
      }
    },
  });

  function qqReferClickEvent() {
    window.open(
      qqLogin(linkExtraStr),
      '',
      'width=750, height=500, top=50, left=50',
    );
    checkLoginStatus();
  }

  function clickTelLoginCode() {
    if (!telNumber.current) {
      return;
    }
    const { value = '' } = telNumber.current;
    if (value === '' || !/^1[3456789]\d{9}$/.test(value)) {
      setState(prev => ({ ...prev, loginError: '请输入正确的手机号' }));
      return;
    }
    setState(prev => ({ ...prev, loginError: '' }));
    telLoginCode.run(value);
  }

  function clickTelLogin() {
    if (!telNumber.current || !checkNumber.current) {
      return;
    }
    const { value: phoneNum } = telNumber.current;
    const { value: phoneMsgNum } = checkNumber.current;
    if (phoneNum === '' || !/^1[3456789]\d{9}$/.test(phoneNum)) {
      setState(prev => ({ ...prev, loginError: '请输入正确的手机号' }));
      return;
    }
    if (phoneMsgNum === '') {
      setState(prev => ({ ...prev, loginError: '请输入正确的手机验证码' }));
      return;
    }
    setState(prev => ({ ...prev, loginError: '' }));
    telLogin.run({ phoneNum, phoneMsgNum });
  }

  function resMaskClickEvent() {
    setState(prev => ({ ...prev, weChatNumber: '', weChatLoginQrcodeSrc: '' }));
    weChatQrcode.run(linkExtraStr);
  }

  function changeLoginType(typeName: string) {
    if (['wx', 'qq'].includes(typeName)) {
      resMaskClickEvent();
    } else {
      checkWechatLogin.cancel();
    }
    if (typeName === 'qq') {
      qqReferClickEvent();
    } else {
      setState(prev => ({ ...prev, loginType: typeName }));
    }
  }

  function onKeyDown(e: any) {
    stopPropagation(e);
    if (e.keyCode === 13) {
      clickTelLoginCode();
    }
  }

  useEffect(() => {
    clickActionWeblog('login');
    weChatQrcode.run(linkExtraStr);
    setState(prev => ({ ...prev, linkExtraStr }));
  }, []);

  const qrcodeMask = classnames({
    'res-qrcode-box': true,
    'show-mask': isInvalid,
  });
  return (
    <div className="registration modal_dialog">
      <div className="reg-content-left">
        <div className="reg-slogan">
          <h2>
            秀多多 <div className="h2Label">正版授权 可商用</div>
          </h2>
          <p>人人都会用的</p>
          <p>在线视频编辑神器</p>
        </div>
        <div className="reg-tips">
          <p>
            <i className="i-check-mark" />
            <span>海量视频 在线编辑</span>
          </p>
          <p>
            <i className="i-check-mark" />
            <span>百万素材 助力创作</span>
          </p>
          <p>
            <i className="i-check-mark" />
            <span>云端同步 我的设计</span>
          </p>
          <p>
            <i className="i-check-mark" />
            <span>商用授权 安心无忧</span>
          </p>
          <p>
            <i className="i-check-mark" />
            <span>免费下载 登录即享</span>
          </p>
        </div>
      </div>
      <div className="reg-content">
        <div
          id="res-wechat-login"
          style={{ display: loginType === 'wx' ? '' : 'none' }}
        >
          <div className="tel-login-title">
            <span>微信扫码立即登录</span>
          </div>
          <div className="res-head-tip">仅需1步 轻松登录</div>
          <div className="logo-character" />
          <div className={qrcodeMask}>
            <div className="res-mask" onClick={resMaskClickEvent}>
              二维码失效
              <br />
              请点击刷新
            </div>
            {weChatLoginQrcodeSrc === '' ? (
              <img
                alt="wechat"
                className="wx-sys"
                src="//js.xiudodo.com/index_img/pay/wx-sys.gif"
              />
            ) : (
              <img
                alt="wechat"
                id="wx_refer"
                src={weChatLoginQrcodeSrc}
                onClick={resMaskClickEvent}
                className="res-qrcode"
              />
            )}
          </div>
          <p id="login_account_tip">
            <span>微信和QQ是两个独立账号，账号信息不互通</span>
          </p>
        </div>

        <div
          id="tel-login-box"
          style={{ display: loginType === 'phone' ? '' : 'none' }}
        >
          <div className="tel-login-title">
            <span>手机验证码登录</span>
          </div>
          <div className="tel-login-input-area">
            <input
              ref={telNumber}
              onKeyDown={onKeyDown}
              type="tel"
              className="tel-login-number"
              placeholder="请输入手机号"
            />
            <div className="tel-login-send-code">
              <input
                onKeyDown={stopPropagation}
                ref={checkNumber}
                type="tel"
                className="tel-login-tel-code"
                placeholder="短信验证码"
              />
              {phoneSendDisabled ? (
                <span className={phoneSendDisabled ? 'submit-disabled' : ''}>
                  {phoneSendDisabled
                    ? `重新发送 (${Math.round(countdown / 1000)})`
                    : '发送验证码'}
                </span>
              ) : (
                <span id="send-code-btn" onClick={clickTelLoginCode}>
                  发送验证码
                </span>
              )}
            </div>
            <div
              className="tel-login-error"
              style={loginError !== '' ? { opacity: 1 } : {}}
            >
              {loginError}
            </div>
            <span className="tel-login-submit" onClick={clickTelLogin}>
              立即登录
            </span>
          </div>
        </div>
        <div className="reg-pullNew">
          <p>
            登录即享 <span>每日1次免费下载</span>
          </p>
        </div>
        <div className="res-qq-login">
          {loginTypeList.map(item => (
            <div
              key={item.id}
              id={item.id}
              style={{ display: loginType === item.type ? 'none' : '' }}
              onClick={() => changeLoginType(item.type)}
            >
              <div className={item.className}>
                <XiuIcon type={item.icon} />
              </div>
              {item.text}
            </div>
          ))}
        </div>
        <div className="protocol">
          <p>
            登录即视为同意
            <a href="//xiudodo.com/page/1" target="_blank" rel="noreferrer">
              《秀多多网络服务使用协议》
            </a>
            和
            <a href="//xiudodo.com/page/17" target="_blank" rel="noreferrer">
              《秀多多用户隐私条款》
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default memo(LoginPanel);
