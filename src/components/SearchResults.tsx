import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TestTube, Users, MessageSquare, BookOpen, TrendingUp, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FavoriteButton } from "@/components/FavoriteButton";
import { MessagingDialog } from "@/components/MessagingDialog";

interface SearchResult {
  matchScore: number;
  matchReason: string;
}

interface TrialResult extends SearchResult {
  id: string;
  title: string;
  description: string;
  phase: string;
  status: string;
  start_date: string;
}

interface ResearcherResult extends SearchResult {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  institution: string;
  location?: string;
}

interface QuestionResult extends SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface PublicationResult extends SearchResult {
  id: string;
  title: string;
  journal: string;
  year: number;
  authors: string;
}

interface SearchResultsProps {
  trials?: TrialResult[];
  researchers?: ResearcherResult[];
  questions?: QuestionResult[];
  publications?: PublicationResult[];
}

export function SearchResults({ trials, researchers, questions, publications }: SearchResultsProps) {
  const navigate = useNavigate();
  const [messagingOpen, setMessagingOpen] = useState(false);
  const [selectedResearcher, setSelectedResearcher] = useState<any>(null);
  const hasResults = trials?.length || researchers?.length || questions?.length || publications?.length;

  if (!hasResults) {
    return (
      <Card className="shadow-soft">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No results found. Try different search terms.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Clinical Trials */}
      {trials && trials.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <TestTube className="w-6 h-6 text-primary" />
            Clinical Trials ({trials.length})
          </h2>
          <div className="space-y-4">
            {trials.map((trial) => (
              <Card key={trial.id} className="shadow-soft hover:shadow-glow transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{trial.title}</CardTitle>
                      <CardDescription>{trial.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <FavoriteButton itemType="trial" itemId={trial.id} />
                      <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
                        <TrendingUp className="w-3 h-3" />
                        {trial.matchScore}% match
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground italic">{trial.matchReason}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{trial.phase}</Badge>
                      <Badge variant="outline">{trial.status}</Badge>
                    </div>
                    <Button size="sm">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Researchers */}
      {researchers && researchers.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            Researchers ({researchers.length})
          </h2>
          <div className="space-y-4">
            {researchers.map((researcher) => (
              <Card key={researcher.id} className="shadow-soft hover:shadow-glow transition-shadow cursor-pointer"
                    onClick={() => navigate(`/researcher/${researcher.user_id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{researcher.name}</CardTitle>
                      <CardDescription>
                        {researcher.specialty} • {researcher.institution}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setSelectedResearcher(researcher); setMessagingOpen(true); }}>
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Message
                      </Button>
                      <FavoriteButton 
                        itemType="researcher" 
                        itemId={researcher.id}
                      />
                      <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
                        <TrendingUp className="w-3 h-3" />
                        {researcher.matchScore}% match
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground italic">{researcher.matchReason}</p>
                    {researcher.location && (
                      <Badge variant="outline" className="text-sm">
                        <MapPin className="w-3 h-3 mr-1" />
                        {researcher.location}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Forum Questions */}
      {questions && questions.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Forum Discussions ({questions.length})
          </h2>
          <div className="space-y-4">
            {questions.map((question) => (
              <Card key={question.id} className="shadow-soft hover:shadow-glow transition-shadow cursor-pointer"
                    onClick={() => navigate(`/forum/${question.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{question.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{question.content}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
                      <TrendingUp className="w-3 h-3" />
                      {question.matchScore}% match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground italic">{question.matchReason}</p>
                    {question.category && (
                      <Badge variant="outline">{question.category}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Publications */}
      {publications && publications.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-accent" />
            Publications ({publications.length})
          </h2>
          <div className="space-y-4">
            {publications.map((pub) => (
              <Card key={pub.id} className="shadow-soft hover:shadow-glow transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{pub.title}</CardTitle>
                      <CardDescription>{pub.authors}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <FavoriteButton 
                        itemType="publication" 
                        itemId={pub.id}
                      />
                      <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
                        <TrendingUp className="w-3 h-3" />
                        {pub.matchScore}% match
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground italic">{pub.matchReason}</p>
                    <div className="flex items-center gap-2">
                      <Badge>{pub.journal}</Badge>
                      <Badge variant="outline">{pub.year}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedResearcher && (
        <MessagingDialog
          open={messagingOpen}
          onOpenChange={setMessagingOpen}
          recipientId={selectedResearcher.user_id}
          recipientName={selectedResearcher.name}
        />
      )}
    </div>
  );
}
