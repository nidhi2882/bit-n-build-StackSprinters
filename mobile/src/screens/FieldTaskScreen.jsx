import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import offlineStore from "../services/offlineStore";
import locationTracker from "../services/locationTracker";

export default function FieldTaskScreen() {
    const [unitInfo, setUnitInfo] = useState({
        callSign: "NDRF-WTR-01",
        category: "FLOOD",
        personnelCount: 4,
        status: "EN_ROUTE"
    });

    const [activeTask, setActiveTask] = useState({
        incidentId: "INC-2026-001",
        title: "Severe Flash Flood Inundation & Trapped Civilians",
        severity: 5,
        location: "Vishwamitri River Bridge, Sector 4",
        coordinates: "22.3072° N, 73.1812° E",
        casualties: 14
    });

    const [offlineState, setOfflineState] = useState({
        isOnline: true,
        pendingCount: 0
    });

    const [actionLogs, setActionLogs] = useState([]);

    useEffect(() => {
        locationTracker.startTracking(unitInfo.callSign, unitInfo.status);
        const unsubscribe = offlineStore.subscribe((state) => {
            setOfflineState({
                isOnline: state.isOnline,
                pendingCount: state.pendingCount
            });
        });

        return () => {
            locationTracker.stopTracking();
            unsubscribe();
        };
    }, []);

    const handleStatusTransition = (newStatus) => {
        setUnitInfo(prev => ({ ...prev, status: newStatus }));
        locationTracker.updateStatus(newStatus);
        setActionLogs(prev => [
            `[${new Date().toLocaleTimeString()}] Status -> ${newStatus} ${!offlineState.isOnline ? "(Queued Offline)" : "(Synced to CAD)"}`,
            ...prev.slice(0, 15)
        ]);
    };

    const toggleNetwork = () => {
        const nextState = !offlineState.isOnline;
        offlineStore.setOnline(nextState);
        setActionLogs(prev => [
            `[${new Date().toLocaleTimeString()}] Network toggled -> ${nextState ? "ONLINE (Flushing Queue)" : "OFFLINE (Disaster Mesh Mode)"}`,
            ...prev.slice(0, 15)
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#05080d" />

            {/* Tactical Header */}
            <View style={styles.header}>
                <View>
                    <View style={styles.badgeRow}>
                        <View style={styles.callSignBadge}>
                            <Text style={styles.callSignText}>{unitInfo.callSign}</Text>
                        </View>
                        <Text style={styles.categoryText}>{unitInfo.category} COMMAND</Text>
                    </View>
                    <Text style={styles.subTitleText}>{unitInfo.personnelCount} Operators On-Duty</Text>
                </View>

                {/* Network & Offline Status Toggle */}
                <TouchableOpacity
                    style={[styles.networkPill, offlineState.isOnline ? styles.onlinePill : styles.offlinePill]}
                    onPress={toggleNetwork}
                >
                    <Text style={styles.networkText}>
                        {offlineState.isOnline ? "● CAD SYNCED" : `▲ MESH QUEUE (${offlineState.pendingCount})`}
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Active Mission Card */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderLabel}>ACTIVE CAD MISSION</Text>
                        <View style={styles.severityBadge}>
                            <Text style={styles.severityText}>LEVEL {activeTask.severity} CRITICAL</Text>
                        </View>
                    </View>

                    <Text style={styles.missionTitle}>{activeTask.title}</Text>
                    <Text style={styles.metaRow}>📍 {activeTask.location}</Text>
                    <Text style={styles.metaRow}>🌐 Coordinates: {activeTask.coordinates}</Text>
                    <Text style={styles.metaRow}>⚠️ Reported Casualties: {activeTask.casualties} civilians</Text>

                    {/* Mission Status Badge */}
                    <View style={styles.statusBanner}>
                        <Text style={styles.statusBannerLabel}>UNIT STAGE:</Text>
                        <Text style={styles.statusBannerValue}>{unitInfo.status.replace("_", " ")}</Text>
                    </View>
                </View>

                {/* 1-Tap Field Progression Action Buttons */}
                <Text style={styles.sectionTitle}>1-TAP FIELD STATE TRANSITIONS</Text>
                <View style={styles.buttonGrid}>
                    {[
                        { status: "EN_ROUTE", label: "EN ROUTE", color: "#0284c7" },
                        { status: "ON_SCENE", label: "ON SCENE", color: "#16a34a" },
                        { status: "RETURNING", label: "RETURNING", color: "#d97706" },
                        { status: "AVAILABLE", label: "AVAILABLE / CLEAR", color: "#475569" }
                    ].map((btn) => (
                        <TouchableOpacity
                            key={btn.status}
                            style={[
                                styles.actionButton,
                                { borderColor: btn.color },
                                unitInfo.status === btn.status && { backgroundColor: btn.color }
                            ]}
                            onPress={() => handleStatusTransition(btn.status)}
                        >
                            <Text style={[
                                styles.actionButtonText,
                                unitInfo.status === btn.status && { color: "#ffffff", fontWeight: "bold" }
                            ]}>
                                {btn.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Live Breadcrumb & Offline Action Log */}
                <Text style={styles.sectionTitle}>FIELD TELEMETRY AUDIT LOG</Text>
                <View style={styles.logBox}>
                    {actionLogs.length === 0 ? (
                        <Text style={styles.emptyLogText}>GPS breadcrumbs transmitting every 5s...</Text>
                    ) : (
                        actionLogs.map((log, i) => (
                            <Text key={i} style={styles.logText}>{log}</Text>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#05080d"
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: "#0b1320",
        borderBottomWidth: 1,
        borderBottomColor: "#1e293b",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    badgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    callSignBadge: {
        backgroundColor: "#0284c7",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6
    },
    callSignText: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 12,
        fontFamily: "monospace"
    },
    categoryText: {
        color: "#94a3b8",
        fontSize: 11,
        fontWeight: "600"
    },
    subTitleText: {
        color: "#64748b",
        fontSize: 11,
        marginTop: 3
    },
    networkPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1
    },
    onlinePill: {
        backgroundColor: "rgba(34, 197, 94, 0.15)",
        borderColor: "#22c55e"
    },
    offlinePill: {
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        borderColor: "#ef4444"
    },
    networkText: {
        fontSize: 11,
        fontWeight: "bold",
        fontFamily: "monospace",
        color: "#e2e8f0"
    },
    content: {
        padding: 16,
        gap: 16
    },
    card: {
        backgroundColor: "#0f172a",
        borderRadius: 14,
        padding: 18,
        borderWidth: 1,
        borderColor: "#1e293b"
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10
    },
    cardHeaderLabel: {
        fontSize: 11,
        fontFamily: "monospace",
        color: "#0ea5e9",
        fontWeight: "bold"
    },
    severityBadge: {
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.4)"
    },
    severityText: {
        color: "#f87171",
        fontSize: 10,
        fontWeight: "bold"
    },
    missionTitle: {
        color: "#f8fafc",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8
    },
    metaRow: {
        color: "#94a3b8",
        fontSize: 12,
        marginBottom: 4
    },
    statusBanner: {
        marginTop: 12,
        padding: 10,
        backgroundColor: "#1e293b",
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    statusBannerLabel: {
        color: "#94a3b8",
        fontSize: 11,
        fontFamily: "monospace"
    },
    statusBannerValue: {
        color: "#38bdf8",
        fontWeight: "bold",
        fontSize: 13,
        fontFamily: "monospace"
    },
    sectionTitle: {
        color: "#64748b",
        fontSize: 11,
        fontWeight: "bold",
        fontFamily: "monospace",
        letterSpacing: 1
    },
    buttonGrid: {
        gap: 8
    },
    actionButton: {
        paddingVertical: 14,
        borderRadius: 10,
        borderWidth: 1.5,
        alignItems: "center",
        backgroundColor: "#0f172a"
    },
    actionButtonText: {
        color: "#cbd5e1",
        fontSize: 13,
        fontFamily: "monospace",
        fontWeight: "600"
    },
    logBox: {
        backgroundColor: "#080d14",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#1e293b",
        minHeight: 90
    },
    emptyLogText: {
        color: "#475569",
        fontSize: 11,
        fontFamily: "monospace"
    },
    logText: {
        color: "#94a3b8",
        fontSize: 11,
        fontFamily: "monospace",
        marginBottom: 4
    }
});
