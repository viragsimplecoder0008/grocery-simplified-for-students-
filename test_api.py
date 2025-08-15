"""
Test script for the Gemini API server
"""

import requests
import json
from datetime import datetime

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get('http://localhost:5000/api/health')
        print(f"Health Check Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_recommendations_endpoint():
    """Test the recommendations endpoint with sample data"""
    try:
        sample_user_profile = {
            'id': 'test-user-123',
            'full_name': 'Test User',
            'birth_day': 25,
            'birth_month': 12,  # December - Christmas birthday
            'favorite_cake': 'Chocolate Cake',
            'favorite_snacks': 'Cookies, Ice Cream',
            'hobbies': 'Reading, Gaming, Cooking'
        }
        
        response = requests.post(
            'http://localhost:5000/api/gemini-recommendations',
            headers={'Content-Type': 'application/json'},
            json={'user_profile': sample_user_profile}
        )
        
        print(f"Recommendations Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Recommendations test failed: {e}")
        return False

def test_sample_endpoint():
    """Test the sample recommendations endpoint"""
    try:
        response = requests.get('http://localhost:5000/api/test-recommendations')
        print(f"Sample Test Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Sample test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Gemini API Server...")
    print("=" * 50)
    
    # Test health endpoint
    print("\n1. Testing Health Endpoint:")
    health_ok = test_health_endpoint()
    
    # Test sample endpoint
    print("\n2. Testing Sample Recommendations:")
    sample_ok = test_sample_endpoint()
    
    # Test recommendations endpoint
    print("\n3. Testing Personalized Recommendations:")
    recommendations_ok = test_recommendations_endpoint()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Health Check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"   Sample Test:  {'✅ PASS' if sample_ok else '❌ FAIL'}")
    print(f"   Recommendations: {'✅ PASS' if recommendations_ok else '❌ FAIL'}")
    
    if all([health_ok, sample_ok, recommendations_ok]):
        print("\n🎉 All tests passed! The API server is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the server logs for more details.")
    
    print("\n💡 Next steps:")
    print("   - Open http://localhost:5147 to test the frontend")
    print("   - Create a user profile with birthday information")
    print("   - Check the AI recommendations on the homepage")
