import os
import tempfile
import io
import copy
from app.services.exporter_visual import export_pdf_visual

def filter_data_dict(data_dict: dict, selected_periods: list, selected_components: list) -> dict:
    if not selected_periods and not selected_components:
        return data_dict

    filtered_dict = {}
    for kc, kc_data in data_dict.items():
        if kc.startswith('__') and kc != '__uker_data__':
            filtered_dict[kc] = kc_data
            continue
            
        if kc == '__uker_data__':
            filtered_dict[kc] = filter_data_dict(kc_data, selected_periods, selected_components)
            continue
            
        if not isinstance(kc_data, dict) or 'rows' not in kc_data:
            filtered_dict[kc] = kc_data
            continue

        new_rows = []
        for r in kc_data.get('rows', []):
            label = r.get('label', '')
            if selected_components and label not in selected_components:
                continue
                
            if selected_periods and 'values' in r:
                new_vals = {k: v for k, v in r['values'].items() if k in selected_periods}
                r['values'] = new_vals
                
            new_rows.append(r)
            
        new_kc_data = copy.deepcopy(kc_data)
        new_kc_data['rows'] = new_rows
        
        if selected_periods and 'periode_list' in new_kc_data:
            new_kc_data['periode_list'] = [p for p in new_kc_data['periode_list'] if p in selected_periods]
            
        filtered_dict[kc] = new_kc_data
        
    return filtered_dict

def export_dashboard_pdf(data_dict: dict, dashboard_type: str, period_name: str, selected_periods: list, selected_components: list, selected_rka: list) -> bytes:
    """
    Export data_dict to PDF and return bytes.
    """
    metadata = {
        "periode": period_name,
        "tanggal": "Saat ini",
        "hari": "",
        "jam": ""
    }
    
    # Fix PHP json_encode bug where empty dicts {} become empty lists []
    def fix_php_empty_arrays(d):
        if isinstance(d, dict):
            for k, v in d.items():
                if k == "values" and isinstance(v, list) and len(v) == 0:
                    d[k] = {}
                else:
                    fix_php_empty_arrays(v)
        elif isinstance(d, list):
            for item in d:
                fix_php_empty_arrays(item)
                
    fix_php_empty_arrays(data_dict)
    
    # Pre-process data_dict if it's kcp or unit, because export_pdf_visual hardcodes "Total AH Gunsar"
    if dashboard_type in ['kcp', 'unit'] and '__uker_data__' in data_dict:
        uker_data = data_dict['__uker_data__']
        # Map to "Total AH Gunsar" so export_pdf_visual can read it
        if dashboard_type == 'kcp' and 'Total KCP' in uker_data:
            data_dict['Total AH Gunsar'] = uker_data['Total KCP']
        elif dashboard_type == 'unit' and 'Total Unit' in uker_data:
            data_dict['Total AH Gunsar'] = uker_data['Total Unit']
    elif dashboard_type == 'kcp' and 'Total KCP' in data_dict:
        data_dict['Total AH Gunsar'] = data_dict['Total KCP']
    elif dashboard_type == 'unit' and 'Total Unit' in data_dict:
        data_dict['Total AH Gunsar'] = data_dict['Total Unit']
        
    data_dict = filter_data_dict(data_dict, selected_periods, selected_components)
    
    temp_fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    os.close(temp_fd)
    
    try:
        try:
            export_pdf_visual(data_dict, temp_path, metadata, dashboard_type)
        except Exception as e:
            # Fallback basic PDF
            from reportlab.lib.pagesizes import A4
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.styles import getSampleStyleSheet
            
            doc = SimpleDocTemplate(temp_path, pagesize=A4)
            styles = getSampleStyleSheet()
            elements = [
                Paragraph(f"Dashboard {dashboard_type.upper()} - {period_name}", styles['Heading1']),
                Spacer(1, 20),
                Paragraph(f"Gagal generate visual PDF. Menampilkan fallback error:", styles['Normal']),
                Spacer(1, 10),
                Paragraph(str(e), styles['Normal'])
            ]
            doc.build(elements)
            
        with open(temp_path, 'rb') as f:
            pdf_bytes = f.read()
            
        return pdf_bytes
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
