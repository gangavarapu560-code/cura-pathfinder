import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Users, Microscope, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-12 pb-8 text-center">
          {/* 404 Visual */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              404
            </h1>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Page Not Found
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
              Let's get you back on track.
            </p>
          </div>

          {/* Navigation Options */}
          <div className="space-y-4">
            {/* Back Button */}
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
              className="w-full max-w-sm"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-4 max-w-sm mx-auto py-2">
              <div className="flex-1 border-t border-border" />
              <span className="text-sm text-muted-foreground">or choose a portal</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Portal Options */}
            <div className="grid md:grid-cols-3 gap-3 max-w-2xl mx-auto">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-auto py-4 flex-col gap-2"
              >
                <Link to="/">
                  <Home className="h-5 w-5" />
                  <span className="text-sm">Home</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/50"
              >
                <Link to="/patient/auth">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm">Patient Portal</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-auto py-4 flex-col gap-2 hover:bg-accent/5 hover:border-accent/50"
              >
                <Link to="/researcher/auth">
                  <Microscope className="h-5 w-5 text-accent" />
                  <span className="text-sm">Researcher Portal</span>
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
