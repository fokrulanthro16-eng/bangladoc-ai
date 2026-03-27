"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "bangladoc_ai_editor_draft_v4";

const FONT_OPTIONS = [
    { label: "Arial", value: "Arial, Helvetica, sans-serif" },
    { label: "Nikosh", value: "Nikosh, Arial, sans-serif" },
    { label: "SutonnyMJ", value: "SutonnyMJ, Arial, sans-serif" },
    { label: "SolaimanLipi", value: "SolaimanLipi, Arial, sans-serif" },
];

const LANGUAGE_OPTIONS = [
    { label: "Auto", value: "auto" },
    { label: "Bangla", value: "bn" },
    { label: "English", value: "en" },
];

const DOC_TEMPLATES = [
    {
        id: "bangla-notes",
        title: "Bangla Notes",
        meta: "Last edited today",
        badge: "Draft",
        text: `বাংলা নোটস

আজকের কাজ:
- গুরুত্বপূর্ণ পয়েন্ট লিখতে হবে
- দরকারি তথ্য গুছিয়ে রাখতে হবে
- পরে Grammar Fix ব্যবহার করা যাবে
`,
    },
    {
        id: "client-letter",
        title: "Client Letter",
        meta: "Updated 1 hour ago",
        badge: "Ready",
        text: `Dear Client,

Thank you for your time and support.
We are sharing the latest update regarding your document workflow.

Please review the draft and let us know your feedback.

Best regards,
BanglaDoc AI Team
`,
    },
    {
        id: "article-outline",
        title: "Article Outline",
        meta: "Updated yesterday",
        badge: "Review",
        text: `Article Outline

1. Introduction
2. Problem Statement
3. Proposed Solution
4. Benefits
5. Conclusion
`,
    },
];

const ACTIVITIES = [
    "Use Grammar Fix only on selected text.",
    "Mic inserts directly into the main editor.",
    "Roman / Bijoy tools work on selection only.",
    "OCR inserts extracted text into the editor.",
];

export default function EditorPage() {
    const textareaRef = useRef(null);
    const recognitionRef = useRef(null);
    const selectionRef = useRef({ start: 0, end: 0 });
    const autosaveTimerRef = useRef(null);
    const fileInputRef = useRef(null);

    const heroRef = useRef(null);
    const editorRef = useRef(null);
    const docsRef = useRef(null);
    const toolsRef = useRef(null);
    const quickInfoRef = useRef(null);

    const [text, setText] = useState("");
    const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value);
    const [language, setLanguage] = useState("auto");
    const [isListening, setIsListening] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);
    const [status, setStatus] = useState("");
    const [leftCollapsed, setLeftCollapsed] = useState(false);
    const [lastSavedAt, setLastSavedAt] = useState("");
    const [hasLoadedDraft, setHasLoadedDraft] = useState(false);
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [ocrPreviewUrl, setOcrPreviewUrl] = useState("");
    const [ocrText, setOcrText] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (typeof window === "undefined") return;

        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setSpeechSupported(false);
            return;
        }

        setSpeechSupported(true);

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setStatus("Listening...");
        };

        recognition.onend = () => {
            setIsListening(false);
            setStatus("");
        };

        recognition.onerror = () => {
            setIsListening(false);
            setStatus("");
            window.alert("Mic failed in this browser.");
        };

        recognition.onresult = (event) => {
            let transcript = "";

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript;
                }
            }

            if (!transcript) return;
            insertAtCursor(`${transcript} `);
        };

        recognitionRef.current = recognition;

        return () => {
            try {
                recognition.stop();
            } catch (error) {
                // ignore
            }
        };
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                setHasLoadedDraft(true);
                return;
            }

            const saved = JSON.parse(raw);

            if (typeof saved.text === "string") setText(saved.text);
            if (typeof saved.fontFamily === "string") setFontFamily(saved.fontFamily);
            if (typeof saved.language === "string") setLanguage(saved.language);
            if (typeof saved.savedAt === "string") setLastSavedAt(saved.savedAt);
        } catch (error) {
            console.error("Failed to load draft:", error);
        } finally {
            setHasLoadedDraft(true);
        }
    }, []);

    useEffect(() => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (language === "bn") recognition.lang = "bn-BD";
        else if (language === "en") recognition.lang = "en-US";
        else recognition.lang = "bn-BD";
    }, [language]);

    useEffect(() => {
        if (!hasLoadedDraft) return;
        if (typeof window === "undefined") return;

        if (autosaveTimerRef.current) {
            clearTimeout(autosaveTimerRef.current);
        }

        autosaveTimerRef.current = setTimeout(() => {
            saveDraftToStorage(false);
        }, 2000);

        return () => {
            if (autosaveTimerRef.current) {
                clearTimeout(autosaveTimerRef.current);
            }
        };
    }, [text, fontFamily, language, hasLoadedDraft]);

    useEffect(() => {
        return () => {
            if (ocrPreviewUrl) {
                URL.revokeObjectURL(ocrPreviewUrl);
            }
        };
    }, [ocrPreviewUrl]);

    const editorStyle = useMemo(
        () => ({
            ...styles.textarea,
            fontFamily,
        }),
        [fontFamily]
    );

    const filteredDocs = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return DOC_TEMPLATES;

        return DOC_TEMPLATES.filter((doc) => {
            return (
                doc.title.toLowerCase().includes(q) ||
                doc.meta.toLowerCase().includes(q) ||
                doc.badge.toLowerCase().includes(q) ||
                doc.text.toLowerCase().includes(q)
            );
        });
    }, [searchTerm]);

    const updateSelection = () => {
        const el = textareaRef.current;
        if (!el) return;

        selectionRef.current = {
            start: el.selectionStart ?? 0,
            end: el.selectionEnd ?? 0,
        };
    };

    const setSelectionRange = (start, end) => {
        const el = textareaRef.current;
        if (!el) return;

        requestAnimationFrame(() => {
            el.focus();
            el.setSelectionRange(start, end);
            selectionRef.current = { start, end };
        });
    };

    const getSelectionInfo = () => {
        const el = textareaRef.current;
        if (!el) return null;

        const start = el.selectionStart ?? selectionRef.current.start ?? 0;
        const end = el.selectionEnd ?? selectionRef.current.end ?? 0;

        return {
            start,
            end,
            selectedText: text.slice(start, end),
        };
    };

    const replaceRange = (start, end, replacement) => {
        setText((prev) => {
            const next = prev.slice(0, start) + replacement + prev.slice(end);
            const nextEnd = start + replacement.length;
            setSelectionRange(start, nextEnd);
            return next;
        });
    };

    const insertAtCursor = (value) => {
        const { start, end } = selectionRef.current;

        setText((prev) => {
            const next = prev.slice(0, start) + value + prev.slice(end);
            const nextPos = start + value.length;
            setSelectionRange(nextPos, nextPos);
            return next;
        });
    };

    const requireSelection = () => {
        const info = getSelectionInfo();

        if (!info || info.start === info.end || !info.selectedText) {
            window.alert("Please select text first.");
            return null;
        }

        return info;
    };

    const saveDraftToStorage = (showStatus = true) => {
        if (typeof window === "undefined") return;

        try {
            const savedAt = new Date().toLocaleString();
            const payload = {
                text,
                fontFamily,
                language,
                savedAt,
            };

            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            setLastSavedAt(savedAt);

            if (showStatus) {
                setStatus("Draft saved.");
                setTimeout(() => setStatus(""), 1400);
            }
        } catch (error) {
            console.error("Failed to save draft:", error);
            if (showStatus) window.alert("Failed to save draft.");
        }
    };

    const loadDraftFromStorage = () => {
        if (typeof window === "undefined") return;

        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);

            if (!raw) {
                window.alert("No saved draft found.");
                return;
            }

            const saved = JSON.parse(raw);

            setText(typeof saved.text === "string" ? saved.text : "");
            setFontFamily(
                typeof saved.fontFamily === "string"
                    ? saved.fontFamily
                    : FONT_OPTIONS[0].value
            );
            setLanguage(typeof saved.language === "string" ? saved.language : "auto");
            setLastSavedAt(typeof saved.savedAt === "string" ? saved.savedAt : "");

            setStatus("Draft loaded.");
            setTimeout(() => setStatus(""), 1400);

            requestAnimationFrame(() => {
                textareaRef.current?.focus();
            });
        } catch (error) {
            console.error("Failed to load draft:", error);
            window.alert("Failed to load draft.");
        }
    };

    const clearSavedDraft = () => {
        if (typeof window === "undefined") return;

        const ok = window.confirm("Delete saved draft from browser?");
        if (!ok) return;

        try {
            window.localStorage.removeItem(STORAGE_KEY);
            setLastSavedAt("");
            setStatus("Saved draft removed.");
            setTimeout(() => setStatus(""), 1400);
        } catch (error) {
            console.error("Failed to clear saved draft:", error);
            window.alert("Failed to clear saved draft.");
        }
    };

    const handleGrammarFix = () => {
        const info = requireSelection();
        if (!info) return;

        const fixedText = fixGrammarLocal(info.selectedText, language);
        replaceRange(info.start, info.end, fixedText);
        setStatus("Grammar fixed.");
        setTimeout(() => setStatus(""), 1600);
    };

    const handleRomanToBangla = () => {
        const info = requireSelection();
        if (!info) return;

        const converted = romanToBangla(info.selectedText);
        replaceRange(info.start, info.end, converted);
        setStatus("Roman converted to Bangla.");
        setTimeout(() => setStatus(""), 1600);
    };

    const handleUnicodeToBijoy = () => {
        const info = requireSelection();
        if (!info) return;

        const converted = unicodeToBijoy(info.selectedText);
        replaceRange(info.start, info.end, converted);
        setStatus("Unicode converted to Bijoy.");
        setTimeout(() => setStatus(""), 1600);
    };

    const handleBijoyToUnicode = () => {
        const info = requireSelection();
        if (!info) return;

        const converted = bijoyToUnicode(info.selectedText);
        replaceRange(info.start, info.end, converted);
        setStatus("Bijoy converted to Unicode.");
        setTimeout(() => setStatus(""), 1600);
    };

    const handleMic = () => {
        if (!recognitionRef.current) {
            window.alert("Speech recognition is not supported in this browser.");
            return;
        }

        updateSelection();

        try {
            if (isListening) {
                recognitionRef.current.stop();
            } else {
                textareaRef.current?.focus();
                recognitionRef.current.start();
            }
        } catch (error) {
            console.error(error);
            window.alert("Mic failed.");
        }
    };

    const handlePickImage = () => {
        fileInputRef.current?.click();
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            window.alert("Please upload a JPG or PNG image.");
            return;
        }

        if (ocrPreviewUrl) {
            URL.revokeObjectURL(ocrPreviewUrl);
        }

        const previewUrl = URL.createObjectURL(file);
        setOcrPreviewUrl(previewUrl);

        try {
            setIsOcrLoading(true);
            setStatus("Extracting text from image...");

            const Tesseract = (await import("tesseract.js")).default;
            const ocrLang =
                language === "bn" ? "ben" : language === "en" ? "eng" : "eng+ben";

            const result = await Tesseract.recognize(file, ocrLang, {
                logger: () => { },
            });

            const extracted = cleanupOcrText(result?.data?.text || "");
            setOcrText(extracted);

            if (!extracted.trim()) {
                window.alert("No text detected from image.");
                setStatus("");
                return;
            }

            insertAtCursor(`${extracted}\n`);
            setStatus("OCR text inserted into editor.");
            setTimeout(() => setStatus(""), 1800);
        } catch (error) {
            console.error(error);
            setStatus("");
            window.alert("OCR failed.");
        } finally {
            setIsOcrLoading(false);
            event.target.value = "";
        }
    };

    const handleRemoveImage = () => {
        if (ocrPreviewUrl) {
            URL.revokeObjectURL(ocrPreviewUrl);
        }
        setOcrPreviewUrl("");
        setOcrText("");
        setStatus("Uploaded image removed.");
        setTimeout(() => setStatus(""), 1400);
    };

    const handleAppendOcrText = () => {
        if (!ocrText.trim()) {
            window.alert("No OCR text available.");
            return;
        }
        insertAtCursor(`${ocrText}\n`);
        setStatus("OCR text appended.");
        setTimeout(() => setStatus(""), 1400);
    };

    const handleReplaceWithOcrText = () => {
        if (!ocrText.trim()) {
            window.alert("No OCR text available.");
            return;
        }

        const ok = window.confirm("Replace entire editor text with OCR text?");
        if (!ok) return;

        setText(ocrText);
        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
        setStatus("Editor replaced with OCR text.");
        setTimeout(() => setStatus(""), 1400);
    };

    const handleLoadTemplate = (doc) => {
        const ok = window.confirm(`Load "${doc.title}" into editor?`);
        if (!ok) return;

        setText(doc.text);
        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
        setStatus(`${doc.title} loaded.`);
        setTimeout(() => setStatus(""), 1400);
    };

    const scrollToRef = (ref) => {
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleDownloadTxt = () => {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "bangladoc-ai.txt";
        document.body.appendChild(link);
        link.click();
        link.remove();

        URL.revokeObjectURL(url);
    };

    const handleExportPdf = () => {
        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            window.alert("Popup blocked. Please allow popups.");
            return;
        }

        const safeText = escapeHtml(text).replace(/\n/g, "<br />");
        const safeFont = escapeHtml(fontFamily);

        printWindow.document.write(`
      <html>
        <head>
          <title>BanglaDoc AI Export</title>
          <style>
            body {
              font-family: ${safeFont};
              padding: 24px;
              line-height: 1.7;
              word-break: break-word;
              white-space: normal;
              background: #ffffff;
              color: #111827;
            }
          </style>
        </head>
        <body>
          <div>${safeText}</div>
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handleClear = () => {
        const ok = window.confirm("Clear all text?");
        if (!ok) return;

        setText("");
        setStatus("");
        requestAnimationFrame(() => {
            textareaRef.current?.focus();
        });
    };

    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const charCount = text.length;
    const lineCount = text ? text.split("\n").length : 0;

    return (
        <div className="bangladoc-page" style={styles.page}>
            <style jsx>{`
        @media (max-width: 1200px) {
          .bangladoc-content-grid {
            grid-template-columns: 1fr !important;
          }
          .bangladoc-right-panel {
            order: 2;
          }
          .bangladoc-recent-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .bangladoc-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 900px) {
          .bangladoc-page {
            flex-direction: column;
          }
          .bangladoc-sidebar {
            width: 100% !important;
            border-bottom-left-radius: 24px;
            border-bottom-right-radius: 24px;
          }
          .bangladoc-main {
            padding: 16px !important;
          }
          .bangladoc-hero {
            padding: 20px !important;
          }
          .bangladoc-hero-title {
            font-size: 24px !important;
          }
          .bangladoc-recent-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .bangladoc-stats-grid {
            grid-template-columns: 1fr !important;
          }
          .bangladoc-toolbar {
            flex-direction: column;
          }
          .bangladoc-toolbar > button {
            width: 100%;
          }
          .bangladoc-top-controls {
            flex-direction: column;
          }
          .bangladoc-field-group {
            width: 100%;
            min-width: 100%;
          }
          .bangladoc-top-header {
            flex-direction: column;
            align-items: stretch;
          }
          .bangladoc-top-header-right {
            justify-content: space-between;
          }
          .bangladoc-hero-actions {
            width: 100%;
          }
          .bangladoc-hero-actions > button {
            flex: 1 1 100%;
          }
          .bangladoc-textarea {
            min-height: 55vh !important;
            font-size: 18px !important;
            padding: 14px !important;
          }
        }
      `}</style>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleImageUpload}
                style={{ display: "none" }}
            />

            <aside
                className="bangladoc-sidebar"
                style={{
                    ...styles.sidebar,
                    ...(leftCollapsed ? styles.sidebarCollapsed : {}),
                }}
            >
                <div style={styles.brandWrap}>
                    <div style={styles.brandIcon}>B</div>
                    {!leftCollapsed && (
                        <div>
                            <div style={styles.brandTitle}>BanglaDoc AI</div>
                            <div style={styles.brandSub}>Creative Writing Hub</div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setLeftCollapsed((prev) => !prev)}
                    style={styles.collapseBtn}
                >
                    {leftCollapsed ? "→" : "←"}
                </button>

                {!leftCollapsed && (
                    <>
                        <div style={styles.sideSection}>
                            <div style={styles.sideLabel}>Main</div>
                            <button
                                type="button"
                                onClick={() => scrollToRef(heroRef)}
                                style={styles.sideItemActive}
                            >
                                Dashboard
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToRef(editorRef)}
                                style={styles.sideItemButton}
                            >
                                Editor
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToRef(docsRef)}
                                style={styles.sideItemButton}
                            >
                                Recent Docs
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToRef(toolsRef)}
                                style={styles.sideItemButton}
                            >
                                OCR + Tools
                            </button>
                            <button
                                type="button"
                                onClick={() => scrollToRef(quickInfoRef)}
                                style={styles.sideItemButton}
                            >
                                Quick Info
                            </button>
                        </div>

                        <div style={styles.sideSection}>
                            <div style={styles.sideLabel}>Tools</div>
                            <div style={styles.sideMiniRow}>
                                <span style={styles.dotA} />
                                <span>Mic</span>
                            </div>
                            <div style={styles.sideMiniRow}>
                                <span style={styles.dotB} />
                                <span>Grammar</span>
                            </div>
                            <div style={styles.sideMiniRow}>
                                <span style={styles.dotC} />
                                <span>OCR / Bijoy</span>
                            </div>
                        </div>

                        <div style={styles.sideCard}>
                            <div style={styles.sideCardTitle}>Keep it focused</div>
                            <div style={styles.sideCardText}>
                                One main editor. Stable typing. Selected text only changes.
                            </div>
                        </div>
                    </>
                )}
            </aside>

            <main className="bangladoc-main" style={styles.main}>
                <div className="bangladoc-top-header" style={styles.topHeader}>
                    <div style={styles.searchWrap}>
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search recent documents..."
                            style={styles.searchInput}
                        />
                    </div>
                    <div
                        className="bangladoc-top-header-right"
                        style={styles.topHeaderRight}
                    >
                        <div style={styles.headerChip}>Live Workspace</div>
                        <div style={styles.avatar}>F</div>
                    </div>
                </div>

                <section ref={heroRef} className="bangladoc-hero" style={styles.hero}>
                    <div style={styles.heroTextWrap}>
                        <div style={styles.heroBadge}>Writing Dashboard</div>
                        <h1 className="bangladoc-hero-title" style={styles.heroTitle}>
                            Functional dashboard items
                        </h1>
                        <p style={styles.heroText}>
                            Search recent docs, click cards to load templates, use OCR preview
                            actions, and keep everything inside one main editor.
                        </p>
                    </div>

                    <div className="bangladoc-hero-actions" style={styles.heroActions}>
                        <button
                            type="button"
                            onClick={handlePickImage}
                            style={styles.heroBtnLight}
                            disabled={isOcrLoading}
                        >
                            {isOcrLoading ? "Reading Image..." : "Upload Image"}
                        </button>
                        <button
                            type="button"
                            onClick={handleExportPdf}
                            style={styles.heroBtnDark}
                        >
                            Export PDF
                        </button>
                    </div>
                </section>

                <section className="bangladoc-stats-grid" style={styles.statsGrid}>
                    <div style={styles.statCardA}>
                        <div style={styles.statLabel}>Words</div>
                        <div style={styles.statValue}>{wordCount}</div>
                    </div>

                    <div style={styles.statCardB}>
                        <div style={styles.statLabel}>Characters</div>
                        <div style={styles.statValue}>{charCount}</div>
                    </div>

                    <div style={styles.statCardC}>
                        <div style={styles.statLabel}>Lines</div>
                        <div style={styles.statValue}>{lineCount}</div>
                    </div>

                    <div style={styles.statCardD}>
                        <div style={styles.statLabel}>Saved</div>
                        <div style={styles.statValueSmall}>
                            {lastSavedAt ? "Yes" : "No"}
                        </div>
                    </div>
                </section>

                <section className="bangladoc-content-grid" style={styles.contentGrid}>
                    <div style={styles.centerColumn}>
                        <section ref={editorRef} style={styles.panel}>
                            <div className="bangladoc-top-controls" style={styles.topControls}>
                                <div className="bangladoc-field-group" style={styles.fieldGroup}>
                                    <label style={styles.label}>Font</label>
                                    <select
                                        value={fontFamily}
                                        onChange={(e) => setFontFamily(e.target.value)}
                                        style={styles.select}
                                    >
                                        {FONT_OPTIONS.map((font) => (
                                            <option key={font.label} value={font.value}>
                                                {font.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="bangladoc-field-group" style={styles.fieldGroup}>
                                    <label style={styles.label}>Language</label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        style={styles.select}
                                    >
                                        {LANGUAGE_OPTIONS.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div ref={toolsRef} className="bangladoc-toolbar" style={styles.toolbar}>
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={handleMic}
                                    style={{
                                        ...styles.actionBtn,
                                        ...(isListening ? styles.actionBtnDanger : {}),
                                    }}
                                >
                                    {isListening ? "Stop Mic" : "Start Mic"}
                                </button>

                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={handleGrammarFix}
                                    style={styles.actionBtn}
                                >
                                    Grammar Fix
                                </button>

                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={handleRomanToBangla}
                                    style={styles.actionBtn}
                                >
                                    Roman → Bangla
                                </button>

                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={handleUnicodeToBijoy}
                                    style={styles.actionBtn}
                                >
                                    Unicode → Bijoy
                                </button>

                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={handleBijoyToUnicode}
                                    style={styles.actionBtn}
                                >
                                    Bijoy → Unicode
                                </button>

                                <button
                                    type="button"
                                    onClick={handlePickImage}
                                    style={styles.actionBtn}
                                    disabled={isOcrLoading}
                                >
                                    {isOcrLoading ? "OCR Running..." : "Image OCR"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => saveDraftToStorage(true)}
                                    style={styles.actionBtn}
                                >
                                    Save Draft
                                </button>

                                <button
                                    type="button"
                                    onClick={loadDraftFromStorage}
                                    style={styles.actionBtn}
                                >
                                    Load Draft
                                </button>

                                <button
                                    type="button"
                                    onClick={clearSavedDraft}
                                    style={styles.actionBtn}
                                >
                                    Clear Saved Draft
                                </button>

                                <button
                                    type="button"
                                    onClick={handleDownloadTxt}
                                    style={styles.actionBtn}
                                >
                                    Download TXT
                                </button>

                                <button
                                    type="button"
                                    onClick={handleExportPdf}
                                    style={styles.actionBtn}
                                >
                                    Export PDF
                                </button>

                                <button
                                    type="button"
                                    onClick={handleClear}
                                    style={styles.clearBtn}
                                >
                                    Clear
                                </button>
                            </div>

                            {!speechSupported && (
                                <div style={styles.warn}>
                                    This browser does not support built-in speech recognition.
                                </div>
                            )}

                            {!!status && <div style={styles.status}>{status}</div>}

                            <div style={styles.savedInfo}>
                                <strong>Last Saved:</strong>{" "}
                                {lastSavedAt ? lastSavedAt : "Not saved yet"}
                                <span style={styles.savedInfoSub}> • Auto-save every 2 seconds</span>
                            </div>

                            <textarea
                                ref={textareaRef}
                                className="bangladoc-textarea"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onSelect={updateSelection}
                                onKeyUp={updateSelection}
                                onMouseUp={updateSelection}
                                onClick={updateSelection}
                                placeholder="Write here..."
                                spellCheck={false}
                                lang={language === "auto" ? "bn" : language}
                                dir="auto"
                                autoCorrect="off"
                                autoCapitalize="off"
                                autoComplete="off"
                                style={editorStyle}
                            />
                        </section>

                        <section ref={docsRef} style={styles.recentSection}>
                            <div style={styles.sectionTitle}>Recent Documents</div>
                            <div className="bangladoc-recent-grid" style={styles.recentGrid}>
                                {filteredDocs.length > 0 ? (
                                    filteredDocs.map((doc) => (
                                        <button
                                            key={doc.id}
                                            type="button"
                                            onClick={() => handleLoadTemplate(doc)}
                                            style={styles.recentCardButton}
                                        >
                                            <div style={styles.recentCard}>
                                                <div style={styles.recentIcon}>📄</div>
                                                <div style={styles.recentTitle}>{doc.title}</div>
                                                <div style={styles.recentMeta}>{doc.meta}</div>
                                                <div style={styles.recentBadge}>{doc.badge}</div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div style={styles.emptySearchBox}>
                                        No recent document matched your search.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <aside className="bangladoc-right-panel" style={styles.rightPanel}>
                        <div style={styles.rightCardPrimary}>
                            <div style={styles.rightCardLabel}>Workspace Tip</div>
                            <div style={styles.rightCardTitle}>
                                OCR preview is now actionable
                            </div>
                            <div style={styles.rightCardText}>
                                Upload image, preview it, append OCR text, replace editor text, or remove the image.
                            </div>
                        </div>

                        {ocrPreviewUrl ? (
                            <div style={styles.rightCard}>
                                <div style={styles.sectionTitleSmall}>Uploaded Image</div>
                                <img
                                    src={ocrPreviewUrl}
                                    alt="Uploaded preview"
                                    style={styles.previewImage}
                                />

                                <div style={styles.previewActions}>
                                    <button
                                        type="button"
                                        onClick={handleAppendOcrText}
                                        style={styles.smallActionBtn}
                                    >
                                        Append OCR Text
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReplaceWithOcrText}
                                        style={styles.smallActionBtn}
                                    >
                                        Replace Editor Text
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        style={styles.smallDangerBtn}
                                    >
                                        Remove Image
                                    </button>
                                </div>
                            </div>
                        ) : null}

                        <div style={styles.rightCard}>
                            <div style={styles.sectionTitleSmall}>Activity</div>
                            <div style={styles.activityList}>
                                {ACTIVITIES.map((item) => (
                                    <div key={item} style={styles.activityItem}>
                                        <span style={styles.activityDot} />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div ref={quickInfoRef} style={styles.rightCard}>
                            <div style={styles.sectionTitleSmall}>Quick Info</div>
                            <div style={styles.quickStatRow}>
                                <span>Font</span>
                                <strong>
                                    {FONT_OPTIONS.find((f) => f.value === fontFamily)?.label ||
                                        "Custom"}
                                </strong>
                            </div>
                            <div style={styles.quickStatRow}>
                                <span>Language</span>
                                <strong>
                                    {LANGUAGE_OPTIONS.find((l) => l.value === language)?.label ||
                                        "Auto"}
                                </strong>
                            </div>
                            <div style={styles.quickStatRow}>
                                <span>Listening</span>
                                <strong>{isListening ? "Yes" : "No"}</strong>
                            </div>
                            <div style={styles.quickStatRow}>
                                <span>Saved Draft</span>
                                <strong>{lastSavedAt ? "Available" : "None"}</strong>
                            </div>
                        </div>
                    </aside>
                </section>
            </main>
        </div>
    );
}

function fixGrammarLocal(input, language) {
    const text = String(input || "");
    const detectedLanguage = language === "auto" ? detectLanguage(text) : language;

    if (detectedLanguage === "en") {
        return fixEnglishGrammar(text);
    }

    return fixBanglaGrammar(text);
}

function detectLanguage(text) {
    const banglaChars = (text.match(/[\u0980-\u09FF]/g) || []).length;
    const englishChars = (text.match(/[A-Za-z]/g) || []).length;
    return englishChars >= banglaChars ? "en" : "bn";
}

function fixEnglishGrammar(input) {
    let text = String(input || "");

    text = text.replace(/\r\n/g, "\n");
    text = text.replace(/[ \t]+/g, " ");
    text = text.replace(/[ ]+\n/g, "\n");
    text = text.replace(/\n{3,}/g, "\n\n");
    text = text.replace(/[“”]/g, '"');
    text = text.replace(/[‘’]/g, "'");
    text = text.replace(/\s+([,.;:!?])/g, "$1");
    text = text.replace(/([,.;:!?])([^\s\n])/g, "$1 $2");
    text = text.replace(/\bi\b/g, "I");

    const replacements = [
        [/\bI loves\b/gi, "I love"],
        [/\bI are\b/gi, "I am"],
        [/\bwe loves\b/gi, "we love"],
        [/\bthey loves\b/gi, "they love"],
        [/\byou loves\b/gi, "you love"],
        [/\bhe go\b/gi, "he goes"],
        [/\bshe go\b/gi, "she goes"],
        [/\bit go\b/gi, "it goes"],
        [/\bhe have\b/gi, "he has"],
        [/\bshe have\b/gi, "she has"],
        [/\bit have\b/gi, "it has"],
        [/\bhe do\b/gi, "he does"],
        [/\bshe do\b/gi, "she does"],
        [/\bit do\b/gi, "it does"],
        [/\ban university\b/gi, "a university"],
        [/\ba apple\b/gi, "an apple"],
        [/\ba egg\b/gi, "an egg"],
        [/\ba honest man\b/gi, "an honest man"],
        [/\ba hour\b/gi, "an hour"],
        [/\ban book\b/gi, "a book"],
        [/\ban car\b/gi, "a car"],
        [/\bthere have\b/gi, "there are"],
        [/\bthere has\b/gi, "there is"],
        [/\bhe don't\b/gi, "he doesn't"],
        [/\bshe don't\b/gi, "she doesn't"],
        [/\bit don't\b/gi, "it doesn't"],
        [/\bwe was\b/gi, "we were"],
        [/\bthey was\b/gi, "they were"],
        [/\bi were\b/gi, "I was"],
    ];

    for (const [pattern, replacement] of replacements) {
        text = text.replace(pattern, replacement);
    }

    text = text.replace(/\bbangladesh\b/gi, "Bangladesh");
    text = text.replace(/\bdhaka\b/gi, "Dhaka");
    text = text.replace(/\benglish\b/gi, "English");
    text = text.replace(/\bbangla\b/gi, "Bangla");

    const lines = text.split("\n").map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";

        let out = capitalizeSentence(trimmed);

        if (!/[.?!]$/.test(out)) {
            out += ".";
        }

        return out;
    });

    return lines.join("\n").trim();
}

function fixBanglaGrammar(input) {
    let text = String(input || "");

    text = text.replace(/\r\n/g, "\n");
    text = text.replace(/[ \t]+/g, " ");
    text = text.replace(/[ ]+\n/g, "\n");
    text = text.replace(/\n{3,}/g, "\n\n");
    text = text.replace(/\s+([,.;:!?])/g, "$1");
    text = text.replace(/\s+([।])/g, "$1");
    text = text.replace(/([,.;:!?।])([^\s\n])/g, "$1 $2");
    text = text.replace(/[“”]/g, '"');
    text = text.replace(/[‘’]/g, "'");
    text = text.replace(/ড়়/g, "ড়");
    text = text.replace(/ঢ়়/g, "ঢ়");
    text = text.replace(/য়়/g, "য়");
    text = text.replace(/  +/g, " ");
    text = text.replace(/ ,/g, ",");
    text = text.replace(/ \./g, ".");
    text = text.replace(/ \?/g, "?");
    text = text.replace(/ !/g, "!");
    text = text.replace(/ ।/g, "।");

    return text.trim();
}

function capitalizeSentence(text) {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function romanToBangla(input) {
    const text = String(input || "");
    const lower = text.toLowerCase();

    const specialWords = [
        ["bangladesh", "বাংলাদেশ"],
        ["dhaka", "ঢাকা"],
        ["ami", "আমি"],
        ["tumi", "তুমি"],
        ["apni", "আপনি"],
        ["valo", "ভালো"],
        ["bhalo", "ভালো"],
        ["kemon", "কেমন"],
        ["ache", "আছে"],
        ["acha", "আছে"],
        ["shob", "সব"],
        ["alhamdulillah", "আলহামদুলিল্লাহ"],
    ];

    let specialApplied = lower;
    for (const [r, b] of specialWords) {
        const re = new RegExp(`\\b${escapeRegExp(r)}\\b`, "gi");
        specialApplied = specialApplied.replace(re, b);
    }

    const vowelsIndependent = {
        a: "আ",
        i: "ই",
        ii: "ঈ",
        u: "উ",
        uu: "ঊ",
        e: "এ",
        oi: "ঐ",
        o: "ও",
        ou: "ঔ",
        ri: "ঋ",
    };

    const vowelsKar = {
        a: "া",
        i: "ি",
        ii: "ী",
        u: "ু",
        uu: "ূ",
        e: "ে",
        oi: "ৈ",
        o: "ো",
        ou: "ৌ",
        ri: "ৃ",
    };

    const consonants = {
        kkh: "ক্ষ",
        ngk: "ঙ্ক",
        ngg: "ঙ্গ",
        nch: "ঞ্চ",
        njh: "ঞ্ঝ",
        ng: "ঙ",
        ny: "ঞ",
        kh: "খ",
        gh: "ঘ",
        chh: "ছ",
        ch: "চ",
        jh: "ঝ",
        th: "থ",
        dh: "ধ",
        ph: "ফ",
        bh: "ভ",
        sh: "শ",
        ss: "ষ",
        zh: "ঝ",
        tr: "ত্র",
        gy: "জ্ঞ",
        rr: "ড়",
        rh: "ঢ়",
        tt: "ট",
        dd: "ড",
        nn: "ণ",
        k: "ক",
        g: "গ",
        j: "জ",
        t: "ত",
        d: "দ",
        n: "ন",
        p: "প",
        b: "ব",
        m: "ম",
        y: "য়",
        r: "র",
        l: "ল",
        s: "স",
        h: "হ",
        w: "ও",
        z: "য",
        f: "ফ",
        q: "ক",
        x: "ক্স",
        c: "ক",
    };

    const vowelTokens = ["ou", "oi", "ii", "uu", "ri", "a", "i", "u", "e", "o"];
    const consonantTokens = [
        "kkh",
        "ngk",
        "ngg",
        "nch",
        "njh",
        "chh",
        "kh",
        "gh",
        "ch",
        "jh",
        "th",
        "dh",
        "ph",
        "bh",
        "sh",
        "ss",
        "zh",
        "tr",
        "gy",
        "rr",
        "rh",
        "tt",
        "dd",
        "nn",
        "ng",
        "ny",
        "k",
        "g",
        "j",
        "t",
        "d",
        "n",
        "p",
        "b",
        "m",
        "y",
        "r",
        "l",
        "s",
        "h",
        "w",
        "z",
        "f",
        "q",
        "x",
        "c",
    ];

    let i = 0;
    let out = "";

    while (i < specialApplied.length) {
        const current = specialApplied[i];

        if (!/[a-z]/.test(current)) {
            out += specialApplied[i];
            i += 1;
            continue;
        }

        let matchedConsonant = null;
        for (const token of consonantTokens) {
            if (specialApplied.startsWith(token, i)) {
                matchedConsonant = token;
                break;
            }
        }

        if (matchedConsonant) {
            out += consonants[matchedConsonant];
            i += matchedConsonant.length;

            let matchedVowel = null;
            for (const token of vowelTokens) {
                if (specialApplied.startsWith(token, i)) {
                    matchedVowel = token;
                    break;
                }
            }

            if (matchedVowel) {
                out += vowelsKar[matchedVowel] || "";
                i += matchedVowel.length;
            } else {
                let nextIsConsonant = false;
                for (const token of consonantTokens) {
                    if (specialApplied.startsWith(token, i)) {
                        nextIsConsonant = true;
                        break;
                    }
                }
                if (nextIsConsonant) out += "্";
            }

            continue;
        }

        let matchedVowel = null;
        for (const token of vowelTokens) {
            if (specialApplied.startsWith(token, i)) {
                matchedVowel = token;
                break;
            }
        }

        if (matchedVowel) {
            out += vowelsIndependent[matchedVowel] || matchedVowel;
            i += matchedVowel.length;
            continue;
        }

        out += specialApplied[i];
        i += 1;
    }

    return out;
}

function unicodeToBijoy(input) {
    const orderedMap = [
        ["ক্ষ", "¶"],
        ["জ্ঞ", "Á"],
        ["ত্র", "Î"],
        ["শ্র", "kª"],
        ["অ", "A"],
        ["আ", "Av"],
        ["ই", "B"],
        ["ঈ", "C"],
        ["উ", "D"],
        ["ঊ", "E"],
        ["ঋ", "F"],
        ["এ", "G"],
        ["ঐ", "H"],
        ["ও", "I"],
        ["ঔ", "J"],
        ["ক", "K"],
        ["খ", "L"],
        ["গ", "M"],
        ["ঘ", "N"],
        ["ঙ", "O"],
        ["চ", "P"],
        ["ছ", "Q"],
        ["জ", "R"],
        ["ঝ", "S"],
        ["ঞ", "T"],
        ["ট", "U"],
        ["ঠ", "V"],
        ["ড", "W"],
        ["ঢ", "X"],
        ["ণ", "Y"],
        ["ত", "Z"],
        ["থ", "_"],
        ["দ", "`"],
        ["ধ", "a"],
        ["ন", "b"],
        ["প", "c"],
        ["ফ", "d"],
        ["ব", "e"],
        ["ভ", "f"],
        ["ম", "g"],
        ["য", "h"],
        ["র", "i"],
        ["ল", "j"],
        ["শ", "k"],
        ["ষ", "l"],
        ["স", "m"],
        ["হ", "n"],
        ["ড়", "o"],
        ["ঢ়", "p"],
        ["য়", "q"],
        ["ৎ", "r"],
        ["ং", "s"],
        ["ঃ", "t"],
        ["ঁ", "u"],
        ["া", "v"],
        ["ি", "w"],
        ["ী", "x"],
        ["ু", "y"],
        ["ূ", "z"],
        ["ৃ", "„"],
        ["ে", "‡"],
        ["ৈ", "‰"],
        ["ো", "†v"],
        ["ৌ", "†Š"],
        ["্", "&"],
        ["।", "|"],
    ];

    let output = String(input || "");
    for (const [u, b] of orderedMap) {
        output = output.split(u).join(b);
    }
    return output;
}

function bijoyToUnicode(input) {
    const orderedMap = [
        ["†Š", "ৌ"],
        ["†v", "ো"],
        ["Av", "আ"],
        ["‡", "ে"],
        ["‰", "ৈ"],
        ["„", "ৃ"],
        ["&", "্"],
        ["|", "।"],
        ["kª", "শ্র"],
        ["¶", "ক্ষ"],
        ["Á", "জ্ঞ"],
        ["Î", "ত্র"],
        ["A", "অ"],
        ["B", "ই"],
        ["C", "ঈ"],
        ["D", "উ"],
        ["E", "ঊ"],
        ["F", "ঋ"],
        ["G", "এ"],
        ["H", "ঐ"],
        ["I", "ও"],
        ["J", "ঔ"],
        ["K", "ক"],
        ["L", "খ"],
        ["M", "গ"],
        ["N", "ঘ"],
        ["O", "ঙ"],
        ["P", "চ"],
        ["Q", "ছ"],
        ["R", "জ"],
        ["S", "ঝ"],
        ["T", "ঞ"],
        ["U", "ট"],
        ["V", "ঠ"],
        ["W", "ড"],
        ["X", "ঢ"],
        ["Y", "ণ"],
        ["Z", "ত"],
        ["_", "থ"],
        ["`", "দ"],
        ["a", "ধ"],
        ["b", "ন"],
        ["c", "প"],
        ["d", "ফ"],
        ["e", "ব"],
        ["f", "ভ"],
        ["g", "ম"],
        ["h", "য"],
        ["i", "র"],
        ["j", "ল"],
        ["k", "শ"],
        ["l", "ষ"],
        ["m", "স"],
        ["n", "হ"],
        ["o", "ড়"],
        ["p", "ঢ়"],
        ["q", "য়"],
        ["r", "ৎ"],
        ["s", "ং"],
        ["t", "ঃ"],
        ["u", "ঁ"],
        ["v", "া"],
        ["w", "ি"],
        ["x", "ী"],
        ["y", "ু"],
        ["z", "ূ"],
    ];

    let output = String(input || "");
    for (const [b, u] of orderedMap) {
        output = output.split(b).join(u);
    }
    return output;
}

function cleanupOcrText(input) {
    return String(input || "")
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/[ ]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #f7f8ff 0%, #eef5ff 45%, #f9f0ff 100%)",
        gap: "0",
    },
    sidebar: {
        width: "280px",
        padding: "24px 18px",
        background: "linear-gradient(180deg, #14c9c0 0%, #5567ff 52%, #9448ff 100%)",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        transition: "all 0.2s ease",
        flexShrink: 0,
    },
    sidebarCollapsed: {
        width: "92px",
    },
    brandWrap: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    brandIcon: {
        width: "46px",
        height: "46px",
        borderRadius: "15px",
        background: "rgba(255,255,255,0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "22px",
        fontWeight: "800",
        flexShrink: 0,
    },
    brandTitle: {
        fontSize: "20px",
        fontWeight: "800",
    },
    brandSub: {
        fontSize: "12px",
        opacity: 0.9,
    },
    collapseBtn: {
        border: "none",
        borderRadius: "12px",
        padding: "10px 12px",
        background: "rgba(255,255,255,0.18)",
        color: "#fff",
        cursor: "pointer",
        fontSize: "16px",
    },
    sideSection: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    sideLabel: {
        fontSize: "12px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        opacity: 0.8,
    },
    sideItemButton: {
        padding: "12px 14px",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.08)",
        fontSize: "14px",
        color: "#fff",
        border: "none",
        textAlign: "left",
        cursor: "pointer",
    },
    sideItemActive: {
        padding: "12px 14px",
        borderRadius: "12px",
        background: "#ffffff",
        color: "#2f2f97",
        fontSize: "14px",
        fontWeight: "700",
        border: "none",
        textAlign: "left",
        cursor: "pointer",
    },
    sideMiniRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "14px",
        padding: "8px 0",
    },
    dotA: {
        width: "10px",
        height: "10px",
        borderRadius: "999px",
        background: "#ffcf5a",
    },
    dotB: {
        width: "10px",
        height: "10px",
        borderRadius: "999px",
        background: "#77ff9d",
    },
    dotC: {
        width: "10px",
        height: "10px",
        borderRadius: "999px",
        background: "#ff8db4",
    },
    sideCard: {
        marginTop: "auto",
        padding: "16px",
        borderRadius: "18px",
        background: "rgba(255,255,255,0.16)",
        backdropFilter: "blur(6px)",
    },
    sideCardTitle: {
        fontSize: "15px",
        fontWeight: "700",
        marginBottom: "6px",
    },
    sideCardText: {
        fontSize: "13px",
        lineHeight: 1.6,
        opacity: 0.95,
    },
    main: {
        flex: 1,
        padding: "24px",
        minWidth: 0,
    },
    topHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        marginBottom: "18px",
        flexWrap: "wrap",
    },
    searchWrap: {
        flex: 1,
        maxWidth: "560px",
        minWidth: "220px",
    },
    searchInput: {
        width: "100%",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "14px 16px",
        background: "rgba(255,255,255,0.84)",
        outline: "none",
        fontSize: "14px",
        boxSizing: "border-box",
    },
    topHeaderRight: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flexWrap: "wrap",
    },
    headerChip: {
        borderRadius: "999px",
        padding: "10px 14px",
        background: "#ffffff",
        color: "#5b67ff",
        fontSize: "13px",
        fontWeight: "700",
        boxShadow: "0 8px 20px rgba(91,103,255,0.08)",
    },
    avatar: {
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #5b67ff 0%, #a04cff 100%)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "800",
        flexShrink: 0,
    },
    hero: {
        borderRadius: "24px",
        padding: "28px",
        marginBottom: "20px",
        background: "linear-gradient(135deg, #16cfc3 0%, #5567ff 55%, #9849ff 100%)",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        boxShadow: "0 18px 50px rgba(91, 103, 255, 0.18)",
        flexWrap: "wrap",
    },
    heroTextWrap: {
        minWidth: 0,
        flex: 1,
    },
    heroBadge: {
        display: "inline-block",
        padding: "8px 12px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.18)",
        fontSize: "12px",
        fontWeight: "700",
        marginBottom: "12px",
    },
    heroTitle: {
        margin: "0 0 8px 0",
        fontSize: "30px",
        lineHeight: 1.2,
    },
    heroText: {
        margin: 0,
        fontSize: "15px",
        lineHeight: 1.7,
        opacity: 0.95,
        maxWidth: "720px",
    },
    heroActions: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
    },
    heroBtnLight: {
        border: "none",
        borderRadius: "14px",
        padding: "12px 16px",
        background: "#ffffff",
        color: "#3535a5",
        fontWeight: "700",
        cursor: "pointer",
    },
    heroBtnDark: {
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: "14px",
        padding: "12px 16px",
        background: "rgba(255,255,255,0.15)",
        color: "#ffffff",
        fontWeight: "700",
        cursor: "pointer",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: "14px",
        marginBottom: "20px",
    },
    statCardA: {
        borderRadius: "20px",
        padding: "18px",
        background: "linear-gradient(135deg, #ff8fb1 0%, #ffb46c 100%)",
        color: "#fff",
        minWidth: 0,
    },
    statCardB: {
        borderRadius: "20px",
        padding: "18px",
        background: "linear-gradient(135deg, #1ed0b0 0%, #19c8cf 100%)",
        color: "#fff",
        minWidth: 0,
    },
    statCardC: {
        borderRadius: "20px",
        padding: "18px",
        background: "linear-gradient(135deg, #5b67ff 0%, #7f5cff 100%)",
        color: "#fff",
        minWidth: 0,
    },
    statCardD: {
        borderRadius: "20px",
        padding: "18px",
        background: "linear-gradient(135deg, #9749ff 0%, #d75fff 100%)",
        color: "#fff",
        minWidth: 0,
    },
    statLabel: {
        fontSize: "13px",
        opacity: 0.9,
        marginBottom: "8px",
    },
    statValue: {
        fontSize: "28px",
        fontWeight: "800",
        wordBreak: "break-word",
    },
    statValueSmall: {
        fontSize: "20px",
        fontWeight: "800",
        wordBreak: "break-word",
    },
    contentGrid: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.6fr) 320px",
        gap: "18px",
        alignItems: "start",
    },
    centerColumn: {
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        minWidth: 0,
    },
    panel: {
        background: "rgba(255,255,255,0.84)",
        border: "1px solid rgba(255,255,255,0.78)",
        borderRadius: "24px",
        padding: "20px",
        boxShadow: "0 18px 40px rgba(31, 41, 55, 0.08)",
        backdropFilter: "blur(10px)",
        minWidth: 0,
    },
    topControls: {
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "14px",
    },
    fieldGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        minWidth: "180px",
        flex: "1 1 180px",
    },
    label: {
        fontSize: "14px",
        fontWeight: "700",
        color: "#374151",
    },
    select: {
        border: "1px solid #d1d5db",
        borderRadius: "14px",
        padding: "12px 14px",
        fontSize: "14px",
        background: "#fff",
        color: "#111827",
        outline: "none",
    },
    toolbar: {
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "14px",
    },
    actionBtn: {
        border: "none",
        borderRadius: "14px",
        padding: "12px 16px",
        background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)",
        color: "#1f2937",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 6px 16px rgba(91, 103, 255, 0.10)",
    },
    actionBtnDanger: {
        background: "linear-gradient(135deg, #ff8fb1 0%, #ff6b81 100%)",
        color: "#fff",
    },
    clearBtn: {
        border: "none",
        borderRadius: "14px",
        padding: "12px 16px",
        background: "linear-gradient(135deg, #ffe4e6 0%, #ffd5cc 100%)",
        color: "#991b1b",
        fontWeight: "700",
        cursor: "pointer",
    },
    status: {
        marginBottom: "12px",
        border: "1px solid #dbeafe",
        background: "#eff6ff",
        color: "#1d4ed8",
        borderRadius: "12px",
        padding: "12px 14px",
        fontSize: "14px",
    },
    warn: {
        marginBottom: "12px",
        border: "1px solid #fecaca",
        background: "#fef2f2",
        color: "#b91c1c",
        borderRadius: "12px",
        padding: "12px 14px",
        fontSize: "14px",
    },
    savedInfo: {
        marginBottom: "12px",
        border: "1px solid #e5e7eb",
        background: "#f9fafb",
        color: "#374151",
        borderRadius: "12px",
        padding: "12px 14px",
        fontSize: "14px",
        lineHeight: 1.6,
    },
    savedInfoSub: {
        color: "#6b7280",
    },
    textarea: {
        width: "100%",
        minHeight: "66vh",
        resize: "vertical",
        border: "1px solid #dbe2ea",
        borderRadius: "20px",
        padding: "18px",
        fontSize: "20px",
        lineHeight: "1.8",
        outline: "none",
        boxSizing: "border-box",
        background: "#ffffff",
        color: "#111827",
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
    },
    recentSection: {
        background: "rgba(255,255,255,0.84)",
        border: "1px solid rgba(255,255,255,0.78)",
        borderRadius: "24px",
        padding: "18px",
        boxShadow: "0 18px 40px rgba(31,41,55,0.06)",
    },
    sectionTitle: {
        fontSize: "18px",
        fontWeight: "800",
        color: "#1f2937",
        marginBottom: "14px",
    },
    recentGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "14px",
    },
    recentCardButton: {
        border: "none",
        background: "transparent",
        padding: 0,
        textAlign: "left",
        cursor: "pointer",
    },
    recentCard: {
        borderRadius: "18px",
        padding: "16px",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
        border: "1px solid #edf2f7",
        boxShadow: "0 10px 24px rgba(31,41,55,0.04)",
        minWidth: 0,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
    },
    recentIcon: {
        fontSize: "22px",
        marginBottom: "10px",
    },
    recentTitle: {
        fontSize: "15px",
        fontWeight: "700",
        color: "#111827",
        marginBottom: "6px",
    },
    recentMeta: {
        fontSize: "13px",
        color: "#6b7280",
        marginBottom: "10px",
    },
    recentBadge: {
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: "999px",
        background: "#eef2ff",
        color: "#4f46e5",
        fontSize: "12px",
        fontWeight: "700",
    },
    emptySearchBox: {
        gridColumn: "1 / -1",
        padding: "18px",
        borderRadius: "16px",
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        color: "#6b7280",
        fontSize: "14px",
    },
    rightPanel: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        minWidth: 0,
    },
    rightCardPrimary: {
        borderRadius: "22px",
        padding: "18px",
        background: "linear-gradient(135deg, #16cfc3 0%, #5b67ff 100%)",
        color: "#fff",
        boxShadow: "0 16px 40px rgba(91,103,255,0.16)",
    },
    rightCardLabel: {
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        opacity: 0.85,
        marginBottom: "8px",
    },
    rightCardTitle: {
        fontSize: "18px",
        fontWeight: "800",
        lineHeight: 1.3,
        marginBottom: "8px",
    },
    rightCardText: {
        fontSize: "14px",
        lineHeight: 1.7,
        opacity: 0.95,
    },
    rightCard: {
        background: "rgba(255,255,255,0.84)",
        border: "1px solid rgba(255,255,255,0.78)",
        borderRadius: "22px",
        padding: "18px",
        boxShadow: "0 14px 32px rgba(31,41,55,0.06)",
    },
    sectionTitleSmall: {
        fontSize: "16px",
        fontWeight: "800",
        color: "#1f2937",
        marginBottom: "12px",
    },
    activityList: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    activityItem: {
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        color: "#374151",
        fontSize: "14px",
        lineHeight: 1.6,
    },
    activityDot: {
        width: "10px",
        height: "10px",
        borderRadius: "999px",
        background: "#5b67ff",
        marginTop: "6px",
        flexShrink: 0,
    },
    quickStatRow: {
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 0",
        borderBottom: "1px solid #f1f5f9",
        color: "#374151",
        fontSize: "14px",
    },
    previewImage: {
        width: "100%",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        display: "block",
        marginBottom: "12px",
    },
    previewActions: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },
    smallActionBtn: {
        border: "none",
        borderRadius: "12px",
        padding: "10px 12px",
        background: "linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)",
        color: "#1f2937",
        fontWeight: "700",
        cursor: "pointer",
    },
    smallDangerBtn: {
        border: "none",
        borderRadius: "12px",
        padding: "10px 12px",
        background: "linear-gradient(135deg, #ffe4e6 0%, #ffd5cc 100%)",
        color: "#991b1b",
        fontWeight: "700",
        cursor: "pointer",
    },
};
