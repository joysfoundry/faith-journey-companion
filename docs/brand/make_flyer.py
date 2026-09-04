#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont

S = 2  # supersample scale
W, H = 1080 * S, 1920 * S
CX = W // 2

# palette
IVORY=(244,236,216); IVORY_SOFT=(216,204,176); MUTE=(159,176,201)
GOLD=(198,161,91); GOLD_DIM=(150,124,74); FAINT=(125,139,163)
BG_TOP=(28,58,104); BG_BOT=(15,36,68)

FD="/System/Library/Fonts/Supplemental/"
def gb(sz): return ImageFont.truetype(FD+"Georgia Bold.ttf", int(sz*S))
def gr(sz): return ImageFont.truetype(FD+"Georgia.ttf", int(sz*S))
def gi(sz): return ImageFont.truetype(FD+"Georgia Italic.ttf", int(sz*S))
def hv(sz): return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", int(sz*S))

img = Image.new("RGB",(W,H),BG_BOT)
d = ImageDraw.Draw(img)

# vertical gradient background
for y in range(H):
    t = y / H
    r = int(BG_TOP[0]+(BG_BOT[0]-BG_TOP[0])*t)
    g = int(BG_TOP[1]+(BG_BOT[1]-BG_TOP[1])*t)
    b = int(BG_TOP[2]+(BG_BOT[2]-BG_TOP[2])*t)
    d.line([(0,y),(W,y)], fill=(r,g,b))

# inner border
d.rectangle([34*S,34*S,W-34*S,H-34*S], outline=GOLD_DIM, width=int(1.5*S))

def center(text,y,font,fill):
    d.text((CX,y*S),text,font=font,fill=fill,anchor="mm")

def tracked(text,y,font,fill,sp):
    sp*=S
    widths=[d.textlength(c,font=font) for c in text]
    total=sum(widths)+sp*(len(text)-1)
    x=CX-total/2
    for c,w in zip(text,widths):
        d.text((x,y*S),c,font=font,fill=fill,anchor="lm"); x+=w+sp

def divider(y):
    d.line([(430*S,y*S),(650*S,y*S)],fill=GOLD_DIM,width=int(1*S))
    r=8*S
    d.polygon([(CX,y*S-r),(CX+r,y*S),(CX,y*S+r),(CX-r,y*S)],fill=GOLD)

# ---- mark: guiding flame + open O + thread ----
cx,cy,rr=540*S,200*S,56*S
# flame (teardrop)
d.polygon([(cx,94*S),(cx+13*S,120*S),(cx+20*S,137*S),(cx+11*S,147*S),(cx,150*S),
           (cx-11*S,147*S),(cx-20*S,137*S),(cx-13*S,120*S)],fill=GOLD)
# open ring (gap at top)
d.arc([cx-rr,cy-rr,cx+rr,cy+rr],start=290,end=610,fill=GOLD,width=int(4*S))
# center dot + tail
d.ellipse([cx-5*S,cy-5*S,cx+5*S,cy+5*S],fill=GOLD)
d.line([(cx,cy+rr),(cx,300*S)],fill=GOLD,width=int(2.4*S))

# ---- identity ----
center("Oravia",378,gb(128),IVORY)
center("or  ·  AH  ·  vee  ·  ah",452,gi(26),MUTE)
tracked("ORA, TO PRAY   ·   VIA, THE WAY",500,hv(21),GOLD,3)
center("Your devotional life, gathered.",576,gi(50),IVORY)

divider(646)

# ---- blessing ----
center("God is weaving something beautiful",732,gi(52),IVORY)
center("through your life.",800,gi(52),GOLD)

# ---- the why ----
center("A daily place where prayer, Scripture, learning, and lived",896,gi(29),IVORY_SOFT)
center("experience become meaningful woven threads of how",940,gi(29),IVORY_SOFT)
center("I am trying to live my faith and discern God’s will.",984,gi(29),IVORY_SOFT)

# ---- what it gathers ----
tracked("MORE THAN A PRAYER APP",1074,hv(21),GOLD,4)
center("Prayers",1140,gr(37),IVORY)
center("Customized devotions",1196,gr(37),IVORY)
center("Digital & physical resources",1252,gr(37),IVORY)
center("Voices",1308,gr(37),IVORY)
center("people, podcasts, the accounts you follow",1348,hv(22),MUTE)
center("Links out to how you already pray — Hallow, Bible in a Year.",1406,gi(26),IVORY_SOFT)

divider(1472)

# ---- sign-off ----
center("Keep your seeking for God.",1554,gi(50),GOLD)

# ---- beta / local note ----
center("A private beta — no account yet.",1648,hv(24),MUTE)
center("Everything you add stays on your device, in this browser —",1686,hv(24),MUTE)
center("it doesn’t sync across devices, and nothing goes to a server.",1724,hv(24),MUTE)

# ---- footer ----
tracked("ORAVIA    ·    A WORK IN PROGRESS",1806,hv(17),FAINT,4)

img.save("oravia-flyer.png")
print("saved", img.size)
