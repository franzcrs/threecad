'''
Filename: binaryStl.py
Author: Franz Chuquirachi
Created: 2024-12-21
Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
'''

import os
import struct
import open3d as o3d

def load_mesh(file_path):
    """
    Load a mesh from an STL file.

    Parameters:
        file_path (str): Path to the STL file.

    Returns:
        o3d.geometry.TriangleMesh: The loaded mesh.
    """
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    mesh = o3d.io.read_triangle_mesh(file_path)
    if mesh.is_empty():
        raise ValueError(f"Failed to load mesh from {file_path}")
    
    mesh.compute_vertex_normals()
    return mesh

def convert_stl_to_binary(input_path, output_path):
    """
    Convert an ASCII STL file to a binary STL file.

    Parameters:
        input_path (str): Path to the input ASCII STL file.
        output_path (str): Path to save the converted binary STL file.
    """
    # Read the ASCII STL file
    mesh = load_mesh(input_path)
    # Create the output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    # Save the mesh in Binary format
    success = o3d.io.write_triangle_mesh(output_path, mesh)
    if not success:
        raise IOError(f"Failed to write mesh to {output_path}")
    print(f"Binary STL saved to {output_path}")

# Loop through all the files in the models directory
for file in os.listdir("server/models"):
    if file.endswith(".stl"):
        input_stl = f"server/models/{file}"
        output_stl = f"server/models/binary/{file}"
        convert_stl_to_binary(input_stl, output_stl)