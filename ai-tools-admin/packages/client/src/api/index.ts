import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || '请求失败';
    return Promise.reject(new Error(message));
  },
);

// ==================== API 接口 ====================

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// 健康检查
export const getHealth = () => api.get<unknown, { status: string; timestamp: string }>('/health');

// 获取用户列表
export const getUsers = () => api.get<unknown, ApiResponse<User[]>>('/users');

// 获取单个用户
export const getUser = (id: number) => api.get<unknown, ApiResponse<User>>(`/users/${id}`);

// 创建用户
export const createUser = (data: { name: string; email: string }) =>
  api.post<unknown, ApiResponse<User>>('/users', data);

// 删除用户
export const deleteUser = (id: number) => api.delete<unknown, ApiResponse<null>>(`/users/${id}`);

// ==================== 文件上传 ====================

export interface UploadResult {
  originalName: string;
  key: string;
  url: string;
  hash: string;
  size: number;
}

export interface BatchUploadResponse {
  code: number;
  data: {
    success: UploadResult[];
    failed: { originalName: string; error: string }[];
  };
}

/** 批量上传文件到七牛 */
export const uploadBatch = (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return api.post<unknown, BatchUploadResponse>('/upload/batch', formData);
};

/** 上传单个文件到七牛 */
export const uploadSingle = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<unknown, ApiResponse<UploadResult>>('/upload/single', formData);
};

// ==================== 模版管理 ====================

export interface TemplateImage {
  url: string;
  imgType: number; // 0=搭配图, 1=参考图, 2=模特图
}

export interface TaskConfig {
  images: TemplateImage[];
}

export interface TemplateParams {
  prompt: string;
  taskConfig: TaskConfig;
}

export interface Template {
  id: number;
  category: string; // '1'~'73'
  preview: string;
  params: TemplateParams;
  createdAt: number;
  updatedAt: number;
}

export type TemplateInput = Pick<Template, 'category' | 'preview' | 'params'>;

/** 获取模板列表（可选 category 筛选） */
export const getTemplates = (category?: string) => {
  const params = category ? `?category=${category}` : '';
  return api.get<unknown, ApiResponse<Template[]>>(`/templates${params}`);
};

/** 获取单个模板 */
export const getTemplate = (id: number) =>
  api.get<unknown, ApiResponse<Template>>(`/templates/${id}`);

/** 创建模板 */
export const createTemplate = (data: TemplateInput) =>
  api.post<unknown, ApiResponse<Template>>('/templates', data);

/** 更新模板 */
export const updateTemplate = (id: number, data: TemplateInput) =>
  api.put<unknown, ApiResponse<Template>>(`/templates/${id}`, data);

/** 删除模板 */
export const deleteTemplate = (id: number) =>
  api.delete<unknown, ApiResponse<null>>(`/templates/${id}`);

/** 批量同步某个分类的全部模板（全量替换） */
export const syncCategoryTemplates = (
  category: string,
  items: Array<{
    id: number;
    cid?: string;
    category: string;
    preview: string;
    params: { prompt: string; taskConfig: { images: Array<{ url: string; imgType: number }> } };
  }>,
) =>
  api.post<unknown, ApiResponse<Template[]>>('/templates/sync-category', { category, items });

// ==================== 模版分类 ====================

export const TEMPLATE_CATEGORIES: Record<string, string> = {
  '1': '商品换背景',
  '2': '模特换背景',
  '3': '裂变套图',
  '7': '商品详情页',
  '60': '去水印',
  '61': '材质增强',
  '62': '商品提取',
  '63': '服装上身',
  '64': '万物穿戴',
  '65': '搭配融图',
  '67': '创意生图',
  '68': '平铺转3D',
  '69': '面料上身',
  '70': '服装细节图',
  '71': '服装种草图',
  '72': '商品卖点图',
  '73': '商品精修',
};

/** 分类选项列表（供 Select 使用） */
export const CATEGORY_OPTIONS = Object.entries(TEMPLATE_CATEGORIES).map(([value, label]) => ({
  value,
  label,
}));

// ==================== 上传规则管理 ====================

export interface UploadRuleImage {
  url: string;
  imgType: number; // 0商品图、1参考图、2模特图
}

export interface UploadRuleRight {
  desc: string;
  prodInfo?: {
    url: string;
    filedName: string;
  };
  params: {
    prompt: string;
    taskConfig: {
      images: UploadRuleImage[];
    };
  };
}

export interface UploadRuleWrong {
  url: string;
  desc: string;
}

export interface UploadRule {
  id: number;
  category: string;
  right: UploadRuleRight[];
  wrong: UploadRuleWrong[];
  createdAt: number;
  updatedAt: number;
}

export type UploadRuleInput = Pick<UploadRule, 'category' | 'right' | 'wrong'>;

/** 获取上传规则列表（可选 category 筛选） */
export const getUploadRules = (category?: string) => {
  const params = category ? `?category=${category}` : '';
  return api.get<unknown, ApiResponse<UploadRule[]>>(`/upload-rules${params}`);
};

/** 获取上传规则分类列表 */
export const getUploadRuleCategories = () =>
  api.get<unknown, ApiResponse<string[]>>('/upload-rules/categories');

/** 创建上传规则 */
export const createUploadRule = (data: UploadRuleInput) =>
  api.post<unknown, ApiResponse<UploadRule>>('/upload-rules', data);

/** 更新上传规则 */
export const updateUploadRule = (category: string, id: number, data: UploadRuleInput) =>
  api.put<unknown, ApiResponse<UploadRule>>(`/upload-rules/${category}/${id}`, data);

/** 删除上传规则 */
export const deleteUploadRule = (category: string, id: number) =>
  api.delete<unknown, ApiResponse<null>>(`/upload-rules/${category}/${id}`);

// ==================== 菜单管理 ====================

export interface MenuItem {
  id: string;
  name: string;
  icon: string;
  url: string;
  preview: string;
  desc: string;
  type: string; // TEMPLATE_CATEGORIES key
  status?: 'online' | 'offline'; // 上下线状态，默认 online
}

export interface MenuGroup {
  id: string;
  name: string;
  children: MenuItem[];
}

/** 获取全部菜单 */
export const getMenus = () => api.get<unknown, ApiResponse<MenuGroup[]>>('/menus');

/** 保存全部菜单（全量替换） */
export const saveMenus = (data: MenuGroup[]) =>
  api.put<unknown, ApiResponse<MenuGroup[]>>('/menus', data);

/** 切换菜单项上下线状态 */
export const toggleMenuItemStatus = (
  groupId: string,
  itemId: string,
  status: 'online' | 'offline',
) => api.patch<unknown, ApiResponse<MenuItem>>(`/menus/${groupId}/${itemId}/toggle`, { status });

// ==================== 轮播图管理 ====================

export interface CarouselPreview {
  desc: string;
  img: string;
  imgType?: number;
}

export interface CarouselDemo {
  previews: CarouselPreview[];
  params: {
    prompt: string;
  };
}

export interface CarouselItem {
  id: number;
  category: string;
  title: string;
  demos: CarouselDemo[];
  createdAt: string;
  updatedAt: string;
}

export interface CarouselInput {
  category: string;
  title: string;
  demos: CarouselDemo[];
}

/** 获取轮播图列表（可选按 category 筛选） */
export const getCarouselList = (category?: string) =>
  api.get<unknown, ApiResponse<CarouselItem[]>>('/carousel', {
    params: category ? { category } : undefined,
  });

/** 新增轮播图 */
export const createCarousel = (data: CarouselInput) =>
  api.post<unknown, ApiResponse<CarouselItem>>('/carousel', data);

/** 更新轮播图 */
export const updateCarousel = (id: number, data: Partial<CarouselInput>) =>
  api.put<unknown, ApiResponse<CarouselItem>>(`/carousel/${id}`, data);

/** 删除轮播图 */
export const deleteCarousel = (id: number) =>
  api.delete<unknown, ApiResponse<null>>(`/carousel/${id}`);

// ==================== 首页展示模版 ====================

/** 首页展示模板，结构与 /data/templates/{category}.json 一致，额外包含 showInHome */
export interface HomeTempItem {
  id: number;
  category: string;
  preview: string;
  params: TemplateParams;
  showInHome: boolean;
  createdAt: number;
  updatedAt: number;
}

/** 获取全部首页展示模板（完整数据） */
export const getHomeTemps = () =>
  api.get<unknown, ApiResponse<HomeTempItem[]>>('/home-temp');

/** 获取首页展示的模板 ID 列表（轻量查询） */
export const getHomeTempIds = () =>
  api.get<unknown, ApiResponse<number[]>>('/home-temp/ids');

/** 添加/更新模板到首页展示（传入完整模板数据 + showInHome） */
export const addHomeTemp = (data: Omit<HomeTempItem, 'updatedAt'> & { updatedAt?: number }) =>
  api.post<unknown, ApiResponse<HomeTempItem>>('/home-temp', data);

/** 从首页移除模板 */
export const removeHomeTemp = (id: number) =>
  api.delete<unknown, ApiResponse<null>>(`/home-temp/${id}`);

/** 切换 showInHome 状态 */
export const toggleHomeTempShow = (id: number) =>
  api.patch<unknown, ApiResponse<HomeTempItem>>(`/home-temp/${id}/toggle`);
