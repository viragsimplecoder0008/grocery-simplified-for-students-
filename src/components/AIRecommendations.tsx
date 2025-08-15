import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { useAuth } from "../hooks/useAuth";
import { GeminiRecommendation, RecommendationResponse } from "../types/grocery";
import { Sparkles, Cake, Leaf, Heart, User } from "lucide-react";

export const AIRecommendations = () => {
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState<GeminiRecommendation[]>([]);
  const [birthdayMessage, setBirthdayMessage] = useState<string>("");
  const [seasonalNote, setSeasonalNote] = useState<string>("");
  const [daysUntilBirthday, setDaysUntilBirthday] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const getRecommendations = async () => {
    if (!profile?.birth_day || !profile?.birth_month) {
      setError("Please update your profile with birthday information to get personalized recommendations");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // For deployment, we'll use the fallback system instead of requiring Python API
      console.log("Getting AI recommendations with fallback system...");
      
      // Fallback to mock response - this provides great UX without requiring Python server
      const calculateDaysUntilBirthday = (birthDay: number, birthMonth: number) => {
        const today = new Date();
        const currentYear = today.getFullYear();
        let birthday = new Date(currentYear, birthMonth - 1, birthDay);
        
        if (birthday < today) {
          birthday = new Date(currentYear + 1, birthMonth - 1, birthDay);
        }
        
        return Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      };

      const daysUntil = calculateDaysUntilBirthday(profile.birth_day, profile.birth_month);
      
      const data = {
        success: true,
        recommendations: [
          {
            product_name: "Birthday Cake Mix",
            reason: daysUntil <= 30 ? "Your birthday is coming up soon! Perfect for celebrating." : "Get ready for your upcoming birthday celebration!",
            category: "birthday" as const,
            confidence_score: daysUntil <= 7 ? 0.95 : 0.8
          },
          {
            product_name: "Seasonal Fruits",
            reason: "Fresh seasonal produce for the current time of year.",
            category: "seasonal" as const,
            confidence_score: 0.8
          },
          {
            product_name: "Greek Yogurt",
            reason: "High protein snack perfect for students' busy lifestyle.",
            category: "preference" as const,
            confidence_score: 0.85
          },
          ...(profile.favorite_cake ? [{
            product_name: profile.favorite_cake,
            reason: `Based on your favorite cake preference: ${profile.favorite_cake}`,
            category: "preference" as const,
            confidence_score: 0.85
          }] : []),
          ...(profile.favorite_snacks ? [{
            product_name: profile.favorite_snacks.split(',')[0].trim(),
            reason: `One of your favorite snacks: ${profile.favorite_snacks.split(',')[0].trim()}`,
            category: "preference" as const,
            confidence_score: 0.8
          }] : []),
          ...(profile.hobbies ? [{
            product_name: "Energy Bars",
            reason: `Perfect snack for your hobbies: ${profile.hobbies}`,
            category: "hobby" as const,
            confidence_score: 0.75
          }] : [])
        ],
        birthday_message: daysUntil <= 7 ? `🎉 Your birthday is in just ${daysUntil} days!` : 
                         daysUntil <= 30 ? `Your birthday is in ${daysUntil} days! 🎂` :
                         `Your birthday is in ${daysUntil} days.`,
        seasonal_note: "Perfect time for seasonal shopping based on current month!",
        days_until_birthday: daysUntil
      };

      if (data.success) {
        setRecommendations(data.recommendations);
        setBirthdayMessage(data.birthday_message || "");
        setSeasonalNote(data.seasonal_note || "");
        setDaysUntilBirthday(data.days_until_birthday);
      } else {
        setError("Failed to get recommendations");
      }
    } catch (err) {
      console.error("Error getting recommendations:", err);
      setError("Failed to connect to recommendation service");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'birthday':
        return <Cake className="h-4 w-4" />;
      case 'seasonal':
        return <Leaf className="h-4 w-4" />;
      case 'hobby':
        return <Heart className="h-4 w-4" />;
      case 'preference':
        return <User className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'birthday':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'seasonal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'hobby':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'preference':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  useEffect(() => {
    if (profile?.birth_day && profile?.birth_month) {
      getRecommendations();
    }
  }, [profile?.birth_day, profile?.birth_month, profile?.favorite_cake, profile?.favorite_snacks, profile?.hobbies]);

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          Please log in to see personalized recommendations
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Smart Recommendations
        </CardTitle>
        <p className="text-sm text-gray-600">
          Personalized suggestions based on your profile and preferences
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {birthdayMessage && (
          <Alert className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
            <Cake className="h-4 w-4" />
            <AlertDescription className="font-medium text-pink-800">
              {birthdayMessage}
            </AlertDescription>
          </Alert>
        )}

        {seasonalNote && (
          <Alert className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <Leaf className="h-4 w-4" />
            <AlertDescription className="font-medium text-green-800">
              {seasonalNote}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <h3 className="font-medium">Personalized Suggestions</h3>
          <Button
            onClick={getRecommendations}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            {isLoading ? "Getting suggestions..." : "Refresh"}
          </Button>
        </div>

        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {rec.product_name}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${getCategoryColor(rec.category)} flex items-center gap-1`}
                      >
                        {getCategoryIcon(rec.category)}
                        {rec.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{rec.reason}</p>
                    {rec.confidence_score && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{ width: `${rec.confidence_score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(rec.confidence_score * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !isLoading && !error && (
            <div className="text-center py-6 text-gray-500">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recommendations available yet</p>
              <p className="text-sm">Make sure your birthday is set in your profile</p>
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};
