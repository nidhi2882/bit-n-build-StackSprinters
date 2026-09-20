import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import copilotService from "../../services/copilotService";

// Render inline markdown: **bold**, *italic*, `code`, and [INC-2026-001] pills.
function renderInline(text, keyPrefix) {
    const nodes = [];
    // Split on bold/italic/code tokens while keeping the delimiters
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    const parts = text.split(regex);
    parts.forEach((part, i) => {
        if (!part) return;
        if (part.startsWith("**") && part.endsWith("**")) {
            nodes.push(<strong key={`${keyPrefix}-b-${i}`} className="font-bold">{part.slice(2, -2)}</strong>);
        } else if (part.startsWith("*") && part.endsWith("*")) {
            nodes.push(<em key={`${keyPrefix}-i-${i}`} className="italic opacity-90">{part.slice(1, -1)}</em>);
        } else if (part.startsWith("`") && part.endsWith("`")) {
            nodes.push(
                <code key={`${keyPrefix}-c-${i}`} className="px-1 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px]">
                    {part.slice(1, -1)}
                </code>
            );
        } else {
            nodes.push(<span key={`${keyPrefix}-t-${i}`}>{part}</span>);
        }
    });
    return nodes;
}

// Lightweight markdown -> React renderer for copilot replies (headers, lists, rules, bold).
function renderMarkdown(content) {
    if (!content) return null;
    const lines = String(content).split("\n");
    const blocks = [];
    let listBuffer = [];
    let listType = null; // "ul" | "ol"

    const flushList = (key) => {
        if (listBuffer.length === 0) return;
        const items = listBuffer.map((li, idx) => (
            <li key={`li-${key}-${idx}`} className="ml-1">{renderInline(li, `li-${key}-${idx}`)}</li>
        ));
        if (listType === "ol") {
            blocks.push(<ol key={`ol-${key}`} className="list-decimal list-inside space-y-1 my-1.5">{items}</ol>);
        } else {
            blocks.push(<ul key={`ul-${key}`} className="list-disc list-inside space-y-1 my-1.5">{items}</ul>);
        }
        listBuffer = [];
        listType = null;
    };

    lines.forEach((raw, idx) => {
        const line = raw.trimEnd();
        const trimmed = line.trim();

        if (trimmed === "") { flushList(idx); return; }

        // Horizontal rule
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
            flushList(idx);
            blocks.push(<hr key={`hr-${idx}`} className="my-2.5 border-current/15" />);
            return;
        }

        // Headers (#, ##, ###, ####)
        const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headerMatch) {
            flushList(idx);
            const level = headerMatch[1].length;
            const sizeClass = level <= 2 ? "text-sm" : "text-[13px]";
            blocks.push(
                <div key={`h-${idx}`} className={`font-bold ${sizeClass} mt-2 mb-1 text-current`}>
                    {renderInline(headerMatch[2], `h-${idx}`)}
                </div>
            );
            return;
        }

        // Ordered list item
        const olMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
        if (olMatch) {
            if (listType && listType !== "ol") flushList(idx);
            listType = "ol";
            listBuffer.push(olMatch[2]);
            return;
        }

        // Unordered list item (-, *, •)
        const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
        if (ulMatch) {
            if (listType && listType !== "ul") flushList(idx);
            listType = "ul";
            listBuffer.push(ulMatch[1]);
            return;
        }

        // Regular paragraph
        flushList(idx);
        blocks.push(<p key={`p-${idx}`} className="my-1 leading-relaxed">{renderInline(trimmed, `p-${idx}`)}</p>);
    });
    flushList("end");
    return blocks;
}

export default function CopilotDrawer({ isOpen, onClose, activeIncident = null, category = "FLOOD" }) {
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `**ResQGrid AI Copilot Online**\n\nI am connected to the National Emergency SOP Vector Database and live CAD telemetry. How can I assist your tactical operations?`,
            citations: ["SOP-VECTOR-DB", "CAD-CORE"],
            time: "Live"
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sopData, setSopData] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            copilotService.getSOP(category)
                .then(data => setSopData(data))
                .catch(() => {});
        }
    }, [isOpen, category]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (textToSend) => {
        const queryText = textToSend || input;
        if (!queryText.trim() || loading) return;

        const userMsg = {
            role: "user",
            content: queryText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const context = {
                activeIncident,
                category,
                sop: sopData
            };
            const result = await copilotService.queryCopilot(queryText, context);
            const assistantMsg = {
                role: "assistant",
                content: result.reply,
                citations: result.citedIncidentIds || [sopData?.docId || "SOP-DOC"],
                model: result.aiModel,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err) {
            console.error("Copilot error", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Rendered through a portal to document.body so the drawer escapes the fixed 64px
    // header it is mounted inside (which was clipping/collapsing its body).
    return createPortal(
        <div className="fixed inset-y-0 right-0 z-[100] w-full sm:w-[440px] h-screen bg-surface-container-lowest border-l border-surface-container-high shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="shrink-0 p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">smart_toy</span>
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-on-surface text-sm truncate">ResQGrid AI Copilot</h3>
                            <span className="px-1.5 py-0.5 rounded bg-secondary-container text-secondary font-mono text-[9px] font-bold shrink-0">
                                SOP RAG
                            </span>
                        </div>
                        <p className="text-[11px] font-mono text-on-surface-variant truncate">
                            {sopData?.docId || "SOP-NDRF-01"} Active
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                >
                    <span className="material-symbols-outlined text-base">close</span>
                </button>
            </div>

            {/* SOP Reference Banner */}
            {sopData && (
                <div className="shrink-0 p-3 bg-primary-container/20 border-b border-surface-container-high text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-primary text-base shrink-0">verified</span>
                        <span className="text-on-surface font-semibold truncate">
                            {sopData.title}
                        </span>
                    </div>
                    <span className="font-mono text-[10px] text-primary font-bold shrink-0">
                        {Math.round((sopData.confidenceScore || 0.95) * 100)}% Match
                    </span>
                </div>
            )}

            {/* Quick Prompts Chips */}
            <div className="shrink-0 p-3 bg-surface-container-lowest border-b border-surface-container-high flex items-center gap-2 overflow-x-auto">
                {[
                    "Standard SOP Checklist",
                    "Evacuation Perimeter",
                    "ICU Bed Capacity",
                    "Duplicate Reports"
                ].map((chip) => (
                    <button
                        key={chip}
                        onClick={() => handleSend(chip)}
                        className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-[11px] text-on-surface-variant hover:text-on-surface whitespace-nowrap transition-colors"
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Messages Chat List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-lowest">
                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                    >
                        <div className={`max-w-[90%] rounded-2xl p-3.5 text-xs shadow-sm ${
                            m.role === "user"
                                ? "bg-primary text-on-primary rounded-br-none"
                                : "bg-surface-container border border-surface-container-high text-on-surface rounded-bl-none"
                        }`}>
                            <div className="leading-relaxed break-words">
                                {m.role === "user" ? (
                                    <span className="whitespace-pre-wrap">{m.content}</span>
                                ) : (
                                    renderMarkdown(m.content)
                                )}
                            </div>

                            {/* Citations Pills */}
                            {m.citations && m.citations.length > 0 && (
                                <div className="mt-2.5 pt-2 border-t border-current/10 flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-mono opacity-70">Citations:</span>
                                    {m.citations.map((c, ci) => (
                                        <span
                                            key={ci}
                                            className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                                                m.role === "user" ? "bg-white/20 text-on-primary" : "bg-surface-container-high text-primary"
                                            }`}
                                        >
                                            [{c}]
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-mono text-on-surface-variant mt-1 px-1">
                            {m.time}
                        </span>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-2 text-on-surface-variant text-xs font-mono p-3 bg-surface-container border border-surface-container-high rounded-xl w-48">
                        <span className="material-symbols-outlined text-base text-primary animate-spin">sync</span>
                        <span>Reasoning with RAG...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="shrink-0 p-3 bg-surface-container-low border-t border-surface-container-high flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Copilot for SOPs, triage, or units..."
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-container-lowest border border-surface-container-high text-on-surface placeholder:text-on-surface-variant text-xs outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="w-9 h-9 shrink-0 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-on-primary flex items-center justify-center transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-base">send</span>
                </button>
            </form>
        </div>,
        document.body
    );
}
