import sys
from collections import deque
M=open(sys.argv[1]).read().split('\n')
M=[r for r in M if r]
s=tuple(map(int,sys.argv[2].split(',')))
def bfs(s):
    d={s:0};q=deque([s])
    while q:
        x,y=q.popleft()
        for dx,dy in((0,1),(0,-1),(1,0),(-1,0)):
            n=(x+dx,y+dy)
            if 0<=n[1]<len(M) and M[n[1]][n[0]] in '.,+' and n not in d: d[n]=d[(x,y)]+1;q.append(n)
    return d
d=bfs(s)
print('    '+''.join(str(i%10) for i in range(len(M[0]))))
for y,r in enumerate(M):
    print('%2d  '%y+''.join((chr(48+d[(x,y)]%10) if (x,y) in d else c) for x,c in enumerate(r)), len(r))
