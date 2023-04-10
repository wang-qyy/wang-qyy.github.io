import { useLocalStorageState } from 'ahooks';

// 记录当天打开次数,如果打开n次就返回true，其余返回false
export const useIsOpen = (n: number) => {
  // 存储点击时间，和下次做对比
  const [specialOfferDate, setSpecialOfferDate] = useLocalStorageState(
    'specialOfferDate',
    '0',
  );

  // 存储是否展示，今天关闭后就不再展示
  const [specialOfferShow, setSpecialOfferShow] = useLocalStorageState(
    'specialOfferShow',
    true,
  );

  // 存储点击次数，超过n次打开
  const [specialOfferCount, setSpecialOfferCount] = useLocalStorageState(
    'specialOfferCount',
    0,
  );

  const RecordTheNumber = () => {
    const now = new Date();
    const year = now.getFullYear(); // 得到年份
    const month = now.getMonth(); // 得到月份
    const day = now.getDate(); // 得到日期

    const dateTime = `${year}${month}${day}`;
    if (specialOfferDate === dateTime) {
      if (specialOfferShow) {
        if (specialOfferCount < n) {
          const count = specialOfferCount + 1;
          setSpecialOfferCount(count);
          return false;
        }
        return true;
      }
      return false;
    }
    setSpecialOfferDate(dateTime);
    setSpecialOfferShow(true);
    setSpecialOfferCount(1);
    return false;
  };

  return { RecordTheNumber, setSpecialOfferShow };
};
