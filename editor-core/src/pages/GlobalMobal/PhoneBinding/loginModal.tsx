import React, { useRef, useState, memo } from 'react';
import { useCountDown, useRequest } from 'ahooks';
import { message } from 'antd';
import { getTelLogin, bindPh } from '@/api/watermark';
import { ExclamationCircleFilled } from '@ant-design/icons';
import classNames from 'classnames';

import { stopPropagation } from '@/utils/single';
import styles from './index.less';

export interface LoginPanelProps {
  loginCallback: (status: boolean) => void;
  setBindResult: (obj: any) => void;
}

function LoginPanel({ loginCallback, setBindResult }: LoginPanelProps) {
  const telNumber = useRef<HTMLInputElement>(null);
  const checkNumber = useRef<HTMLInputElement>(null);
  const [state, setState] = useState({
    weChatLoginQrcodeSrc: '',
    weChatNumber: '',
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

  const { phoneSendDisabled, loginError } = state;

  function checkLoginStatus() {
    message.success('绑定成功！');
    loginCallback(true);
  }

  const telLoginCode = useRequest(getTelLogin, {
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
        setState(prev => ({
          ...prev,
          loginError: msg,
        }));
      }
    },
  });

  function clickTelLoginCode() {
    if (!telNumber.current) {
      return;
    }
    const { value = '' } = telNumber.current;
    if (value === '' || !/^1[3456789]\d{9}$/.test(value)) {
      setState(prev => ({
        ...prev,
        loginError: '请输入正确的手机号',
      }));
      return;
    }
    setState(prev => ({
      ...prev,
      loginError: '',
    }));
    telLoginCode.run(value);
  }

  function clickTelLogin() {
    if (!telNumber.current || !checkNumber.current) {
      return;
    }
    const { value: phoneNum } = telNumber.current;
    const { value: phoneMsgNum } = checkNumber.current;
    if (phoneNum === '' || !/^1[3456789]\d{9}$/.test(phoneNum)) {
      setState(prev => ({
        ...prev,
        loginError: '请输入正确的手机号',
      }));
      return;
    }
    if (phoneMsgNum === '') {
      setState(prev => ({
        ...prev,
        loginError: '请输入正确的手机验证码',
      }));
      return;
    }
    setState(prev => ({
      ...prev,
      loginError: '',
    }));
    bindPh({
      phoneNum,
      phoneMsgNum,
      confirm_bind: 0,
    }).then(res => {
      const { code, msg } = res;
      if (code === 0) {
        setState(prev => ({
          ...prev,
          loginError: '',
        }));
        checkLoginStatus();
      } else {
        if (
          ['alreadyUpFile', 'alreadyBindOther', 'noBindOther'].indexOf(
            res?.data?.message,
          ) > -1
        ) {
          setBindResult({
            ...res?.data,
            phoneNum,
            phoneMsgNum,
          });
          loginCallback(false);
        } else {
          message.error(res?.data?.msg);
        }
      }
    });
  }

  function onKeyDown(e: any) {
    if (e.keyCode === 13) {
      clickTelLoginCode();
    }
  }

  return (
    <div className={styles.bindPhone}>
      <div className={styles.bindPhoneTop}>
        <ExclamationCircleFilled />
        <span>温馨提示</span>
      </div>
      <div className={styles.bindPhoneTxt}>
        根据国家法律规定为了您的账号安全，
        <br />
        请您响应国家政策，先绑定手机认证再进行操作!
      </div>
      <div className={styles.bindPhoneContent}>
        <input
          ref={telNumber}
          onKeyDown={onKeyDown}
          type="tel"
          className={styles.bindPhoneContentTopInput}
          placeholder="请输入手机号"
          onKeyDownCapture={stopPropagation}
        />
        <div
          className={styles['tel-login-error']}
          style={loginError ? { opacity: 1 } : {}}
        >
          {loginError || '请输入正确手机号'}
        </div>
        <div className={styles.bindPhoneContentBottom}>
          <input
            ref={checkNumber}
            type="tel"
            className={styles.bindPhoneContentBottomInput}
            placeholder="短信验证码"
            onKeyDownCapture={stopPropagation}
          />
          {phoneSendDisabled ? (
            <div className={phoneSendDisabled ? styles['submit-disabled'] : ''}>
              {phoneSendDisabled
                ? `重新发送 (${Math.round(countdown / 1000)})`
                : '发送验证码'}
            </div>
          ) : (
            <div
              className={styles['send-code-btn']}
              onClick={clickTelLoginCode}
            >
              发送验证码
            </div>
          )}
        </div>

        <div
          className={classNames(styles['tel-login-submit'], {
            [styles['tel-login-submit-active']]: checkNumber.current?.value,
          })}
          onClick={clickTelLogin}
        >
          立即绑定
        </div>
      </div>
    </div>
  );
}

export default memo(LoginPanel);
