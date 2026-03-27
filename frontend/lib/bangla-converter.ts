export type ConversionDirection = "unicode-to-bijoy" | "bijoy-to-unicode";

type Rule = {
    from: string;
    to: string;
};

const unicodeToBijoyRules: Rule[] = [
    { from: "ক্ষ", to: "¶" },
    { from: "জ্ঞ", to: "Á" },
    { from: "ত্র", to: "Î" },
    { from: "আ", to: "Av" },
    { from: "অ", to: "A" },
    { from: "ই", to: "B" },
    { from: "ঈ", to: "C" },
    { from: "উ", to: "D" },
    { from: "ঊ", to: "E" },
    { from: "এ", to: "G" },
    { from: "ও", to: "I" },
    { from: "ক", to: "K" },
    { from: "খ", to: "L" },
    { from: "গ", to: "M" },
    { from: "ঘ", to: "N" },
    { from: "ঙ", to: "O" },
    { from: "চ", to: "P" },
    { from: "ছ", to: "Q" },
    { from: "জ", to: "R" },
    { from: "ঝ", to: "S" },
    { from: "ঞ", to: "T" },
    { from: "ট", to: "U" },
    { from: "ঠ", to: "V" },
    { from: "ড", to: "W" },
    { from: "ঢ", to: "X" },
    { from: "ণ", to: "Y" },
    { from: "ত", to: "Z" },
    { from: "থ", to: "_" },
    { from: "দ", to: "`" },
    { from: "ধ", to: "a" },
    { from: "ন", to: "b" },
    { from: "প", to: "c" },
    { from: "ফ", to: "d" },
    { from: "ব", to: "e" },
    { from: "ভ", to: "f" },
    { from: "ম", to: "g" },
    { from: "য", to: "h" },
    { from: "র", to: "i" },
    { from: "ল", to: "j" },
    { from: "শ", to: "k" },
    { from: "ষ", to: "l" },
    { from: "স", to: "m" },
    { from: "হ", to: "n" },
    { from: "া", to: "v" },
    { from: "ি", to: "w" },
    { from: "ী", to: "x" },
    { from: "ু", to: "y" },
    { from: "ূ", to: "z" },
    { from: "ে", to: "‡" },
    { from: "ো", to: "†v" },
    { from: "্", to: "&" },
    { from: "০", to: "0" },
    { from: "১", to: "1" },
    { from: "২", to: "2" },
    { from: "৩", to: "3" },
    { from: "৪", to: "4" },
    { from: "৫", to: "5" },
    { from: "৬", to: "6" },
    { from: "৭", to: "7" },
    { from: "৮", to: "8" },
    { from: "৯", to: "9" },
];

const bijoyToUnicodeRules: Rule[] = [
    { from: "Av", to: "আ" },
    { from: "A", to: "অ" },
    { from: "B", to: "ই" },
    { from: "C", to: "ঈ" },
    { from: "D", to: "উ" },
    { from: "E", to: "ঊ" },
    { from: "G", to: "এ" },
    { from: "I", to: "ও" },
    { from: "K", to: "ক" },
    { from: "L", to: "খ" },
    { from: "M", to: "গ" },
    { from: "N", to: "ঘ" },
    { from: "O", to: "ঙ" },
    { from: "P", to: "চ" },
    { from: "Q", to: "ছ" },
    { from: "R", to: "জ" },
    { from: "S", to: "ঝ" },
    { from: "T", to: "ঞ" },
    { from: "U", to: "ট" },
    { from: "V", to: "ঠ" },
    { from: "W", to: "ড" },
    { from: "X", to: "ঢ" },
    { from: "Y", to: "ণ" },
    { from: "Z", to: "ত" },
    { from: "_", to: "থ" },
    { from: "`", to: "দ" },
    { from: "a", to: "ধ" },
    { from: "b", to: "ন" },
    { from: "c", to: "প" },
    { from: "d", to: "ফ" },
    { from: "e", to: "ব" },
    { from: "f", to: "ভ" },
    { from: "g", to: "ম" },
    { from: "h", to: "য" },
    { from: "i", to: "র" },
    { from: "j", to: "ল" },
    { from: "k", to: "শ" },
    { from: "l", to: "ষ" },
    { from: "m", to: "স" },
    { from: "n", to: "হ" },
    { from: "v", to: "া" },
    { from: "w", to: "ি" },
    { from: "x", to: "ী" },
    { from: "y", to: "ু" },
    { from: "z", to: "ূ" },
    { from: "‡", to: "ে" },
    { from: "†v", to: "ো" },
    { from: "&", to: "্" },
    { from: "0", to: "০" },
    { from: "1", to: "১" },
    { from: "2", to: "২" },
    { from: "3", to: "৩" },
    { from: "4", to: "৪" },
    { from: "5", to: "৫" },
    { from: "6", to: "৬" },
    { from: "7", to: "৭" },
    { from: "8", to: "৮" },
    { from: "9", to: "৯" },
];

function applyRules(input: string, rules: Rule[]) {
    let output = input;
    for (const rule of rules) {
        output = output.split(rule.from).join(rule.to);
    }
    return output;
}

export function convertBanglaText(input: string, direction: ConversionDirection) {
    if (!input) return input;
    return direction === "unicode-to-bijoy"
        ? applyRules(input, unicodeToBijoyRules)
        : applyRules(input, bijoyToUnicodeRules);
}

export function convertHtmlTextNodes(html: string, direction: ConversionDirection) {
    if (typeof window === "undefined") return html;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];

    let current = walker.nextNode();
    while (current) {
        textNodes.push(current as Text);
        current = walker.nextNode();
    }

    for (const node of textNodes) {
        node.textContent = convertBanglaText(node.textContent ?? "", direction);
    }

    return doc.body.innerHTML;
}