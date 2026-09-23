import bpy
import os

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=r"C:\Users\itse2\.gemini\antigravity\scratch\muskan-sky\assets\spirit_deer.glb")

print(f"Total objects in spirit_deer.glb: {len(bpy.data.objects)}")
total_verts = sum(len(o.data.vertices) for o in bpy.data.objects if o.type == 'MESH')
total_faces = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
print(f"Total vertices: {total_verts:,}")
print(f"Total faces: {total_faces:,}")

for o in sorted(bpy.data.objects, key=lambda x: len(x.data.polygons) if x.type=='MESH' else 0, reverse=True)[:10]:
    if o.type == 'MESH':
        print(f"  {o.name}: {len(o.data.polygons):,} faces")
