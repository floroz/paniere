# Paniere App - Feature Expansion Specification

## 1. Overview

This specification outlines the expansion of the Paniere application to include a new "Player Mode" alongside the existing "Tabellone Mode." This enhancement will transform the app from a single-purpose number drawing tool into a versatile platform that supports both game facilitators and players, while improving the overall user experience.

## 2. Current vs. New User Experience

### Current Flow ("Tabellone Mode" only)

1. User loads app
2. Start Game Modal appears with language selection
3. User selects language and starts game
4. Tabellone (number board) is displayed
5. User can draw numbers and manage the game

### New Flow (with dual modes)

1. User loads app
2. Check for existing session
   - If session exists, restore appropriate game mode with saved state
   - If no session exists, show new Start Page
3. Start Page displays:
   - Language selection
   - App introduction/context
   - Mode selection (Tabellone or Player)
4. Based on selection:
   - If Tabellone Mode: proceed to current game experience
   - If Player Mode: show cartelle count selection, then display player view

## 3. Key New Features

1. **Start Page**
   - Replaces modal for a more comprehensive introduction
   - Clear presentation of both game modes
   - Immediate language selection
   - Visual previews of each mode

2. **Player Mode**
   - Selection of 1-10 cartelle
   - Random cartelle generated on first load (following Neapolitan Tombola constraints)
   - Same cartelle persisted until game reset or tombola win
   - Interactive cartelle with tap/click to mark numbers
   - Auto-detection of winning patterns (ambo, terno, etc.)
   - Visual celebration for wins (confetti, toast notifications)

3. **Enhanced Session Management**
   - Unified state management approach across both modes
   - Persistent game state with shared prize detection logic
   - Simplified data model with shared core state
   - Options to reset current game or return to Start Page
   - Confirmation for destructive actions

4. **Improved Navigation**
   - Compact header with mode indicator to maximize game space
   - Quick access to settings
   - Help/info button for contextual guidance
   - Consistent internationalization throughout

## 4. User Interface Designs

### Start Page

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [Language Selector: EN | IT]                   │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │                                         │    │
│  │            [Paniere Logo]               │    │
│  │                                         │    │
│  │               PANIERE                   │    │
│  │                                         │    │
│  │        A traditional Italian            │    │
│  │        number drawing game              │    │
│  │                                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  SELECT GAME MODE:                              │
│                                                 │
│  ┌────────────────────┐ ┌────────────────────┐  │
│  │    TABELLONE MODE  │ │    PLAYER MODE     │  │
│  │    [Image]         │ │    [Image]         │  │
│  │                    │ │                    │  │
│  │  Draw numbers and  │ │  Play with your    │  │
│  │  manage the game   │ │  own Cartelle      │  │
│  │                    │ │                    │  │
│  │  ℹ️ In this mode,  │ │  ℹ️ In this mode,  │  │
│  │  you'll control    │ │  you'll mark       │  │
│  │  the number draws  │ │  numbers on your   │  │
│  │  and see all       │ │  own Cartelle as   │  │
│  │  winning patterns  │ │  they're called    │  │
│  │                    │ │                    │  │
│  │  [START]           │ │  [SELECT CARTELLE] │  │
│  └────────────────────┘ └────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Cartelle Selection Overlay

```
┌─────────────────────────────────────────┐
│                                         │
│         CHOOSE NUMBER OF CARTELLE       │
│                                         │
│  How many Cartelle would you like?      │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ [Dropdown: 1-10 ▼]              │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [PREVIEW OF SELECTED CARTELLE]         │
│  Shows a miniature preview of the       │
│  selected number of cartelle            │
│                                         │
│  ┌─────────────────┐ ┌─────────────┐    │
│  │   START GAME    │ │    BACK     │    │
│  └─────────────────┘ └─────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### Game Mode Headers

**Tabellone Mode Header**
```
┌─────────────────────────────────────────────────────────┐
│ PANIERE - TABELLONE                                ⚙️ ⓘ │
└─────────────────────────────────────────────────────────┘
```

**Player Mode Header**
```
┌─────────────────────────────────────────────────────────┐
│ PANIERE - CARTELLE (3)                            ⚙️ ⓘ │
└─────────────────────────────────────────────────────────┘
```

### Settings Menu

```
┌─────────────────────────────────┐
│           SETTINGS              │
│                                 │
│  🔤 Language: [EN | IT]         │
│                                 │
│  🌓 Theme: [Light | Dark]       │
│                                 │
│  🔄 Reset Current Game          │
│                                 │
│  🏠 Return to Start Page        │
│                                 │
│  [CLOSE]                        │
└─────────────────────────────────┘
```

### Confirmation Dialog

```
┌─────────────────────────────────────┐
│                                     │
│     ⚠️ CONFIRM ACTION               │
│                                     │
│  Are you sure you want to           │
│  [reset/end] your current game?     │
│                                     │
│  All progress will be lost.         │
│                                     │
│  [CONFIRM]      [CANCEL]            │
│                                     │
└─────────────────────────────────────┘
```

### Player Mode View (Multiple Cartelle)

```
┌───────────────────────────────────────────────────┐
│ PANIERE - CARTELLE (3)                      ⚙️ ⓘ │
├───────────────────────────────────────────────────┤
│                                                   │
│  ┌─────────────────────────┐                      │
│  │ CARTELLA 1              │                      │
│  │ ┌───┬───┬───┬───┬───┐  │                      │
│  │ │ 5 │ 21│ X │ 56│ 82│  │                      │
│  │ ├───┼───┼───┼───┼───┤  │                      │
│  │ │ X │ 27│ 49│ 61│ 86│  │                      │
│  │ ├───┼───┼───┼───┼───┤  │                      │
│  │ │ 12│ X │ 52│ X │ 89│  │                      │
│  │ └───┴───┴───┴───┴───┘  │                      │
│  └─────────────────────────┘                      │
│                                                   │
│  ┌─────────────────────────┐                      │
│  │ CARTELLA 2              │                      │
│  │ ┌───┬───┬───┬───┬───┐  │                      │
│  │ │ 3 │ 23│ 41│ X │ 81│  │                      │
│  │ ├───┼───┼───┼───┼───┤  │                      │
│  │ │ 7 │ X │ 44│ 65│ X │  │                      │
│  │ ├───┼───┼───┼───┼───┤  │                      │
│  │ │ X │ 25│ X │ 69│ 90│  │                      │
│  │ └───┴───┴───┴───┴───┘  │                      │
│  └─────────────────────────┘                      │
│                                                   │
│  ┌─────────────────────────┐                      │
│  │ CARTELLA 3              │                      │
│  │ ┌───┬───┬───┬───┬───┐  │                      │
│  │ │ X │ 22│ 35│ X │ 83│  │                      │
│  │ ├───┼───┼───┼───┼───┤  │                      │
│  │ │ 6 │ X │ 47│ 63│ 85│  │                      │
│  │ ├───┼───┼───┼───┼───┤  │                      │
│  │ │ 13│ 29│ X │ 67│ X │  │                      │
│  │ └───┴───┴───┴───┴───┘  │                      │
│  └─────────────────────────┘                      │
│                                                   │
└───────────────────────────────────────────────────┘
```

## 5. User Flows

### 1. First-Time User Flow

- App Load → No Session → Show Start Page
- Select Language → Select Mode
- If Tabellone Mode → Start Tabellone Mode
- If Player Mode → Show Cartelle Selection → Select Number of Cartelle → Start Player Mode

### 2. Returning User Flow

- App Load → Session Exists → Determine Mode
- If Tabellone Mode → Resume Tabellone Mode
- If Player Mode → Resume Player Mode with saved Cartelle and marked numbers

### 3. Mode Transition Flow

- From Game → Click Settings → Show Settings Menu
- Click "Return to Start Page" → Show Confirmation Dialog
- Confirm → Clear Current Session → Show Start Page
- Select New Mode → Create New Session

## 6. Technical Implementation

### 1. Unified Data Model

```typescript
// Simplified Game State
interface GameState {
  // Common properties
  language: 'en' | 'it';
  theme: 'light' | 'dark';
  gameMode: 'tabellone' | 'player' | null; // null when on Start Page
  
  // Shared game state (for both modes)
  cartelle: CartellaData[]; // Includes both tabellone cartelle and player cartelle
  drawnNumbers: number[];   // In tabellone mode: numbers drawn; in player mode: marked numbers
  prizes: Record<PrizeType, boolean>; // Shared prize tracking for both modes
}

// Simplified Local Storage Structure
interface StoredGameData {
  gameMode: 'tabellone' | 'player';
  lastUpdated: number; // timestamp
  language: 'en' | 'it';
  theme: 'light' | 'dark';
  cartelle: CartellaData[];
  drawnNumbers: number[];
  prizes: Record<PrizeType, boolean>;
}
```

### 2. New Components

```typescript
// Component Structure
<App>
  ├── <StartPage> (new)
  │   ├── <LanguageSelector>
  │   ├── <ModeSelector> (new)
  │   └── <CartelleSelector> (new, conditional)
  ├── <TabelloneMode> (existing App content wrapped)
  │   ├── <Header> (updated)
  │   │   └── <SessionControls> (new)
  │   ├── <Tabellone>
  │   ├── <Footer>
  │   └── ... (existing components)
  └── <PlayerMode> (new)
      ├── <Header> (updated)
      │   └── <SessionControls> (new)
      ├── <CartelleGrid> (new)
      │   └── <CartellaNumerata> (new, interactive)
      └── <WinCelebration> (shared with TabelloneMode)
```

### 3. State Management Extensions

```typescript
// Add to game store
interface GameStateWithActions extends GameState {
  // Mode management actions
  setGameMode: (mode: 'tabellone' | 'player') => void;
  
  // Shared actions (work in both modes with different UIs)
  generateCartelle: (count: number) => void; // Generate cartelle for either mode
  toggleNumber: (number: number) => void;    // Draw in tabellone mode, mark in player mode
  undoLastNumber: () => void;                // Undo last action in either mode
  checkPrizes: () => void;                   // Same prize detection logic for both modes
  
  // Session management actions
  resetCurrentGame: () => void;
  returnToStartPage: () => void;
  loadSavedSession: () => boolean; // returns true if session loaded
}
```

### 4. New Component Details

#### StartPage Component

```typescript
const StartPage = () => {
  const [selectedMode, setSelectedMode] = useState<'tabellone' | 'player' | null>(null);
  const [showCartelleSelector, setShowCartelleSelector] = useState(false);
  const [cartelleCount, setCartelleCount] = useState(1);
  const { language, setLanguage } = useLanguageStore();
  const { setGameMode, setCartelleCount, generateCartelle } = useGameStore();
  
  // Handlers for mode selection, cartelle counting, etc.
  
  return (
    // UI as shown in designs
  );
};
```

#### CartellaNumerata Component

```typescript
interface CartellaNumerataProps {
  cartellaData: CartellaData;
  cartellaId: number;
  markedNumbers: number[];
  onMarkNumber: (number: number) => void;
}

const CartellaNumerata = ({ 
  cartellaData, 
  cartellaId,
  markedNumbers,
  onMarkNumber 
}: CartellaNumerataProps) => {
  // Logic for rendering and interaction
  
  return (
    <div className="cartella-container">
      <div className="cartella-header">CARTELLA {cartellaId}</div>
      <div className="cartella-grid">
        {cartellaData.numbers.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="cartella-row">
            {row.map((number, colIndex) => {
              const isMarked = markedNumbers.includes(number);
              
              return (
                <div 
                  key={`cell-${rowIndex}-${colIndex}`}
                  className={`cartella-cell ${isMarked ? 'marked' : ''}`}
                  onClick={() => onMarkNumber(number)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isMarked}
                >
                  {number}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 5. Session Management Implementation

```typescript
// Simplified localStorage handlers
const saveGameState = (state: GameState) => {
  const storedData: StoredGameData = {
    gameMode: state.gameMode,
    lastUpdated: Date.now(),
    language: state.language,
    theme: state.theme,
    cartelle: state.cartelle,
    drawnNumbers: state.drawnNumbers,
    prizes: state.prizes
  };
  
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(storedData));
};

const loadGameState = (): StoredGameData | null => {
  const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!savedData) return null;
  
  try {
    return JSON.parse(savedData) as StoredGameData;
  } catch (e) {
    console.error('Failed to parse saved game data:', e);
    return null;
  }
};

const clearGameState = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
};
```

## 7. Responsive Design Considerations

### Mobile (< 640px)
- Start Page: Mode cards stack vertically
- Player Mode: Single column of cartelle with scrolling
- Settings: Full screen overlay

### Tablet (640px - 1024px)
- Start Page: Mode cards side by side
- Player Mode: 2 cartelle per row
- Settings: Modal dialog

### Desktop (> 1024px)
- Start Page: Mode cards side by side with larger visuals
- Player Mode: Up to 3 cartelle per row
- Settings: Modal dialog

## 8. Accessibility Considerations

- All interactive elements must have appropriate ARIA roles
- Keyboard navigation supported throughout the app
- Color contrast meets WCAG AA standards
- Screen reader announcements for game events
- Focus management for modals and overlays

## 9. Internationalization

Extend current translations to include new UI elements:

```typescript
const translations = {
  en: {
    // Existing translations
    
    // New translations
    startPage: "Welcome to Paniere",
    tabelloneMode: "Tabellone Mode",
    playerMode: "Player Mode",
    tabelloneDescription: "Draw numbers and manage the game",
    playerDescription: "Play with your own Cartelle",
    selectCartelle: "Select Cartelle",
    howManyCartelle: "How many Cartelle would you like?",
    startGame: "Start Game",
    back: "Back",
    settings: "Settings",
    resetGame: "Reset Current Game",
    returnToStartPage: "Return to Start Page",
    confirmAction: "Confirm Action",
    resetConfirmation: "Are you sure you want to reset your current game?",
    returnConfirmation: "Are you sure you want to end your current game?",
    progressLost: "All progress will be lost.",
    confirm: "Confirm",
    cancel: "Cancel"
    // ... more translations
  },
  it: {
    // Italian equivalents
  }
};
```

## 10. Implementation Phases

### Phase 1: Core Refactoring
1. Refactor existing state management to use unified data model
2. Abstract prize detection logic to work with both modes
3. Implement common utilities for cartelle generation/management

### Phase 2: Start Page & Mode Selection
1. Create Start Page component with language selection
2. Implement mode selection logic
3. Create cartelle count selection for Player Mode
4. Establish session persistence with unified data model

### Phase 3: Player Mode Implementation
1. Develop CartellaNumerata component (reusing Casella logic)
2. Implement interactive number marking
3. Apply existing prize detection and celebration logic
4. Ensure cartelle persistence between sessions

### Phase 4: Navigation & Settings
1. Design compact header with consistent navigation
2. Implement session management controls
3. Add confirmation dialogs
4. Apply internationalization to all new UI elements

### Phase 5: Polish & Testing
1. Responsive design refinements
2. Accessibility validation
3. Cross-browser testing
4. Performance optimization

## 11. Success Metrics

- **Technical:** Zero regression bugs in existing features
- **UX:** Reduced bounce rate on initial load
- **Engagement:** Increased session duration
- **Adoption:** >25% of users try Player Mode
- **Retention:** Higher return rate for users who engage with both modes

## 12. Open Questions

1. Should we offer a "Quick Start" option that bypasses the Start Page for returning users?
2. How should Player Mode handle multiple winners (e.g., two ambo on different cartelle)?
3. Should we consider adding multiplayer capabilities in the future?

## 13. Appendix: Technical Dependencies

- Continue using zustand for state management
- Shared toast and confetti components between modes
- Reuse cartelle generation logic from utility functions
