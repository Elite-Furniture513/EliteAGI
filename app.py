from flask import Flask, jsonify, send_from_directory
import pandas as pd

app = Flask(__name__)

# Load ZIP code delivery fees from the Excel file
file_path = "zipcode_delivery_fees_from_45237.xlsx"
df = pd.read_excel(file_path)
zip_fee_lookup = df.set_index("Zip")["Delivery_Fee"].to_dict()

@app.route('/api/delivery-fees', methods=['GET'])
def get_delivery_fees():
    return jsonify(zip_fee_lookup)

@app.route('/')
def serve_index():
    return send_from_directory('', 'index.html')

if __name__ == '__main__':
    app.run(debug=True)
