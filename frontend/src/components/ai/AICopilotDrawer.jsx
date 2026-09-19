import React, { useState } from "react";
import { Bot, X, Send, Sparkles, AlertTriangle, ShieldCheck, MapPin } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";

const AICopilotDrawer = () => {
    const { isCopilotOpen, setIsCopilotOpen, incidents, resources, hospitals } = useEmergency();
    const [messages, setMessages] = useState([
        {
            sender: "copilot",
            text: "Hello, Commander. I am ResQGrid AI Copilot. How can I assist with emergency situation intelligence, duplicate analysis, or resource dispatch recommendations?",
            timestamp: "Just now"
        }
    ]);
    const [input, setInput] = useState("");

    if (!isCopilotOpen) return null;

    const quickQueries = [
        "Which incidents have no assigned resources?",
        "Recommend boat team for Subhanpura Flood",
        "Show hospital ICU bed availability",
        "Summarize active emergency threats"
    ];

    const handleSend = (textToSend) => {
        const query = textToSend || input;
        if (!query.trim()) return;

        const userMsg = { sender: "user", text: query, timestamp: "Just now" };
        setMessages(prev => [...prev, userMsg]);
        setInput("");

        // Simulated AI Copilot Response logic based on query
        setTimeout(() => {
            let replyText = "";
            const lower = query.toLowerCase();

            if (lower.includes("unassigned") || lower.includes("no assigned")) {
                const unassigned = incidents.filter(i => (!i.assignedResourceIds || i.assignedResourceIds.length === 0) && i.status !== "Resolved");
                if (unassigned.length > 0) {
                    replyText = `Found ${unassigned.length} unassigned active incident(s):\n` +
                        unassigned.map(i => `• [${i.id}] ${i.title} (Severity ${i.severity}/5, Location: ${i.locationName})`).join("\n") +
                        `\n\nRecommendation: Dispatch NDRF Squad 03 to ${unassigned[0].id} immediately.`;
                } else {
                    replyText = "All active incidents currently have assigned response units.";
                }
            } else if (lower.includes("boat") || lower.includes("subhanpura") || lower.includes("flood")) {
                replyText = `AI Recommendation for Subhanpura Flood (INC-2026-001):\n` +
                    `1. NDRF Squad 03 - Water Rescue (Dist: 2.1km, ETA: 6 mins, Capacity: 12 Evacuees)\n` +
                    `2. Municipal Flood Drainage Truck 04 (Dist: 1.8km, ETA: 5 mins)\n` +
                    `Confidence: 96% match for Water Rescue capability requirement.`;
            } else if (lower.includes("hospital") || lower.includes("icu") || lower.includes("bed")) {
                replyText = `Current Medical Facility Status:\n` +
                    hospitals.map(h => `• ${h.name}: ${h.traumaBedsTotal - h.traumaBedsOccupied} Trauma Beds, ${h.icuBedsTotal - h.icuBedsOccupied} ICU Beds free (${h.status})`).join("\n");
            } else {
                replyText = `ResQGrid Copilot Analysis:\nAnalyzed ${incidents.length} incidents and ${resources.length} active units.\nCurrently 1 Critical (Severity 5) incident in Subhanpura requiring immediate water rescue. Overall system operational status is active.`;
            }

            setMessages(prev => [...prev, {
                sender: "copilot",
                text: replyText,
                timestamp: "Just now"
            }]);
        }, 600);
    };

    return (
        <div className="copilot-drawer">
            {/* Header */}
            <div className="copilot-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '6px', borderRadius: '8px', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                        <Bot size={20} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>AI Emergency Copilot</span>
                            <Sparkles size={14} style={{ color: '#c084fc' }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>LLM Emergency Intelligence Node</div>
                    </div>
                </div>

                <button 
                    onClick={() => setIsCopilotOpen(false)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Quick Prompts */}
            <div style={{ padding: '12px 16px', background: '#131c31', borderBottom: '1px solid #1e293b', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {quickQueries.map((q, idx) => (
                    <button 
                        key={idx}
                        onClick={() => handleSend(q)}
                        style={{
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: '#e2e8f0',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                            textAlign: 'left'
                        }}
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* Chat Area */}
            <div className="copilot-chat-area">
                {messages.map((m, idx) => (
                    <div key={idx} className={`chat-msg ${m.sender}`}>
                        <div style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
                        <div style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: '4px', textAlign: m.sender === 'user' ? 'right' : 'left' }}>
                            {m.timestamp}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Form */}
            <form 
                className="copilot-input-area"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                }}
            >
                <input 
                    type="text"
                    className="copilot-input"
                    placeholder="Ask Copilot (e.g. 'Show flood rescue options')..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button 
                    type="submit"
                    style={{
                        background: '#a855f7',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '0 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
};

export default AICopilotDrawer;
