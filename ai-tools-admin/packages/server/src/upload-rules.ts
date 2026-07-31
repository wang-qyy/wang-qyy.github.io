import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data/upload-rules');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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

/** 分类名称映射 */
const CATEGORY_NAMES: Record<string, string> = {
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

export interface UploadRuleWithName extends UploadRule {
  categoryName: string;
}

export interface UploadRulesExport {
  version: string;
  exportedAt: number;
  totalRules: number;
  rules: UploadRuleWithName[];
}

/** 合并文件路径 */
const ALL_RULES_FILE = path.join(DATA_DIR, 'upload-rules-all.json');

// ==================== 底层读写 ====================

/** 从合并文件读取全部规则 */
function readAllFromFile(): UploadRuleWithName[] {
  if (!fs.existsSync(ALL_RULES_FILE)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(ALL_RULES_FILE, 'utf-8');
    const data = JSON.parse(raw) as UploadRulesExport;
    return data.rules || [];
  } catch {
    return [];
  }
}

/** 保存全部规则到合并文件 */
function saveAll(rules: UploadRuleWithName[]): void {
  const data: UploadRulesExport = {
    version: '1.0',
    exportedAt: Date.now(),
    totalRules: rules.length,
    rules,
  };
  fs.writeFileSync(ALL_RULES_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/** 确保合并文件存在 */
function ensureFile(): void {
  if (!fs.existsSync(ALL_RULES_FILE)) {
    saveAll([]);
  }
}

// 模块加载时确保文件存在
ensureFile();

// ==================== 公开 API ====================

/** 读取规则（支持按 category 筛选） */
export function readAll(category?: string): UploadRuleWithName[] {
  const rules = readAllFromFile();
  if (category) {
    return rules.filter((r) => r.category === category);
  }
  return rules;
}

/** 获取所有分类列表 */
export function getCategories(): string[] {
  return [...new Set(readAllFromFile().map((r) => r.category))];
}

/** 导出全部规则（返回 + 重新保存为文件） */
export function exportAll(): UploadRulesExport {
  const rules = readAllFromFile();
  const data: UploadRulesExport = {
    version: '1.0',
    exportedAt: Date.now(),
    totalRules: rules.length,
    rules,
  };
  saveAll(rules);
  return data;
}

/** 创建规则 */
export function create(
  category: string,
  data: Omit<UploadRule, 'id' | 'createdAt' | 'updatedAt'>,
): UploadRule {
  const allRules = readAllFromFile();
  const categoryRules = allRules.filter((r) => r.category === category);
  const maxId = categoryRules.length > 0 ? Math.max(...categoryRules.map((r) => r.id)) : 0;

  const now = Date.now();
  const newRule: UploadRule = {
    ...data,
    id: maxId + 1,
    createdAt: now,
    updatedAt: now,
  };

  // 写入合并文件时附加 categoryName
  allRules.push({
    ...newRule,
    categoryName: CATEGORY_NAMES[category] || category,
  });
  saveAll(allRules);

  return newRule;
}

/** 更新规则 */
export function update(
  category: string,
  id: number,
  data: Omit<UploadRule, 'id' | 'createdAt' | 'updatedAt'>,
): UploadRule | null {
  const allRules = readAllFromFile();
  const index = allRules.findIndex((r) => r.category === category && r.id === id);
  if (index === -1) return null;

  const now = Date.now();
  const updated: UploadRuleWithName = {
    ...data,
    id,
    categoryName: CATEGORY_NAMES[category] || category,
    createdAt: allRules[index].createdAt,
    updatedAt: now,
  };

  allRules[index] = updated;
  saveAll(allRules);

  return updated;
}

/** 删除规则 */
export function remove(category: string, id: number): boolean {
  const allRules = readAllFromFile();
  const filtered = allRules.filter((r) => !(r.category === category && r.id === id));
  if (filtered.length === allRules.length) return false;
  saveAll(filtered);
  return true;
}
