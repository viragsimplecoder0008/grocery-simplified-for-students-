from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
from datetime import datetime
import json

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from gemini_config import GeminiRecommendationService

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the Gemini service
gemini_service = GeminiRecommendationService()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Gemini Recommendation API',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/gemini-recommendations', methods=['POST'])
def get_recommendations():
    """Get AI-powered grocery recommendations"""
    try:
        # Get user profile from request
        data = request.get_json()
        if not data or 'user_profile' not in data:
            return jsonify({
                'success': False,
                'error': 'User profile is required'
            }), 400
        
        user_profile = data['user_profile']
        
        # Get available products if provided, otherwise use None
        available_products = data.get('available_products', None)
        
        # Validate required fields
        if not user_profile.get('birth_day') or not user_profile.get('birth_month'):
            return jsonify({
                'success': False,
                'error': 'Birthday information is required for recommendations'
            }), 400
        
        # Get recommendations from Gemini
        recommendations = gemini_service.get_birthday_recommendations(user_profile, available_products)
        
        return jsonify(recommendations)
        
    except Exception as e:
        print(f"Error in get_recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/api/test-recommendations', methods=['GET'])
def test_recommendations():
    """Test endpoint with sample data"""
    try:
        # Sample user profile for testing
        sample_profile = {
            'id': 'test-user-123',
            'full_name': 'Test User',
            'birth_day': 15,
            'birth_month': 6,  # June
            'favorite_cake': 'Chocolate Cake',
            'favorite_snacks': 'Cookies, Chips',
            'hobbies': 'Reading, Gaming'
        }
        
        recommendations = gemini_service.get_birthday_recommendations(sample_profile)
        
        return jsonify({
            'test_profile': sample_profile,
            'recommendations': recommendations
        })
        
    except Exception as e:
        print(f"Error in test_recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Test failed: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    print("🚀 Starting Gemini Recommendation API...")
    print("📊 Available endpoints:")
    print("   GET  /api/health - Health check")
    print("   POST /api/gemini-recommendations - Get personalized recommendations")
    print("   GET  /api/test-recommendations - Test with sample data")
    print()
    
    # Check if API key is available
    from gemini_config import GEMINI_API_KEY
    if GEMINI_API_KEY and GEMINI_API_KEY != "your_gemini_api_key_here":
        print("✅ Gemini API key found")
    else:
        print("⚠️  Warning: No Gemini API key found - using fallback responses")
    
    print("\n🌟 Server starting on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
