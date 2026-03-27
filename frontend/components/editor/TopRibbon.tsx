"use client";

import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    ChevronDown,
    Download,
    FileOutput,
    Italic,
    Languages,
    Mic,
    Redo2,
    Save,
    Sparkles,
    Type,
    Underline,
    Undo2,
} from "lucide-react";

type TopRibbonProps = {
    currentFont: string;
    currentFontSize: string;
    onFontChange: (font: string) => void;
    onFontSizeChange: (size: string) => void;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onExportPdf: () => void;
    onExportDocx: () => void;
    onVoiceTyping: () => void;
    onAiGrammar: () => void;
    onAiGenerate: () => void;
    onAlign: (align: "left" | "center" | "right" | "justify") => void;
    onUnicodeToBijoy: () => void;
    onBijoyToUnicode: () => void;
    onBold: () => void;
    onItalic: () => void;
    onUnderline: () => void;
};

const fonts = [
    "Arial",
    "Noto Sans Bengali",
    "Nikosh",
    "Kalpurush",
    "SutonnyMJ",
];

const fontSizes = ["12", "14", "16", "18", "20", "24", "28", "32"];

function RibbonGroup({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-w-max flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">{children}</div>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                {title}
            </span>
        </div>
    );
}

function IconButton({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            title={label}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-100"
        >
            {children}
            <span className="hidden xl:inline">{label}</span>
        </button>
    );
}

export default function TopRibbon({
    currentFont,
    currentFontSize,
    onFontChange,
    onFontSizeChange,
    onUndo,
    onRedo,
    onSave,
    onExportPdf,
    onExportDocx,
    onVoiceTyping,
    onAiGrammar,
    onAiGenerate,
    onAlign,
    onUnicodeToBijoy,
    onBijoyToUnicode,
    onBold,
    onItalic,
    onUnderline,
}: TopRibbonProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex gap-3 overflow-x-auto pb-1">
                <RibbonGroup title="Font">
                    <div className="relative">
                        <Type className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select
                            value={currentFont}
                            onMouseDown={(e) => e.preventDefault()}
                            onChange={(e) => onFontChange(e.target.value)}
                            className="h-10 min-w-[180px] appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                        >
                            {fonts.map((font) => (
                                <option key={font} value={font}>
                                    {font}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>

                    <div className="relative">
                        <select
                            value={currentFontSize}
                            onMouseDown={(e) => e.preventDefault()}
                            onChange={(e) => onFontSizeChange(e.target.value)}
                            className="h-10 min-w-[84px] appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-800 outline-none transition focus:border-slate-400"
                        >
                            {fontSizes.map((size) => (
                                <option key={size} value={size}>
                                    {size}px
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>

                    <IconButton label="Bold" onClick={onBold}>
                        <Bold className="h-4 w-4" />
                    </IconButton>

                    <IconButton label="Italic" onClick={onItalic}>
                        <Italic className="h-4 w-4" />
                    </IconButton>

                    <IconButton label="Underline" onClick={onUnderline}>
                        <Underline className="h-4 w-4" />
                    </IconButton>
                </RibbonGroup>

                <RibbonGroup title="Paragraph">
                    <IconButton label="Left" onClick={() => onAlign("left")}>
                        <AlignLeft className="h-4 w-4" />
                    </IconButton>
                    <IconButton label="Center" onClick={() => onAlign("center")}>
                        <AlignCenter className="h-4 w-4" />
                    </IconButton>
                    <IconButton label="Right" onClick={() => onAlign("right")}>
                        <AlignRight className="h-4 w-4" />
                    </IconButton>
                    <IconButton label="Justify" onClick={() => onAlign("justify")}>
                        <AlignJustify className="h-4 w-4" />
                    </IconButton>
                </RibbonGroup>

                <RibbonGroup title="History">
                    <IconButton label="Undo" onClick={onUndo}>
                        <Undo2 className="h-4 w-4" />
                    </IconButton>
                    <IconButton label="Redo" onClick={onRedo}>
                        <Redo2 className="h-4 w-4" />
                    </IconButton>
                </RibbonGroup>

                <RibbonGroup title="AI">
                    <IconButton label="Grammar" onClick={onAiGrammar}>
                        <Sparkles className="h-4 w-4" />
                    </IconButton>
                    <IconButton label="Generate" onClick={onAiGenerate}>
                        <Sparkles className="h-4 w-4" />
                    </IconButton>
                    <IconButton label="Voice" onClick={onVoiceTyping}>
                        <Mic className="h-4 w-4" />
                    </IconButton>
                </RibbonGroup>

                <RibbonGroup title="Conversion">
                    <IconButton label="Unicode → Bijoy" onClick={onUnicodeToBijoy}>
                        <Languages className="h-4 w-4" />
                    </IconButton>
                    <IconButton label="Bijoy → Unicode" onClick={onBijoyToUnicode}>
                        <Languages className="h-4 w-4" />
                    </IconButton>
                </RibbonGroup>

                <RibbonGroup title="Export">
                    <IconButton label="Save" onClick={onSave}>
                        <Save className="h-4 w-4" />
                    </IconButton>
                    <IconButton label="PDF" onClick={onExportPdf}>
                        <Download className="h-4 w-4" />
                    </IconButton>
                    <IconButton label="DOCX" onClick={onExportDocx}>
                        <FileOutput className="h-4 w-4" />
                    </IconButton>
                </RibbonGroup>
            </div>
        </div>
    );
}
