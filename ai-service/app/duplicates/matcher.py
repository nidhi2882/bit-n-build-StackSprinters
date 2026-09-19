import math
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    if None in (lat1, lon1, lat2, lon2):
        return 999999.0
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(float(lat1))
    phi2 = math.radians(float(lat2))
    delta_phi = math.radians(float(lat2) - float(lat1))
    delta_lambda = math.radians(float(lon2) - float(lon1))

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def normalize_category(cat_str: Any) -> str:
    if not cat_str:
        return ""
    return str(cat_str).strip().lower().replace("cat_", "").replace("_", "").replace("-", "")

class DuplicateMatcher:
    def __init__(self, max_distance_meters: float = 1500.0, max_time_minutes: float = 45.0, min_similarity: float = 0.65):
        self.max_distance = max_distance_meters
        self.max_time = max_time_minutes
        self.min_similarity = min_similarity

    def check_duplicate(self, candidate: Dict[str, Any], existing_incidents: List[Dict[str, Any]]) -> Dict[str, Any]:
        cand_lat = candidate.get("lat") if candidate.get("lat") is not None else candidate.get("latitude")
        cand_lng = candidate.get("lng") if candidate.get("lng") is not None else candidate.get("longitude")
        cand_text = candidate.get("text") or candidate.get("description") or candidate.get("title") or ""
        cand_type = normalize_category(candidate.get("type") or candidate.get("category") or candidate.get("emergencyCategory"))

        best_match = None
        highest_score = 0.0

        for inc in existing_incidents:
            if inc.get("isMerged", False):
                continue

            inc_type = normalize_category(inc.get("type") or inc.get("category") or inc.get("emergencyCategory"))

            # HARD FILTER: Incidents from different emergency categories (e.g. Flood vs Traffic vs Fire) must NEVER be duplicates
            if cand_type and inc_type and cand_type != inc_type:
                continue

            inc_lat = inc.get("lat") if inc.get("lat") is not None else inc.get("latitude")
            inc_lng = inc.get("lng") if inc.get("lng") is not None else inc.get("longitude")
            inc_text = inc.get("text") or inc.get("description") or inc.get("title") or ""

            # 1. Spatial Signal
            dist_m = haversine_distance_meters(cand_lat, cand_lng, inc_lat, inc_lng)
            if dist_m > self.max_distance:
                continue

            # 2. Semantic Signal (TF-IDF Cosine Similarity)
            sem_sim = 0.5
            try:
                if cand_text.strip() and inc_text.strip():
                    vec = TfidfVectorizer().fit_transform([cand_text, inc_text])
                    sem_sim = float(cosine_similarity(vec[0:1], vec[1:2])[0][0])
            except Exception:
                # Simple word overlap fallback
                w1 = set(cand_text.lower().split())
                w2 = set(inc_text.lower().split())
                if w1 and w2:
                    sem_sim = len(w1.intersection(w2)) / float(max(1, len(w1.union(w2))))

            # 3. Composite Score (Spatial 50% + Semantic 50%)
            spatial_score = max(0.0, 1.0 - (dist_m / self.max_distance))
            composite = (0.50 * spatial_score) + (0.50 * sem_sim)

            if composite > highest_score:
                highest_score = composite
                dist_km = round(dist_m / 1000.0, 3)
                best_match = {
                    "matchedIncidentId": inc.get("id"),
                    "matchedTitle": inc.get("title"),
                    "distanceMeters": round(dist_m, 1),
                    "distanceKm": dist_km,
                    "spatialScore": round(spatial_score, 2),
                    "semanticSimilarity": round(sem_sim, 2),
                    "compositeScore": round(composite, 2)
                }

        is_dup = best_match is not None and highest_score >= 0.60
        return {
            "isDuplicate": is_dup,
            "bestMatch": best_match,
            "action": "CONSOLIDATE" if is_dup else "CREATE_NEW_MASTER"
        }
