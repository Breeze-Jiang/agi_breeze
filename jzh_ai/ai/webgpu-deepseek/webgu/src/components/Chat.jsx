import { Component, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

import BotIcon from "./icons/BotIcon";
import BrainIcon from "./icons/BrainIcon";
import UserIcon from "./icons/UserIcon";

import { MathJaxContext, MathJax } from "better-react-mathjax";
import "./Chat.css";

function render(text) {
  // Replace all instances of single backslashes before brackets with double backslashes
  // See https://github.com/markedjs/marked/issues/546 for more information.
  text = text.replace(/\\([\[\]\(\)])/g, "\\\\$1");

  const result = DOMPurify.sanitize(
    marked.parse(text, {
      breaks: true,
    }),
  );
  return result;
}

/**
 * Simple React Error Boundary.
 * Catches rendering errors thrown by children (e.g. MathJax failing to load)
 * so the rest of the app stays on screen instead of going fully blank.
 */
class ChatErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error?.message ?? String(error) };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("[ChatErrorBoundary] caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback?.(this.state.error) ?? this.props.children;
    }
    return this.props.children;
  }
}

function PlainMessage({ role, content, answerIndex }) {
  // MathJax-free fallback: render Markdown only (no math formulas)
  const thinking = answerIndex !== undefined ? content.slice(0, answerIndex) : content;
  const answer = answerIndex !== undefined ? content.slice(answerIndex) : "";
  const [showThinking, setShowThinking] = useState(false);
  const doneThinking = answer.length > 0;

  return (
    <div className="flex items-start space-x-4">
      {role === "assistant" ? (
        <>
          <BotIcon className="h-6 w-6 min-h-6 min-w-6 my-3 text-gray-500 dark:text-gray-300" />
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
            <div className="min-h-6 text-gray-800 dark:text-gray-200 overflow-wrap-anywhere">
              {thinking.length > 0 ? (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-lg flex flex-col">
                    <button
                      className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg "
                      onClick={() => setShowThinking((prev) => !prev)}
                      style={{ width: showThinking ? "100%" : "auto" }}
                    >
                      <BrainIcon className={doneThinking ? "" : "animate-pulse"} />
                      <span>{doneThinking ? "View reasoning." : "Thinking..."}</span>
                      <span className="ml-auto text-gray-700">
                        {showThinking ? "▲" : "▼"}
                      </span>
                    </button>
                    {showThinking && (
                      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                        <span
                          className="markdown"
                          dangerouslySetInnerHTML={{ __html: render(thinking) }}
                        />
                      </div>
                    )}
                  </div>
                  {doneThinking && (
                    <div className="mt-2">
                      <span
                        className="markdown"
                        dangerouslySetInnerHTML={{ __html: render(answer) }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <span className="h-6 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-gray-600 dark:bg-gray-300 rounded-full animate-pulse"></span>
                  <span className="w-2.5 h-2.5 bg-gray-600 dark:bg-gray-300 rounded-full animate-pulse animation-delay-200"></span>
                  <span className="w-2.5 h-2.5 bg-gray-600 dark:bg-gray-300 rounded-full animate-pulse animation-delay-400"></span>
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <UserIcon className="h-6 w-6 min-h-6 min-w-6 my-3 text-gray-500 dark:text-gray-300" />
          <div className="bg-blue-500 text-white rounded-lg p-4">
            <p className="min-h-6 overflow-wrap-anywhere">{content}</p>
          </div>
        </>
      )}
    </div>
  );
}

function Message({ role, content, answerIndex }) {
  const thinking = answerIndex !== undefined ? content.slice(0, answerIndex) : content;
  const answer = answerIndex !== undefined ? content.slice(answerIndex) : "";

  const [showThinking, setShowThinking] = useState(false);

  const doneThinking = answer.length > 0;

  return (
    <div className="flex items-start space-x-4">
      {role === "assistant" ? (
        <>
          <BotIcon className="h-6 w-6 min-h-6 min-w-6 my-3 text-gray-500 dark:text-gray-300" />
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
            <div className="min-h-6 text-gray-800 dark:text-gray-200 overflow-wrap-anywhere">
              {thinking.length > 0 ? (
                <>
                  <div className="bg-white dark:bg-gray-800 rounded-lg flex flex-col">
                    <button
                      className="flex items-center gap-2 cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg "
                      onClick={() => setShowThinking((prev) => !prev)}
                      style={{ width: showThinking ? "100%" : "auto" }}
                    >
                      <BrainIcon className={doneThinking ? "" : "animate-pulse"} />
                      <span>{doneThinking ? "View reasoning." : "Thinking..."}</span>
                      <span className="ml-auto text-gray-700">
                        {showThinking ? "▲" : "▼"}
                      </span>
                    </button>
                    {showThinking && (
                      <MathJax
                        className="border-t border-gray-200 dark:border-gray-700 px-4 py-2"
                        dynamic
                        hideUntilTypeset="first"
                        text={`MathJax loading…`}
                        noWarning
                      >
                        <span
                          className="markdown"
                          dangerouslySetInnerHTML={{ __html: render(thinking) }}
                        />
                      </MathJax>
                    )}
                  </div>
                  {doneThinking && (
                    <MathJax
                      className="mt-2"
                      dynamic
                      hideUntilTypeset="first"
                      text={`MathJax loading…`}
                      noWarning
                    >
                      <span
                        className="markdown"
                        dangerouslySetInnerHTML={{ __html: render(answer) }}
                      />
                    </MathJax>
                  )}
                </>
              ) : (
                <span className="h-6 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-gray-600 dark:bg-gray-300 rounded-full animate-pulse"></span>
                  <span className="w-2.5 h-2.5 bg-gray-600 dark:bg-gray-300 rounded-full animate-pulse animation-delay-200"></span>
                  <span className="w-2.5 h-2.5 bg-gray-600 dark:bg-gray-300 rounded-full animate-pulse animation-delay-400"></span>
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <UserIcon className="h-6 w-6 min-h-6 min-w-6 my-3 text-gray-500 dark:text-gray-300" />
          <div className="bg-blue-500 text-white rounded-lg p-4">
            <p className="min-h-6 overflow-wrap-anywhere">{content}</p>
          </div>
        </>
      )}
    </div>
  );
}

function ChatInner({ messages }) {
  const empty = messages.length === 0;

  return (
    <div
      className={`flex-1 p-6 max-w-[960px] w-full ${
        empty ? "flex flex-col items-center justify-end" : "space-y-4"
      }`}
    >
      {empty ? (
        <div className="text-xl py-8">Ready! Type a message or pick an example below.</div>
      ) : (
        messages.map((msg, i) => <Message key={`message-${i}`} {...msg} />)
      )}
    </div>
  );
}

/**
 * Plain (non-MathJax) chat body. Used when MathJaxContext itself fails to load
 * (e.g. CDN blocked, script download timeout, React 19 incompatibility).
 */
function ChatFallback({ messages }) {
  const empty = messages.length === 0;
  return (
    <div
      className={`flex-1 p-6 max-w-[960px] w-full ${
        empty ? "flex flex-col items-center justify-end" : "space-y-4"
      }`}
    >
      <div className="mb-4 w-full max-w-[960px] p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 text-sm">
        MathJax failed to load (formulas may not render correctly). Showing text-only mode.
      </div>
      {empty ? (
        <div className="text-xl py-8">Ready! Type a message or pick an example below.</div>
      ) : (
        messages.map((msg, i) => <PlainMessage key={`plain-${i}`} {...msg} />)
      )}
    </div>
  );
}

export default function Chat({ messages }) {
  return (
    <ChatErrorBoundary
      key="chat-eb"
      fallback={(errMsg) => <ChatFallback messages={messages} />}
    >
      <MathJaxContext
        version={3}
        onError={(err) => {
          // eslint-disable-next-line no-console
          console.warn("[MathJax] init error (falling back to plain mode):", err);
          // Force ErrorBoundary to pick up the failure on next render via throw in a microtask
          // We can't reliably trigger the boundary from here, so the boundary above will catch
          // child throws; if MathJaxContext itself rejects the context, React 19 surfaces it.
        }}
        options={{
          tex: {
            inlineMath: [
              ["$", "$"],
              ["\\(", "\\)"],
            ],
          },
          svg: { fontCache: "global" },
          startup: {
            typeset: false,
          },
        }}
      >
        <ChatInner messages={messages} />
      </MathJaxContext>
    </ChatErrorBoundary>
  );
}
