import { parseSVGDocument } from './parser/parseSVGDocument'


export class SVGClass {
  constructor() { }

  loadFromUrl(url: string) {

    return new Promise(async (resolve, reject) => {
      const res = await fetch(url);
      res.text().then(svgString => {
        resolve(this.loadFromString(svgString))
      });
    });
  }

  loadFromString(svgString: string) {

    const parser = new DOMParser();

    // const doc = parser.parseFromString(svgString.trim(), "image/svg+xml");
    const doc = parser.parseFromString(svgString.trim(), "text/xml");

    return parseSVGDocument(doc)
  }
}
