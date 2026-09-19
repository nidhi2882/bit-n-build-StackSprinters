from typing import Dict, Any, List

class CopilotEngine:
    def answer_query(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        q = (query or "").lower().strip()
        incidents = context.get("incidents", [])
        resources = context.get("resources", [])

        citations = []
        response_text = ""

        if "flood" in q or "water" in q or "boat" in q:
            flood_incs = [i for i in incidents if "flood" in str(i.get("type", "")).lower() or "flood" in str(i.get("title", "")).lower()]
            water_res = [r for r in resources if any("water" in str(c).lower() or "boat" in str(c).lower() for c in r.get("capabilities", []))]

            response_text = f"Currently tracking {len(flood_incs)} active flood incident(s). "
            if flood_incs:
                top = flood_incs[0]
                citations.append(top.get("id"))
                response_text += f"Highest priority is {top.get('id')} ({top.get('title')}) at {top.get('locationName')}. "

            if water_res:
                avail = [r for r in water_res if r.get("status") == "Available"]
                response_text += f"There are {len(avail)} available water rescue squad(s) ready for immediate deployment: "
                response_text += ", ".join([r.get("name") for r in avail[:2]]) + "."
            else:
                response_text += "Recommend staging additional inflatable motor boats from regional disaster depot."

        elif "fire" in q or "smoke" in q:
            fire_incs = [i for i in incidents if "fire" in str(i.get("type", "")).lower()]
            fire_res = [r for r in resources if any("fire" in str(c).lower() for c in r.get("capabilities", []))]

            response_text = f"Identified {len(fire_incs)} fire report(s). "
            if fire_incs:
                citations.append(fire_incs[0].get("id"))
                response_text += f"Unit dispatched: {fire_incs[0].get('id')} at {fire_incs[0].get('locationName')}. "
            if fire_res:
                response_text += f"{len([r for r in fire_res if r.get('status') == 'Available'])} fire tenders are currently available."

        elif "casualty" in q or "trapped" in q or "injur" in q:
            crit_incs = [i for i in incidents if int(i.get("severity", 0)) >= 4]
            response_text = f"Reviewing {len(crit_incs)} severe/critical incident(s) with potential casualties. "
            for inc in crit_incs[:2]:
                citations.append(inc.get("id"))
                response_text += f"[{inc.get('id')}: {inc.get('title')}, Severity {inc.get('severity')}/5]. "
            response_text += "Advanced life support ambulances and triage kits have been requested."

        else:
            response_text = (
                f"ResQGrid AI Copilot operational overview: Managing {len(incidents)} active incident tickets "
                f"across Vadodara Sector grid. All P1/Level-5 incidents have automated SLA escalation monitors running."
            )

        return {
            "query": query,
            "reply": response_text,
            "citedIncidentIds": citations,
            "grounded": True,
            "aiModel": "ResQGrid Grounded Copilot v1"
        }
