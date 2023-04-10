import { Filters } from '@/kernel/typing';

export const getFilterId = (filter: Filters) => {
  return Object.values(filter).reduce((id, val) => `${id}_${val}`, '');
};
