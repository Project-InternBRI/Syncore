from app.services.exporter_visual import get_rka_vals
# I will just write the math manually:
posisi_val = 0.061110
rka_val = 2.27
pencp = (posisi_val / rka_val) * 100
print(f"pencp = {pencp}")
print(f"Formatted: {pencp:.2f}%")
