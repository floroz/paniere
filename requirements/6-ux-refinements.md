# Paniere App - UX Refinements (Mobile Footer & Highlights)

## 1. Overview

This document outlines proposed solutions to address user feedback regarding the mobile Game Master footer layout and the color used for highlighting drawn/marked numbers across the application.

## 2. User Problems Identified

1.  **Mobile "Estrai" Button Ergonomics:**
    *   **Problem:** The primary action button ("Estrai") in the mobile Game Master footer (`MobileFooter.tsx`) is currently positioned on the far left. This placement can be awkward for thumb reach, especially for right-handed users, potentially hindering quick and comfortable interaction.
    *   **Impact:** Reduced usability and potential frustration during the core gameplay loop on mobile devices.

2.  **Red Highlight Color Confusion:**
    *   **Problem:** The current retro theme uses red gradients/colors to highlight drawn numbers on the Tabellone (`Tabellone.tsx`) and marked numbers on player cards (`CartellaNumerata.tsx`). In user interface design, red is strongly associated with errors, warnings, or destructive actions.
    *   **Impact:** Users may misinterpret the highlight as indicating an error or incorrect action, leading to confusion and undermining the positive feedback intended by the highlight.

## 3. Proposed Solutions & Rationale

### 3.1. Mobile Footer Layout Refinement (`MobileFooter.tsx`)

*   **Proposal:** Center the primary "Estrai" button within the bottom action row of the `MobileFooter.tsx` component. Place secondary action icons (Undo, Reset, Back) grouped to the sides (e.g., grouped left or split left/right).
*   **Rationale:**
    *   **Ergonomics:** Centering the primary action button makes it easily accessible for most users' thumbs, regardless of handedness.
    *   **Hierarchy:** Visually emphasizes the most important action ("Estrai").
    *   **Standard Practice:** Aligns with common mobile UX patterns for primary actions.
*   **Implementation Notes:** Adjust Flexbox properties (`justify-center` for the button, potentially using spacer divs or adjusting `flex-grow` on the button container). Ensure sufficient touch target sizes (44x44px) and spacing.

### 3.2. Drawn/Marked Number Highlight Color Change

*   **Proposal:** Replace the current red-based highlights in `Tabellone.tsx` and `CartellaNumerata.tsx` with a color that has a more positive or neutral connotation. Two primary options:
    *   **Option A (Blue):** Use a blue gradient similar to the `primary` button variant.
        *   *Rationale:* Provides strong visual contrast, signifies importance, and maintains consistency with other primary interactive elements.
    *   **Option B (Gold/Yellow):** Use a warm gold or yellow gradient.
        *   *Rationale:* Universally associated with highlighting, selection, or achievement. Complements the retro theme well without negative connotations.
*   **Rationale:** Changing the highlight color will eliminate user confusion and ensure the visual feedback for marking/drawing numbers is perceived positively as intended.
*   **Implementation Notes:** Update the relevant Tailwind CSS classes within the `getCellStyle` function (or similar logic) in both `Tabellone.tsx` and `CartellaNumerata.tsx`. Ensure the chosen color meets WCAG AA contrast requirements against the cell background.

## 4. Scope

*   **In Scope:** Modifying `MobileFooter.tsx` layout, updating CSS classes for number highlights in `Tabellone.tsx` and `CartellaNumerata.tsx`.
*   **Out of Scope:** Desktop footer layouts, changes to other theme colors unless directly related to the highlight.

## 5. Next Steps

*   Confirm preferred mobile footer layout (Centered "Estrai" recommended).
*   Confirm preferred highlight color (Blue or Gold/Yellow recommended).
*   Implement the chosen solutions in the respective components.
