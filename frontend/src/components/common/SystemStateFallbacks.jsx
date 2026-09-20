import React from "react";
import { Link } from "react-router-dom";

export function ConnectionDegradedBanner({ onRetry }) {
    return (
        <div className="w-full bg-error-container/80 text-on-error-container px-space-md py-space-xs border-b border-error/30 flex items-center justify-between text-xs font-semibold backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-error animate-ping"></span>
                <span className="material-symbols-outlined text-sm text-error">wifi_off</span>
                <span>CAD Telemetry Connection Degraded • Running on local cached buffer</span>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-2 py-0.5 rounded bg-error text-on-error text-[11px] font-bold hover:bg-error/90 transition-colors"
                >
                    Reconnect CAD
                </button>
            )}
        </div>
    );
}

export function SectorAllClearEmptyState({ title = "Sector Operational All Clear", message = "No pending or critical incidents reported in this department jurisdiction." }) {
    return (
        <div className="w-full bg-surface-container-lowest rounded-2xl p-12 text-center flex flex-col items-center justify-center border border-surface-container-high shadow-sm my-4">
            <div className="w-16 h-16 rounded-2xl bg-secondary-container/40 text-secondary flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl">verified_user</span>
            </div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-1">
                {title}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-6">
                {message}
            </p>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-xs font-code-tabular text-on-surface-variant font-medium">
                <span className="h-2 w-2 rounded-full bg-secondary"></span>
                <span>All units standing by • Grid telemetry 100% synchronized</span>
            </div>
        </div>
    );
}

export function RestrictedAccessBarrier({ requiredRole = "Department or Super Admin" }) {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-surface-container-lowest rounded-2xl p-8 text-center shadow-xl border border-surface-container-high">
                <div className="w-16 h-16 rounded-2xl bg-error-container text-error flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-4xl">gpp_maybe</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-error-container text-error text-[11px] font-code-tabular font-bold tracking-wider uppercase mb-2 inline-block">
                    403 ACCESS RESTRICTED
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">
                    CAD Node Authorization Required
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
                    This operational console is scoped to {requiredRole}. Your current operator credentials do not possess clearance for this grid precinct.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold shadow-md hover:bg-primary/90 transition-all"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Return to Authorized Dashboard</span>
                </Link>
            </div>
        </div>
    );
}
