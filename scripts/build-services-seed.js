/**
 * Build services seed data from extracted docx JSON.
 * Reads data/services-extracted.json, outputs services array with slug, description, content (HTML), faq.
 */
const fs = require('fs');
const path = require('path');

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function cleanTitle(title) {
  return title.replace(/\.docx$/i, '').trim();
}

function textToHtml(text) {
  if (!text || !text.trim()) return '';
  const blocks = text.split(/\n\n+/).map(s => s.trim()).filter(Boolean);
  const out = [];
  let inFaq = false;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (/^FAQ\s*–|^FAQ\s*-/i.test(block)) {
      inFaq = true;
      continue;
    }
    if (inFaq) continue;
    if (/^Edmonton\s*&\s*Surrounding\s*Areas$/i.test(block)) continue;
    if (/^📍|^📞/.test(block)) continue;
    if (block.match(/^Q:\s*.+\s*A:/s)) {
      inFaq = true;
      continue;
    }
    if (/^Our Repair Solution|^When .+ Is Required|^When .+ Are Needed|^When .+ Are Important|^Our Professional Solution|^Why Choose CrackBuster|^Interior vs Exterior|^When Parging Repair Is Needed|^When Honeycomb Repairs Are Needed|^When Garage Floor Repairs Are Important$/i.test(block)) {
      out.push(`<h2 class="service-details-h2">${block}</h2>`);
      continue;
    }
    if (block.includes('\n• ') || block.includes('\n\n• ')) {
      const lines = block.split(/\n/).filter(Boolean);
      const bulletLike = l => /^[•\-]/.test(l.trim()) || l.trim().startsWith('Cracks are') || l.trim().startsWith('Epoxy') || l.trim().startsWith('Surface') || l.trim().startsWith('Repairs') || l.trim().startsWith('Work is') || l.trim().startsWith('Steel') || l.trim().startsWith('Commercial') || l.trim().startsWith('No exterior') || l.trim().startsWith('Compatible') || l.trim().startsWith('Targeted') || l.trim().startsWith('Mechanical') || l.trim().startsWith('Delta') || l.trim().startsWith('Fully') || l.trim().startsWith('Drainage') || l.trim().startsWith('Excavation') || l.trim().startsWith('Surface Preparation') || l.trim().startsWith('High-Performance') || l.trim().startsWith('Smoothing') || l.trim().startsWith('Curing') || l.trim().startsWith('Drilling') || l.trim().startsWith('Port Installation') || l.trim().startsWith('Material Injection') || l.trim().startsWith('Flexible') || l.trim().startsWith('Minimal');
      const allBullets = lines.every(bulletLike);
      if (allBullets && lines.length > 0) {
        out.push(`<ul class="service-details-ul">${lines.map(b => `<li>${b.replace(/^[•\-]\s*/, '').trim()}</li>`).join('')}</ul>`);
        continue;
      }
      const first = lines[0];
      const bullets = lines.slice(1).filter(bulletLike);
      if (bullets.length) {
        out.push(`<p>${first}</p><ul class="service-details-ul">${bullets.map(b => `<li>${b.replace(/^[•\-]\s*/, '').trim()}</li>`).join('')}</ul>`);
        continue;
      }
    }
    if (block.length > 10) {
      out.push(`<p>${block.replace(/\n/g, ' ')}</p>`);
    }
  }
  return '<div class="service-intro"></div><section class="service-details">' + out.join('') + '</section>';
}

function parseFaq(content) {
  const faq = [];
  const faqMatch = content.match(/FAQ\s*[–\-]\s*.+?(?=\n\n\n|$)/is);
  if (!faqMatch) return faq;
  const faqBlock = faqMatch[0];
  const qaPairs = faqBlock.split(/(?=Q:)/i).filter(Boolean);
  for (const qa of qaPairs) {
    const m = qa.match(/Q:\s*(.+?)\s*A:\s*(.+)/is);
    if (m) {
      faq.push({
        question: m[1].replace(/\s+/g, ' ').trim(),
        answer: m[2].replace(/\s+/g, ' ').trim()
      });
    }
  }
  return faq;
}

function getDescription(content, maxLen = 220) {
  const plain = content.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, maxLen).replace(/\s+\S*$/, '') + '...';
}

const jsonPath = path.join(__dirname, '../data/services-extracted.json');
const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const services = raw.map((item) => {
  const title = cleanTitle(item.title);
  const slug = createSlug(title);
  const content = textToHtml(item.content);
  const faq = parseFaq(item.content);
  const description = getDescription(item.content);
  const image = `/images/services/${slug}/hero.webp`;
  const images = [
    `/images/services/${slug}/hero.webp`,
    `/images/services/${slug}/detail.webp`,
    `/images/services/${slug}/content.webp`
  ];
  return {
    title,
    slug,
    description,
    content,
    image,
    images,
    featured: ['Foundation Crack Repair (Vertical & Diagonal)', 'Exterior Foundation Waterproofing & Crack Repair', 'Basement Floor Crack Repair'].includes(title),
    faq
  };
});

const outPath = path.join(__dirname, '../data/services-seed-data.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(services, null, 2), 'utf8');
console.log('Wrote', services.length, 'services to', outPath);
