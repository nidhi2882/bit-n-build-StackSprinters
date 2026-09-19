import math
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    if None in (lat1, lon1, lat2, lon2):
        return 999999.0
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class DuplicateMatcher:
    def __init__(self, max_distance_meters: float = 600.0, max_time_minutes: float = 45.0, min_similarity: float = 0.65):
        self.max_distance = max_distance_meters
        self.max_time = max_time_minutes
        self.min_similarity = min_similarity

    def check_duplicate(self, candidate: Dict[str, Any], existing_incidents: List[Dict[str, Any]]) -> Dict[str, Any]:
        cand_lat = candidate.get("lat")
        cand_lng = candidate.get("lng")
        cand_text = candidate.get("text") or candidate.get("title", "")

        best_match = None
        highest_score = 0.0

        for inc in existing_incidents:
            inc_lat = inc.get("lat")
            inc_lng = inc.get("lng")
            inc_text = inc.get("text") or inc.get("title", "")

            # 1. Spatial Signal
            dist_m = haversine_distance_meters(cand_lat, cand_lng, inc_lat, inc_lng)
            if dist_m > self.max_distance:
                continue

            # 2. Semantic Signal (TF-IDF Cosine Similarity)
            vec = TfidfVectorizer().fit_transform([cand_text, inc_text])
            sem_sim = float(cosine_similarity(vec[0:1], vec[1:2])[0][0])

            # 3. Composite Score
            spatial_score = max(0.0, 1.0 - (dist_m / self.max_distance))
            composite = (0.50 * spatial_score) + (0.50 * sem_sim)

            if sem_sim >= self.min_similarity and composite > highest_score:
                highest_score = composite
                best_match = {
                    "matchedIncidentId": inc.get("id"),
                    "matchedTitle": inc.get("title"),
                    "distanceMeters": round(dist_m, 1),
                    "semanticSimilarity": round(sem_sim, 2),
                    "compositeScore": round(composite, 2)
                }

        is_dup = best_match is not None and highest_score >= 0.70
        return {
            "isDuplicate": is_dup,
            "bestMatch": best_match,
            "action": "CONSOLIDATE" if is_dup else "CREATE_NEW_MASTER"
        }
