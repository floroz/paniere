# Neapolitan Tombola Web App – Product & Technical Spec

## 1. Overview

A single-page client-side app to run Neapolitan Tombola draws:

- Draw numbers 1–90 at random (“Estrai”)
- Show Neapolitan name for each draw
- Mark drawn numbers on a big board (“Tabellone”)
- Persist state in `localStorage` for crash/reload recovery

## 2. Goals & Constraints

- Purely front-end (no backend)
- Desktop & mobile support
- Undo last draw
- Accessible, themeable, internationalized
- Zero-config: open in browser & play

## 3. Key Features

1. **Tabellone**  
   - 90-cell grid (number + name)  
   - Desktop: full-screen, fluid CSS-grid  
   - Mobile: hidden by default; “Apri Tabellone” CTA → full-screen pannable/zoomable overlay  

2. **Paniere**  
   - Shows count of remaining balls  
   - “Estrai” button to draw one at random  

3. **Last Draw**  
   - Displays last drawn number + name  
   - Plays a short sound/voice clip on draw  

4. **Undo**  
   - “Annulla” button to revert last draw, restoring state  

5. **Session Management**  
   - Auto-load from `localStorage`  
   - “Reset partita” → confirmation dialog (type CONFIRM or long-press) → clear session  
   - Disable “Estrai” when all 90 are drawn  

6. **Accessibility & Theming**  
   - Color-blind-safe marks (patterns/icons)  
   - ARIA live regions for announcements  
   - Dark/light mode toggle  
   - Locale support (Italian, English)

## 4. User Flows & Stories

- **Load app** → detect saved game → “Riprendi partita” or “Nuova partita”  
- **Draw** → click Estrai → animate + play sound → update Last Draw, mark board, remove from paniere  
- **Undo** → click Annulla → revert last draw  
- **View Board (mobile)** → tap “Apri Tabellone” → pinch/drag → “Chiudi”  
- **Reset** → click “Reset partita” → confirm → clear game

## 5. Data Model & Persistence

```js
// localStorage['tombola-game'] = JSON.stringify({
  drawn: number[],     // in draw order
  settings: { theme, lang },
  startedAt: string,   // ISO timestamp
});
```

- `last = drawn[drawn.length-1]`  
- Undo = `drawn.pop()`

## 6. Tech Stack

- **Framework:** React + TypeScript (Vite)  
- **Styling:** Tailwind CSS, CSS Grid  
- **State:** React Hooks + Context  
- **Persistence:** custom `useLocalStorage` hook  
- **Pan/Zoom:** `react-use-gesture` + `react-spring` (or `panzoom.js`)  
- **Sound:** HTML `<audio>` or Web Audio API  
- **Analytics:** Google Analytics 4 (gtag.js)  
- **Lint/Format:** ESLint + Prettier  
- **Tests:** Vitest + React Testing Library

## 7. Component Breakdown

- `<App>`: load/restore state, route between Game & Settings  
- `<Header>`: title, theme/lang toggle, Reset button  
- `<Tabellone>`: grid of `<Cell>` (number, name, marked)  
- `<Overlay>`: mobile full-screen pannable wrapper around `<Tabellone>`  
- `<Paniere>`: badge + draw/undo buttons  
- `<LastDraw>`: number + name + animation/sound  
- `<ConfirmDialog>`: generic modal for resets  
- **Hooks:** `useTombolaState()`, `useLocalStorage()`, `useSound()`

## 8. UI/UX Notes

- Animate each draw (flip, slide, etc.)  
- Use patterns (diagonals/dots) to mark cells  
- Mobile: sticky footer for Paniere + LastDraw; CTA to open overlay  
- Virtualize grid only if performance issues arise

## 9. Accessibility & I18n

- ARIA live region for draw/undo announcements  
- Keyboard: Space/Enter for draw, Ctrl+Z for undo  
- Translations in JSON; switchable at runtime  
- Color contrast ≥ 4.5:1

## 10. Handoff Deliverables

- **Design:** Figma mockups (desktop/mobile + overlay states)  
- **Spec docs:** this MD + component wireframes  
- **Assets:** audio clips, mark-icon set  
- **Data:** JSON mapping number→Neapolitan name