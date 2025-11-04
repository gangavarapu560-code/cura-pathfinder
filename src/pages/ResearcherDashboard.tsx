import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Microscope, TestTube, Users, MessageSquare, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AddTrialDialog } from "@/components/AddTrialDialog";
import { supabase } from "@/integrations/supabase/client";

interface ResearcherProfile {
  name: string;
  specialty: string;
  interests: string;
  institution: string;
}

const ResearcherDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);
  const [trials, setTrials] = useState<any[]>([]);
  const [isLoadingTrials, setIsLoadingTrials] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const stored = localStorage.getItem("researcherProfile");
      if (!stored) {
        navigate("/researcher/onboarding");
        return;
      }
      setProfile(JSON.parse(stored));
      loadTrials();
    };

    checkAuth();
  }, [navigate]);

  const loadTrials = async () => {
    setIsLoadingTrials(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from("clinical_trials")
          .select("*")
          .eq("researcher_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTrials(data || []);
      }
    } catch (error) {
      console.error("Error loading trials:", error);
    } finally {
      setIsLoadingTrials(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("researcherProfile");
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Microscope className="w-6 h-6 text-accent" />
            <h1 className="text-2xl font-bold">CuraLink</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {profile.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 shadow-soft border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Microscope className="w-5 h-5 text-accent" />
              Your Research Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-base px-4 py-2">
                {profile.specialty}
              </Badge>
              {profile.institution && (
                <Badge variant="outline" className="text-base px-4 py-2">
                  {profile.institution}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="trials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="trials">
              <TestTube className="w-4 h-4 mr-2" />
              Clinical Trials
            </TabsTrigger>
            <TabsTrigger value="collaborators">
              <Users className="w-4 h-4 mr-2" />
              Collaborators
            </TabsTrigger>
            <TabsTrigger value="forums">
              <MessageSquare className="w-4 h-4 mr-2" />
              Forums
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trials">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Manage Clinical Trials</CardTitle>
                <CardDescription>Add and manage your research trials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddTrialDialog onTrialAdded={loadTrials} />
                
                {isLoadingTrials ? (
                  <p className="text-muted-foreground text-center py-8">Loading trials...</p>
                ) : trials.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No trials yet. Add your first clinical trial to get started.
                  </p>
                ) : (
                  <div className="space-y-4 mt-6">
                    {trials.map((trial) => (
                      <Card key={trial.id} className="border-l-4 border-l-accent">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{trial.title}</CardTitle>
                              <CardDescription>{trial.description}</CardDescription>
                            </div>
                            <Badge variant="secondary">{trial.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Phase:</span>{" "}
                              <span className="font-medium">{trial.phase}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Start Date:</span>{" "}
                              <span className="font-medium">
                                {new Date(trial.start_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Contact:</span>{" "}
                              <span className="font-medium">{trial.contact_email}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaborators">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Find Collaborators</CardTitle>
                <CardDescription>Connect with researchers in your field</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>Search Collaborators</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forums">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Forum Discussions</CardTitle>
                <CardDescription>Engage with patient questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button>View Questions</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResearcherDashboard;
