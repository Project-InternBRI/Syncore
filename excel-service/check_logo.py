from PIL import Image
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
img_path = os.path.join(base_dir, 'app', 'assets', 'danantara-logo.png')
img = Image.open(img_path)
print("Size:", img.size)
