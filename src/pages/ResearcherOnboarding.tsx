import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Microscope, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ResearcherOnboarding = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    interests: "",
    institution: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.specialty) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in");
        navigate("/auth");
        return;
      }

      // Save to database
      const { error } = await supabase.from("researcher_profiles").upsert({
        user_id: user.id,
        name: formData.name,
        specialty: formData.specialty,
        interests: formData.interests || null,
        institution: formData.institution || null,
      });

      if (error) throw error;

      // Keep localStorage for backward compatibility
      localStorage.setItem("researcherProfile", JSON.stringify(formData));
      toast.success("Profile created successfully!");
      navigate("/researcher/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Microscope className="w-8 h-8 text-accent" />
              <h1 className="text-3xl font-bold">CuraLink</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Welcome, Researcher</h2>
            <p className="text-muted-foreground">
              Set up your profile to connect with collaborators and patients
            </p>
          </div>

          <Card className="p-8 shadow-soft border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Dr. Jane Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Primary Specialty *</Label>
                <Input
                  id="specialty"
                  placeholder="e.g., Oncology, Neurology, Immunology"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interests">Research Interests</Label>
                <Textarea
                  id="interests"
                  placeholder="e.g., Immunotherapy, Clinical AI, Gene Therapy..."
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  placeholder="University or Research Center"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                Continue to Dashboard
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
          </Card>

          <div className="text-center mt-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearcherOnboarding;
