import docx

doc = docx.Document('public/FORMATO DE PERMISOS - REPOSOS.docx')

t0 = doc.tables[0]
t0.rows[0].cells[11].text = '{d_gen}'
t0.rows[0].cells[12].text = '{m_gen}'
t0.rows[0].cells[13].text = '{a_gen}'

doc.save('public/FORMATO DE PERMISOS - REPOSOS.docx')
print("Agregadas las fechas de generación")
