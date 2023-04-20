import catalog from './catalog';
import cover from './cover';
import transition from './transition';
import list from './list';
import list_img from './list_img';
import end from './end';

const AllData = [
  ...catalog,
  ...cover,
  ...transition,
  ...list,
  ...list_img,
  ...end,
];

export default AllData;

export const all = {
  all: AllData,
  catalog,
  cover,
  transition,
  list,
  list_img,
  end,
};
