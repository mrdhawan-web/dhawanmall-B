import os
from flask import Flask, request, jsonify, render_template
import requests
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from datetime import datetime

app = Flask(__name__)

# SECURE - Render ENV se ayega, code me nahi likhna
BOT_TOKEN = os.environ.get('BOT_TOKEN')
CHAT_ID = os.environ.get('CHAT_ID')
SHEET_ID = os.environ.get('SHEET_ID')

# Google Sheet Connect
def get_sheet():
    creds_json = os.environ.get('GOOGLE_CREDS_JSON')
    scope = ["https://spreadsheets.google.com/feeds","https://www.googleapis.com/auth/drive"]
    creds = ServiceAccountCredentials.from_json_keyfile_dict(eval(creds_json), scope)
    client = gspread.authorize(creds)
    sheet = client.open_by_key(SHEET_ID).sheet1
    return sheet

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/place-order', methods=['POST'])
def place_order():
    data = request.json
    # 1. Google Sheet me save
    try:
        sheet = get_sheet()
        order_id = f"DM{int(datetime.now().timestamp())}"
        sheet.append_row([
            order_id,
            data['name'], data['mobile'], data['address'],
            str(data['products']),
            f"Subtotal: {data['subtotal']} | Delivery: 49 | Total: {data['total']}",
            data['payment'],
            datetime.now().strftime("%d-%m-%Y %H:%M")
        ])
    except Exception as e:
        print("Sheet Error:", e)

    # 2. Telegram pe message - POINT 2 LOGIC (Subtotal + 49)
    msg = f"""🔔 NEW ORDER - Dhawan Mall 👑
Order ID: {order_id}

👤 Customer:
Name: {data['name']}
Mobile: {data['mobile']}
Address: {data['address']}

🛒 Products: {data['products']}

💰 Billing:
Subtotal: Rs {data['subtotal']}
Delivery Charges: Rs 49
Total: Rs {data['total']}

💳 Payment: {data['payment']}
"""
    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": CHAT_ID, "text": msg})
    except Exception as e:
        print("Telegram Error:", e)

    return jsonify({"status": "success", "order_id": order_id})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)
