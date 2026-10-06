# Bangun ulang games/*.html dari games-src/ (kecuali susun-kabel-utp.html yang berdiri sendiri). Jalankan dari root repo.
import re, os
os.makedirs('games', exist_ok=True)
css=open('games-src/common.css').read()
tcss=open('games-src/tracer.css').read()
cjs=open('games-src/common.js').read()
games=[('osi','Sortir OSI','sortir-osi.html','osi.js',''),
       ('pengadaan','Urutan Pengadaan','urutan-pengadaan.html','pengadaan.js',''),
       ('lifecycle','Sortir Lifecycle','sortir-lifecycle.html','lifecycle.js',''),
       ('detektif','Detektif Jaringan','detektif-jaringan.html','detektif.js',''),
       ('tracer','Mini Packet Tracer','mini-packet-tracer.html','tracer.js',tcss)]
for key,title,fn,js,extra in games:
    g=open('games-src/'+js).read()
    html=f'''<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
<style>
{css}
{extra}
</style>
</head>
<body>
<div class="app" id="view"></div>
<script>
{cjs}
{g}
</script>
</body>
</html>
'''
    open('games/'+fn,'w').write(html)
    m=re.search(r'<script>(.*)</script>',html,re.S).group(1)
    print(fn,len(html))
