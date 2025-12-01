import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { historicalData as omHistoricalData } from "@/data/mockData"; 
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, Mail, TrendingUp, Check, Filter } from "lucide-react";

// --- Mock Alert Data ---
// This mocks the data structure you showed in your screenshot.
const mockAlerts = [
    {
        id: 1,
        metric: "Max_Pressure_psi",
        title: "Max Pressure (psi)",
        status: "CRITICAL",
        timestamp: "01/12/2025, 00:31:42",
        previousValue: 1380,
        currentValue: 1450,
        threshold: 1400,
        recipients: ["safety@company.com", "ops@company.com"],
    },
    {
        id: 2,
        metric: "Temperature_C",
        title: "Temperature (°C)",
        status: "WARNING",
        timestamp: "30/11/2025, 21:31:42",
        previousValue: 78,
        currentValue: 85,
        threshold: 80,
        recipients: ["safety@company.com"],
    },
    {
        id: 3,
        metric: "Vibration_mm_s",
        title: "Vibration Level (mm/s)",
        status: "NORMAL", 
        timestamp: "01/12/2025, 01:00:00",
        previousValue: 4.8,
        currentValue: 3.2,
        threshold: 4.5,
        recipients: ["maintenance@company.com"],
    },
    {
        id: 4,
        metric: "FlowRate_m3h",
        title: "Flow Rate (m³/h)",
        status: "WARNING", 
        timestamp: "01/12/2025, 02:00:00",
        previousValue: 650,
        currentValue: 700,
        threshold: 680,
        recipients: ["ops@company.com"],
    },
];

// --- Reusable Alert Card Component ---
const AlertCard = ({ alert }) => {
    // Determine status colors
    let statusClass = "bg-green-600";
    if (alert.status === "CRITICAL") statusClass = "bg-red-600";
    if (alert.status === "WARNING") statusClass = "bg-yellow-500";
    
    // Determine color for current value text
    let valueTextColor = "text-foreground";
    if (alert.status === "CRITICAL") valueTextColor = "text-red-600";
    if (alert.status === "WARNING") valueTextColor = "text-yellow-600";


    // Get relevant historical data for the chart context
    const chartContextData = useMemo(() => {
        // Use a short, relevant slice of data for the sparkline
        return omHistoricalData.slice(-12).map(d => ({
            time: new Date(d.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            // Dynamically access the value using the metric string
            value: d[alert.metric as keyof typeof d] || 0, 
        }));
    }, [alert.metric]);

    const difference = (alert.currentValue - alert.threshold).toFixed(1);

    return (
        <Card className="p-6 space-y-4 shadow-md border">
            {/* Header and Status */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">{alert.title}</h2>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>{alert.timestamp}</span>
                    </div>
                </div>
                <div className={`text-xs font-bold text-white px-3 py-1 rounded ${statusClass}`}>
                    {alert.status}
                </div>
            </div>

            {/* Values and Context Graph */}
            <div className="grid grid-cols-3 items-center">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Previous Value</p>
                    <p className="text-2xl font-bold">{alert.previousValue}</p>
                </div>
                
                {/* Mini Chart Context */}
                <div className="h-12 w-full flex justify-center items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartContextData}>
                            <XAxis dataKey="time" hide />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--card))', 
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                    padding: '4px 8px'
                                }} 
                                labelStyle={{ display: 'none' }} 
                                formatter={(value) => [`${value}`, 'Value']} 
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                // Set stroke color dynamically based on statusClass (using mock Tailwind colors)
                                stroke={statusClass === "bg-red-600" ? "hsl(var(--danger))" : 
                                        statusClass === "bg-yellow-500" ? "hsl(var(--warning))" : "hsl(var(--success))"}
                                strokeWidth={2} 
                                dot={false} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                    {/* Simplified trend icon */}
                    <TrendingUp className={`w-5 h-5 ${valueTextColor} ml-2`} /> 
                </div>
                
                <div className="space-y-1 text-right">
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className={`text-2xl font-bold ${valueTextColor}`}>{alert.currentValue}</p>
                </div>
            </div>

            <div className="h-px bg-border my-2" />

            {/* Footer Details */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-orange-500" />
                        <span>Email sent to:</span>
                        {alert.recipients.map((email, index) => (
                            <span key={index} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                                {email}
                            </span>
                        ))}
                    </div>
                    <span className="flex items-center text-green-600 font-medium">
                        <Check className="w-4 h-4 mr-1" /> Email Sent
                    </span>
                </div>

                <div className="text-sm text-muted-foreground pt-1">
                    Threshold: <span className="font-semibold text-foreground">{alert.threshold}</span> (Exceeded by {difference})
                </div>
            </div>
        </Card>
    );
}

// --- Main Operation Alerts Component ---

const OperationAlerts = () => {
    const [filterStatus, setFilterStatus] = useState("ALL"); 
    
    const filteredAlerts = useMemo(() => {
        if (filterStatus === "ALL") return mockAlerts;
        return mockAlerts.filter(alert => alert.status === filterStatus);
    }, [filterStatus]);

    // Simple status filter options (for placeholder)
    const statusOptions = ["ALL", "CRITICAL", "WARNING", "NORMAL"];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Operation Threshold Alerts</h1>
                    <p className="text-muted-foreground">Monitor threshold breaches and notifications for operational assets</p>
                </div>
                
                {/* Status Filter Dropdown */}
                <div className="flex items-center gap-2">
                    <Label htmlFor="status-filter" className="text-sm">Filter by Status:</Label>
                    <select
                        id="status-filter"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="p-2 border rounded text-sm"
                    >
                        {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Alert List */}
            <div className="space-y-4">
                {filteredAlerts.length > 0 ? (
                    filteredAlerts.map(alert => (
                        <AlertCard key={alert.id} alert={alert} />
                    ))
                ) : (
                    <Card className="p-6 text-center text-muted-foreground">
                        No alerts matching the current filter settings.
                    </Card>
                )}
            </div>
        </div>
    );
};

export default OperationAlerts;