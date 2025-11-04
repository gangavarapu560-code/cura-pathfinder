import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CollaboratorCardProps {
  profile: {
    id: string;
    user_id: string;
    name: string;
    specialty: string | null;
    institution: string | null;
    interests: string | null;
  };
  currentUserId: string;
  existingRequestIds: string[];
  onRequestSent: () => void;
}

export function CollaboratorCard({ 
  profile, 
  currentUserId, 
  existingRequestIds,
  onRequestSent 
}: CollaboratorCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasExistingRequest = existingRequestIds.includes(profile.user_id);
  const isOwnProfile = profile.user_id === currentUserId;

  const handleSendRequest = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("collaboration_requests").insert({
        from_user_id: currentUserId,
        to_user_id: profile.user_id,
        message: message || null,
        status: "pending",
      });

      if (error) throw error;

      toast.success(`Collaboration request sent to ${profile.name}!`);
      setShowDialog(false);
      setMessage("");
      onRequestSent();
    } catch (error: any) {
      console.error("Error sending request:", error);
      if (error.code === "23505") {
        toast.error("You already have a request with this researcher");
      } else {
        toast.error("Failed to send request. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">{profile.name}</CardTitle>
              {profile.specialty && (
                <Badge variant="secondary">{profile.specialty}</Badge>
              )}
            </div>
            {!isOwnProfile && (
              <Button
                size="sm"
                onClick={() => setShowDialog(true)}
                disabled={hasExistingRequest}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {hasExistingRequest ? "Requested" : "Connect"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {profile.institution && (
            <CardDescription>
              <strong>Institution:</strong> {profile.institution}
            </CardDescription>
          )}
          {profile.interests && (
            <CardDescription>
              <strong>Interests:</strong> {profile.interests}
            </CardDescription>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Collaboration Request</DialogTitle>
            <DialogDescription>
              Send a collaboration request to {profile.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you'd like to collaborate..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSendRequest} disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
