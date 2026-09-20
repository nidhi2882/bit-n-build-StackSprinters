import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
    const [identifier, setIdentifier] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 600);
    };

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen relative flex flex-col justify-between overflow-x-hidden">
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.035]"
                style={{
                    backgroundImage: "radial-gradient(#004ac6 1px, transparent 1px), radial-gradient(#004ac6 1px, #faf8ff 1px)",
                    backgroundSize: "40px 40px",
                    backgroundPosition: "0 0, 20px 20px"
                }}
            ></div>

            {/* Header */}
            <header className="relative z-10 w-full px-space-lg py-space-md flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl">emergency_share</span>
                    </div>
                    <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">
                        ResQGrid
                    </span>
                </div>
                <div className="flex items-center gap-space-xs font-label-xs text-label-xs text-on-surface-variant font-medium">
                    <span className="h-2 w-2 rounded-full bg-secondary inline-block"></span>
                    <span>CAD Security Recovery</span>
                </div>
            </header>

            {/* Main Center Card */}
            <main className="relative z-10 w-full flex-1 flex items-center justify-center p-space-md">
                <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-surface-container-high p-space-xl text-center">
                    <div className="h-14 w-14 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-space-md shadow-sm">
                        <span className="material-symbols-outlined text-primary text-3xl">lock_reset</span>
                    </div>

                    <div className="inline-flex items-center gap-space-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-xs text-label-xs uppercase tracking-wider mb-space-sm font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        <span>SECURE CAD RECOVERY</span>
                    </div>

                    <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold mb-space-xs">
                        Reset Security Credentials
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto mb-space-lg">
                        Enter your registered operational email or CAD Officer ID. We'll transmit a secure one-time verification link.
                    </p>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
                            <div className="flex flex-col gap-space-xs text-left">
                                <label className="font-label-md text-label-md text-on-surface flex items-center justify-between" htmlFor="identifier">
                                    <span>Operational Email or Officer ID</span>
                                    <span className="font-code-tabular text-label-xs text-on-surface-variant">REQ-AUTH-V4</span>
                                </label>
                                <div className="relative flex items-center">
                                    <span className="material-symbols-outlined absolute left-3 text-outline pointer-events-none text-xl">
                                        badge
                                    </span>
                                    <input
                                        id="identifier"
                                        type="text"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        required
                                        placeholder="e.g. david.chandler@resqgrid.gov"
                                        className="w-full h-11 pl-10 pr-space-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary border border-surface-container-high transition-all"
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg bg-surface-container p-space-md flex items-start gap-space-sm">
                                <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">
                                    security_update_warning
                                </span>
                                <div className="text-left font-body-sm text-body-sm text-on-surface-variant">
                                    Emergency authorization tokens expire after <span className="font-semibold text-on-surface">15 minutes</span> in strict accordance with disaster protocols.
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 mt-space-xs bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold transition-colors flex items-center justify-center gap-space-xs shadow-md hover:bg-primary/90"
                            >
                                <span className="material-symbols-outlined text-xl">forward_to_inbox</span>
                                <span>{loading ? "Transmitting..." : "Send Reset Link"}</span>
                            </button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center text-center py-space-md animate-in zoom-in-95 duration-200">
                            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mb-space-sm">
                                <span className="material-symbols-outlined text-2xl font-bold">verified</span>
                            </div>
                            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold mb-space-2xs">
                                Transmission Dispatched
                            </h2>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md max-w-xs">
                                Encrypted recovery authorization code dispatched to {identifier || "your email node"}. Confirm receipt within 15 minutes.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="font-label-sm text-label-sm text-primary hover:underline flex items-center gap-1 font-semibold"
                            >
                                <span className="material-symbols-outlined text-base">replay</span>
                                <span>Transmit Again</span>
                            </button>
                        </div>
                    )}

                    <div className="mt-space-lg pt-space-md border-t border-surface-container-high flex flex-col items-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-space-xs font-label-md text-label-md text-primary hover:underline font-semibold"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            <span>Return to Secure Login</span>
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 w-full py-space-sm px-space-md text-center text-on-surface-variant font-label-xs text-label-xs border-t border-surface-container-high/40 bg-surface-container-lowest/50">
                ResQGrid Emergency CAD Command • Version 2.4.0 • Authorized Personnel Only
            </footer>
        </div>
    );
}
