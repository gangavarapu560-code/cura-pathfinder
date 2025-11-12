import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Microscope, Heart, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => navigate("/patient/auth")}>
            Patient Sign In
          </Button>
          <Button variant="ghost" onClick={() => navigate("/researcher/auth")}>
            Researcher Sign In
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          {/* Logo & Title */}
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 mb-4">
              <Heart className="w-10 h-10 text-primary" />
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CuraLink
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Connecting patients and researchers to discover relevant clinical trials, 
              publications, and health experts
            </p>
          </div>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mt-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            {/* Patient Card */}
            <div 
              className="group relative bg-card rounded-2xl p-8 shadow-soft hover:shadow-glow transition-all duration-300 cursor-pointer border border-border hover:border-primary/50"
              onClick={() => navigate("/patient/onboarding")}
            >
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">I am a Patient</h2>
                <p className="text-muted-foreground mb-6">
                  Find clinical trials, connect with health experts, and discover 
                  relevant research for your condition
                </p>
                <Button 
                  className="w-full group-hover:shadow-glow transition-shadow"
                  size="lg"
                >
                  Get Started
                  <Sparkles className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Researcher Card */}
            <div 
              className="group relative bg-card rounded-2xl p-8 shadow-soft hover:shadow-glow transition-all duration-300 cursor-pointer border border-border hover:border-accent/50"
              onClick={() => navigate("/researcher/auth")}
            >
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Microscope className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-semibold mb-3">I am a Researcher</h2>
                <p className="text-muted-foreground mb-6">
                  Connect with collaborators, manage clinical trials, and engage 
                  with patients seeking answers
                </p>
                <Button 
                  variant="outline"
                  className="w-full border-accent/50 hover:bg-accent hover:text-accent-foreground group-hover:shadow-glow transition-all"
                  size="lg"
                >
                  Researcher Portal
                  <Microscope className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
