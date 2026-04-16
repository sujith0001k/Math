import { jsPDF } from "jspdf";

/* ─── STATE ─── */
let pages = 2;
const cfg = {
  addA: 50, addB: 50,
  subA: 80, subB: 40,
  mulA: 10
};

/* ─── PAGES CONTROL ─── */
document.getElementById('pagesDown').onclick = () => { if (pages > 1) { pages--; document.getElementById('pages-display').textContent = pages; refreshPreview(); } };
document.getElementById('pagesUp').onclick   = () => { if (pages < 20) { pages++; document.getElementById('pages-display').textContent = pages; refreshPreview(); } };

/* ─── RANGE BINDINGS ─── */
function bindRange(id, key, displayId) {
  const el = document.getElementById(id);
  const disp = document.getElementById(displayId);
  if (!el || !disp) return;
  el.oninput = () => { cfg[key] = +el.value; disp.textContent = el.value; refreshPreview(); };
}
bindRange('add-a', 'addA', 'add-a-val');
bindRange('add-b', 'addB', 'add-b-val');
bindRange('sub-a', 'subA', 'sub-a-val');
bindRange('sub-b', 'subB', 'sub-b-val');
bindRange('mul-a', 'mulA', 'mul-a-val');

/* ─── PROBLEM GENERATORS ─── */
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function genAddition() {
  const a = randInt(0, cfg.addA);
  const b = randInt(0, cfg.addB);
  return `${a} + ${b}`;
}

function genSubtraction() {
  let a = randInt(1, cfg.subA);
  const bMax = Math.min(cfg.subB, a - 1);
  const b = randInt(0, Math.max(0, bMax));
  if (a <= b) { const t = a; a = b + 1; }
  return `${a} - ${b}`;
}

function genMultiplication() {
  const a = randInt(1, cfg.mulA);
  return `${a} × 10`;
}

function genProblem() {
  const r = Math.random();
  if (r < 0.34) return { expr: genAddition(),      type: 'add' };
  if (r < 0.67) return { expr: genSubtraction(),   type: 'sub' };
  return            { expr: genMultiplication(),   type: 'mul' };
}

/* ─── PREVIEW ─── */
function refreshPreview() {
  const strip = document.getElementById('preview-strip');
  if (!strip) return;
  strip.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const p = genProblem();
    const pill = document.createElement('div');
    pill.className = 'preview-pill';
    pill.textContent = `${p.expr} = ___`;
    strip.appendChild(pill);
  }
}
refreshPreview();

/* ─── PDF GENERATION ─── */
const generateBtn = document.getElementById('generateBtn');
if (generateBtn) {
    generateBtn.onclick = generatePDF;
}

function generatePDF() {
  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.innerHTML = '<span>⏳</span><span>Generating…</span>';

  setTimeout(() => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const PW = 210, PH = 297;
      const margin = 14;
      const contentW = PW - margin * 2;

      /* colour map */
      const colors = { add: [46, 125, 50], sub: [198, 40, 40], mul: [230, 81, 0] };

      for (let pg = 1; pg <= pages; pg++) {
        if (pg > 1) doc.addPage();

        /* ── HEADER ── */
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Math Questions', PW / 2, 16.5, { align: 'center' });

        /* ── SUB-HEADER ── */
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        doc.text(`Name: ________________________   Date: ${today}   Page ${pg} of ${pages}`, margin, 26);

        /* thin rule */
        doc.setDrawColor(150, 150, 150);
        doc.setLineWidth(0.2);
        doc.line(margin, 29, PW - margin, 29);

        /* ── GENERATE 100 PROBLEMS ── */
        const problems = [];
        for (let i = 0; i < 100; i++) problems.push(genProblem());

        /* layout: 5 columns × 20 rows */
        const cols = 5;
        const rows = 20;
        const cellW = contentW / cols;
        const cellH = (PH - 38) / rows;   /* 38 = top offset */
        const startY = 32;

        doc.setFont('helvetica', 'normal');

        for (let i = 0; i < 100; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = margin + col * cellW;
          const y = startY + row * cellH;

          const p = problems[i];

          /* problem text */
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(p.expr, x + 3, y + 6.0);

          /* answer line */
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text('= ______', x + cellW - 16, y + 6.0);

          /* cell divider */
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.1);
          doc.line(x, y + cellH, x + cellW, y + cellH);
          if (col < cols - 1) doc.line(x + cellW, y, x + cellW, y + cellH);
        }

        /* outer border */
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.2);
        doc.rect(margin, startY, contentW, rows * cellH);

        /* ── FOOTER ── */
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `+ Addition   - Subtraction   × Multiplication       Total: 100 problems`,
          PW / 2, PH - 6, { align: 'center' }
        );
      }

      doc.save(`antigravity-math-${pages}pages.pdf`);
      showToast('✅  PDF Downloaded!');
    } catch (e) {
      console.error(e);
      showToast('❌  Error generating PDF');
    }

    btn.disabled = false;
    btn.innerHTML = '<span>📥</span><span>Generate PDF</span>';
  }, 100);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
