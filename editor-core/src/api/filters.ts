import { mainHost } from '@/config/http';
import { Filters } from '@/kernel';

interface FilterData {
  name: string;
  items: {
    name: string;
    id: string;
    preview_url: string;
    filters: Partial<Filters>;
  }[];
}

// 滤镜预设列表
export const getFiltersList = (): Promise<FilterData[]> => {
  return mainHost.get('/api/filters-list');
};
