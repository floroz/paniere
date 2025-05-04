# Game Rules Implementation Plan

## Overview
To help users understand how to play Tombola, we'll implement a comprehensive rules system that provides instructions in both English and Italian based on the user's selected language.

## Implementation Plan

1. **Rules Content**
   - Create markdown files for both languages:
     - `/public/rules/rules-en.md` for English
     - `/public/rules/regole-it.md` for Italian
   - Include comprehensive explanations of:
     - Game components and setup
     - How to play
     - Prize categories (ambo, terno, quaterna, cinquina, tombola)
     - Tips for success
     - Specific instructions for both Tabellone and Player modes

2. **RulesModal Component**
   - Create a new modal component for displaying rules
   - Fetch and render the appropriate markdown file based on language
   - Include a loading state while fetching content
   - Provide proper accessibility attributes and keyboard navigation
   - Allow closing via button, ESC key, or clicking outside

3. **Start Page Integration**
   - Add a "Learn How to Play" button below the app description
   - Style the button to be noticeable but not distracting
   - Open the RulesModal when clicked
   - Automatically display rules in the user's selected language

4. **Technical Implementation**
   - Use ReactMarkdown to render the markdown content
   - Implement proper styling for the markdown content
   - Ensure the modal is responsive and works on all device sizes
   - Add smooth animations for opening/closing

5. **User Experience Considerations**
   - Make rules accessible from both the Start Page and during gameplay
   - Ensure the content is scannable with clear headings and sections
   - Include visual examples where helpful
   - Provide a way to quickly close and return to the game

## Code Example

```tsx
// RulesModal.tsx
import { useEffect, useState } from "react";
import { useLanguageStore } from "../../store/useLanguageStore";
import ReactMarkdown from 'react-markdown';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal = ({ isOpen, onClose }: RulesModalProps) => {
  const { language } = useLanguageStore();
  const [rules, setRules] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load the appropriate rules file based on language
  useEffect(() => {
    if (!isOpen) return;
    
    setIsLoading(true);
    const rulesPath = language === 'it' ? '/rules/regole-it.md' : '/rules/rules-en.md';
    
    fetch(rulesPath)
      .then(response => response.text())
      .then(text => {
        setRules(text);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Failed to load rules:', error);
        setIsLoading(false);
      });
  }, [isOpen, language]);
  
  // Handle ESC key press for closing modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-modal-title"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-auto transform rounded-2xl bg-white p-6 shadow-2xl transition-all duration-500 dark:bg-gray-800 dark:text-white animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between bg-white dark:bg-gray-800 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          <h2 
            id="rules-modal-title"
            className="text-2xl font-bold text-gray-900 dark:text-white"
          >
            {language === 'en' ? 'Tombola Rules' : 'Regole della Tombola'}
          </h2>
          <button
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            onClick={onClose}
            aria-label={language === 'en' ? 'Close rules' : 'Chiudi regole'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="prose prose-amber max-w-none dark:prose-invert">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
            </div>
          ) : (
            <ReactMarkdown>{rules}</ReactMarkdown>
          )}
        </div>
        
        <div className="sticky bottom-0 flex justify-end pt-4 mt-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-800/30 dark:hover:bg-amber-800/40 dark:text-amber-300 rounded-lg transition-colors"
            onClick={onClose}
          >
            {language === 'en' ? 'Close' : 'Chiudi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
```

## Start Page Integration

```tsx
// In StartPage.tsx

// Add state for the RulesModal
const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

// Add handlers
const handleOpenRulesModal = () => setIsRulesModalOpen(true);
const handleCloseRulesModal = () => setIsRulesModalOpen(false);

// Add the Learn More button after the description paragraph
<div className="flex justify-center mt-2 mb-6">
  <button
    onClick={handleOpenRulesModal}
    className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-800/30 dark:hover:bg-amber-800/40 dark:text-amber-300 rounded-lg transition-colors text-sm font-medium"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
    {language === 'en' ? 'Learn How to Play' : 'Impara a Giocare'}
  </button>
</div>

// Add the RulesModal component at the end of the component
<RulesModal isOpen={isRulesModalOpen} onClose={handleCloseRulesModal} />
```
