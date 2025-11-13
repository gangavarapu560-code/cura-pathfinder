import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FavoriteButtonProps {
  itemType: "trial" | "researcher" | "publication";
  itemId: string;
  variant?: "default" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function FavoriteButton({ itemType, itemId, variant = "ghost", size = "sm" }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkFavorite();
  }, [itemId, itemType]);

  const checkFavorite = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .single();

      if (!error && data) {
        setIsFavorited(true);
      }
    } catch (error) {
      // Not favorited
    }
  };

  const toggleFavorite = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to save favorites");
        return;
      }

      if (isFavorited) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('item_type', itemType)
          .eq('item_id', itemId);

        if (error) throw error;
        setIsFavorited(false);
        toast.success("Removed from favorites");
      } else {
        // Add favorite
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            item_type: itemType,
            item_id: itemId
          });

        if (error) throw error;
        setIsFavorited(true);
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error("Failed to update favorites");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleFavorite}
      disabled={isLoading}
    >
      <Star className={`w-4 h-4 ${isFavorited ? 'fill-primary text-primary' : ''}`} />
    </Button>
  );
}
