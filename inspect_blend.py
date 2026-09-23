import bpy
import sys

print("=" * 60)
print("ANALYZING BLENDER SCENE: blender3.1-splash.blend")
print("=" * 60)

# Active scene and render settings
scene = bpy.context.scene
print(f"Active Scene: {scene.name}")
print(f"Render Engine: {scene.render.engine}")
print(f"Resolution: {scene.render.resolution_x}x{scene.render.resolution_y} @ {scene.render.resolution_percentage}%")

# Collections
print("\n--- Collections Hierarchy ---")
for col in bpy.data.collections:
    print(f"Collection: {col.name} ({len(col.objects)} objects)")
    for obj in col.objects[:5]:
        print(f"  - {obj.name} ({obj.type})")
    if len(col.objects) > 5:
        print(f"  ... and {len(col.objects) - 5} more")

# Objects breakdown by type
types_count = {}
total_verts = 0
total_faces = 0

for obj in bpy.data.objects:
    t = obj.type
    types_count[t] = types_count.get(t, 0) + 1
    if t == 'MESH' and obj.data:
        total_verts += len(obj.data.vertices)
        total_faces += len(obj.data.polygons)

print("\n--- Objects Summary ---")
for t, c in types_count.items():
    print(f"  {t}: {c}")
print(f"Total Vertices: {total_verts:,}")
print(f"Total Polygons/Faces: {total_faces:,}")

# Particle Systems (Grass, flowers, etc.)
print("\n--- Particle Systems ---")
has_particles = False
for obj in bpy.data.objects:
    if len(obj.particle_systems) > 0:
        has_particles = True
        for ps in obj.particle_systems:
            print(f"  Object '{obj.name}' -> Particle System '{ps.name}' (Type: {ps.settings.type}, Count: {ps.settings.count})")
if not has_particles:
    print("  No particle systems found.")

# Geometry Nodes / Modifiers
print("\n--- Modifiers & Geometry Nodes ---")
for obj in bpy.data.objects:
    for mod in obj.modifiers:
        if mod.type in ('NODES', 'PARTICLE_SYSTEM', 'SUBSURF', 'ARRAY'):
            print(f"  Object '{obj.name}' -> Modifier '{mod.name}' ({mod.type})")

# Cameras & Lights
print("\n--- Cameras & Lights ---")
for obj in bpy.data.objects:
    if obj.type in ('CAMERA', 'LIGHT'):
        print(f"  {obj.name} ({obj.type}) at {obj.location}")

# Materials & Textures
print("\n--- Materials ---")
print(f"Total Materials: {len(bpy.data.materials)}")
for mat in bpy.data.materials[:15]:
    uses_nodes = mat.use_nodes if hasattr(mat, 'use_nodes') else False
    print(f"  Material: {mat.name} (Nodes: {uses_nodes})")

# Images / Textures
print("\n--- Images & Textures ---")
print(f"Total Images: {len(bpy.data.images)}")
for img in bpy.data.images:
    packed = "Packed" if img.packed_file else "External"
    print(f"  Image: {img.name} ({img.size[0]}x{img.size[1]}, {packed}, filepath: {img.filepath})")

print("=" * 60)
print("ANALYSIS COMPLETE")
print("=" * 60)
