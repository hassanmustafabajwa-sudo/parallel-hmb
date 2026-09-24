import React,{useRef,useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame} from '@react-three/fiber';
import {Environment,ContactShadows,PerspectiveCamera} from '@react-three/drei';
import * as THREE from 'three';
import {motion,useScroll,useTransform} from 'framer-motion';
import {ArrowDown,ArrowUpRight,Menu,X} from 'lucide-react';
import Lenis from 'lenis';
import './styles.css';

function Wheel({position,scale=1}){return <group position={position} rotation={[Math.PI/2,0,0]} scale={scale}>
 <mesh><cylinderGeometry args={[.43,.43,.22,48]}/><meshStandardMaterial color="#080808" metalness={.9} roughness={.22}/></mesh>
 <mesh position={[0,.12,0]}><cylinderGeometry args={[.25,.25,.235,32]}/><meshStandardMaterial color="#151515" metalness={.95} roughness={.15}/></mesh>
 <mesh position={[0,.125,0]}><cylinderGeometry args={[.08,.08,.245,24]}/><meshStandardMaterial color="#777" metalness={1} roughness={.18}/></mesh>
</group>}

function Car(){const g=useRef();const target=useRef(0);
 useFrame((s,d)=>{target.current+=(window.scrollY/window.innerHeight*0.7-target.current)*Math.min(1,d*4);if(g.current){g.current.rotation.y=target.current;g.current.position.y=Math.sin(s.clock.elapsedTime*.7)*.035}});
 return <group ref={g} scale={1.7} rotation={[0,-.3,0]}>
  <mesh position={[0,.38,0]} scale={[2.55,.32,1.02]}><boxGeometry args={[1,1,1]}/><meshPhysicalMaterial color="#bfc2c5" metalness={.96} roughness={.13} clearcoat={1} clearcoatRoughness={.08}/></mesh>
  <mesh position={[.25,.72,0]} scale={[1.35,.5,.9]} rotation={[0,0,-.04]}><boxGeometry args={[1,1,1]}/><meshPhysicalMaterial color="#17191b" metalness={.45} roughness={.08} transmission={.12} clearcoat={1}/></mesh>
  <mesh position={[-.98,.48,0]} scale={[.65,.23,1.05]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#d9dbdd" metalness={.92} roughness={.16}/></mesh>
  <mesh position={[1.08,.47,0]} scale={[.62,.2,1]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#d4d6d8" metalness={.92} roughness={.16}/></mesh>
  <mesh position={[1.28,.57,.39]} scale={[.34,.09,.08]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#f4f4f0" emissive="#ffffff" emissiveIntensity={5}/></mesh>
  <mesh position={[1.28,.57,-.39]} scale={[.34,.09,.08]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#f4f4f0" emissive="#ffffff" emissiveIntensity={5}/></mesh>
  <mesh position={[-1.2,.54,.4]} scale={[.25,.08,.07]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#ff2018" emissive="#ff1008" emissiveIntensity={2}/></mesh>
  <mesh position={[-1.2,.54,-.4]} scale={[.25,.08,.07]}><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#ff2018" emissive="#ff1008" emissiveIntensity={2}/></mesh>
  <Wheel position={[.78,.32,.58]}/><Wheel position={[.78,.32,-.58]}/><Wheel position={[-.83,.32,.58]}/><Wheel position={[-.83,.32,-.58]}/>
 </group>
}

function Scene(){return <Canvas dpr={[1,1.6]} gl={{antialias:true}} shadows><PerspectiveCamera makeDefault position={[4.8,2.2,6.2]} fov={38}/><ambientLight intensity={.35}/><spotLight position={[4,6,5]} intensity={110} angle={.5} penumbra={1} castShadow/><spotLight position={[-5,2,-3]} intensity={80} angle={.6} penumbra={1}/><pointLight position={[0,1,2]} intensity={18}/><Car/><ContactShadows position={[0,0,0]} opacity={.55} scale={14} blur={2.5} far={6}/><Environment preset="studio"/></Canvas>}

const facts=[['01','AERODYNAMICS','Every surface is shaped around airflow.'],['02','POWERTRAIN','Twin-turbo V8. Immediate response.'],['03','COCKPIT','Driver-first control, reduced to essentials.']];

function App(){const [menu,setMenu]=useState(false);const {scrollYProgress}=useScroll();const heroOpacity=useTransform(scrollYProgress,[0,.12],[1,0]);const heroY=useTransform(scrollYProgress,[0,.22],[0,-100]);
 useEffect(()=>{const lenis=new Lenis({duration:1.15,smoothWheel:true});let raf=(t)=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf);return()=>lenis.destroy()},[]);
 return <main>
  <div className="fixed-scene"><Scene/></div>
  <header className="nav"><a className="brand">PARALLEL<span>/</span>R1</a><div className="nav-links"><a href="#machine">Machine</a><a href="#details">Details</a><a href="#contact">Enquire</a></div><button className="menu" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></header>
  {menu&&<div className="mobile-menu"><a href="#machine" onClick={()=>setMenu(false)}>Machine</a><a href="#details" onClick={()=>setMenu(false)}>Details</a><a href="#contact" onClick={()=>setMenu(false)}>Enquire</a></div>}
  <section className="hero"><motion.div style={{opacity:heroOpacity,y:heroY}} className="hero-copy"><p className="eyebrow">PARALLEL AUTOMOTIVE · 001</p><h1>VANTA<br/><em>R1</em></h1><p className="hero-sub">A machine sculpted around motion.</p></motion.div><motion.div style={{opacity:heroOpacity}} className="scroll-hint"><ArrowDown size={15}/> Scroll to reveal</motion.div></section>
  <section id="machine" className="spacer"><div className="section-label">THE MACHINE <span>01 — 04</span></div><div className="statement"><p>Not designed to stand still.</p><h2>FORM<br/><i>FOLLOWS</i><br>MOTION.</h2></div></section>
  <section className="facts" id="details">{facts.map(([n,t,d])=><motion.div key={n} className="fact" initial={{opacity:0,y:45}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-20%'}} transition={{duration:.8,ease:[.22,1,.36,1]}}><span>{n}</span><div><h3>{t}</h3><p>{d}</p></div><ArrowUpRight/></motion.div>)}</section>
  <section className="performance"><div className="section-label">PERFORMANCE <span>03 — 04</span></div><div className="numbers"><div><strong>720</strong><span>HP</span></div><div><strong>2.8</strong><span>0—100 KM/H</span></div><div><strong>340</strong><span>KM/H</span></div></div></section>
  <section className="contact" id="contact"><p className="eyebrow">PRIVATE VIEWING</p><h2>MEET<br/><i>R1.</i></h2><button>REQUEST ACCESS <ArrowUpRight size={18}/></button><footer><span>PARALLEL AUTOMOTIVE</span><span>© 2026</span></footer></section>
 </main>}
createRoot(document.getElementById('root')).render(<App/>);