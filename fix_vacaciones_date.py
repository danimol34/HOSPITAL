import docx

doc = docx.Document('public/SOLICITUD DE VACACIONES.docx')

t0 = doc.tables[0]
t0.rows[1].cells[0].text = '{d_gen}'
t0.rows[1].cells[1].text = '{m_gen}'
t0.rows[1].cells[2].text = '{a_gen}'

doc.save('public/SOLICITUD DE VACACIONES.docx')
print("Corregido el documento de vacaciones con d_gen, m_gen, a_gen")
