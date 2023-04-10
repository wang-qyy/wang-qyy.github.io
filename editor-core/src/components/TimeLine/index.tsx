import { FunctionComponent } from 'react';
import InternalTimeLine from './timeLine';
import Ruler from './components/Ruler';
import Item from './components/Item';
import Pointer from './components/Pointer';
import { GlobalProps } from './types';

export * from './utils';

export { default as store } from './store';

interface CompoundedComponent<T> extends FunctionComponent<T> {
  Ruler: typeof Ruler;
  Item: typeof Item;
  Pointer: typeof Pointer;
}

const TimeLine = InternalTimeLine as CompoundedComponent<GlobalProps>;

TimeLine.Ruler = Ruler;
TimeLine.Item = Item;
TimeLine.Pointer = Pointer;

export default TimeLine;
