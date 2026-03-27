function normalizeWhitespace(text) {
    return text
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/[ ]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function normalizeBanglaPunctuation(text) {
    return text
        .replace(/\s+([,.;:!?])/g, "$1")
        .replace(/([,.;:!?])([^\s])/g, "$1 $2")
        .replace(/\s+([।])/g, "$1")
        .replace(/([।])([^\s])/g, "$1 $2")
        .replace(/[“”]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/\.{3,}/g, "…");
}

function normalizeBanglaChars(text) {
    return text
        .replace(/ড়়/g, "ড়")
        .replace(/ঢ়়/g, "ঢ়")
        .replace(/য়়/g, "য়");
}

function basicGrammarCleanup(input) {
    let output = String(input || "");

    output = normalizeWhitespace(output);
    output = normalizeBanglaPunctuation(output);
    output = normalizeBanglaChars(output);

    return output;
}

async function fixGrammarText(text) {
    return basicGrammarCleanup(text);
}

module.exports = {
    fixGrammarText,
};
