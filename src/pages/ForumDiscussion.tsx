import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { Heart, ArrowLeft, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

export default function ForumDiscussion() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    if (questionId) {
      loadDiscussion();
    }
  }, [questionId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadDiscussion = async () => {
    setIsLoading(true);
    try {
      const [questionResult, commentsResult] = await Promise.all([
        supabase.from('forum_questions').select('*').eq('id', questionId).single(),
        supabase.from('forum_comments').select('*').eq('question_id', questionId).order('created_at', { ascending: true }),
      ]);

      if (questionResult.error) {
        toast.error("Question not found");
        navigate(-1);
        return;
      }

      setQuestion(questionResult.data);
      setComments(commentsResult.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('forum_comments').insert({
        question_id: questionId,
        user_id: currentUser.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      toast.success("Comment posted!");
      setNewComment("");
      loadDiscussion();
    } catch (error) {
      toast.error("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading discussion...</p>
      </div>
    );
  }

  if (!question) return null;

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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Question */}
        <Card className="mb-6 shadow-soft">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{question.title}</CardTitle>
                <CardDescription className="text-base">{question.content}</CardDescription>
              </div>
              {question.category && (
                <Badge variant="secondary">{question.category}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Posted {new Date(question.created_at).toLocaleDateString()}</span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-semibold">Responses</h2>
          {comments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No responses yet. Be the first to comment!</p>
              </CardContent>
            </Card>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id} className="shadow-sm">
                <CardContent className="pt-6">
                  <p className="text-foreground mb-2">{comment.content}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()} at {new Date(comment.created_at).toLocaleTimeString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Comment Form */}
        {currentUser ? (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Add Your Response</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts, insights, or experiences..."
                  rows={4}
                  required
                />
                <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Posting..." : "Post Response"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-soft">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Sign in to join the discussion</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate("/patient/auth")}>
                  Patient Sign In
                </Button>
                <Button variant="outline" onClick={() => navigate("/researcher/auth")}>
                  Researcher Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
