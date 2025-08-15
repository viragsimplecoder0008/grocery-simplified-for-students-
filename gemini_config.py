"""
Gemini API Configuration for Grocery Simplified
Birthday-based recommendation system
"""

import os
from datetime import datetime, date
import google.generativeai as genai

# Gemini API Configuration
GEMINI_API_KEY = "AIzaSyDFFD2PgDhh1bcZQPyvKn9sF84w_Nxm6ws"
GEMINI_MODEL = "gemini-1.5-flash"

# Configure the Gemini API
genai.configure(api_key=GEMINI_API_KEY)

class GeminiRecommendationService:
    def __init__(self):
        self.model = genai.GenerativeModel(GEMINI_MODEL)
    
    def get_birthday_recommendations(self, user_profile, available_products=None):
        """
        Generate personalized grocery recommendations based on user's birthday and preferences
        
        Args:
            user_profile (dict): User profile containing birthday, favorite cake flavor, snacks, hobbies
            available_products (list, optional): List of available products in the store
            
        Returns:
            dict: Recommendations with reasoning
        """
        
        # Calculate days until birthday
        today = date.today()
        birthday_this_year = date(today.year, user_profile['birth_month'], user_profile['birth_day'])
        
        if birthday_this_year < today:
            birthday_this_year = date(today.year + 1, user_profile['birth_month'], user_profile['birth_day'])
        
        days_until_birthday = (birthday_this_year - today).days
        
        # Create context for AI recommendations
        season = self._get_season(user_profile['birth_month'])
        zodiac_sign = self._get_zodiac_sign(user_profile['birth_month'], user_profile['birth_day'])
        
        prompt = f"""
        As a personalized grocery shopping assistant, recommend items for a user with the following profile:
        
        User Details:
        - Birthday: {user_profile['birth_month']}/{user_profile['birth_day']}
        - Days until birthday: {days_until_birthday}
        - Favorite cake flavor: {user_profile['favorite_cake']}
        - Favorite snacks: {user_profile['favorite_snacks']}
        - Hobbies: {user_profile['hobbies']}
        - Birth season: {season}
        - Zodiac sign: {zodiac_sign}
        
        Available products: {[product['name'] for product in available_products]}
        
        Please provide:
        1. 5-7 specific product recommendations from the available list
        2. Birthday celebration suggestions (if birthday is within 2 weeks)
        3. Seasonal recommendations based on birth month
        4. Hobby-related food/snack suggestions
        5. Brief reasoning for each recommendation
        
        Format your response as JSON with the following structure:
        {{
            "recommendations": [
                {{
                    "product_name": "Product Name",
                    "reason": "Why this product fits the user's profile",
                    "category": "birthday|seasonal|hobby|preference"
                }}
            ],
            "birthday_message": "Special message if birthday is near",
            "seasonal_note": "Note about seasonal preferences"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            return {
                "success": True,
                "recommendations": response.text,
                "days_until_birthday": days_until_birthday
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "fallback_recommendations": self._get_fallback_recommendations(user_profile, available_products)
            }
    
    def _get_season(self, month):
        """Get season based on birth month"""
        if month in [12, 1, 2]:
            return "Winter"
        elif month in [3, 4, 5]:
            return "Spring"
        elif month in [6, 7, 8]:
            return "Summer"
        else:
            return "Fall"
    
    def _get_zodiac_sign(self, month, day):
        """Get zodiac sign based on birth date"""
        zodiac_dates = [
            (1, 20, "Capricorn"), (2, 19, "Aquarius"), (3, 21, "Pisces"),
            (4, 20, "Aries"), (5, 21, "Taurus"), (6, 21, "Gemini"),
            (7, 23, "Cancer"), (8, 23, "Leo"), (9, 23, "Virgo"),
            (10, 23, "Libra"), (11, 22, "Scorpio"), (12, 22, "Sagittarius")
        ]
        
        for i, (end_month, end_day, sign) in enumerate(zodiac_dates):
            if month < end_month or (month == end_month and day <= end_day):
                return sign
        return "Capricorn"  # Default for late December
    
    def _get_fallback_recommendations(self, user_profile, available_products):
        """Provide basic recommendations if AI fails"""
        recommendations = []
        
        # Birthday cake ingredients if birthday is soon
        days_until = self._calculate_days_until_birthday(user_profile)
        if days_until <= 14:
            cake_ingredients = ["flour", "eggs", "butter", "sugar", "vanilla"]
            for product in available_products:
                if any(ingredient in product['name'].lower() for ingredient in cake_ingredients):
                    recommendations.append({
                        "product_name": product['name'],
                        "reason": f"For birthday cake preparation - {user_profile['favorite_cake']} flavor",
                        "category": "birthday"
                    })
        
        # Snack preferences
        for product in available_products:
            if user_profile['favorite_snacks'].lower() in product['name'].lower():
                recommendations.append({
                    "product_name": product['name'],
                    "reason": f"Matches your favorite snack preference: {user_profile['favorite_snacks']}",
                    "category": "preference"
                })
        
        return recommendations[:5]  # Limit to 5 recommendations
    
    def _calculate_days_until_birthday(self, user_profile):
        """Calculate days until next birthday"""
        today = date.today()
        birthday_this_year = date(today.year, user_profile['birth_month'], user_profile['birth_day'])
        
        if birthday_this_year < today:
            birthday_this_year = date(today.year + 1, user_profile['birth_month'], user_profile['birth_day'])
        
        return (birthday_this_year - today).days

# Initialize the service
gemini_service = GeminiRecommendationService()
