"use client";

import { Trash2, Plus, Settings2, CheckCircle2 } from "lucide-react";
import { Button, Card, Input, Select, Badge } from "@examcraft/ui";

type SectionRule = {
    title: string;
    questionCount: number;
    marks: number;
    allowedDifficulty?: string[];
    allowedBloomLevels?: string[];
    allowedUnitNumbers?: number[];
};

type TemplateSectionConfiguratorProps = {
    sections: SectionRule[];
    onChange: (sections: SectionRule[]) => void;
};

const difficulties = ["easy", "medium", "hard"];
const bloomLevels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

export function TemplateSectionConfigurator({ sections, onChange }: TemplateSectionConfiguratorProps) {
    const addSection = () => {
        onChange([
            ...sections,
            { title: `Section ${String.fromCharCode(65 + sections.length)}`, questionCount: 5, marks: 10 }
        ]);
    };

    const removeSection = (index: number) => {
        onChange(sections.filter((_, i) => i !== index));
    };

    const updateSection = (index: number, updates: Partial<SectionRule>) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], ...updates };
        onChange(newSections);
    };

    const toggleRule = (index: number, field: keyof SectionRule, value: any) => {
        const currentRef = (sections[index][field] as any[]) || [];
        const newValue = currentRef.includes(value) 
            ? currentRef.filter(v => v !== value)
            : [...currentRef, value];
        updateSection(index, { [field]: newValue });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-textContrast">Sections & Blueprints</h3>
                <Button type="button" variant="secondary" size="sm" onClick={addSection}>
                    <Plus size={14} className="mr-1" /> Add Section
                </Button>
            </div>

            {sections.length === 0 && (
                <div className="p-8 border-2 border-dashed border-borderSubtle rounded-xl text-center">
                    <p className="text-sm text-textMuted text-center">No sections defined. Add one to start building your blueprint.</p>
                </div>
            )}

            <div className="flex flex-col gap-3">
                {sections.map((section, idx) => (
                    <Card key={idx} className="relative group overflow-visible border-brandAccent/20">
                        <div className="absolute -top-3 -left-3">
                            <Badge variant="brand" className="shadow-lg border-2 border-backgroundMain">
                                Section {String.fromCharCode(65 + idx)}
                            </Badge>
                        </div>

                        <div className="flex flex-col gap-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input 
                                    label="Title"
                                    value={section.title}
                                    onChange={(e) => updateSection(idx, { title: e.target.value })}
                                    required
                                />
                                <Input 
                                    label="Questions"
                                    type="number"
                                    value={section.questionCount}
                                    onChange={(e) => updateSection(idx, { questionCount: parseInt(e.target.value) || 0 })}
                                    required
                                />
                                <Input 
                                    label="Total Marks"
                                    type="number"
                                    value={section.marks}
                                    onChange={(e) => updateSection(idx, { marks: parseInt(e.target.value) || 0 })}
                                    required
                                />
                            </div>

                            <div className="border-t border-borderSubtle pt-4">
                                <span className="text-[10px] uppercase tracking-wider font-bold text-textMuted mb-2 block">Pedagogical Controls (Optional)</span>
                                
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <p className="text-[11px] text-textMuted mb-1.5">Difficulty Targeting</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {difficulties.map(d => (
                                                <button
                                                    key={d}
                                                    type="button"
                                                    onClick={() => toggleRule(idx, "allowedDifficulty", d)}
                                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                                                        section.allowedDifficulty?.includes(d)
                                                            ? "bg-brandAccent/10 border-brandAccent text-brandAccent"
                                                            : "bg-surfaceSecondary/50 border-borderSubtle text-textSubtle hover:border-textMuted"
                                                    }`}
                                                >
                                                    {d.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[11px] text-textMuted mb-1.5">Bloom's Taxonomy Levels</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {bloomLevels.map(b => (
                                                <button
                                                    key={b}
                                                    type="button"
                                                    onClick={() => toggleRule(idx, "allowedBloomLevels", b)}
                                                    className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all border ${
                                                        section.allowedBloomLevels?.includes(b)
                                                            ? "bg-primary/10 border-primary text-primary"
                                                            : "bg-surfaceSecondary/50 border-borderSubtle text-textSubtle hover:border-textMuted"
                                                    }`}
                                                >
                                                    {b}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2 border-t border-borderSubtle">
                                <Button type="button" variant="secondary" className="text-red-400 border-red-400/20 hover:bg-red-400/10" onClick={() => removeSection(idx)}>
                                    <Trash2 size={14} className="mr-1" /> Remove
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
