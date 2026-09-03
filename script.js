
/* =========================================================
   V14 — SINGLE LOGIN BACKGROUND TRACK
   One file only: assets/login.mp3
   WebAudio/SFX for wrong/correct/access remain untouched.
   ========================================================= */
const v14LoginMusic = document.getElementById("loginMusic");

function v14StartLoginMusic(){
  /* V15.6: no opening/login background music. SFX remain active. */
  if(!v14LoginMusic) return;
  try{
    v14LoginMusic.pause();
    v14LoginMusic.currentTime=0;
    v14LoginMusic.volume=0;
    v14LoginMusic.muted=true;
  }catch(e){}
}

function v14StopLoginMusic(fadeMs=700){
  if(!v14LoginMusic || v14LoginMusic.paused) return;
  const startVol = v14LoginMusic.volume;
  const steps = 14;
  let i = 0;
  const timer = setInterval(()=>{
    i++;
    v14LoginMusic.volume = Math.max(0, startVol * (1 - i/steps));
    if(i >= steps){
      clearInterval(timer);
      v14LoginMusic.pause();
      v14LoginMusic.currentTime = 0;
      v14LoginMusic.volume = 0.10;
    }
  }, Math.max(20, fadeMs/steps));
}

window.addEventListener("DOMContentLoaded", ()=>{
  v14StartLoginMusic();
});

document.addEventListener("pointerdown", v14StartLoginMusic, {once:true});
document.addEventListener("keydown", v14StartLoginMusic, {once:true});
document.addEventListener("touchstart", v14StartLoginMusic, {once:true, passive:true});

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let currentPuzzle=0,keyRecovered=false;
let keyHintRevealed=false;
const memoryMusic=$("#memoryMusic");
const letterMusic=$("#letterMusic");
const loginMusic=$("#loginMusic");
const birthdayMusic=$("#birthdayMusic");

/* Built-in procedural SFX — no extra audio files required */
let audioCtx=null;
let ambientMaster=null, ambientNodes=[], ambientPulseTimer=null;
function startSpaceAmbient(){
  // V8.1: disabled — romantic music is the only continuous background layer.
}

let spaceSweepTimer=null;
function spaceSweep(){
  // V8.1: disabled.
}
function setAmbientLevel(value,duration=.8){
  // V8.1: disabled.
}


function playMemoryTrack(){
  stopTrack(letterMusic,350);
  if(memoryMusic){
    v156StartFresh(memoryMusic,.20,1800);
  }
}
function playLetterTrack(){
  v156StopSmooth(memoryMusic,1800);
  if(letterMusic){
    v156StartFresh(letterMusic,.72,1500);
  }
}

function ctx(){
  if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==="suspended") audioCtx.resume();
  return audioCtx;
}
function tone(freq,duration=.12,type="sine",gain=.045,delay=0,endFreq=null){
  const c=ctx(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;
  const boostedGain=Math.min(.13,gain*1.48); // V15.7: clearer interaction SFX, still controlled
  o.type=type;o.frequency.setValueAtTime(freq,t);
  if(endFreq) o.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),t+duration);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(boostedGain,t+.015);
  g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+duration+.03);
}
function sfxError(){
  tone(165,.16,"sawtooth",.055,0,105);
  tone(125,.19,"square",.025,.12,82);
}
function sfxSelect(){
  tone(520,.055,"sine",.028);
  tone(780,.08,"sine",.025,.055);
}
function sfxCorrect(){
  tone(440,.10,"sine",.035);
  tone(660,.12,"sine",.04,.08);
  tone(990,.20,"sine",.035,.18,1320);
}
function sfxDecode(){
  [180,240,320,430,570,760].forEach((f,i)=>tone(f,.16,"sine",.018,i*.085,f*1.45));
}

function sfxAccess(){
  tone(392,.14,"sine",.035);
  tone(523,.16,"sine",.04,.10);
  tone(659,.18,"sine",.045,.21);
  tone(1046,.42,"sine",.035,.34,1318);
}

function v157SfxKey(kind="type"){
  if(kind==="delete"){
    tone(310,.045,"square",.020,0,245);
    tone(180,.035,"sine",.012,.025);
  }else{
    tone(760,.032,"square",.016);
    tone(1120,.038,"sine",.011,.018,1320);
  }
}
const v157Password=document.getElementById("password");
v157Password?.addEventListener("keydown",e=>{
  if(e.metaKey||e.ctrlKey||e.altKey||["Shift","Tab","Enter","Escape","ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) return;
  if(e.key==="Backspace"||e.key==="Delete"){ v157SfxKey("delete"); return; }
  if(e.key.length===1) v157SfxKey("type");
});

/* Birthday scene melody — synthesized in browser, no extra MP3 required */
let birthdayTimers=[];
function stopBirthdayMelody(){
  birthdayTimers.forEach(clearTimeout);
  birthdayTimers=[];
}
function birthdayNote(freq,beats=1,delay=0){
  birthdayTimers.push(setTimeout(()=>{
    tone(freq,.36*beats,"sine",.145,0,freq*1.002);
    tone(freq/2,.34*beats,"triangle",.060,0,freq/2);
  }, delay));
}
function birthdaySequence(){
  const G4=392.00,A4=440.00,B4=493.88,C5=523.25,D5=587.33,E5=659.25,
        Fs5=739.99,G5=783.99;
  return [
    [G4,.75],[G4,.35],[A4,1.1],[G4,1.1],[C5,1.1],[B4,2],
    [G4,.75],[G4,.35],[A4,1.1],[G4,1.1],[D5,1.1],[C5,2],
    [G4,.75],[G4,.35],[G5,1.1],[E5,1.1],[C5,1.1],[B4,1.1],[A4,1.9],
    [Fs5,.75],[Fs5,.35],[E5,1.1],[C5,1.1],[D5,1.1],[C5,2.1]
  ];
}
function scheduleBirthdaySequence(seq,startDelay=0){
  let t=startDelay;
  seq.forEach(([f,b])=>{
    birthdayNote(f,b,t);
    t += 300*b;
  });
  return t;
}
function playBirthdayMelodyOneAndHalf(){
  stopBirthdayMelody();
  const full=birthdaySequence();
  const fullEnd=scheduleBirthdaySequence(full,0);
  /* Half = first two musical phrases. */
  scheduleBirthdaySequence(full.slice(0,12),fullEnd+180);
}
function fadeAudio(audio,target,duration=700){
  const start=audio.volume,steps=24,step=duration/steps;let i=0;
  const timer=setInterval(()=>{
    i++;
    audio.volume=Math.max(0,Math.min(1,start+(target-start)*(i/steps)));
    if(i>=steps) clearInterval(timer);
  },step);
}
function fadeTrack(audio,target,duration=700){
  if(!audio) return;
  const start=Number.isFinite(audio.volume)?audio.volume:0;
  const steps=24,step=Math.max(20,duration/steps);let i=0;
  const timer=setInterval(()=>{
    i++;
    audio.volume=Math.max(0,Math.min(1,start+(target-start)*(i/steps)));
    if(i>=steps) clearInterval(timer);
  },step);
}
function stopTrack(audio,duration=500){
  if(!audio) return;
  fadeTrack(audio,0,duration);
  setTimeout(()=>{try{audio.pause();audio.currentTime=0}catch(e){}},duration+80);
}

let v156FadeTimers=new WeakMap();
function v156SmoothFade(audio,target,duration=1400,onDone=null){
  if(!audio) return;
  const old=v156FadeTimers.get(audio);
  if(old) clearInterval(old);
  const start=Number.isFinite(audio.volume)?audio.volume:0;
  const steps=40, step=Math.max(24,duration/steps);
  let i=0;
  const timer=setInterval(()=>{
    i++;
    const x=i/steps;
    const eased=x*x*(3-2*x);
    audio.volume=Math.max(0,Math.min(1,start+(target-start)*eased));
    if(i>=steps){
      clearInterval(timer);
      v156FadeTimers.delete(audio);
      audio.volume=target;
      if(onDone) onDone();
    }
  },step);
  v156FadeTimers.set(audio,timer);
}
function v156StartFresh(audio,target,duration=1600){
  if(!audio) return;
  const old=v156FadeTimers.get(audio);
  if(old) clearInterval(old);
  try{
    audio.pause();
    audio.currentTime=0;
    audio.volume=0;
    const p=audio.play();
    if(p&&typeof p.catch==="function") p.catch(()=>{});
    v156SmoothFade(audio,target,duration);
  }catch(e){}
}
function v156StopSmooth(audio,duration=1600){
  if(!audio) return;
  v156SmoothFade(audio,0,duration,()=>{
    try{audio.pause();audio.currentTime=0}catch(e){}
  });
}
function playBirthdayPiano(){
  v156StartFresh(birthdayMusic,.58,1400);
}
function duckMemoryMusic(isReading){
  if(!memoryMusic || memoryMusic.paused) return;
  v156SmoothFade(memoryMusic,isReading?.08:.20,isReading?1800:2000);
}

function flashBody(cls,ms=950){
  document.body.classList.remove("alarm-red","success-green");
  void document.body.offsetWidth;
  document.body.classList.add(cls);
  setTimeout(()=>document.body.classList.remove(cls),ms);
}
function decryptPulse(kind){
  const s=$("#decryptScene");
  s.classList.remove("answer-success","answer-error");
  void s.offsetWidth;
  s.classList.add(kind);
  setTimeout(()=>s.classList.remove(kind),850);
}

function showScene(id){$$(".scene").forEach(s=>s.classList.toggle("active",s.id===id))}
function setLog(text){$("#systemLog").innerHTML=`<span>SYS</span> ${text}`}
function revealKeyHint(){
  if(keyHintRevealed) return;
  keyHintRevealed=true;
  setTimeout(()=>{
    $("#getKeyBtn").classList.add("key-hint-visible");
  },700);
}

for(let i=0;i<48;i++){
  const p=document.createElement("i");
  p.className="particle";
  p.style.left=Math.random()*100+"%";
  p.style.top=(20+Math.random()*100)+"%";
  p.style.animationDuration=(9+Math.random()*18)+"s";
  p.style.animationDelay=(-Math.random()*18)+"s";
  $("#particles").appendChild(p);
}

function tryLoginAutoplay(){
  /* V15.6: intentionally silent opening. */
  if(!loginMusic) return;
  try{
    loginMusic.pause();
    loginMusic.currentTime=0;
    loginMusic.volume=0;
    loginMusic.muted=true;
  }catch(e){}
}
tryLoginAutoplay();

/* Browsers may block audible autoplay. These are fallback unlocks only. */
const unlockLoginAudio=()=>{
  tryLoginAutoplay();
  memoryMusic.volume=.52;
  startSpaceAmbient();
  spaceSweep();
  setTimeout(()=>setAmbientLevel(.11,.7),80);
  document.removeEventListener("pointerdown",unlockLoginAudio);
  document.removeEventListener("keydown",unlockLoginAudio);
};
document.addEventListener("pointerdown",unlockLoginAudio,{once:true});
document.addEventListener("keydown",unlockLoginAudio,{once:true});


$("#getKeyBtn").onclick=()=>{resetPuzzle();fadeAudio(loginMusic,.30,.7);setAmbientLevel(.14,.8);showScene("decryptScene")};
$("#backLoginBtn").onclick=()=>{fadeAudio(loginMusic,.48,.7);setAmbientLevel(.11,.8);showScene("loginScene")};

$("#loginForm").onsubmit=e=>{
  e.preventDefault();
  $("#assembleScene")?.classList.remove("v157-access-granted");
  const value=$("#password").value.trim();
  const status=$("#loginStatus");

  /* Correct final code works immediately; recovery appears only after a wrong attempt. */
  if(value!=="192328"){
    status.textContent="MẬT KHẨU KHÔNG ĐÚNG · ACCESS DENIED";
    sfxError(); flashBody("alarm-red",1000);
    revealKeyHint();
    return;
  }

  status.textContent="ĐANG XÁC MINH...";
  sfxSelect();
  fadeAudio(loginMusic,.12,900);
  setTimeout(()=>{
    status.textContent="ĐANG GIẢI MÃ...";
    sfxDecode();
    setTimeout(()=>{
      showScene("assembleScene");
      $("#assembleScene").classList.add("v157-access-granted");
      $("#assembleTitle").textContent="ACCESS GRANTED";
      $("#assembleValue").textContent="Đang mở ký ức riêng tư...";
      sfxAccess(); flashBody("success-green",1150); fadeAudio(loginMusic,0,900);
      setTimeout(()=>{
        showScene("birthdayScene");
        fadeTrack(memoryMusic,.05,500);
        setAmbientLevel(.008,.7);
        setTimeout(()=>playBirthdayPiano(),220);
        setTimeout(()=>{
          $("#birthdayScene").classList.add("memory-transitioning");
          const bridge=$("#v158MemoryBridge");
          bridge?.classList.add("active","phase-copy");
          v156StopSmooth(birthdayMusic,1700);
          setTimeout(()=>bridge?.classList.add("phase-cake"),1050);
          setTimeout(()=>bridge?.classList.add("fragments-live"),1850);
          setTimeout(()=>bridge?.classList.add("phase-hold"),3050);
          setTimeout(()=>{
            $("#birthdayScene").classList.add("cake-dissolve");
            bridge?.classList.add("core-live");
          },3850);
          setTimeout(()=>bridge?.classList.add("nodes-live"),4750);
        },10850);
        setTimeout(()=>{
          stopBirthdayMelody();
          setAmbientLevel(.045,1.2);
          showScene("memoryScene");
          playMemoryTrack();
          initOrbitMemories();
          const bridge=$("#v158MemoryBridge");
          bridge?.classList.remove("active","phase-copy","phase-cake","fragments-live","phase-hold","core-live","nodes-live");
          $("#birthdayScene").classList.remove("memory-transitioning","cake-dissolve");
          setTimeout(()=>document.getElementById("memoryScene")?.focus({preventScroll:true}),120);
        },16650);
      },2200);
    },1300);
  },600);
};

const puzzles=[
  {q:"Ngày đầu tiên anh gặp em?",h:"....",answers:["19","23","28","05"],correct:"19"},
  {q:"Một ngày mưa siêu lớn?",h:"...",answers:["19","23","08","26"],correct:"23"},
  {q:"Ngày anh nói yêu em là ngày nào?",h:"...",answers:["05","19","28","09"],correct:"28"}
];

function resetPuzzle(){
  currentPuzzle=0;
  keyRecovered=false;
  $("#lockStatus").textContent="LOCKED";
  setLog("INITIALIZING SECURE MEMORY...");
  [1,2,3].forEach(n=>{
    const f=$("#fragment"+n);
    f.classList.remove("solved");
    f.querySelector("strong").textContent="_ _";
    f.querySelector("small").textContent="LOCKED";
  });
  renderPuzzle();
}

function renderPuzzle(){
  const p=puzzles[currentPuzzle];
  $("#stepLabel").textContent=`MẢNH KHÓA 0${currentPuzzle+1} / 03`;
  $("#progressLabel").textContent=`${currentPuzzle} / 3`;
  $("#questionText").textContent=p.q;
  $("#questionHint").textContent=p.h;
  $("#questionStatus").textContent="";
  const grid=$("#answerGrid");
  grid.innerHTML="";
  p.answers.forEach(v=>{
    const b=document.createElement("button");
    b.className="answer-btn";
    b.textContent=v;
    b.onclick=()=>checkAnswer(b,v);
    grid.appendChild(b);
  });
}

function checkAnswer(btn,value){
  const p=puzzles[currentPuzzle];
  if(value!==p.correct){
    btn.classList.add("wrong");
    sfxError(); decryptPulse("answer-error");
    $("#questionStatus").textContent="CHƯA ĐÚNG — HÃY THỬ LẠI";
    setTimeout(()=>btn.classList.remove("wrong"),350);
    return;
  }

  $$(".answer-btn").forEach(x=>x.disabled=true);
  btn.classList.add("correct");
  sfxCorrect(); decryptPulse("answer-success");
  const frag=$("#fragment"+(currentPuzzle+1));
  frag.classList.add("solved","correct-pulse");
  setTimeout(()=>frag.classList.remove("correct-pulse"),1100);
  frag.querySelector("strong").textContent=value;
  frag.querySelector("small").textContent="UNLOCKED";
  $("#lockStatus").textContent="SCANNING";
  setLog(`FRAGMENT 0${currentPuzzle+1} UNLOCKED · DATA VERIFIED`);
  $("#questionStatus").textContent="MẢNH KHÓA ĐÃ ĐƯỢC KHÔI PHỤC";

  setTimeout(()=>{
    currentPuzzle++;
    if(currentPuzzle<3){
      setLog(`WAITING FOR FRAGMENT 0${currentPuzzle+1}...`);
      renderPuzzle();
    }else{
      keyRecovered=true;
      $("#lockStatus").textContent="UNLOCKED";
      setLog("ALL FRAGMENTS VERIFIED · ACCESS SEQUENCE READY");

      showScene("assembleScene");
      sfxDecode();
      $("#assembleTitle").textContent="ĐANG GHÉP CHÌA KHÓA...";
      $("#assembleValue").textContent="19 · 23 · 28";

      setTimeout(()=>{
        $("#assembleTitle").textContent="CHÌA KHÓA ĐÃ ĐƯỢC KHÔI PHỤC";
        $("#assembleValue").textContent="192328";
      },1200);

      setTimeout(()=>{
        showScene("loginScene");
        $("#loginStatus").textContent="CHÌA KHÓA ĐÃ XÁC NHẬN — NHẬP 192328";
        $("#password").focus();
      },2500);
    }
  },750);
}

/* Legacy Memories slider removed. */

const letterParagraphs=$$("#letterScene .letter-card p");
const letterOriginals=letterParagraphs.map(p=>p.innerHTML);
let letterTypingTimers=[];

function clearLetterTyping(){
  letterTypingTimers.forEach(clearTimeout);
  letterTypingTimers=[];
}


function v94EndingParticles(){
 const layer=document.querySelector("#v94Ending .v94-ending-particles");if(!layer)return;layer.innerHTML="";
 for(let i=0;i<58;i++){const p=document.createElement("i");p.style.left=`${Math.random()*100}%`;p.style.setProperty("--vx",`${-55+Math.random()*110}px`);p.style.setProperty("--dur",`${3.8+Math.random()*4.5}s`);p.style.setProperty("--delay",`${Math.random()*1.4}s`);p.style.setProperty("--size",`${1.5+Math.random()*4}px`);layer.appendChild(p);}
}
function v94ShowEnding(){
 const ending=document.getElementById("v94Ending");if(!ending)return;
 v93LoveSurge();try{v93Heartbeat();setTimeout(()=>v93Heartbeat(),620);setTimeout(()=>v93MagicBurst(),1300)}catch(e){}
 setTimeout(()=>{ending.classList.add("show");ending.setAttribute("aria-hidden","false");v94EndingParticles();try{v93Tone(659,.55,"sine",.026);v93Tone(988,.75,"sine",.018,.12)}catch(e){}},1550);
}
function v94ResetEnding(){const e=document.getElementById("v94Ending");e?.classList.remove("show");e?.setAttribute("aria-hidden","true")}
document.getElementById("v94ReplayBtn")?.addEventListener("click",()=>{
 try{clearLetterTyping();v93StopLoveAtmosphere();stopBirthdayMelody();fadeAudio(letterMusic,0,500);fadeAudio(memoryMusic,0,500);loginMusic.currentTime=0;fadeAudio(loginMusic,.48,700)}catch(e){}
 v94ResetEnding();keyRecovered=false;document.getElementById("password").value="";document.getElementById("loginStatus").textContent="";document.getElementById("getKeyBtn")?.classList.remove("visible");showScene("loginScene");setTimeout(()=>document.getElementById("password")?.focus(),300);
});


document.getElementById("v111FinalBtn")?.addEventListener("click",()=>{
  const btn=document.getElementById("v111FinalBtn");
  if(btn?.classList.contains("leaving"))return;
  btn?.classList.add("leaving");
  try{v93Heartbeat();v93Tone(880,.28,"sine",.024,.12)}catch(e){}
  setTimeout(v94ShowEnding,380);
});

function startHandwrittenLetter(){
  clearLetterTyping();
  v94ResetEnding();
  const finalBtn=document.getElementById("v111FinalBtn");
  finalBtn?.classList.remove("show","leaving");
  finalBtn?.setAttribute("aria-hidden","true");
  const card=$("#letterScene .letter-card");
  const endBtn=null;
  card.classList.remove("letter-finished");
  

  // Use textContent for the writing animation, then restore final HTML
  // so the signature/emphasis remains exactly as in the original V7.2.
  const plainTexts=letterParagraphs.map(p=>{
    const temp=document.createElement("div");
    temp.innerHTML=p.dataset.originalHtml || p.innerHTML;
    return temp.textContent;
  });

  letterParagraphs.forEach((p,i)=>{
    if(!p.dataset.originalHtml) p.dataset.originalHtml=letterOriginals[i];
    p.textContent="";
    p.classList.add("handwriting-line");
  });

  let paragraph=0, character=0;
  const writeNext=()=>{
    if(paragraph>=letterParagraphs.length){
      letterParagraphs.forEach(p=>p.innerHTML=p.dataset.originalHtml);
      card.classList.add("letter-finished");
      const finalBtn=document.getElementById("v111FinalBtn");
      if(finalBtn){
        finalBtn.classList.add("show");
        finalBtn.setAttribute("aria-hidden","false");
        try{v93Tone(740,.20,"sine",.022);v93Tone(1110,.32,"triangle",.014,.08)}catch(e){}
      }
      
      return;
    }

    const text=plainTexts[paragraph];
    letterParagraphs[paragraph].textContent=text.slice(0,character+1);
    const ch=text.charAt(character);
    character++;

    if(character>=text.length){
      paragraph++;
      character=0;
      letterTypingTimers.push(setTimeout(writeNext,420));
      return;
    }

    const delay=/[.!?]/.test(ch) ? 190 :
                /[,;:—]/.test(ch) ? 115 :
                44 + Math.random()*26;
    letterTypingTimers.push(setTimeout(writeNext,delay));
  };

  letterTypingTimers.push(setTimeout(writeNext,650));
}



let v93HeartTimer=0;
function v93SpawnHeart(){
  const layer=document.getElementById("v93LoveAtmosphere");
  if(!layer||!document.getElementById("letterScene")?.classList.contains("active"))return;
  const el=document.createElement("span");
  el.className="v93-floating-heart";
  el.textContent=Math.random()>.45?"♡":"♥";
  el.style.left=`${3+Math.random()*94}%`;
  el.style.setProperty("--drift",`${-90+Math.random()*180}px`);
  el.style.setProperty("--dur",`${3.4+Math.random()*3.8}s`);
  el.style.setProperty("--size",`${10+Math.random()*24}px`);
  el.style.setProperty("--delay",`${Math.random()*.25}s`);
  layer.appendChild(el);
  setTimeout(()=>el.remove(),7800);
}
function v93StartLoveAtmosphere(){
  clearInterval(v93HeartTimer);
  for(let i=0;i<16;i++)setTimeout(v93SpawnHeart,i*95);
  v93HeartTimer=setInterval(()=>{
    v93SpawnHeart();
    if(Math.random()>.45)v93SpawnHeart();
  },310);
}
function v93LoveSurge(){
  for(let i=0;i<26;i++)setTimeout(v93SpawnHeart,i*42);
  try{v93Heartbeat();v93Tone(880,.25,"sine",.025,.18)}catch(e){}
}
function v93StopLoveAtmosphere(){
  clearInterval(v93HeartTimer);v93HeartTimer=0;
  setTimeout(()=>document.querySelectorAll(".v93-floating-heart").forEach(x=>x.remove()),5200);
}
function launchLetterHearts(){
  const layer=document.getElementById("heartBurstLayer");
  if(!layer) return;
  layer.innerHTML="";
  const total=46;
  for(let i=0;i<total;i++){
    const h=document.createElement("span");
    h.className="letter-heart";
    h.textContent=Math.random()>.18 ? "♥" : "♡";
    h.style.setProperty("--x",`${4+Math.random()*92}%`);
    h.style.setProperty("--drift",`${-90+Math.random()*180}px`);
    h.style.setProperty("--size",`${10+Math.random()*23}px`);
    h.style.setProperty("--delay",`${Math.random()*2.8}s`);
    h.style.setProperty("--dur",`${3.8+Math.random()*3.5}s`);
    h.style.setProperty("--rot",`${-35+Math.random()*70}deg`);
    layer.appendChild(h);
  }
  layer.classList.remove("active");
  void layer.offsetWidth;
  layer.classList.add("active");
  setTimeout(()=>{layer.classList.remove("active");layer.innerHTML="";},7800);
}

$("#giftBox").onclick=()=>{
  if($("#giftBox").classList.contains("open")) return;
  $("#giftBox").classList.add("open");
  $("#giftHint").textContent="ĐÃ MỞ";
  setTimeout(()=>{
    showScene("letterScene");
    playLetterTrack();
    launchLetterHearts();
    v93StartLoveAtmosphere();
    setTimeout(v93LoveSurge,10500);
    startHandwrittenLetter();
  },1300);
};

resetPuzzle();






/* =========================================================
   V9.1 — TRUE ORBIT / MEMORY NOTE / COLLECT / VAULT
   ========================================================= */


const v91Data=[
  {key:"m1",label:"19/08/2026",title:"Lần đầu gặp nhau.",text:"Một khoảnh khắc xấu hổ của tui không nhớ được nhiều nhưng dễ huông.",tone:"cyan"},
  {key:"m2",label:"23/08/2026",title:"Một ngày mưa lớn ơi là lớn.",text:"Một ngày quá cảm động gớt nước mũi của tui trời ơi mưa lớn zị mà cũng dám qua đốn tui,nể lunn.",tone:"rain"},
  {key:"m3",label:"28/08/2026",title:"Ngày mình có nhau.",text:"Từ một câu nói ngắn, mọi thứ giữa hai đứa mình đã có một cái tên khác.",tone:"love"}
];

let v91Seen=new Set();
let v91Busy=false;
let v91RAF=0;
let v91OrbitStart=0;
let v91ActiveIndex=null;
let v921UnlockedIndex=0;

function v91Cards(){ return [...document.querySelectorAll(".v91-card")]; }

function v921ApplyLocks(){
  v91Cards().forEach((card,i)=>{
    const locked=i>v921UnlockedIndex && !v91Seen.has(i);
    card.classList.toggle("locked",locked);
    card.setAttribute("aria-disabled",locked?"true":"false");
    card.setAttribute("aria-label",locked ? `Ký ức ${i+1} đang khóa` : `Mở ký ức thứ ${i+1}`);
    const state=card.querySelector(".v157-node-state");
    if(state) state.textContent=locked?"LOCKED":"READY";
  });
}

function v921Unlock(index){
  v921UnlockedIndex=Math.max(v921UnlockedIndex,index);
  const card=v91Cards()[index];
  if(!card) return;
  card.classList.remove("locked");
  const state=card.querySelector(".v157-node-state");
  if(state) state.textContent="READY";
  card.classList.add("unlock-flash");
  card.setAttribute("aria-disabled","false");
  card.setAttribute("aria-label",`Mở ký ức thứ ${index+1}`);
  try{sfxSuccess()}catch(e){}
  setTimeout(()=>card.classList.remove("unlock-flash"),900);
}

function v91OrbitFrame(now){
  const scene=document.getElementById("memoryScene");
  if(!scene?.classList.contains("active")){
    v91RAF=requestAnimationFrame(v91OrbitFrame);
    return;
  }
  if(!v91OrbitStart) v91OrbitStart=now;

  const compact=window.innerWidth<=820;
  const rx=compact?Math.min(112,window.innerWidth*.27):Math.min(330,window.innerWidth*.22);
  const ry=compact?64:118;
  const speed=(Math.PI*2)/7600;

  v91Cards().forEach((card,i)=>{
    if(card.classList.contains("selected")||card.classList.contains("collected")) return;

    const a=(now-v91OrbitStart)*speed+i*(Math.PI*2/3);
    const x=Math.cos(a)*rx;
    const y=Math.sin(a)*ry;
    const front=(Math.sin(a)+1)/2;
    const scale=(compact?.60:.56)+(compact?.42:.46)*front;
    const z=-120+260*front;

    card.style.transform=`translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) scale(${scale}) rotateZ(${Math.cos(a)*3}deg)`;
    card.style.opacity=String(.42+.58*front);
    card.style.filter=`brightness(${.48+.58*front}) blur(${(1-front)*.75}px)`;
    card.style.zIndex=String(10+Math.round(front*30));
  });

  v91RAF=requestAnimationFrame(v91OrbitFrame);
}

function v10ApplyMemoryDates(){
  const dates=["19/08/2026","23/08/2026","28/08/2026"];
  document.querySelectorAll(".v91-card").forEach((card,i)=>{
    const b=card.querySelector(".v91-polaroid b"); if(b&&dates[i]) b.textContent=dates[i];
  });
  document.querySelectorAll(".v91-crystal").forEach((el,i)=>{
    const t=el.querySelector("span")||el; if(dates[i]) t.textContent=dates[i];
  });
  document.querySelectorAll(".v91-slot").forEach((el,i)=>{
    const t=el.querySelector("span")||el; if(dates[i]) t.textContent=dates[i];
  });
  document.querySelectorAll(".v93-memory-node").forEach((el,i)=>{
    const t=el.querySelector("span")||el; if(dates[i]) t.textContent=dates[i];
  });
}
function initOrbitMemories(){
  v10ApplyMemoryDates();
  v91Seen=new Set();
  v91Busy=false;
  v91ActiveIndex=null;
  v921UnlockedIndex=0;
  v91OrbitStart=performance.now();

  document.getElementById("v91Orbit")?.classList.remove("focus","to-vault");
  document.getElementById("v91Vault")?.classList.remove("show","keys-in","unlocked","leave");
  document.getElementById("v91Note")?.classList.remove("show","tone-cyan","tone-rain","tone-love");

  v91Cards().forEach((card,i)=>{
    card.classList.remove("selected","collecting","collected","unlock-flash");
    card.disabled=false;
    card.style.removeProperty("pointer-events");
    card.setAttribute("aria-disabled", i===0 ? "false" : "true");
  });

  document.querySelectorAll(".v91-crystal").forEach(c=>c.classList.remove("collected","pulse"));
  document.querySelectorAll(".v91-slot").forEach(s=>s.classList.remove("active"));

  const btn=document.getElementById("v92CollectBtn");
  if(btn) btn.disabled=false;

  v921ApplyLocks();
  cancelAnimationFrame(v91RAF);
  v91RAF=requestAnimationFrame(v91OrbitFrame);
}

function v91OpenMemory(index){
  if(v91Busy || v91Seen.has(index) || v91ActiveIndex!==null) return;

  /* Sequential rule: only the currently unlocked memory can open. */
  if(index>v921UnlockedIndex){
    const card=v91Cards()[index];
    card?.classList.add("locked-denied");
    try{sfxError()}catch(e){}
    setTimeout(()=>card?.classList.remove("locked-denied"),520);
    return;
  }

  const d=v91Data[index];
  const card=v91Cards()[index];
  const note=document.getElementById("v91Note");
  const orbit=document.getElementById("v91Orbit");
  if(!d||!card||!note||!orbit) return;

  v91Busy=true;
  v91ActiveIndex=index;
  orbit.classList.add("focus");
  card.classList.add("selected");

  const compact=window.innerWidth<=820;
  card.style.transform=compact
    ? "translate(-50%,-50%) translate3d(0,-128px,220px) scale(.88) rotateZ(-2deg)"
    : "translate(-50%,-57%) translate3d(-150px,0,300px) scale(1.18) rotateZ(-2deg)";
  card.style.opacity="1";
  card.style.filter="none";
  card.style.zIndex="70";

  note.className=`v91-note tone-${d.tone}`;
  document.getElementById("v91NoteNo").textContent=d.label;
  document.getElementById("v91NoteTitle").textContent=d.title;
  document.getElementById("v91NoteText").textContent=d.text;
  document.getElementById("v91NoteStatus").textContent="KÝ ỨC ĐANG MỞ · ĐỌC XONG THÌ GIỮ LẠI";

  setTimeout(()=>note.classList.add("show"),180);
  duckMemoryMusic(true);
  try{sfxSelect()}catch(e){}
}

function v91FlyToCrystal(card,key){
  const target=document.querySelector(`.v91-crystal[data-key="${key}"]`);
  if(!card||!target) return Promise.resolve();

  const from=card.getBoundingClientRect();
  const to=target.getBoundingClientRect();
  const clone=card.querySelector(".v91-polaroid")?.cloneNode(true);
  if(!clone) return Promise.resolve();

  clone.classList.add("v91-flying-token");
  Object.assign(clone.style,{
    left:`${from.left}px`,
    top:`${from.top}px`,
    width:`${from.width}px`,
    height:`${from.height}px`
  });
  document.body.appendChild(clone);

  const dx=(to.left+to.width/2)-(from.left+from.width/2);
  const dy=(to.top+to.height/2)-(from.top+from.height/2);

  return new Promise(resolve=>{
    requestAnimationFrame(()=>{
      clone.style.transform=`translate3d(${dx}px,${dy}px,0) scale(.16) rotate(24deg)`;
      clone.style.opacity="0";
      clone.style.filter="blur(2px) brightness(1.4)";
    });
    setTimeout(()=>{
      clone.remove();
      target.classList.add("collected","pulse");
      setTimeout(()=>target.classList.remove("pulse"),650);
      resolve();
    },760);
  });
}

async function v92CollectActiveMemory(){
  if(v91ActiveIndex===null || !v91Busy) return;

  const index=v91ActiveIndex;
  const d=v91Data[index];
  const card=v91Cards()[index];
  const note=document.getElementById("v91Note");
  const orbit=document.getElementById("v91Orbit");
  const btn=document.getElementById("v92CollectBtn");
  if(!d||!card||!note||!orbit) return;

  if(btn) btn.disabled=true;
  note.classList.remove("show");
  duckMemoryMusic(false);
  card.classList.add("collecting");

  await v91FlyToCrystal(card,d.key);

  card.classList.remove("selected","collecting");
  card.classList.add("collected");
  card.disabled=true;
  card.style.pointerEvents="none";

  v91Seen.add(index);
  v91ActiveIndex=null;
  orbit.classList.remove("focus");

  if(v91Seen.size===3){
    v91Busy=true;
    setTimeout(v91StartVault,650);
  }else{
    /* Unlock exactly the next memory after collection. */
    const next=index+1;
    v921Unlock(next);
    v91Busy=false;
    if(btn) btn.disabled=false;
  }
}

function v93Tone(freq=660,duration=.12,type="sine",gain=.055,delay=0){
  try{
    const C=window.AudioContext||window.webkitAudioContext;
    window.__v93ctx=window.__v93ctx||new C();
    const ctx=window.__v93ctx;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,ctx.currentTime+delay);
    g.gain.setValueAtTime(.0001,ctx.currentTime+delay);
    g.gain.exponentialRampToValueAtTime(gain,ctx.currentTime+delay+.018);
    g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+delay+duration);
    o.connect(g);g.connect(ctx.destination);
    o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+duration+.03);
  }catch(e){}
}
function v93CrystalChime(i){v93Tone([620,790,980][i]||790,.18,"sine",.045);v93Tone([930,1185,1470][i]||1185,.22,"triangle",.018,.035)}
function v93Heartbeat(delay=0){v93Tone(72,.15,"sine",.12,delay);v93Tone(54,.22,"sine",.07,delay+.13)}
function v93MagicBurst(){[523,659,784,1047,1319].forEach((f,i)=>v93Tone(f,.65,"sine",.028,i*.045));v93Tone(115,.65,"sine",.07,0)}
function v93SpawnFinaleParticles(layer,count=90){
  if(!layer)return;
  for(let i=0;i<count;i++){
    const p=document.createElement("i");p.className="v93-fp";
    const a=Math.random()*Math.PI*2,dist=90+Math.random()*420;
    p.style.setProperty("--x",`${Math.cos(a)*dist}px`);
    p.style.setProperty("--y",`${Math.sin(a)*dist}px`);
    p.style.setProperty("--d",`${.65+Math.random()*1.15}s`);
    p.style.setProperty("--s",`${2+Math.random()*5}px`);
    p.style.setProperty("--delay",`${Math.random()*.18}s`);
    layer.appendChild(p);
  }
}
function v91StartVault(){
  const orbit=document.getElementById("v91Orbit");
  const finale=document.getElementById("v93Constellation");
  if(!orbit||!finale){showScene("giftScene");return;}
  v91Busy=true;
  orbit.classList.add("to-vault");
  finale.classList.add("show");
  finale.setAttribute("aria-hidden","false");
  [0,1,2].forEach((n,i)=>setTimeout(()=>{finale.classList.add(`node-${i+1}`);v93CrystalChime(i)},350+i*430));
  setTimeout(()=>{finale.classList.add("connect");v93Tone(410,.5,"triangle",.035);},1750);
  setTimeout(()=>{finale.classList.add("heart");v93Heartbeat();},2450);
  setTimeout(()=>{finale.classList.add("beat2");v93Heartbeat();},3150);
  setTimeout(()=>{
    finale.classList.add("burst");
    v93MagicBurst();
    v93SpawnFinaleParticles(finale.querySelector(".v93-particle-field"),110);
  },3750);
  setTimeout(()=>{
    showScene("giftScene");
    v156StopSmooth(memoryMusic,2000);
    document.getElementById("giftBox")?.classList.remove("open");
    const hint=document.getElementById("giftHint");if(hint)hint.textContent="CHẠM ĐỂ MỞ";
    try{v93Tone(880,.35,"sine",.035);v93Tone(1320,.5,"sine",.022,.08)}catch(e){}
    setTimeout(()=>{finale.className="v93-constellation";finale.setAttribute("aria-hidden","true");},500);
  },4650);
}

/* Use event delegation for the Note button so z-index/DOM replacement cannot break it. */
document.getElementById("memoryScene")?.addEventListener("click",e=>{
  const collect=e.target.closest("#v92CollectBtn");
  if(collect){
    e.preventDefault();
    e.stopPropagation();
    v92CollectActiveMemory();
    return;
  }

  const card=e.target.closest(".v91-card");
  if(card){
    e.preventDefault();
    e.stopPropagation();
    const index=Number(card.dataset.memory);
    if(Number.isInteger(index)) v91OpenMemory(index);
  }
});
