export type EditorTemplate = {
    id: string;
    title: string;
    category: string;
    description: string;
    content: string;
};

export const editorTemplates: EditorTemplate[] = [
    {
        id: "application",
        title: "Application",
        category: "Official",
        description: "ছুটির আবেদন, চাকরির আবেদন, সাধারণ অফিসিয়াল আবেদন",
        content: `
<p style="text-align:right;">তারিখ: __________</p>

<p>বরাবর,<br/>
____________________<br/>
____________________</p>

<p><strong>বিষয়: আবেদন।</strong></p>

<p>জনাব/জনাবা,</p>

<p>বিনীত নিবেদন এই যে, আমি ____________________________. 
অতএব, আপনার নিকট আমার আবেদন এই যে, বিষয়টি সদয় বিবেচনা করে প্রয়োজনীয় ব্যবস্থা গ্রহণ করলে কৃতজ্ঞ থাকব।</p>

<p>ধন্যবাদান্তে,</p>

<p>বিনীত,<br/>
নাম: __________________<br/>
ঠিকানা: _______________<br/>
মোবাইল: _______________</p>
    `.trim(),
    },
    {
        id: "email",
        title: "Email",
        category: "Communication",
        description: "Professional বাংলা/English email draft",
        content: `
<p><strong>Subject:</strong> ______________________________</p>

<p>Dear Sir/Madam,</p>

<p>I hope you are doing well.</p>

<p>I am writing to inform you that ________________________________. 
Please let me know if any further information is required.</p>

<p>Best regards,</p>

<p>__________________<br/>
__________________</p>
    `.trim(),
    },
    {
        id: "complaint",
        title: "Complaint",
        category: "Formal",
        description: "অভিযোগপত্র বা complaint draft",
        content: `
<p style="text-align:right;">তারিখ: __________</p>

<p>বরাবর,<br/>
____________________<br/>
____________________</p>

<p><strong>বিষয়: অভিযোগপত্র।</strong></p>

<p>জনাব/জনাবা,</p>

<p>বিনীতভাবে জানাচ্ছি যে, ____________________________________________. 
বিষয়টি দীর্ঘদিন ধরে সমস্যার সৃষ্টি করছে। তাই দ্রুত প্রয়োজনীয় পদক্ষেপ গ্রহণের অনুরোধ জানাচ্ছি।</p>

<p>ধন্যবাদান্তে,</p>

<p>নিবেদক,<br/>
নাম: __________________<br/>
ঠিকানা: _______________<br/>
মোবাইল: _______________</p>
    `.trim(),
    },
];
