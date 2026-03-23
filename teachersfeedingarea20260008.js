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
'html,body{height:100%;margin:0;padding:0}'+
'body{background:#f0f2f7;font-family:\'Segoe UI\',system-ui,sans-serif;font-size:14px;color:#1e2a4a;display:flex;flex-direction:column;overflow:hidden}'+
':root{--pri:#2d3a8c;--pri2:#3d4db5;--pri3:#1a2368;--gold:#d4a017;--gold2:#f0c040;--gold3:#8a6800;--red:#c0392b;--grn:#1a7a4a;--bg:#f0f2f7;--white:#ffffff;--panel:#edf0f8;--border:#c8cfe8;--text:#1e2a4a;--muted:#5a6485;--lite:#8892b0;}'+
'::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#e8eaf2}::-webkit-scrollbar-thumb{background:#b0b8d8}'+
'@keyframes spin{to{transform:rotate(360deg)}}'+
'@keyframes fadeDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}'+
'@keyframes popIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}'+
/* LAYOUT */
/* HEADER */
'#axpHdr{background:var(--pri);color:#fff;height:54px;display:flex;align-items:center;padding:0 18px;gap:12px;position:sticky;top:0;z-index:300;border-bottom:3px solid var(--gold);flex-shrink:0}'+
'#axpMenuBtn{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;padding:4px 6px;display:none;line-height:1;margin-right:2px}'+
'.hdr-icon{width:32px;height:32px;background:var(--gold);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:var(--pri3);flex-shrink:0}'+
'.hdr-brand{display:flex;flex-direction:column;flex-shrink:0}'+
'.hdr-name{font-size:12.5px;font-weight:900;color:#fff;letter-spacing:1.5px;line-height:1}'+
'.hdr-tag{font-size:9.5px;color:rgba(255,255,255,.5);letter-spacing:.5px;margin-top:2px}'+
'.hdr-div{width:1px;height:26px;background:rgba(255,255,255,.2);margin:0 6px;flex-shrink:0}'+
'.hdr-info{flex:1;min-width:0}'+
'.hdr-sname{font-size:12.5px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.hdr-smeta{font-size:10px;color:rgba(255,255,255,.5);margin-top:1px}'+
'.hdr-badge{background:var(--gold);color:var(--pri3);font-size:9.5px;font-weight:800;padding:3px 9px;letter-spacing:.8px;flex-shrink:0;display:none}'+
/* BODY ROW */
'#axpBody{display:flex;flex:1;overflow:hidden;min-height:0}'+
/* SIDEBAR */
'#axpSidebar{width:215px;background:var(--pri3);flex-shrink:0;display:flex;flex-direction:column;overflow-y:auto;height:100%}'+
'.sb-school{padding:14px 14px 12px;border-bottom:1px solid rgba(255,255,255,.1)}'+
'.sb-idx{font-size:22px;font-weight:900;color:var(--gold);letter-spacing:2px;font-family:\'Courier New\',monospace;line-height:1;margin-bottom:4px}'+
'.sb-school-name{font-size:11px;font-weight:700;color:#fff;line-height:1.3;margin-bottom:3px}'+
'.sb-school-code{font-size:10px;color:rgba(255,255,255,.45);letter-spacing:.3px;line-height:1.4;word-break:break-word}'+
'.sb-section{padding:10px 14px 4px;font-size:9.5px;font-weight:800;color:rgba(255,255,255,.3);letter-spacing:1.2px;text-transform:uppercase}'+
'.sb-item{display:flex;align-items:center;gap:10px;padding:8px 14px;font-size:12px;font-weight:600;color:rgba(255,255,255,.55);cursor:default;border-left:3px solid transparent}'+
'.sb-item i{font-size:14px;width:16px;text-align:center;flex-shrink:0}'+
'.sb-item.active{background:rgba(255,255,255,.09);color:#fff;border-left-color:var(--gold)}'+
'.sb-item.active i{color:var(--gold)}'+
'.sb-item:hover:not(.active){background:rgba(255,255,255,.05);color:rgba(255,255,255,.8)}'+
'.sb-year{margin-top:auto;padding:12px 14px;border-top:1px solid rgba(255,255,255,.08);font-size:10.5px;color:rgba(255,255,255,.3);flex-shrink:0}'+
'.sb-year strong{color:var(--gold);font-weight:800}'+
/* SIDEBAR OVERLAY */
'#axpSbOverlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:250}'+
/* CONTENT */
'#axpContent{flex:1;min-width:0;overflow-y:auto;padding:22px 22px 80px;height:100%}'+
/* PAGE TITLE */
'.pg-title{font-size:16px;font-weight:800;color:var(--pri);margin-bottom:3px}'+
'.pg-sub{font-size:11.5px;color:var(--muted);margin-bottom:18px}'+
/* LOADER */
'#axpLd{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:55vh;gap:16px}'+
'.ld-ring{width:40px;height:40px;border:3px solid var(--border);border-top-color:var(--pri);border-right-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite}'+
'.ld-txt{font-size:11.5px;color:var(--muted);font-weight:600;letter-spacing:.5px}'+
'.ld-step-row{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--pri2);opacity:0;transition:opacity .3s;background:var(--panel);border:1px solid var(--border);padding:5px 12px}'+
'.ld-step-row.vis{opacity:1}'+
/* RESTORE */
'#axpRB{display:none;background:#fffbeb;border-left:4px solid var(--gold);padding:11px 14px;margin-bottom:14px;animation:fadeDown .25s ease}'+
/* INFO BAR */
'.axpInfoBar{background:var(--white);border:1px solid var(--border);border-left:4px solid var(--pri);padding:9px 14px;margin-bottom:14px;display:none;align-items:center;gap:10px;flex-wrap:wrap;font-size:11.5px;color:var(--muted)}'+
'.axpInfoBar strong{color:var(--pri);font-weight:700}'+
/* CARD */
'.axpCard{background:var(--white);border:1px solid var(--border);padding:16px;margin-bottom:12px}'+
/* CARD TITLE */
'.axpCT{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border);padding-bottom:9px}'+
'.axpCT i{color:var(--pri);font-size:13px}'+
'.ct-num{width:19px;height:19px;background:var(--pri);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;flex-shrink:0}'+
'.ct-done{background:var(--grn)!important}'+
/* CHIPS */
'.axpChips{display:flex;flex-wrap:wrap;gap:7px}'+
'.axpChip{padding:7px 13px;border:1px solid var(--border);background:var(--panel);color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;transition:background .1s,color .1s,border-color .1s;user-select:none}'+
'.axpChip:hover{border-color:var(--pri);color:var(--pri);background:#eef0fb}'+
'.axpChip.on{background:var(--pri);border-color:var(--pri);color:#fff}'+
/* BUTTONS */
'.axpBtn{display:inline-flex;align-items:center;gap:7px;padding:8px 16px;font-size:12.5px;font-weight:700;border:1px solid transparent;cursor:pointer;transition:background .1s,color .1s;letter-spacing:.2px;text-decoration:none}'+
'.axpBP{background:var(--pri);color:#fff;border-color:var(--pri)}'+
'.axpBP:hover{background:var(--pri2)}'+
'.axpBP:disabled{opacity:.45;cursor:not-allowed}'+
'.axpBD{background:transparent;color:var(--pri);border-color:var(--pri)}'+
'.axpBD:hover{background:var(--pri);color:#fff}'+
'.axpBG{background:var(--panel);color:var(--muted);border-color:var(--border)}'+
'.axpBG:hover{background:var(--border);color:var(--text)}'+
'.axpBGold{background:var(--gold);color:var(--pri3);border-color:var(--gold3)}'+
'.axpBGold:hover{background:var(--gold2)}'+
'.axpSm{padding:5px 11px;font-size:11px}'+
/* PROGRESS */
'.axpPMeta{display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:3px;color:var(--muted)}'+
'.axpPMeta span:last-child{color:var(--pri);font-weight:800}'+
'.axpPBar{background:var(--border);height:4px;overflow:hidden;margin-bottom:10px}'+
'.axpPFill{height:100%;background:linear-gradient(90deg,var(--pri),var(--gold));transition:width .5s ease}'+
/* CONTEXT TAGS */
'.ctx-tag{font-size:10.5px;font-weight:700;padding:3px 9px;letter-spacing:.2px}'+
'.ctx-cls{background:#e8eaf8;color:var(--pri);border:1px solid #c0c6e8}'+
'.ctx-exam{background:#fef8e7;color:var(--gold3);border:1px solid #e8d080}'+
'.ctx-sub{background:#eef0fb;color:var(--pri2);border:1px solid #c0c6e8}'+
/* STUDENT BANNER */
'.axpStuBnr{background:var(--pri);padding:16px 18px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}'+
'.stu-name{font-size:18px;font-weight:900;color:#fff;line-height:1.1}'+
'.stu-meta{font-size:11px;color:rgba(255,255,255,.5);margin-top:4px}'+
'.stu-cand{font-family:\'Courier New\',monospace;font-size:11.5px;font-weight:700;background:var(--gold);color:var(--pri3);padding:4px 11px;letter-spacing:.5px}'+
'.stu-pos{font-size:10px;color:rgba(255,255,255,.4);margin-top:4px;text-align:right}'+
/* SCORE INPUT */
'.axpScoreWrap{text-align:center;padding:22px 0 12px}'+
'.axpScoreInput{width:155px;height:76px;font-size:40px;font-weight:900;text-align:center;background:var(--panel);border:2px solid var(--border);color:var(--text);outline:none;transition:border-color .12s;-moz-appearance:textfield}'+
'.axpScoreInput::-webkit-outer-spin-button,.axpScoreInput::-webkit-inner-spin-button{-webkit-appearance:none}'+
'.axpScoreInput:focus{border-color:var(--pri);border-width:2px}'+
'.axpScoreInput.gA{border-color:#1a7a4a;color:#1a7a4a}'+
'.axpScoreInput.gB{border-color:var(--pri2);color:var(--pri2)}'+
'.axpScoreInput.gC{border-color:var(--gold3);color:var(--gold3)}'+
'.axpScoreInput.gD{border-color:#d46b08;color:#d46b08}'+
'.axpScoreInput.gF{border-color:var(--red);color:var(--red)}'+
'.axpGradeBadge{display:inline-block;font-size:30px;font-weight:900;margin-top:7px;min-width:44px;transition:color .12s}'+
/* NAV */
'.axpNav{display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap;margin-top:12px}'+
/* TEACHER BADGE hidden */
'.axpTchrBadge{display:none!important}'+
/* SUCCESS */
'.axpSuccessBnr{background:var(--pri);padding:26px;text-align:center;margin-bottom:14px}'+
'.suc-icon{font-size:42px;color:var(--gold);margin-bottom:7px;display:block}'+
'.suc-title{font-size:19px;font-weight:900;color:#fff;margin-bottom:5px}'+
'.suc-sub{font-size:11.5px;color:rgba(255,255,255,.6);line-height:1.6}'+
/* ACTION GRID */
'.axpActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}'+
'.axpABtn{display:flex;flex-direction:column;align-items:center;gap:6px;padding:16px 10px;cursor:pointer;border:1px solid var(--border);background:var(--white);color:var(--muted);transition:background .1s,color .1s,border-color .1s;font-size:11px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;user-select:none}'+
'.axpABtn i{font-size:20px}'+
'.axpABtn:hover{border-color:var(--pri);color:var(--pri);background:#eef0fb}'+
'.axpABtn.prime{border-color:var(--pri);background:var(--pri);color:#fff}'+
'.axpABtn.prime:hover{background:var(--pri2);border-color:var(--pri2)}'+
/* TABLE */
'.axpTbl{width:100%;border-collapse:collapse;font-size:12px}'+
'.axpTbl th{background:var(--pri);color:#fff;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;padding:9px 11px;text-align:left;white-space:nowrap}'+
'.axpTbl th:not(:nth-child(2)){text-align:center}'+
'.axpTbl td{padding:8px 11px;border-bottom:1px solid var(--border);color:var(--text);font-size:12px}'+
'.axpTbl td:not(:nth-child(2)){text-align:center}'+
'.axpTbl tbody tr:nth-child(even){background:var(--panel)}'+
'.cand-col{font-family:\'Courier New\',monospace!important;font-size:11px!important;color:var(--pri)!important;font-weight:700!important}'+
'.score-col{font-weight:800!important;font-size:13px!important}'+
/* GRADE GRID */
'.axpGGrid{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;margin-bottom:14px}'+
'.axpGCell{text-align:center;padding:11px 4px;background:var(--panel);border:1px solid var(--border)}'+
'.axpGCell .gv{font-size:22px;font-weight:900}'+
'.axpGCell .gl{font-size:9px;font-weight:800;margin-top:3px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted)}'+
/* DIVIDER */
'.divider{height:1px;background:var(--border);margin:12px 0}'+
/* ERROR */
'#axpErr{display:none;background:#fef2f2;border-left:4px solid var(--red);padding:16px;margin:14px 0}'+
'#axpErr .err-title{font-size:13.5px;font-weight:800;margin-bottom:5px;color:var(--red);display:flex;align-items:center;gap:6px}'+
'#axpErr .err-msg{font-size:12px;color:#7a2020;line-height:1.7}'+
/* MODAL */
'#axpMod{display:none;position:fixed;inset:0;z-index:9999;background:rgba(10,15,40,.65);align-items:center;justify-content:center;padding:14px}'+
'#axpMod.open{display:flex}'+
'#axpMBox{background:var(--white);max-width:440px;width:100%;border:1px solid var(--border);animation:popIn .16s ease}'+
'#axpMHd{background:var(--pri);padding:14px 18px;display:flex;align-items:center;gap:10px;border-bottom:3px solid var(--gold)}'+
'#axpMHd .mhi{font-size:20px}'+
'#axpMHd .mht{font-size:13.5px;font-weight:800;color:#fff;flex:1}'+
'#axpMHd .mhx{background:none;border:none;color:rgba(255,255,255,.6);font-size:20px;cursor:pointer;line-height:1;padding:0}'+
'#axpMHd .mhx:hover{color:#fff}'+
'#axpMBd{padding:16px 18px;font-size:12.5px;color:var(--muted);line-height:1.75}'+
'#axpMFt{padding:8px 18px 16px;display:flex;gap:7px;justify-content:flex-end;border-top:1px solid var(--border)}'+
/* TOAST */
'#axpToast{display:none;position:fixed;bottom:22px;right:16px;z-index:9999;padding:10px 16px;font-size:12px;font-weight:700;align-items:center;gap:8px;border-left:4px solid currentColor}'+
/* FEEDBACK PILL */
'.axpFeedPill{display:none;position:fixed;top:70px;right:18px;z-index:8000;padding:9px 14px;font-size:12px;font-weight:700;align-items:center;gap:8px;min-width:180px;max-width:280px;animation:pillIn .22s ease}'+
'@keyframes pillIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}'+
'@keyframes pillOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(18px)}}'+
'.axpStuBnr.flash-back{animation:flashBack .5s ease}'+
'@keyframes flashBack{0%{background:var(--pri)}40%{background:#5b21b6}100%{background:var(--pri)}}'+
'.axpStuBnr.flash-fwd{animation:flashFwd .4s ease}'+
'@keyframes flashFwd{0%{background:var(--pri)}40%{background:#1a7a4a}100%{background:var(--pri)}}'+
'.stu-saved{font-size:10px;font-weight:800;padding:3px 8px;letter-spacing:.5px;text-transform:uppercase;margin-top:4px;display:inline-block}'+
'.stu-saved.yes{background:rgba(16,185,129,.2);color:#10b981;border:1px solid rgba(16,185,129,.4)}'+
'.stu-saved.no{background:rgba(255,255,255,.07);color:rgba(255,255,255,.3);border:1px solid rgba(255,255,255,.1)}'+
'.axpKbHint{text-align:center;font-size:10.5px;color:var(--muted);margin-top:7px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap}'+
'.axpKbHint kbd{background:var(--panel);border:1px solid var(--border);padding:2px 6px;font-size:10px;font-family:monospace;color:var(--text)}'+
'.axpMissingBadge{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;padding:7px 12px;background:#fff8e1;border:1px solid #ffe082;color:#7a5800;margin-bottom:12px}'+
/* UTILITY */
'.axpH{display:none!important}'+
/* RESPONSIVE ≤768px sidebar drawer */
'@media(max-width:768px){'+
'#axpMenuBtn{display:flex}'+
'#axpSidebar{position:fixed;top:59px;left:0;bottom:0;z-index:260;transform:translateX(-100%);transition:transform .22s ease;height:auto}'+
'#axpSidebar.open{transform:translateX(0)}'+
'#axpSbOverlay.open{display:block}'+
'#axpContent{padding:14px 13px 70px}'+
'}'+
/* ≤500px tight layout */
'@media(max-width:500px){'+
'#axpHdr{height:48px;padding:0 10px;gap:9px}'+
'.hdr-name{font-size:11px;letter-spacing:.8px}.hdr-tag{display:none}.hdr-div{display:none}'+
'.hdr-sname{font-size:11px}.hdr-smeta{display:none}'+
'#axpContent{padding:10px 9px 60px}'+
'.pg-title{font-size:13.5px}.pg-sub{font-size:10.5px}'+
'.axpCard{padding:10px;margin-bottom:9px}'+
'.axpCT{font-size:9.5px;margin-bottom:8px;padding-bottom:7px}'+
'.axpChip{padding:5px 9px;font-size:11px}'+
'.axpBtn{padding:6px 10px;font-size:11px}'+
'.axpBP,.axpBD,.axpBG,.axpBGold{padding:6px 10px;font-size:11px}'+
'.axpScoreInput{width:130px;height:66px;font-size:34px}'+
'.axpGradeBadge{font-size:24px}'+
'.stu-name{font-size:14px}.stu-meta{font-size:10px}'+
'.axpStuBnr{padding:10px 12px}'+
'.stu-cand{font-size:10.5px;padding:3px 8px}'+
'.axpGGrid{grid-template-columns:repeat(3,1fr);gap:5px}'+
'.axpGCell{padding:8px 3px}.axpGCell .gv{font-size:16px}.axpGCell .gl{font-size:8.5px}'+
'.axpActions{gap:6px}'+
'.axpABtn{padding:10px 6px;font-size:9.5px}.axpABtn i{font-size:17px}'+
'.axpNav{flex-direction:column}.axpNav .axpBtn{width:100%;justify-content:center}'+
'.axpTbl{font-size:10.5px}.axpTbl th{padding:7px 5px;font-size:9px}.axpTbl td{padding:5px}'+
'.axpPMeta{font-size:10px}'+
'.axpScoreWrap{padding:16px 0 10px}'+
'.suc-title{font-size:16px}.suc-icon{font-size:36px}'+
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
/* HEADER */
'<div id="axpHdr">'+
  '<button id="axpMenuBtn" onclick="axpToggleSidebar()"><i class="bi bi-list"></i></button>'+
  '<div class="hdr-logo">'+
    '<div class="hdr-icon">A</div>'+
    '<div class="hdr-brand"><span class="hdr-brand-ax">ACADEMIX</span><span class="hdr-brand-pt">POINT</span></div>'+
  '</div>'+
  '<div class="hdr-index-block">'+
    '<div class="hdr-index-label">School Code</div>'+
    '<div class="hdr-index-value" id="axpHdrIndex">S—</div>'+
  '</div>'+
  '<div class="hdr-info"><div class="hdr-sname" id="axpHdrName">Loading…</div><div class="hdr-smeta" id="axpHdrMeta"></div></div>'+
  '<div class="hdr-badge" id="axpHdrBadge"><i class="bi bi-shield-check"></i>ACTIVE</div>'+
'</div>'+

/* BODY */
'<div id="axpBody">'+

/* SIDEBAR */
'<div id="axpSidebar">'+
  '<div class="sb-school">'+
    '<div class="sb-idx">S<span id="axpSbDigits">—</span></div>'+
    '<div class="sb-school-code" id="axpSbCode">Loading…</div>'+
  '</div>'+
  '<div class="sb-section">Marks Entry</div>'+
  '<div class="sb-item active" id="sbNav_entry" onclick="axpSbNav('entry')" style="cursor:pointer"><i class="bi bi-pencil-square"></i><span>Enter Marks</span></div>'+
  '<div class="sb-item" id="sbNav_students" onclick="axpSbNav('students')" style="cursor:pointer"><i class="bi bi-people"></i><span>Students</span></div>'+
  '<div class="sb-item" id="sbNav_progress" onclick="axpSbNav('progress')" style="cursor:pointer"><i class="bi bi-bar-chart"></i><span>Progress</span></div>'+
  '<div class="sb-section">Actions</div>'+
  '<div class="sb-item" id="sbNav_results" onclick="axpSbNav('results')" style="cursor:pointer"><i class="bi bi-table"></i><span>View Results</span></div>'+
  '<div class="sb-item" onclick="axpExportPDF()" style="cursor:pointer"><i class="bi bi-file-pdf"></i><span>Export PDF</span></div>'+
  '<div class="sb-item" onclick="axpExportCSV()" style="cursor:pointer"><i class="bi bi-download"></i><span>Export CSV</span></div>'+
  '<div class="sb-section">Session</div>'+
  '<div class="sb-item" onclick="axpStartNew()" style="cursor:pointer"><i class="bi bi-plus-circle"></i><span>New Entry</span></div>'+
  '<div class="sb-item" onclick="axpClearCache()" style="cursor:pointer"><i class="bi bi-trash3"></i><span>Clear Cache</span></div>'+
  '<div class="sb-year">Year: <strong id="axpSbYear">—</strong></div>'+
'</div>'+
'<div id="axpSbOverlay" onclick="axpCloseSidebar()"></div>'+

/* CONTENT */
'<div id="axpContent">'+

  '<div class="pg-title" id="axpPgTitle">Marks Entry</div>'+
  '<div class="pg-sub" id="axpPgSub">Select class, exam type and subject to begin entering marks.</div>'+
  '<div id="axpPanelStudents" class="axpH">'+
    '<div class="axpCard">'+
      '<div class="axpCT"><i class="bi bi-people"></i> Students List'+
        '<span id="axpStdCount" style="margin-left:auto;font-size:10px;font-weight:700;background:var(--pri);color:#fff;padding:2px 8px"></span>'+
      '</div>'+
      '<div id="axpStdEmpty" style="font-size:12.5px;color:var(--muted);padding:8px 0">Load students first by selecting class, exam type and subject.</div>'+
      '<div style="overflow-x:auto"><table class="axpTbl" id="axpStdTbl" style="display:none">'+
        '<thead><tr><th>#</th><th>Cand. No.</th><th>Student Name</th><th>Sex</th><th>Mark</th><th>Grade</th></tr></thead>'+
        '<tbody id="axpStdBody"></tbody>'+
      '</table></div>'+
    '</div>'+
  '</div>'+
  '<div id="axpPanelProgress" class="axpH">'+
    '<div class="axpCard">'+
      '<div class="axpCT"><i class="bi bi-bar-chart"></i> Entry Progress</div>'+
      '<div id="axpProgEmpty" style="font-size:12.5px;color:var(--muted);padding:8px 0">Load students first.</div>'+
      '<div id="axpProgContent" style="display:none">'+
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">'+
          '<div class="axpCard" style="text-align:center;margin:0;background:var(--panel)">'+
            '<div style="font-size:26px;font-weight:900;color:var(--pri)" id="axpProgTotal">0</div>'+
            '<div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;margin-top:4px">Total</div>'+
          '</div>'+
          '<div class="axpCard" style="text-align:center;margin:0;background:#f0fdf4">'+
            '<div style="font-size:26px;font-weight:900;color:#1a7a4a" id="axpProgFilled">0</div>'+
            '<div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;margin-top:4px">Entered</div>'+
          '</div>'+
          '<div class="axpCard" style="text-align:center;margin:0;background:#fff8e1">'+
            '<div style="font-size:26px;font-weight:900;color:#8a6800" id="axpProgMissing">0</div>'+
            '<div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase;margin-top:4px">Missing</div>'+
          '</div>'+
        '</div>'+
        '<div class="axpPMeta"><span>Overall Progress</span><span id="axpProgPct">0%</span></div>'+
        '<div class="axpPBar"><div class="axpPFill" id="axpProgBar" style="width:0%"></div></div>'+
        '<div style="margin-top:14px">'+
          '<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:8px">Grade Distribution</div>'+
          '<div style="display:flex;gap:6px;flex-wrap:wrap" id="axpProgGrades"></div>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>'+
  '<div id="axpPanelResults" class="axpH">'+
    '<div class="axpCard">'+
      '<div class="axpCT"><i class="bi bi-table"></i> Results Table</div>'+
      '<div id="axpResEmpty" style="font-size:12.5px;color:var(--muted);padding:8px 0">Submit marks first to view results here.</div>'+
      '<div id="axpResContent" style="display:none">'+
        '<div class="axpGGrid" id="axpResGGrid"></div>'+
        '<div class="divider"></div>'+
        '<div style="overflow-x:auto"><table class="axpTbl"><thead><tr>'+
          '<th>Cand. No.</th><th>Student Name</th><th>Sex</th><th>Score</th><th>Grade</th><th>Pos.</th>'+
        '</tr></thead><tbody id="axpResTbody"></tbody></table></div>'+
      '</div>'+
    '</div>'+
  '</div>'+

  /* LOADER */
  '<div id="axpLd">'+
    '<div class="ld-ring"></div>'+
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

    /* RESTORE */
    '<div id="axpRB">'+
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">'+
        '<i class="bi bi-cloud-arrow-down" style="font-size:20px;color:var(--gold3);flex-shrink:0"></i>'+
        '<div style="flex:1"><div style="font-weight:700;font-size:12.5px;color:var(--gold3)">Unsaved session found</div><div style="font-size:11.5px;color:#78350f;margin-top:2px" id="axpRI"></div></div>'+
        '<button onclick="axpRestoreSession()" class="axpBtn axpBP axpSm"><i class="bi bi-arrow-counterclockwise"></i> Restore</button>'+
        '<button onclick="axpDismissRestore()" class="axpBtn axpBG axpSm">Dismiss</button>'+
      '</div>'+
    '</div>'+

    /* INFO BAR */
    '<div class="axpInfoBar" id="axpInfoBar">'+
      '<i class="bi bi-building" style="color:var(--pri);font-size:14px"></i>'+
      '<strong id="axpIBName"></strong>'+
      '<span style="color:var(--border)">·</span>'+
      '<span>Code: <strong id="axpIBCode"></strong></span>'+
      '<span style="color:var(--border)">·</span>'+
      '<span>Year: <strong id="axpIBYear"></strong></span>'+
    '</div>'+

    /* WIZARD */
    '<div id="axpWizard">'+
      '<div class="axpCard" id="axpS1">'+
        '<div class="axpCT"><div class="ct-num">1</div><i class="bi bi-people"></i> Select Class</div>'+
        '<div class="axpChips" id="axpCC"></div>'+
      '</div>'+
      '<div class="axpCard axpH" id="axpS2">'+
        '<div class="axpCT"><div class="ct-num">2</div><i class="bi bi-journal-bookmark"></i> Select Exam Type</div>'+
        '<div class="axpChips" id="axpEC"></div>'+
      '</div>'+
      '<div class="axpCard axpH" id="axpS3">'+
        '<div class="axpCT"><div class="ct-num">3</div><i class="bi bi-book"></i> Select Subject</div>'+
        '<div class="axpChips" id="axpSubC"></div>'+
        '<div id="axpNoSubMsg" style="display:none;font-size:11.5px;color:var(--muted);margin-top:8px"></div>'+
      '</div>'+
      '<div id="axpLW" class="axpH" style="text-align:center;margin:6px 0 8px">'+
        '<button class="axpBtn axpBP" id="axpLB" onclick="axpLoadStudents()" style="padding:10px 28px;font-size:13px">'+
          '<i class="bi bi-cloud-download"></i> Load Students'+
        '</button>'+
      '</div>'+
    '</div>'+

    /* ENTRY */
    '<div id="axpFeedPill"></div>'+
  '<div id="axpEntry" class="axpH">'+
      '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:7px;margin-bottom:14px">'+
        '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">'+
          '<span class="ctx-tag ctx-cls" id="axpCtxCls"></span>'+
          '<span style="color:var(--border);font-size:14px">·</span>'+
          '<span class="ctx-tag ctx-exam" id="axpCtxExam"></span>'+
          '<span style="color:var(--border);font-size:14px">·</span>'+
          '<span class="ctx-tag ctx-sub" id="axpCtxSub"></span>'+
        '</div>'+
        '<button onclick="axpStartNew()" class="axpBtn axpBG axpSm"><i class="bi bi-arrow-left"></i> Change</button>'+
      '</div>'+
      '<div id="axpTchrBnr" class="axpTchrBadge axpH"><i class="bi bi-person-badge-fill"></i><div id="axpTchrTxt"></div></div>'+
      '<div class="axpPMeta"><span id="axpPL">0 / 0 filled</span><span id="axpPP">0%</span></div>'+
      '<div class="axpPBar"><div class="axpPFill" id="axpPF" style="width:0%"></div></div>'+
      '<div id="axpMissingBadge" class="axpMissingBadge axpH"><i class="bi bi-exclamation-circle"></i><span id="axpMissingTxt"></span></div>'+
      '<div class="axpStuBnr" id="axpStuBnr">'+
        '<div>'+
          '<div class="stu-name" id="axpStuName">—</div>'+
          '<div class="stu-meta" id="axpStuMeta"></div>'+
          '<div class="stu-saved no" id="axpStuSaved">Not entered yet</div>'+
        '</div>'+
        '<div style="text-align:right"><div class="stu-cand" id="axpStuCand"></div><div class="stu-pos" id="axpStuPos"></div></div>'+
      '</div>'+
      '<div class="axpScoreWrap">'+
        '<input type="number" class="axpScoreInput" id="axpSI" min="0" max="100" placeholder="—" oninput="axpOnScore(this)" onkeydown="axpScoreKey(event)">'+
        '<div><span class="axpGradeBadge" id="axpGBdg" style="color:var(--muted)">—</span></div>'+
        '<div style="font-size:11.5px;color:var(--muted);margin-top:5px" id="axpPMk"></div>'+
        '<div class="axpKbHint">'+
          '<span><kbd>Enter</kbd> or <kbd>↓</kbd> next</span>'+
          '<span><kbd>↑</kbd> prev</span>'+
          '<span><kbd>Tab</kbd> next · <kbd>Shift+Tab</kbd> prev</span>'+
        '</div>'+
      '</div>'+
      '<div class="axpNav">'+
        '<button class="axpBtn axpBG" onclick="axpPrev()"><i class="bi bi-chevron-left"></i> Prev</button>'+
        '<button class="axpBtn axpBG" onclick="axpSkip()"><i class="bi bi-skip-forward"></i> Skip</button>'+
        '<button class="axpBtn axpBD" onclick="axpNext()">Next <i class="bi bi-chevron-right"></i></button>'+
      '</div>'+
      '<div style="margin-top:18px;text-align:center">'+
        '<button class="axpBtn axpBP" id="axpSubBtn" onclick="axpSubmitAll()" style="padding:11px 36px;font-size:13.5px">'+
          '<i class="bi bi-send-fill"></i> Submit All Marks'+
        '</button>'+
      '</div>'+
    '</div>'+

    /* DONE */
    '<div id="axpDone" class="axpH">'+
      '<div class="axpSuccessBnr">'+
        '<span class="suc-icon"><i class="bi bi-check-circle-fill"></i></span>'+
        '<div class="suc-title">Marks Submitted Successfully</div>'+
        '<div class="suc-sub" id="axpSucSub"></div>'+
      '</div>'+
      '<div class="axpActions">'+
        '<div class="axpABtn prime" onclick="axpViewSubmitted()"><i class="bi bi-table"></i><span>View Submitted Data</span></div>'+
        '<div class="axpABtn" onclick="axpExportPDF()"><i class="bi bi-file-pdf"></i><span>Export PDF</span></div>'+
        '<div class="axpABtn" onclick="axpExportCSV()"><i class="bi bi-download"></i><span>Download CSV</span></div>'+
        '<div class="axpABtn" onclick="axpReenter()"><i class="bi bi-pencil-square"></i><span>Re-enter Marks</span></div>'+
      '</div>'+
      '<div style="text-align:center">'+
        '<button class="axpBtn axpBD" onclick="axpStartNew()" style="padding:10px 28px;font-size:13px">'+
          '<i class="bi bi-plus-circle"></i> Enter New Subject'+
        '</button>'+
      '</div>'+
      '<div id="axpSubmittedView" class="axpH" style="margin-top:16px">'+
        '<div class="axpCard">'+
          '<div class="axpCT"><i class="bi bi-table"></i> Submitted Results</div>'+
          '<div class="axpGGrid" id="axpGGrid"></div>'+
          '<div class="divider"></div>'+
          '<div style="overflow-x:auto"><table class="axpTbl"><thead><tr>'+
            '<th>Cand. No.</th><th>Student Name</th><th>Sex</th><th>Score</th><th>Grade</th><th>Pos.</th>'+
          '</tr></thead><tbody id="axpTbody"></tbody></table></div>'+
        '</div>'+
      '</div>'+
    '</div>'+

  '</div>'+/* /main */
'</div>'+/* /content */
'</div>'+/* /body */

/* MODAL */
'<div id="axpMod"><div id="axpMBox">'+
  '<div id="axpMHd"><div class="mhi" id="axpMIcon"></div><div class="mht" id="axpMTitle"></div><button class="mhx" onclick="axpMClose()">×</button></div>'+
  '<div id="axpMBd"></div><div id="axpMFt"></div>'+
'</div></div>'+
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

  /* SIDEBAR NAVIGATION */
  window.axpSbNav=function(panel){
    /* Update active state */
    var items=['entry','students','progress','results'];
    items.forEach(function(p){
      var el=g('sbNav_'+p);
      if(el)el.classList.toggle('active',p===panel);
    });
    /* Show/hide panels */
    var panels=['axpWizard','axpEntry','axpDone','axpPanelStudents','axpPanelProgress','axpPanelResults'];
    panels.forEach(function(id){var el=g(id);if(el)el.classList.add('axpH');});
    /* Title map */
    var titles={entry:'Marks Entry',students:'Students List',progress:'Entry Progress',results:'Results Table'};
    var subs={entry:'Select class, exam type and subject to begin entering marks.',
              students:'All students loaded for the current session.',
              progress:'Track how many marks have been entered.',
              results:'View submitted marks and grade distribution.'};
    var pt=g('axpPgTitle'),ps=g('axpPgSub');
    if(pt)pt.textContent=titles[panel]||'Marks Entry';
    if(ps)ps.textContent=subs[panel]||'';

    if(panel==='entry'){
      /* Re-show whatever was visible before */
      if(S.submitted){showEl('axpDone');}
      else if(S.students.length){showEl('axpEntry');}
      else{showEl('axpWizard');}

    }else if(panel==='students'){
      showEl('axpPanelStudents');
      var tbl=g('axpStdTbl'),empty=g('axpStdEmpty'),body=g('axpStdBody'),cnt=g('axpStdCount');
      if(!S.students.length){
        if(empty)empty.style.display='block';
        if(tbl)tbl.style.display='none';
      }else{
        if(empty)empty.style.display='none';
        if(tbl)tbl.style.display='table';
        if(cnt)cnt.textContent=S.students.length+' students';
        if(body)body.innerHTML=S.students.map(function(s,i){
          var sc=S.marks[s.name],gr=calcGrade(sc);
          var markCell=sc!==undefined?'<strong style="color:'+gr.c+'">'+sc+'</strong>':'<span style="color:#aaa">—</span>';
          var gradeCell=sc!==undefined?'<strong style="color:'+gr.c+'">'+gr.g+'</strong>':'<span style="color:#aaa">—</span>';
          return'<tr>'+
            '<td style="color:var(--muted);font-size:11px">'+(i+1)+'</td>'+
            '<td class="cand-col">'+esc(candNo(i))+'</td>'+
            '<td style="font-weight:600">'+esc(s.name)+'</td>'+
            '<td>'+(s.gender==='F'?'F':'M')+'</td>'+
            '<td>'+markCell+'</td>'+
            '<td>'+gradeCell+'</td>'+
          '</tr>';
        }).join('');
      }

    }else if(panel==='progress'){
      showEl('axpPanelProgress');
      var pe=g('axpProgEmpty'),pc=g('axpProgContent');
      if(!S.students.length){
        if(pe)pe.style.display='block';
        if(pc)pc.style.display='none';
      }else{
        if(pe)pe.style.display='none';
        if(pc)pc.style.display='block';
        var total=S.students.length;
        var filled=Object.keys(S.marks).length;
        var miss=total-filled;
        var pct=total>0?Math.round(filled/total*100):0;
        var el_t=g('axpProgTotal'),el_f=g('axpProgFilled'),el_m=g('axpProgMissing');
        var el_pct=g('axpProgPct'),el_bar=g('axpProgBar');
        if(el_t)el_t.textContent=total;
        if(el_f)el_f.textContent=filled;
        if(el_m)el_m.textContent=miss;
        if(el_pct)el_pct.textContent=pct+'%';
        if(el_bar)el_bar.style.width=pct+'%';
        /* Grade distribution */
        var gc={A:0,B:0,C:0,D:0,F:0};
        var gc2={A:'#1a7a4a',B:'var(--pri)',C:'#8a6800',D:'#d46b08',F:'var(--red)'};
        S.students.forEach(function(s){var sc=S.marks[s.name];if(sc!==undefined){var gr=calcGrade(sc);if(gc[gr.g]!==undefined)gc[gr.g]++;}});
        var pg=g('axpProgGrades');
        if(pg)pg.innerHTML=Object.keys(gc).map(function(gr){
          return'<div style="text-align:center;padding:10px 14px;background:var(--panel);border:1px solid var(--border);min-width:60px">'+
            '<div style="font-size:22px;font-weight:900;color:'+gc2[gr]+'">'+gc[gr]+'</div>'+
            '<div style="font-size:9.5px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-top:3px">Grade '+gr+'</div>'+
          '</div>';
        }).join('');
      }

    }else if(panel==='results'){
      showEl('axpPanelResults');
      var re=g('axpResEmpty'),rc=g('axpResContent');
      if(!S.submitted||!Object.keys(S.marks).length){
        if(re)re.style.display='block';
        if(rc)rc.style.display='none';
      }else{
        if(re)re.style.display='none';
        if(rc)rc.style.display='block';
        /* Grade grid */
        var gcs={A:0,B:0,C:0,D:0,F:0,'—':0};
        var gc2c={A:'#1a7a4a',B:'var(--pri)',C:'#8a6800',D:'#d46b08',F:'var(--red)','—':'var(--muted)'};
        var rows=S.students.map(function(s,i){
          var sc=S.marks[s.name],gr=calcGrade(sc);
          gcs[gr.g]=(gcs[gr.g]||0)+1;
          return{cand:candNo(i),name:s.name,gender:s.gender,score:sc,gr:gr.g,col:gr.c};
        });
        var ranked=rows.filter(function(r){return r.score!==undefined;}).slice().sort(function(a,b){return b.score-a.score;});
        var pm={},p=0,ls=null,lp=0;
        ranked.forEach(function(r){if(r.score!==ls){p=lp+1;ls=r.score;lp=p;}pm[r.name]=p;});
        var rgg=g('axpResGGrid');
        if(rgg)rgg.innerHTML=['A','B','C','D','F','—'].map(function(gr){
          return'<div class="axpGCell"><div class="gv" style="color:'+gc2c[gr]+'">'+(gcs[gr]||0)+'</div><div class="gl">Grade '+gr+'</div></div>';
        }).join('');
        var rb=g('axpResTbody');
        if(rb)rb.innerHTML=rows.map(function(r){
          return'<tr>'+
            '<td class="cand-col">'+esc(r.cand)+'</td>'+
            '<td style="font-weight:500">'+esc(r.name)+'</td>'+
            '<td>'+(r.gender==='F'?'F':'M')+'</td>'+
            '<td class="score-col" style="color:'+r.col+'">'+(r.score!==undefined?r.score:'—')+'</td>'+
            '<td><strong style="color:'+r.col+';font-size:14px">'+r.gr+'</strong></td>'+
            '<td style="font-weight:700">'+(pm[r.name]||'—')+'</td>'+
          '</tr>';
        }).join('');
      }
    }
    /* Close sidebar on mobile after navigation */
    if(window.innerWidth<=768)axpCloseSidebar();
  };

  /* SIDEBAR TOGGLE */
  window.axpToggleSidebar=function(){
    var sb=g('axpSidebar'),ov=g('axpSbOverlay');
    if(sb){sb.classList.toggle('open');}
    if(ov){ov.classList.toggle('open');}
  };
  window.axpCloseSidebar=function(){
    var sb=g('axpSidebar'),ov=g('axpSbOverlay');
    if(sb)sb.classList.remove('open');
    if(ov)ov.classList.remove('open');
  };

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

      /* Header */
      g('axpHdrName').textContent=S.schoolName;
      g('axpHdrMeta').textContent=S.meta.schoolType||'SECONDARY SCHOOL';
      var hdrIdx=g('axpHdrIndex'); if(hdrIdx)hdrIdx.textContent='S'+S.digits;
      var badge=g('axpHdrBadge'); if(badge)badge.style.display='flex';
      /* Info bar */
      g('axpIBName').textContent=S.schoolName;
      g('axpIBCode').textContent='S'+S.digits;
      g('axpIBYear').textContent=S.year;
      g('axpInfoBar').style.display='flex';
      document.title='S'+S.digits+' · Marks Entry';
      /* Sidebar */
      var sbDig=g('axpSbDigits'); if(sbDig)sbDig.textContent=S.digits;
      var sbCode=g('axpSbCode'); if(sbCode)sbCode.textContent=S.schoolName;
      var sbYear=g('axpSbYear'); if(sbYear)sbYear.textContent=S.year;

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
      renderCard();
      saveCache();
      showPill('✅ '+students.length+' students loaded','success');
    }catch(ex){axpAlert('Load Error','Failed: '+ex.message,'danger');}
    finally{lb.disabled=false;lb.innerHTML='<i class="bi bi-cloud-download"></i> Load Students';}
  };

  /* ══════════════════════════════════════════════════════════════════════════ RENDER */
  function renderCard(dir){
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
    updateBadge(sc);
    /* saved chip */
    var chip=g('axpStuSaved');
    if(chip){if(sc!==undefined){chip.textContent='Saved: '+sc+' ('+calcGrade(sc).g+')';chip.className='stu-saved yes';}else{chip.textContent='Not entered yet';chip.className='stu-saved no';}}
    /* missing count */
    var miss=S.students.filter(function(st){return S.marks[st.name]===undefined;}).length;
    var mb=g('axpMissingBadge'),mt=g('axpMissingTxt');
    if(mb&&mt){if(miss>0){mt.textContent=miss+' student'+(miss===1?'':'s')+' still need'+(miss===1?'s':'')+' a mark';mb.classList.remove('axpH');}else{mb.classList.add('axpH');}}
    /* banner flash */
    var bnr=g('axpStuBnr');
    if(bnr&&dir){bnr.classList.remove('flash-back','flash-fwd');void bnr.offsetWidth;bnr.classList.add(dir==='back'?'flash-back':'flash-fwd');}
    g('axpPMk').textContent='';
    g('axpSI').focus(); g('axpSI').select();
  }

  function updateBadge(v){
    var gr=calcGrade(v),bdg=g('axpGBdg');
    bdg.textContent=gr.g; bdg.style.color=gr.c;
    g('axpSI').className='axpScoreInput'+(v!==null&&v!==undefined&&v!==''?' g'+gr.g:'');
  }

  /* ══════════════════════════════════════════════════════════════════════════ SCORE */
  window.axpOnScore=function(inp){
    var v=inp.value.trim();
    if(!v){updateBadge(null);
      var chip=g('axpStuSaved');if(chip){chip.textContent='Not entered yet';chip.className='stu-saved no';}
      return;
    }
    var n=parseInt(v);
    if(n>100){inp.value='100';n=100;}
    if(!isNaN(n)&&n>=0&&n<=100){
      S.marks[S.students[S.idx].name]=n;
      updateBadge(n); saveCache();
      var chip=g('axpStuSaved'),gr=calcGrade(n);
      if(chip){chip.textContent='Saved: '+n+' ('+gr.g+')';chip.className='stu-saved yes';}
      var miss=S.students.filter(function(s){return S.marks[s.name]===undefined;}).length;
      var mb=g('axpMissingBadge'),mt=g('axpMissingTxt');
      if(mb&&mt){if(miss>0){mt.textContent=miss+' student'+(miss===1?'':'s')+' still need'+(miss===1?'s':'')+' a mark';mb.classList.remove('axpH');}else{mb.classList.add('axpH');}}
    }
  };
  window.axpScoreKey=function(e){
    if(e.key==='Enter'||e.key==='ArrowDown'){e.preventDefault();axpNext();}
    if(e.key==='ArrowUp'){e.preventDefault();axpPrev();}
    if(e.key==='Tab'&&!e.shiftKey){e.preventDefault();axpNext();}
    if(e.key==='Tab'&&e.shiftKey){e.preventDefault();axpPrev();}
  };
  function saveCurrent(){
    var v=g('axpSI').value.trim();
    if(v!==''){var n=parseInt(v);if(!isNaN(n)&&n>=0&&n<=100)S.marks[S.students[S.idx].name]=n;}
  }
  window.axpNext=function(){
    var prevName=S.students[S.idx].name;
    saveCurrent();
    var wasSaved=S.marks[prevName]!==undefined;
    if(S.idx<S.students.length-1){
      S.idx++;
      renderCard(wasSaved?'fwd':null);
      if(wasSaved)showPill('Saved '+prevName+': '+S.marks[prevName]+' ('+calcGrade(S.marks[prevName]).g+')','success');
    }else{
      if(wasSaved)showPill('Saved '+prevName+': '+S.marks[prevName],'success');
      var miss=S.students.filter(function(s){return S.marks[s.name]===undefined;}).length;
      if(miss>0){axpAlert('End of List','Last student reached.<br><br><strong>'+miss+' student'+(miss===1?'':'s')+'</strong> still '+(miss===1?'has':'have')+' no mark.<br><br>Use <strong>Prev</strong> to go back, or click <strong>Submit All Marks</strong>.','warning');}
      else{axpAlert('All Done!','Every student has a mark. Click <strong>Submit All Marks</strong> to save.','success');}
    }
  };
  window.axpPrev=function(){
    var prevName=S.students[S.idx].name;
    saveCurrent();
    var wasSaved=S.marks[prevName]!==undefined;
    if(S.idx>0){
      S.idx--;
      var sc=S.marks[S.students[S.idx].name];
      renderCard('back');
      if(wasSaved)showPill('Saved '+prevName+' → going back','info');
      else showPill('Going back to '+S.students[S.idx].name+(sc!==undefined?' — mark: '+sc+' ('+calcGrade(sc).g+')':' — not entered yet'),'info');
    }else{showPill('Already at first student','info');}
  };
  window.axpSkip=function(){
    var name=S.students[S.idx].name;
    if(S.idx<S.students.length-1){S.idx++;renderCard();showPill('Skipped '+name,'warning');}
    else{showPill('Already at last student','info');}
  };

  /* ══════════════════════════════════════════════════════════════════════════ SUBMIT */
  window.axpSubmitAll=function(){
    saveCurrent();
    var payload=S.students.filter(function(s){return S.marks[s.name]!==undefined;}).map(function(s){return{name:s.name,score:S.marks[s.name]};});
    if(!payload.length){axpAlert('No Marks','Enter at least one score before submitting.','warning');return;}
    axpConfirm('Confirm Submission','Submit <strong>'+payload.length+'</strong> mark(s) for<br><strong>'+esc(S.subject)+'</strong> · '+esc(S.cls)+' · '+esc(S.examType),
    async function(){
      var btn=g('axpSubBtn'); btn.disabled=true;
      var spn='<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:7px"></span>';
      btn.innerHTML=spn+'Sending '+payload.length+' marks…';
      showPill('Connecting to server…','info');
      try{
        var res=await apiPost({mode:'teacherMarksEntry',schoolId:S.schoolId,year:S.year,examType:S.examType,'class':S.cls,subject:S.subject,'data[studentName]':payload.map(function(p){return p.name;}).join(','),'data[marks]':payload.map(function(p){return String(p.score);}).join(',')});
        if(res.status==='success'){
          S.submitted=true; clearCache();
          var saved=res.saved!==undefined?res.saved:payload.length;
          var unsaved=S.students.length-saved;
          g('axpSucSub').innerHTML='<strong style="color:var(--gold2);font-size:28px">'+saved+'</strong> marks saved<br>'+esc(S.subject)+' · '+esc(S.cls)+' · '+esc(S.examType)+(unsaved>0?'<br><span style="font-size:11px;opacity:.6">'+unsaved+' student(s) had no mark entered</span>':'');
          hideEl('axpEntry'); showEl('axpDone'); hideEl('axpSubmittedView');
          axpToast('✅ '+saved+' marks submitted!','success');
          if(res.notFound&&res.notFound.length)axpAlert('Partial Submit',saved+' saved. ⚠️ '+res.notFound.length+' not found in sheet:<br>'+res.notFound.slice(0,5).map(esc).join(', '),'warning');
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
  function showPill(msg,type){
    var cols={success:{bg:'#f0fdf4',brd:'#1a7a4a',tc:'#1a7a4a'},info:{bg:'#eff6ff',brd:'var(--pri)',tc:'var(--pri)'},warning:{bg:'#fffbeb',brd:'#8a6800',tc:'#8a6800'},danger:{bg:'#fef2f2',brd:'var(--red)',tc:'var(--red)'}};
    var c=cols[type]||cols.info;
    var el=g('axpFeedPill'); if(!el)return;
    clearTimeout(window._axpPT);
    el.style.cssText='display:flex;position:fixed;top:70px;right:18px;z-index:8000;padding:9px 14px;font-size:12px;font-weight:700;align-items:center;gap:8px;min-width:160px;max-width:290px;border-left:4px solid '+c.brd+';border-top:1px solid '+c.brd+';border-right:1px solid '+c.brd+';border-bottom:1px solid '+c.brd+';background:'+c.bg+';color:'+c.tc+';animation:pillIn .2s ease;line-height:1.3';
    el.textContent=msg;
    window._axpPT=setTimeout(function(){
      el.style.animation='pillOut .2s ease forwards';
      setTimeout(function(){el.style.display='none';},210);
    },2400);
  }

  function axpToast(msg,type){
    var bg={success:'#1a3a2e',danger:'#3a1a1a',warning:'#3a2800',info:'#1a2040'};
    var brd={success:'#1a7a4a',danger:'var(--red)',warning:'#8a6800',info:'var(--pri)'};
    var tc={success:'#6ee7b7',danger:'#fca5a5',warning:'#fcd34d',info:'#a5b4fc'};
    var el=g('axpToast');
    el.style.cssText='display:flex;position:fixed;bottom:24px;right:18px;z-index:9999;padding:11px 18px;font-size:12.5px;font-weight:700;align-items:center;gap:8px;border-left:4px solid '+(brd[type]||brd.info)+';border-top:1px solid '+(brd[type]||brd.info)+';border-right:1px solid '+(brd[type]||brd.info)+';border-bottom:1px solid '+(brd[type]||brd.info)+';background:'+(bg[type]||bg.info)+';color:'+(tc[type]||tc.info)+';animation:popIn .2s ease;letter-spacing:.2px';
    el.textContent=msg;
    clearTimeout(window._axpTT);
    window._axpTT=setTimeout(function(){el.style.display='none';},3500);
  }

})();
