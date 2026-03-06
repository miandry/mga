import{b4 as s,b5 as r,b6 as a,b7 as i,b8 as m}from"./index.js";/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const c=()=>{const t=window;t.addEventListener("statusTap",()=>{s(()=>{const n=document.elementFromPoint(t.innerWidth/2,t.innerHeight/2);if(!n)return;const e=r(n);e&&new Promise(o=>a(e,o)).then(()=>{i(async()=>{e.style.setProperty("--overflow","hidden"),await m(e,300),e.style.removeProperty("--overflow")})})})})};export{c as startStatusTap};
