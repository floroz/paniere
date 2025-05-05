# Paniere App - Mobile Game Master UX Improvements

## 1. Overview & Problem Statement

The current mobile experience for the Game Master (Tabellone) mode presents usability challenges:

1.  **Disorganized Bottom Controls:** The action buttons in the footer are poorly arranged, leading to unclear labels and buttons potentially being pushed off-screen, especially on smaller devices. (See provided screenshot).
2.  **Lack of Immediate Draw Feedback:** When the Game Master draws a number, the corresponding cell is marked on the main Tabellone. However, on mobile, the Tabellone might be large and require scrolling. If the marked cell is currently off-screen, the user might not get immediate visual confirmation that the draw was successful and where the number is located, leading to a feeling that "nothing happened."

This specification aims to propose solutions to improve the layout, clarity, and feedback mechanisms for a smoother **mobile-only** Game Master experience. Desktop views remain unchanged and are out of scope for these improvements.

## 2. Proposed Product & Design Solutions

### 2.1. Redesigning Mobile Controls (Footer)

**Goal:** Create a clean, intuitive, and responsive control bar for essential Game Master actions on mobile.

**Proposal:**

Structure the bottom-most row of the mobile footer with the following controls:

1.  **Undo (`Annulla ultimo estratto`):** Icon button.
2.  **Reset (`Azzera`):** Icon button.
3.  **Back (Return to Start Page):** Icon button.
4.  **Draw (`Estrai`):** Main action button, visually distinct.

**Layout & Styling:**

- Use Flexbox (`items-center`, `gap-2`) to arrange these buttons.
- **Push "Estrai" to the right:** Use `justify-between` on the container or add `ml-auto` to the "Estrai" button's wrapper/itself to separate it from the other icons, reducing misclicks.
- Ensure adequate spacing between buttons.
- **Accessibility:** All buttons must have a minimum touch target size of 44x44px. Use padding and potentially min-width/min-height Tailwind classes to achieve this.
- Use clear, distinct icons for Undo, Reset, and Back (see Icon Library section below). Always provide `aria-label`s.
- **Color Consistency:** Buttons should adopt the application's primary theme colors (e.g., the blue gradient used for buttons on the Start Page) for consistency, especially the main "Estrai" button. Secondary buttons can use neutral/themed secondary styles.
- On very narrow screens, ensure the layout remains usable, potentially wrapping if absolutely necessary, but prioritize keeping actions accessible.

### 2.2. Improving Draw Feedback via Dedicated Footer Component

**Goal:** Provide immediate, clear, and actionable feedback within the mobile footer when a number is drawn, addressing the issue of off-screen marked numbers.

**Proposal: `LastDrawMobile` Component**

Integrate a new component, potentially named `LastDrawMobile`, directly into the mobile footer, likely stacked _above_ the main action buttons (`Estrai`, `Annulla`, etc.). This component will display:

1.  **Last Drawn Number & Name:** Clearly show the most recently drawn number and its associated Neapolitan name. Use subtle animation (e.g., highlight on update) to draw attention upon a new draw.
2.  **"Show Last 3" Button:** An icon button **with a label**. Tapping this button will **reuse the existing `LastDrawsModal` component** to display the history. Label: "Ultime 3" (IT) / "Last 3" (EN).
3.  **"Scroll to Number" Button/Hint:** A dedicated icon button **with a label**. Tapping this button will trigger a **smooth scroll animation** of the main Tabellone view to bring the row containing the last drawn number into the center of the viewport. No additional highlighting of the cell is required after scrolling. Label: "Vai alla cartella" (IT) / "Go to card" (EN).

**Updated Conceptual Layout:**

```
┌───────────────────────────────────────────────────────────────────────────┐
│ [Last Draw: 59 - 'E Pile | Ultime 3 Icon+Label | Vai alla cartella Icon+Label] │ <--- LastDrawMobile Component
├───────────────────────────────────────────────────────────────────────────┤
│ [Undo Icon] [Reset Icon] [Back Icon]                     [Estrai Button]  │ <--- Action Buttons (Bottom Row)
└───────────────────────────────────────────────────────────────────────────┘
```

This approach keeps feedback contained within the primary control area (footer) and provides a direct action (`Scroll To`) to resolve the core feedback problem using smooth animation.

## 3. Technical Implementation Plan

1.  **Create `LastDrawMobile.tsx` Component:**

    - Accept props: `lastDrawnNumber`, `drawnNumbers` (for history count check), `onShowLast3Click`, `onScrollToNumberClick`.
    - Render the last number/name display.
    - Render the "Ultime 3" / "Last 3" button (icon + label), linking its `onClick` to `onShowLast3Click`.
    - Render the "Vai alla cartella" / "Go to card" button (icon + label), linking its `onClick` to `onScrollToNumberClick`.
    - Style using Tailwind CSS, ensuring labels are clear next to icons.

2.  **Modify `MobileFooter.tsx` (or relevant footer component for Tabellone mode):**

    - Import and render the new `LastDrawMobile` component, likely placing it above the existing action buttons container.
    - Pass necessary props to `LastDrawMobile`:
      - Get `lastDrawnNumber` and `drawnNumbers` from `useGameStore`.
      - Define `handleShowLast3Click` function to open the `LastDrawsModal`.
      - Define `handleScrollRequest` function to call the method exposed by the `Tabellone` ref.
    - Rearrange the action buttons in the specified order: Undo, Reset, Back, **Draw (on the right)**.
    - Apply Tailwind classes for layout (`flex`, `justify-between`, `items-center`, `gap-2`), spacing, and ensure minimum 44x44px touch targets.
    - **Apply consistent button styling:** Update button classes (especially for "Estrai") to match the application's primary theme (e.g., blue gradient from Start Page).

3.  **Modify `Tabellone.tsx`:**

    - Create a `ref` for the main scrollable container of the Tabellone grid.
    - Create refs for individual number cells or rows (potentially using a map of refs).
    - Implement a function, e.g., `scrollToNumber(number)`, that:
      - Finds the DOM element (cell or row) corresponding to the `number`.
      - Uses `element.scrollIntoView({ behavior: 'smooth', block: 'center' })` to perform the smooth scroll.
    - Expose this `scrollToNumber` function, possibly via `useImperativeHandle` or by passing it up through props/context, so it can be called by the footer.

4.  **Modify `LastDrawsModal.tsx`:**

    - Ensure it can be correctly opened via the `handleShowLast3Click` function passed down to `LastDrawMobile`. No internal changes to the modal itself are expected.

5.  **State Management (`useGameStore.ts`):**

    - No major changes anticipated. Primarily involves consuming existing state (`lastDrawnNumber`, `drawnNumbers`) in the footer component.

6.  **Accessibility:**

    - Add appropriate `aria-label`s to all icon buttons. Use the `label` prop for visible text where applicable (`LastDrawMobile`).
    - Verify keyboard focus order navigates logically.
    - Test touch target sizes.

7.  **Introduce Icon Library (e.g., `react-icons`):** (New Step)
    - **Rationale:** Using hardcoded SVGs is becoming cumbersome and inconsistent. An icon library provides a wide range of standardized icons, improving maintainability and visual consistency. `react-icons` is a popular choice as it bundles many common icon sets.
    - **Install:** Add `react-icons` as a project dependency (`npm install react-icons` or `yarn add react-icons`).
    - **Replace Icons:**
      - Import necessary icons (e.g., `FaHistory`, `FaCrosshairs`, `FaUndo`, `FaTrashAlt`, `FaHome` from `react-icons/fa` or similar sets like Heroicons `Hi...`) in `LastDrawMobile.tsx` and `MobileFooter.tsx`.
      - Replace the placeholder `<svg>` elements with the imported React components (e.g., `<FaHistory />`).
      - Adjust sizing using Tailwind classes on the icon component itself if needed (e.g., `className="h-4 w-4"`).

## 4. Final Checks

- Verify button colors and styles match the application theme.
- Confirm icon clarity and appropriateness.
- Test layout responsiveness and button accessibility (touch targets, focus order).
- Verify the mechanism for the "Back" button's action (e.g., calling `returnToStartPage` from the store).
