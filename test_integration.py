import requests
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_analyze_text_only():
    print("Testing /analyze_session with text only...")
    payload = {
        "user_id": "test_user_1",
        "text": "I am feeling really overwhelmed and stressed with all this work."
    }
    
    try:
        response = requests.post(f"{BASE_URL}/analyze_session", data=payload)
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"   Wellbeing Score: {data.get('wellbeing_score')}")
            print(f"   Dominant Emotion: {data.get('dominant_emotion')}")
            print(f"   Recommendation: {data.get('recommendation')}")
            print(f"   Latency: {data.get('processing_time_ms'):.2f}ms")
            return True
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_history():
    print("\nTesting /history endpoint...")
    params = {"user_id": "test_user_1"}
    try:
        response = requests.get(f"{BASE_URL}/history", params=params)
        if response.status_code == 200:
            data = response.json()
            if len(data) > 0:
                print(f"✅ History retrieved! Found {len(data)} sessions.")
                print(f"   Latest session score: {data[0]['wellbeing_score']}")
                return True
            else:
                print("❌ History empty (should have at least 1 record).")
                return False
        else:
            print(f"❌ Failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    # Wait for server to start
    print("Waiting for server to be ready...")
    for _ in range(10):
        try:
            requests.get(BASE_URL)
            break
        except:
            time.sleep(2)
            print(".", end="", flush=True)
    print("\n")

    if test_analyze_text_only():
        test_history()
    else:
        sys.exit(1)
