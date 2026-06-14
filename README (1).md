# 🎙️ Дауыс Агенті — Voice Agent (OpenRouter + Web Speech API)

Тегін, браузерде жұмыс істейтін **дауыспен басқарылатын AI агент**.  
API кілті тегін алынады, серверсіз, тек 3 файл.

---

## ✨ Мүмкіндіктер

| Мүмкіндік | Сипаттама |
|-----------|-----------|
| 🎙️ Дауыспен енгізу | Web Speech API — браузерде тікелей |
| 🔊 Дауыспен жауап | Text-to-Speech (TTS) — автоматты оқу |
| 🤖 AI моделдер | OpenRouter арқылы тегін LLM моделдері |
| 🌐 Үш тіл | Қазақша / Русский / English |
| 💾 Жергілікті сақтау | API кілті localStorage-да, сервер жоқ |
| 📱 Responsive | Мобильді және десктоп |

---

## 🆓 Тегін моделдер (OpenRouter)

| Модель | Сапасы |
|--------|--------|
| `meta-llama/llama-3.1-8b-instruct:free` | ⭐⭐⭐⭐ (ұсынылады) |
| `mistralai/mistral-7b-instruct:free` | ⭐⭐⭐⭐ |
| `google/gemma-2-9b-it:free` | ⭐⭐⭐⭐ |
| `qwen/qwen-2-7b-instruct:free` | ⭐⭐⭐ |
| `microsoft/phi-3-mini-128k-instruct:free` | ⭐⭐⭐ |

> ✅ Барлық моделдер **тегін**, тіркелу де тегін!

---

## 🚀 Жылдам бастау

### 1. Репозиторийді клондаңыз
```bash
git clone https://github.com/СІЗ_АТЫҢЫЗ/voice-agent.git
cd voice-agent
```

### 2. Тегін API кілтін алыңыз
1. [openrouter.ai](https://openrouter.ai) сайтына кіріңіз
2. **Sign up** (тегін тіркелу)
3. **Keys → Create Key** → кілтті көшіріңіз (`sk-or-v1-...`)

### 3. Іске қосыңыз
**Нұсқа A — тікелей браузерде:**
```
index.html файлын браузерде ашыңыз (File → Open)
```

**Нұсқа B — жергілікті сервер (ұсынылады):**
```bash
# Python 3
python3 -m http.server 8080

# Node.js
npx serve .

# VS Code → Live Server кеңейтімі
```
Браузерде: `http://localhost:8080`

**Нұсқа C — GitHub Pages арқылы:**
1. GitHub-та репозиторий жасаңыз
2. Файлдарды жүктеңіз
3. Settings → Pages → Branch: main → Save
4. `https://USERNAME.github.io/voice-agent/` сілтемесі дайын!

### 4. Пайдалану
1. API кілтіңізді (`sk-or-v1-...`) енгізіп **Сақтау** басыңыз
2. Модель мен тілді таңдаңыз
3. 🎙️ түймесін басып сөйлеңіз немесе мәтін жазып Enter басыңыз
4. AI дыбыспен жауап береді!

---

## 📁 Файлдар құрылымы

```
voice-agent/
├── index.html   # Интерфейс (HTML)
├── style.css    # Дизайн (CSS)
├── agent.js     # AI логика (JavaScript)
└── README.md    # Нұсқаулық
```

---

## 🔧 GitHub-қа жүктеу (қадам-қадам)

```bash
# 1. Жаңа репозиторий жасаңыз (github.com → New repository)
# 2. Жергілікті папканы инициализациялаңыз:

git init
git add .
git commit -m "🎙️ Voice Agent — initial commit"
git branch -M main
git remote add origin https://github.com/СІЗ_АТЫҢЫЗ/voice-agent.git
git push -u origin main
```

---

## 🛠️ Өзгерту мүмкіндіктері

### Өзіңіздің системалық промпт қосу (`agent.js`):
```javascript
function buildSystemPrompt() {
  return `Сіздің нұсқауыңыз мұнда...`;
}
```

### Жаңа тіл қосу:
```javascript
const langMap = { kk: 'kk-KZ', ru: 'ru-RU', en: 'en-US', tr: 'tr-TR' };
```

### Тарихты сақтамау:
```javascript
conversationHistory = []; // sendMessage ішінде
```

---

## ⚠️ Ескертпелер

- **Дауыс тану**: Chrome / Edge браузерінде жақсы жұмыс істейді
- **HTTPS**: GitHub Pages немесе localhost керек (file:// жұмыс істемеуі мүмкін)
- **Қазақ дауысы**: Браузерде қазақ TTS дауысы болмаса, орыс немесе ағылшын дауысы қолданылады
- **API кілті**: localStorage-да сақталады, тек сіздің браузеріңізде

---

## 📜 Лицензия

MIT License — еркін пайдаланыңыз, өзгертіңіз, таратыңыз.

---

<div align="center">
  Жасаған: <b>Voice Agent KK</b> · OpenRouter · Web Speech API
</div>
