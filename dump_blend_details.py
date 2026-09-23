import bpy
import os

out_path = r"C:\Users\itse2\.gemini\antigravity\scratch\muskan-sky\blend_analysis.txt"

with open(out_path, "w", encoding="utf-8") as f:
    f.write("BLENDER 3.1 SPLASH SCENE IN-DEPTH AUDIT\n")
    f.write("=" * 60 + "\n\n")

    f.write(f"Scene Name: {bpy.context.scene.name}\n")
    f.write(f"Render Engine: {bpy.context.scene.render.engine}\n\n")

    f.write("COLLECTIONS AND MEMBERS:\n")
    for col in bpy.data.collections:
        f.write(f"\nCollection: '{col.name}' ({len(col.objects)} objects)\n")
        # List major objects (skip repeated flower instances if there are hundreds)
        obj_names = [o.name for o in col.objects]
        grouped = {}
        for name in obj_names:
            base = name.split(".")[0]
            grouped[base] = grouped.get(base, 0) + 1
        for base, count in grouped.items():
            f.write(f"  - {base} (count: {count})\n")

    total_verts = sum(len(o.data.vertices) for o in bpy.data.objects if o.type == 'MESH' and o.data)
    total_faces = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH' and o.data)
    f.write(f"\nTOTAL MESH COUNT: {len([o for o in bpy.data.objects if o.type == 'MESH'])}\n")
    f.write(f"TOTAL VERTICES: {total_verts:,}\n")
    f.write(f"TOTAL FACES: {total_faces:,}\n\n")

    f.write("PRIMARY OBJECTS & BOUNDING INFO:\n")
    for obj in bpy.data.objects:
        # Ignore individual flower duplicates for brevity
        if obj.name.startswith("flower.") and not obj.name == "flower.001":
            continue
        f.write(f"  Object: {obj.name:<30} Type: {obj.type:<10} Parent: {str(obj.parent.name) if obj.parent else 'None':<15} Loc: {[round(v, 2) for v in obj.location]}\n")

    f.write("\nMATERIALS & SHADERS:\n")
    for mat in bpy.data.materials:
        f.write(f"  Material: {mat.name}\n")

    f.write("\nWORLD & ENVIRONMENT:\n")
    world = bpy.context.scene.world
    if world:
        f.write(f"World: {world.name}, uses nodes: {world.use_nodes}\n")
        if world.use_nodes:
            for node in world.node_tree.nodes:
                f.write(f"  Node: {node.name} ({node.type})\n")

print("Analysis written to", out_path)
