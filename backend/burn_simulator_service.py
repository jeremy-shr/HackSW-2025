import math
import json
from shapely.geometry import Polygon, mapping
from shapely.affinity import rotate, scale, translate
import random

def _generate_fire_spread_template(num_points=40, base_radius=1, tail_factor=1.5,
                                    tail_angle_range=(math.radians(60), math.radians(120))):
    """
    Generates a rounded polygon that mimics a fire spread shape.
    
    Parameters:
        - num_points: Number of vertices to create
        - base_radius: The base radius of the circle
        - tail_factor: Multiplier for the radius within the tail region
        - tail_angle_range: (min_angle, max_angle) in radians where the tail extension is applied
    
    Returns:
        - A list of (x,y) tuples representing the polygon’s vertices
    """
    coords = []
    for i in range(num_points):
        angle = 2 * math.pi * i / num_points
        # If the point is in the tail region, extend its radius.
        if tail_angle_range[0] <= angle <= tail_angle_range[1]:
            r = base_radius * tail_factor
        else:
            r = base_radius
        # Optional: Add a small random irregularity for a natural look.
        r *= (1 + random.uniform(-0.05, 0.05))
        x = r * math.cos(angle)
        y = r * math.sin(angle)
        coords.append((x, y))
    # Ensure the polygon is closed by appending the first point at the end.
    coords.append(coords[0])
    return coords


# Create template shapes
TEMPLATES = {
    1: _generate_fire_spread_template(num_points=40, base_radius=1, tail_factor=1.5, tail_angle_range=(math.radians(60), math.radians(120))),
    2: _generate_fire_spread_template(num_points=40, base_radius=1, tail_factor=1.3, tail_angle_range=(math.radians(30), math.radians(90))),
    3: _generate_fire_spread_template(num_points=40, base_radius=1, tail_factor=1.4, tail_angle_range=(math.radians(80), math.radians(140))),
    4: _generate_fire_spread_template(num_points=40, base_radius=1, tail_factor=1.6, tail_angle_range=(math.radians(50), math.radians(110))),
    5: _generate_fire_spread_template(num_points=40, base_radius=1, tail_factor=1.2, tail_angle_range=(math.radians(70), math.radians(130))),
    6: _generate_fire_spread_template(num_points=40, base_radius=1, tail_factor=1.7, tail_angle_range=(math.radians(40), math.radians(100))),
    7: _generate_fire_spread_template(num_points=40, base_radius=1, tail_factor=1.5, tail_angle_range=(math.radians(90), math.radians(150))),
    8: _generate_fire_spread_template(num_points=40, base_radius=1, tail_factor=1.3, tail_angle_range=(math.radians(20), math.radians(80))),
    9: _generate_fire_spread_template(num_points=40, base_radius=1, tail_factor=1.4, tail_angle_range=(math.radians(100), math.radians(160))),
    10: _generate_fire_spread_template(num_points=40, base_radius=1, tail_factor=1.6, tail_angle_range=(math.radians(10), math.radians(70)))
}

def generate_geojson_polygon(center, scale_factor, tail_direction_degrees):
    """
    Generate a GeoJSON Feature for a polygon that has been scaled, rotated, and translated.

    Parameters:
        - center: a tuple (longitude, latitude) for the center point.
        - scale_factor: a number by which to scale the shape.
        - tail_direction_degrees: the angle (in degrees) to rotate the shape 
                                    so that the tail points in wind direction
    Returns:
        - A dictionary in GeoJSON Feature format.
    """
    shape_id = random.randint(1, 10)
    template = TEMPLATES.get(shape_id)
    if template is None:
        raise ValueError(f"Shape id {shape_id} is not defined.")
    poly = Polygon(template)

    # Scale the polygon
    poly_scaled = scale(poly, xfact=scale_factor, yfact=scale_factor, origin=(0, 0))

    # Rotate the polygon
    poly_rotated = rotate(poly_scaled, tail_direction_degrees, origin=(0, 0), use_radians=False)

    # Translate the polygon to the specified lat long
    poly_translated = translate(poly_rotated, xoff=center[0], yoff=center[1])

    # Convert the shapely polygon to GeoJSON
    geometry = mapping(poly_translated)

    # Build the GeoJSON Feature.
    feature = {
        "type": "Feature",
        "properties": {
            "shape_id": shape_id,
            "scale_factor": scale_factor,
            "tail_direction": tail_direction_degrees
        },
        "geometry": geometry
    }
    return feature

# Local testing usage:
if __name__ == '__main__':
    center_point = (-122.91,41.53)
    shape_id = 1
    temp_scale_factor = 0.03
    temp_tail_direction = 0

    geojson_feature = generate_geojson_polygon(center_point, shape_id, temp_scale_factor, temp_tail_direction)

    geojson_feature_collection = {
        "type": "FeatureCollection",
        "features": [geojson_feature]
    }

    # Print out the GeoJSON.
    print(json.dumps(geojson_feature_collection, indent=2))
