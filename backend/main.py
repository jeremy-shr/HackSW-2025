''''''
from fastapi import FastAPI
import numpy as np
from backend.mapping import mappings
from backend.input_class import BurnInput
from tensorflow.keras.models import load_model

# Initialize FastAPI
app = FastAPI()

# Load the pre-trained model
model = load_model('sequential-model.h5')

@app.get("/simulatePoints")
def simulate_points(latitude: float, longitude: float):
    '''
    Simulate the points based on the given latitude and longitude

    params
    - latitude: Latitude of the point
    - longitude: Longitude of the point

    returns [geojson] : The simulated simulated 7 circles
    '''
    # Todo: Implement the simulation logic
    return {"latitude": latitude, "longitude": longitude}

@app.post("/calculateBurn")
def calculate_burn(input_data: BurnInput):
    """
    Predict the burn classification (damage) based on the input data.
    """

    reversed_mappings = {k: {v: k for k, v in v.items()} for k, v in mappings.items()}

    # Encode the input data
    try:
        encoded_input = [
            reversed_mappings['street_type'][input_data.street_type],
            reversed_mappings['fire_unit'][input_data.fire_unit],
            reversed_mappings['structure_type'][input_data.structure_type],
            reversed_mappings['structure_category'][input_data.structure_category],
            reversed_mappings['roof_material'][input_data.roof_material],
            reversed_mappings['eaves'][input_data.eaves],
            reversed_mappings['exterior_siding'][input_data.exterior_siding],
            reversed_mappings['window_pane'][input_data.window_pane],
            reversed_mappings['attached_patio_material'][input_data.attached_patio_material],
            reversed_mappings['attached_fence_material'][input_data.attached_fence_material],
            input_data.age,
        ]

        # Convert input to a NumPy array and reshape for model prediction
        encoded_input = np.array(encoded_input).reshape(1, -1)

        # Predict with the model
        prediction = model.predict(encoded_input)
        predicted_class = prediction.argmax(axis=1)[0]

        # Decode the prediction to a readable class
        damage_mapping = {v: k for k, v in reversed_mappings['damage'].items()}
        predicted_label = damage_mapping[predicted_class]

        # Return the result
        return {"predicted_damage": predicted_label, "probabilities": prediction.tolist()}
    except KeyError as e:
        return {"error": f"Invalid input value: {e}"}
