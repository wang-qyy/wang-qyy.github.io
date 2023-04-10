import React from 'react';
import { useCountDown } from '@/hooks/useCountDown';

function Count(props: { expire_time: number }) {
  const { expire_time } = props;
  const count = useCountDown(expire_time);

  return <span>{count}</span>;
}

export default Count;
