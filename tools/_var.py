# uso: python3 tools/_var.py <arquivo ginásio> <id líder> <passo> 'variante1' 'variante2' ...   (cada variante = linhas da equipe separadas por |)
import subprocess, sys
p, lid, passo = sys.argv[1], sys.argv[2], sys.argv[3]
base = open(p).read()
k = base.index(f"id: '{lid}'"); i = base.index("equipe: [", k); j = base.index("\n    ],", i) if "\n    ],\n" in base[i:i+3000] else base.index("],", i)
for n, v in enumerate([a for a in sys.argv[4:] if a != '--manter']):
    corpo = "equipe: [\n" + "".join("      " + l.strip() + ",\n" for l in v.split('|')) + "   "
    novo = base[:i] + corpo.rstrip(' ') + base[j+1:] if base[j] == '\n' else base[:i] + corpo + base[j:]
    open(p, 'w').write(novo)
    r = subprocess.run(['npx', 'tsx', 'tools/_lider.ts', f'{lid}:{passo}'], capture_output=True, text=True)
    print(n, (r.stdout.strip() or r.stderr[-400:]))
if '--manter' not in sys.argv: open(p, 'w').write(base)
