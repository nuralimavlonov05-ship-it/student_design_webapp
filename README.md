# Student Design Web App

Telegram Mini App (Web App) — Taqdimot dizaynini
Gamma AI uslubida tanlash uchun galereya.

## Imkoniyatlari

- **Kategoriyalar**: "Barchasi" (umumiy dizaynlar) +
  Biznes / Ta'lim / Ilmiy / Ijodiy / Minimal / Tex
- **Qidiruv**: nom va tavsif bo'yicha
- **Karta preview**: har bir dizaynning ranglari
  (primary/secondary/accent) bilan mini slayd ko'rinishi
- **Tanlash/bekor qilish**: kartaga bosish — tanlash,
  yana bosish — bekor qilish; tanlangan dizayn
  pastki panelda alohida ko'rinadi
- **Telegram integratsiyasi**: `Telegram.WebApp.sendData()`
  orqali tanlov botga yuboriladi (`{"design": "Nomi"}`)

## Fayllar

```
index.html      — sahifa tuzilishi
style.css       — dizayn (minimal, o'ziga xos)
app.js          — logika (kategoriyalar, grid, tanlash)
designs.json    — dizaynlar katalogi (bot'dan generatsiya)
```

## Dizaynlarni yangilash

Dizaynlar manbai — bot ichida
`student_bot1/bot/services/design_catalog.py`.
O'zgarishlarni web app'ga sinxronlash uchun:

```bash
cd student_bot1
python tools/generate_webapp_data.py
```

Bu `../student_design_webapp/designs.json` ni qayta yozadi.

## Joylashtirish (GitHub Pages — bepul)

1. Bu papkani alohida GitHub repozitoriyasiga yuklang
   (GitHub Desktop orqali "Publish repository")
2. Repo → Settings → Pages → Source: `Deploy from a branch`
   → Branch: `main`, Folder: `/ (root)` → Save
3. Bir necha daqiqadan keyin sayt ochiladi:
   `https://<username>.github.io/<repo>/`
4. Botning `.env` fayliga qo'shing:
   ```
   DESIGN_WEBAPP_URL=https://<username>.github.io/<repo>/
   ```
5. Botni qayta ishga tushiring — Taqdimot dizayn
   qadamida «🎨 Web App orqali tanlash» tugmasi paydo bo'ladi

## Telegram'dan tashqarida

Bot'ga o'rnatilmagan (to'g'ri URL orqali ochilmagan)
holatda ham ishlaydi — tanlangan dizayn nomi
ekranga chiqadi / buferga nusxalanadi.
