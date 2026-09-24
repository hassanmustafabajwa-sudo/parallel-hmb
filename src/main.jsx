import React,{Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Environment,ContactShadows,PerspectiveCamera,Float,MeshTransmissionMaterial,Text,useGLTF} from '@react-three/drei';
import * as THREE from 'three';
import {motion,useScroll,useTransform} from 'framer-motion';
import gsap from 'gsap';
import {ArrowDown,ArrowUpRight,Menu,X,MousePointer2,Plus} from 'lucide-react';
import Lenis from 'lenis';
import './styles.css';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function Wheel({position,side=1}){
 return <group position={position} rotation={[Math.PI/2,0,0]}>
  <mesh castShadow><cylinderGeometry args={[.48,.48,.26,48]}/><meshStandardMaterial color="#090909" metalness={1} roughness={.16}/></mesh>
  <mesh position={[0,.15*side,0]}><cylinderGeometry args={[.35,.35,.28,32]}/><meshStandardMaterial color="#171717" metalness={1} roughness={.1}/></mesh>
  <mesh position={[0,.18*side,0]}><cylinderGeometry args={[.23,.23,.29,12]}/><meshStandardMaterial color="#9b9b9b" metalness={1} roughness={.18}/></mesh>
  <mesh position={[0,.2*side,0]}><cylinderGeometry args={[.11,.11,.3,24]}/><meshStandardMaterial color="#050505" metalness={1} roughness={.08}/></mesh>
  <mesh position={[0,.205*side,0]}><torusGeometry args={[.30,.024,10,36]}/><meshStandardMaterial color="#666" metalness={1} roughness={.2}/></mesh>
 </group>
}

function Aero({position,rotation=[0,0,0],scale=[1,1,1]}){return <mesh position={position} rotation={rotation} scale={scale} castShadow><boxGeometry args={[1,.035,.12]}/><meshStandardMaterial color="#101010" metalness={.92} roughness={.16}/></mesh>}

function Engine({visible}){
 const g=useRef();
 useFrame((_,d)=>{if(g.current){g.current.rotation.y+=d*.18;g.current.position.y=THREE.MathUtils.lerp(g.current.position.y,visible?.28:0,1-Math.pow(.001,d));}});
 return <group ref={g} position={[-.3,.7,0]} scale={visible?.1:0.001}>
  <mesh><boxGeometry args={[.9,.22,.55]}/><meshStandardMaterial color="#202020" metalness={.8} roughness={.2}/></mesh>
  {[[-.28,.18,.2],[.28,.18,.2],[-.28,.18,-.2],[.28,.18,-.2]].map((p,i)=><mesh key={i} position={p}><cylinderGeometry args={[.07,.07,.34,20]}/><meshStandardMaterial color="#777" metalness={.9} roughness={.15}/></mesh>)}
  <mesh position={[0,.22,0]}><torusGeometry args={[.19,.035,10,32]}/><meshStandardMaterial color="#d5d5d5" metalness={1}/></mesh>
 </group>
}

const CAR_URL='https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/GLB/CarConcept.glb';

function RealCar({progress}){
 const {scene}=useGLTF(CAR_URL);
 const {camera}=useThree();
 const root=useRef(), model=useMemo(()=>scene.clone(true),[scene]), parts=useRef([]);
 const normalized=useRef(false);

 useEffect(()=>{
  if(normalized.current)return;
  normalized.current=true;
  const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  const max=Math.max(size.x,size.y,size.z)||1;
  model.position.sub(center);
  model.scale.setScalar(3.2/max);
  parts.current=[];
  model.traverse(o=>{
   if(!o.isMesh)return;
   o.castShadow=true;o.receiveShadow=true;
   const n=o.name.toLowerCase();
   const type=/wheel|tire|rim/.test(n)?'wheel':/glass|window|windshield/.test(n)?'glass':/wing|spoiler|aero/.test(n)?'wing':/hood|bonnet|hatch|door/.test(n)?'panel':'body';
   parts.current.push({o,type,base:o.position.clone(),rot:o.rotation.clone()});
  });
 },[model]);

 useFrame((state,delta)=>{
  const p=progress.current,e=1-Math.pow(.001,delta);
  if(!root.current)return;
  const sep=THREE.MathUtils.clamp((p-.55)/.4,0,1),s=sep*sep*(3-2*sep);
  root.current.rotation.y=THREE.MathUtils.lerp(root.current.rotation.y,-.5+p*Math.PI*2.05,e);
  root.current.position.y=THREE.MathUtils.lerp(root.current.position.y,.03+Math.sin(state.clock.elapsedTime*.65)*.012,e);

  const shots=[
   {a:0,b:.18,pos:[4.9,1.35,6.8],look:[0,.1,0],fov:38},
   {a:.18,b:.34,pos:[4.2,1.55,5.2],look:[0,.05,0],fov:40},
   {a:.34,b:.5,pos:[2.5,.85,3.15],look:[0,.05,-.75],fov:32},
   {a:.5,b:.66,pos:[4.9,2.05,5.6],look:[0,.15,0],fov:43},
   {a:.66,b:.8,pos:[1.75,1.15,2.9],look:[0,.1,0],fov:35},
   {a:.8,b:.93,pos:[2.8,1.05,3.2],look:[0,.05,.55],fov:34},
   {a:.93,b:1,pos:[4.8,1.35,6.5],look:[0,.08,0],fov:38}
  ];
  const shot=shots.find(x=>p>=x.a&&p<x.b)||shots[6];
  camera.position.x=THREE.MathUtils.lerp(camera.position.x,shot.pos[0],e);
  camera.position.y=THREE.MathUtils.lerp(camera.position.y,shot.pos[1],e);
  camera.position.z=THREE.MathUtils.lerp(camera.position.z,shot.pos[2],e);
  camera.fov=THREE.MathUtils.lerp(camera.fov,shot.fov,e);
  camera.updateProjectionMatrix();
  camera.lookAt(...shot.look);

  parts.current.forEach(({o,type,base,rot},i)=>{
   let x=base.x,y=base.y,z=base.z;
   if(type==='body'){y+=s*.08;z+=s*(i%2?.035:-.035)}
   if(type==='panel'){y+=s*(.18+(i%3)*.12);z+=s*(i%2?.09:-.09)}
   if(type==='glass'){y+=s*.34;z-=s*.1}
   if(type==='wing'){y+=s*.58;z-=s*.2}
   if(type==='wheel'){x+=s*(base.x>0?.22:-.22);z+=s*(base.z>0?.2:-.2);o.rotation.y=rot.y+(base.z>0?s*.08:-s*.08)}
   o.position.x=THREE.MathUtils.lerp(o.position.x,x,e);
   o.position.y=THREE.MathUtils.lerp(o.position.y,y,e);
   o.position.z=THREE.MathUtils.lerp(o.position.z,z,e);
  });
 });
 return <group ref={root}><primitive object={model} dispose={null}/></group>;
}
useGLTF.preload(CAR_URL);

function CarFallback(){
 return <mesh rotation={[0,.35,0]} castShadow><boxGeometry args={[3,.5,1.35]}/><meshStandardMaterial color="#111" metalness={.9} roughness={.18}/></mesh>;
}


function CinematicLights({progress}){const head=useRef(),brake=useRef(),engine=useRef();useFrame((state,delta)=>{const p=progress.current,e=1-Math.pow(.001,delta);const pulse=.82+Math.sin(state.clock.elapsedTime*5.5)*.12;if(head.current)head.current.intensity=THREE.MathUtils.lerp(head.current.intensity,p<.18?3.5:11,e);if(brake.current)brake.current.intensity=THREE.MathUtils.lerp(brake.current.intensity,p>.82?pulse*8:0,e);if(engine.current)engine.current.intensity=THREE.MathUtils.lerp(engine.current.intensity,p>.7?5:0,e)});return <><pointLight ref={head} position={[1.8,.9,2.3]} intensity={8} distance={6} color="#f7f7f2"/><pointLight ref={brake} position={[-1.8,.72,-1.8]} intensity={0} distance={4} color="#ff2018"/><pointLight ref={engine} position={[-.4,1.25,0]} intensity={0} distance={3.5} color="#d9d9d9"/></>}

function Scene({progress}){return <Canvas dpr={[1,1.7]} gl={{antialias:true}} shadows><PerspectiveCamera makeDefault position={[4.7,2.15,6.25]} fov={36}/><color attach="background" args={['#050505']}/><ambientLight intensity={.22}/><spotLight position={[4,6,5]} intensity={120} angle={.46} penumbra={1} castShadow/><spotLight position={[-5,3,-4]} intensity={100} angle={.55} penumbra={1}/><pointLight position={[0,1.5,2]} intensity={16}/><CinematicLights progress={progress}/><Float speed={1.1} rotationIntensity={.04} floatIntensity={.18}><ProceduralCar progress={progress}/></Float><ContactShadows position={[0,0,0]} opacity={.55} scale={15} blur={2.8} far={7}/><Environment preset="studio"/></Canvas>}

const facts=[['01','AERODYNAMICS','Air becomes structure. Every surface earns its place.'],['02','POWERTRAIN','Twin-turbo V8. 720 horsepower. Response without delay.'],['03','COCKPIT','A driver-first interior reduced to the essential.']];

function App(){
 const [menu,setMenu]=useState(false),[hotspot,setHotspot]=useState(null),[pointer,setPointer]=useState({x:0,y:0});
 const progress=useRef(0),{scrollYProgress}=useScroll(); const revealRef=useRef(null);
 useEffect(()=>{const move=e=>setPointer({x:e.clientX/window.innerWidth-.5,y:e.clientY/window.innerHeight-.5});window.addEventListener('pointermove',move,{passive:true});return()=>window.removeEventListener('pointermove',move)},[]);
 useEffect(()=>{const on=()=>progress.current=clamp(window.scrollY/(document.body.scrollHeight-window.innerHeight),0,1);on();window.addEventListener('scroll',on,{passive:true});const lenis=new Lenis({duration:1.15,smoothWheel:true,syncTouch:true});let raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf);return()=>{window.removeEventListener('scroll',on);lenis.destroy()}},[]);
 useEffect(()=>{if(revealRef.current){gsap.fromTo(revealRef.current,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:1.5,ease:'power4.inOut',delay:.15})}},[]);
 const heroOpacity=useTransform(scrollYProgress,[0,.13],[1,0]),heroY=useTransform(scrollYProgress,[0,.22],[0,-130]);
 return <main>
  <div className="pointer-glow" style={{transform:`translate3d(${pointer.x*42}px,${pointer.y*42}px,0)`}}/><div className="fixed-scene"><Scene progress={progress}/><div className="scene-vignette"/><div className="scene-caption"><span>R1 / DEVELOPMENT 001</span><span>SCROLL-CHOREOGRAPHED MACHINE</span></div></div>
  <header className="nav"><a className="brand">PARALLEL<span>/</span>R1</a><div className="nav-center">VANTA AUTOMOTIVE · 2026</div><div className="nav-links"><a href="#machine">Machine</a><a href="#details">Details</a><a href="#contact">Enquire</a></div><button className="menu" aria-label="Menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></header>
  {menu&&<div className="mobile-menu"><a href="#machine" onClick={()=>setMenu(false)}>Machine</a><a href="#details" onClick={()=>setMenu(false)}>Details</a><a href="#contact" onClick={()=>setMenu(false)}>Enquire</a></div>}
  <section className="hero"><div ref={revealRef} className="hero-reveal-line"/><motion.div style={{opacity:heroOpacity,y:heroY}} className="hero-copy"><p className="eyebrow">PARALLEL AUTOMOTIVE · 001</p><h1>VANTA<br/><em>R1</em></h1><p className="hero-sub">A machine sculpted around motion.</p></motion.div><motion.div style={{opacity:heroOpacity}} className="scroll-hint"><MousePointer2 size={14}/> Scroll to deconstruct <ArrowDown size={14}/></motion.div></section>
  <section id="machine" className="spacer"><div className="section-label">THE MACHINE <span>01 — 04</span></div><div className="statement"><p>One object. Four perspectives.</p><h2>FORM<br/><i>FOLLOWS</i><br/>MOTION.</h2></div><div className="hotspot-card"><button onClick={()=>setHotspot(hotspot?null:'aero')}><Plus size={14}/></button><span>{hotspot==='aero'?'ACTIVE AERODYNAMIC SURFACE':'EXPLORE THE MACHINE'}</span></div></section>
  <section className="facts" id="details">{facts.map(([n,t,d])=><motion.div key={n} className="fact" initial={{opacity:0,y:45}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-18%'}} transition={{duration:.9,ease:[.22,1,.36,1]}}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div><ArrowUpRight/></motion.div>)}</section>
  <section className="performance"><div className="section-label">PERFORMANCE <span>03 — 04</span></div><div className="powertrain-ui"><span className="powertrain-dot"/><div><b>POWERTRAIN</b><small>LIVE SYSTEM / V8</small></div><strong>720 HP</strong></div><div className="performance-copy"><p>THE MACHINE / OPENED</p><h2>PURE<br/><i>OUTPUT.</i></h2></div><div className="numbers"><div><strong>720</strong><span>HORSEPOWER</span></div><div><strong>2.8</strong><span>0—100 KM/H</span></div><div><strong>340</strong><span>TOP SPEED / KM/H</span></div></div><div className="engine-note">SCROLL FURTHER TO EXPOSE THE POWERTRAIN</div></section>
  <section className="contact" id="contact"><p className="eyebrow">PRIVATE VIEWING · 04 — 04</p><h2>MEET<br/><i>R1.</i></h2><button>REQUEST ACCESS <ArrowUpRight size={18}/></button><footer><span>PARALLEL AUTOMOTIVE</span><span>© 2026 · LAHORE / PAKISTAN</span></footer></section>
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);