import pandas as pd
from app.services.processor import prepare_pinjaman

df = pd.DataFrame({
    'SEGMEN_2025': ['Consumer'],
    'Produk': ['KPR'],
    'Nama Cabang': ['KC TANAH ABANG'],
    'Month, Day, Year of Periode': ['20 Jun 2026'],
    'Baki Debet': ['1000'],
    'Kolektabilitas One Obligor': ['1']
})
res = prepare_pinjaman(df)
print("Columns after prepare_pinjaman:", res.columns.tolist())
