/* =========================================================
   Elite Furniture – Catalog live‑search
   ========================================================= */

   document.addEventListener("DOMContentLoaded", () => {
    const searchBar = document.getElementById("searchBar");
    const cards     = Array.from(document.querySelectorAll(".product-card"));
  
    /* helper: extract numeric price from "$1,299" -> 1299 */
    const getPrice = card =>
      parseFloat(
        card.querySelector(".price").textContent.replace(/[^0-9.]/g, "")
      );
  
    /* helper: plain‑text blob for keyword search */
    const getKeywords = card =>
      (
        card.querySelector("h3").textContent + " " +                     // name
        card.querySelector(".model").textContent + " " +                 // model line
        (card.querySelector("img")?.alt || "") + " " +                   // alt text may hold color
        (card.dataset.color || "")                                       // optional data‑color attr
      ).toLowerCase();
  
    /* cache price & keyword string to avoid DOM work each keystroke */
    const CACHE = cards.map(card => ({
      el: card,
      price: getPrice(card),
      kw: getKeywords(card)
    }));
  
    /* live search */
    searchBar.addEventListener("input", () => {
      const qRaw = searchBar.value.trim();
      if (!qRaw) {
        // Show everything when box is empty
        CACHE.forEach(({ el }) => (el.style.display = "flex"));
        return;
      }
  
      const q = qRaw.toLowerCase();
      const isNumeric = /^\$?\d+(\.\d+)?$/.test(q);
      let numTarget   = null;
      if (isNumeric) numTarget = parseFloat(q.replace(/\$/g, ""));
  
      CACHE.forEach(({ el, kw, price }) => {
        let match = false;
  
        if (isNumeric) {
          /* ------- price search: within ±15 % or ±$50, whichever is larger ------- */
          const tolerance = Math.max(50, price * 0.15);
          match = Math.abs(price - numTarget) <= tolerance;
        } else {
          /* ------- keyword search (name, model, color) ------- */
          match = kw.includes(q);
        }
  
        el.style.display = match ? "flex" : "none";
      });
    });
  });
  