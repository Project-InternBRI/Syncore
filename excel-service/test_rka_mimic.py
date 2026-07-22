# Mimic what exporter_visual does
lbl = "SML %"
posisi_val = 0.0611
rka_val = 2.27
r_data = []

if rka_val != "":
    r_data.append(f"{rka_val:.2f}%" if "%" in lbl else f"{rka_val:,.0f}")
    if posisi_val and rka_val and rka_val != 0:
        pencp = (posisi_val / rka_val) * 100
        r_data.append(f"{pencp:.2f}%")
    else:
        r_data.append("0.00%")
        
print("Appended:", r_data)
