"use client";
import { useState, useRef, useEffect } from "react";

const VIBES = [
  { id: "smart-twist",      label: "Smart Twist" },
  { id: "stereotype-flip",  label: "Stereotype Flip" },
  { id: "confident-flex",   label: "Confident Flex" },
  { id: "deadpan",          label: "Deadpan" },
  { id: "self-aware",       label: "Self-Aware" },
];

const SCENARIOS = [
  "at a coffee shop", "at the gym", "in a bookstore",
  "walking in the city", "at a restaurant", "at a house party",
];

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
      const lines = [];
      let cur = "";
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
      ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
      ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r);
      ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r,y+h);
      ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x,y+r);
      ctx.quadraticCurveTo(x,y,x+r,y);
      ctx.closePath();
      ctx.fill();
    };

    const drawUI = () => {
      // top gradient
      const gt = ctx.createLinearGradient(0,0,0,H*0.35);
      gt.addColorStop(0,"rgba(0,0,0,0.8)");
      gt.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=gt; ctx.fillRect(0,0,W,H);

      // bottom gradient
      const gb = ctx.createLinearGradient(0,H*0.5,0,H);
      gb.addColorStop(0,"rgba(0,0,0,0)");
      gb.addColorStop(1,"rgba(0,0,0,0.92)");
      ctx.fillStyle=gb; ctx.fillRect(0,0,W,H);

      // TikTok nav
      ctx.fillStyle="rgba(255,255,255,0.6)";
      ctx.font="bold 11px sans-serif";
      ctx.textAlign="center";
      ctx.fillText("Following   For You", W/2, 22);
      ctx.strokeStyle="#fff"; ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(W/2+14,27); ctx.lineTo(W/2+46,27);
      ctx.stroke();

      // TOP text
      if (concept.textTop) {
        const tl = wrap(concept.textTop, W-36, 12);
        const th = tl.length*18+14;
        ctx.fillStyle="rgba(0,0,0,0.78)";
        rr(12,32,W-24,th,8);
        ctx.fillStyle="#fff";
        ctx.font="bold 12px sans-serif";
        ctx.textAlign="center";
        tl.forEach((l,i) => ctx.fillText(l, W/2, 32+14+i*18));
      }

      // CENTER POV text
      if (concept.textPOV) {
        const pl = wrap(concept.textPOV, W-32, 16);
        const ph = pl.length*24+18;
        const py = H*0.38 - ph/2;
        ctx.fillStyle="rgba(0,0,0,0.85)";
        rr(14,py,W-28,ph,10);
        ctx.fillStyle="#ffffff";
        ctx.font="bold 16px sans-serif";
        ctx.textAlign="center";
        pl.forEach((l,i) => ctx.fillText(l, W/2, py+18+i*24));
      }

      // BOTTOM punchline — red
      if (concept.textBottom) {
        const bl = wrap(concept.textBottom, W-32, 13);
        const bh = bl.length*20+16;
        const by = H - bh - 75;
        ctx.fillStyle="#ff3b5c";
        rr(14,by,W-28,bh,10);
        ctx.fillStyle="#fff";
        ctx.font="bold 13px sans-serif";
        ctx.textAlign="center";
        bl.forEach((l,i) => ctx.fillText(l, W/2, by+16+i*20));
      }

      // Right side icons
      [
        {s:"♥",c:"#ff3b5c",sub:"144K"},
        {s:"💬",c:"#fff",sub:"2.1K"},
        {s:"↗",c:"#fff",sub:"Share"},
      ].forEach(({s,c,sub},i) => {
        const ix = W-24, iy = H-190+i*46;
        ctx.fillStyle="rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.arc(ix,iy,16,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle=c;
        ctx.font="14px sans-serif";
        ctx.textAlign="center";
        ctx.fillText(s, ix, iy+5);
        ctx.fillStyle="rgba(255,255,255,0.6)";
        ctx.font="8px sans-serif";
        ctx.fillText(sub, ix, iy+20);
      });

      // Bottom username + caption
      ctx.fillStyle="rgba(255,255,255,0.95)";
      ctx.font="bold 11px sans-serif";
      ctx.textAlign="left";
      ctx.fillText("@you", 14, H-42);
      if (concept.captionA) {
        ctx.fillStyle="rgba(255,255,255,0.55)";
        ctx.font="10px sans-serif";
        const shortCap = concept.captionA.slice(0,38)+"...";
        ctx.fillText(shortCap, 14, H-26);
      }

      // Music note
      ctx.fillStyle="rgba(255,255,255,0.5)";
      ctx.font="10px sans-serif";
      ctx.textAlign="left";
      ctx.fillText("♫ original sound", 14, H-10);
    };

    // Draw background
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle="#111827";
    ctx.fillRect(0,0,W,H);

    if (photo) {
      const img = new Image();
      img.onload = () => {
        const sc = Math.max(W/img.width, H/img.height);
        const sw = img.width*sc, sh = img.height*sc;
        ctx.drawImage(img,(W-sw)/2,(H-sh)/2,sw,sh);
        drawUI();
      };
      img.src = photo;
    } else {
      const bg = ctx.createLinearGradient(0,0,W,H);
      bg.addColorStop(0,"#1a1a2e");
      bg.addColorStop(1,"#0f3460");
      ctx.fillStyle=bg;
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle="rgba(255,255,255,0.05)";
      ctx.beginPath();
      ctx.arc(W/2,H*0.33,45,0,Math.PI*2);
      ctx.fill();
      ctx.fillRect(W/2-33,H*0.33+40,66,85);
      drawUI();
    }
  }, [photo, concept]);

  return (
    <div style={{ display:"flex", justifyContent:"center" }}>
      <div style={{
        background:"#1c1c1e", borderRadius:34, padding:"12px 8px 16px",
        border:"2.5px solid rgba(255,255,255,0.12)",
        boxShadow:"0 28px 70px rgba(0,0,0,0.8)"
      }}>
        <div style={{ width:60, height:5, background:"#333", borderRadius:10, margin:"0 auto 10px" }} />
        <canvas ref={ref} style={{ borderRadius:20, display:"block" }} />
      </div>
    </div>
  );
}

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={() => {
      navigator.clipboard.writeText(text).catch(()=>{});
      setOk(true);
      setTimeout(()=>setOk(false),2000);
    }} style={{
      background: ok?"rgba(74,222,128,0.1)":"rgba(255,255,255,0.06)",
      border:`0.5px solid ${ok?"rgba(74,222,128,0.3)":"rgba(255,255,255,0.1)"}`,
      borderRadius:6, padding:"3px 8px", fontSize:10,
      color: ok?"#4ade80":"rgba(255,255,255,0.45)",
      cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit"
    }}>{ok?"Copied!":"Copy"}</button>
  );
}

function ConceptCard({ c, idx, photo }) {
  const acc = ["#ff3b5c","#25f4ee","#a855f7"][idx%3];
  const canvasRef = useRef();

  const download = () => {
    // Create a clean canvas — no TikTok chrome, just photo + text overlays
    const canvas = document.createElement("canvas");
    const W = 1080, H = 1920; // Full TikTok resolution 9:16
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const wrap = (text, maxW, fs) => {
      ctx.font = `bold ${fs}px sans-serif`;
      const words = text.split(" ");
      const lines = [];
      let cur = "";
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
      ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
      ctx.quadraticCurveTo(x+w,y,x+w,y+r);
      ctx.lineTo(x+w,y+h-r);
      ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
      ctx.lineTo(x+r,y+h);
      ctx.quadraticCurveTo(x,y+h,x,y+h-r);
      ctx.lineTo(x,y+r);
      ctx.quadraticCurveTo(x,y,x+r,y);
      ctx.closePath();
      ctx.fill();
    };

    const drawClean = () => {
      // bottom gradient only
      const gb = ctx.createLinearGradient(0, H*0.5, 0, H);
      gb.addColorStop(0, "rgba(0,0,0,0)");
      gb.addColorStop(1, "rgba(0,0,0,0.85)");
      ctx.fillStyle = gb;
      ctx.fillRect(0, 0, W, H);

      // TOP text
      if (c.textTop) {
        const tl = wrap(c.textTop, W-120, 48);
        const th = tl.length*68+56;
        ctx.fillStyle = "rgba(0,0,0,0.78)";
        rr(40, 80, W-80, th, 24);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        tl.forEach((l,i) => ctx.fillText(l, W/2, 80+56+i*68));
      }

      // CENTER POV
      if (c.textPOV) {
        const pl = wrap(c.textPOV, W-120, 64);
        const ph = pl.length*88+60;
        const py = H*0.38 - ph/2;
        ctx.fillStyle = "rgba(0,0,0,0.85)";
        rr(40, py, W-80, ph, 28);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 64px sans-serif";
        ctx.textAlign = "center";
        pl.forEach((l,i) => ctx.fillText(l, W/2, py+66+i*88));
      }

      // BOTTOM punchline red
      if (c.textBottom) {
        const bl = wrap(c.textBottom, W-120, 52);
        const bh = bl.length*76+56;
        const by = H - bh - 200;
        ctx.fillStyle = "#ff3b5c";
        rr(40, by, W-80, bh, 28);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 52px sans-serif";
        ctx.textAlign = "center";
        bl.forEach((l,i) => ctx.fillText(l, W/2, by+60+i*76));
      }
    };

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, W, H);

    if (photo) {
      const img = new Image();
      img.onload = () => {
        const sc = Math.max(W/img.width, H/img.height);
        const sw = img.width*sc, sh = img.height*sc;
        ctx.drawImage(img, (W-sw)/2, (H-sh)/2, sw, sh);
        drawClean();
        const link = document.createElement("a");
        link.download = `banger-${idx+1}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      img.src = photo;
    } else {
      drawClean();
      const link = document.createElement("a");
      link.download = `banger-${idx+1}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div style={{
      background:"rgba(255,255,255,0.03)",
      border:"0.5px solid rgba(255,255,255,0.1)",
      borderRadius:24, overflow:"hidden",
      animation:`fadeUp 0.4s ease ${idx*0.12}s both`
    }}>
      {/* Header */}
      <div style={{ padding:"16px 18px 12px", borderBottom:"0.5px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:acc, marginBottom:6 }}>
          Concept {idx+1}
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:"#fff", lineHeight:1.3, marginBottom:10 }}>
          {c.title}
        </div>
        {/* Viral score */}
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:1, textTransform:"uppercase" }}>Viral</span>
          {Array.from({length:10},(_,j)=>(
            <span key={j} style={{ display:"inline-block", width:5, height:8, borderRadius:2, background:j<(c.viralScore||8)?acc:"rgba(255,255,255,0.08)" }} />
          ))}
          <span style={{ fontSize:10, color:acc, fontWeight:700 }}>{c.viralScore||8}/10</span>
        </div>
      </div>

      <div style={{ padding:"16px 18px 18px", display:"flex", flexDirection:"column", gap:14 }}>

        {/* What the AI saw */}
        {c.whatISee && (
          <div style={{ background:"rgba(255,255,255,0.03)", border:"0.5px solid rgba(255,255,255,0.07)", borderRadius:10, padding:"10px 12px" }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"rgba(255,255,255,0.25)", marginBottom:4 }}>
              👁 What AI Saw In Your Photo
            </div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", lineHeight:1.55, fontStyle:"italic" }}>
              "{c.whatISee}"
            </div>
          </div>
        )}

        {/* TikTok Preview */}
        <TikTokMockup photo={photo} concept={c} canvasRef={canvasRef} />

        {/* Download button */}
        <button onClick={download} style={{
          width:"100%", padding:"13px 0",
          background:"rgba(255,255,255,0.07)",
          border:"0.5px solid rgba(255,255,255,0.15)",
          borderRadius:12, color:"#fff",
          fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13,
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8
        }}>
          ⬇ Download This Frame
        </button>

        {/* Text overlays breakdown */}
        <div>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"rgba(255,255,255,0.25)", marginBottom:8 }}>
            Text On Screen
          </div>
          {[
            { label:"Top — Setup",        text:c.textTop,    color:"rgba(255,255,255,0.8)", bg:"rgba(255,255,255,0.04)", border:"rgba(255,255,255,0.08)" },
            { label:"Middle — POV",       text:c.textPOV,    color:"#fff",                  bg:"rgba(255,255,255,0.05)", border:"rgba(255,255,255,0.1)" },
            { label:"Bottom — Punchline", text:c.textBottom, color:acc,                     bg:`${acc}15`,              border:`${acc}44` },
          ].map(({label,text,color,bg,border})=>(
            <div key={label} style={{ background:bg, border:`0.5px solid ${border}`, borderRadius:8, padding:"8px 10px", marginBottom:6 }}>
              <span style={{ fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:0.5, textTransform:"uppercase", display:"block", marginBottom:3 }}>{label}</span>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:12, color, fontWeight:label.includes("Middle")||label.includes("Bottom")?700:400, fontStyle:"italic" }}>"{text}"</span>
                <CopyBtn text={text||""} />
              </div>
            </div>
          ))}
        </div>

        {/* Scene brief */}
        {(c.addPeople?.length > 0 || c.addProps) && (
          <div style={{ background:"rgba(255,184,0,0.07)", border:"0.5px solid rgba(255,184,0,0.3)", borderRadius:14, padding:"12px 14px" }}>
            <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.2, textTransform:"uppercase", color:"rgba(255,220,80,0.9)", marginBottom:8 }}>
              🎬 Scene Brief — Set This Up
            </div>
            {c.addPeople?.length > 0 && (
              <div style={{ marginBottom:8 }}>
                <div style={{ fontSize:10, color:"rgba(255,220,80,0.6)", marginBottom:5, fontWeight:600, textTransform:"uppercase" }}>People to Add</div>
                {c.addPeople.map((p,pi)=>(
                  <div key={pi} style={{ display:"flex", gap:8, marginBottom:5 }}>
                    <span style={{ width:18, height:18, borderRadius:"50%", background:"rgba(255,220,80,0.15)", border:"0.5px solid rgba(255,220,80,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, flexShrink:0, marginTop:2 }}>+</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)", lineHeight:1.5 }}>{p}</span>
                  </div>
                ))}
              </div>
            )}
            {c.addProps && (
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.55 }}>{c.addProps}</div>
            )}
          </div>
        )}

        {/* Captions */}
        <div>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:"rgba(255,255,255,0.25)", marginBottom:6 }}>Captions</div>
          {[c.captionA, c.captionB].map((cap,ci)=>(
            <div key={ci} style={{
              background:"rgba(255,255,255,0.025)", border:"0.5px solid rgba(255,255,255,0.07)",
              borderRadius:8, padding:"8px 10px", fontSize:11, color:"rgba(255,255,255,0.6)",
              lineHeight:1.5, display:"flex", justifyContent:"space-between", alignItems:"flex-start",
              gap:8, marginBottom:ci===0?6:0
            }}>
              <span style={{flex:1}}>{cap}</span>
              <CopyBtn text={cap||""} />
            </div>
          ))}
        </div>

        {/* Why it works */}
        <div style={{ background:`${acc}0f`, border:`0.5px solid ${acc}33`, borderRadius:10, padding:"10px 12px" }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color:`${acc}bb`, marginBottom:4 }}>Why This Goes Viral</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.7)", lineHeight:1.55 }}>{c.whyItWorks}</div>
        </div>

        {/* Generate image - kept as future option */}
        <div style={{ background:"rgba(255,255,255,0.02)", border:"0.5px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.2)", fontStyle:"italic" }}>
            🎨 AI Scene Generation — Coming Soon
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Home() {
  const [photo,     setPhoto]     = useState(null);
  const [photoMeta, setPhotoMeta] = useState({ base64:null, mime:null });
  const [situation, setSituation] = useState("");
  const [vibe,      setVibe]      = useState("stereotype-flip");
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
      setPhotoMeta({
        base64: e.target.result.split(",")[1],
        mime:   e.target.result.split(";")[0].split(":")[1]
      });
    };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    if (!photoMeta.base64) {
      setError("Please upload a photo first — the AI needs to see your image to build concepts around it.");
      return;
    }
    setLoading(true); setError(null); setConcepts([]);
    try {
      const res = await fetch("/api/concepts", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          photoBase64: photoMeta.base64,
          photoMime:   photoMeta.mime,
          situation,
          vibe
        })
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

  return (
    <div style={{ background:"#0a0a0a", minHeight:"100vh", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#e8e8e8", paddingBottom:60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        * { box-sizing:border-box; }
        input::placeholder { color:rgba(255,255,255,0.25); }
      `}</style>

      {/* Header */}
      <div style={{ padding:"20px 28px", borderBottom:"0.5px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>
          BANGER<span style={{color:"#ff3b5c"}}>.</span>AI
        </div>
        <div style={{ fontSize:10, background:"rgba(255,59,92,0.12)", color:"#ff3b5c", padding:"3px 10px", borderRadius:20, border:"0.5px solid rgba(255,59,92,0.3)", letterSpacing:0.5, textTransform:"uppercase" }}>
          Visual Story Engine
        </div>
      </div>

      <div style={{ padding:"24px 28px", maxWidth:980 }}>

        {/* Upload */}
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:10 }}>
          Step 1 — Upload Your Photo (Required)
        </div>

        {photo ? (
          <div style={{ position:"relative", marginBottom:16 }}>
            <img src={photo} alt="Uploaded" style={{ width:"100%", maxHeight:220, objectFit:"cover", borderRadius:14, display:"block" }} />
            <div style={{ position:"absolute", top:8, left:8, background:"rgba(0,0,0,0.8)", fontSize:10, color:"#4ade80", padding:"3px 10px", borderRadius:20, fontWeight:600 }}>
              Photo ready ✓ — AI will build concepts around THIS specific image
            </div>
            <button onClick={()=>{setPhoto(null);setPhotoMeta({base64:null,mime:null});setConcepts([]);}} style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.8)", border:"none", color:"#fff", width:28, height:28, borderRadius:"50%", cursor:"pointer", fontSize:16 }}>×</button>
          </div>
        ) : (
          <div
            onDragOver={e=>{e.preventDefault();setDrag(true);}}
            onDragLeave={()=>setDrag(false)}
            onDrop={e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files?.[0]);}}
            onClick={()=>fileRef.current?.click()}
            style={{ border:`1.5px dashed ${drag?"#ff3b5c":"rgba(255,255,255,0.15)"}`, borderRadius:16, padding:"36px 20px", textAlign:"center", cursor:"pointer", background:drag?"rgba(255,59,92,0.05)":"rgba(255,255,255,0.02)", marginBottom:16 }}
          >
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files?.[0])} />
            <div style={{fontSize:36, marginBottom:12}}>📸</div>
            <div style={{fontSize:15, color:"rgba(255,255,255,0.8)", marginBottom:6, fontWeight:600}}>Drop your photo here</div>
            <div style={{fontSize:12, color:"rgba(255,255,255,0.35)"}}>AI reads your exact scene — every concept is built around what it sees in YOUR photo</div>
          </div>
        )}

        {/* Optional context */}
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:10 }}>
          Step 2 — Extra Context (Optional)
        </div>
        <input
          value={situation}
          onChange={e=>setSituation(e.target.value)}
          placeholder="Any extra context the AI should know... (optional)"
          style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 14px", fontSize:13, color:"#e8e8e8", fontFamily:"inherit", outline:"none", marginBottom:10 }}
        />
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
          {SCENARIOS.map(s=>(
            <button key={s} onClick={()=>setSituation(s)} style={{ fontSize:11, padding:"5px 12px", background:"rgba(255,255,255,0.04)", border:"0.5px solid rgba(255,255,255,0.08)", borderRadius:20, color:"rgba(255,255,255,0.45)", cursor:"pointer", fontFamily:"inherit" }}>{s}</button>
          ))}
        </div>

        {/* Vibe */}
        <div style={{ fontSize:10, fontWeight:600, letterSpacing:1.5, textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:10 }}>
          Step 3 — Vibe
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
          {VIBES.map(v=>(
            <button key={v.id} onClick={()=>setVibe(v.id)} style={{ padding:"8px 16px", borderRadius:20, cursor:"pointer", fontFamily:"inherit", fontSize:12, background:vibe===v.id?"rgba(255,59,92,0.12)":"rgba(255,255,255,0.03)", border:`0.5px solid ${vibe===v.id?"rgba(255,59,92,0.4)":"rgba(255,255,255,0.1)"}`, color:vibe===v.id?"#ff7a8a":"rgba(255,255,255,0.5)" }}>{v.label}</button>
          ))}
        </div>

        {error && (
          <div style={{ background:"rgba(255,59,92,0.08)", border:"0.5px solid rgba(255,59,92,0.25)", borderRadius:12, padding:"12px 16px", fontSize:12, color:"rgba(255,180,190,0.9)", marginBottom:16 }}>
            {error}
          </div>
        )}

        <button onClick={generate} disabled={loading} style={{ width:"100%", padding:16, background:loading?"#7a1a2a":"#ff3b5c", border:"none", borderRadius:14, color:"#fff", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {loading
            ? <><span style={{ width:18, height:18, border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin 0.8s linear infinite", display:"inline-block" }} /> Reading your image and building bangers...</>
            : <>✦ Generate 3 Bangers From This Photo</>
          }
        </button>

        {concepts.length > 0 && (
          <>
            <div style={{ borderTop:"0.5px solid rgba(255,255,255,0.07)", margin:"32px 0" }} />
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:"#fff", marginBottom:6 }}>
              Your Bangers
            </div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", marginBottom:20 }}>
              Each concept is built around what the AI actually saw in your photo. Download any frame to post directly.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:20 }}>
              {concepts.map((c,i) => <ConceptCard key={i} c={c} idx={i} photo={photo} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
