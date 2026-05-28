import{R as c}from"./index.DDnrJw8P.js";var E={exports:{}},a={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var f=Symbol.for("react.transitional.element"),k=Symbol.for("react.fragment");function d(e,t,s){var n=null;if(s!==void 0&&(n=""+s),t.key!==void 0&&(n=""+t.key),"key"in t){s={};for(var r in t)r!=="key"&&(s[r]=t[r])}else s=t;return t=s.ref,{$$typeof:f,type:e,key:n,ref:t!==void 0?t:null,props:s}}a.Fragment=k;a.jsx=d;a.jsxs=d;E.exports=a;var C=E.exports;const S=e=>{let t;const s=new Set,n=(o,l)=>{const u=typeof o=="function"?o(t):o;if(!Object.is(u,t)){const v=t;t=l??(typeof u!="object"||u===null)?u:Object.assign({},t,u),s.forEach(b=>b(t,v))}},r=()=>t,i={setState:n,getState:r,getInitialState:()=>j,subscribe:o=>(s.add(o),()=>s.delete(o))},j=t=e(n,r,i);return i},R=e=>e?S(e):S,p=e=>e;function T(e,t=p){const s=c.useSyncExternalStore(e.subscribe,c.useCallback(()=>t(e.getState()),[e,t]),c.useCallback(()=>t(e.getInitialState()),[e,t]));return c.useDebugValue(s),s}const x=e=>{const t=R(e),s=n=>T(t,n);return Object.assign(s,t),s},A=e=>e?x(e):x;export{A as c,C as j};
