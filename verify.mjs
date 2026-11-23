import fs from 'node:fs';
import assert from 'node:assert/strict';
import {dependency} from './toolchain.mjs';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const {chromium}=dependency('playwright');
fs.mkdirSync('output',{recursive:true});const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1440,height:960},acceptDownloads:true});
const errors=[],checks=[];let phase='load';page.on('pageerror',e=>errors.push({phase,message:e.message}));page.on('console',m=>{if(m.type()==='error')errors.push({phase,message:m.text()});});page.on('crash',()=>errors.push({phase,message:'page crashed'}));
const base='http://127.0.0.1:4196/';
const snapshot=()=>page.evaluate(()=>DroneClassroom.snapshot());
async function route(hash){await page.evaluate(h=>location.hash=h,hash);await page.waitForTimeout(100);}
async function ready(hash){await route(hash);await page.waitForFunction(()=>DroneClassroom.snapshot().experiment?.ready,{timeout:30000});}
async function prediction(){await page.locator('[data-prediction="0"]').click();await page.locator('#to-verify').click();}
async function range(id,value){await page.locator('#'+id).evaluate((e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));},String(value));await page.waitForTimeout(370);}
async function capture(){const n=await page.locator('[data-step="2"]').count();assert(n);await page.locator('#capture').click();await page.waitForSelector('#back-verify');}
async function back(){await page.locator('#back-verify').click();}
async function part(id){await page.locator('[data-part="'+id+'"]').click();await page.waitForFunction(id=>DroneClassroom.snapshot().experiment?.state.selected===id,id);}
async function ensureCut(){if(await page.locator('#cut').getAttribute('aria-pressed')==='false'){await page.locator('#cut').click();await page.waitForFunction(()=>DroneClassroom.snapshot().experiment.state.cut);}}
try{
await page.goto(base);await page.waitForFunction(()=>DroneClassroom.snapshot().experiment?.ready);assert.equal(await page.locator('[data-chapter]').count(),5);
phase='model workflows';
for(const [hash,test,correct]of [['rotor/motor','motor',1],['rotor/control','parts',1],['rotor/energy','energy',0],['wing/airfoil','wing',2],['wing/surfaces','surfaces',1],['wing/pusher','motor',0]]){
  await ready('#'+hash);await prediction();
  if(test==='motor'){await part('motor');await ensureCut();await range('throttle',30);await capture();}
  else if(test==='parts'){await part('fc');await capture();await back();await part('esc');await capture();}
  else if(test==='energy'){await range('spread',70);await capture();await back();await part('battery');await capture();}
  else if(test==='wing'){await part('wing');await ensureCut();await capture();await page.screenshot({path:'output/fixed-wing-evidence.png',fullPage:true});}
  else {await part('tail');await range('control-roll',60);await range('control-pitch',40);await capture();}
  await page.locator('#to-explain').click();await page.locator('[data-finding="'+correct+'"]').click();await page.locator('#save-finding').click();await page.waitForSelector('#revisit');checks.push({type:'actual model controls, evidence and finding',activity:hash});console.log('PASS',hash);
}
assert.equal((await snapshot()).recordCount,6);
phase='museum';
await route('#museum');for(const [id,answer]of [['beijing5',0],['ck1',1],['phantom',2],['agriculture',0],['ar500c',1],['emergency',2]]){const card=page.locator('[data-exhibit="'+id+'"]');await card.locator('[data-point="0"]').click();await card.locator('[data-point="1"]').click();await card.locator('[data-answer="'+answer+'"]').click();await card.locator('[data-save]').click();checks.push({type:'China museum observed two points and answered without page navigation',id});}
phase='game load and real inputs';
for(const id of ['assembly','valley','rescue','coding','patrol','changes','puzzle','sources']){
 await ready('#flight/'+id);await prediction();const f=page.frames().find(f=>f.url().includes('/experiments/flight.html'));await f.locator('#start').click();await page.waitForTimeout(500);
 assert.equal((await snapshot()).experiment.game.status,'running',id+' started');
 if(id==='assembly'){await page.locator('#game-controls [data-action="part"][data-arg="distance"]').click();await f.waitForFunction(()=>aero.snapshot().game.model.parts.distance);}
 else if(id==='coding'){await page.locator('#game-controls [data-action="add"][data-arg="E"]').click();await f.waitForFunction(()=>aero.snapshot().game.model.blocks.length>0);}
 else if(id==='rescue'){await page.locator('#game-controls [data-action="chute"]').click();await f.waitForFunction(()=>aero.snapshot().game.model.opened);}
 else {await f.locator('#canvas').click({position:{x:100,y:100}});await page.keyboard.press('ArrowUp');await page.keyboard.press('Space');}
 assert((await f.evaluate(()=>aero.snapshot().game.elapsed))>0,id+' live');checks.push({type:'embedded game load, idle, actual input',id});console.log('PASS game',id);
}
phase='game demonstration isolation and completion';
await ready('#flight/coding');await prediction();let f=page.frames().find(f=>f.url().includes('/experiments/flight.html'));await f.locator('#start').click();await f.evaluate(()=>aero.freeze());await page.locator('[data-special="demo"]').click();await f.waitForFunction(()=>aero.snapshot().demo);await f.evaluate(()=>aero.step(200));await page.waitForTimeout(400);assert.equal((await f.evaluate(()=>aero.snapshot().game.status)),'done');assert.equal((await snapshot()).recordCount,12);await page.locator('#exit-demo').click();await f.waitForFunction(()=>!aero.snapshot().demo);
const solution=await f.evaluate(()=>new FlightGames.Coding(0,{}).map.solution);
for(const [dir,n]of solution){let remaining=n;while(remaining>0){const q=Math.min(3,remaining);await page.locator('#game-controls [data-setting="steps"]').selectOption(String(q));await page.waitForTimeout(350);await page.locator(`#game-controls [data-action="add"][data-arg="${dir}"]`).click();await page.waitForTimeout(350);remaining-=q;}}
await page.locator('#game-controls [data-action="run"]').click();await page.waitForTimeout(150);await f.evaluate(()=>aero.step(40));await f.waitForFunction(()=>aero.snapshot().game.status==='done');await page.waitForTimeout(600);await page.locator('#to-evidence').click();await page.locator('#to-explain').click();await page.locator('[data-finding="2"]').click();await page.locator('#save-finding').click();await page.waitForSelector('#revisit');assert.equal((await snapshot()).recordCount,13);checks.push({type:'demonstration isolated, real coding task solved through mirrored UI and saved'});
phase='patrol invariants and first person';
await route('#patrol');f=page.frames().find(f=>f.url().includes('/experiments/patrol.html'));await f.waitForFunction(()=>window.hangzhouPatrol?.ready);await page.locator('[data-patrol="start"]').first().click();await f.evaluate(()=>hangzhouPatrol.freeze());
await f.evaluate(()=>hangzhouPatrol.step(60));let s=await f.evaluate(()=>hangzhouPatrol.snapshot());assert.equal(s.score,0);assert.equal(s.resolved.length,0);await f.evaluate(()=>hangzhouPatrol.command('verdict','legal'));assert.equal((await f.evaluate(()=>hangzhouPatrol.snapshot())).score,0);checks.push({type:'idle and report without evidence cannot score'});
await f.evaluate(()=>{hangzhouPatrol.select(2);hangzhouPatrol.command('capture');});assert.equal((await f.evaluate(()=>hangzhouPatrol.snapshot())).pending,null);checks.push({type:'distant target cannot produce evidence'});
await f.locator('#flight-view').focus();await page.keyboard.down('KeyW');await f.evaluate(()=>hangzhouPatrol.step(.8));await page.keyboard.up('KeyW');s=await f.evaluate(()=>hangzhouPatrol.snapshot());assert(s.velocity.some(v=>Math.abs(v)>2));await page.locator('[data-patrol="hover"]').click();await f.waitForFunction(()=>hangzhouPatrol.snapshot().velocity.every(v=>Math.abs(v)<.01));assert.equal((await f.evaluate(()=>hangzhouPatrol.snapshot())).status,'running','clicking classroom tools must not pause the game');checks.push({type:'real keyboard flight and host hover'});
await page.locator('[data-patrol="pause"]').click();await f.waitForFunction(()=>hangzhouPatrol.snapshot().status==='paused');const paused=await f.evaluate(()=>hangzhouPatrol.snapshot());await f.evaluate(()=>hangzhouPatrol.step(5));assert.equal((await f.evaluate(()=>hangzhouPatrol.snapshot())).elapsed,paused.elapsed);await page.locator('[data-patrol="start"]').first().click();await f.waitForFunction(()=>hangzhouPatrol.snapshot().status==='running');checks.push({type:'pause freezes world and exposure'});
// Fixed poses place the camera at repeatable test viewpoints; captures and verdicts use production rules.
for(const [i,pos,verdict]of [[3,[-42,12,65],'legal'],[0,[-4,16,42],'signal'],[2,[80,15,22],'lane'],[1,[16,13,37],'crossing']]){
 await f.evaluate(({i,pos})=>{if(i===0){const phase=hangzhouPatrol.snapshot().elapsed%22;hangzhouPatrol.step((4-phase+22)%22);}hangzhouPatrol.setPose({position:pos});hangzhouPatrol.select(i);}, {i,pos});
 const t=await f.evaluate(()=>hangzhouPatrol.targeting());assert(t.eligible,'capture eligible '+i+': '+JSON.stringify(t));await page.locator('[data-patrol="capture"]').first().click();await f.waitForFunction(()=>hangzhouPatrol.snapshot().scan!==null);await f.evaluate(()=>hangzhouPatrol.step(1.5));await f.waitForFunction(()=>hangzhouPatrol.snapshot().pending!==null);await page.waitForTimeout(50);
 if(i===3){await page.locator('[data-verdict="lane"]').click();assert.equal((await f.evaluate(()=>hangzhouPatrol.snapshot())).resolved.length,0);checks.push({type:'legal target cannot be completed by false accusation'});}
 if(i===0){assert.equal((await f.evaluate(()=>hangzhouPatrol.snapshot().pending.facts.signal)),'红灯');await f.evaluate(()=>hangzhouPatrol.step(8));assert.equal((await f.evaluate(()=>hangzhouPatrol.snapshot().signal.red)),false);}
 await page.locator('[data-verdict="'+verdict+'"]').click();await page.waitForTimeout(120);console.log('PASS patrol case',i);checks.push({type:'stable capture and evidence based verdict',case:i});
}
s=await f.evaluate(()=>hangzhouPatrol.snapshot());assert.equal(s.status,'done');assert.equal(s.resolved.length,4);assert.equal(s.evidence.length,4);assert.equal((await snapshot()).recordCount,14);const score=s.score;await f.evaluate(()=>hangzhouPatrol.command('verdict','crossing'));assert.equal((await f.evaluate(()=>hangzhouPatrol.snapshot())).score,score);checks.push({type:'four unique cases, one legal release, capture-time signal retained, duplicate verdict cannot score'});
await page.screenshot({path:'output/patrol-complete.png',fullPage:true});
phase='report export persistence';await route('#report');const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;
if(download)await download.saveAs('output/learning-records.json');
await page.reload();await page.waitForSelector('.report-page');assert.equal(await page.locator('.report-row>span').filter({hasText:'已记录'}).count(),14);checks.push({type:'records persist across reload'});
phase='responsive routes';for(const width of [390,768,1440]){await page.setViewportSize({width,height:900});for(const hash of ['#museum','#rotor/motor','#wing/airfoil','#flight/puzzle','#patrol','#report']){await route(hash);await page.waitForTimeout(350);assert(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'horizontal overflow '+width+'/'+hash);if(hash==='#patrol'){const pf=page.frames().find(f=>f.url().includes('/experiments/patrol.html'));await pf.waitForFunction(()=>window.hangzhouPatrol?.ready);await page.locator('[data-patrol="start"]').first().click();if(width===1440){await pf.evaluate(()=>{hangzhouPatrol.setPose({position:[31,34,56],yaw:-.44,pitch:-.18});});}await page.waitForTimeout(100);}if(width===390||width===1440)await page.screenshot({path:'output/'+hash.slice(1).replace('/','-')+'-'+width+'.png',fullPage:true});checks.push({type:'responsive layout',width,hash});}}
phase='offline file';await page.goto(pathToFileURL(path.join(import.meta.dirname,'index.html')).href);await page.waitForFunction(()=>DroneClassroom.snapshot().experiment?.ready);assert.equal((await snapshot()).chapter,'rotor');checks.push({type:'offline file and cross-document bridge work'});
}catch(e){errors.push({phase,message:e.stack});}
await browser.close();fs.writeFileSync('output/validation.json',JSON.stringify({date:new Date().toISOString(),checks,errors},null,2));console.log(JSON.stringify({checks:checks.length,errors},null,2));if(errors.length)process.exitCode=1;
