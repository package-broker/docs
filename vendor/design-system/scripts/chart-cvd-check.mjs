#!/usr/bin/env node
// First-order colour-vision check of the chart slots: Machado 2009 matrices (severity 1.0) in linear sRGB, distance in OKLab x 100, all slot pairs.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { oklchToLinearSrgb as lin } from './lib/color.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const t=JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));
// Machado 2009 severity 1.0 matrices on linear sRGB
const M={prot:[[0.152286,1.052583,-0.204868],[0.114503,0.786281,0.099216],[-0.003882,-0.048116,1.051998]],
deut:[[0.367322,0.860646,-0.227968],[0.280085,0.672501,0.047413],[-0.011820,0.042940,0.968881]],
trit:[[1.255528,-0.076749,-0.178779],[-0.078411,0.930809,0.147602],[0.004733,0.691367,0.303900]]};
const clamp=v=>Math.min(1,Math.max(0,v));
const toLab=([r,g,b])=>{const l=Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b),m=Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b),s=Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);return [0.2104542553*l+0.793617785*m-0.0040720468*s,1.9779984951*l-2.428592205*m+0.4505937099*s,0.0259040371*l+0.7827717662*m-0.808675766*s]};
const sim=(rgb,m)=>M[m].map(row=>clamp(row[0]*rgb[0]+row[1]*rgb[1]+row[2]*rgb[2]));
for(const mode of ['light','dark']){
 const cols=[1,2,3,4,5,6,7,8].map(i=>{const n=t.color.chart['series-'+i];return (mode==='light'?n.$value:n.$extensions['broker.package.modes'].dark).components});
 const rgbs=cols.map(c=>lin(c).map(clamp));
 for(const m of [null,'prot','deut','trit']){
  let min=999,pair;
  for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){const a=toLab(m?sim(rgbs[i],m):rgbs[i]),b=toLab(m?sim(rgbs[j],m):rgbs[j]);const d=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])*100;if(d<min){min=d;pair=[i+1,j+1]}}
  console.log(`${mode} ${m ?? 'normal'}: smallest OKLab distance ${min.toFixed(1)} (slots ${pair.join(' and ')})`);
 }
}
