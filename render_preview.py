import bpy

scene = bpy.context.scene
scene.render.resolution_x = 960
scene.render.resolution_y = 540
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'JPEG'
scene.render.image_settings.quality = 85
scene.render.filepath = r"C:\Users\itse2\.gemini\antigravity\brain\bf485bf4-7683-4c0e-b95b-1863b978f414\blender_preview.jpg"

if scene.render.engine == 'CYCLES':
    scene.cycles.samples = 16
    scene.cycles.preview_samples = 16
    scene.cycles.use_denoising = True

print("Rendering fast preview...")
bpy.ops.render.render(write_still=True)
print("Preview rendered successfully!")
