import re

with open('app/services/exporter_visual.py', 'r') as f:
    content = f.read()

# Find the start of export_pdf_visual
start_idx = content.find('def export_pdf_visual(data_dict, output_path, metadata):')
if start_idx == -1:
    print("Function not found!")
    exit(1)

# Find the end of export_pdf_visual (next def)
end_idx = content.find('def export_pptx_visual(', start_idx)
if end_idx == -1:
    end_idx = len(content)

new_func = """def export_pdf_visual(data_dict, output_path, metadata):
    # Using ReportLab to avoid Weasyprint GTK/Pango C-library issues on macOS
    from reportlab.lib.pagesizes import A4, landscape
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    doc = SimpleDocTemplate(output_path, pagesize=landscape(A4),
                            rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    elements = []
    styles = getSampleStyleSheet()
    
    # --- Cover Page Styles ---
    cover_title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Heading1'],
        fontSize=48,
        textColor=colors.white,
        alignment=0, # Left align
        spaceBefore=140,
        spaceAfter=30,
        leftIndent=40
    )
    cover_subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontSize=28,
        textColor=colors.white,
        alignment=0, # Left align
        spaceAfter=15,
        leftIndent=40
    )
    cover_bottom_style = ParagraphStyle(
        'CoverBottom',
        parent=styles['Normal'],
        fontSize=18,
        textColor=colors.white,
        alignment=0,
        spaceBefore=120,
        leftIndent=40,
        leading=22
    )
    
    # --- Content Page Styles ---
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1E3A5F'),
        spaceAfter=15
    )
    
    periode = metadata.get("periode", "-")
    
    # --- Cover Page Elements ---
    elements.append(Paragraph("<b>Performance Review:</b>", cover_title_style))
    elements.append(Paragraph("<b><i>Reinforce</i></b> <i>the</i> <b><i>Network</i></b><i>, Win</i> <b><i>Sustainable</i></b> <i>Growth</i>", cover_subtitle_style))
    elements.append(Paragraph("<b>Area Head Gunung Sahari</b><br/><b>Region 6 - Jakarta 1</b>", cover_bottom_style))
    elements.append(PageBreak())
    
    # Get total data
    total_data = data_dict.get("Total AH Gunsar", {})
    periode_list = total_data.get("periode_list", [])
    
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
        
        if not periode_list:
            continue
            
        cols_count = len(periode_list) + 2 # Mata Anggaran, <periods>, MTD
        det_data = []
        
        # Headers
        header_row = ["Mata Anggaran"] + periode_list + ["MTD"]
        det_data.append(header_row)
        
        for row in main_rows:
            lbl = row.get("label", "")
            r_data = [lbl]
            for p in periode_list:
                v = _sv(row.get("values", {}).get(p, 0))
                if "%" in lbl: r_data.append(f"{v:.2f}%")
                else: r_data.append(f"{v:,.0f}")
            # MTD
            mtd = _sv(row.get("values", {}).get(periode_list[-1], 0))
            if "%" in lbl: r_data.append(f"{mtd:.2f}%")
            else: r_data.append(f"{mtd:,.0f}")
            det_data.append(r_data)
            
        w_main = 160
        w_other = 70
        
        ts_detail = TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A5F')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
            ('ALIGN', (0,0), (0,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,0), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ])
        
        det_table = Table(det_data, colWidths=[w_main] + [w_other]*(cols_count-1))
        det_table.setStyle(ts_detail)
        elements.append(det_table)
        
    def draw_cover_bg(canvas, doc):
        canvas.saveState()
        # Solid blue background matching PPTX
        canvas.setFillColor(colors.HexColor('#1354AE')) # Adjusted blue to match image better
        canvas.rect(0, 0, doc.width + doc.leftMargin + doc.rightMargin, doc.height + doc.topMargin + doc.bottomMargin, fill=1, stroke=0)
        # Inner light blue border
        canvas.setStrokeColor(colors.HexColor('#65C0EB'))
        canvas.setLineWidth(15)
        canvas.rect(20, 20, doc.width + doc.leftMargin + doc.rightMargin - 40, doc.height + doc.topMargin + doc.bottomMargin - 40, fill=0, stroke=1)
        # Orange/White logos are missing so we just add the background for now
        canvas.restoreState()

    doc.build(elements, onFirstPage=draw_cover_bg)

"""

def _sv(val):
    try:
        return float(val) if val else 0
    except:
        return 0

with open('app/services/exporter_visual.py', 'w') as f:
    f.write(content[:start_idx] + new_func + "\n\n" + content[end_idx:])
