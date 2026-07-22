import pandas as pd
import asyncio
from app.services.processor import process_files

# Create a mock historical file
df_p_hist = pd.DataFrame({
    'Cabang': ['Tanah Abang', 'Kemayoran'],
    'SEGMEN_2025': ['Consumer', 'Small'],
    'Kolektabilitas': [1, 2],
    'Outstanding': [1000, 2000],
    'Periode': ['20-Jul', 'Mar-26'],
    'PRODUK': ['KPR', 'Kecil Komersial']
})
df_p_hist.to_csv('mock_p_hist.csv', index=False)

df_s_hist = pd.DataFrame({
    'Cabang': ['Tanah Abang', 'Kemayoran'],
    'Segmentasi': ['Ritel', 'Ritel'],
    'Balance': [5000, 6000],
    'Tanggal': ['20-Jul', 'Mar-26'],
    'Jenis_Produk': ['Tabungan', 'Giro']
})
df_s_hist.to_csv('mock_s_hist.csv', index=False)

df_p_curr = pd.DataFrame({
    'Nama Cabang': ['Tanah Abang'],
    'SEGMEN_2025': ['Consumer'],
    'Kolektabilitas One Obligor': [1],
    'Baki Debet': [1500],
    'Month, Day, Year of Periode': ['21 Jul 2026'],
    'Produk': ['KPR']
})
df_p_curr.to_csv('mock_p_curr.csv', index=False)

df_s_curr = pd.DataFrame({
    'Nama Cabang': ['Tanah Abang'],
    'Segmentasi BPR': ['Ritel'],
    'Saldo Equivalen': [5500],
    'Month, Day, Year of Posisi': ['21 Jul 2026'],
    'Jenis Produk': ['Tabungan']
})
df_s_curr.to_csv('mock_s_curr.csv', index=False)

def cb(pct, msg):
    pass

res = process_files(
    'mock_s_curr.csv', 'mock_p_curr.csv',
    ['mock_s_hist.csv'], ['mock_p_hist.csv'],
    cb
)

# Check if historical pinjaman is processed
tanah_abang_rows = res['Tanah Abang']['rows']
for r in tanah_abang_rows:
    if r['label'] == 'Pinjaman':
        print("Pinjaman Tanah Abang:", r)
