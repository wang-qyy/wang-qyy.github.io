import { observable, action, makeObservable, flow } from 'mobx';
import { getDraft } from '@/apis/global';
import { config } from '@/config/constants';
import { textRes } from '@/mock/texts';

function testData() {
  return new Promise((rej) => {
    setTimeout(() => {
      rej(textRes);
    }, 1000);
  });
}
class TextsStore {
  @observable texts: any[] = [];
  @observable loading: boolean = false;

  constructor() {
    makeObservable(this);
    this.getTexts();
  }

  @flow
  *getTexts() {
    this.loading = true;
    const res = yield getDraft({ is_designer: config.is_designer });

    if (res.code == 200) {
      this.texts = res.data;
    }
    this.loading = false;
  }
}

const textsStore = new TextsStore();
export default textsStore;
