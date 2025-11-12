import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, LogOut, TrendingUp, TestTube, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SearchBar } from "@/components/SearchBar";
import { SearchResults } from "@/components/SearchResults";
import { PatientAIBot } from "@/components/PatientAIBot";

export default function PatientDashboardNew() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [topTrials, setTopTrials] = useState<any[]>([]);
  const [topResearchers, setTopResearchers] = useState<any[]>([]);
  const [topPublications, setTopPublications] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    loadTopContent();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/patient/auth");
      return;
    }

    const { data: dbProfile, error } = await supabase
      .from("patient_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      toast.error("Error loading profile");
    }

    if (dbProfile) {
      setProfile(dbProfile);
    } else {
      navigate("/patient/onboarding");
    }
  };

  const loadTopContent = async () => {
    try {
      const [trialsResult, researchersResult, publicationsResult] = await Promise.all([
        supabase.from('clinical_trials').select('*').eq('status', 'recruiting').order('created_at', { ascending: false }).limit(3),
        supabase.from('researcher_profiles').select('*').order('created_at', { ascending: false }).limit(3),
        supabase.from('publications').select('*').order('year', { ascending: false }).limit(3),
      ]);

      setTopTrials(trialsResult.data || []);
      setTopResearchers(researchersResult.data || []);
      setTopPublications(publicationsResult.data || []);
    } catch (error) {
      toast.error("Failed to load top content");
    }
  };

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('search', {
        body: { query, condition: profile?.condition || '' }
      });

      if (error) throw error;
      setSearchResults(data);
    } catch (error) {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">CuraLink</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {profile.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Profile Summary */}
        <Card className="mb-8 shadow-soft border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-base px-4 py-2">
                Condition: {profile.condition}
              </Badge>
              {profile.location && (
                <Badge variant="outline" className="text-base px-4 py-2">
                  {profile.location}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="mb-8 shadow-soft">
          <CardHeader>
            <CardTitle>Search for Relevant Information</CardTitle>
          </CardHeader>
          <CardContent>
            <SearchBar 
              onSearch={handleSearch} 
              isLoading={isSearching}
              placeholder={`Search trials, researchers, and topics related to ${profile.condition}...`}
            />
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults && (
          <div className="mb-8">
            <SearchResults {...searchResults} />
          </div>
        )}

        {/* Top Content Sections */}
        {!searchResults && (
          <Tabs defaultValue="trials" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trials">
                <TestTube className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Top </span>Trials
              </TabsTrigger>
              <TabsTrigger value="researchers">
                <Users className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Top </span>Researchers
              </TabsTrigger>
              <TabsTrigger value="publications">
                <BookOpen className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Top </span>Readings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trials" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  Top Clinical Trials
                </h2>
              </div>
              {topTrials.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">No trials available yet</CardContent></Card>
              ) : (
                topTrials.map((trial) => (
                  <Card key={trial.id} className="shadow-soft hover:shadow-glow transition-shadow">
                    <CardHeader>
                      <CardTitle className="mb-2">{trial.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-2">{trial.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{trial.phase}</Badge>
                        <Badge variant="secondary">{trial.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="researchers" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-accent" />
                  Top Researchers
                </h2>
              </div>
              {topResearchers.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">No researchers available yet</CardContent></Card>
              ) : (
                topResearchers.map((researcher) => (
                  <Card 
                    key={researcher.id} 
                    className="shadow-soft hover:shadow-glow transition-shadow cursor-pointer"
                    onClick={() => navigate(`/researcher/${researcher.user_id}`)}
                  >
                    <CardHeader>
                      <CardTitle>{researcher.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {researcher.specialty && <Badge variant="secondary">{researcher.specialty}</Badge>}
                        {researcher.institution && <Badge variant="outline">{researcher.institution}</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="publications" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-accent" />
                  Top Research Publications
                </h2>
              </div>
              {topPublications.length === 0 ? (
                <Card><CardContent className="py-12 text-center text-muted-foreground">No publications available yet</CardContent></Card>
              ) : (
                topPublications.map((pub) => (
                  <Card key={pub.id} className="shadow-soft hover:shadow-glow transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{pub.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{pub.authors}</p>
                      <div className="flex items-center gap-2">
                        <Badge>{pub.journal}</Badge>
                        <Badge variant="outline">{pub.year}</Badge>
                      </div>
                      {pub.url && (
                        <Button variant="link" className="p-0 h-auto mt-2" asChild>
                          <a href={pub.url} target="_blank" rel="noopener noreferrer">
                            Read Full Paper →
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      <PatientAIBot />
    </div>
  );
}
