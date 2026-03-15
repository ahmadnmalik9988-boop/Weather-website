"""
Weather Web Application - Flask Backend
Uses OpenWeatherMap API to fetch real-time weather data.
"""

from flask import Flask, render_template, jsonify, request
import requests
import os
from datetime import datetime

app = Flask(__name__)

# ─────────────────────────────────────────────
#  CONFIG — replace with your actual API key
#  Get a free key at: https://openweathermap.org/api
# ─────────────────────────────────────────────
API_KEY = 
BASE_URL = 

@app.route("/")
def index():
    """Serve the main HTML page."""
    return render_template("index.html")


@app.route("/weather")
def get_weather():
    """
    Fetch weather data for a given city from OpenWeatherMap.
    Query param: ?city=<city_name>
    Returns JSON with weather details or an error message.
    """
    city = request.args.get("city", "").strip()

    if not city:
        return jsonify({"error": "Please enter a city name."}), 400

    params = {
        "q": city,
        "appid": API_KEY,
        "units": "metric",   # Celsius; use "imperial" for Fahrenheit
        "lang": "en",
    }

    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        data = response.json()

        # OpenWeatherMap returns cod=404 for unknown cities
        if response.status_code == 404 or data.get("cod") == "404":
            return jsonify({"error": f'City "{city}" not found. Please check the spelling.'}), 404

        if response.status_code == 401:
            return jsonify({"error": "Invalid API key. Please check your configuration."}), 401

        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch weather data. Try again later."}), 500

        # Build a clean response payload
        weather_info = {
            "city":        data["name"],
            "country":     data["sys"]["country"],
            "temperature": round(data["main"]["temp"]),
            "feels_like":  round(data["main"]["feels_like"]),
            "temp_min":    round(data["main"]["temp_min"]),
            "temp_max":    round(data["main"]["temp_max"]),
            "humidity":    data["main"]["humidity"],
            "pressure":    data["main"]["pressure"],
            "wind_speed":  round(data["wind"]["speed"] * 3.6, 1),  # m/s → km/h
            "wind_deg":    data["wind"].get("deg", 0),
            "visibility":  round(data.get("visibility", 0) / 1000, 1),  # m → km
            "condition":   data["weather"][0]["main"],
            "description": data["weather"][0]["description"].title(),
            "icon_code":   data["weather"][0]["icon"],
            "icon_url":    f"https://openweathermap.org/img/wn/{data['weather'][0]['icon']}@2x.png",
            "sunrise":     datetime.fromtimestamp(data["sys"]["sunrise"]).strftime("%H:%M"),
            "sunset":      datetime.fromtimestamp(data["sys"]["sunset"]).strftime("%H:%M"),
            "timestamp":   datetime.now().strftime("%A, %d %B %Y  •  %H:%M"),
        }

        return jsonify(weather_info)

    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Network error. Please check your internet connection."}), 503
    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timed out. Please try again."}), 504
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
