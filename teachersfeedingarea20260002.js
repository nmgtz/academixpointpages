
(function () {
  'use strict';

  var AXP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyEs_qpwI_jgxnli-hShWXB1IiflBwgaXexZhJMvMXbDoG3wEANY8GFYckHvw7vOcTA/exec';
  var _href  = window.location.href;
  var _match = _href.match(/\/p\/s(\d{3,})-teachers-feeding-area\.html/i);

  if (!_match) {
    // URL does not match — do absolutely nothing
    return;
  }

  /* URL matched — extract digits e.g. "6103" */
  var _DIGITS = _match[1];

  /* ══════════════════════════════════════════════
     STATE
  /* ============================================= */
  var S = {
    digits:_DIGITS, schoolId:null, schoolName:'', meta:null,
    examType:'', cls:'', subject:'',
    students:[], marks:{}, idx:0,
    submitted:false, teacher:null
  };
  var _axpCB = null;

  /* ══════════════════════════════════════════════
     STEP 2 — WAIT FOR DOM THEN WIPE + INJECT
  /* ============================================= */
  /* ══════════════════════════════════════════════
     AGGRESSIVE EARLY KILL
     Runs immediately — blocks other Blogger scripts
     from attaching DOM handlers or injecting HTML
  /* ============================================= */

  /* Save real APIs before overriding */
  var _ael  = document.addEventListener.bind(document);
  var _wael = window.addEventListener.bind(window);
  var _dw   = document.write ? document.write.bind(document) : function(){};

  /* Block foreign scripts from catching DOMContentLoaded / load */
  document.addEventListener = function(type, fn, opts) {
    if (type === 'DOMContentLoaded' || type === 'load' || type === 'readystatechange') return;
    _ael(type, fn, opts);
  };
  window.addEventListener = function(type, fn, opts) {
    if (type === 'DOMContentLoaded' || type === 'load') return;
    _wael(type, fn, opts);
  };
  /* Block document.write injection */
  document.write = function(){};
  document.writeln = function(){};

  /* Boot — uses real saved reference */
  function boot() {
    /* Restore real APIs immediately */
    document.addEventListener = _ael;
    window.addEventListener   = _wael;
    document.write            = _dw;
    wipePage();
    injectStyles();
    injectBootstrapIcons();
    buildShell();
    axpInit();
  }

  if (document.readyState === 'loading') {
    _ael('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 0);
  }

  /* ══════════════════════════════════════════════
     WIPE PAGE — kill all foreign styles, scripts,
     body HTML so Blogger template cannot interfere
  /* ============================================= */
  function wipePage() {
    /* 1. Remove all styles and stylesheets */
    Array.from(document.querySelectorAll(
      'style, link[rel="stylesheet"]'
    )).forEach(function(el){ el.parentNode.removeChild(el); });

    /* 2. Neutralise foreign script tags — blank their src so pending
          network callbacks deliver nothing. Skip our own script. */
    /* Whitelist — these scripts must NEVER be neutralised */
    var _whitelist = [
      'axp-teacher-marks',
      'teachersfeedingarea',  /* this file hosted under its Blogger name */
      'jspdf',
      'bootstrap-icons'
    ];
    function _isOwnScript(src) {
      return _whitelist.some(function(w){ return src.indexOf(w) > -1; });
    }
    Array.from(document.querySelectorAll('script[src]')).forEach(function(el){
      if (_isOwnScript(el.src)) return;  /* never touch our own script */
      try { el.onload = null; el.onerror = null; } catch(ex){}
    });

    /* 3. Wipe body */
    document.body.innerHTML = '';
    document.body.style.cssText = '';
    document.documentElement.style.cssText = '';

    /* 4. Page title */
    document.title = 'AcademixPoint — Teacher Marks Entry';

    /* 5. Viewport */
    if (!document.querySelector('meta[name="viewport"]')) {
      var vm   = document.createElement('meta');
      vm.name  = 'viewport';
      vm.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(vm);
    }

    /* 6. Silence console errors from now-dead foreign scripts */
    window.onerror = function(msg, src) {
      if (!src) return true;
      if (_isOwnScript(src)) return false; /* let our own errors through */
      return true; /* suppress foreign errors */
    };
    window.onunhandledrejection = function(e){ e.preventDefault(); };
  }

  /* ══════════════════════════════════════════════
     INJECT STYLES
  /* ============================================= */
  function injectStyles() {
    var s = document.createElement('style');
    s.id  = 'axp-styles';
    s.textContent = [
      '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }',
      'html, body { height: 100%; background: #f0f4f8; }',
      'body { font-family: \'Segoe UI\', system-ui, sans-serif; font-size: 14px; color: #060c1c; }',
      ':root {',
        '--ink:#060c1c; --teal:#4ecca3; --teal2:#10b981; --amber:#f59e0b;',
        '--red:#ef4444; --orange:#f97316; --slate:#64748b;',
        '--bg:#f0f4f8; --card:#ffffff; --border:#e2e8f0; --r:4px;',
      '}',
      /* ── Header ── */
      '#axpHdr { background: linear-gradient(135deg,#060c1c,#0f2248); color:#fff;',
        'padding:14px 20px; display:flex; align-items:center; gap:12px;',
        'border-bottom:2px solid #4ecca3; position:sticky; top:0; z-index:100; }',
      '#axpHdr .logo { font-size:18px; font-weight:900; color:#4ecca3; letter-spacing:1px; }',
      '#axpHdr .sname { font-size:13px; font-weight:600; opacity:.85; flex:1; }',
      /* ── Wrap ── */
      '.axpW { max-width:800px; margin:0 auto; padding:20px 14px 60px; }',
      /* ── Card ── */
      '.axpCard { background:var(--card); border:1px solid var(--border); border-radius:var(--r);',
        'padding:20px; margin-bottom:16px; box-shadow:0 2px 8px rgba(6,12,28,.06); }',
      '.axpCT { font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:.6px;',
        'color:var(--ink); margin-bottom:14px; display:flex; align-items:center; gap:8px; }',
      '.axpCT i { color:var(--teal); font-size:16px; }',
      /* ── Chips ── */
      '.axpChips { display:flex; flex-wrap:wrap; gap:7px; }',
      '.axpChip { padding:7px 14px; border:1.5px solid var(--border); background:#fff;',
        'color:var(--slate); font-size:12.5px; font-weight:600; cursor:pointer;',
        'border-radius:var(--r); transition:all .15s; user-select:none; }',
      '.axpChip:hover { border-color:var(--teal); color:var(--ink); }',
      '.axpChip.on { background:var(--ink); border-color:var(--teal); color:var(--teal); }',
      /* ── Buttons ── */
      '.axpBtn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px;',
        'font-size:13px; font-weight:700; border:none; border-radius:var(--r);',
        'cursor:pointer; transition:all .15s; }',
      '.axpBP { background:linear-gradient(135deg,var(--ink),#0f2248); color:var(--teal); border:1.5px solid var(--teal); }',
      '.axpBP:hover { background:var(--teal); color:var(--ink); }',
      '.axpBP:disabled { opacity:.5; cursor:not-allowed; }',
      '.axpBG { background:#f8fafc; color:var(--slate); border:1.5px solid var(--border); }',
      '.axpBG:hover { background:var(--border); }',
      '.axpSm { padding:6px 12px; font-size:12px; }',
      /* ── Student banner ── */
      '.axpSBnr { background:linear-gradient(135deg,var(--ink),#0f2248); color:#fff;',
        'padding:18px 20px; border-radius:var(--r); margin-bottom:16px;',
        'display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }',
      '.sName { font-size:18px; font-weight:900; color:var(--teal); }',
      '.sMeta { font-size:12px; opacity:.7; margin-top:3px; }',
      '.sCand { font-size:12px; font-family:monospace; background:rgba(78,204,163,.15);',
        'color:var(--teal); padding:4px 10px; border-radius:20px; font-weight:700; }',
      /* ── Score ── */
      '.axpSW { text-align:center; padding:20px 0 10px; }',
      '.axpSI { width:140px; height:70px; font-size:36px; font-weight:900; text-align:center;',
        'border:3px solid var(--border); border-radius:var(--r); color:var(--ink); outline:none;',
        'transition:border-color .2s; }',
      '.axpSI:focus { border-color:var(--teal); }',
      '.axpSI.gA{border-color:#10b981;} .axpSI.gB{border-color:#4ecca3;}',
      '.axpSI.gC{border-color:#f59e0b;} .axpSI.gD{border-color:#f97316;} .axpSI.gF{border-color:#ef4444;}',
      '.axpGB { display:inline-block; font-size:28px; font-weight:900; margin-top:6px; min-width:48px; }',
      /* ── Progress ── */
      '.axpPB { background:var(--border); height:6px; border-radius:3px; overflow:hidden; margin:8px 0; }',
      '.axpPF { height:100%; background:linear-gradient(90deg,var(--teal),var(--teal2));',
        'border-radius:3px; transition:width .4s ease; }',
      /* ── Nav ── */
      '.axpNav { display:flex; gap:10px; justify-content:space-between; flex-wrap:wrap; margin-top:14px; }',
      /* ── Table ── */
      '.axpTbl { width:100%; border-collapse:collapse; font-size:13px; }',
      '.axpTbl th, .axpTbl td { border:1px solid #000; padding:7px 10px; }',
      '.axpTbl thead tr { background:var(--ink); color:var(--teal); }',
      '.axpTbl tbody tr:nth-child(even) { background:#f8fafc; }',
      /* ── Grade grid ── */
      '.axpGG { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; margin-bottom:16px; }',
      '.axpGC { text-align:center; padding:10px 4px; border-radius:var(--r); background:#f8fafc; }',
      '.axpGC .gv { font-size:22px; font-weight:900; }',
      '.axpGC .gl { font-size:10px; font-weight:700; margin-top:2px; }',
      /* ── Spinner ── */
      '.axpSpin { display:inline-block; width:18px; height:18px;',
        'border:2.5px solid rgba(78,204,163,.3); border-top-color:var(--teal);',
        'border-radius:50%; animation:axpSpin .6s linear infinite; vertical-align:middle; }',
      '@keyframes axpSpin { to { transform:rotate(360deg); } }',
      /* ── Toolbar ── */
      '.axpTBar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }',
      /* ── Teacher banner ── */
      '.axpTchr { background:#f0fdf9; border:1px solid #6ee7b7; padding:10px 14px;',
        'border-radius:var(--r); font-size:12.5px; color:#065f46; margin-bottom:12px;',
        'display:flex; align-items:center; gap:10px; }',
      /* ── Restore banner ── */
      '#axpRB { display:none; background:#fffbeb; border:1.5px solid var(--amber);',
        'padding:14px 18px; border-radius:var(--r); margin-bottom:16px; }',
      /* ── Loading ── */
      '#axpLd { text-align:center; padding:60px 20px; }',
      '#axpLd .ls { width:40px; height:40px; border:4px solid rgba(78,204,163,.2);',
        'border-top-color:var(--teal); border-radius:50%;',
        'animation:axpSpin .7s linear infinite; margin:0 auto 16px; }',
      /* ── Modal ── */
      '#axpMod { display:none; position:fixed; top:0; left:0; right:0; bottom:0;',
        'width:100vw; height:100vh; z-index:2147483647;',
        'background:rgba(6,12,28,.82); backdrop-filter:blur(4px);',
        'align-items:center; justify-content:center; padding:20px; }',
      '#axpMod.open { display:flex; }',
      '#axpMBox { background:#fff; max-width:460px; width:100%; border-radius:var(--r);',
        'overflow:hidden; animation:axpPop .18s ease; z-index:2147483647; }',
      '@keyframes axpPop { from{opacity:0;transform:scale(.93);} to{opacity:1;transform:scale(1);} }',
      '#axpMHd { background:linear-gradient(135deg,var(--ink),#0f2248); padding:16px 20px;',
        'display:flex; align-items:center; gap:10px; }',
      '#axpMHd .mhi { font-size:22px; }',
      '#axpMHd .mht { font-size:15px; font-weight:800; color:#fff; flex:1; }',
      '#axpMHd .mhx { background:none; border:none; color:rgba(255,255,255,.5);',
        'font-size:22px; cursor:pointer; line-height:1; }',
      '#axpMBd { padding:20px 22px; font-size:13.5px; color:var(--ink); line-height:1.75; }',
      '#axpMFt { padding:10px 22px 18px; display:flex; gap:8px; justify-content:flex-end; }',
      /* ── Toast ── */
      '#axpToast { position:fixed; bottom:24px; right:20px; z-index:2147483647;',
        'padding:11px 20px; font-size:13px; font-weight:700; color:#fff;',
        'border-radius:var(--r); box-shadow:0 8px 28px rgba(0,0,0,.25);',
        'display:none; animation:axpPop .2s ease; }',
      /* ── Utility ── */
      '.axpH { display:none !important; }',
      /* ── Responsive ── */
      '@media(max-width:600px){',
        '.axpGG { grid-template-columns:repeat(3,1fr); }',
        '.axpNav { flex-direction:column; }',
        '.axpNav .axpBtn { width:100%; justify-content:center; }',
      '}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function injectBootstrapIcons() {
    var l  = document.createElement('link');
    l.rel  = 'stylesheet';
    l.href = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.3/font/bootstrap-icons.min.css';
    document.head.appendChild(l);
  }

  /* ══════════════════════════════════════════════
     BUILD SHELL — inject full HTML into body
  /* ============================================= */
  function buildShell() {
    document.body.innerHTML = [
      /* ── Header ── */
      '<div id="axpHdr">',
        '<div>',
          '<div class="logo">AcademixPoint</div>',
          '<div class="sname" id="axpSN">Loading school…</div>',
        '</div>',
        '<div style="margin-left:auto;display:flex;gap:8px;align-items:center;">',
          btn('bi-trash3','Clear Cache','axpClearCache()','axpBG axpSm'),
        '</div>',
      '</div>',
      /* ── Wrap ── */
      '<div class="axpW">',
        /* Loading */
        '<div id="axpLd"><div class="ls"></div>',
          '<div style="font-size:14px;color:var(--slate);">Loading school data…</div>',
        '</div>',
        /* Error */
        '<div id="axpErr" class="axpH" style="background:#fff1f2;border-left:4px solid var(--red);',
          'padding:14px 18px;border-radius:var(--r);color:#991b1b;font-size:13px;">',
          '<strong>Error: </strong><span id="axpEM"></span>',
        '</div>',
        /* Main */
        '<div id="axpMain" class="axpH">',
          /* Restore banner */
          '<div id="axpRB">',
            '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">',
              '<i class="bi bi-cloud-arrow-down" style="font-size:20px;color:var(--amber);"></i>',
              '<div style="flex:1;">',
                '<div style="font-weight:700;font-size:13px;">Unsaved session found</div>',
                '<div style="font-size:12px;opacity:.8;" id="axpRI"></div>',
              '</div>',
              btn('bi-arrow-counterclockwise','Restore','axpRestoreSession()','axpBP axpSm'),
              btn('','Dismiss','axpDismissRestore()','axpBG axpSm'),
            '</div>',
          '</div>',
          /* Step 1 — Exam */
          card('bi-journal-bookmark','Step 1 — Exam Type','<div class="axpChips" id="axpEC"></div>'),
          /* Step 2 — Class */
          '<div id="axpS2" class="axpH">'+card('bi-people','Step 2 — Class','<div class="axpChips" id="axpCC"></div>')+'</div>',
          /* Step 3 — Subject */
          '<div id="axpS3" class="axpH">'+card('bi-book','Step 3 — Subject','<div class="axpChips" id="axpSC"></div>')+'</div>',
          /* Load btn */
          '<div id="axpLW" class="axpH" style="text-align:center;margin-bottom:16px;">',
            btn('bi-cloud-download','Load Students','axpLoadRoster()','axpBP','id="axpLB"'),
          '</div>',
          /* Entry area */
          '<div id="axpEntry" class="axpH">',
            /* Teacher */
            '<div id="axpTchrBnr" class="axpTchr axpH">',
              '<i class="bi bi-person-badge-fill" style="font-size:18px;"></i>',
              '<div id="axpTI"></div>',
            '</div>',
            /* Progress */
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;">',
              '<span id="axpPL" style="font-size:12px;font-weight:700;color:var(--slate);">0 / 0</span>',
              '<div class="axpPB" style="flex:1;min-width:100px;"><div class="axpPF" id="axpPF" style="width:0%"></div></div>',
              '<span id="axpPP" style="font-size:12px;font-weight:700;color:var(--teal);">0%</span>',
            '</div>',
            /* Student banner */
            '<div class="axpSBnr">',
              '<div><div class="sName" id="axpSN2">—</div><div class="sMeta" id="axpSM"></div></div>',
              '<div style="text-align:right;">',
                '<div class="sCand" id="axpSC2"></div>',
                '<div style="font-size:11px;opacity:.6;margin-top:4px;" id="axpSX"></div>',
              '</div>',
            '</div>',
            /* Score input */
            '<div class="axpSW">',
              '<input type="number" class="axpSI" id="axpSI" min="0" max="100" placeholder="—"',
                ' oninput="axpOnScore(this)" onkeydown="axpScoreKey(event)">',
              '<div><span class="axpGB" id="axpGBdg" style="color:#94a3b8;">—</span></div>',
              '<div style="font-size:12px;color:var(--slate);margin-top:6px;" id="axpPMk"></div>',
            '</div>',
            /* Nav */
            '<div class="axpNav">',
              btn('bi-chevron-left','Prev','axpPrev()','axpBG'),
              btn('bi-skip-forward','Skip','axpSkip()','axpBG'),
              btn2('Next','bi-chevron-right','axpNext()','axpBP'),
            '</div>',
            /* Submit */
            '<div style="margin-top:16px;text-align:center;">',
              '<button class="axpBtn axpBP" id="axpSubBtn" onclick="axpSubmitAll()"',
                ' style="background:linear-gradient(135deg,#065f46,#10b981);border-color:#6ee7b7;padding:12px 32px;">',
                '<i class="bi bi-send-fill"></i> Submit All Marks',
              '</button>',
            '</div>',
          '</div>',
          /* Done / Summary */
          '<div id="axpDone" class="axpH">',
            '<div class="axpCard">',
              '<div class="axpCT"><i class="bi bi-check2-all"></i> Marks Submitted</div>',
              '<div class="axpGG" id="axpGGrid"></div>',
              '<div class="axpTBar">',
                btn('bi-file-pdf','Export PDF','axpExportPDF()','axpBP axpSm'),
                btn('bi-pencil','Re-enter','axpReenter()','axpBG axpSm'),
                btn('bi-download','CSV','axpExportCSV()','axpBG axpSm'),
                '<button class="axpBtn axpBP axpSm" onclick="axpStartNew()" style="margin-left:auto;">',
                  '<i class="bi bi-plus-circle"></i> New Subject',
                '</button>',
              '</div>',
              '<div style="overflow-x:auto;">',
                '<table class="axpTbl">',
                  '<thead><tr>',
                    '<th>Cand. No.</th><th>Name</th>',
                    '<th style="text-align:center;">Sex</th>',
                    '<th style="text-align:center;">Score</th>',
                    '<th style="text-align:center;">Grade</th>',
                    '<th style="text-align:center;">Position</th>',
                  '</tr></thead>',
                  '<tbody id="axpTbody"></tbody>',
                '</table>',
              '</div>',
            '</div>',
          '</div>',
        '</div>',/* /axpMain */
      '</div>',/* /axpW */
      /* Modal */
      '<div id="axpMod">',
        '<div id="axpMBox">',
          '<div id="axpMHd">',
            '<div class="mhi" id="axpMIcon"></div>',
            '<div class="mht" id="axpMTitle"></div>',
            '<button class="mhx" onclick="axpMClose()">×</button>',
          '</div>',
          '<div id="axpMBd"></div>',
          '<div id="axpMFt"></div>',
        '</div>',
      '</div>',
      /* Toast */
      '<div id="axpToast"></div>'
    ].join('');
  }

  /* Helper — builds a button string */
  function btn(icon, label, onclick, cls, extra) {
    var ic = icon ? '<i class="bi ' + icon + '"></i> ' : '';
    return '<button class="axpBtn ' + (cls||'') + '" onclick="' + onclick + '" ' + (extra||'') + '>' + ic + label + '</button>';
  }
  function btn2(label, icon, onclick, cls) {
    return '<button class="axpBtn ' + (cls||'') + '" onclick="' + onclick + '">' + label + ' <i class="bi ' + icon + '"></i></button>';
  }
  function card(icon, title, body) {
    return '<div class="axpCard"><div class="axpCT"><i class="bi ' + icon + '"></i> ' + title + '</div>' + body + '</div>';
  }

  /* ══════════════════════════════════════════════
     API HELPERS
  /* ============================================= */
  async function apiGet(p) {
    var url = new URL(AXP_SCRIPT_URL);
    Object.keys(p).forEach(function(k){ url.searchParams.append(k, p[k]); });
    return (await fetch(url.toString())).json();
  }
  async function apiPost(p) {
    var f = new FormData();
    Object.keys(p).forEach(function(k){ f.append(k, p[k]); });
    return (await fetch(AXP_SCRIPT_URL, {method:'POST', body:f})).json();
  }

  /* ══════════════════════════════════════════════
     INIT — load school by index digits
  /* ============================================= */
  async function axpInit() {
    try {
      var res = await apiGet({ mode:'schoolByIndex', schoolIndex: S.digits });
      if (res.status !== 'success') throw new Error(res.message || 'School not found.');
      S.schoolId = res.schoolId;
      S.schoolName = res.schoolName;
      S.meta = res.meta;
      g('axpSN').textContent = S.schoolName;
      document.title = 'Marks Entry — ' + S.schoolName;
      hide('axpLd'); show('axpMain');
      buildExamChips();
      checkRestore();
    } catch(ex) { showErr(ex.message); }
  }

  /* ══════════════════════════════════════════════
     WIZARD — CHIPS
  /* ============================================= */
  function buildExamChips() {
    fill('axpEC', S.meta.examTypes || [], function(et) {
      S.examType = et; S.cls = ''; S.subject = '';
      hideEl('axpS2'); hideEl('axpS3'); hideEl('axpLW');
      buildClassChips();
    });
    hideEl('axpS2'); hideEl('axpS3'); hideEl('axpLW');
  }

  function buildClassChips() {
    fill('axpCC', S.meta.classes || [], function(cls) {
      S.cls = cls; S.subject = '';
      hideEl('axpS3'); hideEl('axpLW');
      buildSubjectChips();
    });
    showEl('axpS2'); hideEl('axpS3'); hideEl('axpLW');
  }

  function buildSubjectChips() {
    var subs = (S.meta.subjects && S.meta.subjects[S.cls]) || [];
    showEl('axpS3'); hideEl('axpLW');
    if (!subs.length) {
      g('axpSC').innerHTML = '<div style="font-size:12px;color:var(--slate);">No subjects for ' + esc(S.cls) + '.</div>';
      return;
    }
    fill('axpSC', subs, function(sub) {
      S.subject = sub; showEl('axpLW');
    });
  }

  /* fill container with chips — clears existing first */
  function fill(containerId, items, onSelect) {
    var c = g(containerId); c.innerHTML = '';
    items.forEach(function(item) {
      var b = document.createElement('button');
      b.className   = 'axpChip';
      b.textContent = item;
      b.onclick = function() {
        Array.from(c.querySelectorAll('.axpChip')).forEach(function(x){ x.classList.remove('on'); });
        b.classList.add('on');
        onSelect(item);
      };
      c.appendChild(b);
    });
  }

  /* ══════════════════════════════════════════════
     LOAD ROSTER
  /* ============================================= */
  async function axpLoadRoster() {
    var lb = g('axpLB'); lb.disabled = true;
    lb.innerHTML = '<span class="axpSpin"></span> Loading…';
    try {
      var res = await apiGet({
        mode:'feedingRoster', schoolId:S.schoolId,
        year:S.meta.year, examType:S.examType,
        'class':S.cls, subject:S.subject
      });
      if (!res.students || !res.students.length) {
        axpAlert('No Students',
          'No students enrolled in <strong>'+esc(S.subject)+'</strong> for <strong>'+esc(S.cls)+'</strong>.<br><br>'+
          'Check registration sheet subject enrollment.', 'warning');
        return;
      }
      S.students  = sortStu(res.students);
      S.marks     = {};
      S.idx       = 0;
      S.submitted = false;
      S.teacher   = res.teacher || null;

      /* Teacher banner */
      if (S.teacher) {
        showEl('axpTchrBnr');
        g('axpTI').innerHTML = '<strong>'+esc(S.teacher.name)+'</strong>'+
          (S.teacher.email ? ' &nbsp;·&nbsp; '+esc(S.teacher.email) : '')+
          ' <span style="opacity:.6;">(assigned)</span>';
      } else {
        hideEl('axpTchrBnr');
      }

      showEl('axpEntry'); hideEl('axpDone');
      renderCard();
      saveCache();
    } catch(ex) { axpAlert('Load Error', 'Failed: '+ex.message, 'danger'); }
    finally {
      lb.disabled = false;
      lb.innerHTML = '<i class="bi bi-cloud-download"></i> Load Students';
    }
  }

  /* ══════════════════════════════════════════════
     RENDER STUDENT CARD
  /* ============================================= */
  function renderCard() {
    var s = S.students[S.idx], total = S.students.length;
    var filled = Object.keys(S.marks).length;
    var pct    = Math.round(filled / total * 100);
    g('axpSN2').textContent  = s.name;
    g('axpSM').textContent   = (s.gender === 'F' ? 'Female' : 'Male') + ' · ' + S.subject + ' · ' + S.cls;
    g('axpSC2').textContent  = candNo(S.idx);
    g('axpSX').textContent   = (S.idx + 1) + ' of ' + total;
    g('axpPL').textContent   = filled + ' / ' + total + ' filled';
    g('axpPF').style.width   = pct + '%';
    g('axpPP').textContent   = pct + '%';
    var sc = S.marks[s.name];
    g('axpSI').value = sc !== undefined ? sc : '';
    updateBadge(sc);
    g('axpPMk').textContent = '';
    g('axpSI').focus();
    g('axpSI').select();
  }

  function updateBadge(v) {
    var gr = calcGrade(v);
    g('axpGBdg').textContent = gr.g;
    g('axpGBdg').style.color = gr.c;
    g('axpSI').className = 'axpSI' + (v !== null && v !== undefined && v !== '' ? ' g' + gr.g : '');
  }

  /* These must be on window for inline onXxx handlers */
  window.axpOnScore = function(inp) {
    var v = inp.value.trim();
    if (!v) { updateBadge(null); return; }
    var n = parseInt(v);
    if (!isNaN(n) && n >= 0 && n <= 100) {
      S.marks[S.students[S.idx].name] = n;
      updateBadge(n);
      saveCache();
    }
  };
  window.axpScoreKey = function(e) {
    if (e.key === 'Enter' || e.key === 'ArrowDown') { e.preventDefault(); axpNext(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); axpPrev(); }
  };

  function saveCurrent() {
    var v = g('axpSI').value.trim();
    if (v) {
      var n = parseInt(v);
      if (!isNaN(n) && n >= 0 && n <= 100) S.marks[S.students[S.idx].name] = n;
    }
  }

  window.axpNext = function() {
    saveCurrent();
    if (S.idx < S.students.length - 1) { S.idx++; renderCard(); }
    else { axpAlert('End of List', 'Last student reached. Click <strong>Submit All Marks</strong>.', 'info'); }
  };
  window.axpPrev = function() { saveCurrent(); if (S.idx > 0) { S.idx--; renderCard(); } };
  window.axpSkip = function() { if (S.idx < S.students.length - 1) { S.idx++; renderCard(); } };

  /* ══════════════════════════════════════════════
     SUBMIT
  /* ============================================= */
  window.axpSubmitAll = function() {
    saveCurrent();
    var payload = S.students
      .filter(function(s){ return S.marks[s.name] !== undefined; })
      .map(function(s){ return { name: s.name, score: S.marks[s.name] }; });
    if (!payload.length) { axpAlert('No Marks', 'Enter at least one score first.', 'warning'); return; }

    axpConfirm(
      'Confirm Submission',
      'Submit <strong>' + payload.length + '</strong> marks for<br>' +
      '<strong>' + esc(S.subject) + '</strong> — ' + esc(S.cls) + ' — ' + esc(S.examType) + '?',
      async function() {
        var btn = g('axpSubBtn'); btn.disabled = true;
        btn.innerHTML = '<span class="axpSpin"></span> Submitting…';
        try {
          var res = await apiPost({
            mode          : 'teacherMarksEntry',
            schoolId      : S.schoolId,
            year          : S.meta.year,
            examType      : S.examType,
            'class'       : S.cls,
            subject       : S.subject,
            'data[studentName]': payload.map(function(p){ return p.name; }).join(','),
            'data[marks]'      : payload.map(function(p){ return String(p.score); }).join(',')
          });
          if (res.status === 'success') {
            var saved = res.saved !== undefined ? res.saved : payload.length;
            var nf    = res.notFound || [];
            S.submitted = true;
            clearCache();
            showSummary();
            axpToast(saved + ' marks saved!', 'success');
            if (nf.length) {
              axpAlert('Partial Submit',
                saved + ' saved. ⚠️ ' + nf.length + ' not found in sheet: ' +
                nf.slice(0,5).map(esc).join(', '), 'warning');
            }
          } else { axpAlert('Failed', res.message || 'Try again.', 'danger'); }
        } catch(ex) { axpAlert('Network Error', ex.message, 'danger'); }
        finally {
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-send-fill"></i> Submit All Marks';
        }
      },
      'Submit', 'background:#065f46;border-color:#6ee7b7;color:#fff;'
    );
  };

  /* ══════════════════════════════════════════════
     SUMMARY
  /* ============================================= */
  function showSummary() {
    var gc  = { A:0, B:0, C:0, D:0, F:0, '—':0 };
    var gc2 = { A:'#10b981', B:'#4ecca3', C:'#f59e0b', D:'#f97316', F:'#ef4444', '—':'#94a3b8' };

    var rows = S.students.map(function(s, i) {
      var sc = S.marks[s.name]; var gr = calcGrade(sc);
      gc[gr.g] = (gc[gr.g] || 0) + 1;
      return { cand:candNo(i), name:s.name, gender:s.gender, score:sc, gr:gr.g, col:gr.c };
    });

    /* Rank — females and males ranked together by score */
    var ranked = rows.filter(function(r){ return r.score !== undefined; })
      .slice().sort(function(a,b){ return b.score - a.score; });
    var pm = {}, p = 0, ls = null, lp = 0;
    ranked.forEach(function(r){
      if (r.score !== ls){ p = lp + 1; ls = r.score; lp = p; } pm[r.name] = p;
    });

    /* Grade grid */
    g('axpGGrid').innerHTML = ['A','B','C','D','F','—'].map(function(gr){
      return '<div class="axpGC"><div class="gv" style="color:'+gc2[gr]+'">'+(gc[gr]||0)+'</div>'+
        '<div class="gl" style="color:'+gc2[gr]+'">Grade '+gr+'</div></div>';
    }).join('');

    /* Table rows — sorted: females A→Z first then males A→Z (already sorted in S.students) */
    g('axpTbody').innerHTML = rows.map(function(r){
      return '<tr>' +
        '<td style="font-family:monospace;color:#4ecca3;font-weight:700;">' + esc(r.cand) + '</td>' +
        '<td style="font-weight:500;">' + esc(r.name) + '</td>' +
        '<td style="text-align:center;">' + (r.gender === 'F' ? 'F' : 'M') + '</td>' +
        '<td style="text-align:center;font-weight:700;">' + (r.score !== undefined ? r.score : '—') + '</td>' +
        '<td style="text-align:center;"><strong style="color:'+r.col+';font-size:15px;">'+r.gr+'</strong></td>' +
        '<td style="text-align:center;font-weight:700;">' + (pm[r.name] || '—') + '</td>' +
      '</tr>';
    }).join('');

    hideEl('axpEntry'); showEl('axpDone');
  }

  /* ══════════════════════════════════════════════
     PDF EXPORT
  /* ============================================= */
  window.axpExportPDF = async function() {
    if (!window.jspdf) {
      await new Promise(function(res, rej){
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    var { jsPDF } = window.jspdf;
    var doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
    var ML=14, MR=14, MT=14, PW=210, PH=297, UW=PW-ML-MR, y=MT;

    /* ── HELPERS ──────────────────────────────── */
    function pct(n,t){ return t>0?(n/t*100).toFixed(1)+'%':'0%'; }
    function checkPage(need){ if(y+need>PH-14){doc.addPage();y=MT;return true;}return false; }
    function secTitle(title,r,g,b){
      checkPage(12);
      doc.setFillColor(r||6,g||12,b||28); doc.rect(ML,y,UW,8,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(78,204,163);
      doc.text(title.toUpperCase(), ML+3, y+5.5);
      y+=10;
    }

    /* ── PRE-COMPUTE ──────────────────────────── */
    var withMarks = S.students.filter(function(s){ return S.marks[s.name]!==undefined; });
    var total  = withMarks.length;
    var totalF = withMarks.filter(function(s){ return (s.gender||'').toUpperCase()==='F'; }).length;
    var totalM = total - totalF;
    var GRD    = ['A','B','C','D','F'];
    var GPA_PT = {A:1,B:2,C:3,D:4,F:5};
    var stats  = {A:{F:0,M:0},B:{F:0,M:0},C:{F:0,M:0},D:{F:0,M:0},F:{F:0,M:0}};
    var gpaSum=0,gpaSumF=0,gpaSumM=0,gpaFn=0,gpaMn=0;

    withMarks.forEach(function(s){
      var gr  = calcGrade(S.marks[s.name]).g;
      var sex = (s.gender||'').toUpperCase()==='F'?'F':'M';
      if(stats[gr]) stats[gr][sex]++;
      var pt=GPA_PT[gr]||5; gpaSum+=pt;
      if(sex==='F'){gpaSumF+=pt;gpaFn++;}else{gpaSumM+=pt;gpaMn++;}
    });

    var gpaAll  = total>0  ?(gpaSum/total).toFixed(2)  :'—';
    var gpaFVal = gpaFn>0  ?(gpaSumF/gpaFn).toFixed(2) :'—';
    var gpaMVal = gpaMn>0  ?(gpaSumM/gpaMn).toFixed(2) :'—';
    var cntPass = (stats.A.F+stats.A.M)+(stats.B.F+stats.B.M)+(stats.C.F+stats.C.M)+(stats.D.F+stats.D.M);
    var cntFail = stats.F.F+stats.F.M;
    var cntAB   = (stats.A.F+stats.A.M)+(stats.B.F+stats.B.M);
    var cntABC  = cntAB+(stats.C.F+stats.C.M);
    var cntD    = stats.D.F+stats.D.M;
    var cntA    = stats.A.F+stats.A.M;

    /* Rank — only withMarks */
    var ranked = withMarks.slice().sort(function(a,b){return S.marks[b.name]-S.marks[a.name];});
    var pm={},p=0,ls=null,lp=0;
    ranked.forEach(function(s){var sc=S.marks[s.name];if(sc!==ls){p=lp+1;ls=sc;lp=p;}pm[s.name]=p;});
    var best10  = ranked.slice(0,10);
    var least10 = ranked.slice(-10).reverse();
    var stuIdx  = {}; S.students.forEach(function(s,i){stuIdx[s.name]=i;});
    var gradeCol= {A:[16,185,129],B:[4,120,87],C:[180,130,6],D:[194,65,12],F:[185,28,28]};

    /* ── PAGE 1 HEADER ────────────────────────── */
    doc.setFillColor(6,12,28); doc.rect(ML,y,UW,24,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(78,204,163);
    doc.text(S.schoolName.toUpperCase(),PW/2,y+9,{align:'center'});
    doc.setFontSize(9); doc.setTextColor(200,200,200);
    doc.text('SUBJECT MARK SHEET & ANALYSIS REPORT',PW/2,y+16,{align:'center'});
    doc.setFontSize(8);
    doc.text(S.subject+' · '+S.cls+' · '+S.examType+' · Year: '+S.meta.year,PW/2,y+21,{align:'center'});
    y+=28;
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(80,80,80);
    doc.text('Registered: '+S.students.length+'   With Marks: '+total,ML,y);
    doc.text('Generated: '+new Date().toLocaleDateString(),PW-MR,y,{align:'right'});
    if(S.teacher){y+=5;doc.text('Teacher: '+S.teacher.name+(S.teacher.email?' <'+S.teacher.email+'>':''),ML,y);}
    y+=8;

    /* ── SECTION 1 — GRADE DISTRIBUTION ─────── */
    secTitle('1. Grade Distribution');
    /*
     * Columns : Grade | A | B | C | D | F
     * Rows    : Female | Male | Total | Subject GPA
     * GPA only shown in Subject GPA row (single overall value)
     */
    var s1RH  = 7;
    /* Column widths — Grade label col + one col per grade */
    var s1LW  = 34; /* label column width */
    var s1GW  = Math.floor((UW - s1LW) / 5); /* each grade col */
    var s1Last = UW - s1LW - s1GW * 4; /* last col takes remainder */
    var s1Cols = [
      {l:'',      w:s1LW},
      {l:'A',     w:s1GW, g:'A'},
      {l:'B',     w:s1GW, g:'B'},
      {l:'C',     w:s1GW, g:'C'},
      {l:'D',     w:s1GW, g:'D'},
      {l:'F',     w:s1Last, g:'F'}
    ];
    var gradeColIdx = {A:1,B:2,C:3,D:4,F:5};

    /* Draw header row — grade letter coloured */
    doc.setFillColor(6,12,28); doc.rect(ML,y,UW,s1RH,'F');
    doc.setDrawColor(0,0,0); doc.setLineWidth(0.2); doc.rect(ML,y,UW,s1RH,'S');
    var cxh = ML;
    s1Cols.forEach(function(c,ci){
      var col = c.g ? (gradeCol[c.g]||[78,204,163]) : [78,204,163];
      doc.setFont('helvetica','bold'); doc.setFontSize(ci===0?7:9);
      doc.setTextColor(col[0],col[1],col[2]);
      doc.line(cxh+c.w,y,cxh+c.w,y+s1RH);
      if(ci===0){
        doc.text('Grade →', cxh+c.w/2, y+s1RH/2+2.5, {align:'center'});
      } else {
        doc.text(c.l, cxh+c.w/2, y+s1RH/2+2.5, {align:'center'});
      }
      cxh+=c.w;
    });
    y+=s1RH;

    /* Data rows */
    var s1Rows = [
      { label:'Female',      vals: GRD.map(function(g){return String(stats[g].F);}), bg:[240,253,250], bold:false },
      { label:'Male',        vals: GRD.map(function(g){return String(stats[g].M);}), bg:[239,246,255], bold:false },
      { label:'Total',       vals: GRD.map(function(g){return String(stats[g].F+stats[g].M);}), bg:[248,248,248], bold:true  },
      { label:'Subject GPA', vals: ['','','','',''],                                 bg:[255,251,235], bold:true, gpaRow:true }
    ];

    s1Rows.forEach(function(row){
      checkPage(s1RH+2);
      doc.setFillColor(row.bg[0],row.bg[1],row.bg[2]);
      doc.rect(ML,y,UW,s1RH,'F');
      doc.setDrawColor(0,0,0); doc.setLineWidth(0.2); doc.rect(ML,y,UW,s1RH,'S');
      var cx=ML;

      /* Label cell */
      doc.setFont('helvetica', row.bold?'bold':'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(row.gpaRow ? 180:60, row.gpaRow ? 120:60, row.gpaRow ? 0:60);
      doc.line(cx+s1LW,y,cx+s1LW,y+s1RH);
      doc.text(row.label, cx+3, y+s1RH/2+2.5);
      cx+=s1LW;

      if(row.gpaRow){
        /* Determine GPA grade from scale */
        var gpaNum   = parseFloat(gpaAll);
        var gpaGrade = '—';
        if (!isNaN(gpaNum)){
          if      (gpaNum <= 1.5) gpaGrade = 'A';
          else if (gpaNum <= 2.5) gpaGrade = 'B';
          else if (gpaNum <= 3.5) gpaGrade = 'C';
          else if (gpaNum <= 4.5) gpaGrade = 'D';
          else                    gpaGrade = 'F';
        }
        var gpaGCol = gradeCol[gpaGrade] || [180,120,0];

        /* Fill merged cell with full grade colour as background */
        var mergedW = UW - s1LW;
        doc.setFillColor(gpaGCol[0], gpaGCol[1], gpaGCol[2]);
        doc.rect(cx, y, mergedW, s1RH, 'F');

        /* Draw only the outer right border — no inner verticals (merged) */
        doc.setDrawColor(0,0,0); doc.setLineWidth(0.2);
        doc.line(cx+mergedW, y, cx+mergedW, y+s1RH);

        /* All text white for contrast */
        doc.setTextColor(255,255,255);

        /* GPA value */
        var gpaX = cx + mergedW * 0.38;
        doc.setFont('helvetica','bold'); doc.setFontSize(9);
        doc.text('GPA: '+gpaAll, gpaX, y+s1RH/2+2.5, {align:'center'});

        /* Grade badge */
        var badgeX = cx + mergedW * 0.70;
        doc.setFont('helvetica','bold'); doc.setFontSize(11);
        doc.text('Grade '+gpaGrade, badgeX, y+s1RH/2+2.5, {align:'center'});
      } else {
        GRD.forEach(function(g,gi){
          var cw   = gi===4 ? s1Last : s1GW;
          var val  = row.vals[gi];
          var gcol = gradeCol[g]||[30,30,30];
          doc.setFont('helvetica', row.bold?'bold':'normal');
          doc.setFontSize(8);
          /* Colour the value with its grade colour on Total row, plain on others */
          if(row.bold){ doc.setTextColor(gcol[0],gcol[1],gcol[2]); }
          else         { doc.setTextColor(50,50,50); }
          doc.line(cx+cw,y,cx+cw,y+s1RH);
          doc.text(val, cx+cw/2, y+s1RH/2+2.5, {align:'center'});
          cx+=cw;
        });
      }
      y+=s1RH;
    });

    y+=4;
    doc.setFont('helvetica','italic'); doc.setFontSize(7); doc.setTextColor(120,120,120);
    doc.text('GPA Scale: A=1  B=2  C=3  D=4  F=5  (Lower is better)', ML, y);
    y+=10;

    /* ── SECTION 2 — PERCENTAGES ─────────────── */
    checkPage(70);
    secTitle('2. Performance Percentages');
    var pRows=[
      ['% Pass (A–D)', pct(cntPass,total), String(cntPass)+' / '+total, cntPass/Math.max(total,1), [16,185,129]],
      ['% Fail (F)',   pct(cntFail,total), String(cntFail)+' / '+total, cntFail/Math.max(total,1), [239,68,68]],
      ['% Grade A only',pct(cntA,total),   String(cntA)+' / '+total,   cntA/Math.max(total,1),    [4,120,87]],
      ['% Grade A–B',  pct(cntAB,total),   String(cntAB)+' / '+total,  cntAB/Math.max(total,1),   [16,185,129]],
      ['% Grade A–C',  pct(cntABC,total),  String(cntABC)+' / '+total, cntABC/Math.max(total,1),  [245,158,11]],
      ['% Grade D',    pct(cntD,total),    String(cntD)+' / '+total,   cntD/Math.max(total,1),    [249,115,22]],
    ];
    var pCols=[{l:'Metric',w:55},{l:'Percentage',w:32},{l:'Count',w:38},{l:'Visual Bar',w:57}];
    var pRH=8;
    doc.setFillColor(6,12,28); doc.rect(ML,y,UW,pRH,'F');
    doc.setDrawColor(0,0,0); doc.rect(ML,y,UW,pRH,'S');
    var cxph=ML;
    pCols.forEach(function(c){
      doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(78,204,163);
      doc.line(cxph+c.w,y,cxph+c.w,y+pRH);
      doc.text(c.l,cxph+c.w/2,y+pRH/2+2.5,{align:'center'}); cxph+=c.w;
    });
    y+=pRH;
    pRows.forEach(function(r,ri){
      checkPage(pRH+2);
      if(ri%2===0){doc.setFillColor(252,252,252);}else{doc.setFillColor(248,250,252);}
      doc.rect(ML,y,UW,pRH,'F');
      doc.setDrawColor(0,0,0); doc.rect(ML,y,UW,pRH,'S');
      var cxp=ML;
      /* Metric */
      doc.setFont('helvetica','bold'); doc.setFontSize(7.5);
      doc.setTextColor(r[4][0],r[4][1],r[4][2]);
      doc.line(cxp+pCols[0].w,y,cxp+pCols[0].w,y+pRH);
      doc.text(r[0],cxp+3,y+pRH/2+2.5); cxp+=pCols[0].w;
      /* Pct */
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(30,30,30);
      doc.line(cxp+pCols[1].w,y,cxp+pCols[1].w,y+pRH);
      doc.text(r[1],cxp+pCols[1].w/2,y+pRH/2+2.5,{align:'center'}); cxp+=pCols[1].w;
      /* Count */
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(80,80,80);
      doc.line(cxp+pCols[2].w,y,cxp+pCols[2].w,y+pRH);
      doc.text(r[2],cxp+pCols[2].w/2,y+pRH/2+2.5,{align:'center'}); cxp+=pCols[2].w;
      /* Bar */
      var bw=Math.max(0,(pCols[3].w-6)*r[3]);
      doc.setFillColor(r[4][0],r[4][1],r[4][2]);
      doc.rect(cxp+3,y+2,bw,pRH-4,'F');
      doc.line(cxp+pCols[3].w,y,cxp+pCols[3].w,y+pRH);
      y+=pRH;
    });
    y+=6;

    /* ── SECTION 3 — BEST 10 ─────────────────── */
    checkPage(14+Math.min(best10.length,10)*7+4);
    secTitle('3. Top 10 Best Performing Students',16,90,50);
    var mCols=[{l:'Pos.',w:14},{l:'Cand. No.',w:28},{l:'Name',w:72},{l:'Sex',w:12},{l:'Score',w:18},{l:'Grade',w:18}];
    var mRH=7;
    function mHdr(titleColor){
      doc.setFillColor(16,90,50); doc.rect(ML,y,UW,mRH,'F');
      doc.setDrawColor(0,0,0); doc.rect(ML,y,UW,mRH,'S');
      var cx=ML;
      mCols.forEach(function(c){
        doc.setFont('helvetica','bold'); doc.setFontSize(7.5);
        doc.setTextColor(titleColor?titleColor[0]:78,titleColor?titleColor[1]:204,titleColor?titleColor[2]:163);
        doc.line(cx+c.w,y,cx+c.w,y+mRH);
        doc.text(c.l,cx+c.w/2,y+mRH/2+2.5,{align:'center'}); cx+=c.w;
      });
      y+=mRH;
    }
    function mRow(s,ri,posColor,bgEven){
      checkPage(mRH+2);
      var sc=S.marks[s.name]; var gr=calcGrade(sc); var gc=gradeCol[gr.g]||[30,30,30];
      var sidx=stuIdx[s.name]!==undefined?stuIdx[s.name]:0;
      if(ri%2===0){doc.setFillColor(bgEven?bgEven[0]:240,bgEven?bgEven[1]:253,bgEven?bgEven[2]:244);}
      else{doc.setFillColor(248,250,252);}
      doc.rect(ML,y,UW,mRH,'F');
      doc.setDrawColor(0,0,0); doc.rect(ML,y,UW,mRH,'S');
      var cells=[String(pm[s.name]||'—'),candNo(sidx),s.name,s.gender==='F'?'F':'M',String(sc),gr.g];
      var cx=ML;
      cells.forEach(function(v,ci){
        if(ci===5){doc.setFont('helvetica','bold');doc.setFontSize(8);doc.setTextColor(gc[0],gc[1],gc[2]);}
        else if(ci===0){doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(posColor[0],posColor[1],posColor[2]);}
        else{doc.setFont('helvetica',ci===4?'bold':'normal');doc.setFontSize(7.5);doc.setTextColor(30,30,30);}
        doc.line(cx+mCols[ci].w,y,cx+mCols[ci].w,y+mRH);
        var al=ci===2?'left':'center',tx=ci===2?cx+2:cx+mCols[ci].w/2;
        doc.text(v,tx,y+mRH/2+2.5,{align:al,maxWidth:mCols[ci].w-3}); cx+=mCols[ci].w;
      });
      y+=mRH;
    }
    mHdr();
    best10.forEach(function(s,ri){ mRow(s,ri,[16,90,50],[240,253,244]); });
    y+=6;

    /* ── SECTION 4 — LEAST 10 ────────────────── */
    checkPage(14+Math.min(least10.length,10)*7+4);
    secTitle('4. Bottom 10 — Needs Improvement',120,30,10);
    function mHdrRed(){
      doc.setFillColor(120,30,10); doc.rect(ML,y,UW,mRH,'F');
      doc.setDrawColor(0,0,0); doc.rect(ML,y,UW,mRH,'S');
      var cx=ML;
      mCols.forEach(function(c){
        doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(255,200,180);
        doc.line(cx+c.w,y,cx+c.w,y+mRH);
        doc.text(c.l,cx+c.w/2,y+mRH/2+2.5,{align:'center'}); cx+=c.w;
      });
      y+=mRH;
    }
    mHdrRed();
    least10.forEach(function(s,ri){ mRow(s,ri,[185,28,28],[255,245,245]); });
    y+=6;

    /* ── SECTION 5 — FULL MARK LIST (new page) ── */
    doc.addPage(); y=MT;
    doc.setFillColor(6,12,28); doc.rect(ML,y,UW,14,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(78,204,163);
    doc.text(S.schoolName.toUpperCase(),PW/2,y+6,{align:'center'});
    doc.setFontSize(7.5); doc.setTextColor(200,200,200);
    doc.text('FULL MARK LIST — '+S.subject+' · '+S.cls+' · '+S.examType+' · '+S.meta.year,PW/2,y+11,{align:'center'});
    y+=18;

    var cols=[{l:'CAND. NO.',w:30},{l:'STUDENT NAME',w:68},{l:'SEX',w:12},{l:'SCORE',w:18},{l:'GRADE',w:16},{l:'POS',w:24}];
    var RH=7;
    function pdfHeader(){
      doc.setFillColor(6,12,28); doc.rect(ML,y,UW,RH,'F');
      doc.setDrawColor(0,0,0); doc.setLineWidth(0.2); doc.rect(ML,y,UW,RH,'S');
      var cx=ML;
      cols.forEach(function(c){
        doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(78,204,163);
        doc.line(cx+c.w,y,cx+c.w,y+RH);
        doc.text(c.l,cx+c.w/2,y+RH/2+2.5,{align:'center',maxWidth:c.w-2}); cx+=c.w;
      });
      y+=RH;
    }
    function pdfRow(row,isAlt){
      if(isAlt){doc.setFillColor(248,250,252);doc.rect(ML,y,UW,RH,'F');}
      doc.setDrawColor(0,0,0); doc.setLineWidth(0.2); doc.rect(ML,y,UW,RH,'S');
      var cx=ML;
      row.forEach(function(val,ci){
        doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(30,30,30);
        doc.line(cx+cols[ci].w,y,cx+cols[ci].w,y+RH);
        var al=ci===1?'left':'center',tx=ci===1?cx+2:cx+cols[ci].w/2;
        doc.text(String(val||'').toUpperCase(),tx,y+RH/2+2.5,{align:al,maxWidth:cols[ci].w-3}); cx+=cols[ci].w;
      });
      y+=RH;
    }
    pdfHeader();
    /* Females first then males — S.students already sorted */
    var rowCount=0;
    S.students.forEach(function(s,i){
      if(S.marks[s.name]===undefined) return; /* only with marks */
      if(y+RH>PH-14){doc.addPage();y=MT;pdfHeader();}
      var sc=S.marks[s.name]; var gr=calcGrade(sc);
      pdfRow([candNo(i),s.name,s.gender==='F'?'F':'M',sc,gr.g,pm[s.name]||'—'],rowCount%2===1);
      rowCount++;
    });

    /* ── FOOTER ALL PAGES ───────────────────── */
    var nPages=doc.internal.getNumberOfPages();
    for(var pg=1;pg<=nPages;pg++){
      doc.setPage(pg);
      doc.setFont('helvetica','italic'); doc.setFontSize(7); doc.setTextColor(150,150,150);
      doc.text('AcademixPoint School Management · www.academixpoint.com',PW/2,PH-8,{align:'center'});
      doc.text('Page '+pg+' of '+nPages,PW-MR,PH-8,{align:'right'});
    }

    doc.save('MarkSheet_'+S.cls+'_'+S.subject+'_'+S.examType+'.pdf');
  };
  /* ============================================= */
  window.axpExportCSV = function() {
    var ranked = S.students.filter(function(s){ return S.marks[s.name]!==undefined; })
      .slice().sort(function(a,b){ return S.marks[b.name]-S.marks[a.name]; });
    var pm={}, p=0, ls=null, lp=0;
    ranked.forEach(function(s){ var sc=S.marks[s.name]; if(sc!==ls){p=lp+1;ls=sc;lp=p;} pm[s.name]=p; });
    var lines = ['"Cand. No.","Name","Gender","Score","Grade","Position"'];
    S.students.forEach(function(s,i){
      var sc=S.marks[s.name]; var gr=calcGrade(sc);
      lines.push('"'+candNo(i)+'","'+s.name+'",'+(s.gender==='F'?'"F"':'"M"')+','+
        (sc!==undefined?sc:'')+','+gr.g+','+(pm[s.name]||''));
    });
    var a=document.createElement('a');
    a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(lines.join('\n'));
    a.download='Marks_'+S.cls+'_'+S.subject+'_'+S.examType+'.csv';
    a.click();
  };

  window.axpReenter  = function(){ S.idx=0; hideEl('axpDone'); showEl('axpEntry'); renderCard(); };
  window.axpStartNew = function(){
    S.examType=''; S.cls=''; S.subject=''; S.students=[]; S.marks={}; S.submitted=false;
    hideEl('axpDone'); hideEl('axpEntry'); hideEl('axpLW');
    buildExamChips(); clearCache();
  };

  /* ══════════════════════════════════════════════
     LOCAL STORAGE PERSISTENCE
  /* ============================================= */
  function cKey(){ return 'axpT_' + S.digits + '_' + (S.schoolId||''); }

  function saveCache(){
    try {
      localStorage.setItem(cKey(), JSON.stringify({
        examType:S.examType, cls:S.cls, subject:S.subject,
        marks:S.marks, idx:S.idx, savedAt:new Date().toISOString()
      }));
    } catch(ex){}
  }
  function clearCache(){ try{ localStorage.removeItem(cKey()); }catch(ex){} }

  function checkRestore(){
    try{
      var raw = localStorage.getItem(cKey());
      if (!raw) return;
      var d = JSON.parse(raw);
      if (!d.examType || !d.cls || !d.subject) return;
      g('axpRI').textContent = d.examType + ' · ' + d.cls + ' · ' + d.subject +
        ' — saved ' + new Date(d.savedAt).toLocaleString();
      g('axpRB').style.display = 'block';
      window._axpPR = d;
    } catch(ex){}
  }

  window.axpRestoreSession = function(){
    var d = window._axpPR; if (!d) return;
    g('axpRB').style.display = 'none';
    S.examType = d.examType; S.cls = d.cls; S.subject = d.subject; S.marks = d.marks || {};
    buildExamChips();   hlChip('axpEC', d.examType);
    buildClassChips();  hlChip('axpCC', d.cls);
    buildSubjectChips(); hlChip('axpSC', d.subject);
    showEl('axpLW');
    axpLoadRoster().then(function(){
      S.idx = Math.min(d.idx || 0, S.students.length - 1);
      renderCard();
      axpToast('Session restored ✓', 'success');
    });
  };
  window.axpDismissRestore = function(){ g('axpRB').style.display='none'; clearCache(); };
  window.axpClearCache = function(){
    axpConfirm('Clear Cache', 'Delete all locally saved session data?', function(){
      try{
        Object.keys(localStorage)
          .filter(function(k){ return k.startsWith('axpT_'); })
          .forEach(function(k){ localStorage.removeItem(k); });
      } catch(ex){}
      axpToast('Cache cleared.', 'success');
      g('axpRB').style.display = 'none';
    }, 'Clear', 'background:#ef4444;border-color:#fca5a5;color:#fff;');
  };

  /* ══════════════════════════════════════════════
     HELPERS
  /* ============================================= */
  function calcGrade(v){
    if (v===undefined||v===null||v==='') return {g:'—',c:'#94a3b8'};
    var n=parseInt(v); if(isNaN(n)) return {g:'—',c:'#94a3b8'};
    if(n>=75) return {g:'A',c:'#10b981'};
    if(n>=65) return {g:'B',c:'#4ecca3'};
    if(n>=45) return {g:'C',c:'#f59e0b'};
    if(n>=30) return {g:'D',c:'#f97316'};
    return {g:'F',c:'#ef4444'};
  }
  function candNo(i){ return S.digits + '-' + String(i+1).padStart(4,'0'); }
  function sortStu(arr){
    return arr.slice().sort(function(a,b){
      var af=(a.gender||'').toUpperCase()==='F'?0:1;
      var bf=(b.gender||'').toUpperCase()==='F'?0:1;
      if(af!==bf) return af-bf;
      return String(a.name).toUpperCase().localeCompare(String(b.name).toUpperCase());
    });
  }
  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function g(id){ return document.getElementById(id); }
  function show(id){ g(id).style.display='block'; }
  function hide(id){ g(id).style.display='none'; }
  function showEl(id){ var el=g(id); if(el) el.classList.remove('axpH'); }
  function hideEl(id){ var el=g(id); if(el) el.classList.add('axpH'); }
  function hlChip(cid, val){
    var c = g(cid); if(!c) return;
    Array.from(c.querySelectorAll('.axpChip')).forEach(function(b){
      if (b.textContent.trim() === val.trim()) b.classList.add('on');
    });
  }
  function showErr(msg){ hide('axpLd'); showEl('axpErr'); g('axpEM').textContent=msg; }

  /* ══════════════════════════════════════════════
     MODAL
  /* ============================================= */
  var _icons = {
    info   :'<i class="bi bi-info-circle-fill" style="color:#3b82f6"></i>',
    success:'<i class="bi bi-check-circle-fill" style="color:#10b981"></i>',
    warning:'<i class="bi bi-exclamation-triangle-fill" style="color:#f59e0b"></i>',
    danger :'<i class="bi bi-x-octagon-fill" style="color:#ef4444"></i>'
  };
  function _modal(title, body, buttons, type){
    g('axpMIcon').innerHTML  = _icons[type] || _icons.info;
    g('axpMTitle').textContent = title;
    g('axpMBd').innerHTML    = body;
    g('axpMFt').innerHTML    = buttons.map(function(b){
      return '<button onclick="'+b.a+'" class="axpBtn axpSm" style="'+b.s+'">'+b.l+'</button>';
    }).join('');
    g('axpMod').classList.add('open');
  }
  window.axpMClose = function(){ g('axpMod').classList.remove('open'); _axpCB=null; };
  function axpAlert(title, body, type){
    _modal(title, body, [{
      l:'OK', a:'axpMClose()',
      s:'background:#060c1c;color:#4ecca3;border:1.5px solid #4ecca3;'
    }], type||'info');
  }
  function axpConfirm(title, body, onYes, yesLbl, yesStyle){
    window._axpCB = onYes;
    _modal(title, body, [
      { l:'Cancel',         a:'axpMClose()', s:'background:#f8fafc;color:#64748b;border:1.5px solid #e2e8f0;' },
      { l:yesLbl||'Confirm',a:'axpMClose();if(window._axpCB){window._axpCB();window._axpCB=null;}',
        s:yesStyle||'background:#060c1c;color:#4ecca3;border:1.5px solid #4ecca3;' }
    ], 'warning');
  }
  function axpToast(msg, type){
    var colors={success:'#10b981',danger:'#ef4444',warning:'#f59e0b',info:'#3b82f6'};
    var el=g('axpToast'); el.style.background=colors[type]||colors.info;
    el.textContent=msg; el.style.display='block';
    clearTimeout(window._axpTT);
    window._axpTT=setTimeout(function(){ el.style.display='none'; }, 3000);
  }

})();
