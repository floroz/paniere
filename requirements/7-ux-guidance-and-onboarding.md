# Paniere App - UX Guidance and Onboarding Enhancements

## 1. Overview

This document details enhancements aimed at improving user understanding and onboarding within the Paniere application. Key initiatives include clarifying game mode descriptions on the Start Page and implementing a first-time guided tour for core features.

## 2. Goals

*   Reduce user confusion about game modes and functionality.
*   Provide clear, concise explanations directly within the app.
*   Guide new users through essential controls upon first use of each mode.
*   Improve overall usability and user confidence.

## 3. Feature: Enhanced Start Page Descriptions

*   **Problem:** Current descriptions may not fully clarify the nature of the game modes, leading to misconceptions (e.g., playing against AI). The app facilitates multiplayer games but doesn't host them directly or provide AI opponents.
*   **Requirement:** Update the descriptive text for both Tabellone and Player modes on the Start Page to better reflect their intended use in a live/multiplayer context.
*   **Proposed Text (Tabellone Mode):**
    *   _Current:_ "Draw numbers and manage the game. ℹ️ In this mode, you'll control the number draws and see all winning patterns."
    *   _New:_ "**Host the game & draw numbers.** ℹ️ Use this mode if you are the Game Master calling out numbers for players (who might be using this app's Player Mode or physical cards)."
*   **Proposed Text (Player Mode):**
    *   _Current:_ "Play with your own Cartelle. ℹ️ In this mode, you'll mark numbers on your own Cartelle as they're called."
    *   _New:_ "**Play along on digital cards.** ℹ️ Use this mode to mark numbers on virtual cards as they are called out by a Game Master (who might be using Tabellone Mode or calling numbers live)."
*   **Rationale:** The revised text aims to be concise while clearly stating the role of each mode (Game Master vs. Player) and addressing the multiplayer/live game context, clarifying it's not a standalone AI game.

## 4. Feature: First-Time Guided Tour

*   **Requirement:** Implement an interactive guided tour for users when they first enter either Tabellone Mode or Player Mode.
*   **Technology:** Use the `react-joyride` library.
*   **Trigger:** The tour for a specific mode should automatically start the very first time a user enters that mode after the feature is implemented.
*   **Persistence:** Store completion status in `localStorage` to prevent the tour from showing again on subsequent visits to that mode.
    *   **Keys:**
        *   `paniere-tour-completed-tabellone: boolean`
        *   `paniere-tour-completed-player: boolean`
*   **User Controls:** Provide standard `react-joyride` controls:
    *   `Next`: Progress to the next step.
    *   `Back`: Return to the previous step.
    *   `Skip`: Exit the tour completely.
    *   `Close (X)`: Exit the tour completely.
*   **Tour Steps (Conceptual - requires mapping to actual component selectors):**
    *   **Tabellone Mode Tour:**
        1.  **Target:** Main Tabellone grid container.
            *   **Content:** "This is the main board ('Tabellone') where all 90 numbers are shown. Drawn numbers will be marked here."
        2.  **Target:** "Estrai" (Draw) button.
            *   **Content:** "Click this button to draw the next random number."
        3.  **Target:** Last Draw display area (e.g., `LastDrawDisplay` or `LastDrawMobile`).
            *   **Content:** "The most recently drawn number and its Neapolitan name appear here."
        4.  **Target:** "Annulla" (Undo) button.
            *   **Content:** "Made a mistake? Click here to undo the last draw."
        5.  **Target:** "Azzera" (Reset) button.
            *   **Content:** "Use this to clear the board and start a new game."
        6.  **(Mobile Only) Target:** "Vai alla cartella" / "Go to card" button in `LastDrawMobile`.
            *   **Content:** "On mobile, tap this after a draw to automatically scroll the board to the row containing the last number."
    *   **Player Mode Tour:**
        1.  **Target:** A `CartellaNumerata` component (the player card).
            *   **Content:** "These are your game cards ('Cartelle'). You can have one or more."
        2.  **Target:** A number cell within a `CartellaNumerata`.
            *   **Content:** "When a number is called out by the Game Master, click or tap the matching number on your card to mark it."
        3.  **Target:** Prize indicator area (if distinct, otherwise mention in step 2).
            *   **Content:** "As you mark numbers, the app will automatically detect winning patterns like Ambo, Terno, etc., and highlight them."
        4.  **Target:** Settings icon/button.
            *   **Content:** "Access settings like language, theme, or return to the start page here."
*   **Styling:** Customize `react-joyride` styles to match the app's theme (colors, fonts, button styles).
*   **Accessibility:** Ensure tour elements are keyboard navigable, announced correctly by screen readers, and have sufficient color contrast. Follow `react-joyride` accessibility guidelines.

## 5. Additional UX Suggestions (Future Considerations)

*   **Contextual Help Icons:** Consider adding small "?" icons next to less intuitive controls (e.g., Reset confirmation input, specific settings) that open a small tooltip or link to the relevant section in the Rules modal for quick, targeted help.
*   **Persistent Mode Indicator:** While the header shows the mode, evaluate if a more subtle, persistent visual cue (e.g., a small icon badge or slight background shade difference) could further reinforce the current mode context, especially if future features add more complex navigation within modes.

## 6. Technical Implementation Notes

*   Install `react-joyride`: `npm install react-joyride` or `yarn add react-joyride`.
*   Create a wrapper component (e.g., `AppTour`) to manage `react-joyride` state (steps, run, stepIndex) and integrate it into `App.tsx` or mode-specific parent components.
*   Use `useEffect` hooks within the mode components (`TabelloneMode`, `PlayerMode`) to check the `localStorage` flag and trigger the tour (`run: true`) if not completed.
*   Define tour steps as an array of objects, specifying `target` (CSS selector), `content`, and potentially `placement`.
*   Implement the `callback` function for `react-joyride` to handle events like tour completion (`status === 'finished'` or `status === 'skipped'`) and update the corresponding `localStorage` flag.
