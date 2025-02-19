import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Tower } from "@shared/schema";
import { DISTRICTS } from "@shared/schema";
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
  const [selectedDistrict, setSelectedDistrict] = useState<string>();
  const [towerCount, setTowerCount] = useState<number>(1);
  const [selectedTower, setSelectedTower] = useState<Tower>();
  const { toast } = useToast();

  const { data: towers = [], isLoading } = useQuery<Tower[]>({
    queryKey: ["/api/towers", selectedDistrict],
    enabled: !!selectedDistrict
  });

  const createTowerMutation = useMutation({
    mutationFn: async (tower: {
      name: string;
      district: string;
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
      queryClient.invalidateQueries({ queryKey: ["/api/towers", selectedDistrict] });
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
        .filter(tower => tower.district === selectedDistrict)
        .map(tower => apiRequest("DELETE", `/api/towers/${tower.id}`));
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/towers", selectedDistrict] });
      toast({
        title: "Towers cleared",
        description: "All towers have been removed from this district.",
      });
    },
  });

  const handleOptimizePlacement = async () => {
    if (!selectedDistrict) return;

    // First clear existing towers
    if (towers.length > 0) {
      await clearTowersMutation.mutateAsync();
    }

    toast({
      title: "Optimizing tower placement",
      description: `Finding optimal positions for ${towerCount} towers in ${
        DISTRICTS.find(d => d.id === selectedDistrict)?.name
      }...`,
    });

    // Get optimized tower positions
    const positions = optimizeTowerPlacements(selectedDistrict, towerCount);

    // Create towers at optimized positions
    for (let i = 0; i < positions.length; i++) {
      const newTower = {
        name: `Tower ${i + 1}`,
        district: selectedDistrict,
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
    <div className="container mx-auto p-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>5G Tower Placement Optimizer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="district">Select District</Label>
              <Select
                value={selectedDistrict}
                onValueChange={(value) => {
                  setSelectedDistrict(value);
                  setTowerCount(1);
                }}
              >
                <SelectTrigger id="district">
                  <SelectValue placeholder="Choose a district" />
                </SelectTrigger>
                <SelectContent>
                  {DISTRICTS.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDistrict && (
              <>
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
                    className="flex-1"
                  >
                    Optimize Tower Placement
                  </Button>
                  <Button 
                    onClick={handleClearTowers}
                    disabled={towers.length === 0}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Towers
                  </Button>
                </div>
              </>
            )}

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

        {selectedDistrict && (
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
                district={selectedDistrict}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}