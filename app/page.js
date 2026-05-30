"use client";
import { useState, useRef, useEffect } from "react";

const STYLES = [
  { id: "pov",         label: "POV",         emoji: "👁",  desc: "POV: the moment everyone knows" },
  { id: "funny",       label: "Funny",        emoji: "😂",  desc: "Pure comedy, makes people laugh" },
  { id: "relatable",   label: "Relatable",    emoji: "💯",  desc: "Makes people say that's literally me" },
  { id: "flex",        label: "Flex",         emoji: "🔥",  desc: "Classy confidence, never arrogant" },
  { id: "observation", label: "Observation",  emoji: "🎯",  desc: "The truth nobody says out loud" },
];

const EMOTION_COLORS = {
  laugh:       "#25f4ee",
  tag_friend:  "#a855f7",
  screenshot:  "#f59e0b",
  comment:     "#ff3b5c",
  share:       "#4ade80",
};

function TikTokMockup({ photo, concept, canvasRef: externalRef }) {
  const internalRef = useRef();
  const ref = externalRef || internalRef;

  useEffect(() => {
    if (!ref.current || !concept) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const W = 300, H = 534;
    canvas.width = W; canvas.height = H;

    const wrap = (text, maxW, fs) => {
      ctx.font = `bold ${fs}px sans-serif`;
      const words = text.split(" ");
      const lines = []; let cur = "";
      words.forEach(w => {
        const t = cur ? cur + " " + w : w;
        if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; }
        else cur = t;
      });
      if (cur) lines.push(cur);
      return lines;
    };

    const rr = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
      ctx.closePath(); ctx.fill();
    };

    const drawUI = () => {
      const gt = ctx.createLinearGradient(0,0,0,H*0.35);
      gt.addColorStop(0,"rgba(0,0,0,0.8)"); gt.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=gt; ctx.fillRect(0,0,W,H);
      const gb = ctx.createLinearGradient(0,H*0.5,0,H);
      gb.addColorStop(0,"rgba(0,0,0,0)"); gb.addColorStop(1,"rgba(0,0,0,0.92)");
      ctx.fillStyle=gb; ctx.fillRect(0,0,W,H);

      // TOP text
      if (concept.textTop) {
        const tl = wrap(concept.textTop, W-36, 12);
        const th = tl.length*18+14;
        ctx.fillStyle="rgba(0,0,0,0.78)"; rr(12,90,W-24,th,8);
        ctx.fillStyle="#fff"; ctx.font="bold 12px sans-serif"; ctx.textAlign="center";
        tl.forEach((l,i) => ctx.fillText(l, W/2, 90+14+i*18));
      }

      // CENTER text
      if (concept.textPOV) {
        const pl = wrap(concept.textPOV, W-32, 16);
        const ph = pl.length*24+18; const py = H*0.38-ph/2;
        ctx.fillStyle="rgba(0,0,0,0.85)"; rr(14,py,W-28,ph,10);
        ctx.fillStyle="#fff"; ctx.font="bold 16px sans-serif"; ctx.textAlign="center";
        pl.forEach((l,i) => ctx.fillText(l, W/2, py+18+i*24));
      }

      // BOTTOM — BLUE punchline
      if (concept.textBottom) {
        const bl = wrap(concept.textBottom, W-32, 13);
        const bh = bl.length*20+16; const by = H-bh-160;
        ctx.fillStyle="#1d9bf0"; rr(14,by,W-28,bh,10);
        ctx.fillStyle="#fff"; ctx.font="bold 13px sans-serif"; ctx.textAlign="center";
        bl.forEach((l,i) => ctx.fillText(l, W/2, by+16+i*20));
      }

      // Right icons
      [{s:"♥",c:"#ff3b5c",sub:"144K"},{s:"💬",c:"#fff",sub:"2.1K"},{s:"↗",c:"#fff",sub:"Share"}]
        .forEach(({s,c,sub},i) => {
          const ix=W-24, iy=H-190+i*46;
          ctx.fillStyle="rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.arc(ix,iy,16,0,Math.PI*2); ctx.fill();
          ctx.fillStyle=c; ctx.font="14px sans-serif"; ctx.textAlign="center"; ctx.fillText(s,ix,iy+5);
          ctx.fillStyle="rgba(255,255,255,0.6)"; ctx.font="8px sans-serif"; ctx.fillText(sub,ix,iy+20);
        });

      ctx.fillStyle="rgba(255,255,255,0.95)"; ctx.font="bold 11px sans-serif"; ctx.textAlign="left";
      ctx.fillText("@you", 14, H-42);
      if (concept.captionA) {
        ctx.fillStyle="rgba(255,255,255,0.55)"; ctx.font="10px sans-serif";
        ctx.fillText(concept.captionA.slice(0,38)+"...", 14, H-26);
      }
      ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.font="10px sans-serif"; ctx.textAlign="left";
      ctx.fillText("♫ original sound", 14, H-10);
    };

    ctx.clearRect(0,0,W,H); ctx.fillStyle="#111827"; ctx.fillRect(0,0,W,H);
    if (photo) {
      const img = new Image();
      img.onload = () => {
        const sc=Math.max(W/img.width,H/img.height);
        ctx.drawImage(img,(W-img.width*sc)/2,(H-img.height*sc)/2,img.width*sc,img.height*sc);
        drawUI();
      };
      img.src = photo;
    } else {
      const bg=ctx.createLinearGradient(0,0,W,H);
      bg.addColorStop(0,"#1a1a2e"); bg.addColorStop(1,"#0f3460");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="rgba(255,255,255,0.05)"; ctx.beginPath(); ctx.arc(W/2,H*0.33,45,0,Math.PI*2); ctx.fill();
      ctx.fillRect(W/2-33,H*0.33+40,66,85); drawUI();
    }
  }, [photo, concept]);

  return (
    <div style={{ display:"flex", justifyContent:"center" }}>
      <div style={{ background:"#1c1c1e", borderRadius:34, padding:"12px 8px 16px", border:"2.5px solid rgba(255,255,255,0.12)", boxShadow:"0 28px 70px rgba(0,0,0,0.8)" }}>
        <div style={{ width:60, height:5, background:"#333", borderRadius:10, margin:"0 auto 10px" }} />
        <canvas ref={ref} style={{ borderRadius:20, display:"block" }} />
      </div>
    </div>
  );
}

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).catch(()=>{}); setOk(true); setTimeout(()=>setOk(false),2000); }}
      style={{ background:ok?"rgba(74,222,128,0.1)":"rgba(255,255,255,0.06)", border:`0.5px solid ${ok?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.1)"}`, borderRadius:6, padding:"3px 8px", fontSize:10, color:ok?"#4ade80":"rgba(255,255,255,0.45)", cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit" }}>
      {ok?"Copied!":"Copy"}
    </button>
  );
}

function ConceptCard({ c, idx, photo }) {
  const acc = ["#1d9bf0","#a855f7","#25f4ee"][idx%3];
  const canvasRef = useRef();
  const emotionColor = EMOTION_COLORS[c.targetEmotion] || "#1d9bf0";

  const download = () => {
    const canvas = document.createElement("canvas");
    const W = 1080, H = 1920;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");

    const wrap = (text, maxW, fs) => {
      ctx.font = `bold ${fs}px sans-serif`;
      const words = text.split(" "); const lines = []; let cur = "";
      words.forEach(w => {
        const t = cur ? cur+" "+w : w;
        if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur=w; } else cur=t;
      });
      if (cur) lines.push(cur); return lines;
    };

    const rr = (x,y,w,h,r) => {
      ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
      ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
      ctx.closePath(); ctx.fill();
    };

    const drawClean = () => {
      const gb = ctx.createLinearGradient(0,H*0.4,0,H);
      gb.addColorStop(0,"rgba(0,0,0,0)"); gb.addColorStop(1,"rgba(0,0,0,0.88)");
      ctx.fillStyle=gb; ctx.fillRect(0,0,W,H);

      if (c.textTop) {
        const tl=wrap(c.textTop,W-120,52); const th=tl.length*72+56;
        ctx.fillStyle="rgba(0,0,0,0.78)"; rr(40,280,W-80,th,24);
        ctx.fillStyle="#fff"; ctx.font="bold 52px sans-serif"; ctx.textAlign="center";
        tl.forEach((l,i)=>ctx.fillText(l,W/2,280+56+i*72));
      }
      if (c.textPOV) {
        const pl=wrap(c.textPOV,W-120,68); const ph=pl.length*92+64; const py=H*0.38-ph/2;
        ctx.fillStyle="rgba(0,0,0,0.85)"; rr(40,py,W-80,ph,28);
        ctx.fillStyle="#fff"; ctx.font="bold 68px sans-serif"; ctx.textAlign="center";
        pl.forEach((l,i)=>ctx.fillText(l,W/2,py+70+i*92));
      }
      if (c.textBottom) {
        const bl=wrap(c.textBottom,W-120,56); const bh=bl.length*80+60; const by=H-bh-480;
        ctx.fillStyle="#1d9bf0"; rr(40,by,W-80,bh,28);
        ctx.fillStyle="#fff"; ctx.font="bold 56px sans-serif"; ctx.textAlign="center";
        bl.forEach((l,i)=>ctx.fillText(l,W/2,by+64+i*80));
      }
    };

    ctx.fillStyle="#111"; ctx.fillRect(0,0,W,H);
    if (photo) {
      const img=new Image();
      img.onload=()=>{
        const sc=Math.max(W/img.width,H/img.height);
        ctx.drawImage(img,(W-img.width*sc)/2,(H-img.height*sc)/2,img.width*sc,img.height*sc);
        drawClean();
        const link=document.createElement("a"); link.download=`banger-${idx+1}.png`;
        link.href=canvas.toDataURL("image/png"); link.click();
      };
      img.src=photo;
    } else {
      drawClean();
      const link=document.createElement("a"); link.download=`banger-${idx+1}.png`;
      link.href=canvas.toDataURL("image/png"); link.click();
    }
  };

  return (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:24, overflow:"hidden", animation:`fadeUp 0.4s ease ${idx*0.12}s both` }}>

      <div style={{ padding:"16px 18px 12px", borderBottom:"0.5px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:acc }}>Concept {idx+1}</div>
          <div style={{ fontSize:10, background:`${emotionColor}20`, color:emotionColor, padding:"2px 8px", borderRadius:20, border:`0.5px solid ${emotionColor}44`, fontWeight:600 }}>
            {c.targetEmotion?.replace("_"," ") || "viral"}
          </div>
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:"#fff", lineHeight:1.3, marginBottom:10 }}>{c.title}</div>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:1, textTransform:"uppercase" }}>Viral</span>
          {Array.from({length:10},(_,j)=>(
            <span key={j} style={{ display:"inline-block", width:5, height:8, borderRadius:2, background:j<(c.viralScore||8)?acc:"rgba(255,255,255,0.08)" }} />
          ))}
          <span style={{ fontSize:10, color:acc, fontWeight:700 }}>{c.viralScore||8}/10</span>
        </div>
      </div>

      <div style={{ padding:"16px 18px 18px", display:"flex", flexDirection:"column", gap:14 }}>

        {c.whatMakesItWork && (
          <div style={{ background:"rgba(255,255,255,0.03)", border:"0.5px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"rgba(255,255,255,0.25)", marginBottom:4 }}>💡 Why This Works</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", lineHeight:1.55, fontStyle:"italic" }}>{c.whatMakesItWork}</div>
          </div>
        )}

        <TikTokMockup photo={photo} concept={c} canvasRef={canvasRef} />

        <button onClick={download} style={{ width:"100%", padding:"13px 0", background:"rgba(29,155,240,0.1)", border:"0.5px solid rgba(29,155,240,0.3)", borderRadius:12, color:"#1d9bf0", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          ⬇ Download Clean Frame (1080×1920)
        </button>

        <div>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"rgba(255,255,255,0.25)", marginBottom:8 }}>Text On Screen</div>
          {[
            { label:"Top — Setup",        text:c.textTop,    color:"rgba(255,255,255,0.8)", bg:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.08)" },
            { label:"Middle — POV",       text:c.textPOV,    color:"#fff",                  bg:"rgba(255,255,255,0.05)", border:"rgba(255,255,255,0.1)" },
            { label:"Bottom — Punchline", text:c.textBottom, color:"#1d9bf0",               bg:"rgba(29,155,240,0.08)", border:"rgba(29,155,240,0.3)" },
          ].map(({label,text,color,bg,border})=>(
            <div key={label} style={{ background:bg, border:`0.5px solid ${border}`, borderRadius:8, padding:"8px 10px", marginBottom:6 }}>
              <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:3 }}>{label}</span>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:12, color, fontWeight:600 }}>"{text}"</span>
                <CopyBtn text={text||""} />
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"rgba(255,255,255,0.25)", marginBottom:6 }}>Captions</div>
          {[c.captionA, c.captionB].map((cap,ci)=>(
            <div key={ci} style={{ background:"rgba(255,255,255,0.025)", border:"0.5px solid rgba(255,255,255,0.07)", borderRadius:8, padding:"8px 10px", fontSize:11, color:"rgba(255,255,255,0.6)", lineHeight:1.5, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:ci===0?6:0 }}>
              <span style={{flex:1}}>{cap}</span>
              <CopyBtn text={cap||""} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function Home() {
  const [photo,     setPhoto]     = useState(null);
  const [photoMeta, setPhotoMeta] = useState({ base64:null, mime:null });
  const [situation, setSituation] = useState("");
  const [style,     setStyle]     = useState("pov");
  const [concepts,  setConcepts]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [drag,      setDrag]      = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhoto(e.target.result);
      setPhotoMeta({ base64: e.target.result.split(",")[1], mime: e.target.result.split(";")[0].split(":")[1] });
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!photoMeta.base64) { setError("Upload a photo first."); return; }
    setLoading(true); setError(null); setConcepts([]);
    try {
      const res = await fetch("/api/concepts", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ photoBase64:photoMeta.base64, photoMime:photoMeta.mime, situation, style })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setConcepts(data.concepts);
    } catch(err) {
      setError("Generation failed — " + (err.message||"try again"));
    } finally {
      setLoading(false);
    }
  };

  const selectedStyle = STYLES.find(s => s.id === style);

  return (
    <div style={{ background:"#0a0a0a", minHeight:"100vh", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#e8e8e8", paddingBottom:60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        * { box-sizing:border-box; }
        input::placeholder { color:rgba(255,255,255,0.25); }
      `}</style>

      <div style={{ padding:"20px 28px", borderBottom:"0.5px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>
          BANGER<span style={{color:"#1d9bf0"}}>.</span>AI
        </div>
        <div style={{ fontSize:10, background:"rgba(29,155,240,0.12)", color:"#1d9bf0", padding:"3px 10px", borderRadius:20, border:"0.5px solid rgba(29,155,240,0.3)", letterSpacing:0.5, textTransform:"uppercase" }}>
          Viral Content Engine
        </div>
      </div>

      <div style={{ padding:"24px 28px", maxWidth:980 }}>

        <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:10 }}>
          Step 1 — Upload Any Photo
        </div>

        {photo ? (
          <div style={{ position:"relative", marginBottom:16 }}>
            <img src={photo} alt="Uploaded" style={{ width:"100%", maxHeight:220, objectFit:"cover", borderRadius:14, display:"block" }} />
            <div style={{ position:"absolute", top:8, left:8, background:"rgba(0,0,0,0.8)", fontSize:10, color:"#4ade80", padding:"3px 10px", borderRadius:20, fontWeight:600 }}>Ready ✓</div>
            <button onClick={()=>{setPhoto(null);setPhotoMeta({base64:null,mime:null});setConcepts([]);}} style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.8)", border:"none", color:"#fff", width:28, height:28, borderRadius:"50%", cursor:"pointer", fontSize:16 }}>×</button>
          </div>
        ) : (
          <div onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files?.[0]);}}
            onClick={()=>fileRef.current?.click()}
            style={{ border:`1.5px dashed ${drag?"#1d9bf0":"rgba(255,255,255,0.15)"}`, borderRadius:16, padding:"36px 20px", textAlign:"center", cursor:"pointer", background:drag?"rgba(29,155,240,0.05)":"rgba(255,255,255,0.02)", marginBottom:16 }}>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files?.[0])} />
            <div style={{fontSize:36, marginBottom:12}}>📸</div>
            <div style={{fontSize:15, color:"rgba(255,255,255,0.8)", marginBottom:6, fontWeight:600}}>Drop any photo here</div>
            <div style={{fontSize:12, color:"rgba(255,255,255,0.35)"}}>Your face, nature, coffee, football, anything — AI finds the story in it</div>
          </div>
        )}

        <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:10 }}>
          Step 2 — Choose Your Style
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:8, marginBottom:20 }}>
          {STYLES.map(s=>(
            <button key={s.id} onClick={()=>setStyle(s.id)} style={{
              padding:"12px 8px", borderRadius:14, cursor:"pointer", fontFamily:"inherit",
              background: style===s.id?"rgba(29,155,240,0.12)":"rgba(255,255,255,0.03)",
              border:`0.5px solid ${style===s.id?"rgba(29,155,240,0.4)":"rgba(255,255,255,0.08)"}`,
              display:"flex", flexDirection:"column", alignItems:"center", gap:4, transition:"all 0.15s"
            }}>
              <span style={{fontSize:20}}>{s.emoji}</span>
              <span style={{ fontSize:11, fontWeight:700, color: style===s.id?"#1d9bf0":"rgba(255,255,255,0.6)" }}>{s.label}</span>
            </button>
          ))}
        </div>

        {selectedStyle && (
          <div style={{ background:"rgba(29,155,240,0.06)", border:"0.5px solid rgba(29,155,240,0.2)", borderRadius:10, padding:"10px 14px", marginBottom:20, fontSize:12, color:"rgba(29,155,240,0.8)" }}>
            {selectedStyle.emoji} {selectedStyle.desc}
          </div>
        )}

        <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:10 }}>
          Step 3 — Extra Context (Optional)
        </div>
        <input value={situation} onChange={e=>setSituation(e.target.value)}
          placeholder="Any extra context... (optional)"
          style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 14px", fontSize:13, color:"#e8e8e8", fontFamily:"inherit", outline:"none", marginBottom:24 }} />

        {error && <div style={{ background:"rgba(255,59,92,0.08)", border:"0.5px solid rgba(255,59,92,0.25)", borderRadius:12, padding:"12px 16px", fontSize:12, color:"rgba(255,180,190,0.9)", marginBottom:16 }}>{error}</div>}

        <button onClick={generate} disabled={loading} style={{ width:"100%", padding:16, background:loading?"rgba(29,155,240,0.3)":"#1d9bf0", border:"none", borderRadius:14, color:"#fff", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {loading
            ? <><span style={{ width:18, height:18, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite", display:"inline-block" }} /> Reading your photo...</>
            : <>✦ Generate 3 {selectedStyle?.label} Bangers</>
          }
        </button>

        {concepts.length > 0 && (
          <>
            <div style={{ borderTop:"0.5px solid rgba(255,255,255,0.07)", margin:"32px 0" }} />
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:"#fff", marginBottom:6 }}>Your Bangers</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginBottom:20 }}>Download any frame — clean 1080×1920, ready to upload directly to TikTok</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20 }}>
              {concepts.map((c,i) => <ConceptCard key={i} c={c} idx={i} photo={photo} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
