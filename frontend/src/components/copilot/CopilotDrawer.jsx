import React, { useState, useEffect, useRef } from "react";
import copilotService from "../../services/copilotService";

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

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-surface-dark border-l border-border-dark shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 bg-surface-darker border-b border-border-dark flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl">smart_toy</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-text-main text-sm">ResQGrid AI Copilot</h3>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold">
                                SOP RAG
                            </span>
                        </div>
                        <p className="text-[11px] font-mono text-text-muted">
                            {sopData?.docId || "SOP-NDRF-01"} Active
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-main hover:bg-surface-elevated transition-colors"
                >
                    <span className="material-symbols-outlined text-base">close</span>
                </button>
            </div>

            {/* SOP Reference Banner */}
            {sopData && (
                <div className="p-3 bg-primary/10 border-b border-border-dark text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">verified</span>
                        <span className="text-text-main font-semibold truncate max-w-[280px]">
                            {sopData.title}
                        </span>
                    </div>
                    <span className="font-mono text-[10px] text-primary font-bold">
                        {Math.round((sopData.confidenceScore || 0.95) * 100)}% Match
                    </span>
                </div>
            )}

            {/* Quick Prompts Chips */}
            <div className="p-3 bg-surface-dark border-b border-border-dark/60 flex items-center gap-2 overflow-x-auto">
                {[
                    "Standard SOP Checklist",
                    "Evacuation Perimeter",
                    "ICU Bed Capacity",
                    "Duplicate Reports"
                ].map((chip) => (
                    <button
                        key={chip}
                        onClick={() => handleSend(chip)}
                        className="px-2.5 py-1 rounded-full bg-surface-darker hover:bg-surface-elevated border border-border-dark text-[11px] text-text-muted hover:text-text-main whitespace-nowrap transition-colors"
                    >
                        {chip}
                    </button>
                ))}
            </div>

            {/* Messages Chat List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
                    >
                        <div className={`max-w-[90%] rounded-2xl p-3.5 text-xs shadow-md ${
                            m.role === "user"
                                ? "bg-primary text-white rounded-br-none"
                                : "bg-surface-darker border border-border-dark text-text-main rounded-bl-none"
                        }`}>
                            <div className="prose prose-invert prose-xs leading-relaxed whitespace-pre-wrap">
                                {m.content}
                            </div>

                            {/* Citations Pills */}
                            {m.citations && m.citations.length > 0 && (
                                <div className="mt-2.5 pt-2 border-t border-border-dark/60 flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-mono text-text-muted">Citations:</span>
                                    {m.citations.map((c, ci) => (
                                        <span
                                            key={ci}
                                            className="px-1.5 py-0.5 rounded bg-surface-elevated text-primary font-mono text-[10px] font-bold"
                                        >
                                            [{c}]
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <span className="text-[10px] font-mono text-text-muted mt-1 px-1">
                            {m.time}
                        </span>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-2 text-text-muted text-xs font-mono p-3 bg-surface-darker border border-border-dark rounded-xl w-48">
                        <span className="material-symbols-outlined text-base text-primary animate-spin">sync</span>
                        <span>Reasoning with RAG...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-surface-darker border-t border-border-dark flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Copilot for SOPs, triage, or units..."
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-dark border border-border-dark text-text-main text-xs outline-none focus:border-primary transition-colors"
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="w-9 h-9 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white flex items-center justify-center transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-base">send</span>
                </button>
            </form>
        </div>
    );
}
