import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Tower, InsertTower } from "@shared/schema";
import MapView from "@/components/Map";
import ControlPanel from "@/components/ControlPanel";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [selectedTower, setSelectedTower] = useState<Tower>();
  const { toast } = useToast();

  const { data: towers = [], isLoading } = useQuery<Tower[]>({
    queryKey: ["/api/towers"],
  });

  const createTowerMutation = useMutation({
    mutationFn: async (tower: InsertTower) => {
      const res = await apiRequest("POST", "/api/towers", tower);
      return res.json() as Promise<Tower>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/towers"] });
      setSelectedTower(data);
      toast({
        title: "Tower created",
        description: "The tower has been successfully created.",
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
  };

  const handleTowerUpdate = (updates: Partial<InsertTower>) => {
    if (!selectedTower) return;
    updateTowerMutation.mutate({ id: selectedTower.id, ...updates });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/4 p-4 bg-card overflow-y-auto">
        <ControlPanel tower={selectedTower} onUpdate={handleTowerUpdate} />
      </div>
      <div className="flex-1">
        <MapView
          towers={towers}
          onTowerDrop={handleTowerDrop}
          selectedTower={selectedTower}
        />
      </div>
    </div>
  );
}