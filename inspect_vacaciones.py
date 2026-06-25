import docx

doc = docx.Document('public/SOLICITUD DE VACACIONES.docx')

print("--- Document: public/SOLICITUD DE VACACIONES.docx ---")
for i, table in enumerate(doc.tables):
    print(f"\nTable {i}:")
    for r_idx, row in enumerate(table.rows):
        row_texts = []
        for c_idx, cell in enumerate(row.cells):
            text = cell.text.replace('\n', ' ').strip()
            row_texts.append(f"[{c_idx}] {text}")
        print(f"  Row {r_idx}: " + " | ".join(row_texts))
