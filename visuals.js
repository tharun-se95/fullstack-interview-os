(function visualEngine(){
const colors={
javascript:["#FFD875","#F6A844"],typescript:["#6FB5FF","#446BFF"],react:["#77E5FF","#37A8FF"],nextjs:["#E9EAFF","#9099FF"],node:["#B9EE89","#4CC9AA"],postgres:["#8DAAFF","#5574E8"],auth:["#FFB7B5","#F37EA6"],testing:["#74E6C9","#22B59C"],system:["#B7A3FF","#795FF0"],ai:["#BFB6FF","#7F65FC"],resume:["#FFDCA0","#EEAA69"]};
let seq=0;
const prefix=()=>`cv-${++seq}`;
function defs(uid,a,b){return `<defs>
  <linearGradient id="${uid}-main" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
  <radialGradient id="${uid}-glow"><stop stop-color="${a}" stop-opacity=".58"/><stop offset=".5" stop-color="${b}" stop-opacity=".12"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
  <linearGradient id="${uid}-glass" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#dfeaff" stop-opacity=".30"/><stop offset=".5" stop-color="#7699ed" stop-opacity=".09"/><stop offset="1" stop-color="#18263f" stop-opacity=".6"/></linearGradient>
  <filter id="${uid}-blur"><feGaussianBlur stdDeviation="22"/></filter>
  <filter id="${uid}-shadow" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="${a}" flood-opacity=".19"/></filter>
  <pattern id="${uid}-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" stroke="${a}" stroke-opacity=".085" fill="none"/></pattern></defs>`}
function shape(id,uid,a,b){
const fill=`url(#${uid}-main)`,glass=`url(#${uid}-glass)`;
switch(id){
case"javascript":return `<g filter="url(#${uid}-shadow)"><path d="M146 38L244 38 207 123 268 123 133 239 161 145 104 145Z" fill="${fill}" opacity=".96"/><path d="M151 48L219 48 183 130 241 130 156 205 175 135 125 135Z" fill="#fff" opacity=".18"/></g>`;
case"typescript":return `<g transform="rotate(-9 188 135)"><rect x="98" y="50" width="176" height="171" rx="23" fill="${fill}" filter="url(#${uid}-shadow)"/><rect x="112" y="64" width="148" height="143" rx="15" fill="#142c69" opacity=".48"/><text x="186" y="164" text-anchor="middle" fill="#fff" font-family="monospace" font-weight="900" font-size="71">TS</text></g>`;
case"react":return `<g filter="url(#${uid}-shadow)" fill="none" stroke="${fill}" stroke-width="8"><ellipse cx="187" cy="135" rx="103" ry="39" transform="rotate(-60 187 135)"/><ellipse cx="187" cy="135" rx="103" ry="39" transform="rotate(60 187 135)"/><ellipse cx="187" cy="135" rx="103" ry="39"/></g><circle cx="187" cy="135" r="18" fill="${fill}"/>`;
case"nextjs":return `<g filter="url(#${uid}-shadow)"><path d="M94 218L184 41 280 218Z" stroke="${fill}" stroke-width="12" stroke-linejoin="round" fill="${glass}"/><path d="M147 166V99L228 211" fill="none" stroke="${a}" stroke-width="13" stroke-linecap="round"/><path d="M209 171L240 218" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/></g>`;
case"node":return `<g filter="url(#${uid}-shadow)" transform="translate(186 134)"><path d="M0-100L86-50 86 50 0 100 -86 50 -86-50Z" fill="${glass}" stroke="${fill}" stroke-width="7"/><path d="M0-62L54-31 54 31 0 62 -54 31 -54-31Z" stroke="${a}" stroke-opacity=".65" stroke-width="3" fill="none"/><text y="21" text-anchor="middle" fill="${a}" font-family="monospace" font-size="62" font-weight="800">N</text></g>`;
case"postgres":return `<g filter="url(#${uid}-shadow)"><path d="M98 76V189C98 232 278 233 278 189V76" fill="${glass}" stroke="${fill}" stroke-width="6"/><ellipse cx="188" cy="76" rx="90" ry="32" fill="#263c6c" stroke="${a}" stroke-width="6"/><path d="M98 128C110 167 265 168 278 128M98 168C113 207 266 207 278 168" fill="none" stroke="${fill}" stroke-width="5"/><ellipse cx="188" cy="75" rx="57" ry="15" fill="${a}" opacity=".15"/></g>`;
case"auth":return `<g filter="url(#${uid}-shadow)"><path d="M188 30L280 66V134C280 197 231 230 188 249 145 230 96 197 96 134V66Z" fill="${glass}" stroke="${fill}" stroke-width="7"/><rect x="149" y="123" width="78" height="70" rx="12" fill="${fill}"/><path d="M164 124V106C164 73 214 73 214 106V124" stroke="${fill}" stroke-width="11" fill="none" stroke-linecap="round"/><circle cx="188" cy="156" r="8" fill="#17243c"/><path d="M188 163V174" stroke="#17243c" stroke-width="5"/></g>`;
case"testing":return `<g filter="url(#${uid}-shadow)"><rect x="67" y="54" width="244" height="169" rx="21" stroke="${fill}" stroke-width="5" fill="${glass}"/><path d="M83 170H119L137 126 168 196 191 89 219 149H249L268 120H296" stroke="${fill}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="108" cy="85" r="7" fill="${a}"/><circle cx="132" cy="85" r="7" fill="${b}"/></g>`;
case"system":return `<g stroke="${a}" stroke-opacity=".68" stroke-width="4"><path d="M188 137L104 64M188 137L287 61M188 137L86 212M188 137L283 214M104 64L287 61M86 212L283 214"/></g>${[[188,137,36],[104,64,23],[287,61,27],[86,212,22],[283,214,26]].map(([x,y,r],i)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${i===0?fill:glass}" stroke="${a}" stroke-width="4" filter="url(#${uid}-shadow)"/>`).join("")}`;
case"ai":return `<g filter="url(#${uid}-shadow)" stroke="${a}"><path d="M188 38C252 43 289 103 280 158 272 216 225 245 166 233 104 221 78 180 92 120 104 72 143 35 188 38Z" fill="${glass}" stroke-width="5"/><circle cx="188" cy="133" r="64" stroke="${fill}" stroke-width="5" fill="none"/><circle cx="188" cy="133" r="22" fill="${fill}" stroke="none"/>${[[138,80],[242,85],[254,172],[125,187],[164,220]].map(([x,y])=>`<path d="M188 133L${x} ${y}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="11" fill="${fill}"/>`).join("")}</g>`;
case"resume":return `<g filter="url(#${uid}-shadow)"><path d="M188 28L217 104 298 104 231 156 255 235 188 188 121 235 145 156 78 104 159 104Z" fill="${fill}"/><path d="M188 70L205 117 256 117 217 146 229 194 188 166 147 194 159 146 120 117 171 117Z" fill="#fff" opacity=".19"/></g>`;
default:return `<circle cx="188" cy="135" r="80" fill="${fill}"/>`
}}
function artwork(id,opts={}){
const [a,b]=colors[id]||colors.system;const uid=prefix();const type=opts.type||"card";const title=opts.alt||`${id} concept illustration`;
return `<svg class="vector-art vector-art--${type}" viewBox="0 0 376 272" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">${defs(uid,a,b)}
 <rect width="376" height="272" fill="#0D182C"/>
 <rect width="376" height="272" fill="url(#${uid}-grid)"/>
 <ellipse cx="195" cy="138" rx="180" ry="137" fill="url(#${uid}-glow)"/>
 <circle cx="187" cy="135" r="111" stroke="${a}" stroke-opacity=".17" fill="none" stroke-dasharray="3 9"/>
 <circle cx="187" cy="135" r="129" stroke="${b}" stroke-opacity=".12" fill="none"/>
 <path d="M16 230Q96 198 176 240T357 219" stroke="${a}" stroke-opacity=".29" fill="none" stroke-width="1.7"/>
 ${[[45,40],[340,48],[320,225],[48,207],[174,17]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i%2?3:2}" fill="${a}" opacity=".5"/>`).join("")}
 ${shape(id,uid,a,b)}
 <path d="M0 271H376" stroke="${a}" stroke-opacity=".35" stroke-width="2"/>
 </svg>`;
}
function hero(){
const uid=prefix(),a="#8CA5FF",b="#4CDDBD";
return `<svg class="hero-visual" viewBox="0 0 685 530" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Three-dimensional course interface featuring interconnected frontend, backend and AI architecture cards">
${defs(uid,a,b)}
<ellipse cx="352" cy="267" rx="260" ry="195" fill="url(#${uid}-glow)" opacity=".62"/>
<g stroke="#5674A2" stroke-opacity=".28" fill="none"><ellipse cx="364" cy="265" rx="287" ry="151" transform="rotate(-24 364 265)"/><ellipse cx="364" cy="265" rx="251" ry="120" transform="rotate(29 364 265)"/><ellipse cx="364" cy="265" rx="171" ry="217" transform="rotate(18 364 265)"/></g>
<g stroke="#7896D1" stroke-opacity=".19">${Array.from({length:11},(_,i)=>`<path d="M${85+i*47} 425L${248+i*30} 489M60 ${155+i*26}L655 ${125+i*26}"/>`).join("")}</g>
<g transform="translate(150 125) rotate(-12 210 170)" filter="url(#${uid}-shadow)">
<rect x="57" y="77" width="419" height="283" rx="26" fill="#0b1325" stroke="#7285D0" stroke-width="2"/>
<rect x="70" y="90" width="393" height="255" rx="20" fill="#172441" stroke="#415A88"/>
<rect x="70" y="90" width="393" height="42" rx="20" fill="#243553"/>
<circle cx="97" cy="111" r="5" fill="#FF768D"/><circle cx="114" cy="111" r="5" fill="#F8BB65"/><circle cx="131" cy="111" r="5" fill="#69DBBA"/>
<rect x="157" y="103" width="137" height="13" rx="7" fill="#6B7FAD" opacity=".4"/>
<rect x="90" y="149" width="102" height="177" rx="11" fill="#101C31" stroke="#33476E"/>
${Array.from({length:6},(_,i)=>`<rect x="104" y="${167+i*26}" width="${i%2?56:69}" height="7" rx="3.5" fill="${i===2?a:"#536C98"}" opacity="${i===2?".95":".45"}"/>`).join("")}
<rect x="208" y="150" width="236" height="95" rx="12" fill="#142641" stroke="#445D83"/>
<rect x="223" y="167" width="82" height="8" rx="4" fill="#95B5F7"/>
<rect x="223" y="187" width="145" height="5" rx="3" fill="#61779E"/>
<rect x="223" y="198" width="118" height="5" rx="3" fill="#61779E"/>
<path d="M224 231L252 211L277 221L298 192L329 209L354 184L384 202L423 172" stroke="#56DBD2" stroke-width="3.5" fill="none"/>
${[[252,211],[298,192],[354,184],[423,172]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="#7FEDD9"/>`).join("")}
<rect x="208" y="260" width="108" height="66" rx="10" fill="#243356" stroke="#506D9D"/>
<circle cx="241" cy="289" r="15" fill="#5ABECB" opacity=".9"/><path d="M270 282h30m-30 11h21" stroke="#889EC5" stroke-width="5" stroke-linecap="round"/>
<rect x="330" y="260" width="114" height="66" rx="10" fill="#243356" stroke="#506D9D"/>
<path d="M347 304l17-31 16 31 14-23 20 23" stroke="#B9A2FF" stroke-width="4" fill="none"/><path d="M348 313h76" stroke="#7A8AAE" stroke-width="3"/>
</g>
<g transform="translate(70 105) rotate(-16)" filter="url(#${uid}-shadow)"><rect width="170" height="76" rx="17" fill="#1d3153" stroke="#6999D7"/><circle cx="33" cy="38" r="18" fill="#48C2DF" opacity=".22" stroke="#66E9FF"/><path d="M26 37l6 6 10-13" stroke="#7DF6DF" stroke-width="4" fill="none"/><text x="63" y="29" font-size="10" font-family="sans-serif" font-weight="700" fill="#99B1D9">TRACK 03</text><text x="63" y="49" font-size="17" font-family="sans-serif" font-weight="800" fill="#F0F6FF">REACT</text></g>
<g transform="translate(454 55) rotate(12)" filter="url(#${uid}-shadow)"><rect width="164" height="75" rx="17" fill="#1c2d4d" stroke="#A8A0EE"/><circle cx="33" cy="37" r="19" fill="#8775E4" opacity=".26"/><path d="M23 38l10-16 10 16-10 16z" stroke="#C4B7FF" stroke-width="3" fill="none"/><text x="61" y="28" font-size="10" font-family="sans-serif" font-weight="700" fill="#99B1D9">TRACK 10</text><text x="61" y="49" font-size="17" font-family="sans-serif" font-weight="800" fill="#F0F6FF">AI SYSTEMS</text></g>
<g transform="translate(427 382) rotate(8)" filter="url(#${uid}-shadow)"><rect width="195" height="82" rx="17" fill="#213A4E" stroke="#62CFBA"/><circle cx="37" cy="39" r="19" fill="#5DDDBD" opacity=".19"/><path d="M27 34l10 11 13-19" stroke="#79F6D0" stroke-width="4" fill="none"/><text x="68" y="29" font-size="10" font-family="sans-serif" font-weight="700" fill="#9FE6C9">CHECKPOINT</text><text x="68" y="52" font-size="17" font-family="sans-serif" font-weight="800" fill="#F2FBFA">MASTERED</text></g>
<g><circle cx="127" cy="380" r="7" fill="#89ACFF"/><circle cx="610" cy="210" r="5" fill="#5FE6C8"/><circle cx="343" cy="55" r="5" fill="#FFD08B"/></g>
</svg>`;
}
function ring(percent,caption){
const pct=Math.max(0,Math.min(100,Number(percent)||0)),r=52,circ=2*Math.PI*r;
return `<svg class="visual-ring" role="img" aria-label="${pct}% ${caption||"completed"}" viewBox="0 0 150 150"><circle cx="75" cy="75" r="${r}" fill="none" stroke="#273754" stroke-width="12"/><circle cx="75" cy="75" r="${r}" fill="none" stroke="#69DFCA" stroke-width="12" stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ*(1-pct/100)}" transform="rotate(-90 75 75)" style="transition:stroke-dashoffset .8s"/><text x="75" y="72" text-anchor="middle" fill="#F3F6FF" font-size="28" font-family="sans-serif" font-weight="850">${pct}%</text><text x="75" y="91" text-anchor="middle" fill="#9EADCA" font-size="11" font-family="sans-serif">COMPLETE</text></svg>`;
}
const pipelines={
"js-closures":["Outer scope","Returned fn","Live bindings"],
"js-event-loop":["Call stack","Microtasks","Next task"],
"js-async":["Async start","Promise pool","Result / cancel"],
"ts-unions":["Unknown JSON","Type guard","Narrowed type"],
"ts-generics":["Generic T","Constraint","Safe output"],
"ts-utils":["Domain model","Safe DTO","API response"],
"react-render":["State update","Render tree","DOM commit"],
"react-effects":["Effect setup","Async request","Cleanup"],
"react-state":["Local UI","Shared state","Server source"],
"next-modes":["Request","Server render","Client island"],
"next-lcp":["Browser request","LCP resource","First render"],
"next-cache":["Server data","Cache policy","Hydration"],
"node-runtime":["HTTP request","Event loop","Async I/O"],
"node-http":["Middleware","Validation","Response"],
"node-reliability":["Ingress","Backpressure","Safe worker"],
"sql-joins":["Parent rows","JOIN relation","Aggregate"],
"sql-index":["Index seek","Heap rows","Sorted page"],
"sql-tx":["BEGIN","Guarded write","COMMIT"],
"auth-flow":["Login","Session cookie","Authorized API"],
"auth-threats":["Untrusted input","Validate","Safe handler"],
"auth-authorization":["Identity","Tenant policy","Scoped data"],
"test-pyramid":["Unit tests","Integration","Critical E2E"],
"test-ci":["PR & checks","Preview rollout","Production"],
"test-observability":["Metrics","Trace spans","Root cause"],
"sys-estimation":["Arrival rate","Worker capacity","Queue growth"],
"sys-caching":["Request","Cache / DB","Fresh result"],
"sys-realtime":["GPS devices","Pub/Sub","Live map"],
"ai-graphs":["Graph state","Nodes / edges","Human gate"],
"ai-rag":["Source chunks","Retrieve","Verify citation"],
"ai-evals":["Test cases","Agent run","Quality score"],
"resume-stories":["Problem","Decisions","Impact"],
"resume-leadership":["Disagreement","Trade-offs","Alignment"],
"resume-interview-plan":["Learn","Implement","Explain"]
};
function lesson(id,track,title){
const [a,b]=colors[track]||colors.system,uid=prefix(),steps=pipelines[id]||pipelines["sys-estimation"];
return `<svg class="lesson-vector" role="img" aria-label="Concept diagram for ${title}: ${steps.join(" to ")}" viewBox="0 0 870 288" xmlns="http://www.w3.org/2000/svg">
 ${defs(uid,a,b)}
 <rect x="1" y="1" width="868" height="286" rx="22" fill="#0C1729" stroke="#2A4161"/>
 <rect x="1" y="1" width="868" height="286" rx="22" fill="url(#${uid}-grid)"/>
 <ellipse cx="435" cy="154" rx="360" ry="135" fill="url(#${uid}-glow)" opacity=".6"/>
 <text x="35" y="37" fill="${a}" font-family="sans-serif" letter-spacing="2" font-size="11" font-weight="800">VISUAL MENTAL MODEL</text>
 <text x="836" y="37" fill="#7890B6" font-family="monospace" font-size="12" text-anchor="end">${id.toUpperCase()}</text>
 <path d="M125 205C282 272 598 271 746 205" fill="none" stroke="${a}" stroke-opacity=".14" stroke-width="2"/>
 ${steps.map((label,i)=>{
 const cx=154+i*279,y=143,n=String(i+1).padStart(2,"0");
 return `<g>
 ${i!==2?`<path d="M${cx+106} ${y}H${cx+167}" fill="none" stroke="${a}" stroke-opacity=".65" stroke-width="3" stroke-linecap="round"/><path d="M${cx+159} ${y-7}L${cx+170} ${y}L${cx+159} ${y+7}" fill="none" stroke="${a}" stroke-width="3"/>`:""}
 <rect x="${cx-106}" y="${y-60}" width="212" height="124" rx="19" fill="#192A46" stroke="${i===1?a:"#40587c"}" stroke-opacity="${i===1?'.8':'.9'}" stroke-width="${i===1?2.5:1.5}"/>
 <rect x="${cx-94}" y="${y-48}" width="38" height="30" rx="9" fill="${a}" fill-opacity=".15" stroke="${a}" stroke-opacity=".4"/>
 <text x="${cx-75}" y="${y-28}" fill="${a}" text-anchor="middle" font-family="monospace" font-weight="800" font-size="12">${n}</text>
 <text x="${cx}" y="${y+10}" fill="#E4EEFF" text-anchor="middle" font-family="sans-serif" font-weight="750" font-size="16">${label}</text>
 <rect x="${cx-45}" y="${y+27}" width="90" height="5" rx="2.5" fill="${a}" opacity="${i===1?'.9':'.32'}"/>
 </g>`
 }).join("")}
 <text x="435" y="257" fill="#8EA5C6" font-family="sans-serif" font-size="13" text-anchor="middle">Trace the data • Name the boundary • Explain the failure mode</text>
 </svg>`;
}
function architecture(nodes,active){
const count=nodes.length,uid=prefix(),width=920,step=width/count;
return `<svg class="architecture-svg" viewBox="0 0 920 232" role="img" xmlns="http://www.w3.org/2000/svg" aria-label="System architecture pipeline, currently selected ${nodes[active]?.title||"stage"}">
${defs(uid,"#91A4FF","#54D7CF")}
<rect width="920" height="232" rx="20" fill="#0D182B"/>
<rect width="920" height="232" rx="20" fill="url(#${uid}-grid)"/>
<path d="M49 116H873" stroke="#627FB4" stroke-opacity=".35" stroke-width="4" stroke-dasharray="6 8"/>
${nodes.map((n,i)=>{const x=step*(i+.5),sel=i===active;return `<g class="${sel?"arch-selected":""}">
<circle cx="${x}" cy="115" r="${sel?65:50}" fill="${sel?"#1d3862":"#142740"}" stroke="${sel?"#9FAFFF":"#426184"}" stroke-width="${sel?3:1.6}" />
<circle cx="${x}" cy="115" r="${sel?50:38}" fill="none" stroke="${sel?"#7DE5D2":"#537FA8"}" stroke-width="2" stroke-dasharray="${sel?"5 5":"2 6"}"/>
<text x="${x}" y="98" font-size="11" font-family="monospace" fill="${sel?"#A9FFD9":"#8BA8D1"}" text-anchor="middle">STEP ${i+1}</text>
<text x="${x}" y="126" font-size="14" font-family="sans-serif" font-weight="800" fill="#F4F8FF" text-anchor="middle">${short(n.title,17)}</text>
<circle cx="${x}" cy="191" r="${sel?6:3.5}" fill="${sel?"#68E9D0":"#506F99"}"/>
</g>`}).join("")}
</svg>`;
}
function short(s,n){return String(s).length<=n?String(s):String(s).slice(0,n-1)+"…"}
function speedometer(label,a,b){
return `<div class="viz-kpi"><span class="viz-kpi__label">${label}</span><div class="viz-kpi__bars"><i style="width:${a}%"></i><i style="width:${b}%"></i></div><span class="viz-kpi__vals">${a} → ${b}</span></div>`;
}
window.CourseVisuals={artwork,hero,ring,lesson,architecture,speedometer,colors};
})();
