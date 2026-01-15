"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw, Terminal, Zap } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Mock log data
const mockLogs = [
    { time: "21:14:02", level: "INFO", message: "Starting intake for user hardik@example.com" },
    { time: "21:14:03", level: "INFO", message: "Validating LinkedIn URL... OK" },
    { time: "21:14:05", level: "WARN", message: "Payment gateway latency detected (800ms)" },
    { time: "21:14:06", level: "INFO", message: "Scraping service initiated (Apify task: 23df2...)" },
    { time: "21:14:14", level: "INFO", message: "LangGraph Node: scoring_agent started" },
    { time: "21:14:15", level: "INFO", message: "Analyzed headline. Suggesting improvements..." },
    { time: "21:14:18", level: "DONE", message: "Report generated. Stored in Google Sheets (Row 42)" },
];

const mockRuns = [
    { id: "req_8f29a", status: "SUCCESS", user: "hardik@example.com", time: "2 mins ago", duration: "12s" },
    { id: "req_7c1b2", status: "FAILED", user: "test@test.com", time: "5 mins ago", duration: "3s" },
    { id: "req_6a9d4", status: "SUCCESS", user: "john@company.com", time: "12 mins ago", duration: "15s" },
    { id: "req_5e8c3", status: "SUCCESS", user: "sarah@startup.io", time: "25 mins ago", duration: "11s" },
];

export default function WarRoomPage() {
    const [selectedRun, setSelectedRun] = useState(mockRuns[0]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
                <Container className="flex h-16 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
                            <Terminal className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">LinkifyMe.WarRoom</span>
                        <Badge tone="brand" className="bg-brand/20 text-brand-light border-brand/30">
                            v0.1.0-alpha
                        </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            System Operational
                        </div>
                    </div>
                </Container>
            </header>

            <Container className="py-8 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard label="Active Runs" value="3" icon={<Activity className="h-5 w-5 text-blue-400" />} />
                    <StatCard label="Success Rate (24h)" value="98.2%" icon={<CheckCircle className="h-5 w-5 text-emerald-400" />} />
                    <StatCard label="Avg. Latency" value="4.2s" icon={<Clock className="h-5 w-5 text-amber-400" />} />
                    <StatCard label="Errors (24h)" value="12" icon={<AlertTriangle className="h-5 w-5 text-rose-400" />} />
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
                    {/* Runs List */}
                    <Card className="bg-slate-900 border-white/10 p-0 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-semibold text-white text-sm">Recent Executions</h3>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {mockRuns.map((run) => (
                                <button
                                    key={run.id}
                                    onClick={() => setSelectedRun(run)}
                                    className={cn(
                                        "w-full p-3 rounded-xl text-left transition-colors border",
                                        selectedRun.id === run.id
                                            ? "bg-white/10 border-white/10"
                                            : "border-transparent hover:bg-white/5"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-mono text-xs text-brand-light">{run.id}</span>
                                        <Badge tone={run.status === "SUCCESS" ? "success" : "critical"} className="scale-90">
                                            {run.status}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-slate-400">{run.user}</div>
                                    <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                                        <span>{run.time}</span>
                                        <span>{run.duration} duration</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Logs Panel */}
                    <Card className="lg:col-span-2 bg-slate-950 border-white/10 p-0 overflow-hidden flex flex-col font-mono text-xs">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-white text-sm font-sans">
                                    Execution Logs: {selectedRun.id}
                                </h3>
                                <Badge tone={selectedRun.status === "SUCCESS" ? "success" : "critical"}>
                                    {selectedRun.status === "SUCCESS" ? "COMPLETED" : "FAILED"}
                                </Badge>
                            </div>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white font-sans">
                                Download Raw
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
                            {mockLogs.map((log, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex gap-3"
                                >
                                    <span className="text-slate-500">[{log.time}]</span>
                                    <span
                                        className={cn(
                                            log.level === "INFO" && "text-blue-400",
                                            log.level === "WARN" && "text-amber-400",
                                            log.level === "DONE" && "text-emerald-400",
                                            log.level === "ERROR" && "text-rose-400"
                                        )}
                                    >
                                        {log.level}
                                    </span>
                                    <span className="text-slate-300">{log.message}</span>
                                </motion.div>
                            ))}
                        </div>
                    </Card>
                </div>
            </Container>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
    return (
        <Card className="bg-slate-900 border-white/10">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{label}</span>
                {icon}
            </div>
            <div className="text-2xl font-mono font-bold text-white">{value}</div>
        </Card>
    );
}
