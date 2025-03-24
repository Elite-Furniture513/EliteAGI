from flask import Flask, render_template_string, request
import pandas as pd

# Load ZIP code delivery fee data
file_path = "zipcode_delivery_fees_from_45237.xlsx"
df = pd.read_excel(file_path)
zip_fee_lookup = df.set_index("Zip")["Delivery_Fee"].to_dict()

app = Flask(__name__)

# HTML Template
html_template = """
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Delivery Quote Calculator</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Roboto', sans-serif;
      background: linear-gradient(to right, #e0eafc, #cfdef3);
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      max-width: 600px;
      width: 100%;
    }
    h1 {
      text-align: center;
      margin-bottom: 25px;
    }
    form {
      display: flex;
      flex-direction: column;
    }
    label {
      font-weight: bold;
      margin-top: 15px;
      margin-bottom: 5px;
    }
    input[type="text"], input[type="number"], select {
      padding: 10px;
      font-size: 16px;
      border: 2px solid #007BFF;
      border-radius: 8px;
    }
    .item-list {
      margin-bottom: 10px;
    }
    .item-list input {
      margin-top: 5px;
    }
    .add-btn {
      background: #28a745;
      color: white;
      border: none;
      padding: 10px;
      margin-top: 10px;
      border-radius: 8px;
      cursor: pointer;
    }
    .add-btn:hover {
      background: #218838;
    }
    input[type="submit"] {
      margin-top: 20px;
      padding: 12px;
      background-color: #007BFF;
      color: white;
      font-size: 16px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    input[type="submit"]:hover {
      background-color: #0056b3;
    }
    .result {
      margin-top: 25px;
      font-size: 18px;
      color: #333;
    }
  </style>
  <script>
    function addItemInput() {
      const itemList = document.getElementById("itemList");
      const input = document.createElement("input");
      input.type = "number";
      input.name = "item_price";
      input.step = "0.01";
      input.placeholder = "Item price ($)";
      input.required = true;
      itemList.appendChild(input);
    }
  </script>
</head>
<body>
  <div class="container">
    <h1>🛋️ Delivery Quote Calculator</h1>
    <form method="post">
      <label for="zipcode">ZIP Code:</label>
      <input type="text" id="zipcode" name="zipcode" required placeholder="e.g. 45237">

      <label>Item Prices:</label>
      <div id="itemList" class="item-list">
        <input type="number" name="item_price" step="0.01" placeholder="Item price ($)" required>
      </div>
      <button type="button" class="add-btn" onclick="addItemInput()">➕ Add Another Item</button>

      <label for="assembly">Assembly Needed?</label>
      <select name="assembly" id="assembly">
        <option value="no">No</option>
        <option value="yes">Yes (+$45)</option>
      </select>

      <label for="finance">Using Financing?</label>
      <select name="finance" id="finance">
        <option value="no">No</option>
        <option value="yes">Yes (No Tax)</option>
      </select>

      <input type="submit" value="Calculate Total">
    </form>

    {% if result %}
      <div class="result">
        {{ result|safe }}
      </div>
    {% endif %}
  </div>
</body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
def home():
    result = None
    if request.method == 'POST':
        try:
            zip_code = int(request.form['zipcode'])
            item_prices = request.form.getlist('item_price')
            item_prices = [float(price) for price in item_prices if price]
            item_total = sum(item_prices)

            assembly = request.form['assembly']
            finance = request.form['finance']
            delivery_fee = zip_fee_lookup.get(zip_code)

            if delivery_fee is None:
                result = f"🚫 ZIP code {zip_code} not found in our delivery area."
            else:
                breakdown = f"<strong>Item Total:</strong> ${item_total:.2f}"
                tax_amount = 0
                if finance == "no":
                    tax_amount = item_total * 0.08
                    breakdown += f"<br><strong>Tax (8%):</strong> ${tax_amount:.2f}"
                else:
                    breakdown += "<br><strong>Financing:</strong> ✅ (No Tax)"

                breakdown += f"<br><strong>Delivery Fee:</strong> ${delivery_fee}"

                total = item_total + delivery_fee

                if assembly == "yes":
                    total += 45
                    breakdown += "<br><strong>Assembly:</strong> $45"

                total += tax_amount
                final_total = round(total)

                breakdown += f"<br><br><strong>Total:</strong> <span style='font-size: 22px;'>${final_total}</span>"
                result = f"The delivery fee for ZIP code {zip_code} is <strong>${delivery_fee}</strong>.<br><br>{breakdown}"

        except Exception as e:
            result = "❌ Error processing your request. Please check all fields."

    return render_template_string(html_template, result=result)

if __name__ == '__main__':
    app.run(debug=True)
