import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("david.chandler@resqgrid.gov");
    const [password, setPassword] = useState("admin123");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleLogin = async (e) => {
        e?.preventDefault();
        setLoading(true);
        setErrorMessage("");
        try {
            const user = await login({ email, password });
            const role = user?.role || "";
            if (role === "Super Admin" || role === "SUPER_ADMIN") {
                navigate("/");
            } else if (role === "Department Admin" || role === "DEPARTMENT_ADMIN") {
                navigate("/");
            } else if (role === "Citizen" || role === "CITIZEN") {
                navigate("/citizen/home");
            } else {
                navigate("/");
            }
        } catch (err) {
            console.error("Authentication failed", err);
            setErrorMessage(err.response?.data?.message || "Invalid operator credentials or CAD passphrase.");
        } finally {
            setLoading(false);
        }
    };

    const applyCredential = (demoEmail, demoPass) => {
        setEmail(demoEmail);
        setPassword(demoPass);
        setErrorMessage("");
    };

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen relative flex flex-col justify-between overflow-x-hidden">
            {/* Tactical Grid Backdrop */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.035]"
                style={{
                    backgroundImage: "radial-gradient(#004ac6 1px, transparent 1px), radial-gradient(#004ac6 1px, #faf8ff 1px)",
                    backgroundSize: "40px 40px",
                    backgroundPosition: "0 0, 20px 20px"
                }}
            ></div>

            {/* Tactical Topographic / Radar Vector Backdrop */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-30">
                <svg className="w-[850px] h-[850px] text-primary-fixed-dim" fill="none" stroke="currentColor" viewBox="0 0 600 600">
                    <circle cx="300" cy="300" opacity="0.4" r="280" strokeDasharray="4 6" strokeWidth="0.75"></circle>
                    <circle cx="300" cy="300" opacity="0.6" r="220" strokeWidth="0.75"></circle>
                    <circle cx="300" cy="300" opacity="0.5" r="160" strokeDasharray="8 6" strokeWidth="0.75"></circle>
                    <circle cx="300" cy="300" opacity="0.7" r="100" strokeWidth="0.75"></circle>
                    <circle cx="300" cy="300" opacity="0.5" r="40" strokeWidth="0.5"></circle>
                    <path d="M20 300 H580 M300 20 V580" opacity="0.35" strokeDasharray="4 4" strokeWidth="0.75"></path>
                    <path d="M120 180 Q 240 140 380 200 T 520 280" opacity="0.3" strokeWidth="0.75"></path>
                    <path d="M80 360 Q 200 420 340 380 T 480 460" opacity="0.25" strokeWidth="0.75"></path>
                </svg>
            </div>

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
                    <span>Authorized Dispatch Node</span>
                </div>
            </header>

            {/* Main Center Form */}
            <main className="relative z-10 w-full flex-1 flex items-center justify-center p-space-md">
                <div className="flex flex-col w-full items-center justify-center relative py-space-xl">
                    <div className="relative w-full max-w-[480px] bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden z-10 border border-surface-container-high transition-all duration-300">
                        {/* Top Gradient Strip */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary"></div>

                        <div className="px-space-xl pt-space-xl pb-space-lg">
                            {/* Brand Title */}
                            <div className="flex flex-col items-center text-center">
                                <div className="mt-space-xs inline-flex items-center gap-space-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-xs text-label-xs tracking-wider uppercase">
                                    <span className="h-1.5 w-1.5 rounded-full bg-error animate-ping"></span>
                                    <span className="font-code-tabular text-on-surface font-semibold">RESTRICTED ACCESS</span>
                                    <span className="text-outline-variant">•</span>
                                    <span className="font-label-xs text-secondary font-semibold">LEVEL 4 CAD</span>
                                </div>

                                <h1 className="mt-space-md font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                                    Tactical Operations Command
                                </h1>
                                <p className="mt-space-2xs font-body-sm text-body-sm text-on-surface-variant max-w-[340px]">
                                    Enter credentials to access dispatch grid & active incident channels
                                </p>
                            </div>

                            {/* Error Alert */}
                            {errorMessage && (
                                <div className="mt-4 p-3 rounded-lg bg-error-container text-on-error-container text-xs font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">error</span>
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleLogin} className="mt-space-lg space-y-space-md">
                                <div className="flex flex-col gap-1.5 text-left">
                                    <div className="flex items-center justify-between">
                                        <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="cad-email">
                                            Operator Email / CAD ID
                                        </label>
                                        <span className="font-code-tabular text-label-xs text-on-surface-variant">NODE_09</span>
                                    </div>
                                    <div className="relative flex items-center">
                                        <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
                                            badge
                                        </span>
                                        <input
                                            id="cad-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="operator@resqgrid.gov"
                                            className="w-full pl-10 pr-3 py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 text-left">
                                    <div className="flex items-center justify-between">
                                        <label className="font-label-sm text-label-sm text-on-surface font-semibold" htmlFor="cad-pass">
                                            Security Token / Passphrase
                                        </label>
                                        <span className="font-label-xs text-label-xs text-secondary font-medium">RSA-4096 Ready</span>
                                    </div>
                                    <div className="relative flex items-center">
                                        <span className="material-symbols-outlined absolute left-3 text-outline text-[20px] pointer-events-none">
                                            lock
                                        </span>
                                        <input
                                            id="cad-pass"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="••••••••••••"
                                            className="w-full pl-10 pr-10 py-2.5 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container-high transition-all font-code-tabular"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 text-outline hover:text-on-surface transition-colors p-1"
                                        >
                                            <span className="material-symbols-outlined text-[19px]">
                                                {showPassword ? "visibility_off" : "visibility"}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" defaultChecked className="rounded border-outline text-primary focus:ring-primary" />
                                        <span className="font-label-sm text-label-sm text-on-surface-variant">Remember node</span>
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="font-label-sm text-label-sm text-primary hover:underline font-semibold"
                                    >
                                        Forgot passphrase?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 px-4 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-lg shadow-md hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <span>Authenticating CAD Node...</span>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">login</span>
                                            <span>Authenticate & Enter CAD</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Demo Accounts Quick-Select Buttons */}
                            <div className="mt-6 pt-5 border-t border-surface-container-high">
                                <span className="font-label-xs text-label-xs text-on-surface-variant uppercase tracking-wider font-semibold block mb-2 text-center">
                                    Rapid Test Sign-In Credentials
                                </span>
                                <div className="grid grid-cols-2 gap-2 text-left">
                                    <button
                                        type="button"
                                        onClick={() => applyCredential("david.chandler@resqgrid.gov", "admin123")}
                                        className="p-2 rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-xs transition-colors"
                                    >
                                        <div className="font-bold text-primary">Super Admin</div>
                                        <div className="text-[11px] text-on-surface-variant truncate">david.chandler@resqgrid.gov</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => applyCredential("flood.admin@resqgrid.gov", "floodadmin123")}
                                        className="p-2 rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-xs transition-colors"
                                    >
                                        <div className="font-bold text-secondary">Flood Admin</div>
                                        <div className="text-[11px] text-on-surface-variant truncate">flood.admin@resqgrid.gov</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => applyCredential("fire.admin@resqgrid.gov", "fireadmin123")}
                                        className="p-2 rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-xs transition-colors"
                                    >
                                        <div className="font-bold text-error">Fire Admin</div>
                                        <div className="text-[11px] text-on-surface-variant truncate">fire.admin@resqgrid.gov</div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => applyCredential("medical.admin@resqgrid.gov", "medadmin123")}
                                        className="p-2 rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-xs transition-colors"
                                    >
                                        <div className="font-bold text-tertiary">Medical Admin</div>
                                        <div className="text-[11px] text-on-surface-variant truncate">medical.admin@resqgrid.gov</div>
                                    </button>
                                </div>
                                <div className="mt-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => applyCredential("citizen@resqgrid.gov", "citizen123")}
                                        className="w-full py-1.5 px-2 rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-xs transition-colors font-medium text-on-surface"
                                    >
                                        Sign in as <span className="font-bold">Citizen Portal User</span> (citizen@resqgrid.gov)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 w-full py-space-sm px-space-md text-center text-on-surface-variant font-label-xs text-label-xs border-t border-surface-container-high/40 bg-surface-container-lowest/50">
                ResQGrid Emergency CAD Command • Version 2.4.0 • Authorized Personnel Only • All Session Logged
            </footer>
        </div>
    );
}
