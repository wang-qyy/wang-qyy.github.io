import { InputNumber, InputNumberProps } from 'antd';
import './index.less';

interface NumberProps extends InputNumberProps {
  label: string;
}

export default function CustomInputNumber({ label, ...others }: NumberProps) {
  return (
    <div className="flex-box flex-col custom-input-number" style={{ flex: 1 }}>
      <InputNumber bordered={false} {...others} />
      <label className="custom-input-number-label">{label}</label>
    </div>
  );
}
