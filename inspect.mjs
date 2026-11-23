import fs from 'node:fs';
import path from 'node:path';
import {dependency} from './toolchain.mjs';
const {chromium}=dependency('playwright');
fs.mkdirSync('output',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
for(const [route,name]of [['rotor/motor','classroom-desktop'],['museum/2021','museum-desktop'],['patrol','hangzhou-first-person']]){
  await page.goto('http://127.0.0.1:4196/#'+route);await page.waitForTimeout(route==='patrol'?3000:1600);
  if(route==='patrol'){const f=page.frames().find(f=>f.url().includes('/experiments/patrol'));await f.waitForFunction(()=>window.hangzhouPatrol?.ready);await page.locator('[data-patrol=start]').first().click();await page.waitForTimeout(400);console.log('PATROL',await f.evaluate(()=>hangzhouPatrol.snapshot()));}
  await page.screenshot({path:'output/'+name+'.png',fullPage:true});console.log(name,await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,width:innerWidth,height:document.documentElement.scrollHeight,heading:document.querySelector('h1')?.textContent})));}
console.log('ERRORS',errors);await browser.close();if(errors.length)process.exitCode=1;
