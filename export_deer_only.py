import bpy
import os

out_dir = r"C:\Users\itse2\.gemini\antigravity\scratch\muskan-sky\assets"
glb_deer_path = os.path.join(out_dir, "spirit_deer.glb")

target_names = []
for col_name in ["body", "antlers"]:
    if col_name in bpy.data.collections:
        for obj in bpy.data.collections[col_name].objects:
            target_names.append(obj.name)

# Deselect all
bpy.ops.object.select_all(action='DESELECT')

export_objects = []
for name in target_names:
    obj = bpy.data.objects.get(name)
    if not obj:
        continue
    
    if obj.type == 'CURVE':
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        try:
            bpy.ops.object.convert(target='MESH')
        except Exception:
            pass
        obj.select_set(False)

    if obj.type == 'MESH':
        export_objects.append(obj)

# Decimate
for obj in export_objects:
    poly_count = len(obj.data.polygons)
    if poly_count > 3000:
        ratio = max(0.1, min(0.4, 3000 / poly_count))
        mod = obj.modifiers.new(name="WebDecimate", type='DECIMATE')
        mod.ratio = ratio

# Setup emission
for mat in bpy.data.materials:
    if not mat.use_nodes:
        continue
    is_glowing = any(k in mat.name.lower() for k in ["glow", "deer", "antler", "bone"])
    if is_glowing:
        for n in mat.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                if "Emission Color" in n.inputs:
                    n.inputs["Emission Color"].default_value = (1.0, 0.88, 0.45, 1.0)
                    n.inputs["Emission Strength"].default_value = 4.0
                elif "Emission" in n.inputs:
                    n.inputs["Emission"].default_value = (1.0, 0.88, 0.45, 1.0)
                    if "Emission Strength" in n.inputs:
                        n.inputs["Emission Strength"].default_value = 4.0

for obj in export_objects:
    obj.select_set(True)

if export_objects:
    bpy.context.view_layer.objects.active = export_objects[0]

print("Exporting spirit_deer.glb...")
bpy.ops.export_scene.gltf(
    filepath=glb_deer_path,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_materials='EXPORT',
    export_cameras=False,
    export_lights=False,
    export_yup=True
)

file_size_mb = os.path.getsize(glb_deer_path) / (1024 * 1024)
print(f"DONE! spirit_deer.glb size: {file_size_mb:.2f} MB")
