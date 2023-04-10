import { ChromePicker } from 'react-color';
import type { RGBA } from '@kernel/index';

interface SolidColorPickerProps {
  color: RGBA;
  onChange: (color: RGBA) => void;
}

function SolidColorPicker(props: SolidColorPickerProps) {
  const { color, onChange } = props;

  return (
    <div>
      <ChromePicker
        disableAlpha
        color={color}
        onChange={({ rgb: rgba }) => {
          console.log(rgba);
          onChange(rgba);
        }}
      />
    </div>
  );
}

export default SolidColorPicker;
