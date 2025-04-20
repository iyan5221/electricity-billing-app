from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from tensorflow.keras.models import load_model

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load the pre-trained LSTM model
model = load_model("lstm_model.h5", compile=False)

# Define min and max used during model training (adjust these based on your actual training data)
min_val = 0
max_val = 5000

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        input_data = data.get("input")

        if input_data is None:
            return jsonify({"error": "Input data is missing"}), 400

        # Convert input to numpy array
        input_array = np.array(input_data)

        # Ensure the shape is (35, 24)
        if input_array.shape != (35, 24):
            return jsonify({"error": f"Input shape must be (35, 24), but got {input_array.shape}"}), 400

        # Add batch dimension to match LSTM input shape
        input_array = np.expand_dims(input_array, axis=0)  # shape becomes (1, 35, 24)

        # Make prediction
        prediction = model.predict(input_array)
        normalized_output = float(prediction[0][0])

        # Denormalize
        real_prediction = normalized_output * (max_val - min_val) + min_val

        return jsonify({"prediction": round(real_prediction, 2)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5001)
