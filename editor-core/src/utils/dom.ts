export const getScreenSize = () => {
  if (window.innerWidth > 1440) return 'large';
  return 'small';
};
