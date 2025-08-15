import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "./ui/use-toast";
import { useAuth } from "../hooks/useAuth";
import { UserProfile } from "../types/grocery";
import { User, Calendar, Cake, Heart } from "lucide-react";

export const ProfileEditor = () => {
  const { profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    birth_day: "",
    birth_month: "",
    favorite_cake: "",
    favorite_snacks: "",
    hobbies: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        birth_day: profile.birth_day?.toString() || "",
        birth_month: profile.birth_month?.toString() || "",
        favorite_cake: profile.favorite_cake || "",
        favorite_snacks: profile.favorite_snacks || "",
        hobbies: profile.hobbies || ""
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "No user profile found",
        variant: "destructive"
      });
      return;
    }

    // Validate birthday fields
    const birthDay = parseInt(formData.birth_day);
    const birthMonth = parseInt(formData.birth_month);
    
    if (formData.birth_day && (birthDay < 1 || birthDay > 31)) {
      toast({
        title: "Invalid Birthday",
        description: "Day must be between 1 and 31",
        variant: "destructive"
      });
      return;
    }

    if (formData.birth_month && (birthMonth < 1 || birthMonth > 12)) {
      toast({
        title: "Invalid Birthday",
        description: "Month must be between 1 and 12",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const updates = {
        full_name: formData.full_name || null,
        birth_day: birthDay || null,
        birth_month: birthMonth || null,
        favorite_cake: formData.favorite_cake || null,
        favorite_snacks: formData.favorite_snacks || null,
        hobbies: formData.hobbies || null
      };

      await updateProfile(updates);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
        variant: "default"
      });

      setIsEditing(false);

    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1] || "";
  };

  const formatBirthday = () => {
    if (profile?.birth_day && profile?.birth_month) {
      return `${getMonthName(profile.birth_month)} ${profile.birth_day}`;
    }
    return "Not set";
  };

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          Please log in to edit your profile
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Full Name</Label>
              <p className="mt-1 text-gray-900">{profile.full_name || "Not set"}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Birthday
              </Label>
              <p className="mt-1 text-gray-900">{formatBirthday()}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Cake className="h-4 w-4" />
                Favorite Cake
              </Label>
              <p className="mt-1 text-gray-900">{profile.favorite_cake || "Not set"}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Favorite Snacks</Label>
              <p className="mt-1 text-gray-900">{profile.favorite_snacks || "Not set"}</p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Hobbies
              </Label>
              <p className="mt-1 text-gray-900">{profile.hobbies || "Not set"}</p>
            </div>

            <Button onClick={() => setIsEditing(true)} className="w-full">
              Edit Profile
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="birth_month">Birth Month</Label>
                <Select
                  value={formData.birth_month}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, birth_month: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        {getMonthName(month)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="birth_day">Birth Day</Label>
                <Select
                  value={formData.birth_day}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, birth_day: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="favorite_cake">Favorite Cake</Label>
              <Input
                id="favorite_cake"
                type="text"
                value={formData.favorite_cake}
                onChange={(e) => setFormData(prev => ({ ...prev, favorite_cake: e.target.value }))}
                placeholder="e.g., Chocolate, Vanilla, Red Velvet"
              />
            </div>

            <div>
              <Label htmlFor="favorite_snacks">Favorite Snacks</Label>
              <Input
                id="favorite_snacks"
                type="text"
                value={formData.favorite_snacks}
                onChange={(e) => setFormData(prev => ({ ...prev, favorite_snacks: e.target.value }))}
                placeholder="e.g., Chips, Cookies, Nuts"
              />
            </div>

            <div>
              <Label htmlFor="hobbies">Hobbies</Label>
              <Input
                id="hobbies"
                type="text"
                value={formData.hobbies}
                onChange={(e) => setFormData(prev => ({ ...prev, hobbies: e.target.value }))}
                placeholder="e.g., Reading, Gaming, Cooking"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data
                  if (profile) {
                    setFormData({
                      full_name: profile.full_name || "",
                      birth_day: profile.birth_day?.toString() || "",
                      birth_month: profile.birth_month?.toString() || "",
                      favorite_cake: profile.favorite_cake || "",
                      favorite_snacks: profile.favorite_snacks || "",
                      hobbies: profile.hobbies || ""
                    });
                  }
                }}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
