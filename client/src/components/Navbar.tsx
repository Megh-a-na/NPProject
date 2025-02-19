import { SiNokia } from "react-icons/si";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] h-16 border-b bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto h-full">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center space-x-2">
            <SiNokia className="h-8 w-8 text-[#124191]" />
            <span className="text-xl font-bold text-[#124191]">
              Nokia 5G Planning
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Digital Twin Simulation Platform
          </div>
        </div>
      </div>
    </nav>
  );
}