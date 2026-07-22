from PIL import Image
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
assets_dir = os.path.join(base_dir, 'app', 'assets')

def make_white(image_path, output_path):
    if not os.path.exists(image_path): return
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()
    new_data = []
    for item in datas:
        # Change all non-transparent pixels to white
        if item[3] > 0:
            new_data.append((255, 255, 255, item[3]))
        else:
            new_data.append(item)
    img.putdata(new_data)
    img.save(output_path, "PNG")

make_white(os.path.join(assets_dir, 'danantara-logo.png'), os.path.join(assets_dir, 'danantara-logo-white.png'))
make_white(os.path.join(assets_dir, 'Logo_BRI.png'), os.path.join(assets_dir, 'Logo_BRI-white.png'))
print("Done")
