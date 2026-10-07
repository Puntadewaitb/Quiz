"""Gabungkan 6 game jadi satu halaman: index.html. Pakai: python3 tools/build.py [SHEET_URL]"""
import json, sys, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
files = {'kabel':'susun-kabel-utp','osi':'sortir-osi','detektif':'detektif-jaringan',
         'tracer':'mini-packet-tracer','pengadaan':'urutan-pengadaan','lifecycle':'sortir-lifecycle'}
out = open(os.path.join(root,'tools/shell.html'), encoding='utf-8').read()
for k, f in files.items():
    h = open(os.path.join(root,'games',f+'.html'), encoding='utf-8').read()
    out = out.replace('__G_%s__' % k, json.dumps(h, ensure_ascii=False).replace('</', '<\\/'))
url = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('SHEET_URL', '')
out = out.replace('__SHEET_URL__', url)
open(os.path.join(root,'index.html'),'w',encoding='utf-8').write(out)
print('index.html', len(out))
# halaman admin: /admin/ (tanpa menaruh token apa pun di file; token dicek di server)
adm = open(os.path.join(root,'tools/admin.html'), encoding='utf-8').read().replace('__SHEET_URL__', url)
os.makedirs(os.path.join(root,'admin'), exist_ok=True)
open(os.path.join(root,'admin','index.html'),'w',encoding='utf-8').write(adm)
print('admin/index.html', len(adm))
