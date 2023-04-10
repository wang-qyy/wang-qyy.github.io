import { createContext, useContext } from 'react';

export const TemplateIndexContext = createContext(-1);

export function useGetTemplateIndex() {
  return useContext(TemplateIndexContext);
}
