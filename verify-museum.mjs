import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {dependency} from './toolchain.mjs';
const {chromium}=dependency('playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:960},reducedMotion:'reduce'});
const errors=[],checks=[];let outbound=0;
page.on('pageerror',e=>errors.push(e.message));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4196/')&&!r.url().startsWith('file:')&&!r.url().startsWith('data:'))outbound++;});
try{
  await page.goto('http://127.0.0.1:4196/#museum');
  await page.waitForFunction(()=>document.querySelectorAll('.museum-photo img').length===6&&[...document.querySelectorAll('.museum-photo img')].every(i=>i.complete&&i.naturalWidth>0));
  assert.equal(await page.locator('.museum-exhibit').count(),6);
  assert.equal(await page.locator('.museum-illustration').count(),0);
  checks.push('Six real local photographs loaded; no generated exhibit illustrations.');
  await page.evaluate(()=>window.museumMountToken='preserved');
  const initialURL=page.url();
  for(const target of ['exhibit-ck1','exhibit-ar500c','museum-ai','museum-future']){
    await page.locator('[data-scroll="'+target+'"]').click();
    await page.waitForFunction(id=>document.getElementById(id).getBoundingClientRect().top>=0&&document.getElementById(id).getBoundingClientRect().top<innerHeight,target).catch(async()=>{
      assert(await page.locator('#'+target).isVisible());
    });
    assert.equal(page.url(),initialURL);
    assert.equal(await page.evaluate(()=>window.museumMountToken),'preserved');
  }
  checks.push('Museum directory scrolls within the same mounted document without hash or page changes.');
  const first=page.locator('[data-exhibit="beijing5"]');
  await first.locator('[data-save]').click();
  assert.match(await first.locator('[data-feedback]').textContent(),/先观察/);
  for(const [id,answer]of [['beijing5',0],['ck1',1],['phantom',2],['agriculture',0],['ar500c',1],['emergency',2]]){
    const card=page.locator('[data-exhibit="'+id+'"]');
    await card.locator('[data-point="0"]').click();await card.locator('[data-point="1"]').click();
    await card.locator('[data-answer="'+answer+'"]').click();await card.locator('[data-save]').click();
    assert.match(await card.locator('[data-feedback]').textContent(),/发现已保存/);
  }
  assert.equal(await page.locator('#record-count').textContent(),'6');
  checks.push('All six observation records save independently; evidence is required.');
  for(const [id,text]of [['traffic','信号'],['farm','地块'],['rescue','灾情']]){
    await page.locator('[data-scenario="'+id+'"]').click();
    assert.match(await page.locator('#museum-scenario').textContent(),new RegExp(text));
    assert.match(await page.locator('#museum-scenario').textContent(),/DeepSeek/);
    assert.equal(await page.locator('.museum-ai-workflow article').count(),4);
  }
  assert.equal(outbound,0);
  checks.push('Three UAV / domestic AI workflows switch locally; no network AI calls.');
  const idea='无人机配合 AI 识别森林中疑似受损区域，再由护林员实地确认。';
  await page.locator('#museum-future-note').fill(idea);await page.locator('#museum-save-future').click();
  await page.reload();assert.equal(await page.locator('#museum-future-note').inputValue(),idea);
  checks.push('Future imagination text persists after reload.');
  await page.goto('http://127.0.0.1:4196/#report');
  assert.match(await page.locator('.report-summary').textContent(),/6\s*\/\s*21/);
  assert.equal(await page.locator('.report-row>span').filter({hasText:'已记录'}).count(),6);
  checks.push('Report includes six new museum records and 21 total activities.');
  for(const width of [390,768,1440]){
    await page.setViewportSize({width,height:960});
    await page.goto('http://127.0.0.1:4196/#museum');
    await page.waitForFunction(()=>[...document.querySelectorAll('.museum-photo img')].every(i=>i.complete&&i.naturalWidth>0));
    assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1));
    await page.screenshot({path:'output/museum-china-'+width+'.png',fullPage:true});
    for(const [id,name]of [['exhibit-ar500c','helicopter'],['museum-ai','ai'],['museum-future','future']]){
      await page.locator('#'+id).scrollIntoViewIfNeeded();
      if(width!==768)await page.screenshot({path:'output/museum-'+name+'-'+width+'.png'});
    }
    checks.push('Museum responsive layout and local photographs: '+width+' px.');
  }
  await page.goto(pathToFileURL(path.join(import.meta.dirname,'index.html')).href+'#museum');
  await page.waitForFunction(()=>[...document.querySelectorAll('.museum-photo img')].every(i=>i.complete&&i.naturalWidth>0));
  assert.equal(await page.locator('.museum-photo img').count(),6);
  await page.locator('[data-scroll="museum-future"]').click();assert.match(page.url(),/#museum$/);
  checks.push('Offline file entry loads all photographs and preserves in-page navigation.');
}catch(e){errors.push(e.stack);}finally{await browser.close();}
fs.writeFileSync('output/museum-validation.json',JSON.stringify({date:new Date().toISOString(),checks,errors},null,2));
console.log(JSON.stringify({checks:checks.length,errors},null,2));if(errors.length)process.exitCode=1;
