import sys
sys.path.append('.')
from app.services.file_reader import read_file
df_s = read_file('../backend/storage/app/private/public/temp/simpanan_hist.csv')
print("Simpanan Hist Columns:", df_s.columns.tolist())
df_p = read_file('../backend/storage/app/private/public/temp/pinjaman_hist.csv')
print("Pinjaman Hist Columns:", df_p.columns.tolist())

# Cek tanggal unik
from app.services.processor import parse_tanggal_id
print("Simpanan Unique Dates:", df_s['Month, Day, Year of Posisi'].unique())
print("Simpanan Parsed Dates:", df_s['Month, Day, Year of Posisi'].apply(parse_tanggal_id).unique())
print("Pinjaman Unique Dates:", df_p['Month, Day, Year of Periode'].unique())
print("Pinjaman Parsed Dates:", df_p['Month, Day, Year of Periode'].apply(parse_tanggal_id).unique())


print("\n--- TEST KCP UNIT ---")
from app.services.processor_uker import get_kcp_dan_unit
# We need to simulate the df_s and df_p that processor.py sends
df_s['_tanggal'] = df_s['Month, Day, Year of Posisi'].apply(parse_tanggal_id)
from app.services.processor import format_label
df_s['_label'] = df_s['_tanggal'].apply(format_label)
print("df_s columns:", df_s.columns.tolist())

df_p['_tanggal'] = df_p['Month, Day, Year of Periode'].apply(parse_tanggal_id)
df_p['_label'] = df_p['_tanggal'].apply(format_label)

try:
    dict_kcp, dict_unit = get_kcp_dan_unit(df_s, df_p, 'Nama Cabang', 'Nama Cabang')
    print("SUCCESS KCP")
except Exception as e:
    import traceback
    traceback.print_exc()

