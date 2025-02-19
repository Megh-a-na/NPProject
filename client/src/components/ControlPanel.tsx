import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTowerSchema } from "@shared/schema";
import type { Tower, InsertTower } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface ControlPanelProps {
  tower?: Tower;
  onUpdate: (data: Partial<InsertTower>) => void;
}

export default function ControlPanel({ tower, onUpdate }: ControlPanelProps) {
  const form = useForm<InsertTower>({
    resolver: zodResolver(insertTowerSchema),
    defaultValues: tower ? {
      name: tower.name,
      latitude: Number(tower.latitude),
      longitude: Number(tower.longitude),
      height: Number(tower.height),
      transmissionPower: Number(tower.transmissionPower),
      frequency: Number(tower.frequency),
      antennaGain: Number(tower.antennaGain),
    } : {
      name: "",
      latitude: 0,
      longitude: 0,
      height: 30,
      transmissionPower: 40,
      frequency: 3500,
      antennaGain: 15,
    },
  });

  if (!tower) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Drop a tower on the map to begin</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tower Parameters</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onChange={form.handleSubmit((data) => onUpdate(data))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height (m)</FormLabel>
                  <FormControl>
                    <Slider
                      min={10}
                      max={100}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transmissionPower"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transmission Power (dBm)</FormLabel>
                  <FormControl>
                    <Slider
                      min={20}
                      max={60}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency (MHz)</FormLabel>
                  <FormControl>
                    <Slider
                      min={700}
                      max={6000}
                      step={100}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="antennaGain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Antenna Gain (dBi)</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={30}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}