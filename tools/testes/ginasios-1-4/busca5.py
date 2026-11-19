import sys, itertools
sys.setrecursionlimit(10000)
def conta(cel,ini,fim,lim=50):
    n=len(cel);res=[0];um=[None]
    def dfs(p,vis,cam):
        if res[0]>=lim: return
        if len(vis)==n:
            if p==fim:
                res[0]+=1
                if um[0] is None: um[0]=''.join(cam)
            return
        if p==fim: return
        # poda: célula não visitada sem vizinho livre (fora a atual) → beco
        for dx,dy,c in((0,-1,'n'),(1,0,'l'),(0,1,'s'),(-1,0,'o')):
            q=(p[0]+dx,p[1]+dy)
            if q in cel and q not in vis:
                vis.add(q);cam.append(c);dfs(q,vis,cam);vis.discard(q);cam.pop()
    dfs(ini,{ini},[])
    return res[0],um[0]
def testa(x0,x1,y0,y1,nobs):
    todas=[(x,y) for y in range(y0,y1+1) for x in range(x0,x1+1)]
    out=[]
    for obs in itertools.combinations(todas,nobs):
        cel=set(todas)-set(obs)
        for gx in range(x0,x1+1):
            fim=(gx,y0)
            if fim not in cel: continue
            ents=[(x,y1) for x in range(x0,x1+1) if (x,y1) in cel]
            r=[(e,)+conta(cel,e,fim) for e in ents]
            bons=[t for t in r if t[1]>0]
            if 1<=len(bons)<=2 and all(t[1]<=4 for t in bons):
                out.append((obs,gx,[(t[0],t[1],t[2]) for t in bons]))
    return out
if sys.argv[1]=='2':
    o=testa(5,11,9,11,1)
    for t in o[:400]: print(t)
    print(len(o))
else:
    o=testa(4,12,4,6,int(sys.argv[2]))
    for t in o[::max(1,len(o)//40)]: print(t)
    print(len(o))
