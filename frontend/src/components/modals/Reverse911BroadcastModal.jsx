import React, { useState } from "react";
import notificationService from "../../services/notificationService";

export default function Reverse911BroadcastModal({ onClose, defaultCategory = "FLOOD" }) {
    const [title, setTitle] = useState("URGENT EVACUATION & SAFETY DIRECTIVE");
    const [message, setMessage] = useState("Flash flood waters rising rapidly along Vishwamitri low-lying sectors. Proceed immediately to elevated municipal relief shelter.");
    const [severity, setSeverity] = useState(5);
    const [targetAudience, setTargetAudience] = useState("CITIZENS");
    const [selectedChannels, setSelectedChannels] = useState(["SMS", "EMAIL", "PUSH", "WEB_BROADCAST"]);
    const [sending, setSending] = useState(false);
    const [receipt, setReceipt] = useState(null);

    const toggleChannel = (ch) => {
        if (selectedChannels.includes(ch)) {
            if (selectedChannels.length > 1) {
                setSelectedChannels(selectedChannels.filter(c => c !== ch));
            }
        } else {
            setSelectedChannels([...selectedChannels, ch]);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        try {
            setSending(true);
            const result = await notificationService.dispatchAlert({
                title,
                message,
                severity: Number(severity),
                departmentCategory: defaultCategory,
                channels: selectedChannels,
                targetAudience
            });
            setReceipt(result);
        } catch (err) {
            console.error("Failed to broadcast alert", err);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-surface-dark border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header with emergency flashing pulse */}
                <div className="px-6 py-4 bg-gradient-to-r from-red-950 via-surface-darker to-surface-dark border-b border-red-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                            <span className="material-symbols-outlined text-2xl animate-pulse">campaign</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-red-500 text-white font-mono text-[10px] font-bold tracking-wider">
                                    REVERSE 911
                                </span>
                                <span className="font-mono text-xs text-text-muted">MULTI-CHANNEL DISPATCH</span>
                            </div>
                            <h3 className="text-lg font-bold text-text-main">
                                Geofenced Public Broadcast Console
                            </h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-surface-elevated hover:bg-surface-elevated/80 text-text-muted hover:text-text-main flex items-center justify-center transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">close</span>
                    </button>
                </div>

                {receipt ? (
                    <div className="p-6 space-y-4">
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                            <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
                            <div>
                                <h4 className="text-sm font-bold text-emerald-300">Broadcast Dispatched Successfully</h4>
                                <p className="text-xs text-text-muted font-mono">
                                    Dispatch ID: {receipt.dispatchId} • Severity Level {receipt.severity}
                                </p>
                            </div>
                        </div>

                        {receipt.quietHoursOverridden && (
                            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">notifications_paused</span>
                                <span>Quiet-hours active, but successfully <strong>OVERRIDDEN</strong> for critical Level-{receipt.severity} emergency.</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                            {Object.entries(receipt.channelsDispatched || {}).map(([ch, info]) => (
                                <div key={ch} className="p-3 rounded-lg bg-surface-darker border border-border-dark flex items-center justify-between">
                                    <span className="text-text-main font-bold">{ch}</span>
                                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
                                        {info.status || "ACTIVE"}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 text-text-main text-xs font-bold font-mono tracking-wider transition-colors"
                        >
                            CLOSE CONSOLE
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleBroadcast} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                                Alert Directive Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full px-3 py-2 rounded-lg bg-surface-darker border border-border-dark text-text-main text-sm focus:border-red-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                                Broadcast Message (Max 160 chars for SMS compatibility)
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                required
                                className="w-full px-3 py-2 rounded-lg bg-surface-darker border border-border-dark text-text-main text-sm focus:border-red-500 outline-none resize-none"
                            />
                            <div className="flex justify-between text-[11px] font-mono text-text-muted mt-1">
                                <span>Chars: {message.length}/160</span>
                                <span>Encoding: GSM-7 & Unicode UTF-8</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                                    Severity & Priority
                                </label>
                                <select
                                    value={severity}
                                    onChange={(e) => setSeverity(Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg bg-surface-darker border border-border-dark text-text-main text-sm outline-none focus:border-red-500"
                                >
                                    <option value={5}>Level 5 - Catastrophic (Quiet Hours Override)</option>
                                    <option value={4}>Level 4 - Severe (Quiet Hours Override)</option>
                                    <option value={3}>Level 3 - Moderate Warning</option>
                                    <option value={2}>Level 2 - Informational Advisory</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-text-muted uppercase mb-1">
                                    Target Audience
                                </label>
                                <select
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-surface-darker border border-border-dark text-text-main text-sm outline-none focus:border-red-500"
                                >
                                    <option value="CITIZENS">Citizens in Sector Perimeter</option>
                                    <option value="FIRST_RESPONDERS">All Deployed Field Units</option>
                                    <option value="ALL">Agency-wide & All Citizens</option>
                                </select>
                            </div>
                        </div>

                        {/* Channel Toggles */}
                        <div>
                            <label className="block text-xs font-mono text-text-muted uppercase mb-2">
                                Multi-Channel Delivery Pipes
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[
                                    { id: "SMS", label: "Twilio SMS", icon: "sms" },
                                    { id: "EMAIL", label: "SendGrid", icon: "mail" },
                                    { id: "PUSH", label: "FCM Push", icon: "notifications_active" },
                                    { id: "WEB_BROADCAST", label: "Web CAD", icon: "cell_tower" }
                                ].map((ch) => {
                                    const active = selectedChannels.includes(ch.id);
                                    return (
                                        <button
                                            type="button"
                                            key={ch.id}
                                            onClick={() => toggleChannel(ch.id)}
                                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-mono ${
                                                active
                                                    ? "bg-red-500/15 border-red-500 text-red-300 font-bold shadow-sm"
                                                    : "bg-surface-darker border-border-dark text-text-muted opacity-60"
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-lg">{ch.icon}</span>
                                            <span>{ch.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="pt-2 flex items-center justify-end gap-3 border-t border-border-dark">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-border-dark text-text-muted hover:text-text-main text-xs font-mono transition-colors"
                            >
                                CANCEL
                            </button>
                            <button
                                type="submit"
                                disabled={sending}
                                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-red-950/50"
                            >
                                <span className="material-symbols-outlined text-base">podcasts</span>
                                <span>{sending ? "DISPATCHING ALERT..." : "AUTHORIZE EMERGENCY BROADCAST"}</span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
