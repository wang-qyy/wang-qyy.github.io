import { Camera } from '@/kernel/typing';
import { deepCloneJson } from '@/kernel/utils/single';
import { action, makeObservable, observable } from 'mobx';
import { newId } from '@kernel/utils/idCreator';

export default class CameraState {
  @observable id = newId();

  @observable camera!: Camera;

  constructor(camera: Camera) {
    this.camera = camera;
    makeObservable(this);
  }

  @action
  update = (data: Camera) => {
    const target = this.camera;
    Object.assign(target, data);
  };

  /**
   * @description 获取元素的深克隆数据
   */
  getCameraCloned = () => {
    const data: Camera = {
      ...deepCloneJson(this.camera),
    };
    return data;
  };
}
