"use client";

import { FileText, Layers3, Mail, ShieldAlert } from "lucide-react";
import type { EditorTemplate } from "@/lib/editor-templates";

type TemplateSidebarProps = {
    templates: EditorTemplate[];
    activeTemplateId?: string;
    onSelectTemplate: (template: EditorTemplate) => void;
};

const templateIconMap: Record<string, React.ReactNode> = {
    application: <FileText className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    complaint: <ShieldAlert className="h-4 w-4" />,
};

export default function TemplateSidebar({
    templates,
    activeTemplateId,
    onSelectTemplate,
}: TemplateSidebarProps) {
    return (
        <aside className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-4 py-4">
                <div className="mb-1 flex items-center gap-2">
                    <Layers3 className="h-5 w-5 text-slate-700" />
                    <h2 className="text-sm font-semibold text-slate-900">Templates</h2>
                </div>
                <p className="text-xs leading-5 text-slate-500">
                    বাংলা এবং English document শুরু করার জন্য ready structure
                </p>
            </div>

            <div className="space-y-3 overflow-y-auto p-4">
                {templates.map((template) => {
                    const active = activeTemplateId === template.id;

                    return (
                        <button
                            key={template.id}
                            type="button"
                            onClick={() => onSelectTemplate(template)}
                            className={[
                                "w-full rounded-2xl border p-4 text-left transition-all duration-200",
                                active
                                    ? "border-slate-900 bg-slate-900 text-white shadow-md"
                                    : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300 hover:bg-white",
                            ].join(" ")}
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <div
                                    className={[
                                        "inline-flex h-9 w-9 items-center justify-center rounded-xl",
                                        active
                                            ? "bg-white/15 text-white"
                                            : "bg-white text-slate-700 shadow-sm",
                                    ].join(" ")}
                                >
                                    {templateIconMap[template.id] ?? <FileText className="h-4 w-4" />}
                                </div>

                                <span
                                    className={[
                                        "rounded-full px-2.5 py-1 text-[11px] font-medium",
                                        active
                                            ? "bg-white/15 text-white"
                                            : "bg-slate-200 text-slate-700",
                                    ].join(" ")}
                                >
                                    {template.category}
                                </span>
                            </div>

                            <h3 className="text-sm font-semibold">{template.title}</h3>
                            <p
                                className={[
                                    "mt-1 text-xs leading-5",
                                    active ? "text-slate-200" : "text-slate-500",
                                ].join(" ")}
                            >
                                {template.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
