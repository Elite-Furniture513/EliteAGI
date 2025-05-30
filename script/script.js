/* ---------- DELIVERY FEE TABLE ---------- */
const deliveryFees = {
    "45237":89,"45213":89,"45236":95,"45212":89,"45209":99,"45216":89,"45207":89,"45227":109,
    "45243":109,"45206":109,"45208":109,"41074":139,"45222":89,"45215":89,"45217":95,"45220":99,
    "45232":95,"41073":89,"45221":89,"45219":89,"45223":89,"45244":109,"41075":109,"45224":109,
    "45246":109,"45202":109,"45241":109,"45229":109,"41072":119,"45226":115,"45210":129,
    "41071":139,"45235":119,"45249":125,"45218":119,"45201":139,"45231":119,"45242":125,
    "45214":129,"45225":139,"45234":139,"45203":119,"45240":129,"45230":129,"45239":129,
    "45204":139,"41012":109,"41011":109,"45211":109,"45205":109,"41076":109,"41085":109,
    "41014":109,"45069":109,"45071":109,"41059":109,"45245":109,"41019":109,"45238":109,
    "45015":109,"41016":109,"45247":109,"45014":109,"45248":109,"45018":109,"45040":109,
    "45233":109,"41017":109,"45039":109,"45034":109,"45030":109,"45067":109,"41063":109,
    "45041":109,"45033":109,"45061":109,"45004":109,"45001":109,"41001":109,"41005":109,
    "41091":109,"45011":109,"45063":109,"41018":109,"41025":109,"45012":109,"45065":109,
    "45051":109,"45053":150,"41021":150,"45054":150,"45062":150,"45002":150,"41094":150,
    "45042":150,"45036":150,"41022":150,"45052":150,"41042":150,"41015":150,"45050":150,
    "45005":150,"41033":150,"45013":150,"45044":150,"45055":150,"41007":150,"41051":150,
    "41080":150,"45066":150,"41048":150,"45056":150,"41006":150,"45070":150,"45064":150,
    "45068":150,"41030":150,"41043":150,"41092":150,"45032":150,"45449":150,"45458":150,
    "45003":150,"45459":150,"41040":150,"41035":150,"41002":150,"45418":150,"45439":150,
    "45429":150,"45440":150,"41053":150,"41095":150,"41061":150,"45427":150,"41097":150,
    "41052":150,"45419":150,"45430":150,"45409":150,"45428":150,"45417":150,"41046":150,
    "41004":150,"45408":150,"45420":150,"45469":150,"45401":150,"45410":150,"45402":150,
    "45422":150,"45441":150,"45407":150,"45490":150,"45403":150,"45406":150,"45423":150,
    "41096":150,"45479":150,"45426":150,"41045":150,"45405":150,"45413":150,"41062":150,
    "45432":150,"41086":150,"45434":150,"45437":150,"45404":150,"45416":150,"41044":150,
    "45431":150,"41056":150,"41003":150,"41008":150,"41054":150,"41031":150,"45475":150,
    "45435":150,"45415":150,"45433":150,"41083":150,"45414":150,"41055":150,"45424":150,
    "41010":150,"41034":150,"41064":150,"41098":150,"45506":150,"45504":150,"45501":150,
    "45505":150,"41039":150,"45502":150,"45503":150,"41037":150,"41041":150,"41049":150,
    "41081":150,"41093":150
  };
  
  /* ---------- ITEM CONTROLS ---------- */
  function addItemInput() {
    const itemList = document.getElementById("itemList");
    const entry   = document.createElement("div");
    entry.className = "item-entry";
  
    const input = document.createElement("input");
    input.type  = "number";
    input.name  = "item_price";
    input.step  = "0.01";
    input.placeholder = "Item price ($)";
    input.required = true;
  
    const remove = document.createElement("button");
    remove.type  = "button";
    remove.textContent = "❌";
    remove.className   = "remove-btn";
    remove.onclick     = () => itemList.removeChild(entry);
  
    entry.appendChild(input);
    entry.appendChild(remove);
    itemList.appendChild(entry);
  }
  
  function clearAllItems() {
    const itemList = document.getElementById("itemList");
    itemList.innerHTML = "";
    addItemInput();
  }
  
  /* ---------- CALCULATE ---------- */
  function calculateTotal() {
    const zip       = document.getElementById("zipcode").value.trim();
    const itemInputs= document.querySelectorAll("input[name='item_price']");
    const assembly  = document.getElementById("assembly").value;
    const finance   = document.getElementById("finance").value;
  
    let itemsTotal = 0;
    itemInputs.forEach(el => itemsTotal += parseFloat(el.value) || 0);
  
    if (!(zip in deliveryFees)) {
      document.getElementById("result").innerHTML =
        `🚫 ZIP code <strong>${zip}</strong> is outside our delivery area.`;
      return;
    }
  
    const delivery   = deliveryFees[zip];
    const tax        = finance === "no" ? itemsTotal * 0.08 : 0;
    const assemblyFee= assembly === "yes" ? 45 : 0;
    const final      = Math.round(itemsTotal + delivery + tax + assemblyFee);
  
    document.getElementById("result").innerHTML =
      `<strong>Item Total:</strong> $${itemsTotal.toFixed(2)}<br>` +
      (finance === "no"
          ? `<strong>Tax (8%):</strong> $${tax.toFixed(2)}<br>`
          : `<strong>Financing:</strong> ✅ (No Tax)<br>`) +
      `<strong>Delivery Fee:</strong> $${delivery}<br>` +
      (assembly === "yes" ? `<strong>Assembly:</strong> $45<br>` : "") +
      `<br><strong>Total:</strong> <span style="font-size:1.35rem;">$${final}</span>`;
  }
  