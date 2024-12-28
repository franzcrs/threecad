'''
Filename: server.py
Author: Franz Chuquirachi
Created: 2024-12-18
Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
'''

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import time

server = Flask(__name__)
CORS(server)

# Configuration
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'models'))
ALLOWED_MODEL_EXTENSIONS = {'.obj', '.stl', '.fbx', '.gltf', '.glb'}
ALLOWED_IMG_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif'}

# Ensure the models directory exists
os.makedirs(MODELS_DIR, exist_ok=True)

def get_models_details():
    """
    Function: get_models_details
    Description:
        Retrieves all relevant information about 3D models from the designated `MODELS_DIR` directory. The function performs the following steps:
        1. Iterates through each file in the `MODELS_DIR`.
        2. Checks if the file extension is within the allowed image extensions (`ALLOWED_IMG_EXTENSIONS`) or model extensions (`ALLOWED_MODEL_EXTENSIONS`).
        3. Categorizes files into image files and model files based on their extensions.
        4. For each model file, searches for a corresponding preview image with the same base name.
        5. Compiles a list of models, each represented as a dictionary containing the model's ID, display name, preview image path (if available), and the model's filename.

    Returns:
        List[dict]: A list of dictionaries where each dictionary contains:
            - "id" (str): The unique identifier of the model, derived from the filename without its extension.
            - "display_name" (str): The formatted display name of the model, created by replacing underscores with spaces and capitalizing each word.
            - "preview" (str or None): The URL path to the preview image if it exists; otherwise, `None`.
            - "filename" (str): The complete filename of the model, including its extension.
    """
    models = []
    image_files = []
    model_files = []
    for filename in os.listdir(MODELS_DIR):
        name, ext = os.path.splitext(filename)
        if not name.endswith('_r'):
            if ext.lower() in ALLOWED_IMG_EXTENSIONS:
                image_files.append({"name": name, "extension": ext})
            elif ext.lower() in ALLOWED_MODEL_EXTENSIONS:
                model_files.append({"name": name, "extension": ext})
    for model in model_files:
        preview_image = [ image_file['name']+image_file['extension'] for image_file in image_files if image_file['name'] == model['name'] ]
        models.append({
            "id": model["name"],
            "display_name": model["name"].replace('_', ' ').title(),
            "preview": f"/file/{preview_image[0]}" if len(preview_image) > 0 else None,
            "filename": model['name']+model['extension']
        })
    return models

@server.route('/search')
def search():
    """
    Function: search
    Description:
        Handles the `/search` endpoint to retrieve 3D model files based on a search query. Steps:
        1. Retrieves the 'query' parameter from the request and converts it to lowercase.
        2. Simulates server processing time by pausing execution for 0.5 seconds.
        3. Calls `get_model_files` to fetch all available 3D models.
        4. Filters the models to include only those whose `display_name` contains the search query.
        5. Returns the filtered list of models as a JSON response.
        Retrieving all the 3D model files everytime the function is called allows for dynamic updates in the models directory.
    
    Returns:
        Response: A JSON response containing a list of dictionaries, each representing a 3D model that matches the search criteria.
    """
    query = request.args.get('query', '').lower()
    time.sleep(0.5) # Simulate server processing time
    
    all_models = get_models_details()
    results = [
        model for model in all_models
        if query in model['display_name'].lower()
    ]
    
    return jsonify(results)

@server.route('/file/<path:filename>')
def serve_file(filename):
    """
    Function: serve_file
    Description:
        Serves requested file. The `/file` endpoint is thought to be used as any file URL path. Steps:
        1. Receives the `filename` parameter from the URL.
        2. Utilizes Flask's `send_from_directory` to send the requested file from `MODELS_DIR`.
    
    Parameters:
        filename (str): The name of the file to be served.
    
    Returns:
        Response: The requested file if it exists in the models directory.
    """
    if not os.path.isfile(os.path.join(MODELS_DIR, filename)):
        if filename.startswith('binary') and filename.endswith('_r.stl'):
            print(f"GET /file/{filename} redirected to /file/{filename.replace('_r.stl', '.stl')}")
            return send_from_directory(MODELS_DIR, filename.replace('_r.stl', '.stl'))
    return send_from_directory(MODELS_DIR, filename)


if __name__ == '__main__':
    server.run(port=5000)

