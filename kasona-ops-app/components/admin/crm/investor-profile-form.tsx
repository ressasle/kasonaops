"use client";

import { useState } from "react";
import { Loader2, Save, SkipForward, Layout, FileOutput, Radio, Activity, Target, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

const PERSONA_TEMPLATES = [
    {
        name: "Professional Investor (Daily)",
        data_granularity: 5,
        action_frequency: 5,
        decision_logic: 5,
        risk_appetite: 4,
        output_format: "Newsletter",
        output_frequency: "daily",
        investment_philosophy: "Quantitative Momentum & Factor Investing",
        buy_box_trigger_1: "Earnings surprise >10% vs consensus",
        buy_box_trigger_2: "RSI crossover below 30 (oversold reversal)",
        buy_box_trigger_3: "Insider buying >$500K in 30 days",
        noise_filter: "Penny stocks, SPACs, meme stocks",
    },
    {
        name: "Wealthy Part-Time (Weekly)",
        data_granularity: 3,
        action_frequency: 3,
        decision_logic: 3,
        risk_appetite: 3,
        output_format: "Podcast",
        output_frequency: "weekly",
        investment_philosophy: "Quality Growth at a Reasonable Price",
        buy_box_trigger_1: "Dividend increase announcement",
        buy_box_trigger_2: "P/E drops below 5-year average",
        buy_box_trigger_3: "Analyst upgrade to Buy/Strong Buy",
        noise_filter: "Micro-caps, crypto hype, day-trading signals",
    },
    {
        name: "Passive Investor (Monthly)",
        data_granularity: 1,
        action_frequency: 1,
        decision_logic: 2,
        risk_appetite: 2,
        output_format: "Newsletter",
        output_frequency: "monthly",
        investment_philosophy: "Long-Term Buy & Hold, Index-Core",
        buy_box_trigger_1: "Major index rebalancing event",
        buy_box_trigger_2: "Expense ratio reduction on held ETFs",
        buy_box_trigger_3: "Portfolio drift >5% from target allocation",
        noise_filter: "Individual stock picks, short-term technicals",
    }
];

type InvestorProfileFormData = {
    portfolio_name: string;
    portfolio_id: string;
    product_status: "to create";
    output_format: "Newsletter" | "Podcast" | "Other";
    output_frequency: "daily" | "weekly" | "bi-weekly" | "monthly" | "quarterly";
    data_granularity: number;
    action_frequency: number;
    decision_logic: number;
    risk_appetite: number;
    investment_philosophy: string;
    buy_box_trigger_1: string;
    buy_box_trigger_2: string;
    buy_box_trigger_3: string;
    noise_filter: string;
    subscribed_portfolio_briefing: boolean;
};

type DnaKey = "data_granularity" | "action_frequency" | "decision_logic" | "risk_appetite";

type InvestorProfileFormProps = {
    companyId: number;
    onSuccess: (portfolioId: string) => void;
    onSkip?: () => void;
};

export function InvestorProfileForm({ companyId, onSuccess, onSkip }: InvestorProfileFormProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPersona, setSelectedPersona] = useState("");

    const [formData, setFormData] = useState<InvestorProfileFormData>({
        portfolio_name: "Primary Portfolio",
        portfolio_id: `port-${Math.random().toString(36).substring(2, 7)}`,
        product_status: "to create" as const,
        output_format: "Newsletter" as const,
        output_frequency: "monthly" as const,
        data_granularity: 3,
        action_frequency: 3,
        decision_logic: 3,
        risk_appetite: 3,
        investment_philosophy: "",
        buy_box_trigger_1: "",
        buy_box_trigger_2: "",
        buy_box_trigger_3: "",
        noise_filter: "",
        subscribed_portfolio_briefing: false,
    });

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            const payload = {
                company_id: companyId,
                portfolio_id: formData.portfolio_id,
                portfolio_name: formData.portfolio_name,
                product_status: formData.product_status,
                output_format: formData.output_format,
                output_frequency: formData.output_frequency,
                data_granularity: formData.data_granularity,
                action_frequency: formData.action_frequency,
                decision_logic: formData.decision_logic,
                risk_appetite: formData.risk_appetite,
                investment_philosophy: formData.investment_philosophy || null,
                buy_box_trigger_1: formData.buy_box_trigger_1 || null,
                buy_box_trigger_2: formData.buy_box_trigger_2 || null,
                buy_box_trigger_3: formData.buy_box_trigger_3 || null,
                noise_filter: formData.noise_filter || null,
                subscribed_portfolio_briefing: formData.subscribed_portfolio_briefing,
            };

            const response = await fetch("/api/investor-profiles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to save investor profile");
            }

            onSuccess(formData.portfolio_id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-primary/20 bg-background/50 backdrop-blur-xl">
            <CardHeader>
                <div className="flex items-center gap-2 text-primary mb-2">
                    <Activity className="h-5 w-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Step 2: Investor DNA</span>
                </div>
                <CardTitle>Portfolio Configuration</CardTitle>
                <CardDescription>
                    Define the investment mandate and delivery preferences for this portfolio.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Layout className="h-4 w-4 text-muted-foreground" />
                                Portfolio Name
                            </Label>
                            <Input
                                placeholder="e.g. Family Trust"
                                value={formData.portfolio_name}
                                onChange={(e) => handleChange("portfolio_name", e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                Portfolio ID (Slug)
                            </Label>
                            <Input
                                placeholder="e.g. family-trust"
                                value={formData.portfolio_id}
                                onChange={(e) => handleChange("portfolio_id", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-black/20 p-3">
                        <input
                            id="subscribed-portfolio-briefing"
                            type="checkbox"
                            checked={formData.subscribed_portfolio_briefing}
                            onChange={(e) => handleChange("subscribed_portfolio_briefing", e.target.checked)}
                            className="h-4 w-4 cursor-pointer"
                        />
                        <Label htmlFor="subscribed-portfolio-briefing" className="cursor-pointer">
                            Subscribed to Portfolio Briefing
                        </Label>
                    </div>

                    <div className="space-y-2">
                        <Label>Quick Start: Choose Persona</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={selectedPersona}
                            onChange={(e) => {
                                const selected = e.target.value;
                                setSelectedPersona(selected);
                                const template = PERSONA_TEMPLATES.find((item) => item.name === selected);
                                if (template) {
                                    setFormData((prev) => ({
                                        ...prev,
                                        data_granularity: template.data_granularity,
                                        action_frequency: template.action_frequency,
                                        decision_logic: template.decision_logic,
                                        risk_appetite: template.risk_appetite,
                                        output_format: template.output_format as InvestorProfileFormData["output_format"],
                                        output_frequency: template.output_frequency as InvestorProfileFormData["output_frequency"],
                                        investment_philosophy: template.investment_philosophy,
                                        buy_box_trigger_1: template.buy_box_trigger_1,
                                        buy_box_trigger_2: template.buy_box_trigger_2,
                                        buy_box_trigger_3: template.buy_box_trigger_3,
                                        noise_filter: template.noise_filter,
                                    }));
                                }
                            }}
                        >
                            <option value="">Custom Settings</option>
                            {PERSONA_TEMPLATES.map((template) => (
                                <option key={template.name} value={template.name}>
                                    {template.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {([
                        {
                            key: "data_granularity",
                            label: "Data Granularity",
                            low: "Trend Only",
                            mid: "Balanced",
                            high: "Exact Numbers"
                        },
                        {
                            key: "action_frequency",
                            label: "Action Frequency",
                            low: "Long-term",
                            mid: "Weekly",
                            high: "Immediate"
                        },
                        {
                            key: "decision_logic",
                            label: "Decision Logic",
                            low: "Story/Emotion",
                            mid: "Mixed",
                            high: "Logic Only"
                        },
                        {
                            key: "risk_appetite",
                            label: "Risk Appetite",
                            low: "Defensive",
                            mid: "Balanced",
                            high: "Aggressive"
                        }
                    ] as Array<{ key: DnaKey; label: string; low: string; mid: string; high: string }>).map((slider) => {
                        const value = formData[slider.key];
                        const descriptor = value <= 2 ? slider.low : value >= 4 ? slider.high : slider.mid;
                        return (
                            <div key={slider.key} className="space-y-4 rounded-xl border border-border/50 bg-black/20 p-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base">{slider.label}</Label>
                                    <div className="font-mono text-xl font-bold text-primary">
                                        {value}
                                        <span className="text-sm font-normal text-muted-foreground ml-2">({descriptor})</span>
                                    </div>
                                </div>
                                <Slider
                                    value={value}
                                    onChange={(val) => handleChange(slider.key, val)}
                                    min={1}
                                    max={5}
                                    step={1}
                                    className="py-2"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground uppercase font-semibold">
                                    <span>{slider.low}</span>
                                    <span>{slider.mid}</span>
                                    <span>{slider.high}</span>
                                </div>
                            </div>
                        );
                    })}

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <FileOutput className="h-4 w-4 text-muted-foreground" />
                                Output Format
                            </Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={formData.output_format}
                                onChange={(e) => handleChange("output_format", e.target.value)}
                            >
                                <option value="Newsletter">Newsletter (Email)</option>
                                <option value="Podcast">Podcast (Audio)</option>
                                <option value="Other">Custom Portal</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Radio className="h-4 w-4 text-muted-foreground" />
                                Update Frequency
                            </Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                value={formData.output_frequency}
                                onChange={(e) => handleChange("output_frequency", e.target.value)}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="bi-weekly">Bi-Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Investment Philosophy <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <Input
                            placeholder="e.g. Dividend Growth, Value Investing..."
                            value={formData.investment_philosophy}
                            onChange={(e) => handleChange("investment_philosophy", e.target.value)}
                        />
                    </div>

                    <div className="space-y-4 rounded-xl border border-border/50 bg-black/20 p-4">
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="h-4 w-4 text-primary" />
                            <Label className="text-base">Buy Box Triggers <span className="text-xs text-muted-foreground font-normal">(optional)</span></Label>
                        </div>
                        <p className="text-xs text-muted-foreground -mt-2">Define up to 3 signals that should trigger a buy/sell alert for this portfolio.</p>
                        <div className="grid gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Trigger 1</Label>
                                <Input
                                    placeholder="e.g. Earnings surprise >10% vs consensus"
                                    value={formData.buy_box_trigger_1}
                                    onChange={(e) => handleChange("buy_box_trigger_1", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Trigger 2</Label>
                                <Input
                                    placeholder="e.g. RSI crossover below 30 (oversold reversal)"
                                    value={formData.buy_box_trigger_2}
                                    onChange={(e) => handleChange("buy_box_trigger_2", e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Trigger 3</Label>
                                <Input
                                    placeholder="e.g. Insider buying >$500K in 30 days"
                                    value={formData.buy_box_trigger_3}
                                    onChange={(e) => handleChange("buy_box_trigger_3", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            Noise Filter <span className="text-xs text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea
                            placeholder="Topics or signals to exclude, e.g. penny stocks, meme stocks, crypto hype..."
                            value={formData.noise_filter}
                            onChange={(e) => handleChange("noise_filter", e.target.value)}
                            rows={2}
                        />
                    </div>

                    {error && <div className="text-sm text-red-500 font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

                    <div className="flex justify-between pt-4">
                        {onSkip ? (
                            <Button type="button" variant="ghost" onClick={onSkip} className="hover:bg-primary/5">
                                <SkipForward className="mr-2 h-4 w-4" />
                                Skip Step
                            </Button>
                        ) : (
                            <div />
                        )}
                        <Button type="submit" disabled={isSaving} className="min-w-[140px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Continue to Upload
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
