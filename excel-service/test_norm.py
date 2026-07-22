import pandas as pd
from app.services.processor import _find_col

COL_P_KC = "Nama Cabang"
COL_P_KOLEKT = "Kolektabilitas One Obligor"
COL_P_BAKI = "Baki Debet"
COL_P_PERIODE = "Month, Day, Year of Periode"

def norm_p_cols(df):
    rename_map = {}
    kc = _find_col(df, COL_P_KC, "Cabang", "KC")
    if kc: rename_map[kc] = COL_P_KC
    seg = _find_col(df, "SEGMEN_2025", "Segmen_2025", "segmen_2025", "Segmen", "SEGMEN")
    if seg: rename_map[seg] = "SEGMEN_2025"
    kol = _find_col(df, COL_P_KOLEKT, "Kolektabilitas", "Kol")
    if kol: rename_map[kol] = COL_P_KOLEKT
    baki = _find_col(df, COL_P_BAKI, "Outstanding", "Baki")
    if baki: rename_map[baki] = COL_P_BAKI
    prd = _find_col(df, "Produk", "PRODUK", "produk")
    if prd: rename_map[prd] = "Produk"
    tgl = _find_col(df, COL_P_PERIODE, "Periode", "Tanggal")
    if tgl: rename_map[tgl] = COL_P_PERIODE
    return df.rename(columns=rename_map)

df1 = pd.DataFrame({"Kolektabilitas One Obligor": [1], "Cabang": ["A"], "Periode": ["20-Jul"], "Produk": ["KPR"], "Baki": [100]})
print("Original DF1 columns:", df1.columns.tolist())
df1 = norm_p_cols(df1)
print("Renamed DF1 columns:", df1.columns.tolist())
