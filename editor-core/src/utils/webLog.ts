import getUrlProps from '@/utils/urlProps';
import {
  getAllTemplates,
  getCurrentAsset,
  AssetType,
  isMaskType,
} from '@hc/editor-core';

import { debounce } from 'lodash-es';
import { useDebounceFn } from 'ahooks';
import { useCanvasScale } from '@/pages/Content/Main/CanvasScale/handler';
import { getEditMode } from '@/store/adapter/useGlobalStatus';

class RecordLastAction {
  actionType: string;

  assetId: number | undefined;

  assetType: AssetType;

  constructor() {
    this.actionType = '';
    this.assetId = -1;
    this.assetType = '';
  }

  set({
    actionType,
    assetId,
    assetType,
  }: {
    actionType: string;
    assetId?: number;
    assetType?: string;
  }) {
    this.actionType = actionType;
    this.assetId = assetId;
    this.assetType = assetType;
  }

  get() {
    return {
      actionType: this.actionType,
      assetType: this.assetType,
    };
  }
}

// 如果是极速模式，后面拼接 _concise
export const concatConciseModeSuffix = (actionType: string) => {
  // const editMode = localStorage.getItem('editMode');

  const editMode = getEditMode();
  const suffix = editMode === 'concise' ? '_concise' : '';
  return `${actionType}${suffix}`;
};

export const recordLastAction = new RecordLastAction();

export enum ActionType {
  sce_add_N = 'sce_add_N', // 添加片头
  sce_add_S = 'sce_add_S ', // 添加片尾
  sce_del = 'sce_del', // 场景删除
  sce_copy = 'sce_copy', // 场景复制
  canv_tpl_add = 'canv_tpl_add', // 空画布模板添加
  canv_file_up = 'canv_file_up', // 空画布添加本地长传
  canv_cli_wm = 'canv_cli_wm', // 移除水印
}

const getTemplateId = () => {
  const allTemplate = getAllTemplates();
  const templateId = allTemplate.find(item => item.template.templateId)
    ?.template.templateId;
  return { draft_id: getUrlProps().upicId ?? 0, template_id: templateId };
};

// 多场景埋点
export function dataAcquisition(action_type: ActionType): void {
  const params = { action_type, ...getTemplateId() };
  window?.xa?.track('editor_action', {
    extra: JSON.stringify(params),
  });
}

// 优惠券埋点
export function dataCoupon(title: string, action_type: string): void {
  const params = { action_type };
  window?.xa?.track(title, {
    extra: JSON.stringify(params),
  });
}

// 充值弹框埋点
export function rechargeAcquisition(extra?: { limitType?: string }): void {
  const event = concatConciseModeSuffix('OpenRecharge');

  const params = {
    action_type: 'show_popup',
    ...getTemplateId(),
    ...extra,
  };
  window?.xa?.track(event, {
    extra: JSON.stringify(params),
  });
}

// 水印埋点
export function dataWatermark(title: string, action_type: string): void {
  window?.xa?.track(title, {
    extra: action_type,
  });
}

// 声音设置埋点
export function dataMusicSet(title: string, action_type: string): void {
  const params = { action_type };
  window?.xa?.track(title, {
    extra: JSON.stringify(params),
  });
}

// 特价弹框埋点
export function dataSpecialOffer(): void {
  window?.xa?.track('BargainRecharge', {});
}

// 充值增加次数弹框埋点
export function dataIncRecharge(): void {
  window?.xa?.track('IncRecharge', {
    extra: 'sku_code',
  });
}

// 点击高清视频下载和预览-确认并下载 埋点
export function downloadClickWebLog() {
  window?.xa?.track('DownloadClick', {
    ...getTemplateId(),
  });
}

// 双十一埋点
export function dataActivity(title: string, action_type: string): void {
  const params = { enter_type: action_type };
  window?.xa?.track(title, {
    extra: JSON.stringify(params),
  });
}

// 编辑埋点
export function editWebLog(edit_otype: string, action_type?: string) {
  const event = concatConciseModeSuffix('edit');
  window?.xa?.track(event, {
    extra: JSON.stringify({
      action_type,
      ...getTemplateId(),

      action_label: edit_otype,
    }),
  });
}

// 编辑埋点
export function templateLoadLog(idInfo: {
  picId: number | string;
  upicId: number | string;
}) {
  if (!window.__EDITOR_PERFORMANCE__?.completed) {
    return;
  }
  window.__EDITOR_PERFORMANCE__.sended = true;
  const {
    // html开始解析
    recieve_end_time,
    // 基础dom结构加载完毕
    dom_parse_end_time,
    // js等静态资源加载完毕
    all_resorce_loaded,
    // 模板数据获取开始
    user_template_get_start,
    // 模板数据获取结束
    user_template_get_ended,
    // 模板内资源加载开始
    user_resorce_post_start,
    // 模板内资源加载结束
    user_resorce_post_end,
  } = window.__EDITOR_PERFORMANCE__;
  /*
     数据接收时间 = 数据接收结束时间 - 数据接收开始时间
     dom加载时间  = dom解析完成时间 - dom开始加载时间  （不包含用户模板数据）
     资源加载时间 = 页面加载完成时间 - dom解析完成时间
     用户模板dom加��时间 = 全部dom完全加载时间 - 用户模板数据请求结束
     用户模板资源加载时间 = 用户资源加载最晚时间 - 用户资源加载最早时间
  */
  const newTimeObj = {
    dateRecieve: recieve_end_time - window.performance.timing.navigationStart, // 数据接收
    domLoaded: dom_parse_end_time - recieve_end_time, // dom加载
    resorceLoaded: all_resorce_loaded - recieve_end_time, // 资源加载
    userTemplateLoaded: user_template_get_ended - user_template_get_start, // 用户模板dom加载时间
    userTemplateResorceLoaded: user_resorce_post_end - user_resorce_post_start, // 用户模板资源加载时间
  };

  const data = {
    tid: idInfo.picId,
    did: idInfo.upicId,
    p1: newTimeObj.dateRecieve,
    p2: newTimeObj.domLoaded,
    p3: newTimeObj.resorceLoaded,
    p4: newTimeObj.userTemplateLoaded,
    p5: newTimeObj.userTemplateResorceLoaded,
  };
  // 意味着是空白模板
  if (data.p4 === 0) {
    data.p5 = 0;
  }
  if (data.p5 > 120000) {
    const templates = getAllTemplates();
    let hasAsset = false;
    templates.forEach(template => {
      if (!hasAsset && template.assets.length > 0) {
        hasAsset = true;
      }
    });
    if (!hasAsset) {
      data.p5 = 0;
    }
  }
  window?.xa?.track('LoadFeedback', {
    extra: JSON.stringify(data),
  });
}

let firstLoad = false;

/**
 * @description  资源首次加载耗时
 * @param template_id
 * @param draft_id
 */
export function templateFirstLoadTime(
  template_id: number | string,
  draft_id: number | string,
) {
  if (firstLoad) {
    return;
  }
  firstLoad = true;
  window?.xa?.track('LoadComplete', {
    extra: JSON.stringify({
      template_id,
      draft_id,
    }),
  });
}

// 页面崩溃埋点
export const pageErrorWebLog = debounce(() => {
  console.log(recordLastAction.get());
  // todo
  const params = {
    ...getTemplateId(),
    ...recordLastAction.get(),
  };
  window?.xa?.track('EditorCollapse', {
    extra: JSON.stringify(params),
  });
}, 2000);

type VideoPartWebLogType =
  | 'dragPlay' // 拖动播放
  | 'del' // 删除
  | 'copy' // 复制
  | 'addPart' // 新增片段
  | 'splitPart' // 分割片段
  | 'changePosition' // 位置调整
  | 'play'; // 播放

// 模板片段埋点
export function videoPartWebLog(type: VideoPartWebLogType) {
  const extra = { ...getTemplateId(), type };

  window?.xa?.track('VideoSplit', { extra: JSON.stringify(extra) });
}

type PixelType = '480P' | '720P' | '1080P'; // 视频下载清晰度

type LimitedType =
  | 'draftMemory' // 草稿数量
  | 'dlMemory' // 合成作品数量
  | 'dlNum' // mp4下载次数限制
  | 'gifDl'; // gif下载受限
interface DownloadLimitParams {
  pixel_type?: PixelType; // 清晰度
  vip_type: number; // vip类型
  limited_type: LimitedType;
}

/**
 * @description 下载受限埋点： 只有在下载被限制的情况下才需要发出
 * @param data {Object}
 * @param data.pixel_type {String}
 * @param data.vip_type {Number} vip类型
 * @param limited_type 受限类型 draftMemory=草稿数量，dlMemory=合成作品数量，dlNum=
 */
export function downloadLimit(data: DownloadLimitParams) {
  const extra = JSON.stringify({ ...data, ...getTemplateId() });
  // @ts-ignore
  window?.xa?.track('limited', { extra });
}

type MemoryLimitType = 'draft' | 'download';
export type ClickType = 'openVip' | 'toDel';

interface MemoryLimitWebLog {
  limit_type: MemoryLimitType;
  click_type: ClickType;
}

/**
 * 存储空间受限埋点
 * */
export function memoryLimitWebLog(data: MemoryLimitWebLog) {
  const extra = JSON.stringify({
    ...getTemplateId(),
    ...data,
  });
  window?.xa?.track('limitedClick', { extra });
}

/**
 * 加量包弹框曝光量
 * */
export function timesRechargeWebLog(params: any) {
  const extra = JSON.stringify({
    ...getTemplateId(),
    ...params,
  });
  return window?.xa?.track('IncTimesRecharge', { extra });
}

// 团队埋点
export function dataTeam(params): void {
  const param = {
    action_type: params.action_type,
    team_id: params.team_id,
  };

  window?.xa?.track('TeamAciton', {
    extra: JSON.stringify(param),
  });
}

//
type AudioWeblogActionType =
  | 'a_timeline_001' // 【时间轴】用户双击时间轴 ，拖动声轨
  | 'a_timeline_002' // 【时间轴】点击更多
  | 'a_timeline_003' // 【时间轴】点击更多-调整
  | 'a_timeline_004' // 【时间轴】点击更多-音量
  | 'a_timeline_005' // 【时间轴】点击更多-复制
  | 'a_timeline_006' // 【时间轴】点击更多-删除
  | 'a_timeline_007' // 【时间轴】拖动声音轨道
  | 'a_timeline_008' // 【时间轴】拖动音乐轨道2端 来裁剪调整音乐时长
  | 'quick_bar_001' // 【快捷操作栏】点击AI配音
  | 'quick_bar_002' // 【快捷操作栏】音频-点击音量调整// 【工具栏】音频音量
  | 'quick_bar_003' // 【快捷操作栏】音频-点击复制
  | 'quick_bar_004' // 【快捷操作栏】音频-点击删除
  | 'ai_audio_001' // 【AI配音】点击快捷操作栏AI配音
  | 'ai_audio_002' // 【AI配音】成功AI配音功能
  | 'ai_audio_003' // 【AI配音】侧边导航AI语音点击
  | 'ai_audio_004' // 【AI配音】侧边导航点击文字转语音按钮
  | 'ai_audio_005' // 【AI配音】侧边导航点击文字转语音按钮
  | 'ai_audio_006' // 【AI配音】文本框输入过文字
  | 'ai_audio_007' // 【AI配音】点击试听
  | 'ai_audio_008' // 【AI配音】确定应用
  | 'ai_audio_009' // 【AI配音】单条文字转语音的操作
  | 'ai_audio_010' // 【AI配音】成功生成语音文件
  | 'mike_audio_001' // 【录音】点击录音
  | 'mike_audio_002' // 【录音】点击开始录音
  | 'mike_audio_003' // 【录音】成功录音
  | 'mike_audio_004' // 【录音】触发到无录音设备
  | 'mike_audio_005' // 【录音】录音点击添加/删除按钮
  | 'menu_template' // 【菜单】模板
  | 'menu_user-space' // 【菜单】上传
  | 'menu_text' // 【菜单】文字
  | 'menu_element' // 【菜单】元素
  | 'menu_background' // 【菜单】背景
  | 'menu_music' // 【菜单】音乐
  | 'menu_AI' // 【菜单】AI语音
  | 'menu_videoE' // 【菜单】视频
  | 'menu_img' // 【菜单】图片
  | 'menu_role' // 【菜单】角色
  | 'tool_assetLayer' // 【工具栏】图层
  | 'tool_fontFamily' // 【工具栏】展示字体 action_label = fontFamily
  | 'tool_fontSize' // 【工具栏】字体大小 action_label = fontSize
  | 'tool_fontWeight' // 【工具栏】字体加粗
  | 'tool_fontStyle' // 【工具栏】字体斜体
  | 'tool_fontWritingMode' // 【工具栏】字体方向
  | 'tool_align' // 【工具栏】字体对齐 action_label = left | center | right
  | 'tool_letterSpacing' // 【工具栏】字体间距
  | 'tool_lineHeight' // 【工具栏】字体行高
  | 'tool_fontColor' // 【工具栏】文字颜色
  | 'tool_text_background_color' // 【工具栏】文字背景颜色
  | 'tool_text_background_color_opacity' // 【工具栏】文字背景颜色的不透明度
  | 'tool_text_backgtound_radius' // 【工具栏】文字背景圆角
  | 'tool_fontEffects' // 【工具栏】字体特效
  | 'tool_replace' // 【工具栏】元素替换
  | 'tool_svg-color' // 【工具栏】svg颜色设置
  | 'tool_svg_stroke_color' // 【工具栏】svg描边-边框颜色
  | 'tool_svg_stroke_border' // 【工具栏】svg描边-边框样式
  | 'tool_svg_stroke_border_width' // 【工具栏】svg描边-边框样式
  | 'tool_horizontalFlip' // 【工具栏】水平翻转
  | 'tool_verticalFlip' // 【工具栏】垂直翻转
  | 'tool_mask-clip' // 【工具栏】蒙版裁剪
  | 'tool_template_background_color' // 【工具栏】设置模板背景颜色
  | 'tool_template_set_pageTime' // 【工具栏】设置模板时长
  | 'tool_animation' // 【工具栏】打开动画列表
  | 'tool_assetLayerZIndex' // 【工具栏】调整图层顺序 action_label = up | down | top | bottom
  | 'tool_asset-duration' // 【工具栏】调整元素出现时长
  | 'tool_asset-copy' // 【工具栏】复制
  | 'tool_asset-opacity' // 【工具栏】元素不透明度
  | 'tool_video-volume' // 【工具栏】视频音量
  | 'tool_asset-lock' // 【工具栏】锁定元素
  | 'tool_asset-delete' // 【工具栏】删除元素
  | 'header_update_title' // 【header】修改模板标题
  | 'header_fullScreen' // 【header】全屏
  | 'header_goPrev' // 【header】上一步
  | 'header_goNext' // 【header】下一步
  | 'header_active' // 【header】活动位置 action_label = 活动类型标识
  | 'header_replace_warn' // 【header】替换提醒
  | 'header_recharge' // 【header】开通会员/充值
  | 'header_save' // 【header】点击保存
  | 'header_preview' // 【header】点击预览
  | 'bottom_template_play' // 【bottom】播放片段
  | 'bottom_template_pause' // 【bottom】暂停播放片段
  | 'transition_add' // 【转场】添加
  | 'transition_delete' // 【转场】删除
  | 'transition_replace' // 【转场】替换
  | 'keyPress_playVideo' // 【快捷键】播放视频
  | 'keyPress_playPreviewVideo' // 【快捷键】播放预览视频
  | 'keyPress_asset_delete' // 【快捷键】删除元素
  | 'keyPress_audio_delete' // 【快捷键】删除音频
  | 'keyPress_save' // 【快捷键】保存
  | 'keyPress_asset_copy' // 【快捷键】复制元素
  | 'keyPress_audio_copy' // 【快捷键】复制音频
  | 'keyPress_audio_paste' // 【快捷键】粘贴
  | 'panel_' // 【侧边栏】 template-模板、collection-收藏、draft-草稿
  | 'panel_img' // 【侧边栏】 云端图片 2-创意背景 | 66-插画 | 20-照片
  | 'action_template_replace' // 【侧边栏】替换单个模板
  | 'action_template_replaceAll' // 【侧边栏】替换所有模板
  | 'action_template_insert' // 【侧边栏】插入单个模板
  | 'action_template_insertAll' //  【侧边栏】插入所有模板
  | 'action_text_add_$' // 【侧边栏】文字添加 标题-title | 正文-text | 带底色文字textBackground
  | 'action_text_add_specificWord' // 【侧边栏】添加特效字 action_label = reaId
  | 'action_text_update_specificWord' // 【侧边栏】替换特效字
  | 'action_element_add_$' // 【侧边栏】添加元素 + asset.meta.type action_label = reaId
  | 'action_element_replace_$' // 【侧边栏】替换元素  + asset.meta.type action_label = reaId
  | 'action_element_recommend' // 【侧边栏】元素推荐分类 action_label = 类型
  | 'panel_background_search' // 【侧边栏】背景搜索
  | 'timelineHandler' // 时间轴 缩放调整
  | 'time-line-fit-screen' // 时间轴适配屏幕
  | 'action_module_add' // 遮罩组件添加埋点
  | string;

/**
 * 录音 / AI配音 / 音频时间轨道 埋点
 * action_type 动作类型
 * action_label 成功AI配音后，这里写voice_key的值
 * */
export function clickActionWeblog(
  action_type: AudioWeblogActionType,
  extra?: { action_label?: string | number; asset_id?: string | number },
) {
  const event = concatConciseModeSuffix('editor_action');
  const currentAsset = getCurrentAsset();
  recordLastAction.set({
    actionType: action_type,
    assetId: currentAsset?.meta.id,
    assetType: currentAsset?.meta.type,
  });

  const param = {
    ...getTemplateId(),
    action_type,
    ...extra,
  };
  window?.xa?.track(event, {
    extra: JSON.stringify(param),
  });
}

// loading 埋点
export function loadingWeblog() {
  const param = {
    ...getTemplateId(),
  };
  window?.xa?.track('LoadListen', {
    extra: JSON.stringify(param),
  });
}

/**
 *
 */
export function problemHelpWebLog({
  action,
  word,
  guideType,
}: {
  action: 'search' | 'open' | 'lookGuide';
  word?: string;
  guideType?: string;
}) {
  const param = {
    ...getTemplateId(),
    guideType,
    action,
    word,
  };

  window?.xa?.track('ProblemHelp', { extra: JSON.stringify(param) });
}

/**
 * 分享优惠券埋点
 * */
export function shareCoupon(params: any): void {
  const param = {
    action_type: params.action_type,
  };
  window?.xa?.track('CouponDouble', {
    extra: JSON.stringify(param),
  });
}

// 通用action_type埋点
export function dataActiontype(title: string, action_type: string): void {
  const event = concatConciseModeSuffix(title);
  const params = { action_type };
  window?.xa?.track(event, {
    extra: JSON.stringify(params),
  });
}

/**
 * 小工具收费水印埋点
 * */
export function videoTool(): void {
  const param = {
    action_type: 'openRechargeTip',
    tool_type: 'watermark',
  };
  window?.xa?.track('VideoTool', {
    extra: JSON.stringify(param),
  });
}

// 图层管理埋点类型
type LayerWeblogActionType =
  | 'LayerModal_01' // 删除
  | 'LayerModal_02' // 复制
  | 'LayerModal_03' // 双击整体图层促发的替换
  | 'LayerModal_04' // 替换按钮触发的替换
  | 'LayerModal_05' // 拖拽移动图层层级
  | 'LayerModal_06' // 锁定图层点击
  | 'LayerModal_07' // 隐藏点击
  | 'LayerModal_08'; // 双击文字图层编辑文字
/**
 * 图层管理浮窗埋点
 * */
export function layerWeblog(
  action_type: LayerWeblogActionType,
  extra?: { action_label?: string },
) {
  const param = {
    action_type,
    ...extra,
  };
  window?.xa?.track('editor_action', {
    extra: JSON.stringify(param),
  });
}

/**
 * 新手引导埋点
 */
export function userGuidePopLog(param: {
  action_type: 'newBlank' | 'openTempl' | 'fucShow';
  step?: number;
  trigger?: string;
}) {
  try {
    window?.xa?.track('UserGuidePop', {
      extra: JSON.stringify(param),
    });
  } catch (error) { }
}

export const useEditorLog = () => {
  const { value: canvas = { width: 0, height: 0 } } = useCanvasScale({
    container: document.querySelector('.xiudodo-main') as HTMLElement,
  });
  const { run: buried } = useDebounceFn(
    (value, changeType) => {
      let edit_otype = value?.meta?.type;

      if (isMaskType(value) && value.assets.length) {
        edit_otype = value.assets[0]?.meta?.type;
      }

      // @ts-ignore
      editWebLog(edit_otype, changeType);

      // // rotate-旋转
      // // scale-缩放
      // // move-移动
      // // unlock-解锁
      // multiSelect-多选
      // dbClick-双击
      // mouseout-鼠标移出

      let type;

      switch (changeType) {
        case 'stopRotate':
          type = 'rotate';
          break;
        case 'assetMove':
          type = 'move';
          setTimeout(() => {
            const active = getCurrentAsset();

            if (active) {
              const { posX, posY } = active.transform;
              const { width, height } = active.attribute;

              if (
                posX > Number(canvas.width) ||
                posY > Number(canvas.height) ||
                posY < -height ||
                posX < -width
              ) {
                clickActionWeblog('mouseout', { action_label: edit_otype });
              }
            }
          }, 100);
          break;
        case 'stopMove':
          type = 'scale';
          break;
        case 'toggleAssetEditStatus':
          type = 'unlock';
          break;
        case 'updateText':
          type = 'dbClick';
          edit_otype = 'text';
      }

      if (type) {
        clickActionWeblog(`canvas_${type}`, { action_label: edit_otype });
      }
    },
    { wait: 1000 },
  );
  return buried;
};

// 抠图受限埋点
export function mattingWeblog(
  title: string,
  params: {
    resId: number | string;
    vip_type: number | string;
  },
): void {
  const event = concatConciseModeSuffix(title);
  window?.xa?.track(event, {
    extra: JSON.stringify(params),
  });
}
