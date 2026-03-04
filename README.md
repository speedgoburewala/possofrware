# Restaurant POS (Electron + HTML/CSS/JS)

## Folder Structure

```text
possofrware/
├─ electron/
│  ├─ main.js
│  └─ preload.js
├─ src/
│  ├─ index.html
│  ├─ css/
│  │  └─ styles.css
│  ├─ js/
│  │  ├─ app.js
│  │  ├─ storage.js
│  │  ├─ receipt.js
│  │  └─ pages/
│  │     ├─ dashboard.js
│  │     ├─ pos.js
│  │     ├─ tables.js
│  │     ├─ retrieve.js
│  │     ├─ delivery-board.js
│  │     ├─ reports.js
│  │     ├─ settings.js
│  │     └─ menu-manager.js
│  └─ receipts/
│     ├─ thermal-80mm.html
│     └─ a4.html
├─ package.json
└─ README.md
```

## Run

```bash
npm install
npm run start
```

## Build Windows Installer

```bash
npm run build:win
```
