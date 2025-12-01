import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { historicalData as omHistoricalData } from "@/data/mockData";

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Clock, Mail, TrendingUp, Check } from "lucide-react";

// ---------------- MOCK ALERT DATA ----------------
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
    },
];

// ---------------- REUSABLE ALERT CARD ----------------
const AlertCard = ({ alert }) => {
    let statusClass =
        alert.status === "CRITICAL"
            ? "bg-red-600"
            : alert.status === "WARNING"
            ? "bg-yellow-500"
            : "bg-green-600";

    let valueTextColor =
        alert.status === "CRITICAL"
            ? "text-red-600"
            : alert.status === "WARNING"
            ? "text-yellow-600"
            : "text-foreground";

    const chartContextData = useMemo(() => {
        return omHistoricalData.slice(-12).map((d) => ({
            time: new Date(d.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
            value: d[alert.metric] || 0,
        }));
    }, [alert.metric]);

    const difference = (alert.currentValue - alert.threshold).toFixed(1);

    // All emails replaced with praptimore78@gmail.com
    const recipients = ["praptimore78@gmail.com"];

    return (
        <Card className="p-6 space-y-4 shadow-md border">
            {/* HEADER */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-semibold">{alert.title}</h2>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>{alert.timestamp}</span>
                    </div>
                </div>
                <div
                    className={`text-xs font-bold text-white px-3 py-1 rounded ${statusClass}`}
                >
                    {alert.status}
                </div>
            </div>

            {/* VALUES + SPARKLINE */}
            <div className="grid grid-cols-3 items-center">
                <div>
                    <p className="text-sm text-muted-foreground">Previous Value</p>
                    <p className="text-2xl font-semibold">{alert.previousValue}</p>
                </div>

                <div className="h-12 flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartContextData}>
                            <XAxis dataKey="time" hide />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                    padding: "4px 8px",
                                }}
                                labelStyle={{ display: "none" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={
                                    alert.status === "CRITICAL"
                                        ? "red"
                                        : alert.status === "WARNING"
                                        ? "orange"
                                        : "green"
                                }
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>

                    <TrendingUp className={`w-5 h-5 ml-2 ${valueTextColor}`} />
                </div>

                <div className="text-right">
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className={`text-2xl font-semibold ${valueTextColor}`}>
                        {alert.currentValue}
                    </p>
                </div>
            </div>

            <div className="h-px bg-border" />

            {/* FOOTER */}
            <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                    <div className="flex gap-2 items-center">
                        <Mail className="w-4 h-4 text-orange-500" />
                        <span>Email sent to:</span>
                        {recipients.map((e, i) => (
                            <span
                                key={i}
                                className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded"
                            >
                                {e}
                            </span>
                        ))}
                    </div>

                    <span className="flex items-center text-green-600 font-medium">
                        <Check className="w-4 h-4 mr-1" />
                        Email Sent
                    </span>
                </div>

                <div className="text-muted-foreground">
                    Threshold:{" "}
                    <span className="font-semibold">{alert.threshold}</span> (Exceeded by{" "}
                    {difference})
                </div>
            </div>
        </Card>
    );
};

// ---------------- MAIN PAGE ----------------
const OperationAlerts = () => {
    const [filterStatus, setFilterStatus] = useState("ALL");

    const filtered = useMemo(() => {
        return filterStatus === "ALL"
            ? mockAlerts.filter((a) => a.status === "CRITICAL" || a.status === "WARNING")
            : mockAlerts.filter((a) => a.status === filterStatus);
    }, [filterStatus]);

    const options = ["ALL", "CRITICAL", "WARNING"];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Operation Threshold Alerts</h1>
                    <p className="text-muted-foreground">
                        Monitor threshold breaches and notifications
                    </p>
                </div>

                {/* FILTER */}
                <div className="flex items-center gap-2">
                    <Label htmlFor="status">Status Filter:</Label>
                    <select
                        id="status"
                        className="border rounded p-2 text-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        {options.map((o) => (
                            <option key={o} value={o}>
                                {o}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ALERT LIST */}
            <div className="space-y-4">
                {filtered.length ? (
                    filtered.map((alert) => <AlertCard key={alert.id} alert={alert} />)
                ) : (
                    <Card className="p-6 text-center text-muted-foreground">
                        No alerts found for this filter.
                    </Card>
                )}
            </div>
        </div>
    );
};

export default OperationAlerts;
