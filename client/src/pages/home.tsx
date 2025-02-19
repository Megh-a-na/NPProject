import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Tower } from "@shared/schema";
import { INDIAN_LOCALITIES } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import { optimizeTowerPlacements } from "@/lib/site-optimization";
import MapView from "@/components/Map";

export default function Home() {
  const [selectedLocality, setSelectedLocality] = useState<string>();
  const [towerCount, setTowerCount] = useState<number>(1);
  const [selectedTower, setSelectedTower] = useState<Tower>();
  const { toast } = useToast();

  const { data: towers = [], isLoading } = useQuery<Tower[]>({
    queryKey: ["/api/towers", selectedLocality],
    enabled: !!selectedLocality
  });

  const createTowerMutation = useMutation({
    mutationFn: async (tower: {
      name: string;
      locality: string;
      height: number;
      transmissionPower: number;
      frequency: number;
      antennaGain: number;
      latitude: number;
      longitude: number;
    }) => {
      const res = await apiRequest("POST", "/api/towers", tower);
      const data = await res.json() as Tower;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/towers", selectedLocality] });
      toast({
        title: "Tower placement optimized",
        description: "The towers have been placed for optimal coverage.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to optimize tower placement: " + error.message,
        variant: "destructive",
      });
    },
  });

  const clearTowersMutation = useMutation({
    mutationFn: async () => {
      const promises = towers
        .filter(tower => tower.locality === selectedLocality)
        .map(tower => apiRequest("DELETE", `/api/towers/${tower.id}`));
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/towers", selectedLocality] });
      toast({
        title: "Towers cleared",
        description: "All towers have been removed from this locality.",
      });
    },
  });

  const handleOptimizePlacement = async () => {
    if (!selectedLocality) return;

    // First clear existing towers
    if (towers.length > 0) {
      await clearTowersMutation.mutateAsync();
    }

    toast({
      title: "Optimizing tower placement",
      description: `Finding optimal positions for ${towerCount} towers in ${
        INDIAN_LOCALITIES.find(l => l.id === selectedLocality)?.name
      }...`,
    });

    // Get optimized tower positions
    const positions = optimizeTowerPlacements(selectedLocality, towerCount);

    // Create towers at optimized positions
    for (let i = 0; i < positions.length; i++) {
      const newTower = {
        name: `Tower ${i + 1}`,
        locality: selectedLocality,
        height: 30,
        transmissionPower: 40,
        frequency: 3500,
        antennaGain: 15,
        latitude: positions[i].latitude,
        longitude: positions[i].longitude,
      };

      await createTowerMutation.mutateAsync(newTower);
    }
  };

  const handleClearTowers = () => {
    clearTowersMutation.mutate();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>5G Tower Placement Optimizer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="locality">Select Locality</Label>
              <Select
                value={selectedLocality}
                onValueChange={setSelectedLocality}
              >
                <SelectTrigger id="locality">
                  <SelectValue placeholder="Choose a locality" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_LOCALITIES.map((locality) => (
                    <SelectItem key={locality.id} value={locality.id}>
                      {locality.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="towerCount">Number of Towers</Label>
              <Input
                id="towerCount"
                type="number"
                min={1}
                max={10}
                value={towerCount}
                onChange={(e) => setTowerCount(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleOptimizePlacement}
                disabled={!selectedLocality}
                className="flex-1"
              >
                Optimize Tower Placement
              </Button>
              <Button 
                onClick={handleClearTowers}
                disabled={!selectedLocality || towers.length === 0}
                variant="destructive"
              >
                <Trash2 className="w-4 h-4" />
                Clear Towers
              </Button>
            </div>

            {towers.length > 0 && (
              <div className="mt-4 space-y-2 border-t pt-4">
                <h3 className="font-medium">Tower Locations:</h3>
                <div className="space-y-2">
                  {towers.map((tower) => (
                    <div key={tower.id} className="text-sm">
                      <strong>{tower.name}</strong>: {Number(tower.latitude).toFixed(4)}°N, {Number(tower.longitude).toFixed(4)}°E
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedLocality && (
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle>Coverage Map</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-5rem)]">
              <MapView
                towers={towers}
                onTowerDrop={(lat, lon) => {}}
                selectedTower={selectedTower}
                onSelectTower={setSelectedTower}
                locality={selectedLocality}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}