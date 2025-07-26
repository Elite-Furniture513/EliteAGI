document.querySelector('.pin-form').addEventListener('submit', e => {
  e.preventDefault();

  const pin = document.getElementById('pinInput').value.trim();
  const flex = parseInt(document.getElementById('flexInput').value.trim());

  if (!workers[pin]) {
    alert("❌ Invalid Worker PIN.");
    return;
  }

  if (isNaN(flex) || flex < 1 || flex > 10) {
    alert("⚠️ Please enter a number between 1 and 10 for pricing flexibility.");
    return;
  }

  const model = document.querySelector('.model-number').textContent.replace("Model ", "").trim();
  const pricing = productPricing[model];

  if (!pricing) {
    alert("⚠️ No pricing data found for this item.");
    return;
  }

  const finalPrice = pricing[flex];

  // ✅ Update and reveal price
  const priceEl = document.querySelector('.price');
  priceEl.textContent = finalPrice;
  priceEl.style.display = "block";

  e.target.reset();
});
