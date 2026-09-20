import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function SosConfirmationPage() {
    const [searchParams] = useSearchParams();
    const cadId = searchParams.get("cad") || "SOS-2026-99";
    const [secondsLeft, setSecondsLeft] = useState(252); // ~4m 12s

    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    };

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between">
            <header className="w-full bg-surface-container-lowest border-b border-surface-container-high px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <span className="font-headline-sm text-base font-bold text-on-surface">
                        ResQGrid SOS Telemetry Gateway
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-xs font-code-tabular font-bold">
                        ACTIVE SOS DISPATCH
                    </span>
                </div>
            </header>

            <main className="max-w-md w-full mx-auto px-4 py-8 text-center">
                <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-2xl border border-surface-container-high space-y-6">
                    {/* Animated Beacon */}
                    <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-40"></span>
                        <div className="w-24 h-24 rounded-full bg-error-container text-error flex items-center justify-center shadow-xl ring-4 ring-error/20">
                            <span className="material-symbols-outlined text-5xl animate-pulse">crisis_alert</span>
                        </div>
                    </div>

                    <div>
                        <span className="px-3 py-1 rounded-full bg-secondary-container text-secondary text-xs font-bold font-code-tabular uppercase tracking-wider">
                            CAD DISPATCH CONFIRMED
                        </span>
                        <h1 className="font-headline-lg text-2xl font-bold text-on-surface mt-2">
                            First Responders En Route
                        </h1>
                        <p className="text-xs text-on-surface-variant mt-1">
                            Your high-priority emergency packet has been accepted by central dispatch.
                        </p>
                    </div>

                    {/* Countdown Box */}
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high">
                        <span className="text-xs text-on-surface-variant font-semibold uppercase">
                            Estimated First Unit Arrival
                        </span>
                        <div className="font-display-lg text-4xl font-bold text-error font-code-tabular my-1">
                            {formatTime(secondsLeft)}
                        </div>
                        <span className="text-[11px] text-on-surface-variant font-code-tabular">
                            CAD Incident: <strong className="text-primary">{cadId}</strong>
                        </span>
                    </div>

                    {/* Survival Instructions */}
                    <div className="text-left bg-surface-container-low p-4 rounded-xl space-y-2 text-xs">
                        <span className="font-bold text-on-surface block">Immediate Life Safety Protocol:</span>
                        <div className="flex items-start gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm text-secondary">check</span>
                            <span>Remain at your current location unless immediate danger forces relocation.</span>
                        </div>
                        <div className="flex items-start gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm text-secondary">check</span>
                            <span>Keep your phone line free. Dispatcher may call for entry instructions.</span>
                        </div>
                        <div className="flex items-start gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm text-secondary">check</span>
                            <span>If floodwater rising, signal from roof or window with bright cloth or flashlight.</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2">
                        <a
                            href="tel:112"
                            className="w-full py-3 bg-error text-on-error font-bold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-error/90 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">call</span>
                            <span>Emergency Call: 112</span>
                        </a>

                        <Link
                            to={`/citizen/status/${cadId}`}
                            className="w-full py-2.5 bg-surface-container text-on-surface font-semibold text-xs rounded-xl hover:bg-surface-container-high transition-colors block text-center"
                        >
                            View Incident Tracker & Map
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="w-full py-3 text-center text-xs text-on-surface-variant border-t border-surface-container-high/40">
                ResQGrid Emergency CAD • Public Safety Node
            </footer>
        </div>
    );
}
