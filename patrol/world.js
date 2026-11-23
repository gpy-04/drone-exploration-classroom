import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

export function createWorld(scene){
  const staticRoot=new THREE.Group(),dynamicRoot=new THREE.Group();scene.add(staticRoot,dynamicRoot);
  const colliders=[],materials=new Map(),edges=[];
  const mat=(color)=>{if(!materials.has(color))materials.set(color,new THREE.MeshToonMaterial({color}));return materials.get(color);};
  function mesh(geo,color,x,y,z,parent=staticRoot,outline=false){const o=new THREE.Mesh(geo,typeof color==='number'?mat(color):color);o.position.set(x,y,z);parent.add(o);o.userData.outline=outline;return o;}
  const box=(w,h,d,color,x,y,z,parent=staticRoot,outline=false)=>mesh(new THREE.BoxGeometry(w,h,d),color,x,y,z,parent,outline);
  const cyl=(r1,r2,h,color,x,y,z,n=12,parent=staticRoot,outline=false)=>mesh(new THREE.CylinderGeometry(r1,r2,h,n),color,x,y,z,parent,outline);
  function sign(text,x,y,z,width=13,height=3,color='#316f76',parent=staticRoot){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle=color;c.fillRect(0,0,512,128);c.strokeStyle='#f8f4dd';c.lineWidth=4;c.strokeRect(7,7,498,114);c.fillStyle='#fffbe9';c.font="bold 48px 'Microsoft YaHei', sans-serif";c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,65);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});const o=mesh(new THREE.PlaneGeometry(width,height),material,x,y,z,parent);return o;}
  // A bright, illustrated city. The landmarks are deliberately recomposed, not a real road map.
  box(900,1,900,0xb5cba4,0,-.7,-40);
  box(330,.15,23,0x657984,0,.02,0);box(23,.16,330,0x657984,0,.03,-35);
  for(const z of [-13,13])box(330,.25,3,0xd9d6be,0,.08,z);
  for(const x of [-13,13])box(3,.26,330,0xd9d6be,x,.08,-35);
  for(let x=-155;x<=155;x+=11){if(Math.abs(x)>16){box(5,.035,.16,0xf5edcc,x,.13,0);box(5,.035,.14,0xf5edcc,x,.13,-6);box(5,.035,.14,0xf5edcc,x,.13,6);}}
  for(let z=-185;z<120;z+=11){if(Math.abs(z)>16){box(.16,.035,5,0xf5edcc,0,.14,z);box(.14,.035,5,0xf5edcc,-6,.14,z);box(.14,.035,5,0xf5edcc,6,.14,z);}}
  // Pedestrian crossings and stop lines are real geometry in the same traffic world.
  for(let i=-4;i<=4;i++){box(1.1,.055,5.4,0xfff8dd,i*2,.2,-16);box(1.1,.055,5.4,0xfff8dd,i*2,.2,16);box(5.4,.055,1.1,0xfff8dd,16,.2,i*2);box(5.4,.055,1.1,0xfff8dd,-16,.2,i*2);}
  box(9,.065,.45,0xfff8dd,-5,.2,-21);box(9,.065,.45,0xfff8dd,5,.2,21);
  // A marked special lane and parking bay; the rules are explicit fictional notices.
  box(86,.06,3.7,0x637c81,91,.19,-8);box(88,.07,.24,0xe5b45e,91,.21,-10);box(88,.07,.24,0xe5b45e,91,.21,-6);
  for(let i=0;i<4;i++)sign('公交专用',55+i*23,.25,-8,7,2.2,'#637c81').rotation.x=-Math.PI/2;
  box(6.5,.12,13,0x9eb4ac,-42,.12,36);const bx=-42,bz=36;box(.25,.1,13,0xfff8dd,bx-3.1,.24,bz);box(.25,.1,13,0xfff8dd,bx+3.1,.24,bz);box(6.3,.1,.25,0xfff8dd,bx,.24,bz+6.4);box(6.3,.1,.25,0xfff8dd,bx,.24,bz-6.4);
  const parking=sign('P 合法停车位',-44,4,44,9,2.5);box(.23,5,.23,0x536c65,-44,2.3,44.2);
  const bus=sign('教学专用道 · 普通车禁入',82,5,-14.3,24,2.8);box(.28,5,.28,0x536c65,72,2.5,-14.6);box(.28,5,.28,0x536c65,92,2.5,-14.6);
  sign('钱江路 · 教学路网',-15,7,-26,17,2.7);box(.25,7,.25,0x536c65,-22,3.5,-26.1);
  sign('行人优先 · 请勿占用',26,4.8,18,15,2.6);box(.25,5,.25,0x536c65,22,2.5,18.1);
  function building(x,z,w,d,h,color){
    box(w+1,.45,d+1,0x9aac97,x,.1,z);box(w,h,d,color,x,h/2+.3,z,staticRoot,true);box(w+.6,.6,d+.6,0xe4dcc6,x,h+.6,z,staticRoot,true);box(w*.72,1,d*.7,0x8fa49a,x,h+1.3,z);
    const cols=Math.max(2,Math.floor(w/3)),floors=Math.max(2,Math.floor(h/3.8));
    for(let a=0;a<cols;a++)for(let b=0;b<floors;b++){const wx=x-w*.38+(a/(cols-1))*w*.76,wy=3+b*3.6;box(1.25,1.65,.08,0x729a9c,wx,wy,z+d/2+.045);box(1.25,1.65,.08,0x86afb0,wx,wy,z-d/2-.045);}
    for(let side of [-1,1])for(let b=0;b<floors;b++){box(.08,1.65,d*.65,0x83a6a6,x+side*(w/2+.045),3+b*3.6,z);}
    colliders.push(new THREE.Box3(new THREE.Vector3(x-w/2-1,0,z-d/2-1),new THREE.Vector3(x+w/2+1,h+2.5,z+d/2+1)));
  }
  let seed=20261119;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const colors=[0xd7cdb3,0xf0dfc0,0xb7ccc1,0xb2c5c9,0xd3c1ae,0xc5d1b4];
  for(const x of [-86,-54,-28,28,56,86])for(const z of [-96,-62,-33,40,76]){if(x< -50&&z<-40||x===86&&z<-50||x===-54&&z===40)continue;building(x+(random()-.5)*4,z+(random()-.5)*4,13+random()*6,14+random()*7,10+random()*21,colors[Math.floor(random()*colors.length)]);}
  // West Lake, soft hills and an octagonal pagoda establish an anime Hangzhou silhouette.
  const lake=mesh(new THREE.CircleGeometry(64,64),0x80bcc0,-131,-.05,-67);lake.rotation.x=-Math.PI/2;lake.scale.set(.75,1.3,1);
  for(let k=0;k<5;k++){const hill=mesh(new THREE.SphereGeometry(34+k*5,12,8),0x89ac8a,-150+k*24,0,-194-k*9);hill.scale.set(1,.45,1);}
  const pagoda=new THREE.Group();pagoda.position.set(-119,3,-132);staticRoot.add(pagoda);cyl(15,18,3,0xadc099,0,0,0,16,pagoda);for(let i=0;i<5;i++){const r=8.3-i*.8,y=3+i*5.1;cyl(r,r,4.6,0xd6ac75,0,y,0,8,pagoda,true);cyl(r*1.45,r*.85,1.8,0x526b60,0,y+2.7,0,8,pagoda,true);for(let j=0;j<8;j++){const a=j*Math.PI/4;box(.6,3.5,.6,0x8f6c53,Math.sin(a)*r,y,Math.cos(a)*r,pagoda);}}cyl(0,2.2,4,0x65755e,0,30.5,0,8,pagoda);sign('西湖 · 雷峰塔意象',-119,38,-132,24,3,'#657f6a');
  colliders.push(new THREE.Box3(new THREE.Vector3(-133,0,-146),new THREE.Vector3(-105,35,-118)));
  // Qiantang River and a stylized bridge.
  box(245,.15,660,0x82b4be,268,-.22,-100);box(8,.9,400,0xddcda9,143,.1,-70);box(4,.35,400,0xb6c896,136,.2,-70);
  for(let z=-230;z<130;z+=12){box(.14,1.5,.14,0x577c78,145,1,z);box(.14,.15,12,0x638984,145,1.8,z+6);}
  box(270,1.6,12,0x829a97,260,9,-160);for(const x of [185,310]){box(2,43,2,0xe0d9c2,x,22,-164);box(2,43,2,0xe0d9c2,x,22,-156);box(3,2,12,0xe0d9c2,x,43,-160);for(let i=-4;i<=4;i++){const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,42,-154.8),new THREE.Vector3(x+i*12,10,-154.8)]),new THREE.LineBasicMaterial({color:0xd9dfcc}));staticRoot.add(line);}}
  // Golden conference sphere and the theatre canopy by the river.
  cyl(23,26,3,0xc6c1a8,111,1.4,-109,40,staticRoot,true);
  const gold=mesh(new THREE.SphereGeometry(16,40,28),0xe6b765,111,17.5,-109,staticRoot,true);gold.scale.y=.94;
  for(let i=-2;i<=2;i++){const y=i*5,r=Math.sqrt(16*16-y*y);const ring=mesh(new THREE.TorusGeometry(r,.09,4,64),0xa58354,111,17.5+y,-109);ring.rotation.x=Math.PI/2;}
  for(let a=0;a<Math.PI;a+=Math.PI/6){const ring=mesh(new THREE.TorusGeometry(16,.075,4,64),0xbe985e,111,17.5,-109);ring.rotation.y=a;}
  colliders.push(new THREE.Box3(new THREE.Vector3(94,0,-126),new THREE.Vector3(128,34,-92)));
  const theatre=mesh(new THREE.SphereGeometry(19,24,16,0,Math.PI*2,0,Math.PI/2),0xe2e8dd,102,3,-63,staticRoot,true);theatre.scale.set(1.5,.7,.7);box(45,4,21,0xb3c7c6,102,2,-63,staticRoot,true);
  sign('钱江新城 · 城市阳台',106,39,-102,35,3.8,'#4b7f7c');
  colliders.push(new THREE.Box3(new THREE.Vector3(78,0,-76),new THREE.Vector3(127,18,-50)));
  // Two distant skyline gates, an intentionally illustrated city horizon.
  for(let x of [-20,21])building(x,-174,23,24,63,0xa4bac0);box(66,5,27,0xb8c9c8,0,61,-174,staticRoot,true);
  function tree(x,z,r=2){cyl(.28,.4,3.2,0x8d7960,x,1.6,z,8);mesh(new THREE.IcosahedronGeometry(r,1),0x6b9c83,x,4.2,z);mesh(new THREE.IcosahedronGeometry(r*.8,0),0x82ad88,x+r*.4,5.3,z);}
  for(let z=-150;z<115;z+=14){tree(17,z,1.8);if(Math.abs(z)>24)tree(-17,z,1.9);tree(135,z,2.2);}
  for(let x=-140;x<130;x+=16){if(Math.abs(x)>24){tree(x,19,1.8);tree(x,-19,1.9);}}
  // Chunky cloud silhouettes, stationary so flight cues come from the ground.
  const cloudMat=new THREE.MeshBasicMaterial({color:0xf3f3e6});for(const [x,y,z,s]of [[-130,86,-260,1],[80,100,-320,1.5],[240,92,-230,1.2],[-260,95,-110,1.1]])for(let k=0;k<4;k++){const o=mesh(new THREE.SphereGeometry(12,12,8),cloudMat,x+k*12,y+(k%2)*5,z);o.scale.set(1.4*s,.65*s,.7*s);}
  function car(color,x,z,rotation=0){const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rotation;dynamicRoot.add(group);box(2.2,.7,4.4,color,0,.75,0,group,true);const cabin=box(1.86,.85,2.25,0xc7d9d4,0,1.5,-.15,group,true);box(1.9,.1,1.85,color,0,1.97,-.1,group);box(1.65,.7,.06,0x345b69,0,1.55,1.01,group);box(1.65,.7,.06,0x345b69,0,1.55,-1.3,group);for(let side of [-1,1])box(.06,.65,1.75,0x3e6875,side*.95,1.52,-.1,group);for(let side of [-1,1])for(let d of [-1.4,1.4]){const wheel=cyl(.43,.43,.22,0x35464b,side*1.1,.47,d,12,group);wheel.rotation.z=Math.PI/2;const hub=cyl(.22,.22,.235,0xa3b7b1,side*1.1,.47,d,12,group);hub.rotation.z=Math.PI/2;}for(let side of [-1,1]){box(.48,.18,.08,0xffedb3,side*.7,.88,2.24,group);box(.48,.18,.08,0xc96158,side*.7,.88,-2.24,group);}box(1.1,.22,.08,0xeff1df,0,.65,2.25,group);return group;}
  const redCar=car(0xd98766,-4,-28),crossCar=car(0xe8c779,16,2,Math.PI/2),busCar=car(0x7598b0,80,-8,Math.PI/2),legalCar=car(0xc4ceb2,-42,36);
  car(0xa1c0b2,4,52,Math.PI);car(0xcbaaba,-71,4,Math.PI/2);car(0xa6bac4,43,4,Math.PI/2);
  // Signal heads face the player approaching the intersection from the south.
  const signalGroup=new THREE.Group();signalGroup.position.set(9,0,-20);dynamicRoot.add(signalGroup);box(.24,6.5,.24,0x4a6260,0,3.25,0,signalGroup);box(1.3,3.5,.8,0x344a49,0,6.7,0,signalGroup,true);
  const red=mesh(new THREE.SphereGeometry(.4,12,12),new THREE.MeshBasicMaterial({color:0xf46c60}),0,7.75,.46,signalGroup),green=mesh(new THREE.SphereGeometry(.4,12,12),new THREE.MeshBasicMaterial({color:0x65cfa5}),0,5.7,.46,signalGroup);mesh(new THREE.SphereGeometry(.4,12,12),new THREE.MeshBasicMaterial({color:0x7a7556}),0,6.72,.46,signalGroup);
  sign('信号路口',9,10,-20,9,2.3,'#526d6d');
  const targets=[{id:'signal',name:'A · 信号路口',position:new THREE.Vector3(-4,1.5,-12),object:redCar},{id:'crossing',name:'B · 斑马线',position:new THREE.Vector3(16,1.5,2),object:crossCar},{id:'buslane',name:'C · 专用车道',position:new THREE.Vector3(80,1.5,-8),object:busCar},{id:'parking',name:'D · 停车区域',position:new THREE.Vector3(-42,1.5,36),object:legalCar}];
  // Merge the authored static city by material and keep one shared outline pass.
  staticRoot.updateMatrixWorld(true);const groups=new Map(),lineParts=[];
  staticRoot.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld);if(!groups.has(o.material))groups.set(o.material,[]);groups.get(o.material).push(g);if(o.userData.outline)lineParts.push(new THREE.EdgesGeometry(g,25));});
  const batched=new THREE.Group();for(const [material,geometries]of groups){const merged=mergeGeometries(geometries,false);batched.add(new THREE.Mesh(merged,material));geometries.forEach(g=>g.dispose());}
  if(lineParts.length){const lines=new THREE.LineSegments(mergeGeometries(lineParts,false),new THREE.LineBasicMaterial({color:0x516a67,transparent:true,opacity:.3}));batched.add(lines);lineParts.forEach(g=>g.dispose());}
  // Preserve bridge cable lines, which are not part of the mesh batches.
  const cableLines=[];staticRoot.traverse(o=>{if(o.isLine)cableLines.push(o.clone());});cableLines.forEach(o=>batched.add(o));scene.remove(staticRoot);scene.add(batched);
  staticRoot.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
  function update(t){const phase=t%22,redPhase=phase<11;redCar.position.z=-32+phase*5.5;if(redCar.position.z>77)redCar.visible=false;else redCar.visible=true;red.material.color.setHex(redPhase?0xff7563:0x654d4a);green.material.color.setHex(redPhase?0x45665b:0x70e5ac);targets[0].position.copy(redCar.position);targets[0].position.y=1.5;return {red:redPhase,crossed:redCar.position.z>-20&&redCar.position.z<16,phase};}
  return {targets,colliders,update,renderRoot:batched,materials,dispose(){const geometries=new Set(),mats=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of (Array.isArray(o.material)?o.material:[o.material])){mats.add(m);if(m.map)textures.add(m.map);}});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
