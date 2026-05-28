import {
  svgInvalidAncestors,
  svgValidParents,
  svgValidTagNames,
  svgViewBoxElements,
} from './constants';

export function getSvgRegex(arr: string[]) {
  return new RegExp('^(' + arr.join('|') + ')\\b', 'i');
}

export const svgViewBoxElementsRegEx = getSvgRegex(svgViewBoxElements);
export const svgValidParentsRegEx = getSvgRegex(svgValidParents);
const svgValidTagNamesRegEx = getSvgRegex(svgValidTagNames);
const svgInvalidAncestorsRegEx = getSvgRegex(svgInvalidAncestors);
const getTagName = (node: Element) => node.tagName.replace('svg:', '');
export const isValidSvgTag = (el: Element) => svgValidTagNamesRegEx.test(getTagName(el));
export function hasInvalidAncestor(element: Element) {
  let _element: Element | null = element;
  while (_element && (_element = _element.parentElement)) {
    if (
      _element &&
      _element.nodeName &&
      svgInvalidAncestorsRegEx.test(getTagName(_element)) &&
      !_element.getAttribute('instantiated_by_use')
    ) {
      return true;
    }
  }
  return false;
}
