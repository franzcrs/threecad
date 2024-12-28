'''
Filename: reduceStl.py
Author: Franz Chuquirachi
Created: 2024-12-21
Copyright © 2024 Franz Arthur Chuquirachi Rosales. All rights reserved.
'''

import open3d as o3d
import numpy as np
from tqdm import tqdm
import os
import struct
import sys

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

def reduce_facets(mesh, target_number_of_triangles):
    """
    Reduce the number of facets (triangles) in a mesh.

    Parameters:
        mesh (o3d.geometry.TriangleMesh): The input mesh.
        target_number_of_triangles (int): Desired number of triangles after simplification.

    Returns:
        o3d.geometry.TriangleMesh: The simplified mesh.
    """
    print(f"Original mesh has {len(mesh.triangles)} triangles.")

    # Simplify the mesh using Quadric Decimation
    simplified_mesh = mesh.simplify_quadric_decimation(target_number_of_triangles=target_number_of_triangles)
    simplified_mesh.compute_vertex_normals()

    print(f"Simplified mesh has {len(simplified_mesh.triangles)} triangles.")
    return simplified_mesh

def convert_stl_binary_to_ascii(input_path, output_path, solid_name="ConvertedSolid"):
    """
    Convert a binary STL file to an ASCII STL file.

    Parameters:
        input_path (str): Path to the input binary STL file.
        output_path (str): Path to save the converted ASCII STL file.
        solid_name (str): Name of the solid in the ASCII STL file.
    """
    # Check if input file exists
    if not os.path.isfile(input_path):
        raise FileNotFoundError(f"Input file does not exist: {input_path}")

    # Open the binary STL file for reading
    with open(input_path, 'rb') as bin_file:
        # Read the 80-byte header
        header = bin_file.read(80)
        header_str = header.decode(errors='ignore').strip()
        if not header_str:
            header_str = "ConvertedSolid"

        # Read the number of triangles (4 bytes unsigned int)
        num_triangles_bytes = bin_file.read(4)
        if len(num_triangles_bytes) < 4:
            raise ValueError("File ended unexpectedly while reading number of triangles.")
        num_triangles = struct.unpack('<I', num_triangles_bytes)[0]

        print(f"Header: {header_str}")
        print(f"Number of triangles: {num_triangles}")

        print("Finished reading binary STL file.")
        print("Starting conversion to ASCII STL...")

        # Open the ASCII STL file for writing
        with open(output_path, 'w') as ascii_file:
            # Write the header
            ascii_file.write(f"solid {solid_name}\n")

            # Process and write each triangle
            for i in range(num_triangles):
                # Each triangle is 50 bytes:
                # - 12 bytes normal vector
                # - 12 bytes vertex 1
                # - 12 bytes vertex 2
                # - 12 bytes vertex 3
                # - 2 bytes attribute byte count (ignored)
                triangle_bytes = bin_file.read(50)
                if len(triangle_bytes) < 50:
                    raise ValueError(f"File ended unexpectedly while reading triangle {i + 1}.")

                # Unpack the normal vector and the three vertices
                # '<3f3f3f3fH' reads 12 floats and 1 unsigned short
                unpacked_data = struct.unpack('<12fH', triangle_bytes)
                normal = unpacked_data[0:3]
                vertex1 = unpacked_data[3:6]
                vertex2 = unpacked_data[6:9]
                vertex3 = unpacked_data[9:12]
                # Attribute byte count is unpacked_data[12], but it's ignored

                # Write the triangle to the ASCII file
                ascii_file.write(f"  facet normal {normal[0]:.6e} {normal[1]:.6e} {normal[2]:.6e}\n")
                ascii_file.write(f"    outer loop\n")
                ascii_file.write(f"      vertex {vertex1[0]:.6e} {vertex1[1]:.6e} {vertex1[2]:.6e}\n")
                ascii_file.write(f"      vertex {vertex2[0]:.6e} {vertex2[1]:.6e} {vertex2[2]:.6e}\n")
                ascii_file.write(f"      vertex {vertex3[0]:.6e} {vertex3[1]:.6e} {vertex3[2]:.6e}\n")
                ascii_file.write(f"    endloop\n")
                ascii_file.write(f"  endfacet\n")

                # Progress reporting every 10,000 triangles
                if (i + 1) % 10000 == 0:
                    print(f"Converted {i + 1} / {num_triangles} triangles...")

            # Write the footer
            ascii_file.write(f"endsolid {solid_name}\n")

    print(f"Conversion complete. ASCII STL saved to {output_path}.")

def save_mesh(mesh, output_path):
    """
    Save the mesh to an STL file in Binary and Ascii format.

    Parameters:
        mesh (o3d.geometry.TriangleMesh): The mesh to save.
        output_path (str): Path to save the STL file.
    """
    # Save the mesh in Binary format
    success = o3d.io.write_triangle_mesh(output_path, mesh)
    if not success:
        raise IOError(f"Failed to write mesh to {output_path}")
    print(f"Simplified mesh saved to {output_path}")
    reduced_stl_ascii = output_path.replace("/binary/", "/")
    # Convert the binary STL file to ASCII format
    convert_stl_binary_to_ascii(output_path, reduced_stl_ascii)


def reduce_stl(input_path, output_path, reduction_fraction=0.5):
    """
    Simplify an STL file by reducing the number of facets.

    Parameters:
        input_path (str): Path to the input STL file.
        output_path (str): Path to save the simplified STL file.
        reduction_fraction (float): Fractional reduction of triangles (e.g., 0.6 reduces triangles by 60%).
    """
    # Load the original mesh
    print("Loading mesh...")
    mesh = load_mesh(input_path)

    # Determine target number of triangles
    original_triangles = len(mesh.triangles)
    target_triangles = int(original_triangles * (1-reduction_fraction))
    target_triangles = max(target_triangles, 100)  # Ensure at least 100 triangles

    # Reduce facets
    print("Reducing facets...")
    simplified_mesh = reduce_facets(mesh, target_number_of_triangles=target_triangles)

    # Save the simplified mesh
    print("Saving simplified mesh...")
    save_mesh(simplified_mesh, output_path)

    print("Simplification complete.")

# Loop through all the files in the models directory
for file in os.listdir("server/models"):
    if (file.endswith(".stl")) and (not file.endswith("_r.stl")):
        input_stl = f"server/models/{file}"
        reduced_stl_binary = f"server/models/binary/{file.replace('.stl', '_r.stl')}"
        reduction_fraction = 0.2
        reduce_stl(input_stl, reduced_stl_binary, reduction_fraction)