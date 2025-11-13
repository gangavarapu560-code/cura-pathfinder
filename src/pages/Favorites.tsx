import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FavoritesManager } from "@/components/FavoritesManager";

export default function Favorites() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<"patient" | "researcher" | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/");
      return;
    }

    // Check if patient or researcher
    const { data: patientProfile } = await supabase
      .from("patient_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const { data: researcherProfile } = await supabase
      .from("researcher_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (patientProfile) {
      setUserType("patient");
    } else if (researcherProfile) {
      setUserType("researcher");
    } else {
      navigate("/");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const goBack = () => {
    if (userType === "patient") {
      navigate("/patient/dashboard");
    } else {
      navigate("/researcher/dashboard");
    }
  };

  if (!userType) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={goBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">My Favorites</h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <FavoritesManager userType={userType} />
      </div>
    </div>
  );
}
