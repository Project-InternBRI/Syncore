from PIL import Image
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
assets_dir = os.path.join(base_dir, 'app', 'assets')

def make_text_white_only_right_side(image_path, output_path):
    if not os.path.exists(image_path): return
    img = Image.open(image_path).convert("RGBA")
    width, height = img.size
    datas = img.getdata()
    new_data = []
    
    for i, item in enumerate(datas):
        x = i % width
        y = i // width
        r, g, b, a = item
        
        # Only modify pixels on the right side (text part)
        if x > 512 and a > 0:
            if r < 80 and g < 80 and b < 80:
                new_data.append((255, 255, 255, a))
            else:
                new_data.append(item)
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

make_text_white_only_right_side(os.path.join(assets_dir, 'danantara-logo.png'), os.path.join(assets_dir, 'danantara-logo-white.png'))
print("Danantara logo fixed with split strategy")
