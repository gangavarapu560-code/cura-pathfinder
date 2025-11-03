import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Microscope, TestTube, Users, MessageSquare, LogOut } from "lucide-react";
import { toast } from "sonner";

interface ResearcherProfile {
  name: string;
  specialty: string;
  interests: string;
  institution: string;
}

const ResearcherDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ResearcherProfile | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("researcherProfile");
    if (!stored) {
      navigate("/researcher/onboarding");
      return;
    }
    setProfile(JSON.parse(stored));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("researcherProfile");
    toast.success("Logged out successfully");
    navigate("/");
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
              <CardContent>
                <Button>Add New Trial</Button>
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
