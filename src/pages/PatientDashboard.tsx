import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, TestTube, BookOpen, Users, Star, MapPin, Calendar, LogOut } from "lucide-react";
import { toast } from "sonner";

interface PatientProfile {
  name: string;
  condition: string;
  location: string;
}

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("patientProfile");
    if (!stored) {
      navigate("/patient/onboarding");
      return;
    }
    setProfile(JSON.parse(stored));
    
    const storedFavorites = localStorage.getItem("favorites");
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, [navigate]);

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    toast.success(favorites.includes(id) ? "Removed from favorites" : "Added to favorites");
  };

  const handleLogout = () => {
    localStorage.removeItem("patientProfile");
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (!profile) return null;

  // Mock data based on condition
  const mockTrials = [
    {
      id: "trial-1",
      title: "Phase III Clinical Trial for Advanced Glioblastoma Treatment",
      phase: "Phase III",
      status: "Recruiting",
      location: "Multiple Sites, USA",
      description: "Study of novel immunotherapy combined with standard care for patients with recurrent glioblastoma."
    },
    {
      id: "trial-2",
      title: "Targeted Therapy for Brain Cancer - Early Stage",
      phase: "Phase II",
      status: "Recruiting",
      location: "Boston, MA",
      description: "Investigating effectiveness of targeted molecular therapy in early-stage brain cancer patients."
    }
  ];

  const mockExperts = [
    {
      id: "expert-1",
      name: "Dr. Sarah Mitchell",
      specialty: "Neuro-Oncology",
      institution: "Johns Hopkins Hospital",
      location: "Baltimore, MD",
      publications: 127
    },
    {
      id: "expert-2",
      name: "Dr. James Chen",
      specialty: "Brain Cancer Research",
      institution: "Mayo Clinic",
      location: "Rochester, MN",
      publications: 89
    }
  ];

  const mockPublications = [
    {
      id: "pub-1",
      title: "Novel Immunotherapy Approaches in Glioblastoma: A Comprehensive Review",
      journal: "Nature Medicine",
      year: "2024",
      authors: "Mitchell S, et al."
    },
    {
      id: "pub-2",
      title: "Targeted Molecular Therapy for Recurrent Brain Tumors",
      journal: "The Lancet Oncology",
      year: "2024",
      authors: "Chen J, et al."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
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
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile.location}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="trials" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="trials">
              <TestTube className="w-4 h-4 mr-2" />
              Clinical Trials
            </TabsTrigger>
            <TabsTrigger value="experts">
              <Users className="w-4 h-4 mr-2" />
              Health Experts
            </TabsTrigger>
            <TabsTrigger value="publications">
              <BookOpen className="w-4 h-4 mr-2" />
              Publications
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="w-4 h-4 mr-2" />
              Favorites
            </TabsTrigger>
          </TabsList>

          {/* Clinical Trials */}
          <TabsContent value="trials" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Clinical Trials for You</h2>
              <Button variant="outline">Filter Trials</Button>
            </div>
            {mockTrials.map((trial) => (
              <Card key={trial.id} className="shadow-soft hover:shadow-glow transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{trial.title}</CardTitle>
                      <CardDescription>{trial.description}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(trial.id)}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          favorites.includes(trial.id) ? "fill-accent text-accent" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge>{trial.phase}</Badge>
                    <Badge variant="secondary">{trial.status}</Badge>
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {trial.location}
                    </Badge>
                  </div>
                  <Button className="w-full sm:w-auto">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Health Experts */}
          <TabsContent value="experts" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Health Experts</h2>
              <Button variant="outline">Search Experts</Button>
            </div>
            {mockExperts.map((expert) => (
              <Card key={expert.id} className="shadow-soft hover:shadow-glow transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{expert.name}</CardTitle>
                      <CardDescription>
                        {expert.specialty} • {expert.institution}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(expert.id)}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          favorites.includes(expert.id) ? "fill-accent text-accent" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {expert.location}
                    </Badge>
                    <Badge variant="secondary">{expert.publications} Publications</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button>View Profile</Button>
                    <Button variant="outline">Request Meeting</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Publications */}
          <TabsContent value="publications" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Relevant Publications</h2>
              <Button variant="outline">Search Publications</Button>
            </div>
            {mockPublications.map((pub) => (
              <Card key={pub.id} className="shadow-soft hover:shadow-glow transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{pub.title}</CardTitle>
                      <CardDescription>{pub.authors}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(pub.id)}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          favorites.includes(pub.id) ? "fill-accent text-accent" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge>{pub.journal}</Badge>
                    <Badge variant="outline">
                      <Calendar className="w-3 h-3 mr-1" />
                      {pub.year}
                    </Badge>
                  </div>
                  <Button variant="outline">Read Full Paper</Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Favorites */}
          <TabsContent value="favorites">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Your Favorites</CardTitle>
                <CardDescription>
                  Items you've saved for later review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No favorites yet. Start exploring and save items you're interested in!</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">You have {favorites.length} saved items</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;
