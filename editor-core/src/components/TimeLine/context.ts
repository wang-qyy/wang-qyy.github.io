import { createContext, useContext } from 'react';
import TimeLineStore from './store';
// import { GlobalContextType } from './types';

export const TimelineContext = createContext<TimeLineStore | undefined>(
  undefined,
);

export function useTimelineStore(): TimeLineStore {
  return useContext(TimelineContext) as TimeLineStore;
}

// export const GlobalContext = createContext<GlobalContextType | undefined>(
//   undefined,
// );

// export function useGlobalContext(): GlobalContextType {
//   return useContext(GlobalContext) as GlobalContextType;
// }
