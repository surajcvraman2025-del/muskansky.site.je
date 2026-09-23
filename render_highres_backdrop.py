import bpy

scene = bpy.context.scene
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'JPEG'
scene.render.image_settings.quality = 92
scene.render.filepath = r"C:\Users\itse2\.gemini\antigravity\scratch\muskan-sky\assets\forest_sanctuary_master.jpg"

if scene.render.engine == 'CYCLES':
    scene.cycles.samples = 32
    scene.cycles.preview_samples = 32
    scene.cycles.use_denoising = True
    scene.cycles.denoiser = 'OPENIMAGEDENOISE'

print("Rendering high-res master sanctuary backdrop (1920x1080)...")
bpy.ops.render.render(write_still=True)
print("Master sanctuary backdrop rendered successfully!")
