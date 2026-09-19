import math
from app.duplicates.matcher import haversine_distance_meters, DuplicateMatcher

def test_haversine_distance():
    # Test coordinates from bug report
    # Pair: (22.3040, 73.1905) and (22.3018, 73.1889)
    lat1, lon1 = 22.3040, 73.1905
    lat2, lon2 = 22.3018, 73.1889

    dist_m = haversine_distance_meters(lat1, lon1, lat2, lon2)
    dist_km = dist_m / 1000.0

    print(f"[TEST 1] Distance calculation for ({lat1}, {lon1}) to ({lat2}, {lon2}):")
    print(f"   Computed distance: {dist_m:.2f} meters ({dist_km:.3f} km)")

    assert 250.0 <= dist_m <= 350.0, f"Expected distance ~290-300m, got {dist_m}m"
    print("   [PASS] Distance is between 250m and 350m, not 0!")

def test_hard_category_filter():
    matcher = DuplicateMatcher()
    
    # Flood incident
    cand = {
        "title": "Severe flooding in street",
        "type": "Flood",
        "latitude": 22.3040,
        "longitude": 73.1905
    }

    # Traffic incident 300m away
    existing = [{
        "id": "INC-101",
        "title": "Truck overturned blocking highway",
        "type": "Traffic",
        "latitude": 22.3018,
        "longitude": 73.1889
    }]

    res = matcher.check_duplicate(cand, existing)
    print("\n[TEST 2] Hard Category Filter (Flood vs Traffic at ~295m distance):")
    print(f"   Result: isDuplicate = {res['isDuplicate']}, action = {res['action']}")

    assert res["isDuplicate"] is False, "Traffic and Flood MUST NOT be duplicates!"
    assert res["bestMatch"] is None, "Best match MUST be None for different categories!"
    print("   [PASS] Different categories (Flood vs Traffic) were rejected by Hard Filter!")

if __name__ == "__main__":
    test_haversine_distance()
    test_hard_category_filter()
    print("\nALL UNIT TESTS PASSED SUCCESSFULLY!")
