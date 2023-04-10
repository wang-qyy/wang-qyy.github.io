declare module '*.css';
declare module '*.less';
declare module '*.png';
declare module '*.svg' {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>,
  ): React.ReactElement;
  const url: string;
  export default url;
}

declare module 'fabric' {
  // @ts-ignore
  // import { fabric } from 'fabric';

  export default fabric;
}

declare module "*?static" {
  const url: string;
  export default url;
}
