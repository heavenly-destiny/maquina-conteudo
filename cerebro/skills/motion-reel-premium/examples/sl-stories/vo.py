"""Pick takes, trim silence, lay out VO per creative; writes assets/vo/c{n}.wav + build/c{n}-words.json"""
import json, subprocess, numpy as np
SR=48000; V="assets/vo/"
W=json.load(open(V+"words.json")); W.update(json.load(open("assets/vo45/words.json"))); W.update(json.load(open("assets/vo6/words.json")))
PLAN={1:[("c1l1b",.30),("c1l2a",.35),("c1l3a",.45),("c1l4a",.30),("c1l5b",.30)],
      2:[("c2l1a",.30),("c2l2a",.35),("c2l3a",2.6),("c2l4a",.30),("c2l5a",.30)],
      4:[("c4l1a",.25),("c4l2a",.55),("c4l3a",.45),("c4l4a",.40),("c4l5a",.40),("c4l6a",1.6)],
      5:[("c5l1b",.30),("c5l2a",.45),("c5l3a",.50),("c5l4a",.45),("c5l5b",.80),("c5l6a",.70)],
      6:[("c6l1b",2.4,1.15,"vo6/"),("c6l2b",0.75,1.15,"vo6/"),("c6l3a",2.1,1.15,"vo6/"),("c6l4a",0.35,1.15,"vo6/")],
      3:[("c3l1a",.30),("c3l2a",.55),("c3l3a",.60),("c3l4a",.30),("c3l5a",.35),("c3l6a",.45)]}
TAIL=2.4
def load(f,tempo=1.0):
    b=subprocess.run(["ffmpeg","-v","error","-i",f]+(["-af",f"atempo={tempo}"] if tempo!=1.0 else [])+["-f","f32le","-ac","1","-ar",str(SR),"-"],capture_output=True).stdout
    return np.frombuffer(b,np.float32).copy()
def bounds(x):
    h=int(.01*SR); e=np.sqrt(np.mean(x[:len(x)//h*h].reshape(-1,h)**2,1)); on=np.where(20*np.log10(e+1e-9)>-40)[0]
    return max(0,on[0]*h-int(.04*SR)), min(len(x),(on[-1]+1)*h+int(.12*SR))
for c,plan in [(k,v) for k,v in PLAN.items() if str(k) in (__import__('sys').argv[1:] or [str(k)])]:
    t=0; out=[]; lines=[]
    for e in plan:
        name,gap=e[0],e[1]; tempo=e[2] if len(e)>2 else 1.0; sub=e[3] if len(e)>3 else ""
        x=load("assets/"+(sub or "vo/")+name+".mp3",tempo); a,b=bounds(x); x=x[a:b]
        t+=gap; s=t; lines.append({"take":name,"start":round(s,3),"dur":round(len(x)/SR,3),
            "words":[[w.strip(),round(s+ws/tempo-a/SR,3),round(s+we/tempo-a/SR,3)] for w,ws,we in W[name+".mp3"]]})
        out.append((s,x)); t+=len(x)/SR
    total=round(t+TAIL,2); buf=np.zeros(int(total*SR),np.float32)
    for s,x in out: i=int(s*SR); buf[i:i+len(x)]+=x
    subprocess.run(["ffmpeg","-y","-v","error","-f","f32le","-ar",str(SR),"-ac","1","-i","-",V+f"c{c}.wav"],input=buf.tobytes(),check=True)
    json.dump({"total":total,"lines":lines},open(f"build/c{c}-vo.json","w"),ensure_ascii=False,indent=1)
    print(c,total,[ (l["take"],l["start"],round(l["start"]+l["dur"],2)) for l in lines])
