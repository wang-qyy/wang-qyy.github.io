import React from 'react';
import { Spin } from 'antd';
import QRCode from 'qrcode.react';
import { LoadingOutlined } from '@ant-design/icons';
import XiuIcon from '@/components/XiuIcon';
import styles from './index.less';

const PayQRCode = (props: {
  loading: boolean;
  refreshQrcode: any;
  price: number | string;
  showQrcode: boolean;
  isLate: boolean;
  className: string;
  payloadCode: any;
  qRCodeSize?: number; // 二维码大小
  payQRCodeStyle?: any; // 容器样式
  payQRCodeFontStyle?: any; // 字体样式
  desc?: any;
  priceDesc?: JSX.Element;
}) => {
  const {
    loading,
    refreshQrcode,
    price,
    showQrcode,
    isLate,
    className,
    payloadCode,
    qRCodeSize = 144,
    payQRCodeStyle = null,
    desc,
    payQRCodeFontStyle,
    priceDesc,
  } = props;

  // 二维码样式
  const qRCodeStyle = { width: qRCodeSize, height: qRCodeSize };
  //

  const LoadingIcon = (
    <LoadingOutlined type="loading" style={{ fontSize: 24 }} spin />
  );

  return (
    <div className={styles['payment-entry']} style={payQRCodeStyle}>
      <Spin indicator={LoadingIcon} spinning={loading}>
        <div onClick={refreshQrcode} className={className}>
          {isLate ? (
            <div className={styles.classNameQRCodeWarp} style={qRCodeStyle}>
              <div className={styles.classNameWarp}>
                <div className={styles.classNameTxt}>二维码已失效</div>
                <div className={styles.classNameBtn}>请点击刷新</div>
              </div>
              <QRCode
                value={payloadCode}
                className={styles.classNameQRCode}
                size={qRCodeSize}
              />
            </div>
          ) : (
            <div className={styles.classNameQRCodeWarp} style={qRCodeStyle}>
              {showQrcode && <QRCode value={payloadCode} size={qRCodeSize} />}
            </div>
          )}
        </div>
      </Spin>
      <div
        className={styles['qrcode-des']}
        style={payQRCodeFontStyle?.marginLeft}
      >
        <span
          className={styles['vip-settlement-price']}
          style={payQRCodeFontStyle?.title}
        >
          应付金额：
        </span>
        <span className={styles['strong-tip']}>
          <span
            className={styles['need-to-pay-span']}
            style={payQRCodeFontStyle?.unit}
          >
            ¥
          </span>
          <span
            className={styles['need-to-pay']}
            style={payQRCodeFontStyle?.price}
          >
            {price}
          </span>
          {payQRCodeFontStyle?.o_price && (
            <span style={payQRCodeFontStyle?.o_price}>{'原价: ¥799'}</span>
          )}
        </span>
        {priceDesc}
        {desc || (
          <p className={styles['qrcode-des-payment']}>
            <XiuIcon
              type="iconzu95"
              style={
                payQRCodeFontStyle?.iconSize || {
                  fontSize: '16px',
                  marginRight: '5px',
                }
              }
            />
            <XiuIcon
              type="iconweixinzhifu"
              style={
                payQRCodeFontStyle?.iconSize || {
                  fontSize: '16px',
                  marginRight: '5px',
                }
              }
            />
            <span style={payQRCodeFontStyle?.text}>
              使用支付宝/微信扫码支付
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default PayQRCode;
