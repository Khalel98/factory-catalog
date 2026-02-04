import fs from 'fs';

const html = fs.readFileSync(process.argv[2] || 'documentation-source.html', 'utf8');

const sectionTitleRe = /vc_tta-title-text">([^<]+)<\/span>/g;
const linkRe = /class="download-button" target="_blank" href="([^"]+)"[^>]*><span>- ([^<]+)<\/span>/g;

// Split by panel so we keep section titles with their links
const panelSplits = html.split(/<div class="vc_tta-panel" id="[^"]*"/);
const sections = [];

for (let i = 1; i < panelSplits.length; i++) {
  const block = panelSplits[i];
  const titleMatch = block.match(/vc_tta-title-text">([^<]+)<\/span>/);
  const title = titleMatch ? titleMatch[1].trim() : '';
  const items = [];
  let m;
  const linkRe2 = /class="download-button" target="_blank" href="([^"]+)"[^>]*><span>- ([^<]+)<\/span>/g;
  while ((m = linkRe2.exec(block)) !== null) {
    items.push({ title: m[2].trim(), url: m[1] });
  }
  if (title && items.length > 0) {
    sections.push({ sectionTitle: title, items });
  }
}

const out = `// Auto-generated from HTML source. Do not edit by hand.
export interface DocumentationLink {
  title: string;
  url: string;
}

export interface DocumentationSection {
  sectionTitle: string;
  items: DocumentationLink[];
}

export const documentationSections: DocumentationSection[] = ${JSON.stringify(sections, null, 2)};
`;

fs.writeFileSync('app/data/documentation-downloads.ts', out);
console.log('Parsed', sections.length, 'sections,', sections.reduce((n, s) => n + s.items.length, 0), 'links');
