import store from './store';

function setActiveMenu(menu: string) {
  store.setActive(menu);
}

function openMenu(open: boolean) {
  store.setOpen(open);
}

export function useMenu() {
  return {
    active: store.active,
    open: store.open,
    setActiveMenu,
    openMenu,
  };
}
