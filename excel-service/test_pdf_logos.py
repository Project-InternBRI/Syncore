from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
danantara_path = os.path.join(base_dir, 'app', 'assets', 'danantara-logo.png')
bri_path = os.path.join(base_dir, 'app', 'assets', 'Logo_BRI.png')

def test():
    doc = SimpleDocTemplate("test_logos.pdf", pagesize=landscape(A4), rightMargin=20, leftMargin=20, topMargin=30, bottomMargin=30)
    elements = []
    
    def draw_cover_bg(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(colors.HexColor('#1354AE'))
        canvas.rect(0, 0, doc.width + doc.leftMargin + doc.rightMargin, doc.height + doc.topMargin + doc.bottomMargin, fill=1, stroke=0)
        canvas.setStrokeColor(colors.HexColor('#65C0EB'))
        canvas.setLineWidth(15)
        canvas.rect(20, 20, doc.width + doc.leftMargin + doc.rightMargin - 40, doc.height + doc.topMargin + doc.bottomMargin - 40, fill=0, stroke=1)
        
        if os.path.exists(danantara_path):
            canvas.drawImage(danantara_path, 40, doc.height + doc.topMargin + doc.bottomMargin - 120, width=180, height=80, preserveAspectRatio=True, mask='auto')
        if os.path.exists(bri_path):
            canvas.drawImage(bri_path, doc.width + doc.leftMargin + doc.rightMargin - 220, doc.height + doc.topMargin + doc.bottomMargin - 120, width=180, height=80, preserveAspectRatio=True, mask='auto')
            
        canvas.restoreState()

    styles = getSampleStyleSheet()
    elements.append(Paragraph("Hello World", styles['Normal']))
    doc.build(elements, onFirstPage=draw_cover_bg)

test()
