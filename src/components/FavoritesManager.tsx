import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, FileText, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FavoritesManagerProps {
  userType: "patient" | "researcher";
}

export function FavoritesManager({ userType }: FavoritesManagerProps) {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: favData, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Fetch full details for each favorite
      const enrichedFavorites = await Promise.all(
        (favData || []).map(async (fav) => {
          let details = null;
          if (fav.item_type === 'trial') {
            const { data } = await supabase.from('clinical_trials').select('*').eq('id', fav.item_id).single();
            details = data;
          } else if (fav.item_type === 'researcher') {
            const { data } = await supabase.from('researcher_profiles').select('*').eq('id', fav.item_id).single();
            details = data;
          } else if (fav.item_type === 'publication') {
            const { data } = await supabase.from('publications').select('*').eq('id', fav.item_id).single();
            details = data;
          }
          return { ...fav, details };
        })
      );

      setFavorites(enrichedFavorites.filter(f => f.details));
    } catch (error) {
      toast.error("Failed to load favorites");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error("Failed to remove favorite");
      console.error(error);
    }
  };

  const generateSummary = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('summarize-favorites');
      
      if (error) throw error;
      setSummary(data.summary);
      toast.success("Summary generated!");
    } catch (error) {
      toast.error("Failed to generate summary");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading favorites...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              My Favorites ({favorites.length})
            </CardTitle>
            {favorites.length > 0 && (
              <Button
                onClick={generateSummary}
                disabled={isGenerating}
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {favorites.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No favorites yet. Start adding trials, researchers, or publications!
            </p>
          ) : (
            <div className="space-y-3">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="capitalize">
                        {fav.item_type}
                      </Badge>
                      <h4 className="font-medium">
                        {fav.details?.title || fav.details?.name}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {fav.details?.description || fav.details?.specialty || fav.details?.authors}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFavorite(fav.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary for Your Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {summary.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
