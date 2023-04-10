import historyRecord, { RecordData } from './index';

export function getTargetRecord(): RecordData {
  const { record, recordPoint } = historyRecord;
  if (record.length && recordPoint > -1) {
    return record[recordPoint];
  }

  return {
    templates: [],
    audios: [],
  };
}
