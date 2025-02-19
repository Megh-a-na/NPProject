import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Tower, InsertTower } from "@shared/schema";
import MapView from "@/components/Map";
import ControlPanel from "@/components/ControlPanel";
import { useToast } from "@/hooks/use-toast";
import { Radio } from "lucide-react";

export default function Home() {
  const [selectedTower, setSelectedTower] = useState<Tower>();
  const { toast } = useToast();

  const { data: towers = [], isLoading } = useQuery<Tower[]>({
    queryKey: ["/api/towers"],
  });

  const createTowerMutation = useMutation({
    mutationFn: async (tower: InsertTower) => {
      const res = await apiRequest("POST", "/api/towers", tower);
      const data = await res.json() as Tower;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/towers"] });
      setSelectedTower(data);
      toast({
        title: "Tower created",
        description: "The tower has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create tower: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateTowerMutation = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<InsertTower> & { id: number }) => {
      const res = await apiRequest("PATCH", `/api/towers/${id}`, updates);
      return res.json() as Promise<Tower>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/towers"] });
      setSelectedTower(data);
      toast({
        title: "Tower updated",
        description: "The tower parameters have been updated.",
      });
    },
  });

  const handleTowerDrop = async (latitude: number, longitude: number) => {
    try {
      const newTower: InsertTower = {
        name: `Tower ${towers.length + 1}`,
        latitude,
        longitude,
        height: 30,
        transmissionPower: 40,
        frequency: 3500,
        antennaGain: 15,
      };
      await createTowerMutation.mutateAsync(newTower);
    } catch (error) {
      console.error('Failed to create tower:', error);
    }
  };

  const handleTowerUpdate = (updates: Partial<InsertTower>) => {
    if (!selectedTower) return;
    updateTowerMutation.mutate({ id: selectedTower.id, ...updates });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'new-tower' }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 bg-card overflow-y-auto">
        <div className="mb-4">
          <div
            draggable
            onDragStart={handleDragStart}
            className="inline-flex items-center gap-2 p-3 bg-primary text-primary-foreground rounded-lg cursor-move hover:opacity-90 transition-opacity"
          >
            <Radio className="w-5 h-5" />
            <span>Drag to add tower</span>
          </div>
        </div>
        <ControlPanel tower={selectedTower} onUpdate={handleTowerUpdate} />
      </div>
      <div className="flex-1">
        <MapView
          towers={towers}
          onTowerDrop={handleTowerDrop}
          selectedTower={selectedTower}
          onSelectTower={setSelectedTower}
        />
      </div>
    </div>
  );
}