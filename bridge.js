(() => {
  'use strict';
  if(parent===window)return;
  const kind=document.documentElement.dataset.classroom;
  let ready=false,interactions=0,lastKey='',observed=new Set(),revision=0;
  const api=()=>kind==='rotor'?window.rotor05:kind==='wing'?window.fixedwing:window.aero;
  const send=message=>{if(parent!==window)parent.postMessage({source:'drone-classroom-experiment',kind,...message},'*');};
  function toolsMarkup(){
    const source=document.querySelector('#tools-body');if(!source)return '';
    const clone=source.cloneNode(true),inputs=source.querySelectorAll('input,select,textarea');
    clone.querySelectorAll('input,select,textarea').forEach((el,i)=>{const original=inputs[i];if(el.tagName==='SELECT')Array.from(el.options).forEach((o,j)=>o.toggleAttribute('selected',original.selectedIndex===j));else{el.setAttribute('value',original.value);el.toggleAttribute('checked',original.checked||false);}});
    return clone.innerHTML;
  }
  function publish(force=false){
    const a=api();if(!a?.ready)return;
    if(!ready){ready=true;if(kind!=='flight')a.setState({selected:'overview',explosion:0,cut:false,isolate:false,throttle:0,labels:false});}
    if(kind==='flight'){
      const s=a.snapshot(),g=s.game;
      const message={type:'state',ready:true,interactions,revision,page:s.page,level:s.level,demo:s.demo,game:g?{id:g.id,status:g.status,elapsed:g.elapsed,score:g.score,summary:g.message||'',support:g.support}:null,tools:toolsMarkup(),metrics:Array.from(document.querySelectorAll('#readouts>div')).map(e=>[e.querySelector('small')?.textContent||'',e.querySelector('b')?.textContent||'']),live:document.querySelector('#live-note')?.textContent||'',variants:window.FlightCourse?.find(x=>x.id===s.page)?.levels||[],support:document.querySelector('#support-area')?.innerHTML||''};
      if(g?.status==='done'&&!s.demo){const record=s.progress?.[s.page]?.levels?.[s.level];if(record)message.result={score:record.score,summary:record.summary,facts:record.facts,date:record.date,review:record.review};}
      const key=JSON.stringify(message);if(force||key!==lastKey){lastKey=key;send(message);}
    }else{
      const s=a.getState();if(s.selected)observed.add(s.selected);
      send({type:'state',ready:true,state:s,interactions,revision,observed:[...observed],facts:Array.from(document.querySelectorAll('#facts>div')).map(e=>[e.querySelector('dt')?.textContent||'',e.querySelector('dd')?.textContent||''])});
    }
  }
  function findByData(name,value){return Array.from(document.querySelectorAll(`[data-${name}]`)).find(e=>e.getAttribute('data-'+name)===String(value));}
  addEventListener('message',event=>{
    const m=event.data;if(event.source!==parent||!m||m.source!=='drone-classroom-host'||m.kind!==kind)return;
    const a=api();if(!a?.ready){send({type:'waiting'});return;}
    try{
      if(m.command==='state'){publish(true);return;}
      if(kind!=='flight'){
        if(m.command==='set'&&m.value&&typeof m.value==='object'){a.setState(m.value);if(m.value.selected)observed.add(m.value.selected);}
        else if(m.command==='view'&&['three','front','side','top'].includes(m.value))a.view(m.value);
        else return;
      }else{
        let el;
        if(m.command==='action')el=Array.from(document.querySelectorAll('[data-action]')).find(e=>e.dataset.action===m.name&&(m.arg===undefined||e.dataset.arg===String(m.arg)));
        else if(m.command==='setting'){el=findByData('setting',m.name);if(el&&!el.disabled){el.value=m.value;el.dispatchEvent(new Event('change',{bubbles:true}));}}
        else if(m.command==='layer'){el=findByData('layer',m.name);if(el&&!el.disabled){el.checked=!!m.value;el.dispatchEvent(new Event('change',{bubbles:true}));}}
        else if(m.command==='hold'){el=findByData('hold',m.name);if(el&&!el.disabled)dispatchEvent(new KeyboardEvent(m.down?'keydown':'keyup',{code:m.name,bubbles:true}));}
        else if(m.command==='special'&&['pause','restart','demo','enable-support','exit-demo','start','resume'].includes(m.name))el=document.getElementById(m.name);
        else if(m.command==='route'&&window.FlightCourse.some(c=>c.id===m.id)){location.hash=m.id+'/'+Math.max(0,Math.min(2,Number(m.level)||0));return;}
        else return;
        if((m.command==='action'||m.command==='special')&&el&&!el.disabled)el.click();
        if(!el)return;
      }
      interactions++;revision++;publish(true);
    }catch(error){send({type:'error',message:'本次操作未完成，请重试。'});console.error(error);}
  });
  document.addEventListener('pointerdown',e=>{if(e.target.closest('#viewport,#canvas'))interactions++;},true);
  const timer=setInterval(publish,300);
  addEventListener('pagehide',()=>clearInterval(timer));
  publish(true);
})();
