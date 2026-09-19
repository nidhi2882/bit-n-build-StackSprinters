import re
from typing import Dict, Any, Optional

LIFE_RISK_KEYWORDS = [
    "trapped", "casualty", "casualties", "unconscious", "drowning", "drowned",
    "cardiac", "explosion", "suffocating", "fatal", "critical condition",
    "severe bleeding", "children trapped", "mass casualty", "collapsed on people"
]

HIGH_SEVERITY_KEYWORDS = [
    "rapidly spreading", "heavy smoke", "engulfed", "chemical leak", "toxic gas",
    "ammonia", "pipeline burst", "dam overflow", "high current", "highway collision",
    "multiple cars", "evacuate", "major damage"
]

class SeverityEngine:
    def evaluate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        text = (payload.get("text") or payload.get("description") or "").lower()
        sensor_breach = payload.get("sensorBreach", False)
        duplicate_count = int(payload.get("duplicateCount", 0))
        reported_severity = payload.get("severity")
        is_human_verified = payload.get("isHumanVerified", False)

        # Baseline severity
        base_severity = 3
        justifications = []

        # Check for life-risk keywords
        has_life_risk = any(kw in text for kw in LIFE_RISK_KEYWORDS)
        has_high_risk = any(kw in text for kw in HIGH_SEVERITY_KEYWORDS)

        if has_life_risk:
            base_severity = 5
            justifications.append("Explicit life-risk keywords detected in situational description")
        elif has_high_risk:
            base_severity = 4
            justifications.append("High hazard escalation keywords detected")

        # Factor in sensor breach
        if sensor_breach:
            base_severity = max(base_severity, 5 if has_life_risk or has_high_risk else 4)
            justifications.append("Corroborating IoT telemetry sensor threshold breach confirmed")

        # Corroborating duplicate reports bump urgency
        if duplicate_count >= 3 and base_severity < 5:
            base_severity = min(5, base_severity + 1)
            justifications.append(f"{duplicate_count} corroborating citizen reports merged into incident")

        # Enforce Hard Floor Safety Rule:
        # Critical (Level 5) severity requires a sensor threshold breach, explicit life-risk keyword,
        # or human operator verification — NEVER AI confidence alone!
        if base_severity == 5:
            can_be_level_5 = has_life_risk or sensor_breach or is_human_verified
            if not can_be_level_5:
                base_severity = 4
                justifications.append("Hard Floor Safety Rule enforced: Level 5 capped to Level 4 without sensor breach or confirmed life-risk corroboration")

        # Respect explicit human operator downgrade or upgrade if provided
        if is_human_verified and reported_severity:
            base_severity = reported_severity
            justifications.append("Human operator manual priority verified")

        sla_dispatch_mins = 5 if base_severity == 5 else 15 if base_severity == 4 else 30 if base_severity == 3 else 60
        priority_code = f"P{6 - base_severity}"

        confidence = 0.96 if (has_life_risk or sensor_breach) else 0.89

        return {
            "severity": base_severity,
            "priorityCode": priority_code,
            "targetDispatchSlaMins": sla_dispatch_mins,
            "aiConfidence": confidence,
            "hardFloorSatisfied": has_life_risk or sensor_breach or is_human_verified,
            "justifications": justifications,
            "recommendedEscalation": base_severity >= 4
        }
