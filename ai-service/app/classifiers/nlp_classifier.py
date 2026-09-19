import re
from typing import Dict, Any, List
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Category definitions and descriptive corpora for TF-IDF training
TAXONOMY_CORPUS = {
    "CAT_FLOOD": {
        "name": "Flood",
        "keywords": "flood flash flood water level river overflow dam burst inundation submerged drowning waterlogging heavy rains rescue boat marooned trapped rooftop",
        "primaryDept": "Disaster Management, Fire & Rescue",
        "defaultCapabilities": ["WATER_RESCUE", "INFLATABLE_BOAT", "HEAVY_PUMP", "TEMPORARY_SHELTER"],
        "subTypes": [
            {"id": "SUB_FL_FLASH", "name": "Flash Flood Inundation", "keywords": "flash rapid rising sudden current wash away"},
            {"id": "SUB_FL_RIVER", "name": "River / Dam Overflow", "keywords": "river dam reservoir gate water release embankment"},
            {"id": "SUB_FL_URBAN", "name": "Urban Waterlogging", "keywords": "street road waterlogged drainage sewer overflow choke"}
        ]
    },
    "CAT_FIRE": {
        "name": "Fire",
        "keywords": "fire structural flames smoke burning blaze explosion short circuit warehouse factory residential wildfire forest fire cylinder blast",
        "primaryDept": "Fire & Rescue, Hazmat",
        "defaultCapabilities": ["FIRE_ENGINE", "FOAM_TENDER", "LADDER_TRUCK", "BREATHING_APPARATUS"],
        "subTypes": [
            {"id": "SUB_FR_STRUCT", "name": "Structural / Building Fire", "keywords": "building apartment house floor commercial warehouse"},
            {"id": "SUB_FR_WILD", "name": "Wildfire / Forest Fire", "keywords": "forest vegetation brush grass hill tree"},
            {"id": "SUB_FR_INDUS", "name": "Industrial / Chemical Fire", "keywords": "industrial plant chemical factory boiler solvent"}
        ]
    },
    "CAT_MED": {
        "name": "Medical",
        "keywords": "medical emergency heart attack cardiac unconscious bleeding trauma injury casualty casualties mass casualty CPR stroke respiratory epidemic poisoning",
        "primaryDept": "EMS / Ambulance, Hospitals",
        "defaultCapabilities": ["ADVANCED_AMBULANCE", "TRAUMA_TEAM", "ICU_BED_CAPACITY", "TRIAGE_KIT"],
        "subTypes": [
            {"id": "SUB_MD_MASS", "name": "Mass Casualty Incident", "keywords": "mass multiple victims casualties dead injured many people"},
            {"id": "SUB_MD_CRIT", "name": "Individual Critical Medical", "keywords": "single patient person stroke cardiac seizure breathing"}
        ]
    },
    "CAT_TRAFFIC": {
        "name": "Traffic",
        "keywords": "road highway crash collision vehicle accident overturn truck bus car pile up rollover trapped steering extrication traffic jam",
        "primaryDept": "Police, EMS, Highway Safety",
        "defaultCapabilities": ["EXTRICATION_EQUIPMENT", "TRAFFIC_CONTROL", "AMBULANCE", "TOW_TRUCK"],
        "subTypes": [
            {"id": "SUB_TR_COLL", "name": "Multi-Vehicle Highway Collision", "keywords": "highway expressway collision pile up multiple cars"},
            {"id": "SUB_TR_HAZ", "name": "Tanker Rollover (Hazmat)", "keywords": "tanker petrol oil diesel chemical leak spill rollover"}
        ]
    },
    "CAT_HAZMAT": {
        "name": "Hazardous",
        "keywords": "chemical hazmat toxic gas leak ammonia chlorine acid spill radiation odor pungent smell fumes breathing difficulty decontamination",
        "primaryDept": "Hazmat Specialist Unit, Fire & Rescue",
        "defaultCapabilities": ["HAZMAT_SUIT_LEVEL_A", "GAS_DETECTOR", "DECONTAMINATION_UNIT"],
        "subTypes": [
            {"id": "SUB_HZ_GAS", "name": "Toxic Gas Leak", "keywords": "gas ammonia chlorine cylinder valve rupture leak"},
            {"id": "SUB_HZ_SPILL", "name": "Chemical / Acid Spill", "keywords": "acid chemical liquid tank corrosive drain"}
        ]
    },
    "CAT_COLLAPSE": {
        "name": "Infrastructure",
        "keywords": "building collapse structure fall debris rubble concrete slab crane bridge trench cave in trapped under debris",
        "primaryDept": "Urban Search & Rescue (USAR), Engineering",
        "defaultCapabilities": ["SEARCH_DOGS", "CONCRETE_CUTTER", "HEAVY_CRANE", "STRUCTURAL_ENGINEER"],
        "subTypes": [
            {"id": "SUB_CL_BLDG", "name": "Building Collapse", "keywords": "building foundation wall roof collapse"}
        ]
    },
    "CAT_SEISMIC": {
        "name": "Geological",
        "keywords": "earthquake seismic tremor shock landslide mudslide rockfall fault shake ground fissure sinkhole",
        "primaryDept": "Disaster Management, USAR",
        "defaultCapabilities": ["USAR_TEAM", "EARTHMOVER", "GEOLOGICAL_SURVEYOR", "SHELTER_KIT"],
        "subTypes": [
            {"id": "SUB_SM_QUAKE", "name": "Earthquake / Landslide", "keywords": "earthquake landslide rockfall hill slip"}
        ]
    },
    "CAT_STORM": {
        "name": "Storm",
        "keywords": "cyclone hurricane typhoon tornado storm gale wind heavy squall blizzard heatwave lightning uprooted trees",
        "primaryDept": "Disaster Management, Power Utility",
        "defaultCapabilities": ["TREE_TRIMMER", "POWER_RESTORATION_CREW", "EMERGENCY_GENERATOR"],
        "subTypes": [
            {"id": "SUB_ST_CYCL", "name": "Cyclone / Typhoon", "keywords": "cyclone wind gale coastal gust storm surge"}
        ]
    },
    "CAT_UTILITY": {
        "name": "Utility",
        "keywords": "power outage blackout electric wire grid failure transformer burst water main pipeline broken",
        "primaryDept": "Public Utilities Department",
        "defaultCapabilities": ["HIGH_VOLTAGE_CREW", "WATER_REPAIR_CREW", "GENSET_MOBILE"],
        "subTypes": [
            {"id": "SUB_UT_POWER", "name": "Grid Power Blackout", "keywords": "power electricity transformer grid substation"}
        ]
    },
    "CAT_SAR": {
        "name": "Rescue",
        "keywords": "search rescue missing person lost wilderness tracker woods forest well rescue river drowning",
        "primaryDept": "Police, Search & Rescue Volunteers",
        "defaultCapabilities": ["DRONE_THERMAL", "SEARCH_DOGS", "NIGHT_VISION", "ROPE_RESCUE"],
        "subTypes": [
            {"id": "SUB_SR_MISS", "name": "Missing Person / Wilderness", "keywords": "missing child trekker elderly hiker woods"}
        ]
    },
    "CAT_HAZARD": {
        "name": "Environmental",
        "keywords": "oil spill sea beach lake contamination pollution toxic biohazard waste dumping",
        "primaryDept": "Environmental Protection Agency",
        "defaultCapabilities": ["BOOM_BARRIER", "SKIMMER", "CONTAINMENT_VESSEL"],
        "subTypes": [
            {"id": "SUB_HZ_ENV", "name": "Oil Spill / Environmental", "keywords": "oil slick water body beach wildlife"}
        ]
    },
    "CAT_SECURITY": {
        "name": "Security",
        "keywords": "stampede crowd disturbance riot mob violence security VIP threat stampede barricade crush",
        "primaryDept": "Police Department",
        "defaultCapabilities": ["CROWD_CONTROL", "BARRICADES", "TACTICAL_UNIT"],
        "subTypes": [
            {"id": "SUB_SC_CROWD", "name": "Stampede / Crowd Risk", "keywords": "stampede temple rally stadium gate rush"}
        ]
    }
}

class NLPClassifier:
    def __init__(self):
        self.categories = list(TAXONOMY_CORPUS.keys())
        self.corpus_docs = [TAXONOMY_CORPUS[cat]["keywords"] for cat in self.categories]
        self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
        self.category_vectors = self.vectorizer.fit_transform(self.corpus_docs)

    def classify(self, text: str) -> Dict[str, Any]:
        cleaned = text.strip() if text else ""
        if not cleaned:
            return {
                "categoryId": "CAT_MED",
                "categoryName": "Medical",
                "subTypeId": "SUB_MD_CRIT",
                "confidence": 0.50,
                "capabilities": ["ADVANCED_AMBULANCE"],
                "summary": "Unspecified emergency incident reported. Default medical triage assigned."
            }

        text_lower = cleaned.lower()

        # High-Priority Keyword Rules for Emergency Taxonomy Matching
        forced_category_id = None
        if any(w in text_lower for w in ["fire", "blaze", "flames", "burning", "smoke", "fire tender", "fire engine", "short circuit fire", "cylinder blast"]):
            forced_category_id = "CAT_FIRE"
        elif any(w in text_lower for w in ["flood", "waterlogged", "inundation", "drowning", "marooned", "submerged", "flash flood"]):
            forced_category_id = "CAT_FLOOD"
        elif any(w in text_lower for w in ["gas leak", "ammonia", "chlorine", "hazmat", "chemical spill", "acid spill"]):
            forced_category_id = "CAT_HAZMAT"
        elif any(w in text_lower for w in ["building collapse", "roof collapse", "wall collapse", "structural collapse"]):
            forced_category_id = "CAT_COLLAPSE"
        elif any(w in text_lower for w in ["cardiac", "stroke", "bleeding", "ambulance", "unconscious", "heart attack", "medical"]):
            forced_category_id = "CAT_MED"
        elif any(w in text_lower for w in ["crash", "collision", "vehicle accident", "highway accident", "pileup", "overturned truck"]):
            forced_category_id = "CAT_TRAFFIC"
        elif any(w in text_lower for w in ["cyclone", "typhoon", "storm", "high winds", "uprooted tree", "power outage", "blackout", "generator"]):
            forced_category_id = "CAT_STORM"
        elif any(w in text_lower for w in ["missing person", "search and rescue", "lost hiker", "wilderness search"]):
            forced_category_id = "CAT_SAR"

        if forced_category_id and forced_category_id in self.categories:
            category_id = forced_category_id
            best_score = 0.85
        else:
            # Vectorize input and calculate cosine similarity
            text_vec = self.vectorizer.transform([cleaned])
            sims = cosine_similarity(text_vec, self.category_vectors)[0]
            best_idx = int(np.argmax(sims))
            best_score = float(sims[best_idx])
            category_id = self.categories[best_idx]

        cat_meta = TAXONOMY_CORPUS[category_id]

        # Scaled confidence
        confidence = max(0.76, min(0.98, round(0.72 + (best_score * 0.30), 2)))

        # SubType resolution
        sub_type_id = cat_meta["subTypes"][0]["id"]
        sub_type_name = cat_meta["subTypes"][0]["name"]

        for st in cat_meta["subTypes"]:
            st_kws = st["keywords"].split()
            if any(kw in text_lower for kw in st_kws):
                sub_type_id = st["id"]
                sub_type_name = st["name"]
                break

        # Entity Extraction
        entities = self._extract_entities(cleaned)

        summary = f"{cat_meta['name']} emergency ({sub_type_name}) detected with {int(confidence*100)}% AI confidence. "
        if entities.get("trappedCount"):
            summary += f"Urgent: Approx {entities['trappedCount']} individuals reported trapped. "
        if entities.get("casualties"):
            summary += f"Casualties suspected: {entities['casualties']}. "

        return {
            "categoryId": category_id,
            "categoryName": cat_meta["name"],
            "subTypeId": sub_type_id,
            "subTypeName": sub_type_name,
            "confidence": confidence,
            "capabilities": cat_meta["defaultCapabilities"],
            "primaryDepartment": cat_meta["primaryDept"],
            "entities": entities,
            "summary": summary.strip()
        }

    def _extract_entities(self, text: str) -> Dict[str, Any]:
        entities = {}
        # Match trapped numbers e.g. "14 people trapped", "5 residents stranded"
        trapped_match = re.search(r'(\d+)\s+(?:people|citizens|residents|persons|victims)?\s*(?:trapped|stranded|marooned)', text, re.IGNORECASE)
        if trapped_match:
            entities["trappedCount"] = int(trapped_match.group(1))

        casualty_match = re.search(r'(\d+)\s+(?:casualties|injured|dead|fatalities)', text, re.IGNORECASE)
        if casualty_match:
            entities["casualties"] = int(casualty_match.group(1))

        depth_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:feet|ft|meters|m)\s+(?:water|depth|deep)', text, re.IGNORECASE)
        if depth_match:
            entities["waterDepth"] = depth_match.group(0)

        return entities
