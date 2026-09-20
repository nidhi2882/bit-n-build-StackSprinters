import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { reportService } from "../../services/reportService";
import { useAuth } from "../../context/AuthContext";

export default function CitizenReportPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();

    const initialCat = searchParams.get("category") || "FLOOD";

    const [category, setCategory] = useState(initialCat);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState(4);
    const [locationName, setLocationName] = useState("Vishwamitri River Basin, Vadodara");
    const [lat, setLat] = useState(22.3100);
    const [lng, setLng] = useState(73.1800);
    const [reporterName, setReporterName] = useState(user?.name || "Aarav Patel");
    const [reporterPhone, setReporterPhone] = useState(user?.phone || "+91 97234 11223");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLat(pos.coords.latitude);
                    setLng(pos.coords.longitude);
                },
                (err) => console.warn("GPS lookup deferred", err)
            );
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg("");

        try {
            const reportPayload = {
                title: title || `${category} Emergency Call`,
                category,
                type: category,
                description,
                severity: parseInt(severity) || 4,
                locationName,
                lat,
                lng,
                reporterName,
                reporterPhone,
                reporterRole: "Citizen"
            };

            const created = await reportService.submitReport(reportPayload);
            const cadId = created?.id || `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
            navigate(`/citizen/status/${cadId}`);
        } catch (err) {
            console.error("Submission failed", err);
            setErrorMsg(err.response?.data?.message || "Failed to submit emergency report");
        } finally {
            setSubmitting(false);
        }
    };

    const categories = [
        "FLOOD", "FIRE", "MEDICAL", "CRASH", "HAZMAT", "COLLAPSE", "CYCLONE", "SEARCH_RESCUE", "POLICE"
    ];

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
            {/* Header */}
            <header className="sticky top-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-b border-surface-container-high px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link to="/citizen/home" className="text-on-surface-variant hover:text-on-surface flex items-center gap-1 font-semibold text-sm">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            <span>Cancel</span>
                        </Link>
                    </div>
                    <span className="font-headline-sm text-base font-bold text-on-surface">
                        Citizen CAD Intake Form
                    </span>
                    <a href="tel:112" className="text-xs font-bold text-error flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">phone</span>
                        <span>112</span>
                    </a>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8">
                <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-surface-container-high p-6 md:p-8">
                    <div className="mb-6">
                        <span className="px-2.5 py-0.5 rounded-full bg-error-container text-error font-code-tabular text-xs font-bold tracking-wider uppercase">
                            OFFICIAL DISPATCH INTAKE
                        </span>
                        <h1 className="font-headline-lg text-2xl font-bold text-on-surface mt-2">
                            Report Emergency Incident
                        </h1>
                        <p className="text-xs md:text-sm text-on-surface-variant mt-1">
                            Your report enters directly into the municipal emergency dispatch grid. All submissions are monitored in real time.
                        </p>
                    </div>

                    {errorMsg && (
                        <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs font-semibold mb-4">
                            {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Emergency Category */}
                        <div>
                            <label className="text-xs font-bold text-on-surface block mb-1.5">
                                Emergency Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface font-semibold text-sm border border-surface-container-high focus:ring-2 focus:ring-primary"
                            >
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Incident Title */}
                        <div>
                            <label className="text-xs font-bold text-on-surface block mb-1.5">
                                What is happening? (Brief Summary)
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="E.g., Rising flood water stranded family on second floor"
                                className="w-full h-11 px-3 rounded-lg bg-surface-container-low text-on-surface text-sm border border-surface-container-high focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Detailed Description */}
                        <div>
                            <label className="text-xs font-bold text-on-surface block mb-1.5">
                                Detailed Incident Description & Casualties
                            </label>
                            <textarea
                                rows={4}
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe current status, number of persons injured or trapped, visible hazards, gas smell, power lines down..."
                                className="w-full p-3 rounded-lg bg-surface-container-low text-on-surface text-sm border border-surface-container-high focus:ring-2 focus:ring-primary"
                            ></textarea>
                        </div>

                        {/* Severity Selector */}
                        <div>
                            <label className="text-xs font-bold text-on-surface block mb-1.5">
                                Perceived Severity Level
                            </label>
                            <div className="grid grid-cols-5 gap-1.5">
                                {[1, 2, 3, 4, 5].map((sev) => (
                                    <button
                                        key={sev}
                                        type="button"
                                        onClick={() => setSeverity(sev)}
                                        className={`py-2 rounded-lg text-xs font-bold font-code-tabular transition-all ${
                                            severity === sev
                                                ? sev >= 4
                                                    ? "bg-error text-on-error shadow-md"
                                                    : "bg-primary text-on-primary shadow-md"
                                                : "bg-surface-container-low text-on-surface hover:bg-surface-container border border-surface-container-high"
                                        }`}
                                    >
                                        Level {sev}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Location Details */}
                        <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high space-y-3">
                            <span className="text-xs font-bold text-on-surface block">
                                Location & Geolocation Coordinates
                            </span>
                            <div>
                                <label className="text-[11px] text-on-surface-variant block mb-1">Landmark / Street Address</label>
                                <input
                                    type="text"
                                    required
                                    value={locationName}
                                    onChange={(e) => setLocationName(e.target.value)}
                                    className="w-full h-9 px-2.5 rounded bg-surface-container-lowest text-xs text-on-surface border border-surface-container-high"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs font-code-tabular text-on-surface-variant">
                                <div>Lat: {lat.toFixed(5)}</div>
                                <div>Lng: {lng.toFixed(5)}</div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-on-surface block mb-1">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    value={reporterName}
                                    onChange={(e) => setReporterName(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container-high"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-on-surface block mb-1">Contact Phone</label>
                                <input
                                    type="text"
                                    required
                                    value={reporterPhone}
                                    onChange={(e) => setReporterPhone(e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container-high font-code-tabular"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 bg-error hover:bg-error/90 text-on-error font-label-md text-sm font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {submitting ? (
                                <span>Transmitting CAD Report...</span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">emergency</span>
                                    <span>Transmit Official Emergency Report</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
