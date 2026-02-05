"use client";

import { Shield, Briefcase, DollarSign, Users, Code, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type TeamMember = {
    name: string;
    role: string;
    department: string; // e.g., Admin, Backoffice, Sales
    icon: any;
    responsibilities: string[];
    access: string[];
    email?: string;
};

const teamMembers: TeamMember[] = [
    {
        name: "Julian",
        role: "Admin",
        department: "Management",
        icon: Crown,
        responsibilities: ["Overall strategy", "Decision making", "Team oversight"],
        access: ["All Access"],
        email: "julian@kasona.com"
    },
    {
        name: "Niclas",
        role: "Finance & HR",
        department: "Backoffice",
        icon: DollarSign,
        responsibilities: ["Financial planning", "Human Resources", "Payroll"],
        access: ["Finance Dashboard", "HR Records", "Customer Page"],
        email: "niclas@kasona.com"
    },
    {
        name: "Jakob",
        role: "Sales Lead",
        department: "Sales",
        icon: Briefcase,
        responsibilities: ["Lead generation", "Closing deals", "Pipeline management"],
        access: ["Sales Pipeline", "Customer Page", "Calendar"],
        email: "jakob@kasona.com"
    },
    {
        name: "Clara",
        role: "Customer Fulfillment",
        department: "Fulfillment",
        icon: Users,
        responsibilities: ["Customer support", "Onboarding", "Briefing fulfillment"],
        access: ["Customer Page", "Order Management"],
        email: "clara@kasona.com"
    },
    {
        name: "Kelvin",
        role: "Tech Lead",
        department: "Tech",
        icon: Code,
        responsibilities: ["Product development", "Software architecture", "Maintenance"],
        access: ["Product Development", "Code Repository", "Customer Page"],
        email: "kelvin@kasona.com"
    },
];

export default function TeamPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="headline-serif text-3xl">Team & Roles</h1>
                <p className="text-muted-foreground">
                    Overview of specific team members, roles, permissions, and responsibilities.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {teamMembers.map((member) => {
                    const Icon = member.icon;
                    return (
                        <div key={member.name} className="glass-panel glass-panel-hover flex flex-col rounded-2xl p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-lg font-bold">{member.name}</h3>
                                        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                            {member.role}
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="outline" className="border-primary/20 text-primary">
                                    {member.department}
                                </Badge>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <h4 className="label-mono mb-2 text-xs text-muted-foreground">Responsibilities</h4>
                                    <ul className="list-disc pl-4 text-sm text-foreground/80">
                                        {member.responsibilities.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="label-mono mb-2 text-xs text-muted-foreground">Access Permissions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {member.access.map((item) => (
                                            <Badge key={item} variant="secondary" className="bg-white/5 hover:bg-white/10">
                                                {item}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {member.email && (
                                <div className="mt-6 border-t border-white/5 pt-4 text-xs text-muted-foreground">
                                    {member.email}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
