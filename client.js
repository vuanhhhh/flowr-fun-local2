console.log("Build ver 10.1 (this is not going to be updated every update probably)")

// Force WebSocket to connect to real backend instead of current origin
let HOST;
if (location.origin.includes('github.io')) {
    HOST = 'wss://flowr.fun';
} else if (location.origin === 'https://flowrclient.serum0017.repl.co') {
    HOST = 'wss://flowr.fun';
} else {
    HOST = location.origin.replace(/^http/, 'ws');
}
let ws = new WebSocket(HOST);
ws.binaryType = "arraybuffer";

window.state = localStorage.getItem("hashedPassword") === null ? "account" : "menu";
window.skipLogin = window.state === 'account' ? false : true;
window.connected = false;

window.reconnectTries = 20;
window.reconnecting = false;

function initWS(){
  ws.addEventListener("message", function (data) {
    if(window.state === 'game'){
      try {
        let msg = msgpackr.unpack(data.data);
        processGameMessage(msg);
      } catch(e){
        const decoded = new Float32Array(data.data);
        processRawMessage[decoded[0]](decoded);
      }
    } else {
      let msg = msgpackr.unpack(data.data);
      processMenuMessage(msg);
    }
  });

  ws.onopen = (e) => {
    if(window.reconnecting === true) {
      send({reconnect: true, id: window.reconnectId}); 
      window.state = 'game'; 
      console.log('reconnect msg');
      setTimeout(sendQueuedMessages, 100);
    }
    window.reconnecting = false;

    ws.binaryType = "arraybuffer";
    console.log('connected!');
    window.connected = true;
    window.connectedTime = window.time;
    document.querySelector('.grid').classList.add('show');

    if(window.skipLogin === true && window.reconnecting !== true){
      send({login: true, username, hashedPassword, hashedPassword2});
    }
    setInterval(() => {
      if(window.state !== 'game'){
        send({ping: true});
      }
    }, 20000);
  }

  ws.onclose = async (event) => {
    delete window.connectedTime;
    console.log('ws closed');
    console.log(event.reason);

    if(window.state !== 'game'){
      window.connected = false;
    } else {
      if(window.reconnectTries > 0){
        wsMsgQueue.length = 0;
        send = (msg) => {
          wsMsgQueue.push(msg);
        };
        console.log('trying to reconnect!');
        window.reconnecting = true;
        let attemptReconnect = ()=>{
          try{
            ws = new WebSocket(HOST);
            ws.binaryType = "arraybuffer";
          }catch(e){
            console.log("WS INIT FAILED, TRYING AGAIN")
            setTimeout(attemptReconnect, timeBetweenReconnects(window.reconnectTries));  
            window.reconnectTries--;
            return;
          }
          console.log("WS INIT");
          initWS();
          window.reconnectTries--;
        };
        setTimeout(attemptReconnect, timeBetweenReconnects(window.reconnectTries));  
      }
    }
    window.state = "disconnected";
  }
}

function timeBetweenReconnects(triesleft){
  if(triesleft > 16) return 200;
  if(triesleft > 12) return 500;
  if(triesleft > 8) return 1000;
  if(triesleft > 4) return 2000;
  return 5000;
}
initWS();

window.onload = () => {
  resize();
  document.querySelector('.loader').style.animation = 'fadeOut .2s';
  setTimeout(() => {
    document.querySelector('.loader').remove();
  }, 200 - 1000 / 60 * 2)

  for(let i = 0; i < onLoadFunctions.length; i++){
    onLoadFunctions[i]();
  }
  onLoadFunctions.length = 0;

  window.loaded = true;

  send = (msg) => {
    ws.send(msgpackr.pack(msg));
  }
  for(let i = 0; i < wsMsgQueue.length; i++){
    send(wsMsgQueue[i]);
  }
}

const customCodeBiomeNames = ["Rainforest_cc", "petri_dish", "Slime", "Mutated_Garden", "Freshwater_Lake"];

const playButton = document.querySelector('.play-btn');
const playText = document.querySelector('.play-text');

let lastAttempt = Date.now();

playButton.onclick = (e) => {
  const biome = biomeManager.getCurrentBiome();
  const isCustomCodeBiome = customCodeBiomeNames.includes(biome);

  squadUI.isCustomCode = isCustomCodeBiome;
  if(isCustomCodeBiome === true){
    processMenuMessage({
      squadInit: true,
      clients: [{name: "", id: 1, ready: false, sw: 200, maxSW: 200, petals: [], username: ""}],
      public: false,
      selfId: 1,
      biome,
    })
  }

  if(playText.getAttribute("stroke") === "Ready"){
    if(isCustomCodeBiome === true){
      loadCustomCodeBiome(biome);
      return;
    }
    changeReady(!window.ready);
  } else {
    if (!window.connected) return;
    if (window.captchaStatus == true && Date.now() > lastAttempt + 1500){
      const hcaptchaElem = document.querySelector('.h-captcha');
      const captchaDiv = document.querySelector(".captcha");
      captchaDiv.classList.remove("hidden");
      const hcaptchaIframe = hcaptchaElem.firstChild;
      const solveInterval = setInterval(() => {
          const captchaResponse = hcaptchaIframe.getAttribute('data-hcaptcha-response');
          if(captchaResponse.length > 0){
              clearInterval(solveInterval);
              captchaDiv.classList.add("hidden");
              send({captchaVerify: true, captchaResponse});
              lastAttempt = Date.now();
              hcaptcha.reset();
          }
      }, 100)
      return;
    }
    squadUI.reset();
    window.squadUIEnabled = true;
    playText.setAttribute("stroke", "Ready");
    changeReady(false);
  }
}

function loadCustomCodeBiome(biome){
  const iframe = document.createElement('iframe');
  iframe.src = `${location.origin}/customBiome/${biome}`;
  const menu = document.querySelector('.menu');
  iframe.style.position = "fixed";
  iframe.style.top = 0;
  iframe.style.left = 0;
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.zIndex = "99999999999999999";
  menu.appendChild(iframe);
  window.addEventListener('message', (event) => {
    unloadCustomCodeBiome(iframe);
  });
  iframe.onload = () => {
    iframe.contentWindow.postMessage([menuInventory.pack().top, Math.round(squadUI.startingWaveSlider * 200 + 1)]);
  }
}

function unloadCustomCodeBiome(iframe){
  iframe.remove();
  squadUI.reset();
  closeSquadUI();
}

let wsMsgQueue = [];
let send = (msg) => {
  wsMsgQueue.push(msg);
};

function sendQueuedMessages(){
  let int = setInterval(()=>{
    if(wsMsgQueue.length == 0){
      clearInterval(int);
      send = (msg) => {
        ws.send(msgpackr.pack(msg));
      }
      return;
    }
    ws.send(msgpackr.pack(wsMsgQueue.shift()));
  }, 100);
}

if(location.href.endsWith('/3d')){
  window.is3D = true;
  const t = document.createElement("script");
  t.type = "module";
  t.src = "systems/3d.js";
  document.body.append(t);
}
