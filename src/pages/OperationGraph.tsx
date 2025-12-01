import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { historicalData as omHistoricalData } from "@/data/mockData"; 
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts"; // Added ReferenceLine
import { Settings, ChevronDown, RefreshCw } from "lucide-react";

// --- Thresholds (UPDATED for Pump Speed and Upper/Lower bounds) ---
const defaultOMThresholds = {
    Pressure_psi: { lower: 40.06, upper: 80.65 },
    Temperature_C: { lower: 30, upper: 100 },
    FlowRate_m3h: { lower: 400, upper: 670 },
    PumpSpeed_rpm: { lower: 1100, upper: 2600.99 }, // Renamed from Vibration
    EnergyConsumption_kWh: { lower: 17, upper: 33 },
};

// --- Filter Options (Using Device IDs) ---
const deviceOptions = ["PUMP-402", "SCADA-101", "COMPR-003", "VALVE-010"]; 

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

const OperationGraph = () => {
  const [thresholds, setThresholds] = useState(defaultOMThresholds);
  const [showSettings, setShowSettings] = useState(false);
  
  const [selectedDevice, setSelectedDevice] = useState<string>(""); 
  const [lastReload, setLastReload] = useState(Date.now());

  const handleReload = () => setLastReload(Date.now());
  const handleClearFilters = () => {
      setSelectedDevice("");
  }

  // --- Filtering Logic for Chart Data (Simulated) ---
  const filteredHistoricalData = useMemo(() => {
    let filtered = omHistoricalData; 

    if (selectedDevice) {
        filtered = filtered.filter(d => d.assetId === selectedDevice);
    }

    return filtered;
  }, [selectedDevice, lastReload]);

  // Prepare chart data for all 5 charts (Vibration replaced by Pump Speed)
  const chartData = filteredHistoricalData.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    pressure: Math.round(d.Max_Pressure_psi),
    temperature: Math.round(d.Temperature_C),
    flowRate: Math.round(d.FlowRate_m3h),
    pumpSpeed: Math.round(d.Pump_Speed_rpm), // Changed from vibration to pumpSpeed
    energy: Math.round(d.EnergyConsumption_kWh * 10) / 10,
  }));

  // --- Reusable Chart Component ---
  const ChartCard = ({ title, dataKey, threshold, unit }: { title: string, dataKey: string, threshold: { lower: number, upper: number }, unit: string }) => {
    const lastValue = chartData[chartData.length - 1]?.[dataKey as keyof typeof chartData[0]] || 0;
    
    // Status Logic: Warning if near threshold (e.g., 5% outside), Critical if outside range
    const isOutOfRange = lastValue > threshold.upper || lastValue < threshold.lower;
    const isNearRange = 
        (lastValue > threshold.upper * 0.95 && lastValue <= threshold.upper) ||
        (lastValue < threshold.lower * 1.05 && lastValue >= threshold.lower);

    const currentStatusColor = isOutOfRange ? "hsl(var(--danger))" : (isNearRange ? "hsl(var(--warning))" : "hsl(var(--success))");

    // Helper for Reference Lines
    const formatThreshold = (val: number) => {
        // Ensure rounding for clean display
        return Math.round(val * 100) / 100;
    };

    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title} ({unit})</h3>
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
                  
                  {/* UPPER THRESHOLD LINE */}
                  <ReferenceLine 
                      y={threshold.upper} 
                      stroke="hsl(var(--danger))" 
                      strokeDasharray="5 5"
                      label={{ value: `Upper Limit: ${formatThreshold(threshold.upper)}`, position: 'top', fill: 'hsl(var(--danger))', fontSize: 12 }}
                  />
                  
                  {/* LOWER THRESHOLD LINE */}
                  <ReferenceLine 
                      y={threshold.lower} 
                      stroke="hsl(var(--danger))" 
                      strokeDasharray="5 5" 
                      label={{ value: `Lower Limit: ${formatThreshold(threshold.lower)}`, position: 'bottom', fill: 'hsl(var(--danger))', fontSize: 12 }}
                  />

                  {/* DATA LINE */}
                  <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={currentStatusColor}
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
            <span>Normal ({formatThreshold(threshold.lower)} &lt; Value &lt; {formatThreshold(threshold.upper)})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span>Warning (Near Threshold)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger" />
            <span>Critical (Value &lt; {formatThreshold(threshold.lower)} or Value &gt; {formatThreshold(threshold.upper)})</span>
          </div>
        </div>
      </Card>
    );
  };
  // -----------------------------------

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Operation Graphs</h1>
          <p className="text-muted-foreground">Historical trends and real-time monitoring for operational assets</p>
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

      {/* --- Filter Bar Section (Device ID only) --- */}
      <div className="flex items-end flex-wrap gap-4 p-2 border rounded-md bg-gray-50/50">
          
          <SingleSelectDropdown
              label="Device ID Filter"
              options={deviceOptions}
              selected={selectedDevice}
              onChange={setSelectedDevice}
              widthClass="w-[140px]" 
          />
          
          <div className="flex items-center space-x-2">
                <Button onClick={handleReload} variant="outline" size="sm" className="flex items-center text-xs p-1 h-auto">
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
          <h3 className="text-lg font-semibold mb-4">Threshold Settings (Upper/Lower)</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* Helper to create input pairs */}
            {Object.entries(thresholds).map(([key, { lower, upper }]) => {
                const labelMap = {
                    Pressure_psi: "Max Pressure (psi)",
                    Temperature_C: "Temperature (°C)",
                    FlowRate_m3h: "Flow Rate (m³/h)",
                    PumpSpeed_rpm: "Pump Speed (RPM)", // Updated Label
                    EnergyConsumption_kWh: "Energy (kWh)",
                };
                const displayLabel = labelMap[key as keyof typeof thresholds] || key;

                const handleThresholdChange = (type: 'lower' | 'upper', value: number) => {
                    setThresholds(prev => ({
                        ...prev,
                        [key]: { ...prev[key as keyof typeof thresholds], [type]: value }
                    }));
                };
                
                return (
                    <div key={key} className="space-y-2">
                        <Label className="font-semibold text-sm">{displayLabel}</Label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label htmlFor={`${key}-lower`} className="text-xs">Lower</Label>
                                <Input
                                    id={`${key}-lower`}
                                    type="number"
                                    value={lower}
                                    onChange={(e) => handleThresholdChange('lower', Number(e.target.value))}
                                />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor={`${key}-upper`} className="text-xs">Upper</Label>
                                <Input
                                    id={`${key}-upper`}
                                    type="number"
                                    value={upper}
                                    onChange={(e) => handleThresholdChange('upper', Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
        </Card>
      )}

      {/* Charts Section (Vibration replaced by Pump Speed) */}
      <ChartCard 
        title="Maximum Pressure" 
        dataKey="pressure" 
        threshold={thresholds.Pressure_psi} 
        unit="psi" 
      />
      <ChartCard 
        title="Temperature" 
        dataKey="temperature" 
        threshold={thresholds.Temperature_C} 
        unit="°C" 
      />
      <ChartCard 
        title="Flow Rate" 
        dataKey="flowRate" 
        threshold={thresholds.FlowRate_m3h} 
        unit="m³/h" 
      />
      <ChartCard 
        title="Pump Speed" // Updated Title
        dataKey="pumpSpeed" // Updated Data Key
        threshold={thresholds.PumpSpeed_rpm} // Updated Threshold Key
        unit="RPM" // Updated Unit
      />
      <ChartCard 
        title="Energy Consumption" 
        dataKey="energy" 
        threshold={thresholds.EnergyConsumption_kWh} 
        unit="kWh" 
      />

    </div>
  );
};

export default OperationGraph;