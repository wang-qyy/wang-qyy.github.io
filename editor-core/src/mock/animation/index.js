import inAnimation from './in.json';
import outAnimation from './out.json';
// const inAnimation = [];
// const outAnimation = [];
const aniList = {};
inAnimation.forEach(item => {
  item.list.forEach(ani => {
    aniList[ani.id] = ani;
  });
});
outAnimation.forEach(item => {
  item.list.forEach(ani => {
    aniList[ani.id] = ani;
  });
});
export { inAnimation, aniList, outAnimation };
