import requests
import numpy as np

url = "http://127.0.0.1:5000/predict"

# Create dummy input data of shape (35, 24)
input_data = np.random.rand(35, 24).tolist()

response = requests.post(url, json={"input": input_data})
print("Response:", response.json())
