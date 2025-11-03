/* ELITE — Retail Calculator v4 (High-contrast mode chooser + keyboard shortcuts + single-file fix) */
(function(){
  "use strict";

  // ---- constants ----
  const TAX_RATE = 0.08; // 8%
  const DELIVERY_FEE = 139;
  const FEES = { dining: 25, living: 15, bedroom: 25, canopy: 150 };

  // ---- dom helpers ----
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const nf = new Intl.NumberFormat('en-US', {style:'currency', currency:'USD'});
  const money = v => nf.format(v || 0);
  const num = v => {
    if (typeof v === 'number') return v;
    if (!v) return 0;
    const n = parseFloat(String(v).replace(/[^0-9.-]/g,''));
    return isFinite(n) ? n : 0;
  };
  const LS_ASSOC = 'elite_assoc_name';

  // ---- state ----
  let mode = 'cash';

  // ---- items table ----
  const itemsBody = $('#itemsBody');
  function addRow(data={qty:1, desc:'', unit:0}){
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="cell-num"></td>
      <td class="cell-qty"><input type="number" class="qty" min="0" step="1" value="${num(data.qty)}"></td>
      <td class="cell-desc"><input type="text" class="desc" placeholder="Description" value="${data.desc || ''}"></td>
      <td class="cell-unit"><input type="number" class="unit" min="0" step="0.01" value="${num(data.unit)}"></td>
      <td class="cell-line"><span class="line-val">$0.00</span></td>
      <td class="cell-actions"><button class="btn danger btnDel" title="Remove row">✖</button></td>
    `;
    itemsBody.appendChild(tr);
    renumberRows();
    updateLine(tr);
    (tr.querySelector('.desc') || tr.querySelector('.unit')).focus();
  }
  function clearRows(){
    itemsBody.innerHTML = '';
    renumberRows();
    updateTotals();
  }
  function renumberRows(){
    itemsBody.querySelectorAll('tr').forEach((tr, i)=> tr.querySelector('.cell-num').textContent = i+1);
  }
  function updateLine(tr){
    const qty = num(tr.querySelector('.qty').value);
    const unit = num(tr.querySelector('.unit').value);
    tr.querySelector('.line-val').textContent = money(qty * unit);
    updateTotals();
  }
  itemsBody.addEventListener('input', (e)=>{
    const tr = e.target.closest('tr'); if (!tr) return;
    if (e.target.matches('.qty,.unit')) updateLine(tr);
  });
  itemsBody.addEventListener('click', (e)=>{
    if (e.target.matches('.btnDel')){
      e.target.closest('tr').remove();
      renumberRows();
      updateTotals();
    }
  });

  // Quick add templates
  $$('.chip[data-template]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const label = btn.dataset.template;
      addRow({qty:1, desc:label, unit:0});
      const tr = itemsBody.lastElementChild;
      tr.querySelector('.unit').focus();
      tr.scrollIntoView({behavior:'smooth', block:'center'});
    });
  });

  // ---- assembly / delivery ----
  ['assmDining','assmLiving','assmBedroom','assmCanopy','includeDelivery'].forEach(id=>{
    const el = $('#'+id);
    if (el) el.addEventListener('input', updateTotals);
    if (el && el.type === 'checkbox') el.addEventListener('change', updateTotals);
  });
  // plus/minus steppers
  $$('.step').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const dir = btn.classList.contains('plus') ? 1 : -1;
      let v = Math.max(0, num(target.value) + dir);
      target.value = v;
      updateTotals();
    });
  });

  // ---- financing fields ----
  const approvedEl = $('#approved');
  const finDelEl = $('#finDel');
  const finAssmEl = $('#finAssm');
  [approvedEl, finDelEl, finAssmEl].forEach(el=> el.addEventListener('input', updateTotals));
  [finDelEl, finAssmEl].forEach(el=> el.addEventListener('change', updateTotals));

  // ---- mode ----
  function setMode(m){
    mode = m;
    const label = m === 'cash' ? 'Normal Payment' : (m === 'financing' ? 'Financing (Koalafi)' : 'Layaway');
    $('#modeLabel').textContent = label;
    $('.crumbModeText').textContent = (m==='financing') ? 'Financing' : (m==='layaway' ? 'Layaway' : 'Payment');
    $('#modeHint').textContent = (m==='cash')
      ? 'Tax 8%, Delivery $139 flat, Assembly selectable'
      : (m==='financing')
          ? 'Use approval to finance items and (optionally) delivery & assembly.'
          : '10% down today on total (items + tax + delivery + assembly).';
    $('#financingPanel').classList.toggle('hide', mode !== 'financing');
    $('#layawayPanel').classList.toggle('hide', mode !== 'layaway');
    $('#grandLabel').textContent = (mode === 'financing') ? 'Cash Due Today' : (mode === 'layaway' ? 'Total (for layaway calc)' : 'Total');

    $('#sumMode').textContent = label;
    $('#sumHint').textContent = (m==='cash')
      ? '8% tax · $139 delivery · assembly selectable'
      : (m==='financing')
        ? 'Choose what to finance. Cash due covers the rest + tax on cash items.'
        : '10% down shown below';
    updateTotals();
    if (mode === 'financing') approvedEl.focus();
  }

  $('#btnMode').addEventListener('click', ()=> openModeModal());
  $('#btnNew').addEventListener('click', ()=>{
    clearRows();
    addRow();
    ['assmDining','assmLiving','assmBedroom','assmCanopy'].forEach(id=> $('#'+id).value = 0);
    $('#includeDelivery').checked = true;
    $('#approved').value = 0;
    $('#notes').value = '';
    finDelEl.checked = false;
    finAssmEl.checked = false;
    setMode(mode);
    window.scrollTo({top:0, behavior:'smooth'});
  });
  function openModeModal(){
    const modal = $('#modeModal');
    modal.classList.add('visible'); modal.classList.remove('hidden');
    // focus first card
    const first = modal.querySelector('.card'); first && first.focus();
  }
  function closeModeModal(){ $('#modeModal').classList.remove('visible'); $('#modeModal').classList.add('hidden'); }
  $$('#modeModal .card').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const m = btn.dataset.mode;
      setMode(m);
      closeModeModal();
    });
    btn.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
  // Keyboard shortcuts for modal: 1,2,3 / arrows
  window.addEventListener('keydown', (e)=>{
    const modalOpen = !$('#modeModal').classList.contains('hidden') && $('#modeModal').classList.contains('visible');
    if (!modalOpen) return;
    if (e.key === 'Escape'){ closeModeModal(); return; }
    const cards = $$('#modeModal .card');
    const active = document.activeElement;
    let idx = cards.indexOf(active);
    if ((e.key === 'ArrowRight' || e.key === 'ArrowDown')){
      e.preventDefault(); cards[(idx+1+cards.length)%cards.length].focus(); return;
    }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp')){
      e.preventDefault(); cards[(idx-1+cards.length)%cards.length].focus(); return;
    }
    if (e.key === '1'){ cards[0].click(); }
    if (e.key === '2'){ cards[1].click(); }
    if (e.key === '3'){ cards[2].click(); }
  });

  // ---- totals computation ----
  function lines(){
    return Array.from(itemsBody.querySelectorAll('tr')).map(tr=>{
      const qty = num(tr.querySelector('.qty').value);
      const unit = num(tr.querySelector('.unit').value);
      const desc = tr.querySelector('.desc').value.trim();
      return {qty, unit, desc, line: qty * unit};
    });
  }
  function assemblyTotal(){
    const d = num($('#assmDining').value) * FEES.dining;
    const l = num($('#assmLiving').value) * FEES.living;
    const b = num($('#assmBedroom').value) * FEES.bedroom;
    const c = num($('#assmCanopy').value) * FEES.canopy;
    return {d,l,b,c, total: d+l+b+c};
  }

  function updateTotals(){
    const itemLines = lines();
    const subtotal = itemLines.reduce((a,b)=>a + b.line, 0);
    const assm = assemblyTotal();
    const delivery = $('#includeDelivery').checked ? DELIVERY_FEE : 0;

    let tax = 0, grand = 0;

    if (mode === 'cash'){
      tax = subtotal * TAX_RATE;
      grand = subtotal + tax + delivery + assm.total;
    } else if (mode === 'financing'){
      const approval = Math.max(0, num(approvedEl.value));
      // allocation: items -> delivery -> assembly
      let remaining = approval;

      const financedItems = Math.min(subtotal, remaining); remaining -= financedItems;
      const wantFinDel = !!finDelEl.checked;
      const wantFinAssm = !!finAssmEl.checked;

      const financedDelivery = wantFinDel ? Math.min(delivery, Math.max(0, remaining)) : 0; remaining -= financedDelivery;
      const financedAssembly = wantFinAssm ? Math.min(assm.total, Math.max(0, remaining)) : 0; remaining -= financedAssembly;

      const cashItems = Math.max(0, subtotal - financedItems);
      const cashDelivery = Math.max(0, delivery - financedDelivery);
      const cashAssembly = Math.max(0, assm.total - financedAssembly);

      tax = cashItems * TAX_RATE; // tax on cash items only
      const cashDue = cashItems + tax + cashDelivery + cashAssembly;
      grand = cashDue;

      $('#financedTotal').textContent = money(financedItems + financedDelivery + financedAssembly);
      $('#financeBreakdown').textContent = `Items ${money(financedItems)} • Delivery ${money(financedDelivery)} • Assembly ${money(financedAssembly)}`;
      $('#cashItems').textContent = money(cashItems);
      $('#cashDue').textContent = money(cashDue);
      $('#approvalStatus').textContent = money(remaining);
    } else if (mode === 'layaway'){
      tax = subtotal * TAX_RATE;
      grand = subtotal + tax + delivery + assm.total;
      const down = grand * 0.10;
      const balance = Math.max(0, grand - down);
      $('#layawayDown').textContent = money(down);
      $('#layawayBalance').textContent = money(balance);
    }

    $('#subtotal').textContent = money(subtotal);
    $('#tax').textContent = money(tax);
    $('#delivery').textContent = money(delivery);
    $('#assembly').textContent = money(assm.total);
    $('#grandTotal').textContent = money(grand);

    $('#sumLabel').textContent = (mode === 'financing') ? 'Cash Due Today' : 'Total';
    $('#sumValue').textContent = money(grand);
  }

  // ---- print ----
  function printQuote(){
    const associate = $('#associate').value.trim();
    if (associate) localStorage.setItem(LS_ASSOC, associate);

    const itemLines = lines();
    const assm = assemblyTotal();
    const delivery = $('#includeDelivery').checked ? DELIVERY_FEE : 0;
    const subtotal = itemLines.reduce((a,b)=>a + b.line, 0);

    const approval = Math.max(0, num($('#approved').value));
    const wantFinDel = !!$('#finDel').checked;
    const wantFinAssm = !!$('#finAssm').checked;

    let financedItems = 0, financedDelivery = 0, financedAssembly = 0, cashItems = 0, cashDelivery = 0, cashAssembly = 0;
    let tax = 0, grandCash = 0, down=0, balance=0;
    if (mode === 'financing'){
      let remaining = approval;
      financedItems = Math.min(subtotal, remaining); remaining -= financedItems;
      financedDelivery = wantFinDel ? Math.min(delivery, Math.max(0, remaining)) : 0; remaining -= financedDelivery;
      financedAssembly = wantFinAssm ? Math.min(assm.total, Math.max(0, remaining)) : 0; remaining -= financedAssembly;

      cashItems = Math.max(0, subtotal - financedItems);
      cashDelivery = Math.max(0, delivery - financedDelivery);
      cashAssembly = Math.max(0, assm.total - financedAssembly);

      tax = cashItems * TAX_RATE;
      grandCash = cashItems + tax + cashDelivery + cashAssembly;
    } else if (mode === 'cash'){
      tax = subtotal * TAX_RATE;
      grandCash = subtotal + tax + delivery + assm.total;
    } else {
      tax = subtotal * TAX_RATE;
      const total = subtotal + tax + delivery + assm.total;
      down = total * 0.10;
      balance = Math.max(0, total - down);
      grandCash = total;
    }

    const modeLabel = mode==='cash' ? 'Normal Payment' : (mode==='financing' ? 'Financing (Koalafi)' : 'Layaway');
    const today = new Date().toLocaleDateString();
    const valid = (()=>{const d = new Date(); d.setDate(d.getDate()+14); return d.toLocaleDateString();})();

    const itemsRows = itemLines.map((it,i)=>`
      <tr>
        <td>${i+1}</td>
        <td>${it.qty}</td>
        <td>${escapeHtml(it.desc)}</td>
        <td>${money(it.unit)}</td>
        <td>${money(it.line)}</td>
      </tr>
    `).join('') || `<tr><td colspan="5" style="opacity:.7">No items entered</td></tr>`;

    const finRows = (mode==='financing') ? `
      <div class="row"><span>Financed — Items</span><strong>${money(financedItems)}</strong></div>
      ${wantFinDel ? `<div class="row"><span>Financed — Delivery</span><strong>${money(financedDelivery)}</strong></div>` : ''}
      ${wantFinAssm ? `<div class="row"><span>Financed — Assembly</span><strong>${money(financedAssembly)}</strong></div>` : ''}
      <div class="row"><span>Financed — Total</span><strong>${money(financedItems + financedDelivery + financedAssembly)}</strong></div>
    ` : '';

    const html = `<!doctype html>
<html><head><meta charset="utf-8"/><title>ELITE Quote</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#111;background:#fff;margin:0;padding:24px;line-height:1.35}
  .head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
  .brand{font-weight:900;letter-spacing:.18em}
  .meta{font-size:12px;color:#333;display:grid;gap:2px;align-content:start}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{border-bottom:1px solid #ddd;padding:6px 5px;text-align:left}
  th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#333}
  .totals{max-width:360px;margin-left:auto;margin-top:10px;font-size:14px}
  .row{display:flex;justify-content:space-between;padding:2px 0}
  .grand{border-top:1px dashed #777;margin-top:6px;padding-top:6px;font-weight:700}
  .notes{margin:12px 0;border:1px dashed #aaa;border-radius:8px;padding:8px;min-height:60px;white-space:pre-wrap}
  .sign{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:24px}
  .sign .line{border-top:2px solid #333;height:22px;margin-bottom:4px}
  .section{margin-top:10px}
  .muted{color:#555;font-size:12px}
</style>
</head>
<body>
<div class="head">
  <div>
    <div class="brand">ELITE</div>
    ${associate ? `<div class="muted">Sales Associate: ${escapeHtml(associate)}</div>` : ''}
  </div>
  <div class="meta">
    <div>Quote #: ${Math.floor(Math.random()*900000+100000)}</div>
    <div>Date: ${today}</div>
    <div>Valid Until: ${valid}</div>
    <div>Mode: ${modeLabel}</div>
  </div>
</div>

<table>
  <thead><tr><th>#</th><th>Qty</th><th>Description</th><th>Unit</th><th>Line</th></tr></thead>
  <tbody>${itemsRows}</tbody>
</table>

<div class="totals">
  <div class="row"><span>Subtotal (items)</span><strong>${money(subtotal)}</strong></div>
  <div class="row"><span>Sales Tax (8% on items)</span><strong>${money(tax)}</strong></div>
  <div class="row"><span>Delivery</span><strong>${money(delivery)}</strong></div>
  <div class="row"><span>Assembly</span><strong>${money(assm.total)}</strong></div>
  <div class="row grand"><span>${mode==='financing' ? 'Cash Due Today' : 'Total'}</span><strong>${money(grandCash)}</strong></div>
  ${finRows}
  ${mode==='layaway' ? `<div class="row"><span>10% Down Payment</span><strong>${money(grandCash*0.10)}</strong></div>` : ''}
  ${mode==='layaway' ? `<div class="row"><span>Balance After Down</span><strong>${money(grandCash - (grandCash*0.10))}</strong></div>` : ''}
</div>

<div class="section">
  <div style="font-weight:700;margin-bottom:4px">Notes</div>
  <div class="notes">${escapeHtml($('#notes').value)}</div>
</div>

<div class="sign">
  <div><div class="line"></div>Customer Signature</div>
  <div><div class="line"></div>Sales Associate</div>
</div>

<div class="section muted">
  ${mode==='financing' ? 'Approval is applied in order: Items → Delivery → Assembly. Tax is only on any cash items portion.' : ''}
</div>

<script>window.onload=()=>{window.print();};<\/script>
</body></html>`;

    const w = window.open('', '_blank');
    if (!w) { alert('Please allow pop-ups to print the quote.'); return; }
    w.document.open(); w.document.write(html); w.document.close(); w.focus();
  }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }

  // ---- summary bar print ----
  $('#sumPrint').addEventListener('click', printQuote);
  $('#btnQuote').addEventListener('click', printQuote);

  // ---- wire up ----
  $('#btnAddRow').addEventListener('click', ()=> addRow());
  $('#btnClearRows').addEventListener('click', clearRows);

  // Associate persistence
  const assoc = localStorage.getItem(LS_ASSOC);
  if (assoc) $('#associate').value = assoc;
  $('#associate').addEventListener('input', ()=>{
    localStorage.setItem(LS_ASSOC, $('#associate').value.trim());
  });

  // start
  addRow();
  setMode('cash'); // default until modal
  document.addEventListener('DOMContentLoaded', ()=> openModeModal());
  updateTotals();
})();