from pathlib import Path
p = Path('grapheal.xlsx')
print('Path:', p)
print('Exists:', p.exists())
if not p.exists():
    raise SystemExit(1)
print('Size:', p.stat().st_size)
with p.open('rb') as f:
    head = f.read(16)
print('First 16 bytes:', head.hex())
import zipfile
print('zipfile.is_zipfile:', zipfile.is_zipfile(p))
if zipfile.is_zipfile(p):
    with zipfile.ZipFile(p) as z:
        print('ZIP contents (first 20 entries):')
        for i, name in enumerate(z.namelist()):
            print(' ', name)
            if i>=19:
                break
else:
    # Try to read as old xls with xlrd if available
    try:
        import xlrd
        print('xlrd available, trying to open as old xls...')
        wb = xlrd.open_workbook(str(p))
        print('Sheets:', wb.sheet_names())
    except Exception as e:
        print('xlrd open failed or not installed:', e)
        # Try to detect by magic
        magic = head[:4]
        print('magic:', magic)
        # Common magics
        magics = {
            b'%PDF': 'PDF',
            b'PK\x03\x04': 'ZIP (possibly xlsx)',
            b'\xd0\xcf\x11\xe0': 'OLE Compound File (old .doc/.xls/.ppt)',
            b'\x50\x4b\x05\x06': 'ZIP empty archive',
        }
        print('guessed type:', magics.get(magic))
