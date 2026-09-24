import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Environment,ContactShadows,PerspectiveCamera,Float,MeshTransmissionMaterial} from '@react-three/drei';
import * as THREE from 'three';
import {motion,useScroll,useTransform} from 'framer-motion';
import {ArrowDown,ArrowUpRight,Menu,X,MousePointer2} from 'lucide-react';
import Lenis from 'lenis';
import './styles.css';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

function Wheel({position,side=1,index=0}){
  return <group position={position} rotation={[Math.PI/2,0,0]}>
    <mesh castShadow><cylinderGeometry args={[.48,.48,.26,48]}/><meshStandardMaterial color="#090909" metalness={1} roughness={.16}/></mesh>
    <mesh position={[0,.145*side,0]}><cylinderGeometry args={[.34,.34,.28,32]}/><meshStandardMaterial color="#171717" metalness={1} roughness={.12}/></mesh>
    <mesh position={[0,.17*side,0]}><cylinderGeometry args={[.22,.22,.29,12]}/><meshStandardMaterial color="#aaa" metalness={.92} roughness={.2}/></mesh>
    <mesh position={[0,.185*side,0]}><cylinderGeometry args={[.105,.105,.30,24]}/><meshStandardMaterial color="#080808" metalness={1} roughness={.1}/></mesh>
    <mesh position={[0,.19*side,0]}><torusGeometry args={[.29,.025,10,32]}/><meshStandardMaterial color="#555" metalness={1} roughness={.2}/></mesh>
  </group>
}

function AeroBlade({position,rotation=[0,0,0],scale=[1,1,1]}){
  return <mesh position={position} rotation={rotation} scale={scale} castShadow>
    <boxGeometry args={[1,.035,.12]}/><meshStandardMaterial color="#101010" metalness={.9} roughness={.18}/>
  </mesh>
}

function Car(){
  const root=useRef(), body=useRef(), cabin=useRef(), wing=useRef(), front=useRef(), wheels=useRef([]);
  const {camera}=useThree();
  const scroll=useRef(0);
  useEffect(()=>{const on=()=>scroll.current=clamp(window.scrollY/(document.body.scrollHeight-window.innerHeight),0,1);on();window.addEventListener('scroll',on,{passive:true});return()=>window.removeEventListener('scroll',on)},[]);
  useFrame((state,delta)=>{
    const p=scroll.current;
    const ease=1-Math.pow(.001,delta);
    const rot=THREE.MathUtils.lerp(root.current.rotation.y, -0.45+p*Math.PI*1.9,ease);
    root.current.rotation.y=rot;
    root.current.position.y=THREE.MathUtils.lerp(root.current.position.y,.04+Math.sin(state.clock.elapsedTime*.7)*.025,ease);
    root.current.position.x=THREE.MathUtils.lerp(root.current.position.x, (p>.72?(p-.72)*2.0:0),ease);
    root.current.scale.setScalar(1.62 + (p>.82?(p-.82)*1.2:0));
    camera.position.x=THREE.MathUtils.lerp(camera.position.x,4.7 + Math.sin(p*Math.PI*1.3)*1.15,ease);
    camera.position.y=THREE.MathUtils.lerp(camera.position.y,2.15 + Math.sin(p*Math.PI)*.65,ease);
    camera.position.z=THREE.MathUtils.lerp(camera.position.z,6.25 - p*.9,ease);
    camera.lookAt(0,.45,0);
    body.current.position.y=THREE.MathUtils.lerp(body.current.position.y,p>.63?(p-.63)*.55:0,ease);
    cabin.current.position.y=THREE.MathUtils.lerp(cabin.current.position.y,p>.63?(p-.63)*.9:0,ease);
    wing.current.position.y=THREE.MathUtils.lerp(wing.current.position.y,p>.63?(p-.63)*1.35:0,ease);
    wing.current.rotation.z=THREE.MathUtils.lerp(wing.current.rotation.z,p>.63?-.12:0,ease);
    front.current.position.x=THREE.MathUtils.lerp(front.current.position.x,p>.63?-(p-.63)*.55:0,ease);
    wheels.current.forEach((w,i)=>{if(w)w.position.y=THREE.MathUtils.lerp(w.position.y,p>.63?((i%2)*2-1)*(.25+(p-.63)*.5):0,ease)});
  });
  return <group ref={root}>
    <group ref={body}>
      <mesh position={[0,.42,0]} scale={[2.65,.34,1.04]} castShadow>
        <boxGeometry args={[1,1,1]}/><meshPhysicalMaterial color="#bfc1c2" metalness={.98} roughness={.12} clearcoat={1} clearcoatRoughness={.05}/>
      </mesh>
      <mesh position={[.62,.54,0]} scale={[1.1,.23,.95]} rotation={[0,0,-.08]} castShadow>
        <boxGeometry args={[1,1,1]}/><meshPhysicalMaterial color="#aeb1b2" metalness={.98} roughness={.1} clearcoat={1}/>
      </mesh>
      <mesh position={[-1.08,.48,0]} scale={[.65,.18,1.05]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#d5d7d8" metalness={.95} roughness={.15}/></mesh>
      <mesh position={[1.15,.48,0]} scale={[.55,.16,1]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#d5d7d8" metalness={.95} roughness={.15}/></mesh>
      <mesh position={[1.31,.59,.39]} scale={[.38,.055,.065]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#f7f7f2" emissive="#ffffff" emissiveIntensity={7}/></mesh>
      <mesh position={[1.31,.59,-.39]} scale={[.38,.055,.065]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#f7f7f2" emissive="#ffffff" emissiveIntensity={7}/></mesh>
      <mesh position={[-1.33,.55,.4]} scale={[.28,.05,.065]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#ff261e" emissive="#ff1008" emissiveIntensity={3}/></mesh>
      <mesh position={[-1.33,.55,-.4]} scale={[.28,.05,.065]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#ff261e" emissive="#ff1008" emissiveIntensity={3}/></mesh>
      <AeroBlade position={[-1.42,.3,0]} scale={[.55,1,1]}/>
    </group>
    <group ref={cabin}>
      <mesh position={[.05,.83,0]} scale={[1.25,.42,.82]} rotation={[0,0,-.08]} castShadow>
        <boxGeometry args={[1,1,1]}/><MeshTransmissionMaterial transmission={.45} thickness={.12} roughness={.05} chromaticAberration={.03} ior={1.45} color="#111315"/>
      </mesh>
      <mesh position={[-.32,.85,0]} scale={[.56,.26,.77]} rotation={[0,0,-.1]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#0a0a0a" metalness={.35} roughness={.08}/></mesh>
    </group>
    <group ref={wing}>
      <AeroBlade position={[-1.02,.73,0]} scale={[.72,1,1.1]}/>
      <mesh position={[-1.18,.64,0]} scale={[.08,.28,.86]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#171717" metalness={.9}/></mesh>
    </group>
    <group ref={front}><AeroBlade position={[1.05,.28,.48]} rotation={[0,0,-.12]} scale={[.75,1,.7]}/><AeroBlade position={[1.05,.28,-.48]} rotation={[0,0,-.12]} scale={[.75,1,.7]}/></group>
    <group ref={wheels}>
      <Wheel position={[.78,.31,.59]} side={1} index={0}/><Wheel position={[.78,.31,-.59]} side={-1} index={1}/>
      <Wheel position={[-.86,.31,.59]} side={1} index={2}/><Wheel position={[-.86,.31,-.59]} side={-1} index={3}/>
    </group>
  </group>
}

function Scene(){
 return <Canvas dpr={[1,1.7]} gl={{antialias:true}} shadows>
   <PerspectiveCamera makeDefault position={[4.7,2.15,6.25]} fov={36}/>
   <color attach="background" args={['#050505']}/>
   <ambientLight intensity={.22}/>
   <spotLight position={[4,6,5]} intensity={115} angle={.46} penumbra={1} castShadow/>
   <spotLight position={[-5,3,-4]} intensity={95} angle={.55} penumbra={1}/>
   <pointLight position={[0,1.5,2]} intensity={14}/>
   <pointLight position={[2,-.2,-2]} intensity={10}/>
   <Float speed={1.2} rotationIntensity={.05} floatIntensity={.2}><Car/></Float>
   <ContactShadows position={[0,0,0]} opacity={.55} scale={15} blur={2.8} far={7}/>
   <Environment preset="studio"/>
 </Canvas>
}

const facts=[['01','AERODYNAMICS','Air becomes structure. Every surface earns its place.'],['02','POWERTRAIN','Twin-turbo V8. 720 horsepower. Response without delay.'],['03','COCKPIT','A driver-first interior reduced to the essential.']];

function App(){
 const [menu,setMenu]=useState(false);
 const {scrollYProgress}=useScroll();
 const heroOpacity=useTransform(scrollYProgress,[0,.13],[1,0]);
 const heroY=useTransform(scrollYProgress,[0,.22],[0,-130]);
 useEffect(()=>{const lenis=new Lenis({duration:1.15,smoothWheel:true,syncTouch:true});let raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf);return()=>lenis.destroy()},[]);
 return <main>
  <div className="fixed-scene"><Scene/><div className="scene-vignette"/></div>
  <header className="nav"><a className="brand">PARALLEL<span>/</span>R1</a><div className="nav-center">VANTA AUTOMOTIVE · 2026</div><div className="nav-links"><a href="#machine">Machine</a><a href="#details">Details</a><a href="#contact">Enquire</a></div><button className="menu" aria-label="Menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></header>
  {menu&&<div className="mobile-menu"><a href="#machine" onClick={()=>setMenu(false)}>Machine</a><a href="#details" onClick={()=>setMenu(false)}>Details</a><a href="#contact" onClick={()=>setMenu(false)}>Enquire</a></div>}
  <section className="hero">
   <motion.div style={{opacity:heroOpacity,y:heroY}} className="hero-copy"><p className="eyebrow">PARALLEL AUTOMOTIVE · 001</p><h1>VANTA<br/><em>R1</em></h1><p className="hero-sub">A machine sculpted around motion.</p></motion.div>
   <motion.div style={{opacity:heroOpacity}} className="scroll-hint"><MousePointer2 size={14}/> Drag your attention downward <ArrowDown size={14}/></motion.div>
  </section>
  <section id="machine" className="spacer"><div className="section-label">THE MACHINE <span>01 — 04</span></div><div className="statement"><p>Keep scrolling. The machine changes with you.</p><h2>FORM<br/><i>FOLLOWS</i><br>MOTION.</h2></div></section>
  <section className="facts" id="details">{facts.map(([n,t,d])=><motion.div key={n} className="fact" initial={{opacity:0,y:45}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-18%'}} transition={{duration:.9,ease:[.22,1,.36,1]}}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div><ArrowUpRight/></motion.div>)}</section>
  <section className="performance"><div className="section-label">PERFORMANCE <span>03 — 04</span></div><div className="performance-copy"><p>NUMBERS WITHOUT NOISE</p><h2>PURE<br/><i>OUTPUT.</i></h2></div><div className="numbers"><div><strong>720</strong><span>HORSEPOWER</span></div><div><strong>2.8</strong><span>0—100 KM/H</span></div><div><strong>340</strong><span>TOP SPEED / KM/H</span></div></div></section>
  <section className="contact" id="contact"><p className="eyebrow">PRIVATE VIEWING · 04 — 04</p><h2>MEET<br/><i>R1.</i></h2><button>REQUEST ACCESS <ArrowUpRight size={18}/></button><footer><span>PARALLEL AUTOMOTIVE</span><span>© 2026 · LAHORE / PAKISTAN</span></footer></section>
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);