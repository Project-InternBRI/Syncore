import pandas as pd
df_s = pd.read_csv('/Users/naufalrasydan/Documents/Workspace/Intern BRI/Syncore/backend/storage/app/private/public/temp/simpanan_hist.csv')
print("Simpanan Hist Columns:", df_s.columns.tolist())
print("Simpanan Hist Dates:", df_s['Month, Day, Year of Posisi'].unique() if 'Month, Day, Year of Posisi' in df_s.columns else "No Date Col")

df_p = pd.read_csv('/Users/naufalrasydan/Documents/Workspace/Intern BRI/Syncore/backend/storage/app/private/public/temp/pinjaman_hist.csv')
print("Pinjaman Hist Dates:", df_p['Month, Day, Year of Periode'].unique() if 'Month, Day, Year of Periode' in df_p.columns else "No Date Col")
