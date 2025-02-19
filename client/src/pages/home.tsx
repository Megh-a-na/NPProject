import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Tower } from "@shared/schema";
import { INDIAN_LOCALITIES, TOWER_COVERAGE_RADIUS_KM } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CoverageVisualization from "@/components/CoverageVisualization";

export default function Home() {
  const [selectedLocality, setSelectedLocality] = useState<string>();
  const [towerCount, setTowerCount] = useState<number>(1);
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
      positionX: number;
      positionY: number;
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

  const handleOptimizePlacement = () => {
    if (!selectedLocality) return;

    toast({
      title: "Optimizing tower placement",
      description: `Calculating optimal positions for ${towerCount} towers in ${
        INDIAN_LOCALITIES.find(l => l.id === selectedLocality)?.name
      }`,
    });

    // Simple grid-based placement strategy
    for (let i = 0; i < towerCount; i++) {
      const gridSize = Math.ceil(Math.sqrt(towerCount));
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;

      const newTower = {
        name: `Tower ${i + 1}`,
        locality: selectedLocality,
        height: 30,
        transmissionPower: 40,
        frequency: 3500,
        antennaGain: 15,
        positionX: (col + 0.5) / gridSize,
        positionY: (row + 0.5) / gridSize,
      };

      createTowerMutation.mutate(newTower);
    }
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

            <Button 
              onClick={handleOptimizePlacement}
              disabled={!selectedLocality}
              className="w-full"
            >
              Optimize Tower Placement
            </Button>
          </CardContent>
        </Card>

        {selectedLocality && (
          <Card>
            <CardHeader>
              <CardTitle>Coverage Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <CoverageVisualization
                locality={INDIAN_LOCALITIES.find(l => l.id === selectedLocality)!}
                towers={towers}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}