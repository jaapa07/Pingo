import sys
sys.setrecursionlimit(10000)
M='''
###################
#........,........#
#.................#
#ffffffffffffGffff#
#fLLLLLLLLLLLLLLLf#
#fLLLpLLLLLLpLLLLf#
#fLLLLLLLpLLLLLLLf#
#.................#
#ffffGfffffffffffp#
#fffLLLLLLLLLfffff#
#fffLLLLpLLLLfffff#
#fffLLLLLLLLLfffff#
#.................#
#fffffffffGfffffff#
#fffffLLLLLfffffff#
#fffffLLLLLfffffff#
#.......+.........#
#......+++........#
########+##########
'''.strip().split('\n')
def campo(y0,y1):
    cel={(x,y) for y in range(y0,y1+1) for x,c in enumerate(M[y]) if c=='L'}
    gate=[(x,y0-1) for x,c in enumerate(M[y0-1]) if c=='G'][0]
    fim=(gate[0],y0)
    ent=[(x,y1) for x in range(19) if (x,y1) in cel and M[y1+1][x] in '.+']
    return cel,fim,ent
def conta(cel,ini,fim,lim=2000):
    n=len(cel);res=[0];um=[None]
    def dfs(p,vis,cam):
        if res[0]>=lim: return
        if len(vis)==n:
            if p==fim:
                res[0]+=1
                if um[0] is None: um[0]=list(cam)
            return
        if p==fim: return
        for dx,dy,c in((0,-1,'n'),(1,0,'l'),(0,1,'s'),(-1,0,'o')):
            q=(p[0]+dx,p[1]+dy)
            if q in cel and q not in vis:
                vis.add(q);cam.append(c);dfs(q,vis,cam);vis.discard(q);cam.pop()
    dfs(ini,{ini},[])
    return res[0],um[0]
for nome,(a,b) in (('F1',(14,15)),('F2',(9,11)),('F3',(4,6))):
    cel,fim,ent=campo(a,b)
    print(nome,len(cel),'células, fim',fim)
    for e in ent:
        n,c=conta(cel,e,fim)
        print('  entrada',e,'soluções',n,''.join(c) if c else '')
