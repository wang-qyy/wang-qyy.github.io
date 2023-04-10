import { FunctionComponent } from 'react';
import SolidColorPicker from './Solid';

interface CompoundedComponent<T> extends FunctionComponent<T> {
  Solid: typeof SolidColorPicker;
}

const ColorPicker = (props: CompoundedComponent<any>) => {
  return <></>;
};

ColorPicker.Solid = SolidColorPicker;
export default ColorPicker;
