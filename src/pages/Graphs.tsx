import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { historicalData, defaultThresholds } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Settings, ChevronDown, RefreshCw } from "lucide-react"; // Added ChevronDown and RefreshCw

// --- Filter Options ---
const materialOptions = ["Carbon Steel", "Stainless Steel", "PVC", "HDPE"];
const gradeOptions = [
  "API 5L X42",
  "API 5L X52",
  "API 5L X65",
  "ASTM A106 Grade B",
  "ASTM A333 Grade 6",
];

// --- Small Single-Select Dropdown Component ---
const SingleSelectDropdown = ({ label, options, selected, onChange, widthClass = "w-[120px]" }: { label: string, options: string[], selected: string, onChange: (value: string) => void, widthClass?: string }) => (
    <div className="space-y-0.5"> 
        <Label className="text-xs font-normal text-muted-foreground">{label}</Label> 
        <div className="relative">
            <select 
                value={selected} 
                onChange={(e) => onChange(e.target.value)} 
                className={`p-1 border rounded text-xs appearance-none bg-white ${widthClass}`}
            >
                <option value="">Select All</option>
                {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
        </div>
    </div>
);
// ---------------------------------------------

const Graphs = () => {
  const [thresholds, setThresholds] = useState(defaultThresholds);
  const [showSettings, setShowSettings] = useState(false);
  
  // --- New Filter States ---
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  // -------------------------

  const getLineColor = (value: number, threshold: number) => {
    // Note: This function isn't used to color the line in the current structure, 
    // only used for legend color logic, but kept for completeness.
    if (value >= threshold * 1.1) return "hsl(var(--danger))";
    if (value >= threshold) return "hsl(var(--warning))";
    return "hsl(var(--success))";
  };

  // --- Filtering Logic for Chart Data ---
  const filteredHistoricalData = useMemo(() => {
    let filtered = historicalData;

    // Simulate filtering by material and grade
    if (selectedMaterial) {
        filtered = filtered.filter(d => d.Material === selectedMaterial);
    }
    if (selectedGrade) {
        filtered = filtered.filter(d => d.Grade === selectedGrade);
    }

    return filtered;
  }, [selectedMaterial, selectedGrade]);

  const chartData = filteredHistoricalData.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    pressure: Math.round(d.Max_Pressure_psi),
    temperature: Math.round(d.Temperature_C),
  }));
  // --------------------------------------

  const handleClearFilters = () => {
      setSelectedMaterial("");
      setSelectedGrade("");
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Predictive Intelligence Graphs</h1>
          <p className="text-muted-foreground">Historical trends and real-time monitoring</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowSettings(!showSettings)}
          className="gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* --- Filter Bar Section --- */}
      <div className="flex items-end flex-wrap gap-4 p-2 border rounded-md bg-gray-50/50">
          
          {/* Material Filter */}
          <SingleSelectDropdown
              label="Material Filter"
              options={materialOptions}
              selected={selectedMaterial}
              onChange={setSelectedMaterial}
              widthClass="w-[120px]" 
          />

          {/* Grade Filter */}
          <SingleSelectDropdown
              label="Grade Filter"
              options={gradeOptions}
              selected={selectedGrade}
              onChange={setSelectedGrade}
              widthClass="w-[140px]" 
          />
          
          {/* Action Buttons (Reload/Clear added for consistency) */}
          <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex items-center text-xs p-1 h-auto">
                    <RefreshCw className="h-3 w-3 mr-1" /> Reload
                </Button>
                <Button onClick={handleClearFilters} variant="outline" size="sm" className="text-xs p-1 h-auto">
                    Clear
                </Button>
            </div>
      </div>
      {/* -------------------------- */}


      {showSettings && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Threshold Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="pressure-threshold">Max Pressure (psi)</Label>
              <Input
                id="pressure-threshold"
                type="number"
                value={thresholds.Max_Pressure_psi}
                onChange={(e) =>
                  setThresholds({ ...thresholds, Max_Pressure_psi: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="temp-threshold">Temperature (°C)</Label>
              <Input
                id="temp-threshold"
                type="number"
                value={thresholds.Temperature_C}
                onChange={(e) =>
                  setThresholds({ ...thresholds, Temperature_C: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="corrosion-threshold">Corrosion Impact (%)</Label>
              <Input
                id="corrosion-threshold"
                type="number"
                value={thresholds.Corrosion_Impact_Percent}
                onChange={(e) =>
                  setThresholds({ ...thresholds, Corrosion_Impact_Percent: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </Card>
      )}

      {/* Chart 1: Maximum Pressure */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Maximum Pressure (psi)</h3>
        {chartData.length === 0 ? (
             <div className="h-80 flex items-center justify-center text-muted-foreground">No data available for the selected filters.</div>
        ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pressure"
                    stroke={chartData[chartData.length - 1]?.pressure >= thresholds.Max_Pressure_psi ? "hsl(var(--warning))" : "hsl(var(--success))"}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
        )}
        
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Normal (&lt; {thresholds.Max_Pressure_psi})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span>Warning (≥ {thresholds.Max_Pressure_psi})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span>Critical (≥ {thresholds.Max_Pressure_psi * 1.1})</span>
          </div>
        </div>
      </Card>

      {/* Chart 2: Temperature */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Temperature (°C)</h3>
        {chartData.length === 0 ? (
             <div className="h-80 flex items-center justify-center text-muted-foreground">No data available for the selected filters.</div>
        ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke={chartData[chartData.length - 1]?.temperature >= thresholds.Temperature_C ? "hsl(var(--warning))" : "hsl(var(--success))"}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Normal (&lt; {thresholds.Temperature_C})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span>Warning (≥ {thresholds.Temperature_C})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span>Critical (≥ {thresholds.Temperature_C * 1.1})</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Graphs;