import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface SearchFiltersType {
  phase?: string;
  status?: string;
  location?: string;
  locationRadius?: number;
  expertise?: string;
  publicationYear?: number;
}

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    const emptyFilters: SearchFiltersType = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const activeFilterCount = Object.keys(filters).filter(
    key => filters[key as keyof SearchFiltersType] !== undefined
  ).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Search Filters</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label>Trial Phase</Label>
            <Select
              value={localFilters.phase}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, phase: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Phase 1">Phase 1</SelectItem>
                <SelectItem value="Phase 2">Phase 2</SelectItem>
                <SelectItem value="Phase 3">Phase 3</SelectItem>
                <SelectItem value="Phase 4">Phase 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trial Status</Label>
            <Select
              value={localFilters.status}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recruiting">Recruiting</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="Enter location"
              value={localFilters.location || ''}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, location: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Location Radius (miles)</Label>
            <Input
              type="number"
              placeholder="e.g., 50"
              value={localFilters.locationRadius || ''}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  locationRadius: parseInt(e.target.value) || undefined,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Researcher Expertise</Label>
            <Input
              placeholder="e.g., oncology"
              value={localFilters.expertise || ''}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, expertise: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Publication Year (minimum)</Label>
            <Input
              type="number"
              placeholder="e.g., 2020"
              value={localFilters.publicationYear || ''}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  publicationYear: parseInt(e.target.value) || undefined,
                })
              }
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} className="flex-1">
              Apply Filters
            </Button>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1"
            >
              Clear
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
