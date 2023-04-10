import { QrcodeInfo } from '@/kernel';
import QrCode from '@/kernel/utils/QrCode';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';

import { getQrCodeIconUrl } from './icons';

import './index.less';

interface IProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  options: QrcodeInfo;
}

const QrCodeCanvas = (props: IProps) => {
  const { options, className, ...other } = props;
  const instance = useRef<QrCode>();
  const { background, foreground, text, iconType } = options;
  const [canvas, _canvas] = useState<HTMLCanvasElement | null>();

  const backgroundStr = JSON.stringify(background);
  const foregroundStr = JSON.stringify(foreground);
  // 当为custom时，为上传自定义，根据resId生成的rt_url值。
  const rt_url =
    iconType === 'custom' ? options.rt_url : getQrCodeIconUrl(iconType);

  useEffect(() => {
    if (!canvas) return;
    const opts = { text, background, foreground, image: rt_url };
    if (!instance.current) {
      instance.current = new QrCode({ ...opts, canvas });
      instance.current.create();
    } else {
      instance.current.upDateOptions({ ...opts });
    }
  }, [backgroundStr, foregroundStr, text, canvas, rt_url, iconType]);

  return (
    <canvas
      className={classNames('qrcode-canvas', className)}
      ref={r => _canvas(r)}
      {...other}
    />
  );
};

export default QrCodeCanvas;
