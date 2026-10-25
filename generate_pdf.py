from reportlab.pdfgen import canvas

def create_corrupted_pdf(filename):
    c = canvas.Canvas(filename)
    c.setFont("Helvetica", 12)
    
    text = "CONFIDENTIAL: EXECUTIVE SUMMARY\n\n"
    text += "The quarterly earnings for Q4 are extremely sensitive. Do not share.\n"
    text += "Total Revenue: $45.2 Million\n"
    text += "Net Profit: [CORRUPTED_DATA_BLOCK_0xFA92] Million\n"
    text += "Target Acquisition Code: [FRAGMENT_MISSING_ERROR]\n"
    text += "\n\nEnd of Document."
    
    y = 800
    for line in text.split('\n'):
        c.drawString(50, y, line)
        y -= 20
        
    c.save()
    print(f"Generated {filename}")

if __name__ == "__main__":
    create_corrupted_pdf("corrupted_executive_summary.pdf")
