import { useState, useMemo } from "react";
import KPICard from "@/components/Dashboard/KPICard";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"; 
import {
  Tag, 
  Clock, 
  Thermometer, 
  Activity, 
  Zap, 
  Gauge, 
  Settings, 
  RefreshCw,
  Calendar,
  Waves, // For Vibration
  Hammer, // For Maintenance
  ChevronDown,
} from "lucide-react";

// --- Mock Data and Thresholds (Include multiple devices for filter mock) ---
const mockOMDataList = [
    { assetId: "PUMP-402", LastTimestamp: "10:30:45", Pressure_psi: 65.2, FlowRate_m3h: 620.1, Temperature_C: 55.0, Vibration_mm_s: 3.5, EnergyConsumption_kWh: 30.5, ValveStatus: "CLOSED", RunTime_Hours: 1250, MaintenanceDue_Days: 75, AlarmsTriggered: 12, PredictedCondition: "NORMAL" },
    { assetId: "SCADA-101", LastTimestamp: "16:52:02", Pressure_psi: 54.35, FlowRate_m3h: 554.43, Temperature_C: 48.9, Vibration_mm_s: 2.1, EnergyConsumption_kWh: 25.43, ValveStatus: "OPEN", RunTime_Hours: 800, MaintenanceDue_Days: 30, AlarmsTriggered: 384, PredictedCondition: "CRITICAL" },
    { assetId: "COMPR-003", LastTimestamp: "11:00:00", Pressure_psi: 90.0, FlowRate_m3h: 750.0, Temperature_C: 70.0, Vibration_mm_s: 5.5, EnergyConsumption_kWh: 50.0, ValveStatus: "OPEN", RunTime_Hours: 2000, MaintenanceDue_Days: 10, AlarmsTriggered: 5, PredictedCondition: "WARNING" },
];

const thresholds = {
    Pressure: 80,
    Temperature: 60,
    Vibration: 5.0,
    Energy: 40,
    Alarms: 50,
    MaintenanceDue: 30, // Days
};

const deviceOptions = mockOMDataList.map(d => d.assetId);

// --- Custom Components ---

// Date/Time Filter Component (Small size)
const DateTimeFilter = ({ date, time, onDateChange, onTimeChange }: any) => (
  <div className="flex space-x-1.5 items-center">
    <div className="relative">
      <input 
          type="date" 
          value={date} 
          onChange={(e) => onDateChange(e.target.value)} 
          className="p-1 border rounded text-xs w-[110px]" 
      />
    </div>
    <div className="flex items-center space-x-1">
        <span className="text-muted-foreground">—</span>
        <div className="relative">
            <input 
                type="time" 
                value={time} 
                onChange={(e) => onTimeChange(e.target.value)} 
                className="p-1 border rounded text-xs w-[75px]" 
            />
        </div>
    </div>
  </div>
);

// Predicted Condition Badge
const ConditionBadge = ({ condition }: { condition: string }) => {
    const color = condition === 'CRITICAL' ? 'bg-red-600' : 
                  condition === 'WARNING' ? 'bg-yellow-500' : 'bg-green-600';
    return (
        <div className={`p-1 px-3 text-xs font-semibold text-white rounded-md ${color} shadow-sm`}>
            {condition.toUpperCase()}
        </div>
    );
}

// Single-Select Dropdown Component (Used for Device ID)
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

// Utility function to determine status based on thresholds
const getStatus = (value: number, threshold: number, isCriticalHigh: boolean): "normal" | "warning" | "critical" => {
    if (isCriticalHigh) {
        if (value >= threshold * 1.1) return "critical";
        if (value >= threshold) return "warning";
    } else { // E.g., Maintenance Due (low is bad)
         if (value <= threshold * 0.5) return "critical";
         if (value <= threshold) return "warning";
    }
    return "normal";
};

// --- Main Component ---

const OperationMaintenanceDashboard = () => {
    const [selectedDate, setSelectedDate] = useState<string>('2025-11-14'); 
    const [selectedTime, setSelectedTime] = useState<string>('10:30'); 
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>("SCADA-101"); // Defaulting to SCADA-101 based on image
    const [lastReload, setLastReload] = useState(Date.now()); 
    
    // Placeholder URL for ADX Dashboard
    const ADX_DASHBOARD_URL = "https://your-adx-dashboard-path.com/om-view"; 

    const handleReload = () => setLastReload(Date.now());
    const handleClear = () => {
        setSelectedDate('');
        setSelectedTime('');
        setSelectedDeviceId('');
    }
    
    // Simulate fetching data for the selected device
    const currentDeviceData = useMemo(() => {
        const data = mockOMDataList.find(d => d.assetId === selectedDeviceId);
        
        if (!data) return null;

        return {
            assetId: data.assetId,
            LastTimestamp: data.LastTimestamp,
            Pressure: { value: data.Pressure_psi, status: getStatus(data.Pressure_psi, thresholds.Pressure, true) },
            FlowRate: { value: data.FlowRate_m3h, status: getStatus(data.FlowRate_m3h, thresholds.FlowRate || 1000, true) },
            Temperature: { value: data.Temperature_C, status: getStatus(data.Temperature_C, thresholds.Temperature, true) },
            Vibration: { value: data.Vibration_mm_s, status: getStatus(data.Vibration_mm_s, thresholds.Vibration, true) },
            EnergyConsumption: { value: data.EnergyConsumption_kWh, status: getStatus(data.EnergyConsumption_kWh, thresholds.Energy, true) },
            ValveStatus: { value: data.ValveStatus, status: data.ValveStatus === "OPEN" ? "normal" : "warning" },
            RunTime: { value: data.RunTime_Hours, status: "normal" },
            MaintenanceDue: { value: data.MaintenanceDue_Days, status: getStatus(data.MaintenanceDue_Days, thresholds.MaintenanceDue, false) },
            AlarmsTriggered: { value: data.AlarmsTriggered, status: getStatus(data.AlarmsTriggered, thresholds.Alarms, true) },
            PredictedCondition: data.PredictedCondition,
        };
    }, [selectedDeviceId, lastReload]);

    // Handle button click to open ADX dashboard
    const handleOpenADX = () => {
        window.open(ADX_DASHBOARD_URL, '_blank');
    };

    if (!currentDeviceData) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Operation & Maintenance Dashboard</h2>
                    <ConditionBadge condition="N/A" />
                </div>
                <Card className="p-6 flex flex-col items-center justify-center space-y-4">
                  <p className="text-muted-foreground text-center">No data found for the selected Device ID.</p>
                  <Button onClick={handleClear} variant="default">
                     Reset Filters
                  </Button>
                </Card>
            </div>
        );
    }
    

    return (
        <div className="space-y-6">
            
            {/* --- HEADER --- */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Operation & Maintenance Dashboard</h1>
                        <p className="text-muted-foreground">Real-time — **{currentDeviceData.assetId}**</p>
                    </div>
                    {/* Prediction Condition Box */}
                    <div className="flex items-center space-x-2">
                        <Label className="font-semibold text-sm">Predicted Condition</Label>
                        <ConditionBadge condition={currentDeviceData.PredictedCondition} />
                    </div>
                </div>

                {/* --- FILTER BAR --- */}
                <div className="flex items-end flex-wrap gap-4 p-2 border rounded-md bg-gray-50/50">
                    
                    {/* Date/Time Filter Group */}
                    <div className="flex items-center space-x-2">
                        <Label className="text-xs text-muted-foreground">Date</Label>
                        <DateTimeFilter 
                            date={selectedDate} 
                            time={selectedTime} 
                            onDateChange={setSelectedDate} 
                            onTimeChange={setSelectedTime} 
                        />
                    </div>
                    
                    {/* Device ID Filter (Replaces Material/Grade) */}
                    <SingleSelectDropdown
                        label="Device ID"
                        options={deviceOptions}
                        selected={selectedDeviceId}
                        onChange={setSelectedDeviceId}
                        widthClass="w-[140px]"
                    />

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                        <Button onClick={handleReload} variant="outline" size="sm" className="flex items-center text-xs p-1 h-auto">
                            <RefreshCw className="h-3 w-3 mr-1" /> Reload
                        </Button>
                        <Button onClick={handleClear} variant="outline" size="sm" className="text-xs p-1 h-auto">
                            Clear
                        </Button>
                        {/* ADX Dashboard Button */}
                        <Button onClick={handleOpenADX} variant="default" size="sm" className="text-xs p-1 h-auto bg-blue-600 hover:bg-blue-700">
                            ADX Dashboard
                        </Button>
                    </div>
                </div>
                {/* ------------------ */}
            </div>
            {/* ---------------- */}

            {/* --- KPI CARD GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* Row 1 */}
                <KPICard title="Asset ID" value={currentDeviceData.assetId} icon={Tag} status="normal"/>
                <KPICard title="Last Timestamp" value={currentDeviceData.LastTimestamp} icon={Clock} status="normal"/>
                <KPICard title="Pressure" value={currentDeviceData.Pressure.value} icon={Activity} status={currentDeviceData.Pressure.status} unit="psi"/>
                <KPICard title="Flow Rate" value={currentDeviceData.FlowRate.value} icon={Gauge} status={currentDeviceData.FlowRate.status} unit="m³/h"/>
                
                {/* Row 2 */}
                <KPICard title="Temperature" value={currentDeviceData.Temperature.value} icon={Thermometer} status={currentDeviceData.Temperature.status} unit="°C"/>
                <KPICard title="Vibration Level" value={currentDeviceData.Vibration.value} icon={Waves} status={currentDeviceData.Vibration.status} unit="mm/s"/>
                <KPICard title="Energy Consumption" value={currentDeviceData.EnergyConsumption.value} icon={Zap} status={currentDeviceData.EnergyConsumption.status} unit="kWh"/>
                <KPICard title="Valve Status" value={currentDeviceData.ValveStatus.value} icon={Settings} status={currentDeviceData.ValveStatus.status}/>

                {/* Row 3 */}
                <KPICard title="Run Time" value={currentDeviceData.RunTime.value} icon={Clock} status={currentDeviceData.RunTime.status} unit="Hours"/>
                <KPICard title="Maintenance Due" value={currentDeviceData.MaintenanceDue.value} icon={Hammer} status={currentDeviceData.MaintenanceDue.status} unit="Days"/>
                <KPICard title="Alarms Triggered" value={currentDeviceData.AlarmsTriggered.value} icon={Activity} status={currentDeviceData.AlarmsTriggered.status}/>
                <KPICard title="Spare/Reserved" value={"N/A"} icon={Tag} status="normal"/>
            </div>
            {/* ----------------------------------------------------- */}
        </div>
    );
};

export default OperationMaintenanceDashboard;