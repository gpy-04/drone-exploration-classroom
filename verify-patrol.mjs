import fs from 'node:fs';import assert from 'node:assert/strict';import {dependency} from './toolchain.mjs';
const {chromium}=dependency('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:960}}),errors=[];
page.on('pageerror',e=>errors.push(e.stack));
try{
await page.goto('http://127.0.0.1:4196/#patrol');const f=page.frames().find(f=>f.url().includes('/experiments/patrol'));await f.waitForFunction(()=>window.hangzhouPatrol?.ready);await page.locator('[data-patrol=start]').first().click();await f.waitForFunction(()=>hangzhouPatrol.snapshot().status==='running');await f.evaluate(()=>hangzhouPatrol.freeze());
await page.screenshot({path:'output/anime-hangzhou-live.png',fullPage:true});
for(const [i,pos,verdict]of [[3,[-42,12,65],'legal'],[0,[-4,16,42],'signal'],[2,[80,15,22],'lane'],[1,[16,13,37],'crossing']]){
 await f.evaluate(({i,pos})=>{if(i===0){const phase=hangzhouPatrol.snapshot().elapsed%22;hangzhouPatrol.step((4-phase+22)%22);}hangzhouPatrol.setPose({position:pos});hangzhouPatrol.select(i);},{i,pos});
 console.log('BEFORE',i,await f.evaluate(()=>({status:hangzhouPatrol.snapshot().status,t:hangzhouPatrol.targeting()})));
 await page.locator('[data-patrol=capture]').first().click();await f.waitForFunction(()=>hangzhouPatrol.snapshot().scan!==null);await f.evaluate(()=>hangzhouPatrol.step(1.5));console.log('CAPTURE',i,await f.evaluate(()=>({scan:hangzhouPatrol.snapshot().scan,pending:hangzhouPatrol.snapshot().pending})));await f.waitForFunction(()=>hangzhouPatrol.snapshot().pending!==null);
 await page.screenshot({path:'output/patrol-evidence-'+i+'.png',fullPage:true});await page.locator('[data-verdict='+verdict+']').click();await f.waitForFunction(i=>hangzhouPatrol.snapshot().resolved.length>i,[3,0,2,1].indexOf(i));
}
assert.equal(await f.evaluate(()=>hangzhouPatrol.snapshot().status),'done');console.log('COMPLETE',await f.evaluate(()=>hangzhouPatrol.snapshot()));
}catch(e){errors.push(e.stack);}await browser.close();console.log('ERRORS',errors);if(errors.length)process.exitCode=1;
