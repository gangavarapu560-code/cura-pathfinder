import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Heart, MapPin, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const PatientOnboarding = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    condition: "",
    location: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.condition) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Store in localStorage for demo purposes
    localStorage.setItem("patientProfile", JSON.stringify(formData));
    
    toast.success("Profile created successfully!");
    navigate("/patient/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Heart className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">CuraLink</h1>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Welcome, Patient</h2>
            <p className="text-muted-foreground">
              Let's personalize your experience. Tell us about yourself.
            </p>
          </div>

          {/* Form Card */}
          <Card className="p-8 shadow-soft border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="transition-all focus:shadow-glow"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Medical Condition or Symptoms *</Label>
                <Input
                  id="condition"
                  placeholder="e.g., Brain Cancer, Glioma, Heart Disease..."
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  className="transition-all focus:shadow-glow"
                />
                <p className="text-sm text-muted-foreground">
                  Describe your condition in natural language. Our AI will help find relevant information.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location (Optional)
                </Label>
                <Input
                  id="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="transition-all focus:shadow-glow"
                />
                <p className="text-sm text-muted-foreground">
                  Helps us show nearby health experts and clinical trials
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full shadow-soft hover:shadow-glow transition-all"
                size="lg"
              >
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

export default PatientOnboarding;
