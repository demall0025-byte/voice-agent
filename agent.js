/**
 * Voice Agent — OpenRouter + Web Speech API
 * Автор: voice-agent жобасы
 */

// ──────────────────────────────────────────────
// STATE
// ──────────────────────────────────────────────
let apiKey = localStorage.getItem('or_api_key') || '';
let model  = localStorage.getItem('or_model')   || 'meta-llama/llama-3.1-8b-instruct:free';
let lang   = localStorage.getItem('or_lang')    || 'kk';

let conversationHistory = [];
let recognition  = null;
let synth        = window.speechSynthesis;
let currentUtter = null;
let isListening  = false;
let audioCtx     = null;
let analyser     = null;
let volumeRAF    = null;

// ──────────────────────────────────────────────
// DOM REFS
// ──────────────────────────────────────────────
const setupCard    = document.getElementById('setupCard');
const agentCard    = document.getElementById('agentCard');
const apiKeyInput  = document.getElementById('apiKeyInput');
const saveKeyBtn   = document.getElementById('saveKeyBtn');
const modelSelect  = document.getElementById('modelSelect');
const langSelect   = document.getElementById('langSelect');
const changeKeyBtn = document.getElementById('changeKeyBtn');
const statusDot    = document.getElementById('statusDot');
const statusText   = document.getElementById('statusText');
const conversation = document.getElementById('conversation');
const textInput    = document.getElementById('textInput');
const micBtn       = document.getElementById('micBtn');
const sendBtn      = document.getElementById('sendBtn');
const stopBtn      = document.getElementById('stopBtn');
const clearBtn     = document.getElementById('clearBtn');
const volumeFill   = document.getElementById('volumeFill');

// ──────────────────────────────────────────────
// INIT
// ──────────────────────────────────────────────
function init() {
  if (apiKey) {
    showAgent();
  } else {
    showSetup();
  }
  modelSelect.value = model;
  langSelect.value  = lang;
}

function showSetup() {
  setupCard.style.display = 'flex';
  agentCard.style.display = 'none';
}
function showAgent() {
  setupCard.style.display = 'none';
  agentCard.style.display = 'flex';
  setStatus('ready');
}

// ──────────────────────────────────────────────
// SETTINGS
// ──────────────────────────────────────────────
saveKeyBtn.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key.startsWith('sk-or-')) {
    alert('Қате формат. Кілт sk-or- деп басталуы керек.');
    return;
  }
  apiKey = key;
  model  = modelSelect.value;
  lang   = langSelect.value;
  localStorage.setItem('or_api_key', apiKey);
  localStorage.setItem('or_model',   model);
  localStorage.setItem('or_lang',    lang);
  showAgent();
});

modelSelect.addEventListener('change', () => {
  model = modelSelect.value;
  localStorage.setItem('or_model', model);
});
langSelect.addEventListener('change', () => {
  lang = langSelect.value;
  localStorage.setItem('or_lang', lang);
});

changeKeyBtn.addEventListener('click', () => {
  stopSpeaking();
  showSetup();
});

// ──────────────────────────────────────────────
// STATUS
// ──────────────────────────────────────────────
const statusMessages = {
  ready:     { kk: 'Дайын',          ru: 'Готово',        en: 'Ready'     },
  listening: { kk: 'Тыңдауда...',    ru: 'Слушаю...',     en: 'Listening...' },
  thinking:  { kk: 'Ойлауда...',     ru: 'Думаю...',      en: 'Thinking...' },
  speaking:  { kk: 'Сөйлеуде...',    ru: 'Говорю...',     en: 'Speaking...' },
  error:     { kk: 'Қате орын алды', ru: 'Ошибка',        en: 'Error'     },
};

function setStatus(state) {
  statusDot.className = 'status-dot ' + state;
  statusText.textContent = statusMessages[state]?.[lang] || state;
}

// ──────────────────────────────────────────────
// CONVERSATION UI
// ──────────────────────────────────────────────
function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = 'message ' + role;
  div.textContent = text;
  conversation.appendChild(div);
  conversation.scrollTop = conversation.scrollHeight;
  return div;
}

clearBtn.addEventListener('click', () => {
  conversationHistory = [];
  conversation.innerHTML = '';
  addMessage('system', getLocale('cleared'));
  setStatus('ready');
});

const locales = {
  cleared: { kk: 'Тарих тазаланды.', ru: 'История очищена.', en: 'History cleared.' },
  noSpeech:{ kk: 'Дыбыс анықталмады. Қайта көріңіз.', ru: 'Речь не обнаружена.', en: 'No speech detected.' },
  noMic:   { kk: 'Микрофонға рұқсат жоқ.', ru: 'Нет доступа к микрофону.', en: 'Microphone access denied.' },
  noSR:    { kk: 'Браузер дауыс тануды қолдамайды.', ru: 'Браузер не поддерживает распознавание речи.', en: 'Browser does not support speech recognition.' },
};
function getLocale(key) { return locales[key]?.[lang] || locales[key]?.en || key; }

// ──────────────────────────────────────────────
// SYSTEM PROMPT
// ──────────────────────────────────────────────
function buildSystemPrompt() {
  const langName = { kk: 'қазақ', ru: 'русский', en: 'English' }[lang] || 'қазақ';
  return `Сен дауыспен жауап беретін AI агентісің. 
Маңызды ережелер:
1. Жауаптарыңды міндетті түрде ${langName} тілінде бер.
2. Жауаптарың қысқа және анық болсын (1-3 сөйлем).
3. Markdown белгілерін (**, ##, *, -) ПАЙДАЛАНБА — таза мәтін ғана.
4. Сан тізімдерді ауызша айт: "біріншіден, екіншіден..." деп.
5. Мейірімді және жылы сөйле.`;
}

// ──────────────────────────────────────────────
// OPENROUTER API
// ──────────────────────────────────────────────
async function askAI(userMessage) {
  setStatus('thinking');

  conversationHistory.push({ role: 'user', content: userMessage });

  const body = {
    model: model,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      ...conversationHistory,
    ],
    max_tokens: 300,
    temperature: 0.7,
  };

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type':  'application/json',
        'HTTP-Referer':  window.location.href,
        'X-Title':       'Voice Agent KK',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();

    if (!reply) throw new Error('Бос жауап');

    conversationHistory.push({ role: 'assistant', content: reply });

    // Keep context manageable (last 20 turns)
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }

    return reply;

  } catch (err) {
    throw new Error(err.message);
  }
}

// ──────────────────────────────────────────────
// TEXT TO SPEECH
// ──────────────────────────────────────────────
function speak(text) {
  stopSpeaking();

  const utter = new SpeechSynthesisUtterance(text);

  // Choose voice language
  const langMap = { kk: 'kk-KZ', ru: 'ru-RU', en: 'en-US' };
  utter.lang = langMap[lang] || 'kk-KZ';
  utter.rate = 0.95;
  utter.pitch = 1.0;

  // Try to find a matching voice
  const voices = synth.getVoices();
  const preferred = voices.find(v => v.lang.startsWith(utter.lang.split('-')[0]));
  if (preferred) utter.voice = preferred;

  utter.onstart = () => {
    setStatus('speaking');
    stopBtn.style.display = 'inline-flex';
    sendBtn.style.display = 'none';
  };
  utter.onend = () => {
    currentUtter = null;
    setStatus('ready');
    stopBtn.style.display = 'none';
    sendBtn.style.display = 'flex';
  };
  utter.onerror = () => {
    currentUtter = null;
    setStatus('ready');
    stopBtn.style.display = 'none';
    sendBtn.style.display = 'flex';
  };

  currentUtter = utter;
  synth.speak(utter);
}

function stopSpeaking() {
  if (synth.speaking) synth.cancel();
  currentUtter = null;
}

stopBtn.addEventListener('click', () => {
  stopSpeaking();
  setStatus('ready');
  stopBtn.style.display = 'none';
  sendBtn.style.display = 'flex';
});

// ──────────────────────────────────────────────
// SEND MESSAGE
// ──────────────────────────────────────────────
async function sendMessage(text) {
  if (!text.trim()) return;
  if (!apiKey) { showSetup(); return; }

  stopSpeaking();
  textInput.value = '';
  addMessage('user', text);

  try {
    const reply = await askAI(text);
    addMessage('assistant', reply);
    speak(reply);
  } catch (err) {
    setStatus('error');
    addMessage('error', '⚠️ ' + err.message);
    setTimeout(() => setStatus('ready'), 3000);
  }
}

sendBtn.addEventListener('click', () => {
  sendMessage(textInput.value);
});

textInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(textInput.value);
  }
});

// ──────────────────────────────────────────────
// SPEECH RECOGNITION
// ──────────────────────────────────────────────
function setupRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    micBtn.title = getLocale('noSR');
    micBtn.disabled = true;
    return;
  }

  recognition = new SR();
  const langMap = { kk: 'kk-KZ', ru: 'ru-RU', en: 'en-US' };
  recognition.lang = langMap[lang] || 'kk-KZ';
  recognition.continuous   = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    isListening = true;
    micBtn.classList.add('active');
    setStatus('listening');
    startVolumeMonitor();
  };

  recognition.onresult = (e) => {
    let interim = '', final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += t;
      else interim += t;
    }
    textInput.value = final || interim;
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.classList.remove('active');
    stopVolumeMonitor();
    setStatus('ready');

    const text = textInput.value.trim();
    if (text) sendMessage(text);
  };

  recognition.onerror = (e) => {
    isListening = false;
    micBtn.classList.remove('active');
    stopVolumeMonitor();

    if (e.error === 'no-speech') {
      addMessage('system', getLocale('noSpeech'));
    } else if (e.error === 'not-allowed') {
      addMessage('error', getLocale('noMic'));
    }
    setStatus('ready');
  };
}

micBtn.addEventListener('click', () => {
  if (!recognition) setupRecognition();
  if (!recognition) return;

  // Update lang in case it changed
  const langMap = { kk: 'kk-KZ', ru: 'ru-RU', en: 'en-US' };
  recognition.lang = langMap[lang] || 'kk-KZ';

  if (isListening) {
    recognition.stop();
  } else {
    stopSpeaking();
    try { recognition.start(); }
    catch (e) { /* already started */ }
  }
});

// ──────────────────────────────────────────────
// VOLUME VISUALIZER (optional mic indicator)
// ──────────────────────────────────────────────
async function startVolumeMonitor() {
  try {
    if (!audioCtx) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx  = new AudioContext();
      analyser  = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const src = audioCtx.createMediaStreamSource(stream);
      src.connect(analyser);
    }
    const data = new Uint8Array(analyser.frequencyBinCount);
    function tick() {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      volumeFill.style.width = Math.min(avg * 2, 100) + '%';
      volumeRAF = requestAnimationFrame(tick);
    }
    tick();
  } catch {
    // No mic permission — silently skip volume display
  }
}

function stopVolumeMonitor() {
  if (volumeRAF) cancelAnimationFrame(volumeRAF);
  volumeFill.style.width = '0%';
}

// ──────────────────────────────────────────────
// VOICES (load async)
// ──────────────────────────────────────────────
if (synth.onvoiceschanged !== undefined) {
  synth.onvoiceschanged = () => synth.getVoices();
}

// ──────────────────────────────────────────────
// START
// ──────────────────────────────────────────────
init();
