/* Shared animation conductor. Audio starts only after the sound switch is used. */
'use strict';
(() => {
 const durations={wave:2400,sleep:5400,jump:2500,roll:3300,dance:4200,crawl:4800,sing:5200,sway:4000,spin:3200,stretch:3300,munch:3700,cheer:2900,read:5000,water:4400,fish:5600,meditate:6000,experiment:4800,typing:4200,kite:5200,bubbles:5500,photo:3000,taichi:6000,streamline:5000,firework:4400,walk:1600,highfive:3200,hug:3300,selfie:3500,duet:6000};
 const running=new Map(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let context=null,activeVoices=[],audioTimer,sound=false,audioGeneration=0;
 try{sound=localStorage.getItem('foamlab-panda-sound')==='true';}catch{}
 function silence(){audioGeneration++;clearTimeout(audioTimer);for(const node of activeVoices){try{node.stop();}catch{}}activeVoices=[];}
 async function unlock(){try{context ||= new (window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')await context.resume();return context.state==='running';}catch{return false;}}
 async function sing(){silence();if(!sound||document.hidden)return;const generation=audioGeneration;if(!await unlock()||generation!==audioGeneration||!sound)return;
  // Original short melody, with a quiet vowel-like harmonic voice and vibrato.
  const notes=[60,64,67,69,67,64,62,65,64,62,60],lengths=[.32,.32,.40,.40,.32,.40,.32,.40,.32,.32,.64];let at=context.currentTime+.03;
  notes.forEach((note,i)=>{const duration=lengths[i],hz=440*Math.pow(2,(note-69)/12),voice=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter(),vibrato=context.createOscillator(),depth=context.createGain();voice.type='triangle';voice.frequency.value=hz;filter.type='lowpass';filter.frequency.value=1150;filter.Q.value=.8;vibrato.frequency.value=5.2;depth.gain.value=hz*.012;vibrato.connect(depth).connect(voice.frequency);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.045,at+.035);gain.gain.setValueAtTime(.035,at+duration*.65);gain.gain.exponentialRampToValueAtTime(.001,at+duration);voice.connect(filter).connect(gain).connect(context.destination);voice.start(at);vibrato.start(at);voice.stop(at+duration+.02);vibrato.stop(at+duration+.02);activeVoices.push(voice,vibrato);voice.onended=()=>{voice.disconnect();filter.disconnect();gain.disconnect();vibrato.disconnect();depth.disconnect();activeVoices=activeVoices.filter(x=>x!==voice&&x!==vibrato);};at+=duration;});
  audioTimer=setTimeout(silence,5200);
 }
 function stop(el){const run=running.get(el);if(run){clearTimeout(run.timer);if(run.sound)silence();running.delete(el);}delete el.dataset.action;delete el.dataset.actionStarted;}
 function play(el,action='wave',options={}){if(!el||!durations[action])return 0;stop(el);if(reduced.matches||el.dataset.quiet==='true')return 0;void el.offsetWidth;el.dataset.action=action;el.dataset.actionStarted=String(performance.now());const run={sound:action==='sing'&&options.sound===true,timer:null};running.set(el,run);if(run.sound)void sing();run.timer=setTimeout(()=>{stop(el);options.onFinish?.();},durations[action]);return durations[action];}
 function stopAll(){for(const el of running.keys())stop(el);silence();}
 async function setSound(enabled){sound=!!enabled;try{localStorage.setItem('foamlab-panda-sound',String(sound));}catch{}if(sound){const ok=await unlock();if(!ok){sound=false;try{localStorage.setItem('foamlab-panda-sound','false');}catch{}}}else silence();window.dispatchEvent(new CustomEvent('foamlab:panda-sound',{detail:{enabled:sound}}));return sound;}
 window.foamPandaMotion={play,stop,stopAll,durations,setSound,get sound(){return sound;}};
 reduced.addEventListener('change',()=>{if(reduced.matches)stopAll();});document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});window.addEventListener('pagehide',stopAll);
})();
