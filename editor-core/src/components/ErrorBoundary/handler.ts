import { AssetType } from '@hc/editor-core';

class OperationRecord {
  actionType: string;

  assetId: number;

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
    assetId: number;
    assetType: string;
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

export default new OperationRecord();
