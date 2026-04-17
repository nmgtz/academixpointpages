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
    students:[], marks:{}, serverMarks:{}, idx:0, submitted:false, allTeachers:[]
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
    var wl=['axp-teacher-marks','teachersfeedingarea','jspdf','bootstrap-icons','xlsx','SheetJS'];
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
'#axpHdr{background:var(--pri);height:54px;display:flex;align-items:center;padding:0;gap:0;position:sticky;top:0;z-index:300;border-bottom:3px solid var(--gold);flex-shrink:0;overflow:hidden}'+
'#axpMenuBtn{background:none;border:none;color:#fff;font-size:20px;cursor:pointer;width:48px;height:54px;display:none;align-items:center;justify-content:center;flex-shrink:0;border-right:1px solid rgba(255,255,255,.1)}'+
'.hdr-logo{display:flex;align-items:center;gap:10px;padding:0 18px;height:54px;border-right:1px solid rgba(255,255,255,.12);flex-shrink:0}'+
'.hdr-icon{width:32px;height:32px;background:var(--gold);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:var(--pri3);flex-shrink:0}'+
'.hdr-brand{display:flex;align-items:baseline;gap:0;flex-shrink:0;line-height:1}'+
'.hdr-brand-ax{font-size:14px;font-weight:900;color:#fff;letter-spacing:1px}'+
'.hdr-brand-pt{font-size:14px;font-weight:900;color:var(--gold);letter-spacing:1px}'+
'.hdr-index-block{display:flex;flex-direction:column;justify-content:center;padding:0 18px;height:54px;border-right:1px solid rgba(255,255,255,.12);flex-shrink:0}'+
'.hdr-index-label{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.4);font-weight:700;line-height:1;margin-bottom:3px}'+
'.hdr-index-value{font-size:16px;font-weight:900;color:var(--gold);letter-spacing:2px;font-family:\'Courier New\',monospace;line-height:1}'+
'.hdr-spacer{flex:1;min-width:0}'+
'.hdr-badge{display:none;align-items:center;gap:6px;background:var(--gold);color:var(--pri3);font-size:10px;font-weight:900;padding:0 16px;height:54px;letter-spacing:.8px;flex-shrink:0;text-transform:uppercase}'+
'.hdr-badge i{font-size:13px}'+
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
 
/* ═══════════════ BULK MODAL ═══════════════ */
'#axpBulkMod{display:none;position:fixed;inset:0;z-index:10000;background:rgba(5,8,25,.75);align-items:flex-start;justify-content:center;padding:14px;overflow-y:auto}'+
'#axpBulkMod.open{display:flex}'+
'#axpBulkBox{background:var(--white);width:100%;max-width:780px;border:1px solid var(--border);animation:popIn .18s ease;margin:auto}'+
'.bk-hdr{background:var(--pri);padding:14px 18px;display:flex;align-items:center;gap:10px;border-bottom:3px solid var(--gold)}'+
'.bk-hdr-icon{font-size:20px;color:var(--gold)}'+
'.bk-hdr-title{font-size:14px;font-weight:800;color:#fff;flex:1}'+
'.bk-close{background:none;border:none;color:rgba(255,255,255,.55);font-size:22px;cursor:pointer;line-height:1;padding:0}'+
'.bk-close:hover{color:#fff}'+
'.bk-tabs{display:flex;border-bottom:2px solid var(--border);background:var(--panel)}'+
'.bk-tab{padding:11px 18px;font-size:11.5px;font-weight:700;color:var(--muted);cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;letter-spacing:.3px;user-select:none;display:flex;align-items:center;gap:6px}'+
'.bk-tab:hover{color:var(--pri);background:rgba(45,58,140,.04)}'+
'.bk-tab.on{color:var(--pri);border-bottom-color:var(--pri);background:#fff}'+
'.bk-tab i{font-size:14px}'+
'.bk-body{padding:18px}'+
'.bk-panel{display:none}.bk-panel.on{display:block}'+
/* STEP INDICATOR */
'.bk-steps{display:flex;align-items:center;gap:0;margin-bottom:20px;overflow-x:auto}'+
'.bk-step{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--muted);padding:7px 12px;background:var(--panel);border:1px solid var(--border);flex-shrink:0}'+
'.bk-step.active{background:var(--pri);color:#fff;border-color:var(--pri)}'+
'.bk-step.done{background:#f0fdf4;color:#1a7a4a;border-color:#1a7a4a}'+
'.bk-step-arrow{font-size:10px;color:var(--muted);flex-shrink:0;padding:0 2px}'+
/* DROP ZONE */
'.axpDropZone{border:2px dashed var(--border);padding:28px 18px;text-align:center;cursor:pointer;transition:border-color .15s,background .15s;margin-bottom:14px}'+
'.axpDropZone:hover,.axpDropZone.drag{border-color:var(--pri);background:#eef0fb}'+
'.axpDropZone i{font-size:32px;color:var(--muted);margin-bottom:8px;display:block}'+
'.axpDropZone p{font-size:12px;color:var(--muted);margin-bottom:6px}'+
'.axpDropZone span{font-size:10.5px;color:var(--lite)}'+
/* MATCH TABLE */
'.match-row-ok{background:#f0fdf4!important}'+
'.match-row-warn{background:#fffbeb!important}'+
'.match-row-err{background:#fef2f2!important}'+
/* CAMERA VIEW */
'.cam-wrap{position:relative;background:#000;overflow:hidden;max-height:340px;display:flex;align-items:center;justify-content:center;margin-bottom:10px}'+
'#axpCamVideo{width:100%;display:block;max-height:340px;object-fit:cover}'+
'.cam-overlay{position:absolute;inset:0;pointer-events:none}'+
'.cam-guide{position:absolute;top:10%;left:8%;right:8%;bottom:10%;border:3px solid rgba(212,160,23,.7);box-shadow:0 0 0 9999px rgba(0,0,0,.45)}'+
'.cam-corner{position:absolute;width:18px;height:18px;border-color:var(--gold);border-style:solid}'+
'.cam-corner.tl{top:-2px;left:-2px;border-width:3px 0 0 3px}'+
'.cam-corner.tr{top:-2px;right:-2px;border-width:3px 3px 0 0}'+
'.cam-corner.bl{bottom:-2px;left:-2px;border-width:0 0 3px 3px}'+
'.cam-corner.br{bottom:-2px;right:-2px;border-width:0 3px 3px 0}'+
'.cam-msg{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.7);color:#fff;font-size:11px;font-weight:700;padding:4px 12px;white-space:nowrap;letter-spacing:.3px}'+
/* QUALITY BARS */
'.qual-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}'+
'.qual-cell{background:var(--panel);border:1px solid var(--border);padding:8px;text-align:center}'+
'.qual-val{font-size:16px;font-weight:900;margin-bottom:2px}'+
'.qual-lbl{font-size:9.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}'+
/* ANALYSIS RESULT */
'.ana-summary{background:var(--panel);border:1px solid var(--border);padding:12px 14px;margin-bottom:12px}'+
'.ana-row{display:flex;justify-content:space-between;font-size:12px;padding:3px 0;border-bottom:1px solid var(--border)}'+
'.ana-row:last-child{border-bottom:none}'+
'.ana-lbl{color:var(--muted);font-weight:600}'+
'.ana-val{font-weight:800;color:var(--text)}'+
/* LAYER INDICATOR */
'.layer-badge{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:800;padding:3px 10px;letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px}'+
'.layer-1{background:#dbeafe;color:#1e40af;border:1px solid #93c5fd}'+
'.layer-2{background:#dcfce7;color:#166534;border:1px solid #86efac}'+
'.layer-3{background:#fef9c3;color:#854d0e;border:1px solid #fde047}'+
'.layer-4{background:#fce7f3;color:#9d174d;border:1px solid #f9a8d4}'+
/* RESPONSIVE BULK MODAL */
'@media(max-width:600px){.bk-tab{padding:8px 10px;font-size:10.5px}.bk-body{padding:12px}.qual-grid{grid-template-columns:1fr 1fr}}'+
 
/* RESPONSIVE ≤768px sidebar drawer */
'@media(max-width:768px){'+
'#axpMenuBtn{display:flex!important}'+
'#axpSidebar{position:fixed;top:59px;left:0;bottom:0;z-index:260;transform:translateX(-100%);transition:transform .22s ease;height:auto}'+
'#axpSidebar.open{transform:translateX(0)}'+
'#axpSbOverlay.open{display:block}'+
'#axpContent{padding:14px 13px 70px}'+
'}'+
/* ≤500px tight layout */
'@media(max-width:500px){'+
'#axpHdr{height:48px;padding:0 10px;gap:9px}'+
'.hdr-name{font-size:11px;letter-spacing:.8px}.hdr-tag{display:none}.hdr-div{display:none}'+
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
    '<div class="hdr-index-value" id="axpHdrIndex">S-</div>'+
  '</div>'+
  '<div class="hdr-spacer"></div>'+
  '<div class="hdr-badge" id="axpHdrBadge"><i class="bi bi-shield-check"></i> ACTIVE</div>'+
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
  '<div class="sb-item active" id="sbNav_entry" onclick="axpSbNav(\'entry\')" style="cursor:pointer"><i class="bi bi-pencil-square"></i><span>Enter Marks</span></div>'+
  '<div class="sb-item" id="sbNav_students" onclick="axpSbNav(\'students\')" style="cursor:pointer"><i class="bi bi-people"></i><span>Students</span></div>'+
  '<div class="sb-item" id="sbNav_progress" onclick="axpSbNav(\'progress\')" style="cursor:pointer"><i class="bi bi-bar-chart"></i><span>Progress</span></div>'+
  '<div class="sb-section">Bulk Import</div>'+
  '<div class="sb-item" onclick="axpOpenBulk(\'excel\')" style="cursor:pointer"><i class="bi bi-file-earmark-excel"></i><span>Excel Bulk Entry</span></div>'+
  '<div class="sb-item" onclick="axpOpenBulk(\'scan\')" style="cursor:pointer"><i class="bi bi-camera"></i><span>Scan / Camera</span></div>'+
  '<div class="sb-section">Actions</div>'+
  '<div class="sb-item" id="sbNav_results" onclick="axpSbNav(\'results\')" style="cursor:pointer"><i class="bi bi-table"></i><span>View Results</span></div>'+
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
      '<span style="margin-left:auto;display:flex;gap:6px">'+
        '<button onclick="axpOpenBulk(\'excel\')" class="axpBtn axpBD axpSm" style="border-color:#1a7a4a;color:#1a7a4a"><i class="bi bi-file-earmark-excel"></i> Excel Bulk</button>'+
        '<button onclick="axpOpenBulk(\'scan\')" class="axpBtn axpBD axpSm"><i class="bi bi-camera"></i> Scan</button>'+
      '</span>'+
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
        '<div style="display:flex;gap:6px;flex-wrap:wrap">'+
          '<button onclick="axpOpenBulk(\'excel\')" class="axpBtn axpBD axpSm" style="border-color:#1a7a4a;color:#1a7a4a" title="Excel Bulk Entry"><i class="bi bi-file-earmark-excel"></i> Bulk Excel</button>'+
          '<button onclick="axpOpenBulk(\'scan\')" class="axpBtn axpBD axpSm" title="Camera/Scan Entry"><i class="bi bi-camera"></i> Scan</button>'+
          '<button onclick="axpStartNew()" class="axpBtn axpBG axpSm"><i class="bi bi-arrow-left"></i> Change</button>'+
        '</div>'+
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
 
/* MAIN MODAL */
'<div id="axpMod"><div id="axpMBox">'+
  '<div id="axpMHd"><div class="mhi" id="axpMIcon"></div><div class="mht" id="axpMTitle"></div><button class="mhx" onclick="axpMClose()">×</button></div>'+
  '<div id="axpMBd"></div><div id="axpMFt"></div>'+
'</div></div>'+
 
/* ══════════════ BULK IMPORT MODAL ══════════════ */
'<div id="axpBulkMod">'+
'<div id="axpBulkBox">'+
  '<div class="bk-hdr">'+
    '<i class="bk-hdr-icon bi bi-cloud-upload"></i>'+
    '<div class="bk-hdr-title" id="axpBkTitle">Bulk Marks Import</div>'+
    '<button class="bk-close" onclick="axpCloseBulk()">×</button>'+
  '</div>'+
  '<div class="bk-tabs">'+
    '<div class="bk-tab on" id="axpBkTabXL" onclick="axpBkTab(\'xl\')"><i class="bi bi-file-earmark-excel"></i> Excel Bulk Entry</div>'+
    '<div class="bk-tab" id="axpBkTabSC" onclick="axpBkTab(\'sc\')"><i class="bi bi-camera"></i> Scan / Camera OCR</div>'+
  '</div>'+
  '<div class="bk-body">'+
 
    /* ══ EXCEL PANEL ══ */
    '<div class="bk-panel on" id="axpBkPanelXL">'+
      '<div class="bk-steps">'+
        '<div class="bk-step active" id="xlStep1"><i class="bi bi-download"></i> 1. Download Template</div>'+
        '<div class="bk-step-arrow"><i class="bi bi-chevron-right"></i></div>'+
        '<div class="bk-step" id="xlStep2"><i class="bi bi-upload"></i> 2. Upload Filled Sheet</div>'+
        '<div class="bk-step-arrow"><i class="bi bi-chevron-right"></i></div>'+
        '<div class="bk-step" id="xlStep3"><i class="bi bi-check2-all"></i> 3. Review & Apply</div>'+
      '</div>'+
 
      /* Step 1 */
      '<div id="xlPanel1">'+
        '<div class="layer-badge layer-1"><i class="bi bi-1-circle"></i> Layer 1 — Template</div>'+
        '<p style="font-size:12.5px;color:var(--muted);margin-bottom:10px">Download the pre-filled Excel template with student names and gender. Add marks in the <strong>Mark</strong> column (0–100) then upload.</p>'+
        '<div style="background:var(--panel);border:1px solid var(--border);padding:12px 14px;margin-bottom:14px">'+
          '<div style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;margin-bottom:8px">Template columns:</div>'+
          '<div style="display:flex;gap:6px;flex-wrap:wrap">'+
            '<span style="background:#e8eaf8;color:var(--pri);padding:3px 9px;font-size:11px;font-weight:700;border:1px solid #c0c6e8">Cand. No.</span>'+
            '<span style="background:#e8eaf8;color:var(--pri);padding:3px 9px;font-size:11px;font-weight:700;border:1px solid #c0c6e8">Name</span>'+
            '<span style="background:#e8eaf8;color:var(--pri);padding:3px 9px;font-size:11px;font-weight:700;border:1px solid #c0c6e8">Gender</span>'+
            '<span style="background:#dcfce7;color:#166534;padding:3px 9px;font-size:11px;font-weight:700;border:1px solid #86efac">Mark ← fill this</span>'+
          '</div>'+
        '</div>'+
        '<div id="xlNoStudents" style="display:none;background:#fff8e1;border:1px solid #ffe082;padding:10px 14px;font-size:12px;color:#7a5800;margin-bottom:12px">'+
          '<i class="bi bi-exclamation-triangle"></i> No students loaded. Please load students first via the wizard, then use bulk import.'+
        '</div>'+
        '<button class="axpBtn axpBGold" id="xlDownBtn" onclick="axpXLDownload()" style="padding:10px 22px"><i class="bi bi-file-earmark-excel"></i> Download Template (.xlsx)</button>'+
      '</div>'+
 
      /* Step 2 */
      '<div id="xlPanel2" style="display:none">'+
        '<div class="layer-badge layer-2"><i class="bi bi-2-circle"></i> Layer 2 — Upload</div>'+
        '<div class="axpDropZone" id="xlDrop" onclick="g(\'xlFileIn\').click()" ondragover="event.preventDefault();this.classList.add(\'drag\')" ondragleave="this.classList.remove(\'drag\')" ondrop="axpXLDrop(event)">'+
          '<i class="bi bi-cloud-arrow-up"></i>'+
          '<p>Click or drag &amp; drop your filled Excel file here</p>'+
          '<span>Supports .xlsx, .xls, .csv</span>'+
        '</div>'+
        '<input type="file" id="xlFileIn" accept=".xlsx,.xls,.csv" style="display:none" onchange="axpXLFile(this)">'+
        '<div id="xlFileInfo" style="display:none;background:var(--panel);border:1px solid var(--border);padding:10px 14px;font-size:12px;margin-bottom:10px">'+
          '<i class="bi bi-file-earmark-check" style="color:#1a7a4a"></i> <strong id="xlFileName"></strong> — <span id="xlFileRows"></span>'+
        '</div>'+
      '</div>'+
 
      /* Step 3 */
      '<div id="xlPanel3" style="display:none">'+
        '<div class="layer-badge layer-3"><i class="bi bi-3-circle"></i> Layer 3 — Match &amp; Review</div>'+
        '<div class="ana-summary" id="xlMatchSummary"></div>'+
        '<div style="overflow-x:auto;margin-bottom:14px"><table class="axpTbl" id="xlMatchTbl">'+
          '<thead><tr><th>#</th><th>Name in File</th><th>Matched Student</th><th>Similarity</th><th>Mark</th><th>Status</th></tr></thead>'+
          '<tbody id="xlMatchBody"></tbody>'+
        '</table></div>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
          '<button class="axpBtn axpBP" onclick="axpXLApply()"><i class="bi bi-check2-all"></i> Apply Matched Marks</button>'+
          '<button class="axpBtn axpBG" onclick="axpXLReset()"><i class="bi bi-arrow-counterclockwise"></i> Start Over</button>'+
        '</div>'+
      '</div>'+
    '</div>'+
 
    /* ══ SCAN PANEL ══ */
    '<div class="bk-panel" id="axpBkPanelSC">'+
      '<div class="bk-steps">'+
        '<div class="bk-step active" id="scStep1"><i class="bi bi-camera"></i> 1. Capture / Upload</div>'+
        '<div class="bk-step-arrow"><i class="bi bi-chevron-right"></i></div>'+
        '<div class="bk-step" id="scStep2"><i class="bi bi-search"></i> 2. Analyse</div>'+
        '<div class="bk-step-arrow"><i class="bi bi-chevron-right"></i></div>'+
        '<div class="bk-step" id="scStep3"><i class="bi bi-list-check"></i> 3. Match</div>'+
        '<div class="bk-step-arrow"><i class="bi bi-chevron-right"></i></div>'+
        '<div class="bk-step" id="scStep4"><i class="bi bi-check2-all"></i> 4. Apply</div>'+
      '</div>'+
 
      /* Capture Step */
      '<div id="scPanel1">'+
        '<div class="layer-badge layer-1"><i class="bi bi-1-circle"></i> Layer 1 — Document Capture</div>'+
        '<p style="font-size:12.5px;color:var(--muted);margin-bottom:12px">Capture a photo of your hardcopy mark sheet or upload a scanned image/PDF. The system will read name and mark columns automatically.</p>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">'+
          '<button class="axpBtn axpBP" onclick="axpCamStart()" style="justify-content:center;padding:12px"><i class="bi bi-camera-fill"></i> Use Camera</button>'+
          '<button class="axpBtn axpBD" onclick="g(\'scFileIn\').click()" style="justify-content:center;padding:12px"><i class="bi bi-upload"></i> Upload Image / PDF</button>'+
        '</div>'+
        '<input type="file" id="scFileIn" accept="image/*,.pdf" style="display:none" onchange="axpScanFile(this)">'+
 
        /* Camera UI */
        '<div id="scCamUI" style="display:none">'+
          '<div class="layer-badge layer-2" style="margin-bottom:8px"><i class="bi bi-camera-video"></i> Camera Guide — Align document in frame</div>'+
          '<div class="cam-wrap" id="scCamWrap">'+
            '<video id="axpCamVideo" autoplay playsinline muted></video>'+
            '<div class="cam-overlay">'+
              '<div class="cam-guide" id="scCamGuide">'+
                '<div class="cam-corner tl"></div><div class="cam-corner tr"></div>'+
                '<div class="cam-corner bl"></div><div class="cam-corner br"></div>'+
              '</div>'+
              '<div class="cam-msg" id="scCamMsg">Align document within the golden frame</div>'+
            '</div>'+
          '</div>'+
          '<div class="qual-grid" id="scQualGrid">'+
            '<div class="qual-cell"><div class="qual-val" id="scQBright" style="color:var(--muted)">—</div><div class="qual-lbl">Brightness</div></div>'+
            '<div class="qual-cell"><div class="qual-val" id="scQContrast" style="color:var(--muted)">—</div><div class="qual-lbl">Contrast</div></div>'+
            '<div class="qual-cell"><div class="qual-val" id="scQBlur" style="color:var(--muted)">—</div><div class="qual-lbl">Sharpness</div></div>'+
          '</div>'+
          '<p style="font-size:11px;color:var(--muted);margin-bottom:8px;text-align:center"><i class="bi bi-lightbulb"></i> Tips: Good lighting · Hold steady · Document fills frame · Text must be readable</p>'+
          '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">'+
            '<button class="axpBtn axpBP" id="scCamCapBtn" onclick="axpCamCapture()" style="padding:11px 28px"><i class="bi bi-camera"></i> Capture</button>'+
            '<button class="axpBtn axpBG" onclick="axpCamStop()"><i class="bi bi-x-circle"></i> Cancel Camera</button>'+
          '</div>'+
          '<canvas id="scCamCanvas" style="display:none"></canvas>'+
        '</div>'+
 
        /* Preview */
        '<div id="scPreviewUI" style="display:none">'+
          '<div class="layer-badge layer-3" style="margin-bottom:8px"><i class="bi bi-image"></i> Layer 2 — Image Preview &amp; Quality Check</div>'+
          '<div style="text-align:center;margin-bottom:10px">'+
            '<img id="scPreviewImg" style="max-width:100%;max-height:280px;border:2px solid var(--border)" alt="preview">'+
          '</div>'+
          '<div class="qual-grid" id="scImgQual">'+
            '<div class="qual-cell"><div class="qual-val" id="scIQBright" style="color:var(--muted)">—</div><div class="qual-lbl">Brightness</div></div>'+
            '<div class="qual-cell"><div class="qual-val" id="scIQContrast" style="color:var(--muted)">—</div><div class="qual-lbl">Contrast</div></div>'+
            '<div class="qual-cell"><div class="qual-val" id="scIQScore" style="color:var(--muted)">—</div><div class="qual-lbl">Quality Score</div></div>'+
          '</div>'+
          '<div id="scQualWarn" style="display:none;background:#fff8e1;border:1px solid #ffe082;padding:10px 14px;font-size:12px;color:#7a5800;margin-bottom:10px"></div>'+
          '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
            '<button class="axpBtn axpBP" id="scAnalyseBtn" onclick="axpScanAnalyse()"><i class="bi bi-search"></i> Analyse Document</button>'+
            '<button class="axpBtn axpBG" onclick="axpScanReset()"><i class="bi bi-arrow-counterclockwise"></i> Retake / Re-upload</button>'+
          '</div>'+
        '</div>'+
      '</div>'+
 
      /* Analyse Step */
      '<div id="scPanel2" style="display:none">'+
        '<div class="layer-badge layer-2"><i class="bi bi-2-circle"></i> Layer 2 — OCR Analysis</div>'+
        '<div id="scAnalysing" style="text-align:center;padding:28px 0">'+
          '<div class="ld-ring" style="margin:0 auto 12px"></div>'+
          '<div style="font-size:12.5px;font-weight:700;color:var(--pri)" id="scAnalyseTxt">Initialising OCR engine…</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-top:5px" id="scAnalyseSub">This may take 10–30 seconds for the first run</div>'+
          '<div style="width:220px;margin:12px auto 0">'+
            '<div style="background:var(--border);height:4px;overflow:hidden"><div id="scOcrBar" class="axpPFill" style="width:0%;transition:width .4s ease"></div></div>'+
          '</div>'+
        '</div>'+
        '<div id="scAnalyseResult" style="display:none">'+
          '<div class="ana-summary" id="scAnaSummary"></div>'+
          '<div style="font-size:11px;font-weight:800;text-transform:uppercase;color:var(--muted);letter-spacing:.8px;margin-bottom:6px">Raw extracted text (first 60 lines):</div>'+
          '<textarea id="scRawTxt" style="width:100%;height:140px;font-family:monospace;font-size:11px;background:var(--panel);border:1px solid var(--border);padding:8px;resize:vertical;color:var(--text)" readonly></textarea>'+
          '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">'+
            '<button class="axpBtn axpBP" onclick="axpScanParseAndMatch()"><i class="bi bi-list-check"></i> Parse &amp; Match Names</button>'+
            '<button class="axpBtn axpBG" onclick="axpScanReset()"><i class="bi bi-arrow-counterclockwise"></i> Retry</button>'+
          '</div>'+
        '</div>'+
      '</div>'+
 
      /* Match Step */
      '<div id="scPanel3" style="display:none">'+
        '<div class="layer-badge layer-3"><i class="bi bi-3-circle"></i> Layer 3 — Name Matching &amp; Verification</div>'+
        '<div class="ana-summary" id="scMatchSummary"></div>'+
        '<div style="overflow-x:auto;margin-bottom:14px"><table class="axpTbl" id="scMatchTbl">'+
          '<thead><tr><th>#</th><th>Extracted Name</th><th>Matched Student</th><th>Score %</th><th>Mark</th><th>Action</th></tr></thead>'+
          '<tbody id="scMatchBody"></tbody>'+
        '</table></div>'+
        '<div id="scUnmatched" style="display:none;background:#fef2f2;border:1px solid #fca5a5;padding:10px 14px;margin-bottom:12px;font-size:12px;color:#7a2020">'+
          '<strong><i class="bi bi-exclamation-triangle"></i> Unmatched entries:</strong><div id="scUnmatchedList" style="margin-top:6px"></div>'+
        '</div>'+
        '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
          '<button class="axpBtn axpBP" id="scApplyBtn" onclick="axpScanApply()"><i class="bi bi-check2-all"></i> Apply Matched Marks</button>'+
          '<button class="axpBtn axpBG" onclick="axpScanReset()"><i class="bi bi-arrow-counterclockwise"></i> Start Over</button>'+
        '</div>'+
      '</div>'+
 
      /* Apply Step */
      '<div id="scPanel4" style="display:none">'+
        '<div class="layer-badge layer-4"><i class="bi bi-4-circle"></i> Layer 4 — Applied Successfully</div>'+
        '<div class="axpSuccessBnr" style="padding:20px;margin-bottom:14px">'+
          '<span class="suc-icon" style="font-size:32px"><i class="bi bi-check-circle-fill"></i></span>'+
          '<div class="suc-title" style="font-size:16px">Marks Applied to Entry Form</div>'+
          '<div class="suc-sub" id="scAppliedSub"></div>'+
        '</div>'+
        '<div style="text-align:center">'+
          '<button class="axpBtn axpBP" onclick="axpCloseBulk()" style="padding:10px 28px"><i class="bi bi-pencil-square"></i> Go to Entry Form</button>'+
        '</div>'+
      '</div>'+
    '</div>'+
 
  '</div>'+/* /bk-body */
'</div>'+/* /axpBulkBox */
'</div>'+/* /axpBulkMod */
 
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
    var items=['entry','students','progress','results'];
    items.forEach(function(p){
      var el=g('sbNav_'+p);
      if(el)el.classList.toggle('active',p===panel);
    });
    var panels=['axpWizard','axpEntry','axpDone','axpPanelStudents','axpPanelProgress','axpPanelResults'];
    panels.forEach(function(id){var el=g(id);if(el)el.classList.add('axpH');});
    var titles={entry:'Marks Entry',students:'Students List',progress:'Entry Progress',results:'Results Table'};
    var subs={entry:'Select class, exam type and subject to begin entering marks.',
              students:'All students loaded for the current session.',
              progress:'Track how many marks have been entered.',
              results:'View submitted marks and grade distribution.'};
    var pt=g('axpPgTitle'),ps=g('axpPgSub');
    if(pt)pt.textContent=titles[panel]||'Marks Entry';
    if(ps)ps.textContent=subs[panel]||'';
 
    if(panel==='entry'){
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
    if(window.innerWidth<=768)axpCloseSidebar();
  };
 
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
 
      var hdrIdx=g('axpHdrIndex'); if(hdrIdx)hdrIdx.textContent='S'+S.digits;
      var badge=g('axpHdrBadge'); if(badge)badge.style.display='flex';
      g('axpIBName').textContent=S.schoolName;
      g('axpIBCode').textContent='S'+S.digits;
      g('axpIBYear').textContent=S.year;
      g('axpInfoBar').style.display='flex';
      document.title='S'+S.digits+' · Marks Entry';
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
      var students=[];
      var er=await apiGet({mode:'examRoster',schoolId:S.schoolId,year:S.year,examType:S.examType,'class':S.cls});
      if(er.status==='success'&&er.roster&&er.roster.length)students=er.roster;
      if(!students.length){axpAlert('No Students','No students found for <strong>'+esc(S.cls)+'</strong> · <strong>'+esc(S.examType)+'</strong>.<br><br>Check that students have been added to this exam.','warning');return;}
      students=sortStu(students);
      S.students=students; S.marks={}; S.serverMarks={}; S.idx=0; S.submitted=false;
 
      try{
        var scoreRes=await apiGet({
          schoolId:S.schoolId,year:S.year,
          examType:S.examType,'class':S.cls
        });
        if(scoreRes.status==='success'&&scoreRes.data&&scoreRes.data.length){
          var existingCount=0;
          scoreRes.data.forEach(function(row){
            if(row.scores&&row.scores[S.subject]!==undefined){
              var sc=row.scores[S.subject].mark;
              if(sc!==undefined&&sc!==null&&sc!==''){
                S.serverMarks[row.name]=sc;
                existingCount++;
              }
            }
          });
          if(existingCount>0){
            Object.keys(S.serverMarks).forEach(function(name){
              S.marks[name]=S.serverMarks[name];
            });
            axpAlert(
              'Existing Marks Found',
              '<strong>'+existingCount+'</strong> mark(s) already exist on the server for <strong>'+esc(S.subject)+'</strong> · '+esc(S.cls)+' · '+esc(S.examType)+'.<br><br>'+
              'These have been loaded for your review. Only marks you <strong>change</strong> will be updated on submit. Unchanged marks will not be touched.',
              'warning'
            );
          }
        }
      }catch(ex){}
 
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
    var chip=g('axpStuSaved');
    if(chip){
      var srvSc=(S.serverMarks||{})[s.name];
      if(sc!==undefined){
        if(srvSc!==undefined&&srvSc===sc){
          chip.textContent='Server: '+sc+' ('+calcGrade(sc).g+') — unchanged';
          chip.className='stu-saved yes'; chip.style.opacity='.7';
        }else if(srvSc!==undefined&&srvSc!==sc){
          chip.textContent='Changed: '+srvSc+' → '+sc+' ('+calcGrade(sc).g+')';
          chip.className='stu-saved yes'; chip.style.opacity='1';
          chip.style.background='rgba(245,158,11,.2)'; chip.style.borderColor='rgba(245,158,11,.5)'; chip.style.color='#8a6800';
        }else{
          chip.textContent='New: '+sc+' ('+calcGrade(sc).g+')';
          chip.className='stu-saved yes'; chip.style.opacity='1';
          chip.style.background=''; chip.style.borderColor=''; chip.style.color='';
        }
      }else if(srvSc!==undefined){
        chip.textContent='Server: '+srvSc+' — cleared locally';
        chip.className='stu-saved no'; chip.style.opacity='1';
        chip.style.background='rgba(239,68,68,.1)'; chip.style.borderColor='rgba(239,68,68,.3)'; chip.style.color='var(--red)';
      }else{
        chip.textContent='Not entered yet';
        chip.className='stu-saved no';
        chip.style.background=''; chip.style.borderColor=''; chip.style.color='';
        chip.style.opacity='1';
      }
    }
    var miss=S.students.filter(function(st){return S.marks[st.name]===undefined;}).length;
    var mb=g('axpMissingBadge'),mt=g('axpMissingTxt');
    if(mb&&mt){if(miss>0){mt.textContent=miss+' student'+(miss===1?'':'s')+' still need'+(miss===1?'s':'')+' a mark';mb.classList.remove('axpH');}else{mb.classList.add('axpH');}}
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
    if(!v){
      var name=S.students[S.idx].name;
      delete S.marks[name];
      updateBadge(null);
      saveCache();
      var chip=g('axpStuSaved');if(chip){chip.textContent='Mark removed';chip.className='stu-saved no';}
      var miss=S.students.filter(function(s){return S.marks[s.name]===undefined;}).length;
      var mb=g('axpMissingBadge'),mt=g('axpMissingTxt');
      if(mb&&mt){if(miss>0){mt.textContent=miss+' student'+(miss===1?'':'s')+' still need'+(miss===1?'s':'')+' a mark';mb.classList.remove('axpH');}else{mb.classList.add('axpH');}}
      showPill('Mark removed for '+name,'warning');
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
    var name=S.students[S.idx].name;
    if(v===''){delete S.marks[name];}
    else{var n=parseInt(v);if(!isNaN(n)&&n>=0&&n<=100)S.marks[name]=n;}
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
    var server=S.serverMarks||{};
    var allMarked=S.students.filter(function(s){return S.marks[s.name]!==undefined;});
    var changed=allMarked.filter(function(s){
      return S.marks[s.name]!==server[s.name];
    });
    var payload=changed.map(function(s){return{name:s.name,score:S.marks[s.name]};});
    if(!allMarked.length){axpAlert('No Marks','Enter at least one score before submitting.','warning');return;}
    if(!payload.length){
      axpAlert('No Changes','No marks have been changed from the server values. Nothing to submit.','info');
      return;
    }
    var unchangedCount=allMarked.length-payload.length;
    axpConfirm('Confirm Submission',
      'Submitting <strong>'+payload.length+'</strong> changed mark(s) for<br>'+
      '<strong>'+esc(S.subject)+'</strong> · '+esc(S.cls)+' · '+esc(S.examType)+
      (unchangedCount>0?'<br><span style="font-size:11px;color:var(--muted)">'+unchangedCount+' unchanged mark(s) will not be touched.</span>':''),
    async function(){
      var btn=g('axpSubBtn'); btn.disabled=true;
      var spn='<span style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:7px"></span>';
      btn.innerHTML=spn+'Sending '+payload.length+' marks…';
      showPill('Connecting to server…','info');
      try{
        var res=await apiPost({mode:'teacherMarksEntry',schoolId:S.schoolId,year:S.year,examType:S.examType,'class':S.cls,subject:S.subject,'data[studentName]':payload.map(function(p){return p.name;}).join(','),'data[marks]':payload.map(function(p){return String(p.score);}).join(',')});
        if(res.status==='success'){
          S.submitted=true;
          payload.forEach(function(p){S.serverMarks[p.name]=p.score;});
          clearCache();
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
    if(S.teacher){doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(0,0,0);doc.text('Teacher: '+S.teacher.name+(S.teacher.email?' <'+S.teacher.email+'>':''),ML,y);y+=7;}
    var cols=[{l:'CAND. NO.',w:30},{l:'STUDENT NAME',w:68},{l:'SEX',w:12},{l:'SCORE',w:18},{l:'GRADE',w:16},{l:'POS.',w:24}],RH=7;
    var ranked2=S.students.filter(function(s){return S.marks[s.name]!==undefined;}).slice().sort(function(a,b){return S.marks[b.name]-S.marks[a.name];});
    var pm2={},p2=0,ls2=null,lp2=0;
    ranked2.forEach(function(s){var sc=S.marks[s.name];if(sc!==ls2){p2=lp2+1;ls2=sc;lp2=p2;}pm2[s.name]=p2;});
    function drawHdr(){
      doc.setDrawColor(0,0,0);doc.setLineWidth(0.3);doc.rect(ML,y,UW,RH,'S');
      var cx=ML;
      cols.forEach(function(c){
        doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(0,0,0);
        doc.line(cx+c.w,y,cx+c.w,y+RH);
        doc.text(c.l,cx+c.w/2,y+RH/2+2.5,{align:'center',maxWidth:c.w-2});
        cx+=c.w;
      });
      y+=RH;
    }
    drawHdr();
    S.students.forEach(function(s,i){
      if(S.marks[s.name]===undefined)return;
      chkPg(RH+2);
      var sc=S.marks[s.name],gr=calcGrade(sc);
      doc.setDrawColor(0,0,0);doc.setLineWidth(0.2);doc.rect(ML,y,UW,RH,'S');
      var row=[candNo(i),s.name,s.gender==='F'?'F':'M',sc,gr.g,pm2[s.name]||'—'],cx=ML;
      row.forEach(function(v,ci){
        if(ci===4){doc.setFont('helvetica','bold');doc.setFontSize(8);}
        else if(ci===3){doc.setFont('helvetica','bold');doc.setFontSize(8);}
        else{doc.setFont('helvetica','normal');doc.setFontSize(7.5);}
        doc.setTextColor(0,0,0);
        doc.line(cx+cols[ci].w,y,cx+cols[ci].w,y+RH);
        var al=ci===1?'left':'center',tx=ci===1?cx+2:cx+cols[ci].w/2;
        doc.text(String(v||''),tx,y+RH/2+2.5,{align:al,maxWidth:cols[ci].w-3});cx+=cols[ci].w;
      });
      y+=RH;
    });
    var nP=doc.internal.getNumberOfPages();
    for(var pg=1;pg<=nP;pg++){doc.setPage(pg);doc.setFont('helvetica','italic');doc.setFontSize(7);doc.setTextColor(0,0,0);doc.text('AcademixPoint School Management · www.academixpoint.com',PW/2,PH-8,{align:'center'});doc.text('Page '+pg+' of '+nP,PW-MR,PH-8,{align:'right'});}
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
    S.cls='';S.examType='';S.subject='';S.teacher=null;S.students=[];S.marks={};S.serverMarks={};S.submitted=false;
    hideEl('axpDone');hideEl('axpEntry');hideEl('axpSubmittedView');
    showEl('axpWizard');hideEl('axpS2');hideEl('axpS3');hideEl('axpLW');
    ['axpS1','axpS2','axpS3'].forEach(function(id,i){var card=g(id);if(!card)return;var n=card.querySelector('.ct-num');if(n)n.innerHTML=String(i+1);});
    buildClassChips(); clearCache(); window.scrollTo({top:0,behavior:'smooth'});
  };
 
  /* ══════════════════════════════════════════════════════════════════════════ CACHE */
  function cKey(cls,exam,sub){
    var c=cls||S.cls, e=exam||S.examType, s=sub||S.subject;
    return 'axpT_'+S.digits+'_'+c+'_'+e+'_'+s;
  }
  function cKeyAll(){
    try{
      var prefix='axpT_'+S.digits+'_';
      return Object.keys(localStorage).filter(function(k){return k.indexOf(prefix)===0;});
    }catch(ex){return [];}
  }
  function saveCache(){
    try{
      localStorage.setItem(cKey(),JSON.stringify({
        cls:S.cls,examType:S.examType,subject:S.subject,teacher:S.teacher,
        marks:S.marks,
        idx:S.idx,
        students:S.students,
        serverMarks:S.serverMarks||{},
        savedAt:new Date().toISOString()
      }));
    }catch(ex){}
  }
  function clearCache(){try{localStorage.removeItem(cKey());}catch(ex){}}
  function clearAllSessions(){try{cKeyAll().forEach(function(k){localStorage.removeItem(k);});}catch(ex){}}
 
  function checkRestore(){
    try{
      var keys=cKeyAll();
      if(!keys.length)return;
      var sessions=[];
      keys.forEach(function(k){
        try{
          var d=JSON.parse(localStorage.getItem(k));
          if(d&&d.cls&&d.examType&&d.subject){
            sessions.push({key:k,data:d,filled:Object.keys(d.marks||{}).length});
          }
        }catch(ex){}
      });
      if(!sessions.length)return;
      var rb=g('axpRB'),ri=g('axpRI');
      if(!rb||!ri)return;
      ri.innerHTML=sessions.map(function(s,i){
        return '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap">'+
          '<span style="font-size:11px;font-weight:700;color:#92400e">'+esc(s.data.cls)+' · '+esc(s.data.examType)+' · '+esc(s.data.subject)+
          ' <span style="color:#a16207">('+s.filled+' marks)</span></span>'+
          '<button onclick="axpRestoreSession('+i+')" style="font-size:10px;padding:2px 8px;background:var(--pri);color:#fff;border:none;cursor:pointer;font-weight:700">Resume</button>'+
          '<button onclick="axpDeleteSession('+i+')" style="font-size:10px;padding:2px 8px;background:#ef4444;color:#fff;border:none;cursor:pointer;font-weight:700">Delete</button>'+
        '</div>';
      }).join('');
      rb.style.display='block';
      window._axpSessions=sessions;
    }catch(ex){}
  }
 
  window.axpDeleteSession=function(idx){
    var sessions=window._axpSessions||[];
    if(!sessions[idx])return;
    try{localStorage.removeItem(sessions[idx].key);}catch(ex){}
    sessions.splice(idx,1);
    window._axpSessions=sessions;
    if(!sessions.length){g('axpRB').style.display='none';}
    else{checkRestore();}
    showPill('Session deleted','warning');
  };
  window.axpRestoreSession=async function(idx){
    var sessions=window._axpSessions||[];
    var d=(idx!==undefined&&sessions[idx])?sessions[idx].data:window._axpPR;
    if(!d)return;
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
      buildClassChips();hlChip('axpCC',d.cls);buildExamChips();hlChip('axpEC',d.examType);buildSubjectChips();hlChip('axpSubC',d.subject);showEl('axpLW');
      await window.axpLoadStudents();
      S.marks=d.marks||{};S.idx=Math.min(d.idx||0,Math.max(S.students.length-1,0));
      renderCard();axpToast('Session restored — '+Object.keys(S.marks).length+' marks loaded ✓','success');
    }
  };
  window.axpDismissRestore=function(){g('axpRB').style.display='none';clearCache();};
  window.axpClearCache=function(){axpConfirm('Clear Cache','Delete all locally saved session data?',function(){try{Object.keys(localStorage).filter(function(k){return k.startsWith('axpT_');}).forEach(function(k){localStorage.removeItem(k);});}catch(ex){}axpToast('Cache cleared.','success');g('axpRB').style.display='none';},'Clear','background:#ef4444;border-color:rgba(239,68,68,.4);color:#fff;');};
 
 
  /* ══════════════════════════════════════════════════════════════════════════
     BULK IMPORT — EXCEL SECTION
     ══════════════════════════════════════════════════════════════════════════ */
 
  /* Open / close bulk modal */
  window.axpOpenBulk=function(tab){
    if(!S.students.length){
      axpAlert('No Students Loaded','Please load students first using the wizard before using bulk import.','warning');
      return;
    }
    g('axpBulkMod').classList.add('open');
    axpBkTab(tab||'xl');
    // Ensure Excel step 1 shows download button state
    var ns=g('xlNoStudents');
    if(ns)ns.style.display=S.students.length?'none':'block';
  };
  window.axpCloseBulk=function(){
    g('axpBulkMod').classList.remove('open');
    axpCamStop();
  };
 
  window.axpBkTab=function(tab){
    g('axpBkTabXL').classList.toggle('on',tab==='xl');
    g('axpBkTabSC').classList.toggle('on',tab==='sc');
    g('axpBkPanelXL').classList.toggle('on',tab==='xl');
    g('axpBkPanelSC').classList.toggle('on',tab==='sc');
    if(tab==='xl'){
      g('axpBkTitle').textContent='Bulk Marks Entry — Excel Template';
      xlGoStep(1);
    }else{
      g('axpBkTitle').textContent='Bulk Marks Entry — Camera / Scan OCR';
      scGoStep(1);
    }
  };
 
  /* ── EXCEL BULK ── */
  var _xlData=[];// parsed rows from uploaded file
 
  function xlGoStep(n){
    g('xlPanel1').style.display=n===1?'block':'none';
    g('xlPanel2').style.display=n===2?'block':'none';
    g('xlPanel3').style.display=n===3?'block':'none';
    [1,2,3].forEach(function(i){
      var el=g('xlStep'+i);
      if(el){
        el.classList.toggle('active',i===n);
        el.classList.toggle('done',i<n);
      }
    });
  }
 
  /* Download template as CSV-based fake xlsx (pure JS, no library needed for basic CSV) */
  window.axpXLDownload=async function(){
    if(!S.students.length){axpAlert('No Students','Load students first.','warning');return;}
    /* Try to load SheetJS for proper .xlsx; fallback to CSV */
    try{
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
      var XLSX=window.XLSX;
      var wsData=[['Cand. No.','Name','Gender','Mark']];
      S.students.forEach(function(s,i){
        wsData.push([candNo(i),s.name,s.gender==='F'?'F':'M','']);
      });
      var ws=XLSX.utils.aoa_to_sheet(wsData);
      // Style header row
      var range=XLSX.utils.decode_range(ws['!ref']);
      for(var C=range.s.c;C<=range.e.c;C++){
        var addr=XLSX.utils.encode_cell({r:0,c:C});
        if(!ws[addr])continue;
        ws[addr].s={font:{bold:true},fill:{fgColor:{rgb:'2D3A8C'}},alignment:{horizontal:'center'}};
      }
      ws['!cols']=[{wch:14},{wch:36},{wch:10},{wch:10}];
      // Protect name/cand/gender cols
      var wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'Marks');
      XLSX.writeFile(wb,'AXP_Template_S'+S.digits+'_'+S.cls+'_'+S.subject+'_'+S.examType+'.xlsx');
      showPill('Template downloaded ('+S.students.length+' students)','success');
      xlGoStep(2);
    }catch(ex){
      /* Fallback: CSV */
      var lines=['Cand. No.,Name,Gender,Mark'];
      S.students.forEach(function(s,i){lines.push('"'+candNo(i)+'","'+s.name+'",'+s.gender==='F'?'F':'M'+',"" ');});
      var a=document.createElement('a');
      a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(lines.join('\n'));
      a.download='AXP_Template_S'+S.digits+'_'+S.cls+'_'+S.subject+'_'+S.examType+'.csv';
      a.click();
      showPill('Template downloaded as CSV','success');
      xlGoStep(2);
    }
  };
 
  window.axpXLDrop=function(e){
    e.preventDefault();
    var dz=g('xlDrop'); if(dz)dz.classList.remove('drag');
    var file=e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0];
    if(file)axpXLProcess(file);
  };
  window.axpXLFile=function(inp){
    if(inp.files&&inp.files[0])axpXLProcess(inp.files[0]);
  };
 
  async function axpXLProcess(file){
    try{
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
      var XLSX=window.XLSX;
      var buf=await file.arrayBuffer();
      var wb=XLSX.read(buf,{type:'array'});
      var ws=wb.Sheets[wb.SheetNames[0]];
      var rows=XLSX.utils.sheet_to_json(ws,{defval:''});
      if(!rows.length){axpAlert('Empty File','The uploaded file has no data rows.','warning');return;}
      _xlData=rows;
      var fi=g('xlFileInfo'),fn=g('xlFileName'),fr=g('xlFileRows');
      if(fi)fi.style.display='block';
      if(fn)fn.textContent=file.name;
      if(fr)fr.textContent=rows.length+' rows found';
      xlGoStep(3);
      axpXLMatch(rows);
    }catch(ex){
      axpAlert('File Error','Could not read file: '+ex.message+'<br><br>Supported: .xlsx, .xls, .csv','danger');
    }
  }
 
  /* Fuzzy string similarity: Jaro-Winkler */
  function jaroSim(s1,s2){
    s1=String(s1||'').toUpperCase().trim();
    s2=String(s2||'').toUpperCase().trim();
    if(s1===s2)return 1;
    if(!s1.length||!s2.length)return 0;
    var mDist=Math.floor(Math.max(s1.length,s2.length)/2)-1;
    if(mDist<0)mDist=0;
    var s1m=new Array(s1.length).fill(false),s2m=new Array(s2.length).fill(false);
    var matches=0,transpositions=0;
    for(var i=0;i<s1.length;i++){
      var lo=Math.max(0,i-mDist),hi=Math.min(i+mDist+1,s2.length);
      for(var j=lo;j<hi;j++){
        if(s2m[j]||s1[i]!==s2[j])continue;
        s1m[i]=true;s2m[j]=true;matches++;break;
      }
    }
    if(!matches)return 0;
    var k=0;
    for(var i=0;i<s1.length;i++){
      if(!s1m[i])continue;
      while(!s2m[k])k++;
      if(s1[i]!==s2[k])transpositions++;
      k++;
    }
    var jaro=(matches/s1.length+matches/s2.length+(matches-transpositions/2)/matches)/3;
    var prefix=0;
    for(var i=0;i<Math.min(4,Math.min(s1.length,s2.length));i++){
      if(s1[i]===s2[i])prefix++;else break;
    }
    return jaro+prefix*0.1*(1-jaro);
  }
 
  /* Find best match among students */
  function bestMatch(name){
    var best=null,bestScore=0;
    S.students.forEach(function(s){
      var score=jaroSim(name,s.name);
      if(score>bestScore){bestScore=score;best=s;}
    });
    return{student:best,score:bestScore};
  }
 
  /* Parse flexible column names */
  function colVal(row,candidates){
    var keys=Object.keys(row);
    for(var i=0;i<candidates.length;i++){
      var c=candidates[i].toUpperCase();
      for(var j=0;j<keys.length;j++){
        if(keys[j].toUpperCase().replace(/[^A-Z0-9]/g,'').indexOf(c.replace(/[^A-Z0-9]/g,''))>=0){
          var v=row[keys[j]];
          if(v!==undefined&&v!==null&&v!=='')return String(v).trim();
        }
      }
    }
    return '';
  }
 
  /* State for Excel matches */
  var _xlMatches=[];
 
  function axpXLMatch(rows){
    _xlMatches=[];
    var matched=0,unmatched=0,noMark=0;
    rows.forEach(function(row){
      var name=colVal(row,['Name','Student','Candidate','Full Name']);
      var markRaw=colVal(row,['Mark','Score','Marks','Points','Result']);
      var mark=markRaw!==''?parseInt(markRaw):undefined;
      if(isNaN(mark))mark=undefined;
      if(!name)return;
      var m=bestMatch(name);
      var pct=Math.round(m.score*100);
      var status=pct>=85?'matched':pct>=60?'fuzzy':'unmatched';
      if(status!=='unmatched')matched++;else unmatched++;
      if(mark===undefined)noMark++;
      _xlMatches.push({raw:name,student:m.student,score:pct,status:status,mark:mark});
    });
 
    /* Summary */
    var sum=g('xlMatchSummary');
    if(sum)sum.innerHTML=
      '<div class="ana-row"><span class="ana-lbl">Total rows in file</span><span class="ana-val">'+rows.length+'</span></div>'+
      '<div class="ana-row"><span class="ana-lbl">Matched (≥85% similar)</span><span class="ana-val" style="color:#1a7a4a">'+matched+'</span></div>'+
      '<div class="ana-row"><span class="ana-lbl">Fuzzy match (60-84%)</span><span class="ana-val" style="color:#8a6800">'+(rows.length-unmatched-matched+(rows.length-unmatched-matched<0?0:0))+'</span></div>'+
      '<div class="ana-row"><span class="ana-lbl">Unmatched (&lt;60%)</span><span class="ana-val" style="color:var(--red)">'+unmatched+'</span></div>'+
      '<div class="ana-row"><span class="ana-lbl">Rows without mark</span><span class="ana-val" style="color:#8a6800">'+noMark+'</span></div>';
 
    var body=g('xlMatchBody');
    if(body)body.innerHTML=_xlMatches.map(function(m,i){
      var rowCls=m.status==='matched'?'match-row-ok':m.status==='fuzzy'?'match-row-warn':'match-row-err';
      var badge=m.status==='matched'?
        '<span style="background:#dcfce7;color:#166534;padding:2px 7px;font-size:10px;font-weight:800;border:1px solid #86efac">✓ MATCHED</span>':
        m.status==='fuzzy'?
        '<span style="background:#fef9c3;color:#854d0e;padding:2px 7px;font-size:10px;font-weight:800;border:1px solid #fde047">~ FUZZY</span>':
        '<span style="background:#fee2e2;color:#991b1b;padding:2px 7px;font-size:10px;font-weight:800;border:1px solid #fca5a5">✗ NO MATCH</span>';
      return'<tr class="'+rowCls+'">'+
        '<td style="color:var(--muted);font-size:11px">'+(i+1)+'</td>'+
        '<td style="font-weight:600">'+esc(m.raw)+'</td>'+
        '<td>'+(m.student?esc(m.student.name):'<span style="color:#aaa">—</span>')+'</td>'+
        '<td style="font-weight:800;color:'+(m.score>=85?'#1a7a4a':m.score>=60?'#8a6800':'var(--red)')+'">'+m.score+'%</td>'+
        '<td style="font-weight:800">'+(m.mark!==undefined?m.mark:'<span style="color:#aaa">—</span>')+'</td>'+
        '<td>'+badge+'</td>'+
      '</tr>';
    }).join('');
  }
 
  window.axpXLApply=function(){
    var applied=0,skipped=0;
    _xlMatches.forEach(function(m){
      if((m.status==='matched'||m.status==='fuzzy')&&m.student&&m.mark!==undefined&&m.mark>=0&&m.mark<=100){
        S.marks[m.student.name]=m.mark;
        applied++;
      }else{skipped++;}
    });
    saveCache();
    if(S.students.length&&S.idx<S.students.length){renderCard();}
    axpCloseBulk();
    axpToast('✅ '+applied+' marks applied from Excel file!','success');
    showPill(applied+' marks applied, '+skipped+' skipped','success');
    // refresh progress bar
    var filled=Object.keys(S.marks).length,total=S.students.length,pct=Math.round(filled/total*100);
    var pf=g('axpPF'),pp=g('axpPP'),pl=g('axpPL');
    if(pf)pf.style.width=pct+'%';
    if(pp)pp.textContent=pct+'%';
    if(pl)pl.textContent=filled+' / '+total+' filled';
  };
 
  window.axpXLReset=function(){
    _xlData=[];_xlMatches=[];
    var fi=g('xlFileInfo');if(fi)fi.style.display='none';
    var fi2=g('xlFileIn');if(fi2)fi2.value='';
    xlGoStep(1);
  };
 
 
  /* ══════════════════════════════════════════════════════════════════════════
     BULK IMPORT — SCAN / CAMERA OCR SECTION
     ══════════════════════════════════════════════════════════════════════════ */
 
  var _scStream=null;
  var _scImageDataUrl=null;
  var _scWorker=null;
  var _scParsedRows=[];
  var _scMatches=[];
  var _scQualTimer=null;
 
  function scGoStep(n){
    g('scPanel1').style.display=n===1?'block':'none';
    g('scPanel2').style.display=n===2?'block':'none';
    g('scPanel3').style.display=n===3?'block':'none';
    g('scPanel4').style.display=n===4?'block':'none';
    [1,2,3,4].forEach(function(i){
      var el=g('scStep'+i);
      if(el){
        el.classList.toggle('active',i===n);
        el.classList.toggle('done',i<n);
      }
    });
  }
 
  /* Camera start */
  window.axpCamStart=async function(){
    try{
      var stream=await navigator.mediaDevices.getUserMedia({
        video:{facingMode:'environment',width:{ideal:1920},height:{ideal:1080}}
      });
      _scStream=stream;
      var vid=g('axpCamVideo');
      vid.srcObject=stream;
      g('scCamUI').style.display='block';
      g('scPreviewUI').style.display='none';
      _scQualTimer=setInterval(axpCamAnalyseFrame,400);
    }catch(ex){
      axpAlert('Camera Error','Could not access camera: '+ex.message+'<br><br>Please allow camera permissions or use the Upload option.','danger');
    }
  };
 
  window.axpCamStop=function(){
    if(_scStream){_scStream.getTracks().forEach(function(t){t.stop();});_scStream=null;}
    clearInterval(_scQualTimer);
    var ui=g('scCamUI');if(ui)ui.style.display='none';
  };
 
  /* Real-time quality analysis from video frame */
  window.axpCamAnalyseFrame=function(){
    var vid=g('axpCamVideo');
    if(!vid||!vid.videoWidth)return;
    var canvas=document.createElement('canvas');
    canvas.width=Math.min(vid.videoWidth,320);
    canvas.height=Math.round(canvas.width*(vid.videoHeight/vid.videoWidth));
    var ctx=canvas.getContext('2d');
    ctx.drawImage(vid,0,0,canvas.width,canvas.height);
    var qual=analyseImageQuality(ctx,canvas.width,canvas.height);
    var qb=g('scQBright'),qc=g('scQContrast'),qbl=g('scQBlur'),msg=g('scCamMsg');
    if(qb)qb.textContent=qual.bright+'%';
    if(qc)qc.textContent=qual.contrast+'%';
    if(qbl)qbl.textContent=qual.sharp;
    /* Colour indicators */
    if(qb)qb.style.color=qual.bright>30&&qual.bright<90?'#1a7a4a':'var(--red)';
    if(qc)qc.style.color=qual.contrast>20?'#1a7a4a':'var(--red)';
    /* Message guidance */
    var tips=[];
    if(qual.bright<30)tips.push('Too dark — improve lighting');
    else if(qual.bright>90)tips.push('Too bright — reduce glare');
    if(qual.contrast<20)tips.push('Low contrast — use flat surface');
    if(qual.sharpScore<50)tips.push('Blurry — hold camera steady');
    if(msg)msg.textContent=tips.length?tips[0]:'✓ Good — tap Capture when ready';
    /* Pulse capture button green if quality ok */
    var btn=g('scCamCapBtn');
    if(btn)btn.style.background=tips.length?'':'#1a7a4a';
  };
 
  /* Analyse image quality: brightness, contrast, sharpness via Laplacian variance */
  function analyseImageQuality(ctx,w,h){
    var data;
    try{data=ctx.getImageData(0,0,w,h).data;}catch(ex){return{bright:50,contrast:50,sharp:'OK',sharpScore:50};}
    var sum=0,min=255,max=0,px=data.length/4;
    var grays=[];
    for(var i=0;i<data.length;i+=4){
      var gray=0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];
      sum+=gray;if(gray<min)min=gray;if(gray>max)max=gray;
      grays.push(gray);
    }
    var mean=sum/px;
    var bright=Math.round(mean/255*100);
    var contrast=Math.round((max-min)/255*100);
    /* Laplacian variance for sharpness (sample every 4th pixel for performance) */
    var lap=0,lapN=0;
    var stride=Math.max(1,Math.round(Math.sqrt(px/5000)));
    for(var y2=1;y2<h-1;y2+=stride){
      for(var x2=1;x2<w-1;x2+=stride){
        var idx=(y2*w+x2)*4;
        var g1=0.299*data[idx-4]+0.587*data[idx-3]+0.114*data[idx-2];
        var g2=0.299*data[idx+4]+0.587*data[idx+5]+0.114*data[idx+6];
        var g3=0.299*data[idx-w*4]+0.587*data[idx-w*4+1]+0.114*data[idx-w*4+2];
        var g4=0.299*data[idx+w*4]+0.587*data[idx+w*4+1]+0.114*data[idx+w*4+2];
        var gc=0.299*data[idx]+0.587*data[idx+1]+0.114*data[idx+2];
        var lapVal=Math.abs(g1+g2+g3+g4-4*gc);
        lap+=lapVal*lapVal;lapN++;
      }
    }
    var sharpScore=lapN>0?Math.min(100,Math.round(Math.sqrt(lap/lapN)*2)):50;
    var sharpLabel=sharpScore>60?'Sharp':sharpScore>30?'OK':'Blurry';
    return{bright:bright,contrast:contrast,sharp:sharpLabel,sharpScore:sharpScore};
  }
 
  window.axpCamCapture=function(){
    var vid=g('axpCamVideo'),canvas=g('scCamCanvas');
    if(!vid||!canvas)return;
    canvas.width=vid.videoWidth||1280;
    canvas.height=vid.videoHeight||720;
    var ctx=canvas.getContext('2d');
    ctx.drawImage(vid,0,0);
    /* Enhance: increase contrast slightly */
    var imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
    var d=imgData.data;
    for(var i=0;i<d.length;i+=4){
      d[i]=Math.min(255,Math.max(0,(d[i]-128)*1.2+128));
      d[i+1]=Math.min(255,Math.max(0,(d[i+1]-128)*1.2+128));
      d[i+2]=Math.min(255,Math.max(0,(d[i+2]-128)*1.2+128));
    }
    ctx.putImageData(imgData,0,0);
    _scImageDataUrl=canvas.toDataURL('image/jpeg',0.92);
    axpCamStop();
    showPreview(_scImageDataUrl);
  };
 
  window.axpScanFile=function(inp){
    if(!inp.files||!inp.files[0])return;
    var file=inp.files[0];
    if(file.type==='application/pdf'){
      /* PDF via canvas */
      axpPdfToImage(file);
    }else{
      var reader=new FileReader();
      reader.onload=function(e){
        _scImageDataUrl=e.target.result;
        showPreview(_scImageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };
 
  async function axpPdfToImage(file){
    showPill('Converting PDF to image…','info');
    try{
      /* Load pdf.js from CDN */
      if(!window.pdfjsLib){
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      var buf=await file.arrayBuffer();
      var pdf=await window.pdfjsLib.getDocument({data:buf}).promise;
      var page=await pdf.getPage(1);
      var vp=page.getViewport({scale:2.0});
      var canvas=document.createElement('canvas');
      canvas.width=vp.width;canvas.height=vp.height;
      var ctx=canvas.getContext('2d');
      await page.render({canvasContext:ctx,viewport:vp}).promise;
      _scImageDataUrl=canvas.toDataURL('image/jpeg',0.92);
      showPreview(_scImageDataUrl);
    }catch(ex){
      axpAlert('PDF Error','Could not convert PDF: '+ex.message+'<br>Try uploading as a JPG/PNG image instead.','danger');
    }
  }
 
  function showPreview(dataUrl){
    var img=g('scPreviewImg');
    if(img)img.src=dataUrl;
    g('scCamUI').style.display='none';
    g('scPreviewUI').style.display='block';
    /* Analyse quality */
    var tempImg=new Image();
    tempImg.onload=function(){
      var canvas=document.createElement('canvas');
      var maxW=300;
      canvas.width=maxW;
      canvas.height=Math.round(tempImg.height*(maxW/tempImg.width));
      var ctx=canvas.getContext('2d');
      ctx.drawImage(tempImg,0,0,canvas.width,canvas.height);
      var qual=analyseImageQuality(ctx,canvas.width,canvas.height);
      var ib=g('scIQBright'),ic=g('scIQContrast'),iq=g('scIQScore');
      if(ib){ib.textContent=qual.bright+'%';ib.style.color=qual.bright>30&&qual.bright<90?'#1a7a4a':'var(--red)';}
      if(ic){ic.textContent=qual.contrast+'%';ic.style.color=qual.contrast>15?'#1a7a4a':'#8a6800';}
      var score=Math.round((Math.min(100,qual.contrast*2)+qual.sharpScore+(qual.bright>30&&qual.bright<90?100:40))/3);
      if(iq){iq.textContent=score+'%';iq.style.color=score>65?'#1a7a4a':score>40?'#8a6800':'var(--red)';}
      var warn=g('scQualWarn');
      var warnings=[];
      if(qual.bright<25)warnings.push('Image is very dark. Better lighting will improve accuracy.');
      else if(qual.bright>92)warnings.push('Image may be overexposed. Reduce glare for better results.');
      if(qual.contrast<15)warnings.push('Low contrast detected. Try a higher resolution scan.');
      if(qual.sharpScore<30)warnings.push('Image appears blurry. A clearer capture will improve OCR accuracy.');
      if(warn){
        if(warnings.length){warn.style.display='block';warn.innerHTML='<i class="bi bi-exclamation-triangle"></i> <strong>Quality warnings:</strong><ul style="margin-top:5px;padding-left:18px">'+warnings.map(function(w){return'<li>'+w+'</li>';}).join('')+'</ul>';}
        else{warn.style.display='none';}
      }
    };
    tempImg.src=dataUrl;
    scGoStep(1);
  }
 
  /* Analyse / OCR */
  window.axpScanAnalyse=async function(){
    if(!_scImageDataUrl){axpAlert('No Image','Please capture or upload an image first.','warning');return;}
    scGoStep(2);
    /* Load Tesseract.js from CDN */
    setOcrProgress(5,'Loading OCR engine…','Loading Tesseract.js OCR library');
    try{
      if(!window.Tesseract){
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.2/tesseract.min.js');
      }
      setOcrProgress(15,'Initialising worker…','Starting OCR worker thread');
      var worker=await Tesseract.createWorker('eng',1,{
        logger:function(m){
          if(m.status==='recognizing text'){
            setOcrProgress(20+Math.round(m.progress*70),'Recognising text… '+Math.round(m.progress*100)+'%','OCR in progress');
          }
        }
      });
      setOcrProgress(90,'Finalising recognition…','Post-processing text');
      var result=await worker.recognize(_scImageDataUrl,{},{blocks:true});
      await worker.terminate();
      setOcrProgress(100,'Analysis complete!','Done');
 
      var rawText=result.data.text||'';
      var confidence=Math.round(result.data.confidence||0);
      var lines=rawText.split('\n').filter(function(l){return l.trim().length>1;});
 
      /* Show analysis result */
      var anaSumEl=g('scAnaSummary');
      if(anaSumEl)anaSumEl.innerHTML=
        '<div class="ana-row"><span class="ana-lbl">OCR Confidence</span><span class="ana-val" style="color:'+(confidence>70?'#1a7a4a':confidence>50?'#8a6800':'var(--red)')+'">'+confidence+'%</span></div>'+
        '<div class="ana-row"><span class="ana-lbl">Lines extracted</span><span class="ana-val">'+lines.length+'</span></div>'+
        '<div class="ana-row"><span class="ana-lbl">Total characters</span><span class="ana-val">'+rawText.replace(/\s/g,'').length+'</span></div>'+
        '<div class="ana-row"><span class="ana-lbl">Engine</span><span class="ana-val">Tesseract.js v5 (LSTM)</span></div>';
 
      var rt=g('scRawTxt');
      if(rt)rt.value=lines.slice(0,60).join('\n');
 
      /* Store for next step */
      window._scRawLines=lines;
      window._scRawText=rawText;
 
      setTimeout(function(){
        var ar=g('scAnalyseResult'),ai=g('scAnalysing');
        if(ar)ar.style.display='block';
        if(ai)ai.style.display='none';
      },400);
 
    }catch(ex){
      var ai=g('scAnalysing');if(ai)ai.style.display='none';
      axpAlert('OCR Error','OCR failed: '+ex.message+'<br><br>Please check your internet connection and try again.','danger');
      scGoStep(1);
    }
  };
 
  function setOcrProgress(pct,txt,sub){
    var bar=g('scOcrBar'),t=g('scAnalyseTxt'),s=g('scAnalyseSub'),ai=g('scAnalysing');
    if(bar)bar.style.width=pct+'%';
    if(t)t.textContent=txt;
    if(s)s.textContent=sub||'';
    if(ai)ai.style.display='block';
  }
 
  /* Parse OCR text into name+mark rows */
  window.axpScanParseAndMatch=function(){
    var lines=window._scRawLines||[];
    if(!lines.length){axpAlert('No Text','No text was extracted. Try re-capturing.','warning');return;}
 
    var extracted=[];
 
    /* Strategy: look for lines containing a name-like string and a number 0-100
       Multiple heuristics tried in order */
    lines.forEach(function(line){
      line=line.trim();
      if(line.length<3)return;
 
      /* Pattern 1: "Name ... 85" or "Name 85" */
      var numMatch=line.match(/(\d{1,3})\s*$/);
      var num=numMatch?parseInt(numMatch[1]):undefined;
      if(num!==undefined&&num>=0&&num<=100){
        var namePart=line.replace(/\d+\s*$/,'').replace(/[^\w\s\-'\.]/g,'').trim();
        if(namePart.length>=3&&namePart.replace(/\d/g,'').trim().length>=3){
          extracted.push({raw:namePart,rawLine:line,mark:num});
          return;
        }
      }
      /* Pattern 2: "Name | 85" tab/pipe separated */
      var parts=line.split(/[\|\t]+/);
      if(parts.length>=2){
        var lastPart=parts[parts.length-1].trim();
        var n2=parseInt(lastPart);
        if(!isNaN(n2)&&n2>=0&&n2<=100){
          var namePart2=parts.slice(0,parts.length-1).join(' ').replace(/[^\w\s\-'\.]/g,'').trim();
          if(namePart2.length>=3){
            extracted.push({raw:namePart2,rawLine:line,mark:n2});
            return;
          }
        }
      }
      /* Pattern 3: Number at start then name then number */
      var p3=line.match(/^\d+[\.\)]\s+(.+?)\s+(\d{1,3})\s*$/);
      if(p3){
        var n3=parseInt(p3[2]);
        if(n3>=0&&n3<=100){
          extracted.push({raw:p3[1].replace(/[^\w\s\-'\.]/g,'').trim(),rawLine:line,mark:n3});
          return;
        }
      }
    });
 
    if(!extracted.length){
      axpAlert('No Data Found',
        'Could not automatically detect name/mark pairs in the extracted text.<br><br>'+
        'Tips:<br>• Ensure the document has clear columns for Name and Mark/Score<br>'+
        '• Try a higher quality photo or scan<br>'+
        '• Numbers (0-100) must appear near names on the same line',
        'warning');
      return;
    }
 
    /* Now match to student list */
    _scMatches=[];
    var matched=0,unmatched=0;
    extracted.forEach(function(ex){
      var m=bestMatch(ex.raw);
      var pct=Math.round(m.score*100);
      var status=pct>=82?'matched':pct>=58?'fuzzy':'unmatched';
      if(status!=='unmatched')matched++;else unmatched++;
      _scMatches.push({raw:ex.raw,rawLine:ex.rawLine,student:m.student,score:pct,status:status,mark:ex.mark});
    });
 
    /* Render summary */
    var ms=g('scMatchSummary');
    var fuzzyCount=_scMatches.filter(function(m){return m.status==='fuzzy';}).length;
    if(ms)ms.innerHTML=
      '<div class="ana-row"><span class="ana-lbl">Lines with name+mark detected</span><span class="ana-val">'+extracted.length+'</span></div>'+
      '<div class="ana-row"><span class="ana-lbl">Matched to students (≥82%)</span><span class="ana-val" style="color:#1a7a4a">'+matched+'</span></div>'+
      '<div class="ana-row"><span class="ana-lbl">Fuzzy match (58-81%)</span><span class="ana-val" style="color:#8a6800">'+fuzzyCount+'</span></div>'+
      '<div class="ana-row"><span class="ana-lbl">Unmatched (&lt;58%)</span><span class="ana-val" style="color:var(--red)">'+unmatched+'</span></div>';
 
    var body=g('scMatchBody');
    if(body)body.innerHTML=_scMatches.map(function(m,i){
      var rowCls=m.status==='matched'?'match-row-ok':m.status==='fuzzy'?'match-row-warn':'match-row-err';
      var badge=m.status==='matched'?
        '<span style="background:#dcfce7;color:#166534;padding:2px 7px;font-size:10px;font-weight:800;border:1px solid #86efac">✓ MATCHED</span>':
        m.status==='fuzzy'?
        '<span style="background:#fef9c3;color:#854d0e;padding:2px 7px;font-size:10px;font-weight:800;border:1px solid #fde047">~ FUZZY</span>':
        '<span style="background:#fee2e2;color:#991b1b;padding:2px 7px;font-size:10px;font-weight:800;border:1px solid #fca5a5">✗ SKIP</span>';
      /* editable mark input */
      var markInput='<input type="number" min="0" max="100" value="'+(m.mark!==undefined?m.mark:'')+'" '+
        'style="width:58px;padding:2px 5px;text-align:center;border:1px solid var(--border);font-size:11px;font-weight:700;background:var(--panel)" '+
        'onchange="window._scMatches['+i+'].mark=parseInt(this.value)||undefined" '+
        'oninput="if(parseInt(this.value)>100)this.value=100">';
      return'<tr class="'+rowCls+'">'+
        '<td style="color:var(--muted);font-size:11px">'+(i+1)+'</td>'+
        '<td style="font-weight:600;font-size:11px;max-width:130px;word-break:break-word">'+esc(m.raw)+'</td>'+
        '<td>'+(m.student?esc(m.student.name):'<span style="color:#aaa">—</span>')+'</td>'+
        '<td style="font-weight:800;color:'+(m.score>=82?'#1a7a4a':m.score>=58?'#8a6800':'var(--red)')+'">'+m.score+'%</td>'+
        '<td>'+markInput+'</td>'+
        '<td>'+badge+'</td>'+
      '</tr>';
    }).join('');
 
    /* Show unmatched list */
    var unm=_scMatches.filter(function(m){return m.status==='unmatched';});
    var unEl=g('scUnmatched'),unList=g('scUnmatchedList');
    if(unEl&&unList){
      if(unm.length){
        unEl.style.display='block';
        unList.innerHTML=unm.map(function(m){return'<div>'+esc(m.raw)+' → <em>no match</em></div>';}).join('');
      }else{unEl.style.display='none';}
    }
 
    scGoStep(3);
  };
 
  window.axpScanApply=function(){
    var applied=0,skipped=0;
    _scMatches.forEach(function(m){
      if((m.status==='matched'||m.status==='fuzzy')&&m.student&&m.mark!==undefined&&m.mark>=0&&m.mark<=100){
        S.marks[m.student.name]=m.mark;
        applied++;
      }else{skipped++;}
    });
    saveCache();
    if(S.students.length&&S.idx<S.students.length){renderCard();}
 
    /* Step 4 success */
    var sub=g('scAppliedSub');
    if(sub)sub.innerHTML='<strong style="color:var(--gold2);font-size:22px">'+applied+'</strong> marks applied from scanned sheet<br>'+skipped+' entries skipped (unmatched or no mark)';
    scGoStep(4);
 
    var filled=Object.keys(S.marks).length,total=S.students.length,pct=Math.round(filled/total*100);
    var pf=g('axpPF'),pp=g('axpPP'),pl=g('axpPL');
    if(pf)pf.style.width=pct+'%';
    if(pp)pp.textContent=pct+'%';
    if(pl)pl.textContent=filled+' / '+total+' filled';
 
    axpToast('✅ '+applied+' marks applied from scan!','success');
  };
 
  window.axpScanReset=function(){
    _scImageDataUrl=null;_scParsedRows=[];_scMatches=[];
    window._scRawLines=[];window._scRawText='';
    axpCamStop();
    var pu=g('scPreviewUI'),cu=g('scCamUI'),ar=g('scAnalyseResult'),ai=g('scAnalysing');
    if(pu)pu.style.display='none';
    if(cu)cu.style.display='none';
    if(ar)ar.style.display='none';
    if(ai){ai.style.display='block';}
    var fi=g('scFileIn');if(fi)fi.value='';
    var rt=g('scRawTxt');if(rt)rt.value='';
    var ocrBar=g('scOcrBar');if(ocrBar)ocrBar.style.width='0%';
    scGoStep(1);
  };
 
 
  /* ══════════════════════════════════════════════════════════════════════════ HELPERS */
  function loadScript(src){
    return new Promise(function(res,rej){
      var existing=document.querySelector('script[src="'+src+'"]');
      if(existing){res();return;}
      var s=document.createElement('script');s.src=src;
      s.onload=res;s.onerror=function(){rej(new Error('Failed to load: '+src));};
      document.head.appendChild(s);
    });
  }
 
  function calcGrade(v){
    if(v===undefined||v===null||v==='')return{g:'—',c:'#334155'};
    var n=parseInt(v);if(isNaN(n))return{g:'—',c:'#334155'};
    if(n>=75)return{g:'A',c:'#10b981'};if(n>=65)return{g:'B',c:'#4ecca3'};
    if(n>=45)return{g:'C',c:'#f59e0b'};if(n>=30)return{g:'D',c:'#f97316'};
    return{g:'F',c:'#ef4444'};
  }
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
 
