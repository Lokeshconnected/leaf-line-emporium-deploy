import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Plus, Trash2, Loader2, Leaf, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useLocation } from "wouter";
import { apiFetch, getApiBase } from "@/lib/api";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

interface Conversation {
  id: number;
  title: string;
  updatedAt: string;
}

const QUICK_PROMPTS = [
  "Why are my plant's leaves turning yellow?",
  "How often should I water a Monstera?",
  "Best plants for a dark bathroom?",
  "How do I repot a root-bound plant?",
  "What's causing brown tips on my fern?",
  "Which plants on this website are pet safe?",
  "How do I use the wishlist and checkout on this site?",
];

export default function AIAssistant() {
  const { token, isAuthenticated } = useAuthStore();
  const [, navigate] = useLocation();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/auth"); return; }
    fetchConversations();
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    if (!token) return;
    try {
      setErrorMessage(null);
      const res = await apiFetch("/openai/conversations", {}, token);
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data.reverse());
        if (data.length > 0 && !activeConvId) {
          selectConversation(data[data.length - 1].id);
        }
      }
    } catch {
      setErrorMessage("The app can't reach the API right now. Make sure the backend server is running, then refresh.");
    } finally {
      setLoadingConvs(false);
    }
  };

  const selectConversation = async (convId: number) => {
    if (!token) return;
    setActiveConvId(convId);
    setLoadingMsgs(true);
    try {
      setErrorMessage(null);
      const res = await apiFetch(`/openai/conversations/${convId}`, {}, token);
      const data = await res.json();
      setMessages(data.messages || []);
    } catch {
      setErrorMessage("I couldn't load that conversation because the API is unreachable right now.");
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const createConversation = async () => {
    if (!token) return;
    try {
      setErrorMessage(null);
      const res = await apiFetch("/openai/conversations", { method: "POST", body: JSON.stringify({ title: "New Chat" }) }, token);
      const data = await res.json();
      setConversations(prev => [data, ...prev]);
      setActiveConvId(data.id);
      setMessages([]);
      return data.id as number;
    } catch {
      setErrorMessage("I couldn't start a new chat because the API server isn't responding. Restart the backend and try again.");
      return undefined;
    }
  };

  const deleteConversation = async (convId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      setErrorMessage(null);
      await apiFetch(`/openai/conversations/${convId}`, { method: "DELETE" }, token);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConvId === convId) {
        setActiveConvId(null);
        setMessages([]);
      }
    } catch {
      setErrorMessage("I couldn't delete that conversation because the API is unreachable right now.");
    }
  };

  const sendMessage = async (text?: string, conversationId?: number) => {
    const content = (text || input).trim();
    const targetConversationId = conversationId ?? activeConvId;
    if (!content || !targetConversationId || !token || streaming) return;

    setInput("");
    const userMsg: Message = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);

    // Placeholder for assistant
    const placeholder: Message = { role: "assistant", content: "" };
    setMessages(prev => [...prev, placeholder]);
    setStreaming(true);

    try {
      setErrorMessage(null);
      const response = await fetch(`${getApiBase()}/api/openai/conversations/${targetConversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Unable to reach the AI service.");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            let json: { content?: string; error?: string } | null = null;

            try {
              json = JSON.parse(line.slice(6)) as { content?: string; error?: string };
            } catch {
              continue;
            }

            if (json.content) {
              fullText += json.content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: fullText };
                return updated;
              });
            }

            if (json.error) {
              throw new Error(json.error);
            }
          }
        }
      }

      // Update conversation title from first message
      if (conversations.find(c => c.id === targetConversationId)?.title === "New Chat") {
        const newTitle = content.length > 40 ? content.slice(0, 40) + "..." : content;
        setConversations(prev => prev.map(c => c.id === targetConversationId ? { ...c, title: newTitle } : c));
      }
    } catch (error) {
      const fallbackMessage =
        error instanceof Error
          ? error.message
          : "Sorry, I couldn't connect to the AI service. Please try again.";
      setErrorMessage("The API request failed. If this keeps happening, restart the backend server and refresh the page.");
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: fallbackMessage };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen pt-[4.5rem] bg-background flex">
      {/* Sidebar */}
      <div className="hidden md:flex w-72 lg:w-80 flex-col border-r border-border bg-muted/20 pt-5">
        <div className="px-4 py-3 flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-green-600" />
            <span className="text-base font-semibold">Leafy AI</span>
          </div>
          <button onClick={createConversation} className="p-2 rounded-lg hover:bg-accent transition-colors" title="New chat">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {loadingConvs ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                className={`w-full flex items-center justify-between group px-4 py-3 rounded-lg text-left text-base transition-colors mb-1 ${activeConvId === conv.id ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}
              >
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-500 ml-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {errorMessage ? (
          <div className="px-4 pt-4">
            <div className="mx-auto max-w-3xl rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {errorMessage}
            </div>
          </div>
        ) : null}
        {!activeConvId ? (
          // Welcome screen
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md"
            >
              <div className="w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
                <Sparkles className="w-9 h-9 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">Meet Leafy 🌿</h1>
              <p className="text-base text-muted-foreground mb-8 leading-relaxed">
                Your AI plant care and shopping guide. Ask about plant care, products on this website, or how to use LEAFLINE features.
              </p>

              <button
                onClick={createConversation}
                className="mb-8 w-full max-w-xs mx-auto flex items-center justify-center gap-2 py-3.5 bg-green-700 hover:bg-green-600 text-white text-base font-semibold rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                Start a Conversation
              </button>

              <div className="text-left">
                <p className="text-sm text-muted-foreground mb-3 font-medium uppercase tracking-wide">Try asking:</p>
                <div className="space-y-2">
                  {QUICK_PROMPTS.map((p, i) => (
                    <button
                      key={i}
                      onClick={async () => {
                        const conversationId = await createConversation();
                        if (conversationId) {
                          await sendMessage(p, conversationId);
                        }
                      }}
                      className="w-full text-left text-base px-4 py-3 rounded-xl border border-border hover:bg-accent hover:border-green-300 transition-all text-muted-foreground hover:text-foreground"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {loadingMsgs ? (
                <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-green-600" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <Leaf className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Start the conversation with a plant question!</p>
                  <div className="mt-6 space-y-2 max-w-sm mx-auto">
                    {QUICK_PROMPTS.slice(0, 3).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(p)}
                        className="w-full text-base px-4 py-2.5 rounded-xl border border-border hover:bg-accent transition-all text-muted-foreground hover:text-foreground text-left"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "assistant" ? "bg-gradient-to-br from-green-400 to-emerald-600" : "bg-primary"}`}>
                          {msg.role === "assistant" ? <Sparkles className="w-5 h-5 text-white" /> : <span className="text-sm text-primary-foreground font-bold">U</span>}
                        </div>
                        <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-base leading-relaxed whitespace-pre-wrap ${msg.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"}`}>
                          {msg.content || (streaming && i === messages.length - 1 ? <span className="inline-block w-1.5 h-4 bg-green-600 animate-pulse rounded" /> : "")}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border px-4 py-4">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Leafy about plant care or this website..."
                  rows={1}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-border bg-background text-base resize-none focus:outline-none focus:ring-2 focus:ring-green-500 max-h-32 overflow-y-auto"
                  style={{ minHeight: "48px" }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || streaming}
                  className="w-[3.25rem] h-[3.25rem] rounded-xl bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  {streaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">Ask about plant care, LEAFLINE products, or website features. Press Enter to send, Shift+Enter for new line.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
