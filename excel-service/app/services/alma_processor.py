"""
alma_processor.py — Baca dan proses file ALMA (Laba, COF & COC).

File ini HANYA untuk keperluan data ALMA.
TIDAK mengubah logika file_reader.py, processor.py, atau tabel per-KC.
"""

import re
import pandas as pd
from pathlib import Path


# ─────────────────────────────────────────────────────────────────
# MAPPING WILAYAH
# ─────────────────────────────────────────────────────────────────
WILAYAH_KEYWORDS_ALMA = {
    'Tanah Abang'   : ['tanah abang'],
    'Krekot'        : ['krekot'],
    'Veteran'       : ['veteran'],
    'Roxi'          : ['roxi'],
    'Gunung Sahari' : ['gunung sahari'],
    'Mangga Dua'    : ['mangga dua'],
    'Kemayoran'     : ['kemayoran'],
}


# ─────────────────────────────────────────────────────────────────
# READ FILE
# ─────────────────────────────────────────────────────────────────
def read_alma_file(path: str) -> pd.DataFrame:
    """
    Baca file ALMA dan kembalikan DataFrame bersih dengan kolom:
      kanca, unit, metrik (laba/cof/coc), periode (YYYYMM), nilai (float)

    Support format: .xlsx, .xlsm, .xls, .csv (tab / semicolon / koma)
    """
    ext = Path(path).suffix.lower()

    df = None
    if ext in ('.xlsx', '.xlsm'):
        df = pd.read_excel(path, engine='openpyxl', header=None)
    elif ext == '.xls':
        df = pd.read_excel(path, engine='xlrd', header=None)
    elif ext == '.csv':
        for sep in ['\t', ';', ',']:
            try:
                df_try = pd.read_csv(path, sep=sep, encoding='utf-8-sig', header=None)
                if df_try.shape[1] > 5:
                    df = df_try
                    break
            except Exception:
                continue

    if df is None or df.empty:
        print(f"[ALMA] Gagal membaca file atau file kosong: {path}")
        return pd.DataFrame(columns=['kanca', 'unit', 'metrik', 'periode', 'nilai'])

    # ── Baris pertama = header; ekstrak kolom periode (format YYYYMM) ──
    header_row = df.iloc[0]
    periode_cols: dict[int, str] = {}
    for i, val in enumerate(header_row):
        if val is not None:
            s = str(val).strip()
            if s.isdigit() and len(s) == 6:
                periode_cols[i] = s

    if not periode_cols:
        print("[ALMA] Tidak ada kolom periode (YYYYMM) ditemukan di baris pertama.")
        return pd.DataFrame(columns=['kanca', 'unit', 'metrik', 'periode', 'nilai'])

    # ── Data mulai baris ke-2 ──
    data_rows = df.iloc[1:].copy()
    data_rows.columns = range(len(data_rows.columns))

    # Forward-fill kolom Kanca Konsolidasi (0) dan Unit Kerja (1)
    data_rows[0] = data_rows[0].ffill()
    data_rows[1] = data_rows[1].ffill()

    # Metrik yang valid
    VALID_METRICS = {
        '15. Laba Setelah Pajak': 'laba',
        '19. COF (%)': 'cof',
        '25. Credit Cost (%)': 'coc',
    }

    records = []
    for _, row in data_rows.iterrows():
        kanca     = str(row[0]).strip() if pd.notna(row[0]) else ''
        unit      = str(row[1]).strip() if pd.notna(row[1]) else ''
        metrik_raw = str(row[2]).strip() if pd.notna(row[2]) else ''
        metrik    = VALID_METRICS.get(metrik_raw)

        if not metrik or not kanca:
            continue

        for col_idx, periode_label in periode_cols.items():
            val = row.get(col_idx)
            try:
                val_float = float(val)
            except (TypeError, ValueError):
                val_float = None

            records.append({
                'kanca'  : kanca,
                'unit'   : unit,
                'metrik' : metrik,
                'periode': periode_label,
                'nilai'  : val_float,
            })

    result_df = pd.DataFrame(records)
    print(f"[ALMA] Berhasil membaca {len(result_df)} baris dari: {Path(path).name}")
    return result_df


# ─────────────────────────────────────────────────────────────────
# EXTRACT KEYWORD KC
# ─────────────────────────────────────────────────────────────────
def extract_kc_keyword_from_alma(kanca_str: str) -> str | None:
    """
    Ekstrak keyword KC dari nama kanca di ALMA.
    Contoh: "KC Jakarta Gunung Sahari" → "gunung sahari"
    """
    if not kanca_str:
        return None
    s = kanca_str.lower()
    s = re.sub(r'^kc\.?\s*(jakarta\s*)?', '', s).strip()
    return s if s else None


# ─────────────────────────────────────────────────────────────────
# MAP KANCA → WILAYAH
# ─────────────────────────────────────────────────────────────────
def map_kanca_to_wilayah(kanca_str: str) -> str | None:
    """Map nama kanca ALMA ke nama wilayah KC di sistem SSA."""
    if not kanca_str:
        return None
    s = kanca_str.lower()
    for wilayah, keywords in WILAYAH_KEYWORDS_ALMA.items():
        for kw in keywords:
            if kw in s:
                return wilayah
    return None


# ─────────────────────────────────────────────────────────────────
# PROCESS ALMA
# ─────────────────────────────────────────────────────────────────
def process_alma(df_alma: pd.DataFrame, wilayah_list: list[str]) -> dict:
    """
    Agregasi data ALMA level KC (Kanca Konsolidasi == Unit Kerja)
    per metrik per periode.

    Returns dict:
    {
        "Gunung Sahari": {
            "laba": {"202501": 3488717708.0, ...},
            "cof" : {"202501": 0.0314, ...},
            "coc" : {"202501": 0.0374, ...},
        },
        ...
        "Total AH Gunsar": { ... }  ← agregat semua KC
    }
    """
    # Filter hanya baris KC induk (kanca == unit)
    df_induk = df_alma[
        df_alma.apply(
            lambda r: r['kanca'].strip().lower() == r['unit'].strip().lower(),
            axis=1
        )
    ].copy()

    df_induk['wilayah'] = df_induk['kanca'].apply(map_kanca_to_wilayah)
    df_induk = df_induk[df_induk['wilayah'].notna()]

    print(f"[ALMA] Baris KC induk valid : {len(df_induk)}")
    print(f"[ALMA] Wilayah ditemukan    : {list(df_induk['wilayah'].unique())}")

    result: dict = {}

    for wilayah in wilayah_list:
        df_kc = df_induk[df_induk['wilayah'] == wilayah]
        wilayah_data: dict = {'laba': {}, 'cof': {}, 'coc': {}}

        for metrik in ('laba', 'cof', 'coc'):
            df_m = df_kc[df_kc['metrik'] == metrik]
            for _, row in df_m.iterrows():
                p = row['periode']
                v = row['nilai']
                # Buang outlier Credit Cost (nilai > 5 = >500%)
                if metrik == 'coc' and v is not None and abs(v) > 5:
                    v = None
                wilayah_data[metrik][p] = v

        result[wilayah] = wilayah_data

    # ── Total AH Gunsar ──
    all_periods = sorted({
        p
        for kc_data in result.values()
        for metrik_data in kc_data.values()
        for p in metrik_data
    })

    total_data: dict = {'laba': {}, 'cof': {}, 'coc': {}}
    for p in all_periods:
        # Laba = sum semua KC
        laba_vals = [
            result[kc]['laba'][p]
            for kc in wilayah_list
            if result.get(kc, {}).get('laba', {}).get(p) is not None
        ]
        total_data['laba'][p] = sum(laba_vals) if laba_vals else None

        # COF = rata-rata sederhana KC yang ada data
        cof_vals = [
            result[kc]['cof'][p]
            for kc in wilayah_list
            if result.get(kc, {}).get('cof', {}).get(p) is not None
        ]
        total_data['cof'][p] = sum(cof_vals) / len(cof_vals) if cof_vals else None

        # COC = rata-rata sederhana KC yang ada data
        coc_vals = [
            result[kc]['coc'][p]
            for kc in wilayah_list
            if result.get(kc, {}).get('coc', {}).get(p) is not None
        ]
        total_data['coc'][p] = sum(coc_vals) / len(coc_vals) if coc_vals else None

    result['Total AH Gunsar'] = total_data

    kc_found = [k for k in result if k != 'Total AH Gunsar' and (
        result[k]['laba'] or result[k]['cof'] or result[k]['coc']
    )]
    print(f"[ALMA] Data berhasil diproses untuk: {kc_found}")
    return result


# ─────────────────────────────────────────────────────────────────
# FORMAT PERIODE LABEL
# ─────────────────────────────────────────────────────────────────
def format_periode_label_alma(periode_yyyymm: str) -> str:
    """
    Convert "202501" → "Jan-25"
    Convert "202601" → "Jan-26"
    """
    BULAN = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
             'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    try:
        s = str(periode_yyyymm)
        tahun  = int(s[:4])
        bulan  = int(s[4:6])
        tahun2 = str(tahun)[2:]
        return f"{BULAN[bulan]}-{tahun2}"
    except Exception:
        return str(periode_yyyymm)
