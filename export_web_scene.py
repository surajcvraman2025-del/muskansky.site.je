import bpy
import os

print("=" * 60)
print("STARTING BLENDER TO GLB OPTIMIZATION & EXPORT")
print("=" * 60)

out_dir = r"C:\Users\itse2\.gemini\antigravity\scratch\muskan-sky\assets"
os.makedirs(out_dir, exist_ok=True)
glb_path = os.path.join(out_dir, "spirit_deer_scene.glb")

# Selectively collect objects from the Deer and immediate surroundings
target_names = []

# Body collection
if "body" in bpy.data.collections:
    for obj in bpy.data.collections["body"].objects:
        target_names.append(obj.name)

# Antlers collection
if "antlers" in bpy.data.collections:
    for obj in bpy.data.collections["antlers"].objects:
        target_names.append(obj.name)

# Ground & Water
if "Ground, water" in bpy.data.collections:
    for obj in bpy.data.collections["Ground, water"].objects:
        target_names.append(obj.name)

# Selected iconic ferns, bushes, and glowing mushrooms around the pond
for col_name in ["Generic", "generic"]:
    if col_name in bpy.data.collections:
        for obj in bpy.data.collections[col_name].objects:
            if any(k in obj.name.lower() for k in ["glowing", "water", "bush.001", "fern.001", "fern.002", "bouganvillier.001", "bouganvillier.002"]):
                target_names.append(obj.name)

print(f"Identified {len(target_names)} core objects to optimize and export.")

# Deselect all
bpy.ops.object.select_all(action='DESELECT')

export_objects = []
for name in target_names:
    obj = bpy.data.objects.get(name)
    if not obj:
        continue
    
    # Convert curves/surfaces to mesh if needed
    if obj.type == 'CURVE':
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        try:
            bpy.ops.object.convert(target='MESH')
        except Exception as e:
            print(f"Could not convert curve {name}: {e}")
        obj.select_set(False)

    if obj.type == 'MESH':
        export_objects.append(obj)

print(f"Total mesh objects for export: {len(export_objects)}")

# Optimize geometry: Add decimation to heavy meshes
for obj in export_objects:
    poly_count = len(obj.data.polygons)
    if poly_count > 5000:
        ratio = max(0.08, min(0.35, 5000 / poly_count))
        mod = obj.modifiers.new(name="WebDecimate", type='DECIMATE')
        mod.ratio = ratio
        # Apply modifiers in export
        print(f"  Decimating '{obj.name}' ({poly_count} faces -> ratio {ratio:.2f})")

# Ensure materials have Principled BSDF with emissive colors for the glowing antlers & spirit body
for mat in bpy.data.materials:
    if not mat.use_nodes:
        continue
    
    # Check if this is an emissive glowing material
    is_glowing = "glow" in mat.name.lower() or "deer" in mat.name.lower() or "antler" in mat.name.lower()
    
    nodes = mat.node_tree.nodes
    bsdf = None
    for n in nodes:
        if n.type == 'BSDF_PRINCIPLED':
            bsdf = n
            break
            
    if is_glowing and bsdf:
        # Set radiant golden/celestial emission
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = (1.0, 0.88, 0.45, 1.0)
            bsdf.inputs["Emission Strength"].default_value = 3.5
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = (1.0, 0.88, 0.45, 1.0)
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = 3.5

# Select all export objects
bpy.ops.object.select_all(action='DESELECT')
for obj in export_objects:
    obj.select_set(True)

if export_objects:
    bpy.context.view_layer.objects.active = export_objects[0]

print(f"Exporting to GLB: {glb_path}...")

# Export glTF 2.0 binary (.glb)
bpy.ops.export_scene.gltf(
    filepath=glb_path,
    export_format='GLB',
    use_selection=True,
    export_apply=True, # Apply modifiers like decimation
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False,
    export_yup=True
)

file_size_mb = os.path.getsize(glb_path) / (1024 * 1024)
print(f"SUCCESS! Exported GLB size: {file_size_mb:.2f} MB")
print("=" * 60)
