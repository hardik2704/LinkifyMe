"use client";

import { cn } from "@/lib/cn";
import { DonutScore } from "@/components/ui/DonutScore";
import { Badge } from "@/components/ui/Badge";
import { LucideIcon, Camera, Image, Type, Users, UserPlus, User, Briefcase, GraduationCap, Award, Wrench, Mail, Link2 } from "lucide-react";

interface SidebarSection {
    id: string;
    label: string;
    icon: LucideIcon;
    hasIssue?: boolean;
}

interface SidebarProps {
    profile: {
        name: string;
        initial: string;
        url: string;
        gradeLabel: string;
        score: number;
    };
    sections: SidebarSection[];
    activeSection?: string;
    onSectionClick?: (id: string) => void;
    className?: string;
}

export function Sidebar({ profile, sections, activeSection, onSectionClick, className }: SidebarProps) {
    return (
        <aside className={cn("w-64 flex-shrink-0", className)}>
            <div className="sticky top-24 space-y-6">
                {/* Profile Card */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 mb-3 border-4 border-white shadow-soft">
                            {profile.initial}
                        </div>
                        <Badge tone={profile.score >= 70 ? "success" : profile.score >= 50 ? "warning" : "critical"}>
                            {profile.gradeLabel}
                        </Badge>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-center mb-1">{profile.name}</h3>
                    <p className="text-xs text-slate-500 text-center truncate mb-6">{profile.url}</p>

                    <div className="flex justify-center">
                        <DonutScore score={profile.score} size={120} />
                    </div>
                </div>

                {/* Sections Nav */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-3">Sections</h4>
                    <nav className="space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => onSectionClick?.(section.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left",
                                        activeSection === section.id
                                            ? "bg-brand/10 text-brand-dark"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <Icon className="h-4 w-4 flex-shrink-0" />
                                    <span className="flex-1">{section.label}</span>
                                    {section.hasIssue && (
                                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </aside>
    );
}

// Export default sections for convenience
export const defaultSections: SidebarSection[] = [
    { id: "profile-photo", label: "Profile Photo", icon: Camera, hasIssue: false },
    { id: "cover-photo", label: "Cover Photo", icon: Image, hasIssue: true },
    { id: "headline", label: "Headline", icon: Type, hasIssue: true },
    { id: "connections", label: "Connections", icon: Users, hasIssue: false },
    { id: "followers", label: "Followers", icon: UserPlus, hasIssue: false },
    { id: "about", label: "About", icon: User, hasIssue: true },
    { id: "experience", label: "Experience", icon: Briefcase, hasIssue: false },
    { id: "education", label: "Education", icon: GraduationCap, hasIssue: false },
    { id: "certifications", label: "Certifications", icon: Award, hasIssue: true },
    { id: "skills", label: "Skills", icon: Wrench, hasIssue: false },
];
