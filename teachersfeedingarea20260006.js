(function () {
  'use strict';

  var AXP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpBnECD3NgUmfg6sVNB0eMfEVZiRPcbxu5bapVA10K1_L8pJC1F-j00WM5hM4_5mTZ/exec';

  /* ── URL GUARD ── */
  var _href  = window.location.href;
  var _match = _href.match(/\/p\/s(\d{3,})-teachers-feeding-area\.html/i);
  if (!_match) return;
  var _DIGITS = _match[1];

  /* STATE */
  var S = {
    digits:_DIGITS, schoolId:null, schoolName:'', meta:null, year:'',
    cls:'', examType:'', subject:'', teacher:null,
    students:[], marks:{}, idx:0, submitted:false, allTeachers:[]
  };

  /* BLOGGER KILL */
  var _ael=document.addEventListener.bind(document), _wael=window.addEventListener.bind(window);
  var _dw=document.write?document.write.bind(document):function(){};
  document.addEventListener=function(t,f,o){if(t==='DOMContentLoaded'||t==='load'||t==='readystatechange')return;_ael(t,f,o);};
  window.addEventListener=function(t,f,o){if(t==='DOMContentLoaded'||t==='load')return;_wael(t,f,o);};
  document.write=function(){};document.writeln=function(){};

  function boot(){
    document.addEventListener=_ael; window.addEventListener=_wael; document.write=_dw;
    wipePage(); injectStyles(); injectIcons(); buildShell(); axpInit();
  }
  if(document.readyState==='loading'){_ael('DOMContentLoaded',boot);}else{setTimeout(boot,0);}

  function wipePage(){
    Array.from(document.querySelectorAll('style,link[rel="stylesheet"]')).forEach(function(e){e.parentNode.removeChild(e);});
    var wl=['axp-teacher-marks','teachersfeedingarea','jspdf','bootstrap-icons'];
    function isOwn(s){return wl.some(function(w){return s.indexOf(w)>-1;});}
    Array.from(document.querySelectorAll('script[src]')).forEach(function(e){if(!isOwn(e.src)){try{e.onload=null;e.onerror=null;}catch(x){}}});
    document.body.innerHTML=''; document.body.style.cssText=''; document.documentElement.style.cssText='';
    document.title='AcademixPoint — Marks Entry';
    if(!document.querySelector('meta[name="viewport"]')){
      var vm=document.createElement('meta');vm.name='viewport';vm.content='width=device-width,initial-scale=1';document.head.appendChild(vm);
    }
    window.onerror=function(m,s){if(!s)return true;if(isOwn(s))return false;return true;};
    window.onunhandledrejection=function(e){e.preventDefault();};
  }

  /* ══════════════════════════════════════════════════════════════════════════ STYLES */
  function injectStyles(){
    var s=document.createElement('style');
    s.textContent=
'*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}'+
'html,body{height:100%;background:#080d1a;font-family:\'Segoe UI\',system-ui,sans-serif;font-size:14px;color:#e2e8f0}'+
':root{--ink:#080d1a;--teal:#4ecca3;--teal2:#10b981;--teal3:#065f46;--amber:#f59e0b;--red:#ef4444;--orange:#f97316;--slate:#94a3b8;--bg:#080d1a;--bg2:#0c1424;--bg3:#111827;--card:#0f172a;--border:#1a2744;--border2:#243354;--r:8px;--r2:12px;}'+
'::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:#0c1424}::-webkit-scrollbar-thumb{background:#243354;border-radius:3px}'+

/* HEADER */
'#axpHdr{background:linear-gradient(135deg,#060c1c 0%,#0a1628 60%,#060c1c 100%);border-bottom:1px solid rgba(78,204,163,.15);padding:0 24px;height:68px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:200;box-shadow:0 4px 32px rgba(0,0,0,.5);}'+
'#axpHdr::after{content:\'\';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(78,204,163,.4) 30%,rgba(16,185,129,.6) 50%,rgba(78,204,163,.4) 70%,transparent 100%);}'+
'.hdr-logo{display:flex;align-items:center;gap:12px;flex-shrink:0}'+
'.hdr-icon{width:40px;height:40px;background:linear-gradient(135deg,#4ecca3,#10b981);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#060c1c;box-shadow:0 0 20px rgba(78,204,163,.25);}'+
'.hdr-brand .hdr-name{font-size:15px;font-weight:900;color:#4ecca3;letter-spacing:2px;line-height:1}'+
'.hdr-brand .hdr-tag{font-size:10px;color:#334155;letter-spacing:.8px;margin-top:3px;text-transform:uppercase}'+
'.hdr-sep{width:1px;height:36px;background:linear-gradient(180deg,transparent,rgba(78,204,163,.2),transparent);margin:0 6px}'+
'.hdr-info{flex:1;min-width:0}'+
'.hdr-sname{font-size:14px;font-weight:700;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.hdr-smeta{font-size:11px;color:#475569;margin-top:2px}'+
'.hdr-status{flex-shrink:0;background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.3);color:#4ecca3;font-size:11px;font-weight:800;padding:5px 12px;border-radius:20px;letter-spacing:.8px;display:flex;align-items:center;gap:6px}'+
'.hdr-status::before{content:\'\';width:6px;height:6px;background:#10b981;border-radius:50%;animation:blink 2s ease-in-out infinite}'+
'@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}'+

/* WRAP */
'.axpW{max-width:840px;margin:0 auto;padding:28px 16px 100px}'+

/* LOADER */
'#axpLd{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:65vh;gap:24px}'+
'.ld-orbit{position:relative;width:64px;height:64px}'+
'.ld-outer{position:absolute;inset:0;border:2px solid rgba(78,204,163,.1);border-top:2px solid #4ecca3;border-radius:50%;animation:spin .9s linear infinite}'+
'.ld-inner{position:absolute;inset:10px;border:2px solid rgba(16,185,129,.1);border-bottom:2px solid #10b981;border-radius:50%;animation:spin .6s linear infinite reverse}'+
'.ld-core{position:absolute;inset:22px;background:radial-gradient(circle,rgba(78,204,163,.4),transparent);border-radius:50%;animation:pulse2 1.5s ease-in-out infinite}'+
'@keyframes spin{to{transform:rotate(360deg)}}'+
'@keyframes pulse2{0%,100%{opacity:.4;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}'+
'.ld-txt{font-size:13px;color:#64748b;font-weight:600;letter-spacing:.8px;text-transform:uppercase}'+
'.ld-step-row{display:flex;align-items:center;gap:8px;font-size:12px;color:#4ecca3;opacity:0;transition:opacity .4s;background:rgba(78,204,163,.05);border:1px solid rgba(78,204,163,.1);padding:6px 14px;border-radius:20px}'+
'.ld-step-row.vis{opacity:1}'+

/* RESTORE */
'#axpRB{display:none;background:linear-gradient(135deg,rgba(245,158,11,.06),rgba(245,158,11,.02));border:1px solid rgba(245,158,11,.25);border-radius:var(--r2);padding:16px 20px;margin-bottom:20px;animation:fadeDown .3s ease}'+
'@keyframes fadeDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}'+

/* INFO BAR */
'.axpInfoBar{background:rgba(78,204,163,.04);border:1px solid rgba(78,204,163,.12);border-radius:var(--r);padding:10px 18px;margin-bottom:20px;display:none;align-items:center;gap:10px;flex-wrap:wrap;font-size:12px;color:#64748b}'+
'.axpInfoBar strong{color:#4ecca3;font-weight:700}'+

/* CARD */
'.axpCard{background:var(--card);border:1px solid var(--border);border-radius:var(--r2);padding:22px;margin-bottom:16px;box-shadow:0 4px 24px rgba(0,0,0,.3);transition:border-color .25s,box-shadow .25s}'+
'.axpCard:has(.axpChip.on){border-color:rgba(78,204,163,.2);box-shadow:0 4px 24px rgba(78,204,163,.05)}'+

/* CARD TITLE */
'.axpCT{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:#475569;margin-bottom:16px;display:flex;align-items:center;gap:10px}'+
'.axpCT i{color:#4ecca3;font-size:16px}'+
'.ct-num{width:22px;height:22px;background:rgba(78,204,163,.1);border:1px solid rgba(78,204,163,.25);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#4ecca3;flex-shrink:0}'+
'.ct-done{color:#10b981!important}'+

/* CHIPS */
'.axpChips{display:flex;flex-wrap:wrap;gap:8px}'+
'.axpChip{padding:8px 16px;border:1.5px solid var(--border2);background:var(--bg3);color:#64748b;font-size:12.5px;font-weight:600;cursor:pointer;border-radius:7px;transition:all .15s;user-select:none}'+
'.axpChip:hover{border-color:rgba(78,204,163,.5);color:#e2e8f0;background:#15213d}'+
'.axpChip.on{background:linear-gradient(135deg,rgba(78,204,163,.12),rgba(16,185,129,.06));border-color:#4ecca3;color:#4ecca3;box-shadow:0 0 16px rgba(78,204,163,.1)}'+

/* BUTTONS */
'.axpBtn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;font-size:13px;font-weight:700;border:none;border-radius:var(--r);cursor:pointer;transition:all .2s;letter-spacing:.3px;text-decoration:none}'+
'.axpBP{background:linear-gradient(135deg,#065f46,#10b981);color:#fff;border:1.5px solid rgba(78,204,163,.35);box-shadow:0 4px 18px rgba(16,185,129,.2)}'+
'.axpBP:hover{transform:translateY(-1px);box-shadow:0 8px 24px rgba(78,204,163,.25)}'+
'.axpBP:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}'+
'.axpBD{background:rgba(78,204,163,.08);color:#4ecca3;border:1.5px solid rgba(78,204,163,.25)}'+
'.axpBD:hover{background:rgba(78,204,163,.14);border-color:#4ecca3}'+
'.axpBG{background:var(--bg3);color:#64748b;border:1.5px solid var(--border2)}'+
'.axpBG:hover{background:var(--border2);color:#e2e8f0}'+
'.axpBR{background:rgba(239,68,68,.08);color:#ef4444;border:1.5px solid rgba(239,68,68,.25)}'+
'.axpBR:hover{background:rgba(239,68,68,.14)}'+
'.axpSm{padding:7px 14px;font-size:12px}'+

/* PROGRESS */
'.axpPMeta{display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:4px}'+
'.axpPBar{background:rgba(255,255,255,.06);height:5px;border-radius:3px;overflow:hidden;margin-bottom:8px}'+
'.axpPFill{height:100%;background:linear-gradient(90deg,#4ecca3,#10b981);border-radius:3px;transition:width .5s cubic-bezier(.4,0,.2,1)}'+

/* CONTEXT TAGS */
'.ctx-tag{font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:.3px}'+
'.ctx-cls{background:rgba(78,204,163,.1);border:1px solid rgba(78,204,163,.2);color:#4ecca3}'+
'.ctx-exam{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);color:#f59e0b}'+
'.ctx-sub{background:rgba(165,130,246,.1);border:1px solid rgba(165,130,246,.2);color:#c4b5fd}'+

/* STUDENT BANNER */
'.axpStuBnr{background:linear-gradient(135deg,#0c1a30,#0a1525);border:1px solid rgba(78,204,163,.15);border-radius:var(--r2);padding:22px 24px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;position:relative;overflow:hidden}'+
'.axpStuBnr::before{content:\'\';position:absolute;top:-40px;right:-40px;width:120px;height:120px;background:radial-gradient(circle,rgba(78,204,163,.06),transparent);border-radius:50%;pointer-events:none}'+
'.stu-name{font-size:21px;font-weight:900;color:#4ecca3;letter-spacing:.3px;line-height:1.1}'+
'.stu-meta{font-size:12px;color:#475569;margin-top:5px}'+
'.stu-cand{font-family:\'Courier New\',monospace;font-size:13px;font-weight:700;background:rgba(78,204,163,.08);border:1px solid rgba(78,204,163,.18);color:#4ecca3;padding:6px 14px;border-radius:20px;letter-spacing:.5px}'+
'.stu-pos{font-size:11px;color:#334155;margin-top:5px;text-align:right}'+

/* SCORE INPUT */
'.axpScoreWrap{text-align:center;padding:28px 0 18px}'+
'.axpScoreInput{width:170px;height:86px;font-size:44px;font-weight:900;text-align:center;background:var(--bg3);border:3px solid var(--border2);border-radius:14px;color:#e2e8f0;outline:none;transition:all .2s;box-shadow:0 8px 24px rgba(0,0,0,.3);-moz-appearance:textfield}'+
'.axpScoreInput::-webkit-outer-spin-button,.axpScoreInput::-webkit-inner-spin-button{-webkit-appearance:none}'+
'.axpScoreInput:focus{border-color:rgba(78,204,163,.6);box-shadow:0 0 0 4px rgba(78,204,163,.08),0 8px 24px rgba(0,0,0,.3)}'+
'.axpScoreInput.gA{border-color:#10b981;color:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.06)}'+
'.axpScoreInput.gB{border-color:#4ecca3;color:#4ecca3;box-shadow:0 0 0 4px rgba(78,204,163,.06)}'+
'.axpScoreInput.gC{border-color:#f59e0b;color:#f59e0b;box-shadow:0 0 0 4px rgba(245,158,11,.06)}'+
'.axpScoreInput.gD{border-color:#f97316;color:#f97316;box-shadow:0 0 0 4px rgba(249,115,22,.06)}'+
'.axpScoreInput.gF{border-color:#ef4444;color:#ef4444;box-shadow:0 0 0 4px rgba(239,68,68,.06)}'+
'.axpGradeBadge{display:inline-block;font-size:36px;font-weight:900;margin-top:10px;min-width:52px;transition:color .2s}'+

/* NAV */
'.axpNav{display:flex;gap:10px;justify-content:space-between;flex-wrap:wrap;margin-top:18px}'+

/* TEACHER BADGE */
'.axpTchrBadge{display:flex;align-items:center;gap:10px;background:rgba(16,185,129,.06);border:1px solid rgba(16,185,129,.18);border-radius:var(--r);padding:10px 16px;margin-bottom:16px;font-size:12.5px;color:#6ee7b7}'+
'.axpTchrBadge i{font-size:18px;color:#10b981;flex-shrink:0}'+

/* SUCCESS */
'.axpSuccessBnr{background:linear-gradient(135deg,rgba(16,185,129,.07),rgba(78,204,163,.03));border:1px solid rgba(78,204,163,.2);border-radius:var(--r2);padding:28px;text-align:center;margin-bottom:20px}'+
'.suc-icon{font-size:52px;color:#10b981;margin-bottom:10px;display:block}'+
'.suc-title{font-size:22px;font-weight:900;color:#4ecca3;margin-bottom:8px}'+
'.suc-sub{font-size:13px;color:#64748b;line-height:1.6}'+

/* ACTION GRID */
'.axpActions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px}'+
'.axpABtn{display:flex;flex-direction:column;align-items:center;gap:8px;padding:20px 12px;border-radius:var(--r2);cursor:pointer;border:1.5px solid var(--border2);background:var(--bg3);color:#64748b;transition:all .2s;font-size:12px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;user-select:none}'+
'.axpABtn i{font-size:24px;transition:transform .2s}'+
'.axpABtn:hover{border-color:rgba(78,204,163,.4);color:#4ecca3;background:rgba(78,204,163,.05);transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.2)}'+
'.axpABtn:hover i{transform:scale(1.1)}'+
'.axpABtn.prime{border-color:rgba(78,204,163,.25);background:rgba(78,204,163,.06);color:#4ecca3}'+
'.axpABtn.prime:hover{border-color:#4ecca3;background:rgba(78,204,163,.12)}'+

/* TABLE */
'.axpTbl{width:100%;border-collapse:collapse;font-size:13px}'+
'.axpTbl th{background:var(--bg3);color:#4ecca3;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;padding:11px 14px;border-bottom:2px solid rgba(78,204,163,.15);text-align:left;white-space:nowrap}'+
'.axpTbl th:not(:nth-child(2)){text-align:center}'+
'.axpTbl td{padding:10px 14px;border-bottom:1px solid var(--border);color:#cbd5e1;font-size:13px}'+
'.axpTbl td:not(:nth-child(2)){text-align:center}'+
'.axpTbl tbody tr:hover{background:rgba(78,204,163,.025)}'+
'.cand-col{font-family:\'Courier New\',monospace!important;font-size:12px!important;color:#4ecca3!important;font-weight:700!important;letter-spacing:.3px}'+
'.score-col{font-weight:800!important;font-size:15px!important}'+

/* GRADE GRID */
'.axpGGrid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:20px}'+
'.axpGCell{text-align:center;padding:14px 6px;border-radius:var(--r);background:var(--bg3);border:1px solid var(--border2)}'+
'.axpGCell .gv{font-size:28px;font-weight:900}'+
'.axpGCell .gl{font-size:10px;font-weight:800;margin-top:4px;text-transform:uppercase;letter-spacing:.5px;opacity:.7}'+

/* DIVIDER */
'.divider{height:1px;background:var(--border);margin:18px 0}'+

/* ERROR */
'#axpErr{display:none;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.25);border-radius:var(--r2);padding:24px;margin:20px 0}'+
'#axpErr .err-title{font-size:16px;font-weight:800;margin-bottom:8px;color:#ef4444;display:flex;align-items:center;gap:8px}'+
'#axpErr .err-msg{font-size:13px;color:#94a3b8;line-height:1.7}'+

/* MODAL */
'#axpMod{display:none;position:fixed;inset:0;z-index:9999;background:rgba(6,12,28,.88);backdrop-filter:blur(8px);align-items:center;justify-content:center;padding:20px}'+
'#axpMod.open{display:flex}'+
'#axpMBox{background:var(--card);max-width:490px;width:100%;border-radius:var(--r2);overflow:hidden;border:1px solid var(--border2);animation:popIn .2s ease;box-shadow:0 32px 80px rgba(0,0,0,.7)}'+
'@keyframes popIn{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}'+
'#axpMHd{background:linear-gradient(135deg,#0a1628,#0d1f3c);padding:20px 24px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border)}'+
'#axpMHd .mhi{font-size:26px}'+
'#axpMHd .mht{font-size:15px;font-weight:800;color:#e2e8f0;flex:1}'+
'#axpMHd .mhx{background:none;border:none;color:#334155;font-size:24px;cursor:pointer;line-height:1;transition:color .15s;padding:0}'+
'#axpMHd .mhx:hover{color:#ef4444}'+
'#axpMBd{padding:22px 24px;font-size:13.5px;color:#94a3b8;line-height:1.8}'+
'#axpMFt{padding:12px 24px 22px;display:flex;gap:8px;justify-content:flex-end}'+

/* TOAST */
'#axpToast{display:none;position:fixed;bottom:28px;right:22px;z-index:9999;padding:12px 20px;font-size:13px;font-weight:700;border-radius:var(--r);box-shadow:0 12px 40px rgba(0,0,0,.5);align-items:center;gap:10px}'+

/* UTILITY */
'.axpH{display:none!important}'+

/* RESPONSIVE */
'@media(max-width:640px){'+
'.axpGGrid{grid-template-columns:repeat(3,1fr)}'+
'.axpNav{flex-direction:column}'+
'.axpNav .axpBtn{width:100%;justify-content:center}'+
'#axpHdr{padding:0 14px;height:58px}'+
'.hdr-brand .hdr-tag{display:none}'+
'.axpW{padding:16px 12px 80px}'+
'.axpScoreInput{width:150px;height:78px;font-size:40px}'+
'.axpStuBnr{padding:16px}'+
'.stu-name{font-size:18px}'+
'}'+
'@media(max-width:400px){'+
'.axpActions{grid-template-columns:1fr}'+
'.axpGGrid{grid-template-columns:repeat(2,1fr)}'+
'.axpScoreInput{width:140px;height:72px;font-size:36px}'+
'}';
    document.head.appendChild(s);
  }

  function injectIcons(){
    var l=document.createElement('link');l.rel='stylesheet';
    l.href='https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css';
    document.head.appendChild(l);
  }

  /* ══════════════════════════════════════════════════════════════════════════ SHELL */
  function buildShell(){
    document.body.innerHTML=
'<div id="axpHdr">'+
  '<div class="hdr-logo">'+
    '<div class="hdr-icon">A</div>'+
    '<div class="hdr-brand">'+
      '<div class="hdr-name">ACADEMIXPOINT</div>'+
      '<div class="hdr-tag">School Management</div>'+
    '</div>'+
  '</div>'+
  '<div class="hdr-sep"></div>'+
  '<div class="hdr-info">'+
    '<div class="hdr-sname" id="axpHdrName">Loading…</div>'+
    '<div class="hdr-smeta" id="axpHdrMeta"></div>'+
  '</div>'+
  '<div class="hdr-status" id="axpHdrBadge" style="display:none">ACTIVE</div>'+
'</div>'+

'<div class="axpW">'+

/* LOADER */
'<div id="axpLd">'+
  '<div class="ld-orbit"><div class="ld-outer"></div><div class="ld-inner"></div><div class="ld-core"></div></div>'+
  '<div class="ld-txt" id="axpLdTxt">Verifying school code…</div>'+
  '<div class="ld-step-row" id="axpLdStep"><i class="bi bi-shield-check"></i><span id="axpLdStepTxt">Connecting…</span></div>'+
'</div>'+

/* ERROR */
'<div id="axpErr">'+
  '<div class="err-title"><i class="bi bi-exclamation-octagon-fill"></i><span id="axpErrTitle">Error</span></div>'+
  '<div class="err-msg" id="axpErrMsg"></div>'+
'</div>'+

/* MAIN */
'<div id="axpMain" class="axpH">'+

  /* RESTORE BANNER */
  '<div id="axpRB">'+
    '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">'+
      '<i class="bi bi-cloud-arrow-down" style="font-size:22px;color:#f59e0b;flex-shrink:0"></i>'+
      '<div style="flex:1"><div style="font-weight:700;font-size:13px;color:#fcd34d">Unsaved session found</div><div style="font-size:12px;color:#78350f;margin-top:3px" id="axpRI"></div></div>'+
      '<button onclick="axpRestoreSession()" class="axpBtn axpBP axpSm"><i class="bi bi-arrow-counterclockwise"></i> Restore</button>'+
      '<button onclick="axpDismissRestore()" class="axpBtn axpBG axpSm">Dismiss</button>'+
    '</div>'+
  '</div>'+

  /* INFO BAR */
  '<div class="axpInfoBar" id="axpInfoBar">'+
    '<i class="bi bi-building" style="color:#4ecca3;font-size:15px"></i>'+
    '<strong id="axpIBName"></strong>'+
    '<span style="color:#243354">·</span>'+
    '<span>Code: <strong id="axpIBCode"></strong></span>'+
    '<span style="color:#243354">·</span>'+
    '<span>Year: <strong id="axpIBYear"></strong></span>'+
  '</div>'+

  /* WIZARD */
  '<div id="axpWizard">'+

    /* Step 1: Class */
    '<div class="axpCard" id="axpS1">'+
      '<div class="axpCT"><div class="ct-num">1</div><i class="bi bi-people"></i> Select Class</div>'+
      '<div class="axpChips" id="axpCC"></div>'+
    '</div>'+

    /* Step 2: Exam */
    '<div class="axpCard axpH" id="axpS2">'+
      '<div class="axpCT"><div class="ct-num">2</div><i class="bi bi-journal-bookmark"></i> Select Exam Type</div>'+
      '<div class="axpChips" id="axpEC"></div>'+
    '</div>'+

    /* Step 3: Subject */
    '<div class="axpCard axpH" id="axpS3">'+
      '<div class="axpCT"><div class="ct-num">3</div><i class="bi bi-book"></i> Select Subject</div>'+
      '<div class="axpChips" id="axpSubC"></div>'+
      '<div id="axpNoSubMsg" style="display:none;font-size:12px;color:#475569;margin-top:8px"></div>'+
    '</div>'+

    /* Load btn */
    '<div id="axpLW" class="axpH" style="text-align:center;margin:4px 0 8px">'+
      '<button class="axpBtn axpBD" id="axpLB" onclick="axpLoadStudents()" style="padding:13px 36px;font-size:14px">'+
        '<i class="bi bi-cloud-download"></i> Load Students'+
      '</button>'+
    '</div>'+

  '</div>'+/* /wizard */

  /* ENTRY */
  '<div id="axpEntry" class="axpH">'+

    /* Context + back */
    '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:18px">'+
      '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'+
        '<span class="ctx-tag ctx-cls" id="axpCtxCls"></span>'+
        '<span style="color:#243354;font-size:16px">·</span>'+
        '<span class="ctx-tag ctx-exam" id="axpCtxExam"></span>'+
        '<span style="color:#243354;font-size:16px">·</span>'+
        '<span class="ctx-tag ctx-sub" id="axpCtxSub"></span>'+
      '</div>'+
      '<button onclick="axpStartNew()" class="axpBtn axpBG axpSm"><i class="bi bi-arrow-left"></i> Change</button>'+
    '</div>'+

    /* Teacher badge */
    '<div id="axpTchrBnr" class="axpTchrBadge axpH">'+
      '<i class="bi bi-person-badge-fill"></i><div id="axpTchrTxt"></div>'+
    '</div>'+

    /* Progress */
    '<div class="axpPMeta"><span id="axpPL" style="color:#475569">0 / 0 filled</span><span id="axpPP" style="color:#4ecca3">0%</span></div>'+
    '<div class="axpPBar"><div class="axpPFill" id="axpPF" style="width:0%"></div></div>'+

    /* Student banner */
    '<div class="axpStuBnr">'+
      '<div><div class="stu-name" id="axpStuName">—</div><div class="stu-meta" id="axpStuMeta"></div></div>'+
      '<div style="text-align:right"><div class="stu-cand" id="axpStuCand"></div><div class="stu-pos" id="axpStuPos"></div></div>'+
    '</div>'+

    /* Score */
    '<div class="axpScoreWrap">'+
      '<input type="number" class="axpScoreInput" id="axpSI" min="0" max="100" placeholder="—" oninput="axpOnScore(this)" onkeydown="axpScoreKey(event)">'+
      '<div><span class="axpGradeBadge" id="axpGBdg" style="color:#334155">—</span></div>'+
      '<div style="font-size:12px;color:#334155;margin-top:6px" id="axpPMk"></div>'+
    '</div>'+

    /* Nav */
    '<div class="axpNav">'+
      '<button class="axpBtn axpBG" onclick="axpPrev()"><i class="bi bi-chevron-left"></i> Prev</button>'+
      '<button class="axpBtn axpBG" onclick="axpSkip()"><i class="bi bi-skip-forward"></i> Skip</button>'+
      '<button class="axpBtn axpBD" onclick="axpNext()">Next <i class="bi bi-chevron-right"></i></button>'+
    '</div>'+

    /* Submit */
    '<div style="margin-top:24px;text-align:center">'+
      '<button class="axpBtn axpBP" id="axpSubBtn" onclick="axpSubmitAll()" style="padding:15px 44px;font-size:14px;letter-spacing:.5px">'+
        '<i class="bi bi-send-fill"></i> Submit All Marks'+
      '</button>'+
    '</div>'+

  '</div>'+/* /entry */

  /* DONE */
  '<div id="axpDone" class="axpH">'+

    '<div class="axpSuccessBnr">'+
      '<span class="suc-icon"><i class="bi bi-check-circle-fill"></i></span>'+
      '<div class="suc-title">Marks Submitted Successfully</div>'+
      '<div class="suc-sub" id="axpSucSub"></div>'+
    '</div>'+

    /* Action buttons */
    '<div class="axpActions">'+
      '<div class="axpABtn prime" onclick="axpViewSubmitted()"><i class="bi bi-table"></i><span>View Submitted Data</span></div>'+
      '<div class="axpABtn" onclick="axpExportPDF()"><i class="bi bi-file-pdf"></i><span>Export PDF</span></div>'+
      '<div class="axpABtn" onclick="axpExportCSV()"><i class="bi bi-download"></i><span>Download CSV</span></div>'+
      '<div class="axpABtn" onclick="axpReenter()"><i class="bi bi-pencil-square"></i><span>Re-enter Marks</span></div>'+
    '</div>'+
    '<div style="text-align:center">'+
      '<button class="axpBtn axpBD" onclick="axpStartNew()" style="padding:13px 36px;font-size:14px">'+
        '<i class="bi bi-plus-circle"></i> Enter New Subject'+
      '</button>'+
    '</div>'+

    /* Submitted view */
    '<div id="axpSubmittedView" class="axpH" style="margin-top:20px">'+
      '<div class="axpCard">'+
        '<div class="axpCT"><i class="bi bi-table"></i> Submitted Results</div>'+
        '<div class="axpGGrid" id="axpGGrid"></div>'+
        '<div class="divider"></div>'+
        '<div style="overflow-x:auto"><table class="axpTbl"><thead><tr>'+
          '<th>Cand. No.</th><th>Student Name</th><th>Sex</th><th>Score</th><th>Grade</th><th>Pos.</th>'+
        '</tr></thead><tbody id="axpTbody"></tbody></table></div>'+
      '</div>'+
    '</div>'+

  '</div>'+/* /done */

'</div>'+/* /main */
'</div>'+/* /axpW */

/* MODAL */
'<div id="axpMod"><div id="axpMBox">'+
  '<div id="axpMHd"><div class="mhi" id="axpMIcon"></div><div class="mht" id="axpMTitle"></div><button class="mhx" onclick="axpMClose()">×</button></div>'+
  '<div id="axpMBd"></div><div id="axpMFt"></div>'+
'</div></div>'+

/* TOAST */
'<div id="axpToast"></div>';
  }

  /* ══════════════════════════════════════════════════════════════════════════ API */
  async function apiGet(p){
    var url=new URL(AXP_SCRIPT_URL);
    Object.keys(p).forEach(function(k){url.searchParams.append(k,p[k]);});
    return (await fetch(url.toString())).json();
  }
  async function apiPost(p){
    var f=new FormData();
    Object.keys(p).forEach(function(k){f.append(k,p[k]);});
    return (await fetch(AXP_SCRIPT_URL,{method:'POST',body:f})).json();
  }

  /* ══════════════════════════════════════════════════════════════════════════ INIT */
  async function axpInit(){
    try{
      setLd('Verifying school code…','Connecting to server');
      var res=await apiGet({mode:'schoolByIndex',schoolIndex:S.digits});
      if(res.status!=='success') throw new Error(res.message||'School code '+S.digits+' not recognised.');

      var acct=String(res.accountStatus||'UNKNOWN').toUpperCase();
      if(acct!=='ACTIVE'){
        var msgs={PENDING:'Account pending activation. Please complete the activation payment.',INACTIVE:'Account is inactive. Contact your administrator.',SUSPENDED:'Account has been suspended. Contact AcademixPoint support.',DORMANT:'Account is dormant. Contact your administrator.',WARNING:'Account has an active warning. Contact support.',AWAITING_DELETE:'Account is scheduled for deletion. Contact support.'};
        showErr(msgs[acct]||'Account status ('+acct+') does not permit access.','Access Denied — '+acct);
        return;
      }

      S.schoolId=res.schoolId; S.schoolName=res.schoolName; S.meta=res.meta; S.year=S.meta.year;

      g('axpHdrName').textContent=S.schoolName;
      g('axpHdrMeta').textContent='Year '+S.year+' · Code S'+S.digits;
      g('axpHdrBadge').style.display='flex';
      g('axpIBName').textContent=S.schoolName;
      g('axpIBCode').textContent='S'+S.digits;
      g('axpIBYear').textContent=S.year;
      g('axpInfoBar').style.display='flex';
      document.title='Marks Entry — '+S.schoolName;

      setLd('Loading teachers…','Fetching teacher assignments');
      var tRes=await apiGet({mode:'teachers',schoolId:S.schoolId,year:S.year});
      S.allTeachers=(tRes.status==='success'&&tRes.teachers)?tRes.teachers:[];

      hideEl('axpLd'); showEl('axpMain');
      buildClassChips();
      checkRestore();

    }catch(ex){showErr(ex.message);}
  }

  function setLd(txt,step){
    var t=g('axpLdTxt'),s=g('axpLdStep'),st=g('axpLdStepTxt');
    if(t)t.textContent=txt; if(st)st.textContent=step||txt;
    if(s)s.classList.add('vis');
  }

  /* ══════════════════════════════════════════════════════════════════════════ WIZARD */
  function buildClassChips(){
    var cls=(S.meta&&S.meta.classes)?S.meta.classes:[];
    fillChips('axpCC',cls,function(c){
      S.cls=c; S.examType=''; S.subject=''; S.teacher=null;
      resetStep('axpS2'); resetStep('axpS3'); hideEl('axpLW');
      tickStep('axpS1',1); buildExamChips();
    });
    showEl('axpS1');
  }

  function buildExamChips(){
    var exams=(S.meta&&S.meta.examTypes)?S.meta.examTypes:[];
    fillChips('axpEC',exams,function(et){
      S.examType=et; S.subject=''; S.teacher=null;
      resetStep('axpS3'); hideEl('axpLW');
      tickStep('axpS2',2); buildSubjectChips();
    });
    showEl('axpS2'); scroll2('axpS2');
  }

  function buildSubjectChips(){
    var subs=(S.meta.subjects&&S.meta.subjects[S.cls])?S.meta.subjects[S.cls]:[];
    var nm=g('axpNoSubMsg'); nm.style.display='none';
    var sc2=g('axpSubC'); sc2.innerHTML='';
    if(!subs.length){nm.textContent='No subjects found for '+S.cls+'.';nm.style.display='block';showEl('axpS3');return;}
    fillChips('axpSubC',subs,function(sub){
      S.subject=sub;
      S.teacher=findTeacher(S.cls,sub);
      tickStep('axpS3',3);
      showEl('axpLW');
    });
    showEl('axpS3'); hideEl('axpLW'); scroll2('axpS3');
  }

  function findTeacher(cls,sub){
    for(var i=0;i<S.allTeachers.length;i++){
      var t=S.allTeachers[i];
      var m=(t.assignments||[]).some(function(a){
        return String(a.class||'').trim().toUpperCase()===cls.toUpperCase()&&
               String(a.subject||'').trim().toUpperCase()===sub.toUpperCase();
      });
      if(m)return t;
    }
    return null;
  }

  function fillChips(cid,items,onSel){
    var c=g(cid); c.innerHTML='';
    items.forEach(function(item){
      var b=document.createElement('button');
      b.className='axpChip'; b.textContent=item;
      b.onclick=function(){
        Array.from(c.querySelectorAll('.axpChip')).forEach(function(x){x.classList.remove('on');});
        b.classList.add('on'); onSel(item);
      };
      c.appendChild(b);
    });
  }

  function tickStep(cardId,num){
    var card=g(cardId); if(!card)return;
    var n=card.querySelector('.ct-num');
    if(n)n.innerHTML='<i class="bi bi-check2 ct-done" style="color:#10b981"></i>';
  }
  function resetStep(cardId){
    hideEl(cardId);
    var card=g(cardId); if(!card)return;
  }
  function scroll2(id){setTimeout(function(){var el=g(id);if(el)el.scrollIntoView({behavior:'smooth',block:'nearest'});},120);}

  /* ══════════════════════════════════════════════════════════════════════════ LOAD */
  window.axpLoadStudents=async function(){
    var lb=g('axpLB'); lb.disabled=true;
    lb.innerHTML='<span style="display:inline-block;width:15px;height:15px;border:2px solid rgba(78,204,163,.2);border-top-color:#4ecca3;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:8px"></span>Loading…';
    try{
      var res=await apiGet({mode:'feedingRoster',schoolId:S.schoolId,year:S.year,examType:S.examType,'class':S.cls,subject:S.subject});
      var students=[];
      if(res.status==='success'&&res.students&&res.students.length){students=res.students;}
      else{
        var er=await apiGet({mode:'examRoster',schoolId:S.schoolId,year:S.year,examType:S.examType,'class':S.cls});
        if(er.status==='success'&&er.roster&&er.roster.length)students=er.roster;
      }
      if(!students.length){axpAlert('No Students','No students found for <strong>'+esc(S.subject)+'</strong> in <strong>'+esc(S.cls)+'</strong>.<br><br>Check registration sheet subject enrollment.','warning');return;}
      students=sortStu(students);
      S.students=students; S.marks={}; S.idx=0; S.submitted=false;

      /* Hide wizard, show entry */
      hideEl('axpWizard');
      g('axpCtxCls').textContent=S.cls;
      g('axpCtxExam').textContent=S.examType;
      g('axpCtxSub').textContent=S.subject;

      if(S.teacher){
        g('axpTchrTxt').innerHTML='<strong>'+esc(S.teacher.name)+'</strong>'+(S.teacher.email?' · '+esc(S.teacher.email):'')+' <span style="opacity:.5;font-size:11px">(assigned)</span>';
        showEl('axpTchrBnr');
      }else{hideEl('axpTchrBnr');}

      showEl('axpEntry'); hideEl('axpDone');
      renderCard(); saveCache();
    }catch(ex){axpAlert('Load Error','Failed: '+ex.message,'danger');}
    finally{lb.disabled=false;lb.innerHTML='<i class="bi bi-cloud-download"></i> Load Students';}
  };

  /* ══════════════════════════════════════════════════════════════════════════ RENDER */
  function renderCard(){
    var s=S.students[S.idx],total=S.students.length;
    var filled=Object.keys(S.marks).length,pct=Math.round(filled/total*100);
    g('axpStuName').textContent=s.name;
    g('axpStuMeta').textContent=(s.gender==='F'?'Female':'Male')+' · '+S.subject+' · '+S.cls;
    g('axpStuCand').textContent=candNo(S.idx);
    g('axpStuPos').textContent=(S.idx+1)+' of '+total;
    g('axpPL').textContent=filled+' / '+total+' filled';
    g('axpPF').style.width=pct+'%';
    g('axpPP').textContent=pct+'%';
    var sc=S.marks[s.name];
    g('axpSI').value=(sc!==undefined)?sc:'';
    updateBadge(sc); g('axpPMk').textContent='';
    g('axpSI').focus(); g('axpSI').select();
  }

  function updateBadge(v){
    var gr=calcGrade(v),bdg=g('axpGBdg');
    bdg.textContent=gr.g; bdg.style.color=gr.c;
    g('axpSI').className='axpScoreInput'+(v!==null&&v!==undefined&&v!==''?' g'+gr.g:'');
  }

  /* ══════════════════════════════════════════════════════════════════════════ SCORE */
  window.axpOnScore=function(inp){
    var v=inp.value.trim(); if(!v){updateBadge(null);return;}
    var n=parseInt(v);
    if(!isNaN(n)&&n>=0&&n<=100){S.marks[S.students[S.idx].name]=n;updateBadge(n);saveCache();}
  };
  window.axpScoreKey=function(e){
    if(e.key==='Enter'||e.key==='ArrowDown'){e.preventDefault();axpNext();}
    if(e.key==='ArrowUp'){e.preventDefault();axpPrev();}
  };
  function saveCurrent(){
    var v=g('axpSI').value.trim();
    if(v!==''){var n=parseInt(v);if(!isNaN(n)&&n>=0&&n<=100)S.marks[S.students[S.idx].name]=n;}
  }
  window.axpNext=function(){saveCurrent();if(S.idx<S.students.length-1){S.idx++;renderCard();}else{axpAlert('End of List','Last student reached. Click <strong>Submit All Marks</strong>.','info');}};
  window.axpPrev=function(){saveCurrent();if(S.idx>0){S.idx--;renderCard();}};
  window.axpSkip=function(){if(S.idx<S.students.length-1){S.idx++;renderCard();}};

  /* ══════════════════════════════════════════════════════════════════════════ SUBMIT */
  window.axpSubmitAll=function(){
    saveCurrent();
    var payload=S.students.filter(function(s){return S.marks[s.name]!==undefined;}).map(function(s){return{name:s.name,score:S.marks[s.name]};});
    if(!payload.length){axpAlert('No Marks','Enter at least one score before submitting.','warning');return;}
    axpConfirm('Confirm Submission','Submit <strong>'+payload.length+'</strong> mark(s) for<br><strong>'+esc(S.subject)+'</strong> · '+esc(S.cls)+' · '+esc(S.examType),
    async function(){
      var btn=g('axpSubBtn'); btn.disabled=true;
      btn.innerHTML='<span style="display:inline-block;width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:8px"></span>Submitting…';
      try{
        var res=await apiPost({mode:'teacherMarksEntry',schoolId:S.schoolId,year:S.year,examType:S.examType,'class':S.cls,subject:S.subject,'data[studentName]':payload.map(function(p){return p.name;}).join(','),'data[marks]':payload.map(function(p){return String(p.score);}).join(',')});
        if(res.status==='success'){
          S.submitted=true; clearCache();
          var saved=res.saved!==undefined?res.saved:payload.length;
          g('axpSucSub').textContent=saved+' marks saved · '+S.subject+' · '+S.cls+' · '+S.examType;
          hideEl('axpEntry'); showEl('axpDone'); hideEl('axpSubmittedView');
          axpToast(saved+' marks saved!','success');
          if(res.notFound&&res.notFound.length)axpAlert('Partial Submit',saved+' saved. ⚠️ '+res.notFound.length+' not found: '+res.notFound.slice(0,5).map(esc).join(', '),'warning');
        }else{axpAlert('Failed',res.message||'Submission failed.','danger');}
      }catch(ex){axpAlert('Network Error',ex.message,'danger');}
      finally{btn.disabled=false;btn.innerHTML='<i class="bi bi-send-fill"></i> Submit All Marks';}
    },'Submit','background:linear-gradient(135deg,#065f46,#10b981);color:#fff;border-color:rgba(78,204,163,.4);');
  };

  /* ══════════════════════════════════════════════════════════════════════════ VIEW */
  window.axpViewSubmitted=function(){
    var view=g('axpSubmittedView');
    if(!view.classList.contains('axpH')){hideEl('axpSubmittedView');return;}
    var gc={A:0,B:0,C:0,D:0,F:0,'—':0};
    var gc2={A:'#10b981',B:'#4ecca3',C:'#f59e0b',D:'#f97316',F:'#ef4444','—':'#334155'};
    var rows=S.students.map(function(s,i){var sc=S.marks[s.name],gr=calcGrade(sc);gc[gr.g]=(gc[gr.g]||0)+1;return{cand:candNo(i),name:s.name,gender:s.gender,score:sc,gr:gr.g,col:gr.c};});
    var ranked=rows.filter(function(r){return r.score!==undefined;}).slice().sort(function(a,b){return b.score-a.score;});
    var pm={},p=0,ls=null,lp=0;
    ranked.forEach(function(r){if(r.score!==ls){p=lp+1;ls=r.score;lp=p;}pm[r.name]=p;});
    g('axpGGrid').innerHTML=['A','B','C','D','F','—'].map(function(gr){return'<div class="axpGCell"><div class="gv" style="color:'+gc2[gr]+'">'+(gc[gr]||0)+'</div><div class="gl" style="color:'+gc2[gr]+'">Grade '+gr+'</div></div>';}).join('');
    g('axpTbody').innerHTML=rows.map(function(r){return'<tr><td class="cand-col">'+esc(r.cand)+'</td><td style="font-weight:500">'+esc(r.name)+'</td><td>'+(r.gender==='F'?'F':'M')+'</td><td class="score-col" style="color:'+r.col+'">'+(r.score!==undefined?r.score:'—')+'</td><td><strong style="color:'+r.col+';font-size:15px">'+r.gr+'</strong></td><td style="font-weight:700">'+(pm[r.name]||'—')+'</td></tr>';}).join('');
    showEl('axpSubmittedView');
    setTimeout(function(){g('axpSubmittedView').scrollIntoView({behavior:'smooth',block:'start'});},120);
  };

  /* ══════════════════════════════════════════════════════════════════════════ PDF */
  window.axpExportPDF=async function(){
    if(!window.jspdf){
      await new Promise(function(res,rej){var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';s.onload=res;s.onerror=rej;document.head.appendChild(s);});
    }
    var {jsPDF}=window.jspdf;
    var doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
    var ML=14,MR=14,MT=14,PW=210,PH=297,UW=PW-ML-MR,y=MT;
    function chkPg(n){if(y+n>PH-14){doc.addPage();y=MT;}}
    doc.setFillColor(6,12,28);doc.rect(ML,y,UW,26,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(78,204,163);
    doc.text(S.schoolName.toUpperCase(),PW/2,y+9,{align:'center'});
    doc.setFontSize(8.5);doc.setTextColor(180,180,180);
    doc.text('MARK SHEET — '+S.subject+' · '+S.cls+' · '+S.examType+' · '+S.year,PW/2,y+16,{align:'center'});
    doc.setFontSize(7.5);doc.setTextColor(120,120,120);
    doc.text('Code: S'+S.digits+' · '+new Date().toLocaleDateString(),PW/2,y+22,{align:'center'});
    y+=30;
    if(S.teacher){doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(100,100,100);doc.text('Teacher: '+S.teacher.name+(S.teacher.email?' <'+S.teacher.email+'>':''),ML,y);y+=7;}
    var cols=[{l:'CAND. NO.',w:30},{l:'STUDENT NAME',w:68},{l:'SEX',w:12},{l:'SCORE',w:18},{l:'GRADE',w:16},{l:'POS.',w:24}],RH=7;
    var ranked2=S.students.filter(function(s){return S.marks[s.name]!==undefined;}).slice().sort(function(a,b){return S.marks[b.name]-S.marks[a.name];});
    var pm2={},p2=0,ls2=null,lp2=0;
    ranked2.forEach(function(s){var sc=S.marks[s.name];if(sc!==ls2){p2=lp2+1;ls2=sc;lp2=p2;}pm2[s.name]=p2;});
    var grC={A:[16,185,129],B:[4,120,87],C:[180,130,6],D:[194,65,12],F:[185,28,28]};
    function drawHdr(){
      doc.setFillColor(6,12,28);doc.rect(ML,y,UW,RH,'F');
      doc.setDrawColor(0,0,0);doc.setLineWidth(0.2);doc.rect(ML,y,UW,RH,'S');
      var cx=ML;
      cols.forEach(function(c){doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(78,204,163);doc.line(cx+c.w,y,cx+c.w,y+RH);doc.text(c.l,cx+c.w/2,y+RH/2+2.5,{align:'center',maxWidth:c.w-2});cx+=c.w;});
      y+=RH;
    }
    drawHdr();
    var rc=0;
    S.students.forEach(function(s,i){
      if(S.marks[s.name]===undefined)return;
      chkPg(RH+2);
      var sc=S.marks[s.name],gr=calcGrade(sc),gc3=grC[gr.g]||[30,30,30];
      if(rc%2===1){doc.setFillColor(15,20,36);doc.rect(ML,y,UW,RH,'F');}
      doc.setDrawColor(0,0,0);doc.setLineWidth(0.2);doc.rect(ML,y,UW,RH,'S');
      var row=[candNo(i),s.name,s.gender==='F'?'F':'M',sc,gr.g,pm2[s.name]||'—'],cx=ML;
      row.forEach(function(v,ci){
        if(ci===4){doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(gc3[0],gc3[1],gc3[2]);}
        else{doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(180,180,180);}
        doc.line(cx+cols[ci].w,y,cx+cols[ci].w,y+RH);
        var al=ci===1?'left':'center',tx=ci===1?cx+2:cx+cols[ci].w/2;
        doc.text(String(v||''),tx,y+RH/2+2.5,{align:al,maxWidth:cols[ci].w-3});cx+=cols[ci].w;
      });
      y+=RH;rc++;
    });
    var nP=doc.internal.getNumberOfPages();
    for(var pg=1;pg<=nP;pg++){doc.setPage(pg);doc.setFont('helvetica','italic');doc.setFontSize(7);doc.setTextColor(80,80,80);doc.text('AcademixPoint School Management · www.academixpoint.com',PW/2,PH-8,{align:'center'});doc.text('Page '+pg+' of '+nP,PW-MR,PH-8,{align:'right'});}
    doc.save('MarkSheet_S'+S.digits+'_'+S.cls+'_'+S.subject+'_'+S.examType+'.pdf');
  };

  /* ══════════════════════════════════════════════════════════════════════════ CSV */
  window.axpExportCSV=function(){
    var ranked=S.students.filter(function(s){return S.marks[s.name]!==undefined;}).slice().sort(function(a,b){return S.marks[b.name]-S.marks[a.name];});
    var pm={},p=0,ls=null,lp=0;
    ranked.forEach(function(s){var sc=S.marks[s.name];if(sc!==ls){p=lp+1;ls=sc;lp=p;}pm[s.name]=p;});
    var lines=['"Cand. No.","Name","Gender","Score","Grade","Position"'];
    S.students.forEach(function(s,i){var sc=S.marks[s.name],gr=calcGrade(sc);lines.push('"'+candNo(i)+'","'+s.name+'",'+(s.gender==='F'?'"F"':'"M"')+','+(sc!==undefined?sc:'')+','+gr.g+','+(pm[s.name]||''));});
    var a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(lines.join('\n'));a.download='Marks_S'+S.digits+'_'+S.cls+'_'+S.subject+'_'+S.examType+'.csv';a.click();
  };

  window.axpReenter=function(){hideEl('axpDone');showEl('axpEntry');S.idx=0;renderCard();};

  window.axpStartNew=function(){
    S.cls='';S.examType='';S.subject='';S.teacher=null;S.students=[];S.marks={};S.submitted=false;
    hideEl('axpDone');hideEl('axpEntry');hideEl('axpSubmittedView');
    showEl('axpWizard');hideEl('axpS2');hideEl('axpS3');hideEl('axpLW');
    ['axpS1','axpS2','axpS3'].forEach(function(id,i){var card=g(id);if(!card)return;var n=card.querySelector('.ct-num');if(n)n.innerHTML=String(i+1);});
    buildClassChips(); clearCache(); window.scrollTo({top:0,behavior:'smooth'});
  };

  /* ══════════════════════════════════════════════════════════════════════════ CACHE — FIX: save marks + students */
  function cKey(){return 'axpT_'+S.digits+'_'+(S.schoolId||'');}
  function saveCache(){
    try{
      localStorage.setItem(cKey(),JSON.stringify({
        cls:S.cls,examType:S.examType,subject:S.subject,teacher:S.teacher,
        marks:S.marks,       /* ← marks persisted */
        idx:S.idx,
        students:S.students, /* ← students persisted so restore needs no server call */
        savedAt:new Date().toISOString()
      }));
    }catch(ex){}
  }
  function clearCache(){try{localStorage.removeItem(cKey());}catch(ex){}}

  function checkRestore(){
    try{
      var raw=localStorage.getItem(cKey());if(!raw)return;
      var d=JSON.parse(raw);
      if(!d.cls||!d.examType||!d.subject)return;
      var filled=Object.keys(d.marks||{}).length;
      g('axpRI').textContent=d.cls+' · '+d.examType+' · '+d.subject+' — '+filled+' mark(s) saved · '+new Date(d.savedAt).toLocaleString();
      g('axpRB').style.display='block';
      window._axpPR=d;
    }catch(ex){}
  }

  window.axpRestoreSession=async function(){
    var d=window._axpPR;if(!d)return;
    g('axpRB').style.display='none';
    S.cls=d.cls;S.examType=d.examType;S.subject=d.subject;S.teacher=d.teacher||null;
    S.marks=d.marks||{};S.idx=d.idx||0;

    if(d.students&&d.students.length){
      S.students=d.students;
      g('axpCtxCls').textContent=S.cls;g('axpCtxExam').textContent=S.examType;g('axpCtxSub').textContent=S.subject;
      if(S.teacher){g('axpTchrTxt').innerHTML='<strong>'+esc(S.teacher.name)+'</strong>'+(S.teacher.email?' · '+esc(S.teacher.email):'');showEl('axpTchrBnr');}else{hideEl('axpTchrBnr');}
      hideEl('axpWizard');showEl('axpEntry');hideEl('axpDone');
      S.idx=Math.min(S.idx,S.students.length-1);
      renderCard();
      axpToast('Session restored — '+Object.keys(S.marks).length+' marks loaded ✓','success');
    }else{
      /* Fallback to server */
      buildClassChips();hlChip('axpCC',d.cls);buildExamChips();hlChip('axpEC',d.examType);buildSubjectChips();hlChip('axpSubC',d.subject);showEl('axpLW');
      await window.axpLoadStudents();
      S.marks=d.marks||{};S.idx=Math.min(d.idx||0,Math.max(S.students.length-1,0));
      renderCard();axpToast('Session restored — '+Object.keys(S.marks).length+' marks loaded ✓','success');
    }
  };
  window.axpDismissRestore=function(){g('axpRB').style.display='none';clearCache();};
  window.axpClearCache=function(){axpConfirm('Clear Cache','Delete all locally saved session data?',function(){try{Object.keys(localStorage).filter(function(k){return k.startsWith('axpT_');}).forEach(function(k){localStorage.removeItem(k);});}catch(ex){}axpToast('Cache cleared.','success');g('axpRB').style.display='none';},'Clear','background:#ef4444;border-color:rgba(239,68,68,.4);color:#fff;');};

  /* ══════════════════════════════════════════════════════════════════════════ HELPERS */
  function calcGrade(v){
    if(v===undefined||v===null||v==='')return{g:'—',c:'#334155'};
    var n=parseInt(v);if(isNaN(n))return{g:'—',c:'#334155'};
    if(n>=75)return{g:'A',c:'#10b981'};if(n>=65)return{g:'B',c:'#4ecca3'};
    if(n>=45)return{g:'C',c:'#f59e0b'};if(n>=30)return{g:'D',c:'#f97316'};
    return{g:'F',c:'#ef4444'};
  }
  /* ── Candidate number: S0553-0001 ── */
  function candNo(i){return'S'+S.digits+'-'+String(i+1).padStart(4,'0');}
  function sortStu(arr){return arr.slice().sort(function(a,b){var af=(a.gender||'').toUpperCase()==='F'?0:1,bf=(b.gender||'').toUpperCase()==='F'?0:1;if(af!==bf)return af-bf;return String(a.name).toUpperCase().localeCompare(String(b.name).toUpperCase());});}
  function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function g(id){return document.getElementById(id);}
  function showEl(id){var el=g(id);if(el)el.classList.remove('axpH');}
  function hideEl(id){var el=g(id);if(el)el.classList.add('axpH');}
  function hlChip(cid,val){var c=g(cid);if(!c)return;Array.from(c.querySelectorAll('.axpChip')).forEach(function(b){if(b.textContent.trim()===String(val).trim())b.classList.add('on');});}
  function showErr(msg,title){hideEl('axpLd');var el=g('axpErr');el.style.display='block';g('axpErrTitle').textContent=title||'Error';g('axpErrMsg').textContent=msg;}

  /* MODAL */
  var _icons={info:'<i class="bi bi-info-circle-fill" style="color:#3b82f6"></i>',success:'<i class="bi bi-check-circle-fill" style="color:#10b981"></i>',warning:'<i class="bi bi-exclamation-triangle-fill" style="color:#f59e0b"></i>',danger:'<i class="bi bi-x-octagon-fill" style="color:#ef4444"></i>'};
  function _modal(title,body,buttons,type){
    g('axpMIcon').innerHTML=_icons[type]||_icons.info;g('axpMTitle').textContent=title;g('axpMBd').innerHTML=body;
    g('axpMFt').innerHTML=buttons.map(function(b){return'<button onclick="'+b.a+'" class="axpBtn axpSm" style="'+b.s+'">'+b.l+'</button>';}).join('');
    g('axpMod').classList.add('open');
  }
  window.axpMClose=function(){g('axpMod').classList.remove('open');};
  function axpAlert(title,body,type){_modal(title,body,[{l:'OK',a:'axpMClose()',s:'background:linear-gradient(135deg,#065f46,#10b981);color:#fff;border:1.5px solid rgba(78,204,163,.4);'}],type||'info');}
  function axpConfirm(title,body,onYes,yesLbl,yesStyle){
    window._axpCB=onYes;
    _modal(title,body,[{l:'Cancel',a:'axpMClose()',s:'background:var(--bg3);color:#64748b;border:1.5px solid var(--border2);'},{l:yesLbl||'Confirm',a:'axpMClose();if(window._axpCB){window._axpCB();window._axpCB=null;}',s:yesStyle||'background:linear-gradient(135deg,#065f46,#10b981);color:#fff;border:1.5px solid rgba(78,204,163,.4);'}],'warning');
  }
  function axpToast(msg,type){
    var bg={success:'#065f46',danger:'#7f1d1d',warning:'#78350f',info:'#1e3a5f'};
    var bd={success:'rgba(78,204,163,.35)',danger:'rgba(239,68,68,.35)',warning:'rgba(245,158,11,.35)',info:'rgba(59,130,246,.35)'};
    var tc={success:'#4ecca3',danger:'#fca5a5',warning:'#fcd34d',info:'#93c5fd'};
    var el=g('axpToast');
    el.style.cssText='display:flex;position:fixed;bottom:28px;right:22px;z-index:9999;padding:12px 20px;font-size:13px;font-weight:700;border-radius:8px;box-shadow:0 12px 40px rgba(0,0,0,.5);align-items:center;gap:10px;border:1.5px solid '+(bd[type]||bd.info)+';background:'+(bg[type]||bg.info)+';color:'+(tc[type]||tc.info)+';animation:popIn .2s ease;letter-spacing:.3px';
    el.textContent=msg;
    clearTimeout(window._axpTT);
    window._axpTT=setTimeout(function(){el.style.display='none';},3200);
  }

})();
