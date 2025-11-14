import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { MessageThread } from "@/components/MessageThread";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Conversation {
  id: string;
  patient_id: string;
  researcher_id: string;
  trial_id: string | null;
  updated_at: string;
  other_user_name?: string;
  trial_title?: string;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      loadConversations();
      const conversationId = searchParams.get('conversation');
      if (conversationId) {
        setSelectedConversation(conversationId);
      }
    }
  }, [userId, searchParams]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
      return;
    }
    setUserId(session.user.id);
  };

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        clinical_trials(title)
      `)
      .or(`patient_id.eq.${userId},researcher_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }

    const enrichedConversations = await Promise.all(
      (data || []).map(async (conv) => {
        const otherUserId = conv.patient_id === userId ? conv.researcher_id : conv.patient_id;
        const isPatient = conv.patient_id === userId;

        const { data: profileData } = await supabase
          .from(isPatient ? 'researcher_profiles' : 'patient_profiles')
          .select('name')
          .eq('user_id', otherUserId)
          .single();

        return {
          ...conv,
          other_user_name: profileData?.name || 'Unknown',
          trial_title: conv.clinical_trials?.[0]?.title,
        };
      })
    );

    setConversations(enrichedConversations);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Messages</h1>
        </div>

        <div className="grid md:grid-cols-[300px,1fr] gap-4">
          <Card className="p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </h2>
            <ScrollArea className="h-[600px]">
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No conversations yet
                </p>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conv) => (
                    <Button
                      key={conv.id}
                      variant={selectedConversation === conv.id ? "secondary" : "ghost"}
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => setSelectedConversation(conv.id)}
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <span className="font-medium">{conv.other_user_name}</span>
                        {conv.trial_title && (
                          <span className="text-xs text-muted-foreground truncate">
                            {conv.trial_title}
                          </span>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>

          <div>
            {selectedConversation ? (
              <MessageThread
                conversationId={selectedConversation}
                currentUserId={userId}
              />
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
