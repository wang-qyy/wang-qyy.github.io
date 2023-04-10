import { useState } from 'react';

export default function useTemplatePlay() {
  const [playId, setPlayId] = useState<string | number>(-1);
  return {
    playId,
    setPlayId,
  };
}
