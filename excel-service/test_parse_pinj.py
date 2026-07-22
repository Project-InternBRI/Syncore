import sys
sys.path.append('.')
from app.services.file_reader import read_file
import pandas as pd

df_p = read_file('../backend/storage/app/private/public/temp/pinjaman_hist.csv')
print("Total Rows:", len(df_p))
# Filter Jan-25
df_p = df_p[df_p['Month, Day, Year of Periode'].str.contains('Jan', na=False) & df_p['Month, Day, Year of Periode'].str.contains('2025', na=False)]
print("Jan-25 Rows:", len(df_p))

# Filter Tanah Abang
df_p = df_p[df_p['Nama Cabang'].str.contains('Tanah Abang', case=False, na=False)]
print("Tanah Abang Jan-25 Rows:", len(df_p))

# Print Baki Debet sum per Produk & Segmen
def parse_num(v):
    s = str(v).strip()
    try: return float(s)
    except:
        s = s.replace('.','').replace(',','.')
        try: return float(s)
        except: return 0.0

df_p['Baki Debet'] = df_p['Baki Debet'].apply(parse_num)
grp = df_p.groupby(['SEGMEN_2025', 'Produk'])['Baki Debet'].sum() / 1_000_000
print("\nSum of Baki Debet (Juta):")
print(grp.to_string())
print(f"Total: {grp.sum():.3f}")

