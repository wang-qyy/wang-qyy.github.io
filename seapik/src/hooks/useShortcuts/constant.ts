export enum keyCodes {
  KeyC_ctrlKey = 'KeyC_ctrlKey',
  KeyV_ctrlKey = 'KeyV_ctrlKey',
  KeyZ_ctrlKey = 'KeyZ_ctrlKey',
  KeyY_ctrlKey = 'KeyY_ctrlKey',
  KeyS_ctrlKey = 'KeyS_ctrlKey',
  Delete = 'Delete',
  KeyC = 'KeyC',
  Space = 'Space',
  Backspace = 'Backspace',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
}

export const comboCode: Record<string, keyof KeyboardEvent> = {
  ctrl: 'ctrlKey',
  command: 'ctrlKey', // mac 的 command 视为 ctrl
  shift: 'shiftKey',
};
