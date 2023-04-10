import { useAppDispatch, useAppSelector, musicStatusAction } from '@/store';
import { isEqual } from 'lodash-es';

export function useMusicStatus() {
  const dispatch = useAppDispatch();
  const { musicStatus: state } = useAppSelector(store => ({
    musicStatus: store.musicStatus,
  }));

  function updateMusicStatus(musicStatus: any) {
    if (!isEqual(state, musicStatus)) {
      dispatch(musicStatusAction.setMusicStatus(musicStatus));
    }
  }

  return { musicStatus: state, updateMusicStatus };
}
