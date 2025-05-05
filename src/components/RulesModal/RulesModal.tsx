import { useEffect, useState } from "react";
import { useLanguageStore } from "../../store/useLanguageStore";
import ReactMarkdown from "react-markdown";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal that displays the game rules based on the selected language
 */
const RulesModal = ({ isOpen, onClose }: RulesModalProps) => {
  const { language } = useLanguageStore();
  const [rules, setRules] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load the appropriate rules file based on language
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const rulesPath =
      language === "it" ? "/rules/regole-it.md" : "/rules/rules-en.md";

    fetch(rulesPath)
      .then((response) => response.text())
      .then((text) => {
        setRules(text);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load rules:", error);
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
        <div className="relative">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
              onClick={onClose}
              aria-label={language === "en" ? "Close rules" : "Chiudi regole"}
              tabIndex={0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="prose prose-amber prose-headings:font-serif prose-headings:text-amber-800 dark:prose-headings:text-amber-300 prose-h1:text-3xl prose-h2:text-2xl prose-h2:border-b prose-h2:border-amber-200 dark:prose-h2:border-amber-800/30 prose-h2:pb-2 prose-h2:mt-8 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-strong:text-amber-700 dark:prose-strong:text-amber-300 prose-li:my-1 prose-ul:my-4 prose-ol:my-4 max-w-none dark:prose-invert pt-8 pr-10">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="py-2">
              <ReactMarkdown
                components={{
                  h1: ({ children, ...props }) => (
                    <h1
                      {...props}
                      className="text-3xl font-serif text-amber-800 dark:text-amber-300 font-bold mt-6 mb-4"
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2
                      {...props}
                      className="text-2xl font-serif text-amber-700 dark:text-amber-400 font-bold mt-8 mb-4 pb-2 border-b border-amber-200 dark:border-amber-800/30"
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3
                      {...props}
                      className="text-xl font-serif text-amber-700 dark:text-amber-400 font-semibold mt-6 mb-3"
                    >
                      {children}
                    </h3>
                  ),
                  p: ({ children, ...props }) => (
                    <p
                      {...props}
                      className="text-gray-700 dark:text-gray-300 my-4"
                    >
                      {children}
                    </p>
                  ),
                  ul: ({ children, ...props }) => (
                    <ul {...props} className="list-disc pl-6 my-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }) => (
                    <ol {...props} className="list-decimal pl-6 my-4">
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => (
                    <li
                      {...props}
                      className="my-1 text-gray-700 dark:text-gray-300"
                    >
                      {children}
                    </li>
                  ),
                  strong: ({ children, ...props }) => (
                    <strong
                      {...props}
                      className="font-bold text-amber-700 dark:text-amber-300"
                    >
                      {children}
                    </strong>
                  ),
                  em: ({ children, ...props }) => (
                    <em
                      {...props}
                      className="italic text-gray-800 dark:text-gray-200"
                    >
                      {children}
                    </em>
                  ),
                  a: ({ children, ...props }) => (
                    <a
                      {...props}
                      className="text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      {children}
                    </a>
                  ),
                  blockquote: ({ children, ...props }) => (
                    <blockquote
                      {...props}
                      className="border-l-4 border-amber-300 dark:border-amber-700 pl-4 py-1 my-4 italic text-gray-600 dark:text-gray-400"
                    >
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, ...props }) => (
                    <code
                      {...props}
                      className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300 font-mono text-sm"
                    >
                      {children}
                    </code>
                  ),
                  pre: ({ children, ...props }) => (
                    <pre
                      {...props}
                      className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto my-4"
                    >
                      {children}
                    </pre>
                  ),
                  hr: ({ ...props }) => (
                    <hr
                      {...props}
                      className="my-8 border-t border-amber-200 dark:border-amber-800/30"
                    />
                  ),
                }}
              >
                {rules}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-800/30 dark:hover:bg-amber-800/40 dark:text-amber-300 rounded-lg transition-colors"
            onClick={onClose}
            tabIndex={0}
          >
            {language === "en" ? "Close" : "Chiudi"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
