from flask import Flask, request, jsonify
import os
import cv2
import numpy as np
from datetime import datetime
import json
import base64
from io import BytesIO
from PIL import Image
import sqlite3

app = Flask(__name__)

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect('carbon_data.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS submissions
                 (id INTEGER PRIMARY KEY, farmer_name TEXT, phone TEXT, 
                  image_path TEXT, tree_count INTEGER, carbon_credits REAL,
                  timestamp TEXT, location TEXT)''')
    conn.commit()
    conn.close()

# Simple tree detection using OpenCV
def count_trees_basic(image_data):
    # Convert base64 to image
    image = Image.open(BytesIO(base64.b64decode(image_data)))
    img_array = np.array(image)
    
    # Convert to HSV for green detection
    hsv = cv2.cvtColor(img_array, cv2.COLOR_RGB2HSV)
    
    # Define range for green color (trees/vegetation)
    lower_green = np.array([40, 40, 40])
    upper_green = np.array([80, 255, 255])
    
    # Create mask for green areas
    mask = cv2.inRange(hsv, lower_green, upper_green)
    
    # Find contours (tree-like shapes)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter contours by area (approximate tree size)
    tree_contours = [c for c in contours if cv2.contourArea(c) > 500]
    
    return len(tree_contours)

# Calculate carbon credits based on tree count
def calculate_carbon_credits(tree_count, land_area_hectares=1):
    # Simplified calculation: 1 tree = ~20kg CO2/year, 1 credit = 1000kg CO2
    co2_per_tree_per_year = 20  # kg
    total_co2_kg = tree_count * co2_per_tree_per_year
    carbon_credits = total_co2_kg / 1000  # Convert to tons (credits)
    return round(carbon_credits, 2)

@app.route('/webhook', methods=['POST'])
def whatsapp_webhook():
    data = request.json
    
    # Mock WhatsApp message processing
    if 'message' in data and 'image' in data['message']:
        farmer_phone = data.get('from', 'unknown')
        farmer_name = data.get('name', 'Unknown Farmer')
        image_data = data['message']['image']  # base64 encoded
        location = data.get('location', 'Unknown Location')
        
        # Process image
        tree_count = count_trees_basic(image_data)
        carbon_credits = calculate_carbon_credits(tree_count)
        
        # Store in database
        conn = sqlite3.connect('carbon_data.db')
        c = conn.cursor()
        c.execute("INSERT INTO submissions VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)",
                 (farmer_name, farmer_phone, 'uploaded_image.jpg', 
                  tree_count, carbon_credits, datetime.now().isoformat(), location))
        conn.commit()
        submission_id = c.lastrowid
        conn.close()
        
        # Response to farmer
        response_message = f"""
🌱 CarbonTrack AI Analysis Complete!

Hello {farmer_name}!
📸 Trees detected: {tree_count}
💰 Estimated Carbon Credits: {carbon_credits} tons CO2
💵 Potential Earnings: ₹{carbon_credits * 2000}/year

Submission ID: {submission_id}
Next verification in 30 days.

Keep growing! 🌳
        """
        
        return jsonify({
            'status': 'success',
            'message': response_message,
            'tree_count': tree_count,
            'carbon_credits': carbon_credits,
            'submission_id': submission_id
        })
    
    return jsonify({'status': 'no_image_found'})

@app.route('/dashboard')
def dashboard():
    conn = sqlite3.connect('carbon_data.db')
    c = conn.cursor()
    c.execute("SELECT * FROM submissions ORDER BY timestamp DESC LIMIT 10")
    recent_submissions = c.fetchall()
    
    # Calculate totals
    c.execute("SELECT COUNT(*), SUM(tree_count), SUM(carbon_credits) FROM submissions")
    stats = c.fetchone()
    conn.close()
    
    return jsonify({
        'total_farmers': stats[0],
        'total_trees': stats[1] or 0,
        'total_carbon_credits': stats[2] or 0,
        'recent_submissions': recent_submissions
    })

@app.route('/simulate', methods=['POST'])
def simulate_submission():
    """Simulate a farmer submission for demo"""
    import random
    
    farmer_names = ['Ravi Kumar', 'Priya Devi', 'Suresh Patel', 'Lakshmi Singh']
    locations = ['Uttar Pradesh', 'Punjab', 'Maharashtra', 'Tamil Nadu']
    
    farmer_name = random.choice(farmer_names)
    location = random.choice(locations)
    tree_count = random.randint(15, 150)
    carbon_credits = calculate_carbon_credits(tree_count)
    
    conn = sqlite3.connect('carbon_data.db')
    c = conn.cursor()
    c.execute("INSERT INTO submissions VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)",
             (farmer_name, f"+91{random.randint(7000000000, 9999999999)}", 
              'demo_image.jpg', tree_count, carbon_credits, 
              datetime.now().isoformat(), location))
    conn.commit()
    conn.close()
    
    return jsonify({
        'status': 'success',
        'farmer_name': farmer_name,
        'tree_count': tree_count,
        'carbon_credits': carbon_credits,
        'location': location
    })

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
