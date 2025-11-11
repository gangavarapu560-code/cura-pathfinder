import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Microscope, ArrowLeft, MapPin, Building, Globe, BookOpen, TestTube } from "lucide-react";
import { toast } from "sonner";

export default function ResearcherProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [publications, setPublications] = useState<any[]>([]);
  const [trials, setTrials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadProfile();
    }
  }, [userId]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const [profileResult, publicationsResult, trialsResult] = await Promise.all([
        supabase.from('researcher_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('publications').select('*').eq('researcher_id', userId).order('year', { ascending: false }),
        supabase.from('clinical_trials').select('*').eq('researcher_id', userId).order('created_at', { ascending: false }),
      ]);

      if (profileResult.error) {
        toast.error("Researcher not found");
        navigate(-1);
        return;
      }

      setProfile(profileResult.data);
      setPublications(publicationsResult.data || []);
      setTrials(trialsResult.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">CuraLink</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8 shadow-soft border-accent/20">
          <CardHeader>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2 flex items-center gap-2">
                  <Microscope className="w-8 h-8 text-accent" />
                  {profile.name}
                </CardTitle>
                <div className="space-y-2 text-muted-foreground">
                  {profile.specialty && (
                    <Badge variant="secondary" className="text-base px-4 py-2">
                      {profile.specialty}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.bio && (
              <p className="text-foreground">{profile.bio}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              {profile.institution && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.institution}</span>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Website
                  </a>
                </div>
              )}
            </div>
            {profile.interests && (
              <div>
                <p className="text-sm font-semibold mb-2">Research Interests:</p>
                <p className="text-muted-foreground">{profile.interests}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Publications */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Publications ({publications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {publications.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No publications listed</p>
              ) : (
                <div className="space-y-4">
                  {publications.map((pub) => (
                    <div key={pub.id} className="border-l-2 border-accent pl-4 py-2">
                      <h4 className="font-semibold text-sm mb-1">{pub.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{pub.authors}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline">{pub.journal}</Badge>
                        <Badge variant="outline">{pub.year}</Badge>
                      </div>
                      {pub.url && (
                        <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-block">
                          View Publication →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinical Trials */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Clinical Trials ({trials.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trials.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No clinical trials listed</p>
              ) : (
                <div className="space-y-4">
                  {trials.map((trial) => (
                    <div key={trial.id} className="border-l-2 border-primary pl-4 py-2">
                      <h4 className="font-semibold text-sm mb-1">{trial.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{trial.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Badge>{trial.phase}</Badge>
                        <Badge variant="secondary">{trial.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
