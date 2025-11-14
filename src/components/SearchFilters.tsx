import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export interface SearchFiltersType {
  phase?: string;
  status?: string;
  locationRadius?: number;
  expertise?: string;
  publicationYear?: string;
}

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);

  const handleApply = () => {
    onFiltersChange(localFilters);
  };

  const handleReset = () => {
    const emptyFilters: SearchFiltersType = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
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
                <SelectValue placeholder="Any phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any phase</SelectItem>
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
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="recruiting">Recruiting</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Location Radius (miles)</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[localFilters.locationRadius || 50]}
                onValueChange={(value) =>
                  setLocalFilters({ ...localFilters, locationRadius: value[0] })
                }
                max={500}
                min={10}
                step={10}
              />
              <span className="text-sm text-muted-foreground w-12">
                {localFilters.locationRadius || 50}mi
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Researcher Expertise</Label>
            <Input
              placeholder="e.g., Oncology, Neurology"
              value={localFilters.expertise || ""}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, expertise: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Publication Year</Label>
            <Select
              value={localFilters.publicationYear}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, publicationYear: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Any year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any year</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex-1">
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
