import fs from 'node:fs';
import path from 'node:path';
import {dependency,moduleDirectories} from './toolchain.mjs';
const root=import.meta.dirname,source=path.resolve(root,'..');
fs.mkdirSync(path.join(root,'experiments'),{recursive:true});
const bridge=fs.readFileSync(path.join(root,'bridge.js'),'utf8');
const skin=fs.readFileSync(path.join(root,'embed.css'),'utf8');
for(const [name,file] of [['rotor','无人机结构实验室.html'],['wing','固定翼无人机结构实验室.html'],['flight','drone-flight-lab-2d/dist/index.html']]){
  if(!fs.existsSync(path.join(source,file))){if(fs.existsSync(path.join(root,'experiments',name+'.html')))continue;throw new Error('缺少原始实验文件：'+file);}
  let html=fs.readFileSync(path.join(source,file),'utf8');
  if(name!=='flight')html=html.replace(/if\(idle>25/g,'if(false&&idle>25').replace(/if\(idle>45/g,'if(false&&idle>45');
  if(name==='flight'){
    const blur="window.addEventListener('blur',()=>engine?.pause());";
    if(!html.includes(blur))throw new Error('Game blur integration point changed');
    html=html.replace(blur,"window.addEventListener('blur',()=>{if(parent===window)engine?.pause();});");
  }
  html=html.replace('</head>',()=>`<style>${skin}</style><script>if(parent!==window)document.documentElement.dataset.classroom=${JSON.stringify(name)};</script></head>`);
  html=html.replace('</body>',()=>`<script>${bridge.replace(/<\/script/gi,'<\\/script')}</script></body>`);
  fs.writeFileSync(path.join(root,'experiments',name+'.html'),html);
}
const esbuild=dependency('esbuild');
const result=await esbuild.build({entryPoints:[path.join(root,'patrol/game.js')],bundle:true,write:false,format:'iife',platform:'browser',target:'es2022',minify:true,legalComments:'inline',nodePaths:moduleDirectories()});
const patrol=fs.readFileSync(path.join(root,'patrol/index.html'),'utf8').replace('/* PATROL_STYLE */',()=>fs.readFileSync(path.join(root,'patrol/styles.css'),'utf8')).replace('/* PATROL_SCRIPT */',()=>result.outputFiles[0].text.replace(/<\/script/gi,'<\\/script'));
fs.writeFileSync(path.join(root,'experiments/patrol.html'),patrol);
const threeLicense=moduleDirectories().map(dir=>path.join(dir,'three/LICENSE')).find(file=>fs.existsSync(file));if(threeLicense)fs.writeFileSync(path.join(root,'experiments/THREE-LICENSE.txt'),fs.readFileSync(threeLicense));
console.log('已构建两个离线模型实验和八关游戏，入口：'+path.join(root,'index.html'));
