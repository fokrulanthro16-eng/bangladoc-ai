"use client";

import type { RefObject } from "react";

type A4PageEditorProps = {
    editorRef: RefObject<HTMLDivElement | null>;
    html: string;
    onInput: () => void;
    onBeforeInput: () => void;
    fontFamily: string;
    fontSize: string;
};

export default function A4PageEditor({
    editorRef,
    html,
    onInput,
    onBeforeInput,
    fontFamily,
    fontSize,
}: A4PageEditorProps) {
    return (
        <div className="flex justify-center px-3 py-6 md:px-6">
            <div className="w-full overflow-x-auto">
                <div className="mx-auto min-w-[794px] max-w-[794px]">
                    <div className="mb-3 flex items-center justify-between px-1">
                        <div className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                            A4 Document
                        </div>
                        <div className="text-xs text-slate-500">210mm × 297mm</div>
                    </div>

                    <div className="rounded-[28px] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.12)] ring-1 ring-slate-200">
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            spellCheck={false}
                            onInput={onInput}
                            onBeforeInput={onBeforeInput}
                            className="min-h-[1123px] w-full rounded-2xl border border-dashed border-slate-200 bg-white px-[72px] py-[80px] text-slate-900 outline-none"
                            style={{
                                fontFamily,
                                fontSize: `${fontSize}px`,
                                lineHeight: 1.8,
                            }}
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
