import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useGroups } from "@/hooks/useGroups";
import { useCurrency } from "@/hooks/useCurrency";
import { useNavigate } from "react-router-dom";
import GroceryHeader from "@/components/GroceryHeader";
import BudgetCard from "@/components/BudgetCard";
import { AIRecommendations } from "@/components/AIRecommendations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, ShoppingCart, Package, Plus, ArrowRight, Crown } from "lucide-react";

const Index = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { currency } = useCurrency();
  const { userGroups, loading: groupsLoading } = useGroups();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !groupsLoading) {
      setLoading(false);
    }
  }, [authLoading, groupsLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const activeGroups = userGroups.filter(group => group.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <GroceryHeader showAddButton={false} />
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your group grocery lists and collaborate with others
          </p>
        </div>

        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Your Groups
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Budget
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              AI Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-6">
            {/* Groups Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeGroups.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Yet</h3>
                      <p className="text-gray-600 mb-4">
                        Join a group or create your own to start collaborative grocery shopping
                      </p>
                      <Button 
                        onClick={() => navigate('/groups')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create or Join Group
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {activeGroups.map((group) => (
                    <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            {group.name}
                          </CardTitle>
                          {group.leader_id === user?.id && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Crown className="w-3 h-3 mr-1" />
                              Leader
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {group.description || "No description"}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{group.member_count || 0} members</span>
                            <span>•</span>
                            <span>Join code: {group.join_code}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button 
                            onClick={() => navigate(`/groups/${group.id}`)}
                            className="flex-1"
                            size="sm"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            View List
                          </Button>
                          <Button 
                            onClick={() => navigate('/groups')}
                            variant="outline"
                            size="sm"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add New Group Card */}
                  <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                      <div 
                        className="text-center py-8"
                        onClick={() => navigate('/groups')}
                      >
                        <Plus className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                        <h3 className="font-medium text-gray-600 mb-2">Create New Group</h3>
                        <p className="text-sm text-gray-500">Start a new collaborative grocery list</p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => navigate('/groups')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage All Groups
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="budget">
            <BudgetCard budget={profile?.budget || 0} />
          </TabsContent>

          <TabsContent value="recommendations">
            <AIRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
