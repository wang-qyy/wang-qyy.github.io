import React, { useState } from 'react';
import { useInterval } from 'ahooks';

import Timer from '@/utils/countdownTimer';

export function useCountDown(props) {
  const [count, setCount] = useState<string | boolean>('00:00:00');

  useInterval(() => {
    const Time = Timer(props);
    setCount(Time);
  }, 100);

  return count;
}
