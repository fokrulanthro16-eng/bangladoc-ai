"use client";

import { useMemo, useState } from "react";
import { PanelLeft, Search, Sparkles } from "lucide-react";
import TopRibbon from "@/components/editor/TopRibbon";
import TemplateSidebar from "@/components/editor/TemplateSidebar";
import A4PageEditor from "@/components/editor/A4PageEditor";
import { useEditor } from "@/hooks/useEditor";
import { convertBanglaText, convertHtmlTextNodes } from "@/lib/bangla-converter";
import { FONT_BY_ENCODING } from "@/lib/bangla-font-map";
import { EditorTemplate, editorTemplates } from "@/lib/editor-templates";

const defaultDocument = `
<p style="font-size: 28px; font-weight: 700; margin-bottom: 16px;">BanglaDoc AI</p>
<p style="margin-bottom: 12px;">এখানে বাংলা এবং English document লিখতে পারবেন।</p>
<p style="margin-bottom: 12px;">এখন editor Unicode ↔ Bijoy conversion-ready।</p>
<p>Selected text বা পুরো document convert করা যাবে।</p>
`.trim();

export default function BanglaDocEditorShell() {
    const [activeTemplateId, setActiveTemplateId] = useState<string>();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const templates = useMemo(() => editorTemplates, []);

    const {
        editorRef,
        html,
        fontFamily,
        fontSize,
        loadDocument,
        handleInput,
        handleBeforeInput,
        toggleBold,
        toggleItalic,
        toggleUnderline,
        applyFontFamily,
        applyFontSize,
        applyAlignment,
        replaceSelectedText,
        replaceSelectedTextWithTransformed,
        transformWholeDocumentText,
        insertHtmlAtCursor,
        undo,
        redo,
        setFontFamily,
    } = useEditor(defaultDocument);

    const applyTemplate = (template: EditorTemplate) => {
        setActiveTemplateId(template.id);
        loadDocument(template.content);
        setFontFamily(FONT_BY_ENCODING.unicode);
    };

    const handleSave = async () => {
        try {
            console.log("Save document HTML:", html);
            alert("Save handler connected. এখানে existing auth token + save API বসাও।");
        } catch (error) {
            console.error(error);
            alert("Save failed");
        }
    };

    const handleExportPdf = () => {
        alert("PDF export hook ready. STEP 4-এ real PDF export connect হবে।");
    };

    const handleExportDocx = () => {
        alert("DOCX export hook ready. STEP 4-এ real DOCX export connect হবে।");
    };

    const handleAiGrammar = () => {
        const selection = window.getSelection()?.toString().trim();

        if (!selection) {
            alert("যে text-এ grammar apply করতে চাও সেটা select করো।");
            return;
        }

        const cleaned = selection.replace(/\s+/g, " ").trim();
        replaceSelectedText(cleaned);
        alert("Demo grammar cleanup applied.");
    };

    const handleAiGenerate = () => {
        const generated = `
<p><strong>AI Generated Draft</strong></p>
<p>এটি একটি demo generated content block। এখানে real AI content বসবে।</p>
    `.trim();

        const selectedText = window.getSelection()?.toString().trim();

        if (selectedText) {
            replaceSelectedText(`${selectedText} — উন্নত সংস্করণ`);
            return;
        }

        insertHtmlAtCursor(generated);
    };

    const handleVoiceTyping = () => {
        alert("Voice typing hook ready. Existing speech-to-text logic এখানে bind করো।");
    };

    const handleUnicodeToBijoy = () => {
        const convertedSelected = replaceSelectedTextWithTransformed((input) =>
            convertBanglaText(input, "unicode-to-bijoy"),
        );

        if (convertedSelected) {
            setFontFamily(FONT_BY_ENCODING.bijoy);
            alert("Selected text Unicode → Bijoy converted.");
            return;
        }

        const shouldConvertWholeDoc = window.confirm(
            "কোনো text select করা নেই। পুরো document Unicode → Bijoy convert করতে চাও?",
        );

        if (!shouldConvertWholeDoc) return;

        transformWholeDocumentText((currentHtml) =>
            convertHtmlTextNodes(currentHtml, "unicode-to-bijoy"),
        );
        setFontFamily(FONT_BY_ENCODING.bijoy);
        alert("Whole document Unicode → Bijoy converted.");
    };

    const handleBijoyToUnicode = () => {
        const convertedSelected = replaceSelectedTextWithTransformed((input) =>
            convertBanglaText(input, "bijoy-to-unicode"),
        );

        if (convertedSelected) {
            setFontFamily(FONT_BY_ENCODING.unicode);
            alert("Selected text Bijoy → Unicode converted.");
            return;
        }

        const shouldConvertWholeDoc = window.confirm(
            "কোনো text select করা নেই। পুরো document Bijoy → Unicode convert করতে চাও?",
        );

        if (!shouldConvertWholeDoc) return;

        transformWholeDocumentText((currentHtml) =>
            convertHtmlTextNodes(currentHtml, "bijoy-to-unicode"),
        );
        setFontFamily(FONT_BY_ENCODING.unicode);
        alert("Whole document Bijoy → Unicode converted.");
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden"
                        >
                            <PanelLeft className="h-5 w-5" />
                        </button>

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                            <Sparkles className="h-5 w-5" />
                        </div>

                        <div>
                            <h1 className="text-lg font-semibold tracking-tight text-slate-950">
                                BanglaDoc AI
                            </h1>
                            <p className="text-xs text-slate-500">
                                Production-ready Bangla document workspace
                            </p>
                        </div>
                    </div>

                    <div className="hidden w-full max-w-md items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search templates, actions, documents..."
                            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right shadow-sm sm:block">
                            <div className="text-xs text-slate-500">Workspace</div>
                            <div className="text-sm font-semibold text-slate-900">
                                Editor / Draft-01
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[1600px] px-4 py-4 md:px-6">
                <TopRibbon
                    currentFont={fontFamily}
                    currentFontSize={fontSize}
                    onFontChange={applyFontFamily}
                    onFontSizeChange={applyFontSize}
                    onUndo={undo}
                    onRedo={redo}
                    onSave={handleSave}
                    onExportPdf={handleExportPdf}
                    onExportDocx={handleExportDocx}
                    onVoiceTyping={handleVoiceTyping}
                    onAiGrammar={handleAiGrammar}
                    onAiGenerate={handleAiGenerate}
                    onAlign={applyAlignment}
                    onUnicodeToBijoy={handleUnicodeToBijoy}
                    onBijoyToUnicode={handleBijoyToUnicode}
                    onBold={toggleBold}
                    onItalic={toggleItalic}
                    onUnderline={toggleUnderline}
                />

                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <div className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
                        <div className="h-[calc(100vh-180px)]">
                            <TemplateSidebar
                                templates={templates}
                                activeTemplateId={activeTemplateId}
                                onSelectTemplate={applyTemplate}
                            />
                        </div>
                    </div>

                    <section className="rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                        <div className="border-b border-slate-200 px-4 py-3">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Document Editor
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Unicode/Bijoy conversion-ready, Bangla-safe editing pipeline
                                    </p>
                                </div>

                                <div className="rounded-full bg-white px-3 py-1.5 text-xs text-slate-500 ring-1 ring-slate-200">
                                    Active Font:{" "}
                                    <span className="font-semibold text-slate-800">{fontFamily}</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[calc(100vh-245px)] overflow-auto rounded-b-2xl bg-[#eef2f7]">
                            <A4PageEditor
                                editorRef={editorRef}
                                html={html}
                                onInput={handleInput}
                                onBeforeInput={handleBeforeInput}
                                fontFamily={fontFamily}
                                fontSize={fontSize}
                            />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}