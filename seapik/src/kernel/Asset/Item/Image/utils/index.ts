import { defaultFilters } from '@/kernel/utils/const';
import type { Filters, Container } from '@kernel/typing';

export function hasFilters(filters: Filters | undefined) {
  if (!filters) {
    return false;
  }
  const kes = Object.keys(filters) as Array<keyof Filters>;
  // @ts-ignore
  return kes.some(key => filters?.[key] > 0);
}

export function hasClip(container: Container | undefined) {
  if (!container) {
    return false;
  }
  return true;
}

/**
 * @description 过滤掉默认值
 * @param {Filters} filters
 * @returns
 */
export const getAvailableFilters = (filters: Partial<Filters>) => {
  let newFilters: Partial<Filters> | undefined;
  Object.entries(filters).forEach(([k, v]) => {
    const key = k as keyof Filters;
    const defaultVal = defaultFilters[key];
    if (v !== undefined && v !== defaultVal) {
      newFilters = { [key]: v, ...newFilters };
    }
  });
  return newFilters;
};
