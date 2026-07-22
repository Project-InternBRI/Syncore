"""
exporter_uker.py — Export hasil proses KCP / Unit ke format Excel Dashboard.

Reuses semua fungsi styling, _write_sheet, dan _build_export_filename dari exporter.py.
TIDAK mengubah exporter.py sama sekali.
"""
from __future__ import annotations

from pathlib import Path
from datetime import datetime

from app.services.file_reader import BULAN_PANJANG, BULAN_SINGKAT
from app.services.exporter import (
    _write_sheet,       # tulis satu sheet — identik dengan KC
    get_unique_path,
)

from openpyxl import Workbook


# ────────────────────────────────────────────────────────────────────
# FILENAME HELPER
# ────────────────────────────────────────────────────────────────────
def get_filename_uker(data_dict: dict, uker_type: str) -> str:
    """
    Buat nama file berdasarkan periode terbaru pada data.
    Format: Dashboard KCP AH Gunsar [DD] [Bulan] [YYYY].xlsx
            Dashboard Unit AH Gunsar [DD] [Bulan] [YYYY].xlsx
    """
    date_str = ""
    try:
        # Cari Total KCP atau Total Unit
        total_key = 'Total KCP' if uker_type == 'KCP' else 'Total Unit'
        total_data = data_dict.get(total_key)
        if not total_data:
            # Fallback: ambil entitas pertama
            for k, v in data_dict.items():
                if k != '__stats__' and isinstance(v, dict) and 'rows' in v:
                    total_data = v
                    break

        if total_data:
            rows = total_data.get('rows', [])
            meta = next((r for r in rows if r.get('row_type') == '__metadata__'), None)
            if meta:
                terbaru_dt = meta['periode_refs']['terbaru']
                if terbaru_dt:
                    date_str = f" {terbaru_dt.day} {BULAN_PANJANG[terbaru_dt.month]} {terbaru_dt.year}"
    except Exception:
        pass

    label = uker_type  # 'KCP' or 'Unit'
    return f"Dashboard {label} AH Gunsar{date_str}.xlsx"


# ────────────────────────────────────────────────────────────────────
# EXPORT KCP atau UNIT ke Excel
# ────────────────────────────────────────────────────────────────────
def export_uker_to_excel(data_dict: dict, output_path: str,
                         uker_type: str) -> Path:
    """
    Export data KCP atau Unit ke file Excel.

    data_dict: hasil dari process_files_uker()
    uker_type : 'KCP' | 'Unit'
    """
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    wb = Workbook()
    first = True

    stats   = data_dict.get('__stats__', {})
    total_key = 'Total KCP' if uker_type == 'KCP' else 'Total Unit'

    # Entitas individual (diurutkan alphabetical)
    entity_keys = sorted([
        k for k, v in data_dict.items()
        if k not in ('__stats__', total_key)
        and isinstance(v, dict) and 'rows' in v
        and v.get('uker_type') == uker_type
    ])

    all_keys = entity_keys + ([total_key] if total_key in data_dict else [])

    # ====== PROSES RKA DATA ======
    rka_payload = data_dict.get("__rka__", [])
    rka_records_by_month_and_uker = {}
    
    DB_TO_INTERNAL_RKA_MAP = {
        'Dana Pihak Ketiga - Tabungan': 'dpk_tabungan',
        'Dana Pihak Ketiga - Giro': 'dpk_giro',
        'Dana Pihak Ketiga - Deposito': 'dpk_deposito',
        'DPK Korporasi - Giro': 'korp_giro',
        'DPK Korporasi - Deposito': 'korp_deposito',
        'Pinjaman - Mikro': 'pinj_mikro',
        'Pinjaman - Small': 'pinj_small',
        'Pinjaman - Konsumer': 'pinj_konsumer',
        'Pinjaman - Konsumer KPR': 'pinj_kons_kpr',
        'Pinjaman - Konsumer Briguna Ritel': 'pinj_kons_briguna',
        'SML - Mikro': 'sml_mikro',
        'SML - Small': 'sml_small',
        'SML - Konsumer': 'sml_konsumer',
        'SML - Konsumer KPR': 'sml_kons_kpr',
        'SML - Konsumer Briguna Ritel': 'sml_kons_briguna',
        'NPL - Mikro': 'npl_mikro',
        'NPL - Small': 'npl_small',
        'NPL - Konsumer': 'npl_konsumer',
        'NPL - Konsumer KPR': 'npl_kons_kpr',
        'NPL - Konsumer Briguna Ritel': 'npl_kons_briguna',
        'Recovery EC - Mikro': 'rec_mikro',
        'Recovery EC - Small': 'rec_small',
        'Recovery EC - Konsumer': 'rec_konsumer',
    }
    
    import re

    def normalize_uker_name(name: str) -> str:
        """
        Normalkan nama uker untuk perbandingan:
        - Hapus prefix kode (misal "00433 -- ")
        - Lowercase
        - Hapus spasi berlebih
        """
        # Hapus prefix kode angka: "00433 -- KCP SENEN JAYA" → "KCP SENEN JAYA"
        cleaned = re.sub(r'^\d+\s*--\s*', '', str(name).strip())
        # Lowercase & normalisasi spasi
        return ' '.join(cleaned.lower().split())
    
    MONTH_NAME_TO_NUM = {
        'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
        'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
        'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
    }
    
    for rka in rka_payload:
        uker_full = str(rka.get('branch_name', '')).strip()
        if not uker_full: continue
        
        uker_norm = normalize_uker_name(uker_full)
        
        if uker_norm not in rka_records_by_month_and_uker:
            rka_records_by_month_and_uker[uker_norm] = {}
            
        bulan_str = rka.get('bulan', '').lower()
        bulan_num = MONTH_NAME_TO_NUM.get(bulan_str, '')
        if not bulan_num:
            continue
            
        if bulan_num not in rka_records_by_month_and_uker[uker_norm]:
            rka_records_by_month_and_uker[uker_norm][bulan_num] = {}
            
        kategori_db = rka.get('kategori', '')
        internal_key = DB_TO_INTERNAL_RKA_MAP.get(kategori_db)
        if not internal_key:
            continue
            
        nominal = rka.get('target_nominal')
        try:
            nominal = float(nominal) if nominal else 0
        except ValueError:
            nominal = 0
            
        rka_records_by_month_and_uker[uker_norm][bulan_num][internal_key] = nominal
        
    for key in all_keys:
        kc_data = data_dict[key]
        sheet_name = key[:31]  # Excel max 31 chars

        if first:
            ws = wb.active
            ws.title = sheet_name
            first = False
        else:
            ws = wb.create_sheet(title=sheet_name)

        if key in ("Total KCP", "Total Unit"):
            # Hitung jumlah RKA HANYA untuk cabang (KCP/Unit) yang ada di entity_keys
            rka_for_branch = {}
            for ek in entity_keys:
                # Cari RKA untuk entity_key ini
                ek_norm = normalize_uker_name(ek)
                ek_rka = rka_records_by_month_and_uker.get(ek_norm, {})
                if not ek_rka:
                    for uker_db_norm, rka_data in rka_records_by_month_and_uker.items():
                        if uker_db_norm in ek_norm or ek_norm in uker_db_norm:
                            ek_rka = rka_data
                            break
                
                # Tambahkan ke total
                for m, metrics in ek_rka.items():
                    if m not in rka_for_branch:
                        rka_for_branch[m] = {}
                    for metric_key, val in metrics.items():
                        if metric_key not in rka_for_branch[m]:
                            rka_for_branch[m][metric_key] = 0
                        rka_for_branch[m][metric_key] += val
        else:
            # Match branch: normalize key (strip kode prefix) then lookup in RKA dict
            key_norm = normalize_uker_name(key)
            rka_for_branch = rka_records_by_month_and_uker.get(key_norm, {})
            
            # Fallback: jika tidak ditemukan persis, coba substring match
            if not rka_for_branch:
                for uker_db_norm, rka_data in rka_records_by_month_and_uker.items():
                    if uker_db_norm in key_norm or key_norm in uker_db_norm:
                        rka_for_branch = rka_data
                        break
                    print(f"[RKA UKER MATCH] '{key}' → '{uker_db_norm}' (substring)")
                    break

        if rka_for_branch:
            print(f"[RKA UKER] '{key}' → {len(rka_for_branch)} bulan RKA tersedia")
        else:
            print(f"[RKA UKER] '{key}' → tidak ada RKA (key_norm={key_norm!r})")

        # Gunakan _write_sheet dari exporter.py — logika penulisan identik KC
        _write_sheet(ws, key, kc_data, rka_for_branch)

    try:
        wb.save(str(out))
    except Exception as e:
        raise RuntimeError(f"Gagal menyimpan file Excel ({uker_type}): {e}") from e

    return out
