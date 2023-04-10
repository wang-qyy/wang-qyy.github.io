import { action, makeObservable, observable, computed } from 'mobx';
import { drop, dropRight } from 'lodash-es';
import { deepCloneJson } from '@kernel/utils/single';
import { RawTemplateWithRender } from '@/kernel/typing';

export interface RecordData {
  templates: RawTemplateWithRender[];
}

class HistoryRecord {
  @observable.shallow record: RecordData[] = [];

  maxRecord = 50;

  @observable recordPoint = -1;

  @observable recordLength = -1;

  constructor() {
    makeObservable(this);
  }

  @computed
  get hasNext() {
    if (this.recordLength > 0) {
      return this.recordPoint !== this.record.length - 1;
    }
    return false;
  }

  @computed
  get hasPrev() {
    if (this.recordLength > 0) {
      return this.recordPoint > 0;
    }
    return false;
  }

  @action
  addRecord = (assetWork: RecordData) => {
    const { length } = this.record;
    const endPoint = length - 1;
    const newRecord = deepCloneJson(assetWork);

    if (length > 1) {
      // 此情况说明用户已经执行过回退操作，添加记录时，需要清除旧历史记录
      if (this.recordPoint !== endPoint) {
        this.record = dropRight(this.record, endPoint - this.recordPoint);
      }
      // 当记录点超过最大记录点时，需要删除前面的记录点
      if (length >= this.maxRecord) {
        this.record = drop(this.record);
      }
    }
    this.record.push(newRecord);
    this.recordLength = this.record.length;
    this.recordPoint = this.recordLength - 1;
  };

  @action
  updateRecord = (assetWork: RecordData) => {
    const newRecord = deepCloneJson(assetWork);
    this.record.splice(this.recordPoint, 1, newRecord);
  };

  @action
  goNext = () => {
    if (this.hasNext) {
      const target = this.recordPoint + 1;
      this.setRecordPoint(target);
      return this.record[target];
    }
  };

  @action
  goPrev = () => {
    if (this.hasPrev) {
      const target = this.recordPoint - 1;
      this.setRecordPoint(target);
      return this.record[target];
    }
  };

  @action
  setRecordPoint = (index: number) => {
    this.recordPoint = index;
  };

  @action
  getCurrentAssetWork = (index: number) => {
    return this.record[index];
  };

  @action
  initRecord = () => {
    this.record = [];
    this.recordPoint = -1;
    this.recordLength = -1;
  };
}

export const History = HistoryRecord;

export default new HistoryRecord();
