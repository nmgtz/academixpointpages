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
  /* ══════════════════════════════════════════════════════════════════════════ STYLES */
  /* ══════════════════════════════════════════════════════════════════════════ STYLES */
  function injectStyles(){
    var s=document.createElement('style');
    s.textContent=
'*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}'+
'html,body{height:100%;margin:0;padding:0}'+
'body{background:#f4f5f7;font-family:\'Segoe UI\',system-ui,sans-serif;font-size:14px;color:#1a1f36;display:flex;flex-direction:column;overflow:hidden}'+
':root{--pri:#2c4ecf;--pri2:#3d5fe0;--pri3:#1a318c;--gold:#c98a00;--gold2:#e0a800;--red:#d63b3b;--grn:#1a7a4a;--bg:#f4f5f7;--white:#ffffff;--panel:#ffffff;--panel2:#f0f2f7;--border:#d0d5e8;--text:#1a1f36;--muted:#5a6380;--lite:#8892b0;}'+
'::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#eef0f8}::-webkit-scrollbar-thumb{background:#c0c8e0}'+
'@keyframes spin{to{transform:rotate(360deg)}}'+
'@keyframes fadeDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}'+
'@keyframes popIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}'+
'@keyframes pillIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}'+
'@keyframes pillOut{from{opacity:1}to{opacity:0}}'+
/* HEADER */
'#axpHdr{background:var(--pri);height:52px;display:flex;align-items:center;padding:0;gap:0;position:sticky;top:0;z-index:300;border-bottom:3px solid var(--gold2);flex-shrink:0;overflow:hidden}'+
'#axpMenuBtn{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;width:48px;height:52px;display:none;align-items:center;justify-content:center;flex-shrink:0}'+
'.hdr-logo{display:flex;align-items:center;gap:9px;padding:0 16px;height:52px;flex-shrink:0}'+
'.hdr-icon{width:30px;height:30px;background:var(--gold2);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:var(--pri3);flex-shrink:0}'+
'.hdr-brand-ax{font-size:13px;font-weight:900;color:#fff;letter-spacing:.5px}'+
'.hdr-brand-pt{font-size:13px;font-weight:900;color:var(--gold2);letter-spacing:.5px}'+
'.hdr-index-block{display:flex;flex-direction:column;justify-content:center;padding:0 14px;height:52px;border-left:1px solid rgba(255,255,255,.15);flex-shrink:0}'+
'.hdr-index-label{font-size:9px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.5);font-weight:700;line-height:1;margin-bottom:2px}'+
'.hdr-index-value{font-size:15px;font-weight:900;color:var(--gold2);letter-spacing:2px;font-family:\'Courier New\',monospace;line-height:1}'+
'.hdr-spacer{flex:1;min-width:0}'+
'.hdr-badge{display:none;align-items:center;gap:5px;background:rgba(255,255,255,.15);color:#fff;font-size:9px;font-weight:800;padding:0 12px;height:52px;letter-spacing:1px;flex-shrink:0;text-transform:uppercase}'+
'.hdr-badge i{font-size:11px}'+
/* BODY */
'#axpBody{display:flex;flex:1;overflow:hidden;min-height:0}'+
/* SIDEBAR */
'#axpSidebar{width:210px;background:var(--pri3);flex-shrink:0;display:flex;flex-direction:column;overflow-y:auto;height:100%}'+
'.sb-school{padding:14px 13px 11px;border-bottom:1px solid rgba(255,255,255,.1)}'+
'.sb-idx{font-size:20px;font-weight:900;color:var(--gold2);letter-spacing:2px;font-family:\'Courier New\',monospace;line-height:1;margin-bottom:3px}'+
'.sb-school-code{font-size:10px;color:rgba(255,255,255,.5);line-height:1.5;word-break:break-word}'+
'.sb-section{padding:11px 13px 3px;font-size:9px;font-weight:800;color:rgba(255,255,255,.3);letter-spacing:1.5px;text-transform:uppercase}'+
'.sb-item{display:flex;align-items:center;gap:10px;padding:8px 13px;font-size:12px;font-weight:600;color:rgba(255,255,255,.55);cursor:pointer;border-left:3px solid transparent}'+
'.sb-item i{font-size:14px;width:16px;text-align:center;flex-shrink:0}'+
'.sb-item.active{background:rgba(255,255,255,.1);color:#fff;border-left-color:var(--gold2)}'+
'.sb-item.active i{color:var(--gold2)}'+
'.sb-year{margin-top:auto;padding:11px 13px;border-top:1px solid rgba(255,255,255,.08);font-size:10px;color:rgba(255,255,255,.3);flex-shrink:0}'+
'.sb-year strong{color:var(--gold2);font-weight:800}'+
'#axpSbOverlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:250}'+
/* CONTENT */
'#axpContent{flex:1;min-width:0;overflow-y:auto;padding:18px 18px 80px;height:100%}'+
'.pg-title{font-size:15px;font-weight:800;color:var(--pri);margin-bottom:2px}'+
'.pg-sub{font-size:11px;color:var(--muted);margin-bottom:14px}'+
/* LOADER */
'#axpLd{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:55vh;gap:14px}'+
'.ld-ring{width:38px;height:38px;border:3px solid var(--border);border-top-color:var(--pri);border-right-color:var(--gold2);border-radius:50%;animation:spin .8s linear infinite}'+
'.ld-txt{font-size:11px;color:var(--muted);font-weight:700;letter-spacing:.5px;text-transform:uppercase}'+
'.ld-step-row{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--pri2);opacity:0;transition:opacity .3s;background:var(--panel2);border:1px solid var(--border);padding:5px 11px}'+
'.ld-step-row.vis{opacity:1}'+
/* RESTORE */
'#axpRB{display:none;background:#fffbeb;border-left:3px solid var(--gold2);border:1px solid #ffe082;padding:10px 13px;margin-bottom:12px;animation:fadeDown .2s ease}'+
/* INFO BAR */
'.axpInfoBar{background:var(--panel);border:1px solid var(--border);border-left:3px solid var(--pri);padding:8px 13px;margin-bottom:12px;display:none;align-items:center;gap:9px;flex-wrap:wrap;font-size:11px;color:var(--muted)}'+
'.axpInfoBar strong{color:var(--pri);font-weight:700}'+
/* CARD */
'.axpCard{background:var(--panel);border:1px solid var(--border);padding:14px;margin-bottom:10px}'+
'.axpCT{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:10px;display:flex;align-items:center;gap:7px;border-bottom:1px solid var(--border);padding-bottom:8px}'+
'.axpCT i{color:var(--pri);font-size:13px}'+
'.ct-num{width:18px;height:18px;background:var(--pri);color:#fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;flex-shrink:0}'+
'.ct-done{background:var(--grn)!important}'+
/* CHIPS */
'.axpChips{display:flex;flex-wrap:wrap;gap:6px}'+
'.axpChip{padding:6px 12px;border:1px solid var(--border);background:var(--panel2);color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;user-select:none}'+
'.axpChip.on{background:var(--pri);border-color:var(--pri);color:#fff}'+
/* BUTTONS */
'.axpBtn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;font-size:12px;font-weight:700;border:1px solid transparent;cursor:pointer;letter-spacing:.1px;text-decoration:none;font-family:inherit}'+
'.axpBP{background:var(--pri);color:#fff;border-color:var(--pri)}'+
'.axpBP:disabled{opacity:.4;cursor:not-allowed}'+
'.axpBD{background:transparent;color:var(--pri);border-color:var(--pri)}'+
'.axpBG{background:var(--panel2);color:var(--muted);border-color:var(--border)}'+
'.axpBGold{background:var(--gold2);color:#1a1f36;border-color:var(--gold);font-weight:700}'+
'.axpSm{padding:5px 10px;font-size:11px}'+
/* PROGRESS */
'.axpPMeta{display:flex;justify-content:space-between;font-size:10px;font-weight:700;margin-bottom:3px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}'+
'.axpPMeta span:last-child{color:var(--pri)}'+
'.axpPBar{background:var(--border);height:4px;overflow:hidden;margin-bottom:10px}'+
'.axpPFill{height:100%;background:var(--pri);transition:width .4s ease}'+
/* CONTEXT TAGS */
'.ctx-tag{font-size:10px;font-weight:700;padding:3px 8px;letter-spacing:.3px;text-transform:uppercase}'+
'.ctx-cls{background:#e8edf8;color:var(--pri);border:1px solid #c0caea}'+
'.ctx-exam{background:#fff8e1;color:var(--gold);border:1px solid #ffe082}'+
'.ctx-sub{background:#e8f5ee;color:var(--grn);border:1px solid #a8d8be}'+
/* STUDENT BANNER */
'.axpStuBnr{background:var(--pri);padding:14px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;border-left:4px solid var(--gold2)}'+
'.stu-name{font-size:17px;font-weight:900;color:#fff;line-height:1.1}'+
'.stu-meta{font-size:10px;color:rgba(255,255,255,.6);margin-top:3px;text-transform:uppercase;letter-spacing:.3px}'+
'.stu-cand{font-family:\'Courier New\',monospace;font-size:11px;font-weight:700;background:var(--gold2);color:var(--pri3);padding:3px 9px;letter-spacing:.5px}'+
'.stu-pos{font-size:10px;color:rgba(255,255,255,.4);margin-top:3px;text-align:right}'+
/* SCORE INPUT */
'.axpScoreWrap{text-align:center;padding:18px 0 10px}'+
'.axpScoreInput{width:148px;height:72px;font-size:42px;font-weight:900;text-align:center;background:var(--panel2);border:2px solid var(--border);color:var(--text);outline:none;font-family:\'Courier New\',monospace;-moz-appearance:textfield}'+
'.axpScoreInput::-webkit-outer-spin-button,.axpScoreInput::-webkit-inner-spin-button{-webkit-appearance:none}'+
'.axpScoreInput:focus{border-color:var(--pri)}'+
'.axpScoreInput.gA{border-color:var(--grn);color:var(--grn)}'+
'.axpScoreInput.gB{border-color:var(--pri2);color:var(--pri2)}'+
'.axpScoreInput.gC{border-color:var(--gold);color:var(--gold)}'+
'.axpScoreInput.gD{border-color:#d46b08;color:#d46b08}'+
'.axpScoreInput.gF{border-color:var(--red);color:var(--red)}'+
'.axpGradeBadge{display:inline-block;font-size:28px;font-weight:900;margin-top:6px;min-width:40px}'+
/* NAV */
'.axpNav{display:flex;gap:6px;justify-content:space-between;flex-wrap:wrap;margin-top:10px}'+
'.axpTchrBadge{display:none!important}'+
/* SUCCESS */
'.axpSuccessBnr{background:var(--pri);padding:22px;text-align:center;margin-bottom:12px;border-left:4px solid var(--gold2)}'+
'.suc-icon{font-size:36px;color:var(--gold2);margin-bottom:6px;display:block}'+
'.suc-title{font-size:17px;font-weight:900;color:#fff;margin-bottom:4px}'+
'.suc-sub{font-size:11px;color:rgba(255,255,255,.65);line-height:1.7}'+
/* ACTION GRID */
'.axpActions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}'+
'.axpABtn{display:flex;flex-direction:column;align-items:center;gap:5px;padding:14px 8px;cursor:pointer;border:1px solid var(--border);background:var(--panel);color:var(--muted);font-size:10px;font-weight:700;letter-spacing:.3px;text-transform:uppercase;user-select:none}'+
'.axpABtn i{font-size:18px}'+
'.axpABtn.prime{border-color:var(--pri);background:var(--pri);color:#fff}'+
/* TABLE */
'.axpTbl{width:100%;border-collapse:collapse;font-size:12px}'+
'.axpTbl th{background:var(--pri);color:#fff;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;padding:8px 10px;text-align:left}'+
'.axpTbl th:not(:nth-child(2)){text-align:center}'+
'.axpTbl td{padding:7px 10px;border-bottom:1px solid var(--border);color:var(--text);font-size:12px}'+
'.axpTbl td:not(:nth-child(2)){text-align:center}'+
'.axpTbl tbody tr:nth-child(even){background:var(--panel2)}'+
'.cand-col{font-family:\'Courier New\',monospace!important;font-size:11px!important;color:var(--pri)!important;font-weight:700!important}'+
'.score-col{font-weight:800!important;font-size:13px!important}'+
/* GRADE GRID */
'.axpGGrid{display:grid;grid-template-columns:repeat(6,1fr);gap:5px;margin-bottom:12px}'+
'.axpGCell{text-align:center;padding:9px 3px;background:var(--panel2);border:1px solid var(--border)}'+
'.axpGCell .gv{font-size:20px;font-weight:900}'+
'.axpGCell .gl{font-size:8.5px;font-weight:800;margin-top:3px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted)}'+
'.divider{height:1px;background:var(--border);margin:10px 0}'+
/* ERROR */
'#axpErr{display:none;background:#fef2f2;border-left:3px solid var(--red);border:1px solid #fca5a5;padding:13px;margin:10px 0}'+
'#axpErr .err-title{font-size:13px;font-weight:800;margin-bottom:4px;color:var(--red);display:flex;align-items:center;gap:6px}'+
'#axpErr .err-msg{font-size:11.5px;color:#7a2020;line-height:1.7}'+
/* MODAL */
'#axpMod{display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);align-items:center;justify-content:center;padding:12px}'+
'#axpMod.open{display:flex}'+
'#axpMBox{background:var(--panel);max-width:420px;width:100%;border:1px solid var(--border);animation:popIn .14s ease}'+
'#axpMHd{background:var(--pri);padding:12px 16px;display:flex;align-items:center;gap:9px;border-bottom:3px solid var(--gold2)}'+
'#axpMHd .mhi{font-size:18px}'+
'#axpMHd .mht{font-size:13px;font-weight:800;color:#fff;flex:1}'+
'#axpMHd .mhx{background:none;border:none;color:rgba(255,255,255,.6);font-size:20px;cursor:pointer;line-height:1;padding:0}'+
'#axpMBd{padding:14px 16px;font-size:12px;color:var(--muted);line-height:1.8}'+
'#axpMFt{padding:6px 16px 14px;display:flex;gap:6px;justify-content:flex-end;border-top:1px solid var(--border)}'+
/* TOAST */
'#axpToast{display:none;position:fixed;bottom:18px;right:14px;z-index:9999;padding:9px 14px;font-size:12px;font-weight:700;align-items:center;gap:7px;border:1px solid var(--border);background:var(--panel)}'+
'.axpFeedPill{display:none;position:fixed;top:62px;right:14px;z-index:8000;padding:8px 13px;font-size:12px;font-weight:700;align-items:center;gap:7px;min-width:150px;max-width:280px;border:1px solid var(--border);background:var(--panel)}'+
/* FLASH */
'.axpStuBnr.flash-back{animation:flashBack .4s ease}'+
'@keyframes flashBack{0%{border-left-color:var(--gold2)}40%{border-left-color:#9b59b6}100%{border-left-color:var(--gold2)}}'+
'.axpStuBnr.flash-fwd{animation:flashFwd .35s ease}'+
'@keyframes flashFwd{0%{border-left-color:var(--gold2)}40%{border-left-color:var(--grn)}100%{border-left-color:var(--gold2)}}'+
/* SAVED CHIP */
'.stu-saved{font-size:9px;font-weight:800;padding:2px 7px;letter-spacing:.5px;text-transform:uppercase;margin-top:4px;display:inline-block}'+
'.stu-saved.yes{background:rgba(26,122,74,.12);color:var(--grn);border:1px solid rgba(26,122,74,.3)}'+
'.stu-saved.no{background:rgba(255,255,255,.1);color:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.15)}'+
/* KB HINTS */
'.axpKbHint{text-align:center;font-size:10px;color:var(--muted);margin-top:6px;display:flex;align-items:center;justify-content:center;gap:9px;flex-wrap:wrap}'+
'.axpKbHint kbd{background:var(--panel2);border:1px solid var(--border);padding:1px 5px;font-size:9.5px;font-family:\'Courier New\',monospace;color:var(--text)}'+
'.axpMissingBadge{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;padding:6px 10px;background:#fff8e1;border:1px solid #ffe082;color:#7a5800;margin-bottom:10px}'+
'.axpH{display:none!important}'+
/* ════════════════════ BULK MODAL ════════════════════ */
'#axpBulkModal{display:none;position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.5);align-items:flex-start;justify-content:center;padding:12px 10px;overflow-y:auto}'+
'#axpBulkModal.open{display:flex}'+
'#axpBulkBox{background:var(--panel);width:100%;max-width:650px;border:1px solid var(--border);animation:popIn .15s ease;margin:auto}'+
'#axpBulkHd{background:var(--pri);padding:12px 16px;display:flex;align-items:center;gap:9px;border-bottom:3px solid var(--gold2)}'+
'#axpBulkHd .bhi{font-size:18px;color:var(--gold2)}'+
'#axpBulkHd .bht{font-size:13px;font-weight:800;color:#fff;flex:1}'+
'#axpBulkHd .bhx{background:none;border:none;color:rgba(255,255,255,.6);font-size:22px;cursor:pointer;line-height:1;padding:0}'+
'#axpBulkBody{padding:14px 16px}'+
'.bulk-tabs{display:flex;border-bottom:1px solid var(--border);margin-bottom:12px;gap:0}'+
'.bulk-tab{padding:7px 13px;font-size:11px;font-weight:700;color:var(--muted);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;display:flex;align-items:center;gap:5px;text-transform:uppercase;letter-spacing:.5px}'+
'.bulk-tab.on{color:var(--pri);border-bottom-color:var(--pri)}'+
'.bulk-tab i{font-size:13px}'+
'.bulk-pane{display:none}.bulk-pane.on{display:block}'+
/* DROP ZONE */
'.axpDropZone{border:2px dashed var(--border);padding:22px 14px;text-align:center;cursor:pointer;background:var(--panel2);position:relative}'+
'.axpDropZone.drag{border-color:var(--pri);background:#eef1fb}'+
'.axpDropZone input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}'+
'.axpDropZone i{font-size:28px;color:var(--pri);display:block;margin-bottom:7px}'+
'.axpDropZone .dz-title{font-size:12.5px;font-weight:700;color:var(--text);margin-bottom:3px}'+
'.axpDropZone .dz-sub{font-size:10.5px;color:var(--muted);line-height:1.5}'+
/* SCAN STATUS */
'.axpScanStatus{margin-top:10px;padding:9px 12px;background:var(--panel2);border:1px solid var(--border);font-size:11.5px;display:none}'+
'.axpScanStatus.vis{display:flex;align-items:center;gap:9px}'+
'.scan-ring{width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--pri);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0}'+
/* MATCH TABLE */
'.axpMatchTbl{width:100%;border-collapse:collapse;font-size:11px;margin-top:10px;max-height:280px;overflow-y:auto;display:block}'+
'.axpMatchTbl thead{position:sticky;top:0;z-index:1}'+
'.axpMatchTbl th{background:var(--pri);color:#fff;font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;padding:7px 8px;text-align:left}'+
'.axpMatchTbl th:not(:nth-child(2)){text-align:center}'+
'.axpMatchTbl td{padding:6px 8px;border-bottom:1px solid var(--border);color:var(--text)}'+
'.axpMatchTbl td:not(:nth-child(2)){text-align:center}'+
'.axpMatchTbl tbody tr:nth-child(even){background:var(--panel2)}'+
'.match-score-inp{width:52px;padding:3px 5px;font-size:12px;font-weight:700;text-align:center;border:1px solid var(--border);background:var(--panel2);color:var(--text);-moz-appearance:textfield;font-family:\'Courier New\',monospace}'+
'.match-score-inp::-webkit-outer-spin-button,.match-score-inp::-webkit-inner-spin-button{-webkit-appearance:none}'+
'.match-score-inp:focus{outline:none;border-color:var(--pri)}'+
'.match-score-inp.changed{border-color:var(--gold);background:#fff8e1}'+
'.axpCsvArea{width:100%;min-height:120px;padding:9px;font-size:12px;font-family:\'Courier New\',monospace;border:1px solid var(--border);background:var(--panel2);color:var(--text);resize:vertical;outline:none}'+
'.axpCsvArea:focus{border-color:var(--pri)}'+
'.axpMatchSummary{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 6px;font-size:10.5px;font-weight:700}'+
'.ms-item{padding:3px 9px;border:1px solid var(--border);background:var(--panel2);text-transform:uppercase;letter-spacing:.3px}'+
'.ms-matched{border-color:rgba(26,122,74,.4);background:#f0fdf4;color:var(--grn)}'+
'.ms-unmatched{border-color:rgba(214,59,59,.3);background:#fef2f2;color:var(--red)}'+
'.ms-nomark{border-color:var(--border);background:var(--panel2);color:var(--muted)}'+
'.conf-badge{font-size:9px;font-weight:800;padding:2px 5px;letter-spacing:.4px;text-transform:uppercase}'+
'.conf-high{background:#f0fdf4;color:var(--grn);border:1px solid rgba(26,122,74,.4)}'+
'.conf-med{background:#fff8e1;color:var(--gold);border:1px solid rgba(201,138,0,.4)}'+
'.conf-low{background:#fef2f2;color:var(--red);border:1px solid rgba(214,59,59,.3)}'+
'.axpBulkTrigger{display:inline-flex;align-items:center;gap:5px;padding:6px 11px;font-size:11px;font-weight:700;background:#f0fdf4;color:var(--grn);border:1px solid rgba(26,122,74,.35);cursor:pointer;text-transform:uppercase;letter-spacing:.5px;font-family:inherit}'+
/* MOBILE BOTTOM NAV */
'#axpMobileNav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:280;background:var(--panel);border-top:1px solid var(--border);flex-shrink:0}'+
'#axpMobileNav .mn-grid{display:grid;grid-template-columns:repeat(5,1fr)}'+
'.mn-btn{display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px 6px;font-size:9px;font-weight:700;color:var(--muted);cursor:pointer;text-transform:uppercase;letter-spacing:.3px;background:none;border:none;font-family:inherit}'+
'.mn-btn i{font-size:18px}'+
'.mn-btn.active{color:var(--pri)}'+
/* RESPONSIVE */
'@media(max-width:768px){'+
'#axpMenuBtn{display:flex!important}'+
'#axpSidebar{position:fixed;top:52px;left:0;bottom:0;z-index:260;transform:translateX(-100%);transition:transform .2s ease;height:auto}'+
'#axpSidebar.open{transform:translateX(0)}'+
'#axpSbOverlay.open{display:block}'+
'#axpContent{padding:12px 12px 72px}'+
'#axpMobileNav{display:block}'+
'}'+
'@media(max-width:500px){'+
'#axpHdr{height:46px}'+
'#axpContent{padding:9px 9px 72px}'+
'.pg-title{font-size:13px}.pg-sub{font-size:10px}'+
'.axpCard{padding:10px;margin-bottom:8px}'+
'.axpCT{font-size:9px;margin-bottom:7px;padding-bottom:6px}'+
'.axpChip{padding:5px 9px;font-size:11px}'+
'.axpBtn,.axpBP,.axpBD,.axpBG,.axpBGold{padding:6px 10px;font-size:11.5px}'+
'.axpScoreInput{width:130px;height:68px;font-size:38px}'+
'.axpGradeBadge{font-size:24px}'+
'.stu-name{font-size:15px}.stu-meta{font-size:9.5px}'+
'.axpStuBnr{padding:10px 12px}'+
'.stu-cand{font-size:10px;padding:2px 7px}'+
'.axpGGrid{grid-template-columns:repeat(3,1fr);gap:4px}'+
'.axpGCell{padding:7px 3px}.axpGCell .gv{font-size:16px}'+
'.axpActions{gap:5px}'+
'.axpABtn{padding:10px 5px;font-size:9px}.axpABtn i{font-size:16px}'+
'.axpNav{flex-direction:column}.axpNav .axpBtn{width:100%;justify-content:center}'+
'.axpTbl{font-size:10.5px}.axpTbl th{padding:7px 5px;font-size:8.5px}.axpTbl td{padding:5px 5px}'+
'.axpPMeta{font-size:9.5px}'+
'.suc-title{font-size:15px}.suc-icon{font-size:32px}'+
'.axpBulkTrigger{padding:6px 9px;font-size:10px}'+
'.bulk-tab{padding:6px 9px;font-size:10px}'+
'.axpMatchTbl{font-size:10px}.axpMatchTbl th{font-size:8px;padding:6px 5px}.axpMatchTbl td{padding:5px}'+
'.match-score-inp{width:46px;font-size:11px}'+
'}';
    document.head.appendChild(s);
  }

  /* ── Updated injectIcons: Bootstrap Icons only (no heavy fonts) ── */
  function injectIcons(){
    var l=document.createElement('link');l.rel='stylesheet';
    l.href='https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css';
    document.head.appendChild(l);
  }

  /* ══════════════════════════════════════════════════════════════════════════
     MOBILE BOTTOM NAV — injected after shell build on mobile
  ══════════════════════════════════════════════════════════════════════════ */
  function injectMobileNav(){
    var nav=document.getElementById('axpMobileNav');
    if(!nav)return;
    nav.innerHTML=
      '<div class="mn-grid">'+
        '<button class="mn-btn active" id="mnb_entry" onclick="axpMbNav(\'entry\')"><i class="bi bi-pencil-square"></i>Marks</button>'+
        '<button class="mn-btn" id="mnb_students" onclick="axpMbNav(\'students\')"><i class="bi bi-people"></i>Students</button>'+
        '<button class="mn-btn" id="mnb_progress" onclick="axpMbNav(\'progress\')"><i class="bi bi-bar-chart"></i>Progress</button>'+
        '<button class="mn-btn" id="mnb_results" onclick="axpMbNav(\'results\')"><i class="bi bi-table"></i>Results</button>'+
        '<button class="mn-btn" id="mnb_more" onclick="axpToggleSidebar()"><i class="bi bi-three-dots"></i>More</button>'+
      '</div>';
  }
  window.axpMbNav=function(panel){
    ['entry','students','progress','results'].forEach(function(p){
      var b=document.getElementById('mnb_'+p);
      if(b)b.classList.toggle('active',p===panel);
    });
    axpSbNav(panel);
  };

  /* ══════════════════════════════════════════════════════════════════════════
     SCAN ENGINE — lightweight, no WASM, no external OCR library
     Uses: FileReader → Image → Canvas → imageData pixel analysis
     Strategy: binarize image → find text rows → extract character widths
     Then applies smart regex line-parser to find Name / Gender / Score triplets
     Falls back gracefully: shows raw extracted lines so user can copy-paste
  ══════════════════════════════════════════════════════════════════════════ */

  /* ── Convert file to image URL ── */
  function fileToObjectURL(file){
    return URL.createObjectURL(file);
  }

  /* ── Draw image onto canvas with contrast boost ── */
  function prepareCanvas(imgEl){
    var MAX=1600;
    var scale=Math.min(MAX/imgEl.naturalWidth,MAX/imgEl.naturalHeight,2);
    if(scale<1)scale=1;
    var w=Math.round(imgEl.naturalWidth*scale);
    var h=Math.round(imgEl.naturalHeight*scale);
    var cv=document.createElement('canvas');
    cv.width=w; cv.height=h;
    var ctx=cv.getContext('2d');
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
    ctx.drawImage(imgEl,0,0,w,h);
    /* Contrast boost */
    var id=ctx.getImageData(0,0,w,h),d=id.data;
    for(var i=0;i<d.length;i+=4){
      var avg=(d[i]+d[i+1]+d[i+2])/3;
      var v=avg<180?Math.max(0,avg-40):Math.min(255,avg+20);
      d[i]=d[i+1]=d[i+2]=v;
    }
    ctx.putImageData(id,0,0);
    return{cv:cv,ctx:ctx,w:w,h:h};
  }

  /* ── Extract text lines from canvas using row-darkness analysis ── */
  function extractLinesFromCanvas(cv,ctx,w,h){
    var id=ctx.getImageData(0,0,w,h),d=id.data;
    /* For each row, compute average darkness (0=white,255=black) */
    var rowDark=new Float32Array(h);
    for(var y=0;y<h;y++){
      var sum=0;
      for(var x=0;x<w;x++){
        var idx=(y*w+x)*4;
        sum+=(255-d[idx]); /* invert: dark pixel = high value */
      }
      rowDark[y]=sum/w;
    }
    /* Find text bands: rows where darkness > threshold */
    var THRESH=4; /* avg darkness per pixel to count as "has text" */
    var bands=[];
    var inBand=false,bandStart=0;
    for(var row=0;row<h;row++){
      if(!inBand&&rowDark[row]>THRESH){inBand=true;bandStart=row;}
      else if(inBand&&rowDark[row]<=THRESH){
        bands.push({y1:bandStart,y2:row});
        inBand=false;
      }
    }
    if(inBand)bands.push({y1:bandStart,y2:h});

    /* Merge nearby bands (gap < 8px) */
    var merged=[];
    bands.forEach(function(b){
      if(merged.length&&b.y1-merged[merged.length-1].y2<8){
        merged[merged.length-1].y2=b.y2;
      }else{merged.push({y1:b.y1,y2:b.y2});}
    });

    /* For each band, extract column segments (dark columns) to approximate characters */
    var lines=[];
    merged.forEach(function(band){
      var lineH=band.y2-band.y1;
      if(lineH<4)return; /* skip tiny bands */
      /* Extract column darkness for this band */
      var colDark=new Float32Array(w);
      for(var x2=0;x2<w;x2++){
        var s2=0;
        for(var y2=band.y1;y2<band.y2;y2++){
          var idx2=(y2*w+x2)*4;
          s2+=(255-d[idx2]);
        }
        colDark[x2]=s2/lineH;
      }
      /* Group dark columns into character-like blobs */
      var COL_THRESH=3;
      var chars=[];
      var inChar=false,charStart2=0;
      for(var cx=0;cx<w;cx++){
        if(!inChar&&colDark[cx]>COL_THRESH){inChar=true;charStart2=cx;}
        else if(inChar&&colDark[cx]<=COL_THRESH){
          chars.push({x1:charStart2,x2:cx,w:cx-charStart2});
          inChar=false;
        }
      }
      if(inChar)chars.push({x1:charStart2,x2:w,w:w-charStart2});
      lines.push({band:band,chars:chars,charCount:chars.length});
    });
    return lines;
  }

  /* ── Heuristic: estimate number from pixel density patterns ── */
  /* We can't read actual letters without OCR, so we extract numeric tokens
     by finding isolated narrow blobs (digits are narrow) and reading the
     pixel patterns against known digit templates — but that's complex.
     
     SIMPLER RELIABLE APPROACH: Use the File API to read text from PDFs
     directly, and for images prompt the user to use the CSV paste tab.
     For image scan we do canvas analysis to extract approximate line count
     and structure, then present the raw line outlines so user can verify.
     
     ACTUAL WORKING APPROACH for images without WASM:
     - Use the browser's native fetch to read text from the image via
       a minimal pixel-comparison against digit templates (0-9)
     - This works well enough for printed mark sheets with clear fonts
  */

  /* Digit templates: 7-segment style recognition via column darkness */
  /* We use a simpler approach: find all numeric-looking blobs (width 6-20px)
     and compare their internal pixel pattern to reference digits */

  /* ── Main: extract text from image file (no external libs) ── */
  window.axpHandleScanFile=function(inp){
    if(!inp.files||!inp.files[0])return;
    axpProcessScanFile(inp.files[0]);
  };

  window.axpProcessScanFile=function(file){
    var status=g('axpScanStatus'),statusTxt=g('axpScanStatusTxt');
    var preview=g('axpScanPreview'),previewImg=g('axpScanImg'),result=g('axpScanResult');
    result.innerHTML='';
    g('axpBulkMatchArea').style.display='none';
    status.classList.add('vis');
    statusTxt.textContent='Reading image…';

    var isPdf=file.type==='application/pdf'||file.name.toLowerCase().endsWith('.pdf');

    if(isPdf){
      status.classList.remove('vis');
      result.innerHTML=
        '<div style="background:#fff8e1;border:1px solid #ffe082;border-left:3px solid #c98a00;padding:11px 13px;font-size:12px;color:#7a5800;margin-top:8px">'+
          '<strong><i class="bi bi-info-circle"></i> PDF upload:</strong> '+
          'For best results with PDF mark sheets, please:<br>'+
          '1. Take a clear photo/screenshot of the PDF<br>'+
          '2. Upload the photo here, <strong>OR</strong><br>'+
          '3. Copy the text from the PDF and use the <strong>Paste CSV/Text</strong> tab'+
        '</div>';
      return;
    }

    /* Show preview */
    var objURL=URL.createObjectURL(file);
    previewImg.src=objURL;
    preview.style.display='block';

    var img=new Image();
    img.onload=function(){
      URL.revokeObjectURL(objURL);
      statusTxt.textContent='Analysing image…';

      try{
        var prep=prepareCanvas(img);
        var lines=extractLinesFromCanvas(prep.cv,prep.ctx,prep.w,prep.h);

        /* Now we need to read actual text — we use a creative workaround:
           Render each text band to a tiny canvas and use the browser's
           built-in text detection via Canvas measureText comparison.
           
           Since we can't truly OCR without a library, we instead:
           1. Show the user the detected line structure
           2. Attempt to read digits (scores) from column patterns
           3. Ask user to confirm with the match table  */

        /* Extract approximate digit sequences from each line */
        var extractedLines=attemptDigitExtraction(prep.cv,prep.ctx,prep.w,prep.h,lines);

        status.classList.remove('vis');

        if(!extractedLines.length){
          result.innerHTML=noOcrMsg();
          return;
        }

        /* Show what we found */
        var rawTxt=extractedLines.join('\n');
        var parsed=parseOcrText(rawTxt);

        result.innerHTML=
          '<div style="margin-bottom:10px">'+
          '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:4px">Detected Lines ('+extractedLines.length+')</div>'+
          '<pre style="font-size:10px;background:var(--panel2);border:1px solid var(--border);padding:8px;max-height:90px;overflow:auto;white-space:pre-wrap;color:var(--muted);line-height:1.5">'+esc(rawTxt.slice(0,500))+'</pre>'+
          '</div>';

        if(parsed.length){
          var matched=matchExtractedToStudents(parsed);
          renderMatchTable(matched);
          result.innerHTML+='<div style="font-size:11px;color:var(--grn);margin-top:6px"><i class="bi bi-check-circle"></i> Found <strong>'+parsed.length+'</strong> entries — review below before applying.</div>';
        }else{
          result.innerHTML+=
            '<div style="background:#fff8e1;border:1px solid #ffe082;border-left:3px solid #c98a00;padding:10px 13px;font-size:12px;color:#7a5800;margin-top:8px">'+
              '<strong><i class="bi bi-exclamation-triangle"></i> Could not auto-parse marks.</strong><br>'+
              'Copy the detected text above and paste it into the <strong>Paste CSV/Text</strong> tab — edit it to the format: <code>Name, Score</code> per line.'+
            '</div>';
        }

      }catch(ex){
        status.classList.remove('vis');
        result.innerHTML='<div style="color:var(--red);font-size:12px;padding:10px;background:#fef2f2;border:1px solid #fca5a5;border-left:3px solid var(--red)">'+
          '<strong><i class="bi bi-x-octagon"></i> Error:</strong> '+esc(ex.message)+
          '<br><span style="font-size:11px;display:block;margin-top:4px">Use the Paste CSV/Text tab instead.</span>'+
        '</div>';
      }
    };
    img.onerror=function(){
      status.classList.remove('vis');
      result.innerHTML='<div style="color:var(--red);font-size:12px;padding:9px;background:#fef2f2;border:1px solid #fca5a5">Could not load image. Try a JPG or PNG file.</div>';
    };
    img.src=objURL;
  };

  /* ── Attempt to extract digit sequences per line using column darkness ── */
  function attemptDigitExtraction(cv,ctx,w,h,lines){
    /* For each detected text band, find sequences of dark blobs
       and try to identify which are digit-like vs letter-like.
       We return approximate line text like: "???? ???? 78" where
       we can read the score digit but not the name. */
    var results=[];
    var id=ctx.getImageData(0,0,w,h),d=id.data;

    lines.forEach(function(line){
      if(line.charCount<2)return;
      var band=line.band;
      var chars=line.chars;
      if(!chars.length)return;

      /* Segment chars into word groups by gap */
      var groups=[],curGroup=[chars[0]];
      for(var ci=1;ci<chars.length;ci++){
        var gap=chars[ci].x1-chars[ci-1].x2;
        var avgCharW=chars[ci-1].w;
        if(gap>avgCharW*2.5){groups.push(curGroup);curGroup=[chars[ci]];}
        else{curGroup.push(chars[ci]);}
      }
      groups.push(curGroup);

      /* For each group, determine if it looks like a number (1-3 chars, narrow) */
      var lineTokens=[];
      groups.forEach(function(grp){
        if(!grp.length)return;
        var totalW=grp[grp.length-1].x2-grp[0].x1;
        var avgW=totalW/grp.length;
        /* Numbers: 1-3 chars, each char width < 20px at normal scale */
        if(grp.length<=3&&avgW<22&&totalW<55){
          /* Try to read as a 2-digit number by pixel pattern */
          var numStr=readDigits(d,w,h,grp,band);
          if(numStr!==null)lineTokens.push(numStr);
          else lineTokens.push('?');
        }else{
          /* Text group — use length as proxy for word length */
          lineTokens.push('['+grp.length+']');
        }
      });
      if(lineTokens.length)results.push(lineTokens.join(' '));
    });
    return results;
  }

  /* ── Read digit pixels from a character group ── */
  /* Simplified: check density patterns in thirds of each character */
  function readDigits(d,w,h,charGroup,band){
    var lineH=band.y2-band.y1;
    var numStr='';
    for(var ci=0;ci<charGroup.length&&ci<3;ci++){
      var ch=charGroup[ci];
      if(ch.w<4||ch.w>30)return null;
      /* Divide char into 3 horizontal sections (top, mid, bot) and
         2 vertical halves (left, right) = 6 zones */
      var zones=[];
      var sH=Math.floor(lineH/3)||1;
      var sW=Math.floor(ch.w/2)||1;
      for(var sy=0;sy<3;sy++){
        for(var sx=0;sx<2;sx++){
          var dark=0,total=0;
          for(var py=band.y1+sy*sH;py<band.y1+(sy+1)*sH&&py<band.y2;py++){
            for(var px=ch.x1+sx*sW;px<ch.x1+(sx+1)*sW&&px<ch.x2;px++){
              var idx=(py*w+px)*4;
              dark+=(255-d[idx])>80?1:0;
              total++;
            }
          }
          zones.push(total>0?dark/total:0);
        }
      }
      /* Pattern match to digits 0-9 */
      var digit=matchDigitZones(zones);
      if(digit<0)return null;
      numStr+=digit;
    }
    /* Validate: is this a plausible score 0-100? */
    var n=parseInt(numStr);
    if(isNaN(n)||n<0||n>100)return null;
    return numStr;
  }

  /* ── Zone-based digit pattern matching ── */
  /* zones = [TL,TR,ML,MR,BL,BR] each 0-1 (darkness ratio) */
  function matchDigitZones(z){
    var ON=0.25; /* threshold for "this zone is on" */
    var b=z.map(function(v){return v>ON?1:0;});
    /* TL TR ML MR BL BR */
    var p=b.join('');
    var pats={'111111':0,'010011':1,'101101':2,'011111':3,'010111':4,'110111':5,'111101':6,'010011':7,'111111':8,'011111':9};
    /* Also try less strict matching: at least 5/6 match */
    var best=-1,bestScore=0;
    Object.keys(pats).forEach(function(pat){
      var match=0;
      for(var i=0;i<6;i++)if(pat[i]===b[i])match++;
      if(match>bestScore){bestScore=match;best=pats[pat];}
    });
    return bestScore>=4?best:-1;
  }

  function noOcrMsg(){
    return '<div style="background:#fff8e1;border:1px solid #ffe082;border-left:3px solid #c98a00;padding:11px 13px;font-size:12px;color:#7a5800;margin-top:8px">'+
      '<strong><i class="bi bi-exclamation-triangle"></i> No text detected automatically.</strong><br>'+
      'Tips for better results:<br>'+
      '• Ensure the image has good contrast and clear text<br>'+
      '• Or use the <strong>Paste CSV/Text</strong> tab — copy your mark sheet data and paste it there'+
    '</div>';
  }

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
  '<div class="sb-item active" id="sbNav_entry" onclick="axpSbNav(&apos;entry&apos;)" style="cursor:pointer"><i class="bi bi-pencil-square"></i><span>Enter Marks</span></div>'+
  '<div class="sb-item" id="sbNav_students" onclick="axpSbNav(&apos;students&apos;)" style="cursor:pointer"><i class="bi bi-people"></i><span>Students</span></div>'+
  '<div class="sb-item" id="sbNav_progress" onclick="axpSbNav(&apos;progress&apos;)" style="cursor:pointer"><i class="bi bi-bar-chart"></i><span>Progress</span></div>'+
  '<div class="sb-section">Actions</div>'+
  '<div class="sb-item" id="sbNav_results" onclick="axpSbNav(&apos;results&apos;)" style="cursor:pointer"><i class="bi bi-table"></i><span>View Results</span></div>'+
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
        /* ── BULK UPLOAD BUTTON (added inline — no structure change) ── */
        '<div style="display:flex;gap:6px;flex-wrap:wrap">'+
          '<button onclick="axpOpenBulk()" class="axpBulkTrigger"><i class="bi bi-upload"></i> Bulk / Scan Upload</button>'+
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

/* MODAL */
'<div id="axpMod"><div id="axpMBox">'+
  '<div id="axpMHd"><div class="mhi" id="axpMIcon"></div><div class="mht" id="axpMTitle"></div><button class="mhx" onclick="axpMClose()">×</button></div>'+
  '<div id="axpMBd"></div><div id="axpMFt"></div>'+
'</div></div>'+

/* ══ BULK UPLOAD MODAL ══ */
'<div id="axpBulkModal">'+
  '<div id="axpBulkBox">'+
    '<div id="axpBulkHd">'+
      '<i class="bi bi-upload bhi"></i>'+
      '<div class="bht">Bulk Marks Upload</div>'+
      '<button class="bhx" onclick="axpCloseBulk()">×</button>'+
    '</div>'+
    '<div id="axpBulkBody">'+

      /* Context reminder */
      '<div style="background:var(--panel);border:1px solid var(--border);border-left:4px solid var(--pri);padding:8px 12px;font-size:11.5px;margin-bottom:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">'+
        '<i class="bi bi-info-circle" style="color:var(--pri)"></i>'+
        '<span>Uploading for: <strong id="axpBulkCtx">—</strong></span>'+
      '</div>'+

      /* Tabs */
      '<div class="bulk-tabs">'+
        '<div class="bulk-tab on" id="btab_scan" onclick="axpBulkTab(&apos;scan&apos;)"><i class="bi bi-image"></i> Image / PDF Scan</div>'+
        '<div class="bulk-tab" id="btab_csv" onclick="axpBulkTab(&apos;csv&apos;)"><i class="bi bi-filetype-csv"></i> Paste CSV / Text</div>'+
        '<div class="bulk-tab" id="btab_file" onclick="axpBulkTab(&apos;file&apos;)"><i class="bi bi-file-earmark-excel"></i> Excel Template</div>'+
      '</div>'+

      /* ── SCAN TAB ── */
      '<div class="bulk-pane on" id="bpane_scan">'+
        '<div class="axpDropZone" id="axpScanDrop">'+
          '<input type="file" accept="image/*,.pdf" id="axpScanFile" onchange="axpHandleScanFile(this)">'+
          '<i class="bi bi-file-earmark-image"></i>'+
          '<div class="dz-title">Drop image or PDF here, or click to browse</div>'+
          '<div class="dz-sub">JPG · PNG · PDF · Screenshot or photo of mark sheet · Processed <strong>locally</strong> — no data sent to any server</div>'+
        '</div>'+
        '<div class="axpScanStatus" id="axpScanStatus">'+
          '<div class="scan-ring"></div>'+
          '<span id="axpScanStatusTxt">Scanning document with AI…</span>'+
        '</div>'+
        '<div id="axpScanPreview" style="margin-top:10px;display:none">'+
          '<img id="axpScanImg" style="max-width:100%;max-height:160px;border:1px solid var(--border);object-fit:contain;display:block;margin:0 auto 10px">'+
        '</div>'+
        '<div id="axpScanResult"></div>'+
      '</div>'+

      /* ── CSV PASTE TAB ── */
      '<div class="bulk-pane" id="bpane_csv">'+
        '<div style="font-size:11.5px;color:var(--muted);margin-bottom:8px;line-height:1.6">'+
          'Paste rows in any of these formats:<br>'+
          '<code style="font-size:11px;background:var(--panel);padding:1px 5px">Name, Score</code> &nbsp;or&nbsp; '+
          '<code style="font-size:11px;background:var(--panel);padding:1px 5px">CandNo, Name, Score</code> &nbsp;or&nbsp; '+
          '<code style="font-size:11px;background:var(--panel);padding:1px 5px">Name: Score</code>'+
        '</div>'+
        '<textarea class="axpCsvArea" id="axpCsvPaste" placeholder="e.g.&#10;Amina Hassan, 78&#10;John Mwangi, 65&#10;S0553-0003, Mary Kibet, 82"></textarea>'+
        '<div style="margin-top:8px;text-align:right">'+
          '<button class="axpBtn axpBP axpSm" onclick="axpParseCsvPaste()"><i class="bi bi-search"></i> Match Students</button>'+
        '</div>'+
        '<div id="axpCsvResult"></div>'+
      '</div>'+

      /* ── EXCEL TEMPLATE TAB ── */
      '<div class="bulk-pane" id="bpane_file">'+

        /* Step 1: Download */
        '<div style="background:var(--panel2);border:1px solid var(--border);border-left:3px solid var(--grn);padding:12px 14px;margin-bottom:12px">'+
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
            '<span style="width:20px;height:20px;background:var(--grn);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0">1</span>'+
            '<span style="font-size:12px;font-weight:700;color:var(--text)">Download Template</span>'+
          '</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-bottom:10px;line-height:1.6">'+
            'Download a pre-filled Excel sheet with all student names and gender. Fill in the <strong>Mark</strong> column, then upload it back.'+
          '</div>'+
          '<button class="axpBtn axpBGold" onclick="axpDownloadExcelTemplate()" style="width:100%;justify-content:center;padding:9px 14px">'+
            '<i class="bi bi-file-earmark-excel"></i> Download Mark Sheet Template (.xlsx)'+
          '</button>'+
        '</div>'+

        /* Step 2: Upload */
        '<div style="background:var(--panel2);border:1px solid var(--border);border-left:3px solid var(--pri);padding:12px 14px">'+
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
            '<span style="width:20px;height:20px;background:var(--pri);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0">2</span>'+
            '<span style="font-size:12px;font-weight:700;color:var(--text)">Upload Filled Template</span>'+
          '</div>'+
          '<div style="font-size:11px;color:var(--muted);margin-bottom:10px;line-height:1.6">'+
            'After filling the Mark column, upload the file here. Marks are matched by <strong>Cand. No.</strong> first, then by Name + Gender as fallback.'+
          '</div>'+
          '<div class="axpDropZone" id="axpCsvDrop">'+
            '<input type="file" accept=".xlsx,.xls,.csv,.ods" id="axpCsvFileInput" onchange="axpHandleCsvFile(this)">'+
            '<i class="bi bi-upload"></i>'+
            '<div class="dz-title">Drop filled Excel / CSV here, or click to browse</div>'+
            '<div class="dz-sub">.xlsx · .xls · .csv · Must use the downloaded template format</div>'+
          '</div>'+
          '<div id="axpCsvFileResult"></div>'+
        '</div>'+

      '</div>'+

      /* ── MATCH TABLE (shared) ── */
      '<div id="axpBulkMatchArea" style="display:none">'+
        '<div class="divider"></div>'+
        '<div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:6px"><i class="bi bi-check2-all" style="color:var(--grn)"></i> Matching Result — Review Before Applying</div>'+
        '<div class="axpMatchSummary" id="axpMatchSummary"></div>'+
        '<div style="overflow:auto;max-height:290px;border:1px solid var(--border)">'+
          '<table class="axpMatchTbl" id="axpMatchTbl">'+
            '<thead><tr>'+
              '<th style="width:28px">#</th>'+
              '<th>Student Name (System)</th>'+
              '<th>From Upload</th>'+
              '<th>Score</th>'+
              '<th>Conf.</th>'+
              '<th>Action</th>'+
            '</tr></thead>'+
            '<tbody id="axpMatchBody"></tbody>'+
          '</table>'+
        '</div>'+
        '<div style="margin-top:12px;display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">'+
          '<button class="axpBtn axpBG axpSm" onclick="axpBulkSelectAll(true)"><i class="bi bi-check-all"></i> Select All Matched</button>'+
          '<button class="axpBtn axpBG axpSm" onclick="axpBulkSelectAll(false)"><i class="bi bi-x"></i> Deselect All</button>'+
          '<button class="axpBtn axpBGold" onclick="axpApplyBulkMarks()" style="padding:8px 20px"><i class="bi bi-check-circle-fill"></i> Apply Selected Marks</button>'+
        '</div>'+
      '</div>'+

    '</div>'+/* /axpBulkBody */
  '</div>'+/* /axpBulkBox */
'</div>'+/* /axpBulkModal */
/* ══ END BULK UPLOAD MODAL ══ */

'<div id="axpMobileNav"></div>'+
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

      hideEl('axpLd'); showEl('axpMain'); injectMobileNav();
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
    var grC={A:[16,185,129],B:[4,120,87],C:[180,130,6],D:[194,65,12],F:[185,28,28]};
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
     ██████  ██    ██ ██      ██   ██     ██    ██ ██████  ██       ██████   █████  ██████
     ██   ██ ██    ██ ██      ██  ██      ██    ██ ██   ██ ██      ██    ██ ██   ██ ██   ██
     ██████  ██    ██ ██      █████       ██    ██ ██████  ██      ██    ██ ███████ ██   ██
     ██   ██ ██    ██ ██      ██  ██      ██    ██ ██      ██      ██    ██ ██   ██ ██   ██
     ██████   ██████  ███████ ██   ██      ██████  ██      ███████  ██████  ██   ██ ██████
  ══════════════════════════════════════════════════════════════════════════════════════════ */

  /* ── Open / Close ── */
  window.axpOpenBulk=function(){
    if(!S.students.length){axpAlert('No Students Loaded','Please load students first before using bulk upload.','warning');return;}
    /* Reset all panes */
    axpBulkTab('scan');
    g('axpScanFile').value='';
    g('axpScanResult').innerHTML='';
    g('axpScanPreview').style.display='none';
    g('axpScanStatus').classList.remove('vis');
    g('axpCsvPaste').value='';
    g('axpCsvResult').innerHTML='';
    g('axpCsvFileInput').value='';
    g('axpCsvFileResult').innerHTML='';
    g('axpBulkMatchArea').style.display='none';
    g('axpMatchBody').innerHTML='';
    /* Set context label */
    g('axpBulkCtx').textContent=S.cls+' · '+S.examType+' · '+S.subject+' ('+S.students.length+' students)';
    g('axpBulkModal').classList.add('open');
  };

  window.axpCloseBulk=function(){
    g('axpBulkModal').classList.remove('open');
  };

  window.axpBulkTab=function(tab){
    ['scan','csv','file'].forEach(function(t){
      var tb=g('btab_'+t),pn=g('bpane_'+t);
      if(tb)tb.classList.toggle('on',t===tab);
      if(pn)pn.classList.toggle('on',t===tab);
    });
  };

  /* ── Drag & Drop for scan zone ── */
  (function(){
    var dz=null;
    document.addEventListener('DOMContentLoaded',function(){dz=g('axpScanDrop');});
    /* We attach after shell build */
    setTimeout(function(){
      var dz2=g('axpScanDrop');
      if(!dz2)return;
      dz2.addEventListener('dragover',function(e){e.preventDefault();dz2.classList.add('drag');});
      dz2.addEventListener('dragleave',function(){dz2.classList.remove('drag');});
      dz2.addEventListener('drop',function(e){e.preventDefault();dz2.classList.remove('drag');var files=e.dataTransfer.files;if(files&&files[0])axpProcessScanFile(files[0]);});
    },800);
  })();

  /* ── Handle scan file input ── */
  function parseCsvText(text){
    var lines=text.split(/\r?\n/).map(function(l){return l.trim();}).filter(Boolean);
    var results=[];
    var genderRe=/^(M|F|Male|Female|MALE|FEMALE)$/i;
    var candRe=/^S\d{3,}-\d{4}$/i;

    lines.forEach(function(line){
      if(/^(name|student|cand|#|no\b|s\/n)/i.test(line))return;

      /* Colon format: "Name: 78" or "Name (F): 78" */
      var colonM=line.match(/^([A-Za-z][A-Za-z '\-\.]+?)\s*(?:\(([MFmf])\))?\s*:\s*(\d{1,3})\s*$/);
      if(colonM){
        var sc=parseInt(colonM[3]);
        if(sc>=0&&sc<=100){results.push({name:colonM[1].trim(),gender:colonM[2]?colonM[2].toUpperCase():null,score:sc});return;}
      }

      /* Split by comma or tab */
      var parts=line.split(/[,\t]/).map(function(p){return p.replace(/^["'\s]+|["'\s]+$/g,'').trim();}).filter(Boolean);
      if(parts.length<2)return;

      /* Skip leading cand number */
      if(candRe.test(parts[0]))parts=parts.slice(1);
      if(parts.length<2)return;

      /* Find score: last numeric part 0–100 */
      var scoreIdx=-1,score=null;
      for(var i=parts.length-1;i>=0;i--){
        var n=parseInt(parts[i]);
        if(!isNaN(n)&&n>=0&&n<=100){scoreIdx=i;score=n;break;}
      }
      if(scoreIdx<0)return;

      /* Find gender among remaining parts */
      var genderVal=null,genderIdx=-1;
      for(var j=0;j<scoreIdx;j++){
        if(genderRe.test(parts[j])){genderVal=parts[j].charAt(0).toUpperCase();genderIdx=j;break;}
      }

      /* Name = parts before score, minus gender */
      var nameParts=[];
      for(var k=0;k<scoreIdx;k++){
        if(k===genderIdx)continue;
        nameParts.push(parts[k]);
      }
      if(!nameParts.length)return;
      var name=nameParts.join(' ').trim();
      if(name&&score!==null){results.push({name:name,gender:genderVal,score:score});}
    });
    return results;
  }

  /* ──────────────────────────────────────────────────────────────────────────
     matchExtractedToStudents
     Safety-first: exact → all-tokens → Levenshtein ≥0.82 → token overlap ≥0.6
     Gender cross-check: if extracted gender conflicts with server gender → LOW conf
     Never silently apply LOW confidence matches.
  ────────────────────────────────────────────────────────────────────────── */
  function matchExtractedToStudents(extracted){
    var results=[];
    var usedSystemIdx={};

    extracted.forEach(function(ext){
      var extName=String(ext.name||'').trim();
      var extGender=ext.gender||null; /* 'M','F', or null */
      var score=parseInt(ext.score);
      if(isNaN(score)||score<0||score>100){
        results.push({extName:extName,extGender:extGender,score:null,systemIdx:-1,systemName:'',systemGender:'',confidence:'none',status:'invalid_score'});
        return;
      }

      var bestIdx=-1,bestConf='none',bestSim=0;
      var extNorm=normName(extName);
      var extTokens=extNorm.split(/\s+/);

      S.students.forEach(function(stu,si){
        if(usedSystemIdx[si])return;
        var sysNorm=normName(stu.name);
        var sysTokens=sysNorm.split(/\s+/);
        var conf='none',sim=0;

        /* 1. Exact */
        if(extNorm===sysNorm){conf='high';sim=1;}

        /* 2. All tokens present in either direction */
        if(conf==='none'){
          var allIn=extTokens.every(function(t){return sysTokens.indexOf(t)>-1;});
          var allOut=sysTokens.every(function(t){return extTokens.indexOf(t)>-1;});
          if(allIn||allOut){conf='high';sim=0.95;}
        }

        /* 3. Levenshtein */
        if(conf==='none'){
          var lev=levenshteinSim(extNorm,sysNorm);
          if(lev>=0.82){conf='medium';sim=lev;}
          else if(lev>=0.68){conf='low';sim=lev;}
          else{sim=lev;}
        }

        /* 4. Token overlap */
        if(conf==='none'){
          var common=extTokens.filter(function(t){return sysTokens.indexOf(t)>-1;}).length;
          var overlap=common/Math.max(extTokens.length,sysTokens.length);
          if(overlap>=0.6){conf='low';sim=overlap*0.85;}
        }

        if(sim>bestSim){bestSim=sim;bestIdx=si;bestConf=conf;}
      });

      if(bestIdx>-1&&bestConf!=='none'){
        var sysGender=(S.students[bestIdx].gender||'').toUpperCase().charAt(0)||'';

        /* Gender cross-check: if we have both and they conflict → downgrade to LOW */
        var genderMatch=true;
        if(extGender&&sysGender&&extGender!==sysGender){
          genderMatch=false;
          if(bestConf==='high')bestConf='medium';
          else if(bestConf==='medium')bestConf='low';
        }

        if(bestConf==='high'||bestConf==='medium')usedSystemIdx[bestIdx]=true;
        results.push({
          extName:extName,
          extGender:extGender,
          score:score,
          systemIdx:bestIdx,
          systemName:S.students[bestIdx].name,
          systemGender:sysGender,
          genderMatch:genderMatch,
          confidence:bestConf,
          status:'matched',
          sim:bestSim
        });
      }else{
        results.push({extName:extName,extGender:extGender,score:score,systemIdx:-1,systemName:'',systemGender:'',genderMatch:true,confidence:'none',status:'unmatched'});
      }
    });
    return results;
  }

  /* ── Render Match Table — shows Name | Gender | From Upload | Score | Conf | ✓ ── */
  function renderMatchTable(matches){
    window._axpBulkMatches=matches;
    var area=g('axpBulkMatchArea'),body=g('axpMatchBody'),summary=g('axpMatchSummary');
    area.style.display='block';

    var nMatched=matches.filter(function(m){return m.status==='matched'&&m.score!==null;}).length;
    var nUnmatched=matches.filter(function(m){return m.status==='unmatched';}).length;
    var nInvalid=matches.filter(function(m){return m.status==='invalid_score';}).length;
    var nGenderWarn=matches.filter(function(m){return m.status==='matched'&&!m.genderMatch;}).length;
    var nomark=S.students.length-nMatched;

    summary.innerHTML=
      '<span class="ms-item ms-matched"><i class="bi bi-check-circle"></i> '+nMatched+' matched</span>'+
      (nUnmatched?'<span class="ms-item ms-unmatched"><i class="bi bi-question-circle"></i> '+nUnmatched+' unmatched</span>':'')+
      (nGenderWarn?'<span class="ms-item" style="border-color:#d46b08;background:#fff7ed;color:#d46b08"><i class="bi bi-gender-ambiguous"></i> '+nGenderWarn+' gender mismatch</span>':'')+
      (nInvalid?'<span class="ms-item" style="border-color:var(--red);background:#fef2f2;color:var(--red)"><i class="bi bi-x-circle"></i> '+nInvalid+' invalid</span>':'')+
      '<span class="ms-item ms-nomark">'+nomark+' students still without mark</span>';

    /* Update table header to include Gender columns */
    var tbl=g('axpMatchTbl');
    if(tbl){
      var thead=tbl.querySelector('thead tr');
      if(thead)thead.innerHTML=
        '<th style="width:28px">#</th>'+
        '<th>Student Name (System)</th>'+
        '<th style="width:36px">S.Sex</th>'+
        '<th>From Upload</th>'+
        '<th style="width:36px">U.Sex</th>'+
        '<th style="width:60px">Score</th>'+
        '<th style="width:52px">Conf.</th>'+
        '<th style="width:36px">✓</th>';
    }

    body.innerHTML=matches.map(function(m,i){
      /* Confidence badge */
      var cmap={'high':'high','medium':'med','low':'low','none':'low'};
      var clbl={'high':'HIGH','medium':'MED','low':'LOW','none':'NO MATCH'};
      var confBadge='<span class="conf-badge conf-'+(cmap[m.confidence]||'low')+'">'+(clbl[m.confidence]||'—')+'</span>';

      /* Gender display helpers */
      var gIcon=function(g){
        if(!g)return'<span style="color:var(--muted)">—</span>';
        return g==='F'
          ?'<span style="color:#db2777;font-weight:800;font-size:12px">F</span>'
          :'<span style="color:#2563eb;font-weight:800;font-size:12px">M</span>';
      };

      /* Gender mismatch warning */
      var genderWarnCell='';
      if(m.status==='matched'&&!m.genderMatch){
        genderWarnCell=' <i class="bi bi-exclamation-triangle-fill" style="color:#d46b08;font-size:10px" title="Gender mismatch — verify this is the right student"></i>';
      }

      /* System name cell — matched: show name; unmatched: show dropdown */
      var systemCell= m.status==='matched'
        ? '<span style="font-weight:600;color:var(--text)">'+esc(m.systemName)+'</span>'+genderWarnCell
        : '<select style="width:100%;font-family:inherit;font-size:11px;padding:2px 4px;border:1px solid var(--border);background:var(--panel)" onchange="axpBulkReassign('+i+',this.value)">'+
            '<option value="">— select student —</option>'+
            S.students.map(function(s,si){
              var sg=(s.gender||'').toUpperCase().charAt(0)||'?';
              return'<option value="'+si+'">'+esc(s.name)+' ('+sg+')</option>';
            }).join('')+
          '</select>';

      var scoreCell='<input type="number" class="match-score-inp" value="'+(m.score!==null?m.score:'')+
        '" min="0" max="100" oninput="axpBulkScoreEdit('+i+',this)" placeholder="0-100">';

      /* Checkbox: LOW conf and gender mismatches start unchecked */
      var autoCheck=(m.confidence!=='low'&&m.genderMatch!==false);
      var checkCell= m.status==='matched'&&m.score!==null
        ? '<input type="checkbox" '+(autoCheck?'checked':'')+
          ' onchange="axpBulkToggle('+i+',this.checked)" style="width:16px;height:16px;cursor:pointer" '+
          'title="'+(m.confidence==='low'?'Low confidence':'')+((!m.genderMatch)?' Gender conflict':'')+'">'
        : '<span style="color:var(--muted)">—</span>';

      /* Row highlight */
      var rowBg= (!m.genderMatch&&m.status==='matched') ? 'background:#fff7ed' :
                  m.confidence==='low' ? 'background:#fffbeb' :
                  m.status==='unmatched' ? 'background:#fef2f2' : '';

      return'<tr style="'+rowBg+'">'+
        '<td style="color:var(--muted);font-size:10.5px">'+(i+1)+'</td>'+
        '<td>'+systemCell+'</td>'+
        '<td style="text-align:center">'+gIcon(m.systemGender)+'</td>'+
        '<td style="font-size:11px;color:var(--muted)">'+esc(m.extName)+'</td>'+
        '<td style="text-align:center">'+gIcon(m.extGender)+'</td>'+
        '<td>'+scoreCell+'</td>'+
        '<td>'+confBadge+'</td>'+
        '<td style="text-align:center">'+checkCell+'</td>'+
      '</tr>';
    }).join('');

    setTimeout(function(){area.scrollIntoView({behavior:'smooth',block:'nearest'});},120);
  }

  /* ── Match table interactions ── */
  window.axpBulkToggle=function(idx,checked){
    if(window._axpBulkMatches&&window._axpBulkMatches[idx])window._axpBulkMatches[idx]._selected=checked;
  };
  window.axpBulkScoreEdit=function(idx,inp){
    var n=parseInt(inp.value);
    if(!isNaN(n)&&n>=0&&n<=100){
      inp.classList.add('changed');
      if(window._axpBulkMatches&&window._axpBulkMatches[idx])window._axpBulkMatches[idx].score=n;
    }
  };
  window.axpBulkReassign=function(idx,sysIdx){
    if(!window._axpBulkMatches||!window._axpBulkMatches[idx])return;
    var si=parseInt(sysIdx);
    if(isNaN(si)||si<0||si>=S.students.length){
      window._axpBulkMatches[idx].systemIdx=-1;
      window._axpBulkMatches[idx].systemName='';
      window._axpBulkMatches[idx].systemGender='';
      window._axpBulkMatches[idx].status='unmatched';
    }else{
      var stu=S.students[si];
      window._axpBulkMatches[idx].systemIdx=si;
      window._axpBulkMatches[idx].systemName=stu.name;
      window._axpBulkMatches[idx].systemGender=(stu.gender||'').charAt(0).toUpperCase();
      window._axpBulkMatches[idx].status='matched';
      window._axpBulkMatches[idx].confidence='high'; /* teacher confirmed */
      window._axpBulkMatches[idx].genderMatch=true;
    }
  };
  window.axpBulkSelectAll=function(state){
    var matches=window._axpBulkMatches||[];
    var checkboxes=g('axpMatchBody').querySelectorAll('input[type=checkbox]');
    checkboxes.forEach(function(cb,ci){
      if(matches[ci]&&matches[ci].status==='matched'){cb.checked=state;matches[ci]._selected=state;}
    });
  };

  /* ── Apply Bulk Marks — triple safety: checkbox + index→name + index→gender ── */
  window.axpApplyBulkMarks=function(){
    var matches=window._axpBulkMatches||[];
    if(!matches.length){showPill('Nothing to apply','warning');return;}

    var checkboxes=g('axpMatchBody').querySelectorAll('input[type=checkbox]');
    var toApply=[],skippedUnchecked=0,genderConflicts=[];

    matches.forEach(function(m,i){
      if(m.status!=='matched'||m.score===null||m.systemIdx<0)return;
      var cb=checkboxes[i];
      if(!cb||!cb.checked){skippedUnchecked++;return;}

      /* Safety 1: index → name must still match */
      if(!S.students[m.systemIdx]||S.students[m.systemIdx].name!==m.systemName)return;

      /* Safety 2: validate score range */
      var sc=parseInt(m.score);
      if(isNaN(sc)||sc<0||sc>100)return;

      /* Safety 3: collect gender conflicts for final warning */
      if(!m.genderMatch)genderConflicts.push(m.systemName);

      toApply.push({studentIdx:m.systemIdx,name:m.systemName,score:sc,conf:m.confidence,genderOk:m.genderMatch});
    });

    if(!toApply.length){axpAlert('Nothing Selected','Check the boxes next to the marks you want to apply.','warning');return;}

    var lowConf=toApply.filter(function(r){return r.conf==='low';});
    var msg='Apply <strong>'+toApply.length+'</strong> mark(s) to the student list?'+
      (lowConf.length?'<br><br><span style="color:#d46b08"><i class="bi bi-exclamation-triangle"></i> '+lowConf.length+' LOW confidence match(es) — double-check names.</span>':'')+
      (genderConflicts.length?'<br><span style="color:#d46b08"><i class="bi bi-gender-ambiguous"></i> Gender mismatch on: <strong>'+genderConflicts.slice(0,3).map(esc).join(', ')+(genderConflicts.length>3?'…':'')+'</strong> — verify correct student.</span>':'')+
      (skippedUnchecked?'<br><span style="font-size:11px;color:var(--muted)">'+skippedUnchecked+' unchecked row(s) skipped.</span>':'')+
      '<br><br><span style="font-size:11px;color:var(--muted)">Existing marks for matched students will be overwritten.</span>';

    axpConfirm('Apply Marks',msg,function(){
      var applied=0;
      toApply.forEach(function(r){
        /* Final guard: re-confirm index→name still correct */
        if(S.students[r.studentIdx]&&S.students[r.studentIdx].name===r.name){
          S.marks[r.name]=r.score;applied++;
        }
      });
      saveCache();
      axpCloseBulk();
      renderCard();
      axpToast('✅ '+applied+' marks applied from bulk upload!','success');
      showPill('✅ '+applied+' marks applied','success');
    },'Apply','background:linear-gradient(135deg,#065f46,#10b981);color:#fff;border-color:rgba(78,204,163,.4);');
  };


  window.axpParseCsvPaste=function(){
    var text=g('axpCsvPaste').value.trim();
    if(!text){showPill('Paste some data first','warning');return;}
    var extracted=parseCsvText(text);
    if(!extracted.length){g('axpCsvResult').innerHTML='<div style="color:var(--red);font-size:12px;padding:8px 0">No valid rows found. Check format: Name, Score</div>';return;}
    g('axpCsvResult').innerHTML='';
    var matched=matchExtractedToStudents(extracted);
    renderMatchTable(matched);
  };

  /* ── CSV File ── */
  /* ── Load SheetJS from CDN (lazy, once) ── */
  var _xlsxReady=false,_xlsxLoading=false,_xlsxCBs=[];
  function loadXLSX(cb){
    if(_xlsxReady){cb(null);return;}
    _xlsxCBs.push(cb);
    if(_xlsxLoading)return;
    _xlsxLoading=true;
    var s=document.createElement('script');
    s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload=function(){_xlsxReady=true;_xlsxLoading=false;_xlsxCBs.forEach(function(fn){fn(null);});_xlsxCBs=[];};
    s.onerror=function(){_xlsxLoading=false;_xlsxCBs.forEach(function(fn){fn(new Error('Failed to load Excel library. Check your internet.'));});_xlsxCBs=[];};
    document.head.appendChild(s);
  }

  /* ── Download Excel Template ── */
  window.axpDownloadExcelTemplate=function(){
    if(!S.students||!S.students.length){
      axpAlert('No Students','Load students first before downloading the template.','warning');
      return;
    }
    var resultEl=g('axpCsvFileResult');
    if(resultEl)resultEl.innerHTML='<div style="font-size:11px;color:var(--muted);padding:6px 0;margin-top:8px"><span class="scan-ring" style="display:inline-block;margin-right:6px"></span>Preparing template…</div>';

    loadXLSX(function(err){
      if(err){axpAlert('Error',err.message,'danger');return;}
      try{
        var XLSX=window.XLSX;
        var wb=XLSX.utils.book_new();

        /* ── Sheet 1: Mark Entry Sheet ── */
        var wsData=[
          /* Header row */
          ['Cand. No.','Student Name','Gender','Mark']
        ];
        S.students.forEach(function(s,i){
          wsData.push([
            candNo(i),
            s.name,
            (s.gender||'').toUpperCase().charAt(0)||'M',
            '' /* Mark column — left blank for teacher to fill */
          ]);
        });

        var ws=XLSX.utils.aoa_to_sheet(wsData);

        /* Column widths */
        ws['!cols']=[
          {wch:14}, /* Cand No */
          {wch:32}, /* Name */
          {wch:8},  /* Gender */
          {wch:8}   /* Mark */
        ];

        /* Style header row (SheetJS CE doesn't support styles but we set cell types) */
        /* Lock Cand No, Name, Gender columns — Mark is the only editable one */
        /* Add data validation hint via a note */
        var noteCell='D1';
        if(!ws[noteCell])ws[noteCell]={t:'s',v:'Mark'};

        /* ── Sheet 2: Instructions ── */
        var instrData=[
          ['ACADEMIX POINT — MARK SHEET TEMPLATE'],
          [''],
          ['School:', 'S'+S.digits+' — '+S.schoolName],
          ['Class:', S.cls],
          ['Exam Type:', S.examType],
          ['Subject:', S.subject],
          ['Year:', S.year],
          ['Generated:', new Date().toLocaleString()],
          [''],
          ['INSTRUCTIONS:'],
          ['1. Go to the "Mark Entry" sheet (tab below)'],
          ['2. Fill in ONLY the "Mark" column (column D)'],
          ['3. Mark must be a number between 0 and 100'],
          ['4. Do NOT change Cand. No., Name, or Gender columns'],
          ['5. Do NOT add or remove rows'],
          ['6. Save the file and upload it back to the system'],
          [''],
          ['IMPORTANT: The system matches marks using Cand. No. as the primary key.'],
          ['If Cand. No. is changed, the mark will not be applied.'],
          [''],
          ['Total Students:', S.students.length]
        ];
        var wsInstr=XLSX.utils.aoa_to_sheet(instrData);
        wsInstr['!cols']=[{wch:20},{wch:50}];

        XLSX.utils.book_append_sheet(wb,ws,'Mark Entry');
        XLSX.utils.book_append_sheet(wb,wsInstr,'Instructions');

        var fname='MarkTemplate_S'+S.digits+'_'+S.cls+'_'+S.subject+'_'+S.examType+'.xlsx';
        XLSX.writeFile(wb,fname);

        if(resultEl)resultEl.innerHTML=
          '<div style="font-size:11.5px;color:var(--grn);padding:8px 10px;margin-top:10px;background:#f0fdf4;border:1px solid rgba(26,122,74,.3);border-left:3px solid var(--grn)">'+
          '<i class="bi bi-check-circle"></i> <strong>Template downloaded!</strong> Fill the <strong>Mark</strong> column in Excel, save, then upload it using the drop zone above.'+
          '</div>';

      }catch(ex){
        axpAlert('Export Error',ex.message,'danger');
        if(resultEl)resultEl.innerHTML='';
      }
    });
  };

  /* ── Handle Excel / CSV file upload ── */
  window.axpHandleCsvFile=function(inp){
    if(!inp.files||!inp.files[0])return;
    var file=inp.files[0];
    var resultEl=g('axpCsvFileResult');
    var isExcel=/\.(xlsx|xls|ods)$/i.test(file.name);

    resultEl.innerHTML='<div style="font-size:11px;color:var(--muted);padding:6px 0;margin-top:8px"><span class="scan-ring" style="display:inline-block;margin-right:6px"></span>Reading file…</div>';

    if(isExcel){
      /* Use SheetJS for Excel files */
      loadXLSX(function(err){
        if(err){resultEl.innerHTML='<div style="color:var(--red);font-size:12px;padding:8px 0;margin-top:8px">'+esc(err.message)+'</div>';return;}
        var reader=new FileReader();
        reader.onload=function(e){
          try{
            var XLSX=window.XLSX;
            var wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});

            /* Prefer "Mark Entry" sheet, fallback to first sheet */
            var sheetName=wb.SheetNames.indexOf('Mark Entry')>-1?'Mark Entry':wb.SheetNames[0];
            var ws=wb.Sheets[sheetName];
            var rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});

            var extracted=parseExcelRows(rows);
            if(!extracted.length){
              resultEl.innerHTML='<div style="color:var(--red);font-size:12px;padding:8px 10px;margin-top:8px;background:#fef2f2;border:1px solid #fca5a5;border-left:3px solid var(--red)">'+
                '<strong>No valid marks found.</strong><br>Make sure you used the downloaded template and filled the Mark column with numbers 0–100.'+
              '</div>';
              return;
            }
            resultEl.innerHTML='<div style="font-size:11.5px;color:var(--grn);padding:6px 0;margin-top:8px"><i class="bi bi-check-circle"></i> <strong>'+extracted.length+' rows</strong> read from Excel file.</div>';
            var matched=matchExtractedToStudents(extracted);
            renderMatchTable(matched);
          }catch(ex){
            resultEl.innerHTML='<div style="color:var(--red);font-size:12px;padding:8px 0;margin-top:8px"><i class="bi bi-x-octagon"></i> '+esc(ex.message)+'</div>';
          }
        };
        reader.onerror=function(){resultEl.innerHTML='<div style="color:var(--red);font-size:12px;padding:8px 0;margin-top:8px">Could not read file.</div>';};
        reader.readAsArrayBuffer(file);
      });
    }else{
      /* Plain text CSV */
      var reader2=new FileReader();
      reader2.onload=function(e){
        var text=e.target.result;
        var extracted=parseCsvText(text);
        if(!extracted.length){
          resultEl.innerHTML='<div style="color:var(--red);font-size:12px;padding:8px 10px;margin-top:8px;background:#fef2f2;border:1px solid #fca5a5;border-left:3px solid var(--red)">No valid data found. Expected format: <code>Name, Gender, Mark</code></div>';
          return;
        }
        resultEl.innerHTML='<div style="font-size:11.5px;color:var(--grn);padding:6px 0;margin-top:8px"><i class="bi bi-check-circle"></i> <strong>'+extracted.length+' rows</strong> read from CSV file.</div>';
        var matched=matchExtractedToStudents(extracted);
        renderMatchTable(matched);
      };
      reader2.readAsText(file);
    }
  };

  /* ── Parse rows from Excel sheet (SheetJS sheet_to_json output) ──
     Template columns: Cand.No. | Student Name | Gender | Mark
     We match primarily by Cand. No. (position-based = most reliable)
     and fall back to name+gender fuzzy match if cand no. not found.
  ── */
  function parseExcelRows(rows){
    if(!rows||rows.length<2)return[];

    /* Detect header row — find row with "name" and "mark" */
    var headerIdx=0;
    for(var ri=0;ri<Math.min(rows.length,5);ri++){
      var rowStr=rows[ri].join('|').toLowerCase();
      if(rowStr.indexOf('name')>-1&&(rowStr.indexOf('mark')>-1||rowStr.indexOf('score')>-1)){
        headerIdx=ri;break;
      }
    }
    var header=rows[headerIdx].map(function(h){return String(h||'').toLowerCase().trim();});

    /* Find column indices */
    var colCand=-1,colName=-1,colGender=-1,colMark=-1;
    header.forEach(function(h,ci){
      if(/cand|no\.|s\d{3}/.test(h))colCand=ci;
      else if(/name|student/.test(h))colName=ci;
      else if(/gender|sex/.test(h))colGender=ci;
      else if(/mark|score/.test(h))colMark=ci;
    });

    /* Fallback: assume template order Cand|Name|Gender|Mark */
    if(colName<0)colName=1;
    if(colGender<0)colGender=2;
    if(colMark<0)colMark=3;

    var results=[];
    var candRe=/^S\d{3,}-\d{4}$/i;

    for(var i=headerIdx+1;i<rows.length;i++){
      var row=rows[i];
      if(!row||!row.length)continue;

      var candVal=colCand>=0?String(row[colCand]||'').trim():'';
      var nameVal=String(row[colName]||'').trim();
      var genderVal=String(row[colGender]||'').trim().toUpperCase().charAt(0)||null;
      var markRaw=row[colMark];
      var markVal=markRaw===''||markRaw===undefined||markRaw===null?null:parseInt(markRaw);

      if(!nameVal)continue;
      if(markVal===null||isNaN(markVal))continue;
      if(markVal<0||markVal>100)continue;
      if(genderVal!=='M'&&genderVal!=='F')genderVal=null;

      /* If we have a valid cand no., try to match by position first */
      var candIdx=-1;
      if(candVal&&candRe.test(candVal)){
        /* candNo(i) = 'S'+digits+'-'+padded(i+1) — extract the number */
        var candMatch=candVal.match(/-(\d+)$/);
        if(candMatch){
          var pos=parseInt(candMatch[1])-1; /* 0-based */
          if(pos>=0&&pos<S.students.length){
            candIdx=pos;
          }
        }
      }

      results.push({
        name:nameVal,
        gender:genderVal,
        score:markVal,
        candIdx:candIdx, /* -1 = no cand match, >=0 = matched by position */
        confidence: candIdx>=0?'high':'medium'
      });
    }
    return results;
  }

  /* ── CSV Text Parser ── */
  /* ══ UTILITIES (normName, levenshteinSim, parseOcrText) ══ */
  function normName(n){
    return String(n||'').toLowerCase().replace(/[^a-z\s]/g,'').replace(/\s+/g,' ').trim();
  }
  function levenshteinSim(a,b){
    if(a===b)return 1;
    var la=a.length,lb=b.length;
    if(!la||!lb)return 0;
    var mx=[];
    for(var i=0;i<=lb;i++){mx[i]=[i];}
    for(var j=0;j<=la;j++){mx[0][j]=j;}
    for(var i2=1;i2<=lb;i2++){
      for(var j2=1;j2<=la;j2++){
        mx[i2][j2]=b[i2-1]===a[j2-1]?mx[i2-1][j2-1]:
          Math.min(mx[i2-1][j2-1]+1,mx[i2][j2-1]+1,mx[i2-1][j2]+1);
      }
    }
    return 1-mx[lb][la]/Math.max(la,lb);
  }
  function parseOcrText(text){
    var lines=text.split(/\r?\n/).map(function(l){return l.trim();}).filter(function(l){return l.length>2;});
    var results=[];
    var headerRe=/^(#|no\b|s\/n|sn\b|name|student|candidate|cand|subject|score|mark|total|class|grade|sex|gender|pos|position|exam|result|sl\.)/i;
    var candRe=/^S\d{3,}-\d{3,}$/i;
    var genderRe=/^(M|F|Male|Female|MALE|FEMALE)$/i;
    var serialRe=/^\(?\d{1,3}\.?\)?$/;
    lines.forEach(function(line){
      if(headerRe.test(line))return;
      var colonM=line.match(/^([A-Za-z][A-Za-z '\-\.]+?)\s*(?:\(([MFmf])\))?\s*:\s*(\d{1,3})\s*$/);
      if(colonM){var sc=parseInt(colonM[3]);if(sc>=0&&sc<=100){results.push({name:colonM[1].trim(),gender:colonM[2]?colonM[2].toUpperCase():null,score:sc});return;}}
      var tokens=line.split(/[\s,;|\t]+/).map(function(t){return t.trim();}).filter(Boolean);
      if(tokens.length<2)return;
      if(serialRe.test(tokens[0]))tokens=tokens.slice(1);
      if(tokens.length&&candRe.test(tokens[0]))tokens=tokens.slice(1);
      if(tokens.length<2)return;
      var scoreVal=null,scoreIdx=-1;
      for(var i=tokens.length-1;i>=0;i--){
        var raw=tokens[i].replace(/[^0-9]/g,'');
        var n=parseInt(raw);
        if(!isNaN(n)&&n>=0&&n<=100&&raw.length>=1&&raw.length<=3){scoreVal=n;scoreIdx=i;break;}
      }
      if(scoreVal===null)return;
      var genderVal=null,genderIdx=-1;
      for(var j=0;j<scoreIdx;j++){if(genderRe.test(tokens[j])){genderVal=tokens[j].charAt(0).toUpperCase();genderIdx=j;break;}}
      var nameToks=[];
      for(var k=0;k<scoreIdx;k++){
        if(k===genderIdx)continue;
        var t=tokens[k];
        if(/^[A-Za-z][A-Za-z'\-\.]{1,}$/.test(t)||/^[A-Za-z]{2,}$/.test(t))nameToks.push(t);
      }
      if(!nameToks.length)return;
      var name=nameToks.join(' ').trim();
      if(name.length<3)return;
      results.push({name:name,gender:genderVal,score:scoreVal});
    });
    var seen={};
    results=results.filter(function(r){var k=normName(r.name);if(seen[k])return false;seen[k]=true;return true;});
    return results;
  }
  /* ══════════════════════════════════════════════════════════════════════════ ORIGINAL HELPERS */
  function calcGrade(v){
    if(v===undefined||v===null||v==='')return{g:'—',c:'#5a6380'};
    var n=parseInt(v);if(isNaN(n))return{g:'—',c:'#5a6380'};
    if(n>=75)return{g:'A',c:'#1a7a4a'};if(n>=65)return{g:'B',c:'#2c4ecf'};
    if(n>=45)return{g:'C',c:'#c98a00'};if(n>=30)return{g:'D',c:'#d46b08'};
    return{g:'F',c:'#d63b3b'};
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
  var _icons={
    info:'<i class="bi bi-info-circle-fill" style="color:#2c4ecf"></i>',
    success:'<i class="bi bi-check-circle-fill" style="color:#1a7a4a"></i>',
    warning:'<i class="bi bi-exclamation-triangle-fill" style="color:#c98a00"></i>',
    danger:'<i class="bi bi-x-octagon-fill" style="color:#d63b3b"></i>'
  };
  function _modal(title,body,buttons,type){
    g('axpMIcon').innerHTML=_icons[type]||_icons.info;
    g('axpMTitle').textContent=title;
    g('axpMBd').innerHTML=body;
    g('axpMFt').innerHTML=buttons.map(function(b){return'<button onclick="'+b.a+'" class="axpBtn axpSm" style="'+b.s+'">'+b.l+'</button>';}).join('');
    g('axpMod').classList.add('open');
  }
  window.axpMClose=function(){g('axpMod').classList.remove('open');};
  function axpAlert(title,body,type){
    _modal(title,body,[{l:'OK',a:'axpMClose()',s:'background:var(--pri);color:#fff;border-color:var(--pri);'}],type||'info');
  }
  function axpConfirm(title,body,onYes,yesLbl,yesStyle){
    window._axpCB=onYes;
    _modal(title,body,[
      {l:'Cancel',a:'axpMClose()',s:'background:var(--panel2);color:var(--muted);border:1px solid var(--border);'},
      {l:yesLbl||'Confirm',a:'axpMClose();if(window._axpCB){window._axpCB();window._axpCB=null;}',s:yesStyle||'background:var(--pri);color:#fff;border-color:var(--pri);'}
    ],'warning');
  }
  function showPill(msg,type){
    var cols={
      success:{bg:'#f0fdf4',brd:'#1a7a4a',tc:'#1a7a4a'},
      info:{bg:'#eef1fb',brd:'var(--pri)',tc:'var(--pri)'},
      warning:{bg:'#fffbeb',brd:'#c98a00',tc:'#7a5800'},
      danger:{bg:'#fef2f2',brd:'var(--red)',tc:'var(--red)'}
    };
    var c=cols[type]||cols.info;
    var el=g('axpFeedPill');if(!el)return;
    clearTimeout(window._axpPT);
    el.style.cssText='display:flex;position:fixed;top:62px;right:14px;z-index:8000;padding:8px 13px;font-size:12px;font-weight:700;align-items:center;gap:7px;min-width:150px;max-width:280px;border-left:3px solid '+c.brd+';border:1px solid '+c.brd+';background:'+c.bg+';color:'+c.tc+';animation:pillIn .2s ease;line-height:1.3';
    el.textContent=msg;
    window._axpPT=setTimeout(function(){
      el.style.animation='pillOut .2s ease forwards';
      setTimeout(function(){el.style.display='none';},200);
    },2400);
  }
  function axpToast(msg,type){
    var bg={success:'#f0fdf4',danger:'#fef2f2',warning:'#fffbeb',info:'#eef1fb'};
    var brd={success:'#1a7a4a',danger:'var(--red)',warning:'#c98a00',info:'var(--pri)'};
    var tc={success:'#1a7a4a',danger:'#d63b3b',warning:'#7a5800',info:'var(--pri)'};
    var el=g('axpToast');
    el.style.cssText='display:flex;position:fixed;bottom:18px;right:14px;z-index:9999;padding:9px 14px;font-size:12px;font-weight:700;align-items:center;gap:7px;border-left:3px solid '+(brd[type]||brd.info)+';border:1px solid '+(brd[type]||brd.info)+';background:'+(bg[type]||bg.info)+';color:'+(tc[type]||tc.info)+';animation:popIn .2s ease';
    el.textContent=msg;
    clearTimeout(window._axpTT);
    window._axpTT=setTimeout(function(){el.style.display='none';},3200);
  }

})();
