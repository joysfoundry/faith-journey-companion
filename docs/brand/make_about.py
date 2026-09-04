#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont

S = 2
W = 1600 * S
HMAX = 2600 * S
ML, MR, MT = 150 * S, 150 * S, 128 * S
TEXTW = W - ML - MR
CX = W // 2

BG=(246,241,229); BLUE=(30,58,95); INK=(50,47,40)
GOLD=(160,124,58); LINK=(38,74,122)

FD="/System/Library/Fonts/Supplemental/"
def gb(s): return ImageFont.truetype(FD+"Georgia Bold.ttf", int(s*S))
def gr(s): return ImageFont.truetype(FD+"Georgia.ttf", int(s*S))
def gi(s): return ImageFont.truetype(FD+"Georgia Italic.ttf", int(s*S))
def hv(s): return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", int(s*S))

img = Image.new("RGB",(W,HMAX),BG); d = ImageDraw.Draw(img)
y = MT

def wrap(text, font):
    words=text.split(); lines=[]; cur=""
    for w in words:
        t=(cur+" "+w).strip()
        if d.textlength(t,font=font)<=TEXTW: cur=t
        else: lines.append(cur); cur=w
    if cur: lines.append(cur)
    return lines

def para(text, font, fill, leading, after):
    global y
    for ln in wrap(text,font):
        d.text((ML,y),ln,font=font,fill=fill); y+=leading*S
    y+=after*S

def center(text, font, fill, lh, after):
    global y
    d.text((CX,y),text,font=font,fill=fill,anchor="ma"); y+=lh*S+after*S

def tracked_center(text, font, fill, sp, lh, after):
    global y
    sp*=S; ws=[d.textlength(c,font=font) for c in text]
    total=sum(ws)+sp*(len(text)-1); x=CX-total/2
    for c,w in zip(text,ws): d.text((x,y),c,font=font,fill=fill,anchor="la"); x+=w+sp
    y+=lh*S+after*S

def label(text): tracked_center(text.upper(), hv(15), GOLD, 3, 24, 14)

def rule(after):
    global y
    d.line([(CX-120*S,y),(CX+120*S,y)],fill=GOLD,width=1)
    r=6*S; d.polygon([(CX,y-r),(CX+r,y),(CX,y+r),(CX-r,y)],fill=GOLD); y+=after*S

# masthead
center("Oravia", gb(50), BLUE, 64, 8)
tracked_center("YOUR DEVOTIONAL LIFE, GATHERED", hv(14), GOLD, 4, 22, 18)
rule(30)

center("God is weaving something beautiful through your life.", gi(29), BLUE, 42, 18)
para("A daily place where prayer, Scripture, learning, reflection, and lived experience become meaningful woven threads of how I am trying to live my faith, discern God’s will, and live my purpose.",
     gi(21), INK, 31, 34)

label("The vision")
para("Oravia is a personal faith companion for the whole of your faith journey — helping you bring prayer, Scripture, learning, reflection, and lived experience into the rhythms and needs of everyday life. The heart of it is a question: how am I becoming the person God is calling me to be, and how am I living my purpose in alignment with God’s will? It is meant to help you deepen your relationship with God — drawing on Scripture and the tradition of the Church — in a way that feels deeply personal and honors how you were formed. It may support discernment, but it never claims to know God’s will for you; you discern the meaning.",
     gr(20), INK, 30, 26)

label("More than a prayer app")
para("A person’s faith journey is shaped not only by prayer, but by what they read, watch, hear, experience, question, and reflect on. Oravia gathers that faith learning alongside prayer and lived experience — the books and podcasts, the apps you already use, the voices and accounts that inspire you — so that, over time, you can make connections and carry forward what supports discernment and action.",
     gr(20), INK, 30, 26)

label("One place for your journey")
para("Today the pieces of a faith life live in a dozen scattered places, on paper and across apps — a Rosary pamphlet, a hymnal, a Bible, a saint-of-the-day site, a family novena someone texted you. Oravia gathers them into one companion, and keeps your reflection right alongside your prayer.",
     gr(20), INK, 30, 12)
para("It is a hub, not a walled garden. Link out to how you already pray — Hallow, Bible in a Year, a catechism program — and gather the resources and voices that shape your learning, whether digital or on paper.",
     gr(20), INK, 30, 26)

label("Why a beta")
para("This is an early, private beta. It is still taking shape — things will change, and some may break. Your feedback is what shapes it. Thank you for praying with it while it grows.",
     gr(20), INK, 30, 26)

label("Everything stays with you")
para("Your prayers, reflections, and settings live on this device, in this browser — there is no account, no email, and nothing is sent to a server. That also means they do not sync across devices yet, and clearing your browser data (or Start over in Settings) will erase them.",
     gr(20), INK, 30, 30)

rule(28)
center("Keep your seeking for God.", gi(27), GOLD, 40, 26)
tracked_center("TRY THE BETA", hv(13), GOLD, 3, 20, 10)
center("www.myoravia.lovable.app", gr(23), LINK, 32, 0)

# crop to content + balanced bottom margin, then frame
final_h = int(y + 104 * S)
img = img.crop((0, 0, W, final_h))
d = ImageDraw.Draw(img)
d.rectangle([40*S,40*S,W-40*S,final_h-40*S], outline=GOLD, width=int(1.2*S))
img.save("oravia-about.png")
print("saved", img.size)
