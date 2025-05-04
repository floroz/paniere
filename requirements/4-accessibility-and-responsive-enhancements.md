# Paniere App - Accessibility and Responsive Enhancements

## 1. Overview

This specification outlines improvements to the Paniere application focusing on keyboard navigation, accessibility, and responsive design optimizations. These enhancements will make the application more usable across different devices and for users with accessibility needs.

## 2. Keyboard Navigation Pattern

### Objective
Implement a comprehensive keyboard navigation system that allows users to efficiently navigate and interact with cartelle using only keyboard controls.

### Implementation Details

#### 2.1 Cartella Container Focus

- Make each cartella container focusable with `tabIndex={0}`
- Add visual focus indicators that meet WCAG AA contrast requirements
- Implement `onKeyDown` handler on the cartella container
- Ensure focus is visually distinct from the hover and selected states

#### 2.2 Arrow Key Navigation Within Cartella

- When a cartella has focus, implement directional navigation:
  - `ArrowRight`: Move focus to next number in row
  - `ArrowLeft`: Move focus to previous number in row
  - `ArrowDown`: Move focus to number below in next row
  - `ArrowUp`: Move focus to number above in previous row
- Implement wrapping navigation (e.g., right at end of row moves to first number of next row)
- Skip empty cells in the grid to focus only on actual numbers
- Maintain position state to track current focus within the grid

#### 2.3 Number Selection

- Use `Enter` or `Space` to mark/unmark the currently focused number
- Trigger the same confirmation dialog for unmarking as with mouse clicks
- Provide appropriate ARIA attributes for screen reader feedback
- Add optional audio feedback for marking/unmarking actions

#### 2.4 Focus Management

- Maintain focus position when returning to a cartella
- Implement focus trapping within the active cartella until `Tab` is pressed
- Ensure proper focus order between multiple cartelle
- Add appropriate ARIA live regions for dynamic content updates

#### 2.5 Keyboard Shortcuts

- Add optional keyboard shortcuts for common actions:
  - `M`: Mark/unmark the currently focused number
  - `N`: Move to next cartella
  - `P`: Move to previous cartella
  - `?`: Show keyboard shortcut help

## 3. Responsive Design Refinements

### 3.1 Cartelle Layout Optimization

#### Mobile (< 640px)
- Single column layout with vertically stacked cartelle
- Larger touch targets for numbers (min 44×44px)
- Full-width cartelle with optimized spacing
- Simplified header with dropdown for additional options
- Swipe gestures for navigating between cartelle

#### Tablet (640px - 1024px)
- Two cartelle per row in a grid layout
- Medium-sized number cells
- Compact but readable header
- Optimized spacing between elements

#### Desktop (> 1024px)
- Up to three cartelle per row
- Optional side panel for game information
- Larger number display with subtle animations
- Enhanced visual feedback for interactions

### 3.2 Adaptive Typography

- Use `rem` units for font sizes with appropriate scaling
- Implement responsive text truncation for longer content
- Adjust heading sizes based on viewport width
- Ensure minimum 16px font size on mobile for readability
- Use fluid typography scaling between breakpoints

### 3.3 Touch-Friendly Controls

- Increase button sizes on smaller screens (minimum 44×44px touch targets)
- Add swipe gestures for navigating between cartelle groups
- Implement a floating action button for primary actions on mobile
- Ensure touch targets have sufficient spacing (min 8px)
- Add haptic feedback for touch interactions where supported

### 3.4 Layout Adjustments

- Use CSS Grid with `minmax()` and `auto-fit` for fluid layouts
- Implement container queries for more granular control
- Create collapsible sections for secondary information
- Use sticky positioning for important controls
- Optimize white space usage across different viewport sizes

### 3.5 Performance Optimizations

- Implement virtualization for multiple cartelle to reduce DOM size
- Lazy load cartelle that are not in the viewport
- Use CSS transitions instead of JavaScript animations where possible
- Optimize images and SVGs for faster loading
- Implement code splitting to reduce initial bundle size

## 4. Technical Implementation

### 4.1 CartellaNumerata Component Enhancements

```tsx
// CartellaNumerata component with keyboard navigation
const CartellaNumerata = ({ cartella, cartellaId, markedNumbers, onMarkNumber }) => {
  // Track focused cell position
  const [focusPosition, setFocusPosition] = useState({ row: 0, col: 0 });
  
  // Find next valid cell with a number (skip empty cells)
  const findNextValidCell = (row, col, direction) => {
    // Implementation to find next cell with number based on direction
    // Returns { row, col } of next valid cell
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowRight':
        setFocusPosition(findNextValidCell(focusPosition.row, focusPosition.col, 'right'));
        e.preventDefault();
        break;
      case 'ArrowLeft':
        setFocusPosition(findNextValidCell(focusPosition.row, focusPosition.col, 'left'));
        e.preventDefault();
        break;
      case 'ArrowDown':
        setFocusPosition(findNextValidCell(focusPosition.row, focusPosition.col, 'down'));
        e.preventDefault();
        break;
      case 'ArrowUp':
        setFocusPosition(findNextValidCell(focusPosition.row, focusPosition.col, 'up'));
        e.preventDefault();
        break;
      case 'Enter':
      case ' ': // Space key
        const currentNumber = cartella.numbers[focusPosition.row][focusPosition.col];
        if (currentNumber > 0) {
          onMarkNumber(currentNumber);
          e.preventDefault();
        }
        break;
    }
  };
  
  return (
    <div 
      className="cartella-container" 
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Cartella ${cartellaId}`}
    >
      {/* Cartella rendering with focus indicators */}
      {Array.from({ length: 3 }, (_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="grid grid-cols-9 gap-1">
          {Array.from({ length: 9 }, (_, colIdx) => {
            const number = cartella.numbers[rowIdx][colIdx];
            const isFocused = focusPosition.row === rowIdx && focusPosition.col === colIdx;
            const isMarked = markedNumbers.includes(number);
            
            return (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className={`
                  relative w-7 h-7 sm:w-9 sm:h-9 
                  overflow-hidden
                  rounded-md
                  ${number > 0 ? 'shadow-sm' : ''}
                  ${isMarked ? 'bg-amber-200 dark:bg-amber-700' : 'bg-white dark:bg-gray-800'}
                  ${isFocused ? 'ring-2 ring-amber-500 dark:ring-amber-400' : ''}
                  flex items-center justify-center
                `}
                aria-pressed={isMarked}
                aria-label={number > 0 ? `Number ${number}${isMarked ? ', marked' : ''}` : 'Empty cell'}
              >
                {number !== 0 && <span>{number}</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
```

### 4.2 Responsive Layout Implementation

```tsx
// Responsive cartelle container
const CartelleGrid = ({ cartelle, markedNumbers, onMarkNumber }) => {
  return (
    <div className="
      grid 
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-3 
      gap-4 
      w-full 
      max-w-6xl 
      mx-auto
    ">
      {cartelle.map((cartella, index) => (
        <CartellaNumerata
          key={`cartella-${index}`}
          cartella={cartella}
          cartellaId={index + 1}
          markedNumbers={markedNumbers}
          onMarkNumber={onMarkNumber}
        />
      ))}
    </div>
  );
};
```

## 5. Accessibility Compliance

### 5.1 WCAG 2.1 AA Compliance Checklist

- **Perceivable**
  - Text alternatives for non-text content
  - Captions and alternatives for multimedia
  - Content can be presented in different ways
  - Make it easier for users to see and hear content

- **Operable**
  - Functionality available from keyboard
  - Users have enough time to read and use content
  - Content does not cause seizures or physical reactions
  - Users can navigate, find content, and determine where they are

- **Understandable**
  - Text is readable and understandable
  - Content appears and operates in predictable ways
  - Users are helped to avoid and correct mistakes

- **Robust**
  - Content is compatible with current and future user tools

### 5.2 Screen Reader Support

- Implement proper ARIA roles, states, and properties
- Ensure dynamic content updates are announced appropriately
- Test with popular screen readers (NVDA, VoiceOver, JAWS)
- Add descriptive labels for all interactive elements

## 6. Implementation Phases

### Phase 1: Keyboard Navigation
1. Implement focus management for cartelle
2. Add arrow key navigation within cartelle
3. Implement Enter/Space for selection
4. Add keyboard shortcuts and help

### Phase 2: Responsive Design
1. Optimize layouts for different screen sizes
2. Implement adaptive typography
3. Enhance touch controls for mobile
4. Optimize performance for lower-end devices

### Phase 3: Accessibility Compliance
1. Audit current implementation against WCAG 2.1 AA
2. Fix identified issues
3. Test with assistive technologies
4. Document accessibility features

## 7. Success Metrics

- **Keyboard Navigation**: 100% of app functionality accessible via keyboard
- **Responsive Design**: Optimal viewing experience across devices from 320px to 1920px width
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Maintain 60fps scrolling and interactions on mid-range mobile devices
