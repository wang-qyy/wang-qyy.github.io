import { observable, makeObservable, action, autorun } from "mobx";
import UndoRedoManager from "undo-redo-manager";

import ImageHandlerStore from "./store";

export function getCurrentStage() {
  return ImageHandlerStore.botCan?.toDataURL("image/png") ?? "";
}

class UndoRedoManagerStore {
  _preStage: string = getCurrentStage();
  @observable canRedo = false;

  @observable canUndo = false;

  undoRedoManager = new UndoRedoManager((stepDetail, isLastRollback) => {
    console.log(
      "undoRedoManager",
      stepDetail
      // isLastRollback,
      // ImageHandlerStore.isDown
    );

    const currentStage = getCurrentStage();

    // const img = new Image();

    // img.src = stepDetail;

    // img.onload = () => {
    //   document.body.appendChild(img);
    // };

    return currentStage;
  }, 50);

  constructor() {
    makeObservable(this);

    autorun(
      () => {
        this.undoRedoManager.push(this._preStage);
        this.updateState();
      },
      { delay: 300 }
    );
  }

  @action.bound
  updateState() {
    this.canUndo = this.undoRedoManager.canUndo;
    this.canRedo = this.undoRedoManager.canRedo;
  }

  @action.bound
  undo() {
    this.undoRedoManager.undo();
    this.updateState();
  }
  @action.bound
  redo() {
    this.undoRedoManager.redo();
    this.updateState();
  }

  @action.bound
  clear() {
    this.undoRedoManager.clear();
    this.updateState();
  }
}

export default new UndoRedoManagerStore();
