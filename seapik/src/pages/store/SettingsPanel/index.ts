import store from './store';

function activeSettingsPanel(menu: string) {
  store.setActive(menu);
}

function openSettingsPanel(open: boolean) {
  store.setOpen(open);
}

export function useSettingsPanel() {
  return {
    active: store.active,
    open: store.open,
    activeSettingsPanel,
    openSettingsPanel,
  };
}
