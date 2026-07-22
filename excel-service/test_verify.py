from app.services.processor import safe_pct

sml = 126501
pinjaman = 1805041
print(f"sml_pct = {safe_pct(sml, pinjaman)}")
