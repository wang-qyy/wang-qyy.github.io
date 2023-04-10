import assetHandler from '@kernel/store/assetHandler';
import historyRecord, { RecordData } from '@kernel/store/historyRecord';
import { assetBlur } from '@kernel/store';
import { debounce } from 'lodash-es';
import { buildPureTemplatesWithRender } from '@kernel/utils/assetHelper/formater/dataBuilder';

function resetData(data: RecordData) {
  const { templates } = data;
  assetBlur();
  assetHandler.restoreAllTemplate(templates);
}

/**
 * @description 反撤销
 * */
export function goNext() {
  const data = historyRecord.goNext();
  if (data) {
    resetData(data);
  }
}

/**
 * @description 撤销
 * */
export function goPrev() {
  const data = historyRecord.goPrev();
  if (data) {
    resetData(data);
  }
}

/**
 * @description 操作历史记录
 */
export function useHistoryRecord() {
  const { hasNext, hasPrev } = historyRecord;

  return {
    value: {
      hasNext,
      hasPrev,
    },
    goNext,
    goPrev,
  };
}

/**
 * @description 记录当前操作
 */
export const recordHistory = debounce(() => {
  historyRecord.addRecord({
    templates: buildPureTemplatesWithRender(assetHandler.templates),
  });
}, 300);

// 有的值是异步更新的，在更新后需要同步更新历史记录里的值 eg: rt_blob_url
export const updateRecord = () => {
  historyRecord.updateRecord({
    templates: buildPureTemplatesWithRender(assetHandler.templates),
  });
};
