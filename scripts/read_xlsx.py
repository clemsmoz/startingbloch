from pathlib import Path
import sys
p = Path('grapheal.xlsx')
if not p.exists():
    print('Fichier non trouvé:', p)
    sys.exit(1)
print('Fichier trouvé:', p, 'taille:', p.stat().st_size, 'octets')
try:
    import pandas as pd
except Exception:
    print('pandas non installé, installation en cours...')
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pandas', 'openpyxl'])
    import pandas as pd
try:
    # Try to use openpyxl for xlsx files. If openpyxl is missing, install it.
    try:
        import openpyxl  # type: ignore
    except Exception:
        print('openpyxl non installé, installation en cours...')
        import subprocess
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'openpyxl'])
        import openpyxl  # type: ignore

    xl = pd.ExcelFile(p, engine='openpyxl')
    print('Feuilles:', xl.sheet_names)
    for sheet in xl.sheet_names:
        print('\n--- Feuille:', sheet, '---')
        try:
            df = xl.parse(sheet_name=sheet, nrows=5)
            if df.empty:
                print('(feuille vide)')
            else:
                print(df.to_string(index=False))
        except Exception as e:
            print('Erreur lecture feuille', sheet, ':', e)
except Exception as e:
    print('Erreur ouverture Excel:', e)
