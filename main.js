import * as THREE from 'three';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 820px)').matches || matchMedia('(pointer: coarse)').matches;
const RED = new THREE.Color('#E82C42'), BLUE = new THREE.Color('#1EA8E8');

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({canvas, antialias: !mobile, alpha: false, powerPreference: 'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.5 : 2));
renderer.setClearColor(0x000000, 1);
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.045);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
camera.position.set(0, 0, 9);

// soft round glow sprite texture
function glowTex(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
 const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.6)');r.addColorStop(1,'rgba(255,255,255,0)');
 g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);}
const tex = glowTex();

const core = new THREE.Group(); scene.add(core);

// neural sphere: fibonacci points, red->blue
const N = mobile ? 700 : 1600, R = 2.2;
const pos = new Float32Array(N*3), col = new Float32Array(N*3), base = [];
for(let i=0;i<N;i++){const y=1-(i/(N-1))*2, rr=Math.sqrt(1-y*y), th=i*2.399963;
 const v=new THREE.Vector3(Math.cos(th)*rr, y, Math.sin(th)*rr).multiplyScalar(R*(0.96+Math.random()*0.08));
 base.push(v.clone()); v.toArray(pos,i*3);
 const k=Math.min(1,Math.max(0,(-v.x/R)*1.6+0.5+(Math.random()-.5)*0.25)); const c=RED.clone().lerp(BLUE,k*k*(3-2*k)); c.toArray(col,i*3);}
const sGeo=new THREE.BufferGeometry(); sGeo.setAttribute('position',new THREE.BufferAttribute(pos,3)); sGeo.setAttribute('color',new THREE.BufferAttribute(col,3));
const sMat=new THREE.PointsMaterial({size:mobile?0.09:0.075,map:tex,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});
core.add(new THREE.Points(sGeo,sMat));

// connection lines between near neighbours
const lp=[], lc=[]; const maxL = mobile?900:2400;
for(let i=0;i<N && lp.length/6<maxL;i+=1){for(let j=i+1;j<Math.min(N,i+60);j++){
 if(base[i].distanceTo(base[j])<0.42 && Math.random()<0.55){lp.push(...base[i].toArray(),...base[j].toArray());lc.push(...col.slice(i*3,i*3+3),...col.slice(j*3,j*3+3));}}}
const lGeo=new THREE.BufferGeometry(); lGeo.setAttribute('position',new THREE.Float32BufferAttribute(lp,3)); lGeo.setAttribute('color',new THREE.Float32BufferAttribute(lc,3));
core.add(new THREE.LineSegments(lGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.28,blending:THREE.AdditiveBlending,depthWrite:false})));

// inner glow core
const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:RED,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false}));
halo.scale.set(5.5,5.5,1); core.add(halo);
const halo2=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:BLUE,transparent:true,opacity:0.35,blending:THREE.AdditiveBlending,depthWrite:false}));
halo2.scale.set(9,9,1); halo2.position.x=-1; core.add(halo2);

// orbit rings
const rings=[];
[[3.0,RED,0.35,[1.2,0.2]],[3.5,BLUE,0.28,[-0.4,0.9]],[4.2,RED,0.14,[0.3,-0.6]]].forEach(([r,c,o,rot])=>{
 const g=new THREE.RingGeometry(r,r+0.012,256); const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
 m.rotation.set(rot[0],rot[1],0); core.add(m); rings.push(m);});

// orbiting particles
const O = mobile?250:700; const oPos=new Float32Array(O*3), oCol=new Float32Array(O*3), oData=[];
for(let i=0;i<O;i++){oData.push({r:2.8+Math.random()*2.2,a:Math.random()*6.28,s:(0.1+Math.random()*0.35)*(Math.random()<.5?1:-1),tilt:(Math.random()-.5)*1.4,y:(Math.random()-.5)*0.6});
 (Math.random()<.55?RED:BLUE).toArray(oCol,i*3);}
const oGeo=new THREE.BufferGeometry(); oGeo.setAttribute('position',new THREE.BufferAttribute(oPos,3)); oGeo.setAttribute('color',new THREE.BufferAttribute(oCol,3));
core.add(new THREE.Points(oGeo,new THREE.PointsMaterial({size:0.06,map:tex,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending})));

// starfield + data streaks (like the banner)
const S = mobile?1200:3500; const st=new Float32Array(S*3), sc=new Float32Array(S*3);
for(let i=0;i<S;i++){st[i*3]=(Math.random()-.5)*80;st[i*3+1]=(Math.random()-.5)*50;st[i*3+2]=-Math.random()*90+10;
 const c=Math.random()<.5?RED:(Math.random()<.5?BLUE:new THREE.Color(0x667088)); c.toArray(sc,i*3);}
const stGeo=new THREE.BufferGeometry(); stGeo.setAttribute('position',new THREE.BufferAttribute(st,3)); stGeo.setAttribute('color',new THREE.BufferAttribute(sc,3));
const stars=new THREE.Points(stGeo,new THREE.PointsMaterial({size:0.12,map:tex,vertexColors:true,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending}));
scene.add(stars);
const streaks=new THREE.Group(); scene.add(streaks);
for(let i=0;i<(mobile?20:46);i++){const left=i%2===0; const c=left?BLUE:RED; const pts=[]; const y0=(Math.random()-.5)*2.4, amp=Math.random()*1.2;
 for(let k=0;k<=60;k++){const t=k/60; const x=left?-22+t*19:3+t*19; pts.push(new THREE.Vector3(x, y0*(left?1-t:t)+Math.sin(t*3+i)*amp*0.4, -2-Math.random()*0.02));}
 const g=new THREE.BufferGeometry().setFromPoints(pts);
 streaks.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:c,transparent:true,opacity:0.12+Math.random()*0.25,blending:THREE.AdditiveBlending,depthWrite:false})));}

function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
 core.position.x = w>820 ? 2.6 : 0; core.position.y = w>820 ? 0 : 1.6; core.scale.setScalar(w>820?1:0.78);}
addEventListener('resize',resize); resize();

// mouse + scroll state
const mouse={x:0,y:0,tx:0,ty:0}; let prog=0, sprog=0;
addEventListener('pointermove',e=>{mouse.tx=e.clientX/innerWidth*2-1;mouse.ty=e.clientY/innerHeight*2-1;});
function readScroll(){const m=document.documentElement.scrollHeight-innerHeight;prog=m>0?scrollY/m:0;}
addEventListener('scroll',readScroll,{passive:true}); readScroll();

const clock=new THREE.Clock(); let running=true;
document.addEventListener('visibilitychange',()=>{running=!document.hidden; if(running) loop();});
function frame(){
 const t=clock.getElapsedTime(), sp=reduced?0:1;
 sprog+= (prog-sprog)*0.08; mouse.x+=(mouse.tx-mouse.x)*0.05; mouse.y+=(mouse.ty-mouse.y)*0.05;
 core.rotation.y = t*0.12*sp + sprog*Math.PI*2.2 + mouse.x*0.4;
 core.rotation.x = mouse.y*0.25 + sprog*0.8;
 const pulse = 1+Math.sin(t*1.6)*0.04*sp; halo.scale.set(5.5*pulse,5.5*pulse,1);
 rings.forEach((r,i)=>{r.rotation.z = t*(0.1+i*0.07)*(i%2?-1:1)*sp;});
 for(let i=0;i<O;i++){const d=oData[i]; const a=d.a+t*d.s*sp; const x=Math.cos(a)*d.r, z=Math.sin(a)*d.r;
  oPos[i*3]=x; oPos[i*3+1]=d.y+z*d.tilt*0.4; oPos[i*3+2]=z;} oGeo.attributes.position.needsUpdate=true;
 // scroll-driven camera: dolly through the sphere then pull wide
 const p=sprog; const w=innerWidth>820;
 camera.position.z = 9 - Math.sin(Math.min(p*1.4,1)*Math.PI)*3.5 + p*4;
 camera.position.x = (w? 0 : 0) + Math.sin(p*Math.PI*2)*2.2 + mouse.x*0.5;
 camera.position.y = -p*2.5 - mouse.y*0.35;
 camera.lookAt(core.position.x*(1-p*0.6), core.position.y - p*1.2, 0);
 stars.rotation.y = t*0.004*sp + p*0.3; stars.position.z = p*14;
 streaks.position.x = mouse.x*-0.6; streaks.children.forEach((l,i)=>l.material.opacity=(0.12+0.2*Math.abs(Math.sin(t*0.8+i)))*(1-p*0.7));
 renderer.render(scene,camera);
}
function loop(){ if(!running) return; frame(); if(!reduced) requestAnimationFrame(loop); }
loop();
if(reduced){addEventListener('scroll',()=>requestAnimationFrame(frame),{passive:true});addEventListener('resize',()=>frame());}

// DOM animations
const {gsap}=window; const ST=window.ScrollTrigger;
if(gsap && !reduced){
 gsap.registerPlugin(ST);
 gsap.from('.title .w',{yPercent:110,opacity:0,rotateX:-60,duration:1.2,stagger:.12,ease:'expo.out',delay:.15});
 gsap.utils.toArray('.reveal').forEach(el=>gsap.from(el,{y:50,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}}));
 gsap.to('.hero .title',{yPercent:-40,opacity:0.15,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
 gsap.from('.video-card',{rotateX:18,scale:.9,ease:'none',scrollTrigger:{trigger:'.video-card',start:'top bottom',end:'center center',scrub:true}});
 if(!mobile){document.querySelectorAll('.tilt').forEach(el=>{
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
   gsap.to(el,{rotateY:x*12,rotateX:-y*12,transformPerspective:1000,duration:.5,ease:'power2.out'});});
  el.addEventListener('pointerleave',()=>gsap.to(el,{rotateY:0,rotateX:0,duration:.8,ease:'elastic.out(1,.5)'}));});}
}
