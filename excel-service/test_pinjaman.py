import pandas as pd
from app.services.processor import process_files

res = process_files(
    path_simpanan_berjalan="SSA Simpanan - 4 Jul 2026.csv",
    path_pinjaman_berjalan="SSA Pinjaman - 4 Jul 2026.csv",
    path_simpanan_historis=[],
    path_pinjaman_historis=[]
)
print("Total AH Gunsar Pinjaman:", res.get("Total AH Gunsar", {}).get("rows", [])[-10:])
