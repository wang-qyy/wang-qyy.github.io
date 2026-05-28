import { hasInvalidAncestor, isValidSvgTag } from './validator';

import { applyViewBoxTransform } from './applyViewBoxTransform';
export function parseSVGDocument(svg: Document) {
  const descendants = Array.from(svg.getElementsByTagName('*'));

  const options = { ...applyViewBoxTransform(svg.documentElement) }

  const elements = descendants.filter(el => {
    // http://www.w3.org/TR/SVG/struct.html#DefsElement
    return isValidSvgTag(el) && !hasInvalidAncestor(el);
  });

  if (!elements.length) {
    return {};
  }

  return {
    objects: [],
    elements: elements,
    options: options,
    allElements: descendants,
  };
}
