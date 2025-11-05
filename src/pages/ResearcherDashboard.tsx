import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Microscope, TestTube, Users, MessageSquare, LogOut } from "lucide-react";
import { toast } from "sonner";
import { AddTrialDialog } from "@/components/AddTrialDialog";
import { AddQuestionDialog } from "@/components/AddQuestionDialog";
import { CollaboratorCard } from "@/components/CollaboratorCard";
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
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [researchers, setResearchers] = useState<any[]>([]);
  const [isLoadingResearchers, setIsLoadingResearchers] = useState(false);
  const [existingRequestIds, setExistingRequestIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Check database for profile first
      const { data: dbProfile, error } = await supabase
        .from("researcher_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error);
      }

      if (dbProfile) {
        // Profile exists in database, use it
        const profileData = {
          name: dbProfile.name,
          specialty: dbProfile.specialty || "",
          interests: dbProfile.interests || "",
          institution: dbProfile.institution || "",
        };
        setProfile(profileData);
        localStorage.setItem("researcherProfile", JSON.stringify(profileData));
      } else {
        // No profile in database, redirect to onboarding
        navigate("/researcher/onboarding");
        return;
      }

      setCurrentUserId(user.id);
      loadTrials();
      loadQuestions();
      loadResearchers();
      loadCollaborationRequests(user.id);
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

  const loadQuestions = async () => {
    setIsLoadingQuestions(true);
    try {
      const { data, error } = await supabase
        .from("forum_questions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error loading questions:", error);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const loadResearchers = async () => {
    setIsLoadingResearchers(true);
    try {
      const { data, error } = await supabase
        .from("researcher_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResearchers(data || []);
    } catch (error) {
      console.error("Error loading researchers:", error);
    } finally {
      setIsLoadingResearchers(false);
    }
  };

  const loadCollaborationRequests = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("collaboration_requests")
        .select("to_user_id")
        .eq("from_user_id", userId);

      if (error) throw error;
      setExistingRequestIds(data?.map(req => req.to_user_id) || []);
    } catch (error) {
      console.error("Error loading collaboration requests:", error);
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
                {isLoadingResearchers ? (
                  <p className="text-muted-foreground text-center py-8">Loading researchers...</p>
                ) : researchers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No other researchers found yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {researchers.map((researcher) => (
                      <CollaboratorCard
                        key={researcher.id}
                        profile={researcher}
                        currentUserId={currentUserId}
                        existingRequestIds={existingRequestIds}
                        onRequestSent={() => loadCollaborationRequests(currentUserId)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forums">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Forum Discussions</CardTitle>
                <CardDescription>Engage with community questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AddQuestionDialog onQuestionAdded={loadQuestions} />
                
                {isLoadingQuestions ? (
                  <p className="text-muted-foreground text-center py-8">Loading questions...</p>
                ) : questions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No questions yet. Be the first to ask a question!
                  </p>
                ) : (
                  <div className="space-y-4 mt-6">
                    {questions.map((question) => (
                      <Card key={question.id} className="border-l-4 border-l-primary">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <CardTitle className="text-lg">{question.title}</CardTitle>
                              <CardDescription className="line-clamp-2">
                                {question.content}
                              </CardDescription>
                            </div>
                            {question.category && (
                              <Badge variant="outline" className="ml-2">
                                {question.category}
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            Posted {new Date(question.created_at).toLocaleDateString()} at{" "}
                            {new Date(question.created_at).toLocaleTimeString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResearcherDashboard;
