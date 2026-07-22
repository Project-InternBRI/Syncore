import re

with open('app/services/exporter_visual.py', 'r') as f:
    content = f.read()

start_idx = content.find('def export_pdf_visual(data_dict, output_path, metadata):')
end_idx = content.find('def export_pptx_visual(', start_idx)
if end_idx == -1: end_idx = len(content)

new_func = """def export_pdf_visual(data_dict, output_path, metadata):
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    doc = SimpleDocTemplate(output_path, pagesize=landscape(A4),
                            rightMargin=20, leftMargin=20, topMargin=30, bottomMargin=30)
    elements = []
    styles = getSampleStyleSheet()
    
    # --- Cover Page Styles ---
    cover_title_style = ParagraphStyle(
        'CoverTitle', parent=styles['Heading1'], fontSize=48, textColor=colors.white,
        alignment=0, spaceBefore=140, spaceAfter=30, leftIndent=40
    )
    cover_subtitle_style = ParagraphStyle(
        'CoverSubtitle', parent=styles['Normal'], fontSize=28, textColor=colors.white,
        alignment=0, spaceAfter=15, leftIndent=40
    )
    cover_bottom_style = ParagraphStyle(
        'CoverBottom', parent=styles['Normal'], fontSize=18, textColor=colors.white,
        alignment=0, spaceBefore=120, leftIndent=40, leading=22
    )
    header_style = ParagraphStyle(
        'CustomHeader', parent=styles['Heading2'], fontSize=16, textColor=colors.HexColor('#1E3A5F'), spaceAfter=15
    )
    
    periode = metadata.get("periode", "-")
    
    elements.append(Paragraph("<b>Performance Review:</b>", cover_title_style))
    elements.append(Paragraph("<b><i>Reinforce</i></b> <i>the</i> <b><i>Network</i></b><i>, Win</i> <b><i>Sustainable</i></b> <i>Growth</i>", cover_subtitle_style))
    elements.append(Paragraph("<b>Area Head Gunung Sahari</b><br/><b>Region 6 - Jakarta 1</b>", cover_bottom_style))
    elements.append(PageBreak())
    
    rka_payload = data_dict.get("__rka__", [])
    rka_records_by_kc = {}
    DB_TO_INTERNAL_RKA_MAP = {
        'Total DPK': 'dana pihak ketiga', 'Tabungan': 'tabungan', 'Giro': 'giro', 'Deposito': 'deposito',
        'Total Pinjaman': 'pinjaman', 'Pinjaman Mikro': 'pinjaman mikro', 'Pinjaman Small': 'pinjaman small',
        'Pinjaman Konsumer': 'pinjaman konsumer', 'SML': 'sml', 'SML Ratio': 'sml %', 'NPL': 'npl', 'NPL Ratio': 'npl %',
    }
    
    total_data = data_dict.get("Total AH Gunsar", {})
    periode_list = total_data.get("periode_list", [])
    
    target_month_num = "01"
    target_month_full = "Januari"
    target_year = "26"
    
    if periode_list:
        lp = periode_list[-1]
        try:
            m_str = lp.split('-')[0].strip().lower()
            if ' ' in m_str: m_str = m_str.split(' ')[1]
            MONTH_MAP = {'jan':'01', 'feb':'02', 'mar':'03', 'apr':'04', 'mei':'05', 'jun':'06', 'jul':'07', 'agu':'08', 'sep':'09', 'okt':'10', 'nov':'11', 'des':'12'}
            FULL_MONTH_MAP = {'01':'Januari', '02':'Februari', '03':'Maret', '04':'April', '05':'Mei', '06':'Juni', '07':'Juli', '08':'Agustus', '09':'September', '10':'Oktober', '11':'November', '12':'Desember'}
            target_month_num = MONTH_MAP.get(m_str[:3], '01')
            target_month_full = FULL_MONTH_MAP.get(target_month_num, "Januari")
            if '-' in lp:
                y_str = lp.split('-')[-1]
                target_year = y_str[-2:] if len(y_str) >= 2 else y_str
        except: pass

    MONTH_NAME_TO_NUM = {'januari': '01', 'februari': '02', 'maret': '03', 'april': '04', 'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08', 'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'}
    
    for rka in rka_payload:
        kc_full = rka.get('branch_name', '')
        kc_short = kc_full.replace('KC Jakarta ', '').replace('KC ', '').strip()
        
        bulan_str = str(rka.get('bulan', '')).lower().strip()
        if bulan_str in ['1','2','3','4','5','6','7','8','9']:
            bulan_str = '0' + bulan_str
            
        if bulan_str in ['01','02','03','04','05','06','07','08','09','10','11','12']:
            bulan_num = bulan_str
        else:
            bulan_num = MONTH_NAME_TO_NUM.get(bulan_str, '')
        
        if bulan_num == target_month_num:
            kat = DB_TO_INTERNAL_RKA_MAP.get(rka.get('kategori', ''))
            if kat:
                if kc_short not in rka_records_by_kc:
                    rka_records_by_kc[kc_short] = {}
                try:
                    rka_records_by_kc[kc_short][kat] = float(rka.get('target_nominal', 0))
                except:
                    rka_records_by_kc[kc_short][kat] = 0.0

    dk, pk, sml, npl = None, None, None, None
    if periode_list:
        lp = periode_list[-1]
        for r in total_data.get("rows", []):
            ll = r.get("label", "").lower()
            vl = r.get("values", {}).get(lp, 0)
            if ll == "dana pihak ketiga": dk = _sv(vl)
            elif ll == "pinjaman": pk = _sv(vl)
            elif ll == "sml %": sml = _sv(vl)
            elif ll == "npl %": npl = _sv(vl)
            
    # KPI Table
    elements.append(Paragraph(f"RINGKASAN EKSEKUTIF - {periode}", header_style))
    kpi_headers = []
    kpi_values = []
    if dk is not None:
        kpi_headers.append("Total DPK (Juta)")
        kpi_values.append(f"{dk:,.0f}")
    if pk is not None:
        kpi_headers.append("Total Pinjaman (Juta)")
        kpi_values.append(f"{pk:,.0f}")
    if sml is not None:
        kpi_headers.append("SML Ratio (%)")
        kpi_values.append(f"{sml:.2f}%")
    if npl is not None:
        kpi_headers.append("NPL Ratio (%)")
        kpi_values.append(f"{npl:.2f}%")
        
    if kpi_headers:
        kpi_data = [kpi_headers, kpi_values]
        kpi_table = Table(kpi_data, colWidths=[150]*len(kpi_headers))
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A5F')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 10),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('BACKGROUND', (0,1), (-1,1), colors.HexColor('#F1F5F9')),
            ('TEXTCOLOR', (0,1), (-1,1), colors.HexColor('#1E293B')),
            ('FONTNAME', (0,1), (-1,1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,1), (-1,1), 12),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
        ]))
        elements.append(kpi_table)
    elements.append(Spacer(1, 20))
    
    # Data Table
    kcs = ["Tanah Abang", "Krekot", "Veteran", "Roxi", "Gunung Sahari", "Mangga Dua", "Kemayoran", "Total AH Gunsar"]
    tbl_headers = ["Kantor Cabang"]
    if dk is not None: tbl_headers.append("DPK Total")
    if pk is not None: tbl_headers.append("Pinjaman Total")
    if sml is not None: tbl_headers.append("SML %")
    if npl is not None: tbl_headers.append("NPL %")
    
    tbl_data = [tbl_headers]
    for kc_nm in kcs:
        kc_r = data_dict.get(kc_nm, {}).get("rows", [])
        k_dk, k_pk, k_sml, k_npl = None, None, None, None
        if periode_list:
            lp = periode_list[-1]
            for x in kc_r:
                ll = x.get("label","").lower()
                vl = x.get("values", {}).get(lp, 0)
                if ll == "dana pihak ketiga": k_dk = _sv(vl)
                elif ll == "pinjaman": k_pk = _sv(vl)
                elif ll == "sml %": k_sml = _sv(vl)
                elif ll == "npl %": k_npl = _sv(vl)
                
        row_data = [kc_nm]
        if dk is not None: row_data.append(f"{k_dk:,.0f}" if k_dk is not None else "-")
        if pk is not None: row_data.append(f"{k_pk:,.0f}" if k_pk is not None else "-")
        if sml is not None: row_data.append(f"{k_sml:.2f}%" if k_sml is not None else "-")
        if npl is not None: row_data.append(f"{k_npl:.2f}%" if k_npl is not None else "-")
        tbl_data.append(row_data)
        
    if len(tbl_headers) > 1:
        sum_table = Table(tbl_data, colWidths=[120] + [90]*(len(tbl_headers)-1))
        sum_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A5F')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
            ('ALIGN', (0,0), (0,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 9),
            ('FONTSIZE', (0,1), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ]))
        elements.append(sum_table)
    
    # Detail slides per KC
    for kc_nm in kcs:
        kc_r = data_dict.get(kc_nm, {}).get("rows", [])
        if not kc_r: continue
        
        elements.append(PageBreak())
        elements.append(Paragraph(f"DETAIL KINERJA — {kc_nm.upper()}", header_style))
        
        main_rows = [x for x in kc_r if x.get("level", 0) == 0 and x.get("label") != "SEP"]
        if not periode_list: continue
            
        n_p = len(periode_list)
        cols_count = n_p + 5
        
        # DOUBLE HEADER
        row0 = ["Mata Anggaran"] + ["Posisi"] + [""]*(n_p-1) + ["RKA", "Pencp RKA %", "MTD", "YTD", "YOY"]
        row1 = [""] + periode_list + [f"{target_month_full}-{target_year}", "", "", "", ""]
        
        det_data = [row0, row1]
        
        rka_dict = rka_records_by_kc.get(kc_nm, {})
        # Jika tidak ketemu nama pendek (misal di DB Krekot Bunder tapi kc_nm Krekot)
        if not rka_dict and kc_nm == 'Krekot':
            rka_dict = rka_records_by_kc.get('Krekot Bunder', {})
        elif not rka_dict and kc_nm == 'Gunung Sahari':
            rka_dict = rka_records_by_kc.get('Gunung Sahari Raya', {})
            
        for row in main_rows:
            lbl = row.get("label", "")
            r_data = [lbl]
            
            # Period values
            for p in periode_list:
                v = _sv(row.get("values", {}).get(p, 0))
                if "%" in lbl: r_data.append(f"{v:.2f}%")
                else: r_data.append(f"{v:,.0f}")
                
            # RKA and Pencapaian
            rka_val = rka_dict.get(lbl.lower(), 0)
            if rka_val:
                r_data.append(f"{rka_val:,.0f}")
                posisi_val = _sv(row.get("values", {}).get(periode_list[-1], 0))
                if posisi_val and rka_val > 0:
                    pencp = (posisi_val / rka_val) * 100
                    r_data.append(f"{pencp:.2f}%")
                else:
                    r_data.append("0.00%")
            else:
                r_data.append("-")
                r_data.append("-")
            
            # MTD, YTD, YOY
            mtd = row.get("mtd")
            ytd = row.get("ytd")
            yoy = row.get("yoy")
            
            for m in [mtd, ytd, yoy]:
                if m is None:
                    r_data.append("-")
                else:
                    if "%" in lbl: r_data.append(f"{m:.2f}%")
                    else: r_data.append(f"{m:,.0f}")
                    
            det_data.append(r_data)
            
        w_main = 160
        w_other = 58
        
        ts_detail = TableStyle([
            # BASE STYLING
            ('BACKGROUND', (0,0), (-1,1), colors.HexColor('#1E3A5F')),
            ('TEXTCOLOR', (0,0), (-1,1), colors.whitesmoke),
            ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
            ('ALIGN', (0,0), (0,-1), 'LEFT'),
            ('ALIGN', (0,0), (-1,1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('FONTNAME', (0,0), (-1,1), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,1), 7.5),
            ('FONTSIZE', (0,2), (-1,-1), 6.5),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            
            # MERGES FOR DOUBLE HEADER
            ('SPAN', (0,0), (0,1)), # Mata Anggaran
            ('SPAN', (1,0), (n_p,0)), # Posisi
            ('SPAN', (n_p+2,0), (n_p+2,1)), # Pencp RKA %
            ('SPAN', (n_p+3,0), (n_p+3,1)), # MTD
            ('SPAN', (n_p+4,0), (n_p+4,1)), # YTD
            ('SPAN', (n_p+5,0), (n_p+5,1)), # YOY
        ])
        
        det_table = Table(det_data, colWidths=[w_main] + [w_other]*(cols_count-1), repeatRows=2)
        det_table.setStyle(ts_detail)
        elements.append(det_table)
        
    def draw_cover_bg(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(colors.HexColor('#1354AE'))
        canvas.rect(0, 0, doc.width + doc.leftMargin + doc.rightMargin, doc.height + doc.topMargin + doc.bottomMargin, fill=1, stroke=0)
        canvas.setStrokeColor(colors.HexColor('#65C0EB'))
        canvas.setLineWidth(15)
        canvas.rect(20, 20, doc.width + doc.leftMargin + doc.rightMargin - 40, doc.height + doc.topMargin + doc.bottomMargin - 40, fill=0, stroke=1)
        canvas.restoreState()

    doc.build(elements, onFirstPage=draw_cover_bg)

"""

with open('app/services/exporter_visual.py', 'w') as f:
    f.write(content[:start_idx] + new_func + "\n\n" + content[end_idx:])
