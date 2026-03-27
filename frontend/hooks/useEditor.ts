"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TextAlignType = "left" | "center" | "right" | "justify";

type SelectionBookmark = {
    start: number;
    end: number;
};

type HistoryState = {
    html: string;
    selection: SelectionBookmark | null;
};

type ApplyStyleOptions = {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    fontStyle?: string;
    textDecoration?: string;
};

function getTextNodes(root: Node): Text[] {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let current = walker.nextNode();

    while (current) {
        if (current.nodeType === Node.TEXT_NODE) {
            nodes.push(current as Text);
        }
        current = walker.nextNode();
    }

    return nodes;
}

function getSelectionBookmark(root: HTMLElement): SelectionBookmark | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);

    if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
        return null;
    }

    const preStartRange = range.cloneRange();
    preStartRange.selectNodeContents(root);
    preStartRange.setEnd(range.startContainer, range.startOffset);
    const start = preStartRange.toString().length;

    const preEndRange = range.cloneRange();
    preEndRange.selectNodeContents(root);
    preEndRange.setEnd(range.endContainer, range.endOffset);
    const end = preEndRange.toString().length;

    return { start, end };
}

function restoreSelectionBookmark(root: HTMLElement, bookmark: SelectionBookmark | null) {
    if (!bookmark) return;

    const textNodes = getTextNodes(root);
    if (textNodes.length === 0) return;

    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();

    let accumulated = 0;
    let startNode: Text | null = null;
    let endNode: Text | null = null;
    let startOffset = 0;
    let endOffset = 0;

    for (const node of textNodes) {
        const textLength = node.textContent?.length ?? 0;

        if (!startNode && bookmark.start <= accumulated + textLength) {
            startNode = node;
            startOffset = Math.max(0, bookmark.start - accumulated);
        }

        if (!endNode && bookmark.end <= accumulated + textLength) {
            endNode = node;
            endOffset = Math.max(0, bookmark.end - accumulated);
            break;
        }

        accumulated += textLength;
    }

    if (!startNode) {
        startNode = textNodes[textNodes.length - 1];
        startOffset = startNode.textContent?.length ?? 0;
    }

    if (!endNode) {
        endNode = textNodes[textNodes.length - 1];
        endOffset = endNode.textContent?.length ?? 0;
    }

    range.setStart(startNode, Math.min(startOffset, startNode.textContent?.length ?? 0));
    range.setEnd(endNode, Math.min(endOffset, endNode.textContent?.length ?? 0));

    selection.removeAllRanges();
    selection.addRange(range);
}

function isBlockElement(el: HTMLElement) {
    const blockTags = new Set([
        "P",
        "DIV",
        "LI",
        "BLOCKQUOTE",
        "H1",
        "H2",
        "H3",
        "H4",
        "H5",
        "H6",
    ]);
    return blockTags.has(el.tagName);
}

function getClosestBlock(node: Node | null, root: HTMLElement): HTMLElement | null {
    let current: Node | null = node;

    while (current && current !== root) {
        if (current instanceof HTMLElement && isBlockElement(current)) {
            return current;
        }
        current = current.parentNode;
    }

    return root;
}

function unwrapElement(el: HTMLElement) {
    const parent = el.parentNode;
    if (!parent) return;

    while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
    }

    parent.removeChild(el);
}

function normalizeEditor(root: HTMLElement) {
    root.normalize();

    const emptyStyledSpans = root.querySelectorAll("span");
    emptyStyledSpans.forEach((span) => {
        if (!span.textContent?.trim() && !span.querySelector("br")) {
            span.remove();
        }
    });
}

function createStyledSpanFromOptions(options: ApplyStyleOptions) {
    const span = document.createElement("span");

    if (options.fontFamily) span.style.fontFamily = options.fontFamily;
    if (options.fontSize) span.style.fontSize = `${options.fontSize}px`;
    if (options.fontWeight) span.style.fontWeight = options.fontWeight;
    if (options.fontStyle) span.style.fontStyle = options.fontStyle;
    if (options.textDecoration) span.style.textDecoration = options.textDecoration;

    return span;
}

function wrapRange(range: Range, element: HTMLElement) {
    const fragment = range.extractContents();
    element.appendChild(fragment);
    range.insertNode(element);
}

function collectIntersectingElements<T extends Element>(
    root: HTMLElement,
    range: Range,
    selector: string,
) {
    const elements = Array.from(root.querySelectorAll(selector)) as T[];

    return elements.filter((el) => {
        const elRange = document.createRange();
        elRange.selectNodeContents(el);

        return (
            range.compareBoundaryPoints(Range.END_TO_START, elRange) < 0 &&
            range.compareBoundaryPoints(Range.START_TO_END, elRange) > 0
        );
    });
}

export function useEditor(initialHtml: string) {
    const editorRef = useRef<HTMLDivElement | null>(null);

    const [html, setHtml] = useState(initialHtml);
    const [fontFamily, setFontFamily] = useState("Noto Sans Bengali");
    const [fontSize, setFontSize] = useState("16");

    const historyRef = useRef<HistoryState[]>([]);
    const redoRef = useRef<HistoryState[]>([]);
    const isApplyingRef = useRef(false);

    const syncFromDom = useCallback(() => {
        const root = editorRef.current;
        if (!root) return;
        setHtml(root.innerHTML);
    }, []);

    const saveSnapshot = useCallback(() => {
        const root = editorRef.current;
        if (!root) return;

        const snapshot: HistoryState = {
            html: root.innerHTML,
            selection: getSelectionBookmark(root),
        };

        const last = historyRef.current[historyRef.current.length - 1];
        if (last && last.html === snapshot.html) return;

        historyRef.current.push(snapshot);

        if (historyRef.current.length > 100) {
            historyRef.current.shift();
        }

        redoRef.current = [];
    }, []);

    const focusEditor = useCallback(() => {
        editorRef.current?.focus();
    }, []);

    const setEditorHtml = useCallback(
        (nextHtml: string, pushHistory = true) => {
            const root = editorRef.current;
            if (!root) {
                setHtml(nextHtml);
                return;
            }

            if (pushHistory) {
                saveSnapshot();
            }

            isApplyingRef.current = true;
            root.innerHTML = nextHtml;
            normalizeEditor(root);
            setHtml(root.innerHTML);

            requestAnimationFrame(() => {
                isApplyingRef.current = false;
                focusEditor();
            });
        },
        [focusEditor, saveSnapshot],
    );

    useEffect(() => {
        const root = editorRef.current;
        if (!root) return;

        if (root.innerHTML !== initialHtml) {
            root.innerHTML = initialHtml;
            setHtml(initialHtml);
            historyRef.current = [
                {
                    html: initialHtml,
                    selection: null,
                },
            ];
            redoRef.current = [];
        }
    }, [initialHtml]);

    const applyDomChange = useCallback(
        (fn: (root: HTMLElement, range: Range) => void) => {
            const root = editorRef.current;
            if (!root) return;

            focusEditor();

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);

            if (!root.contains(range.commonAncestorContainer)) return;

            saveSnapshot();
            isApplyingRef.current = true;

            fn(root, range);

            normalizeEditor(root);
            setHtml(root.innerHTML);

            requestAnimationFrame(() => {
                isApplyingRef.current = false;
                focusEditor();
            });
        },
        [focusEditor, saveSnapshot],
    );

    const handleInput = useCallback(() => {
        if (isApplyingRef.current) return;
        syncFromDom();
    }, [syncFromDom]);

    const handleBeforeInput = useCallback(() => {
        saveSnapshot();
    }, [saveSnapshot]);

    const applyInlineStyle = useCallback(
        (options: ApplyStyleOptions) => {
            applyDomChange((root, range) => {
                if (range.collapsed) return;

                const span = createStyledSpanFromOptions(options);
                wrapRange(range, span);

                const selection = window.getSelection();
                if (!selection) return;

                const newRange = document.createRange();
                newRange.selectNodeContents(span);
                selection.removeAllRanges();
                selection.addRange(newRange);

                normalizeEditor(root);
            });
        },
        [applyDomChange],
    );

    const removeInlineStyleFromSelection = useCallback(
        (selector: string) => {
            applyDomChange((root, range) => {
                if (range.collapsed) return;

                const elements = collectIntersectingElements<HTMLElement>(root, range, selector);
                elements.forEach((el) => unwrapElement(el));
            });
        },
        [applyDomChange],
    );

    const toggleBold = useCallback(() => {
        const root = editorRef.current;
        if (!root) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);

        const boldElements = collectIntersectingElements<HTMLElement>(root, range, "strong, b");
        if (boldElements.length > 0) {
            removeInlineStyleFromSelection("strong, b");
            return;
        }

        applyDomChange((_editorRoot, selectedRange) => {
            if (selectedRange.collapsed) return;

            const strong = document.createElement("strong");
            wrapRange(selectedRange, strong);

            const selectionNow = window.getSelection();
            if (!selectionNow) return;

            const newRange = document.createRange();
            newRange.selectNodeContents(strong);
            selectionNow.removeAllRanges();
            selectionNow.addRange(newRange);
        });
    }, [applyDomChange, removeInlineStyleFromSelection]);

    const toggleItalic = useCallback(() => {
        const root = editorRef.current;
        if (!root) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);

        const italicElements = collectIntersectingElements<HTMLElement>(root, range, "em, i");
        if (italicElements.length > 0) {
            removeInlineStyleFromSelection("em, i");
            return;
        }

        applyDomChange((_editorRoot, selectedRange) => {
            if (selectedRange.collapsed) return;

            const em = document.createElement("em");
            wrapRange(selectedRange, em);

            const selectionNow = window.getSelection();
            if (!selectionNow) return;

            const newRange = document.createRange();
            newRange.selectNodeContents(em);
            selectionNow.removeAllRanges();
            selectionNow.addRange(newRange);
        });
    }, [applyDomChange, removeInlineStyleFromSelection]);

    const toggleUnderline = useCallback(() => {
        const root = editorRef.current;
        if (!root) return;

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);

        const underlineElements = collectIntersectingElements<HTMLElement>(
            root,
            range,
            'span[style*="text-decoration"]',
        );

        if (underlineElements.length > 0) {
            removeInlineStyleFromSelection('span[style*="text-decoration"]');
            return;
        }

        applyInlineStyle({ textDecoration: "underline" });
    }, [applyInlineStyle, removeInlineStyleFromSelection]);

    const applyFontFamily = useCallback(
        (nextFontFamily: string) => {
            setFontFamily(nextFontFamily);
            applyInlineStyle({ fontFamily: nextFontFamily });
        },
        [applyInlineStyle],
    );

    const applyFontSize = useCallback(
        (nextFontSize: string) => {
            setFontSize(nextFontSize);
            applyInlineStyle({ fontSize: nextFontSize });
        },
        [applyInlineStyle],
    );

    const applyAlignment = useCallback(
        (align: TextAlignType) => {
            applyDomChange((root, range) => {
                const block = getClosestBlock(range.commonAncestorContainer, root);
                if (!block) return;
                block.style.textAlign = align;
            });
        },
        [applyDomChange],
    );

    const replaceSelectedText = useCallback(
        (nextText: string) => {
            applyDomChange((_root, range) => {
                const textNode = document.createTextNode(nextText);
                range.deleteContents();
                range.insertNode(textNode);

                const selection = window.getSelection();
                if (!selection) return;

                const newRange = document.createRange();
                newRange.setStartAfter(textNode);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            });
        },
        [applyDomChange],
    );

    const insertHtmlAtCursor = useCallback(
        (nextHtml: string) => {
            applyDomChange((_root, range) => {
                const wrapper = document.createElement("div");
                wrapper.innerHTML = nextHtml;

                const fragment = document.createDocumentFragment();
                let lastNode: ChildNode | null = null;

                while (wrapper.firstChild) {
                    lastNode = fragment.appendChild(wrapper.firstChild);
                }

                range.deleteContents();
                range.insertNode(fragment);

                if (lastNode) {
                    const selection = window.getSelection();
                    if (!selection) return;

                    const newRange = document.createRange();
                    newRange.setStartAfter(lastNode);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
            });
        },
        [applyDomChange],
    );

    const replaceSelectedTextWithTransformed = useCallback(
        (transform: (input: string) => string) => {
            const selection = window.getSelection();
            const selectedText = selection?.toString() ?? "";

            if (!selectedText.trim()) return false;

            const transformed = transform(selectedText);
            replaceSelectedText(transformed);
            return true;
        },
        [replaceSelectedText],
    );

    const transformWholeDocumentText = useCallback(
        (transformHtml: (html: string) => string) => {
            const root = editorRef.current;
            if (!root) return;

            saveSnapshot();

            const nextHtml = transformHtml(root.innerHTML);

            isApplyingRef.current = true;
            root.innerHTML = nextHtml;
            normalizeEditor(root);
            setHtml(root.innerHTML);

            requestAnimationFrame(() => {
                isApplyingRef.current = false;
                focusEditor();
            });
        },
        [focusEditor, saveSnapshot],
    );

    const undo = useCallback(() => {
        const root = editorRef.current;
        if (!root) return;
        if (historyRef.current.length === 0) return;

        const current: HistoryState = {
            html: root.innerHTML,
            selection: getSelectionBookmark(root),
        };

        const previous = historyRef.current.pop();
        if (!previous) return;

        redoRef.current.push(current);

        isApplyingRef.current = true;
        root.innerHTML = previous.html;
        normalizeEditor(root);
        setHtml(root.innerHTML);

        requestAnimationFrame(() => {
            restoreSelectionBookmark(root, previous.selection);
            isApplyingRef.current = false;
            focusEditor();
        });
    }, [focusEditor]);

    const redo = useCallback(() => {
        const root = editorRef.current;
        if (!root) return;
        if (redoRef.current.length === 0) return;

        const current: HistoryState = {
            html: root.innerHTML,
            selection: getSelectionBookmark(root),
        };

        const next = redoRef.current.pop();
        if (!next) return;

        historyRef.current.push(current);

        isApplyingRef.current = true;
        root.innerHTML = next.html;
        normalizeEditor(root);
        setHtml(root.innerHTML);

        requestAnimationFrame(() => {
            restoreSelectionBookmark(root, next.selection);
            isApplyingRef.current = false;
            focusEditor();
        });
    }, [focusEditor]);

    const loadDocument = useCallback((nextHtml: string) => {
        const root = editorRef.current;

        if (root) {
            root.innerHTML = nextHtml;
            normalizeEditor(root);
        }

        setHtml(nextHtml);
        historyRef.current = [
            {
                html: nextHtml,
                selection: null,
            },
        ];
        redoRef.current = [];
    }, []);

    const editorApi = useMemo(
        () => ({
            editorRef,
            html,
            fontFamily,
            fontSize,
            setEditorHtml,
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
            focusEditor,
            setFontFamily,
        }),
        [
            html,
            fontFamily,
            fontSize,
            setEditorHtml,
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
            focusEditor,
        ],
    );

    return editorApi;
}
