# Product Card AI Agent (Kaspi / Ozon / Wildberries)

Генерация **1000** вариантов товарных карточек для маркетплейсов с использованием **OpenRouter**.

## Что делает агент
- На вход: описание товара (название, категория, бренд, характеристики и т.д.)
- На выход: **JSON** с 3 дизайн-концептами и текстами на **RU/KZ/EN**
- Дубли отфильтровываются (по SHA-256 хэшу заголовка + тегов)
- **1 API-запрос = 1 вариант** (3 языка в одном промпте — эффективно)

---

## Установка

```bash
cd product-card-ai-agent
python -m venv venv

# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

---

## Настройка API ключа

Создайте файл `.env` в корне проекта:

```env
OPENROUTER_API_KEY=ваш_ключ_здесь
```

Ключ получить: https://openrouter.ai/keys

---

## Запуск

```bash
streamlit run app.py
```

Откроется браузер: http://localhost:8501

---

## Структура JSON-вывода

```json
[
  {
    "variant_index": 1,
    "marketplace": "kaspi",
    "title_seed": "Кроссовки универсальные",
    "languages": {
      "ru": {
        "card_variant_1": {
          "product_title": "...",
          "short_description": "...",
          "usp_bullets": ["...", "...", "...", "...", "..."],
          "tags": ["...", "..."],
          "image_direction": {
            "palette": "...",
            "background": "...",
            "infographics": "...",
            "textures": "..."
          },
          "ai_generation_prompts": {
            "style": "Эстетичный",
            "prompt": "..."
          }
        },
        "card_variant_2": { "..." : "..." },
        "card_variant_3": { "..." : "..." }
      },
      "kz": { "..." : "..." },
      "en": { "..." : "..." }
    }
  }
]
```

---

## Рекомендации

| Вариант | API шақырулар | Шамалы уақыт |
|---------|--------------|--------------|
| 10      | 10           | ~1-2 мин     |
| 100     | 100          | ~10-20 мин   |
| 1000    | 1000         | ~2-4 сағат   |

💡 **Алдымен 5-10 вариантпен тексеріп алыңыз!**

---

## Структура проекта

```
product-card-ai-agent/
├── app.py                  # Streamlit интерфейс
├── generator.py            # Карточка генерациясы (1 запрос/вариант)
├── exporter.py             # JSON файлға сақтау
├── openrouter_client.py    # OpenRouter API клиент
├── marketplace_prompts.py  # Промпт жасаушы (batch: 3 тіл бірге)
├── requirements.txt        # Тәуелділіктер
├── .env                    # API кілт (gitignore-да!)
└── .gitignore
```

---

## GitHub-қа қосу

```bash
git init
git add .
git commit -m "Initial commit: AI agent"
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

⚠️ `.env` файлы `.gitignore`-да — GitHub-қа кілт кетпейді.
