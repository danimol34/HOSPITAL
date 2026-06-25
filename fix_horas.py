import docx

doc = docx.Document('public/FORMATO DE PERMISOS - REPOSOS.docx')

# Remove {horas} from all tables
for table in doc.tables:
    for row in table.rows:
        for cell in row.cells:
            if '{horas}' in cell.text:
                cell.text = cell.text.replace('{horas}', '')

doc.save('public/FORMATO DE PERMISOS - REPOSOS.docx')
print("Eliminada la etiqueta {horas} del documento")
