(function () {
  'use strict';

  var AXP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxpBnECD3NgUmfg6sVNB0eMfEVZiRPcbxu5bapVA10K1_L8pJC1F-j00WM5hM4_5mTZ/exec';

  /* ── URL GUARD ───────────────────────────────────────────────────────────── */
  var _href  = window.location.href;
  var _match = _href.match(/\/p\/s(\d{3,})-teachers-feeding-area\.html/i);
  if (!_match) return;
  var _DIGITS = _match[1];

  /* ══════════════════════════════════════════════════════════════════════════
     STATE
  ══════════════════════════════════════════════════════════════════════════ */
  var S = {
    digits     : _DIGITS,
    schoolId   : null,
    schoolName : '',
    schoolIndex: '',          // raw index from SCHOOLS sheet (col 6)
    meta       : null,        // schoolMeta_{schoolId}
    year       : '',
    // wizard selections
    cls        : '',
    examType   : '',
    teacher    : null,        // { id, name, email, phone, assignments }
    // marks entry
    students   : [],          // [ { name, gender } ] sorted F then M a→z
    marks      : {},          // { studentName: score }
    idx        : 0,
    submitted  : false,
    // bulk data loaded once
    allTeachers: [],          // full teacher list from listTeachers
    feedData   : null         // result from feedingRoster bulk
  };

  /* ══════════════════════════════════════════════════════════════════════════
     AGGRESSIVE EARLY KILL (keep Blogger scripts from hijacking DOM)
  ══════════════════════════════════════════════════════════════════════════ */
  var _ael  = document.addEventListener.bind(document);
  var _wael = window.addEventListener.bind(window);
  var _dw   = document.write ? document.write.bind(document) : function(){};

  document.addEventListener = function(type, fn, opts) {
    if (type === 'DOMContentLoaded' || type === 'load' || type === 'readystatechange') return;
    _ael(type, fn, opts);
  };
  window.addEventListener = function(type, fn, opts) {
    if (type === 'DOMContentLoaded' || type === 'load') return;
    _wael(type, fn, opts);
  };
  document.write    = function(){};
  document.writeln  = function(){};

  function boot() {
    document.addEventListener = _ael;
    window.addEventListener   = _wael;
    document.write            = _dw;
    wipePage();
    injectStyles();
    injectBootstrapIcons();
    buildShell();
    axpInit();
  }

  if (document.readyState === 'loading') { _ael('DOMContentLoaded', boot); }
  else { setTimeout(boot, 0); }

  /* ══════════════════════════════════════════════════════════════════════════
     WIPE PAGE
  ══════════════════════════════════════════════════════════════════════════ */
  function wipePage() {
    Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .forEach(function(el){ el.parentNode.removeChild(el); });

    var _whitelist = ['axp-teacher-marks','teachersfeedingarea','jspdf','bootstrap-icons'];
    function _isOwn(src){ return _whitelist.some(function(w){ return src.indexOf(w) > -1; }); }
    Array.from(document.querySelectorAll('script[src]')).forEach(function(el){
      if (_isOwn(el.src)) return;
      try { el.onload = null; el.onerror = null; } catch(ex){}
    });

    document.body.innerHTML    = '';
    document.body.style.cssText = '';
    document.documentElement.style.cssText = '';
    document.title = 'AcademixPoint — Teacher Marks Entry';

    if (!document.querySelector('meta[name="viewport"]')) {
      var vm = document.createElement('meta');
      vm.name    = 'viewport';
      vm.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(vm);
    }

    window.onerror = function(msg, src) {
      if (!src) return true;
      if (_isOwn(src)) return false;
      return true;
    };
    window.onunhandledrejection = function(e){ e.preventDefault(); };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     STYLES
  ══════════════════════════════════════════════════════════════════════════ */
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
      /* Header */
      '#axpHdr { background:linear-gradient(135deg,#060c1c,#0f2248); color:#fff;',
        'padding:14px 20px; display:flex; align-items:center; gap:12px;',
        'border-bottom:2px solid #4ecca3; position:sticky; top:0; z-index:100; }',
      '#axpHdr .logo { font-size:18px; font-weight:900; color:#4ecca3; letter-spacing:1px; }',
      '#axpHdr .sname { font-size:13px; font-weight:600; opacity:.85; flex:1; }',
      /* Wrap */
      '.axpW { max-width:800px; margin:0 auto; padding:20px 14px 60px; }',
      /* Card */
      '.axpCard { background:var(--card); border:1px solid var(--border); border-radius:var(--r);',
        'padding:20px; margin-bottom:16px; box-shadow:0 2px 8px rgba(6,12,28,.06); }',
      '.axpCT { font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:.6px;',
        'color:var(--ink); margin-bottom:14px; display:flex; align-items:center; gap:8px; }',
      '.axpCT i { color:var(--teal); font-size:16px; }',
      /* Chips */
      '.axpChips { display:flex; flex-wrap:wrap; gap:7px; }',
      '.axpChip { padding:7px 14px; border:1.5px solid var(--border); background:#fff;',
        'color:var(--slate); font-size:12.5px; font-weight:600; cursor:pointer;',
        'border-radius:var(--r); transition:all .15s; user-select:none; }',
      '.axpChip:hover { border-color:var(--teal); color:var(--ink); }',
      '.axpChip.on { background:var(--ink); border-color:var(--teal); color:var(--teal); }',
      /* Buttons */
      '.axpBtn { display:inline-flex; align-items:center; gap:7px; padding:10px 20px;',
        'font-size:13px; font-weight:700; border:none; border-radius:var(--r);',
        'cursor:pointer; transition:all .15s; }',
      '.axpBP { background:linear-gradient(135deg,var(--ink),#0f2248); color:var(--teal); border:1.5px solid var(--teal); }',
      '.axpBP:hover { background:var(--teal); color:var(--ink); }',
      '.axpBP:disabled { opacity:.5; cursor:not-allowed; }',
      '.axpBG { background:#f8fafc; color:var(--slate); border:1.5px solid var(--border); }',
      '.axpBG:hover { background:var(--border); }',
      '.axpSm { padding:6px 12px; font-size:12px; }',
      /* Student banner */
      '.axpSBnr { background:linear-gradient(135deg,var(--ink),#0f2248); color:#fff;',
        'padding:18px 20px; border-radius:var(--r); margin-bottom:16px;',
        'display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }',
      '.sName { font-size:18px; font-weight:900; color:var(--teal); }',
      '.sMeta { font-size:12px; opacity:.7; margin-top:3px; }',
      '.sCand { font-size:12px; font-family:monospace; background:rgba(78,204,163,.15);',
        'color:var(--teal); padding:4px 10px; border-radius:20px; font-weight:700; }',
      /* Score */
      '.axpSW { text-align:center; padding:20px 0 10px; }',
      '.axpSI { width:140px; height:70px; font-size:36px; font-weight:900; text-align:center;',
        'border:3px solid var(--border); border-radius:var(--r); color:var(--ink); outline:none;',
        'transition:border-color .2s; }',
      '.axpSI:focus { border-color:var(--teal); }',
      '.axpSI.gA{border-color:#10b981;} .axpSI.gB{border-color:#4ecca3;}',
      '.axpSI.gC{border-color:#f59e0b;} .axpSI.gD{border-color:#f97316;} .axpSI.gF{border-color:#ef4444;}',
      '.axpGB { display:inline-block; font-size:28px; font-weight:900; margin-top:6px; min-width:48px; }',
      /* Progress */
      '.axpPB { background:var(--border); height:6px; border-radius:3px; overflow:hidden; margin:8px 0; }',
      '.axpPF { height:100%; background:linear-gradient(90deg,var(--teal),var(--teal2));',
        'border-radius:3px; transition:width .4s ease; }',
      /* Nav */
      '.axpNav { display:flex; gap:10px; justify-content:space-between; flex-wrap:wrap; margin-top:14px; }',
      /* Table */
      '.axpTbl { width:100%; border-collapse:collapse; font-size:13px; }',
      '.axpTbl th, .axpTbl td { border:1px solid #000; padding:7px 10px; }',
      '.axpTbl thead tr { background:var(--ink); color:var(--teal); }',
      '.axpTbl tbody tr:nth-child(even) { background:#f8fafc; }',
      /* Grade grid */
      '.axpGG { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; margin-bottom:16px; }',
      '.axpGC { text-align:center; padding:10px 4px; border-radius:var(--r); background:#f8fafc; }',
      '.axpGC .gv { font-size:22px; font-weight:900; }',
      '.axpGC .gl { font-size:10px; font-weight:700; margin-top:2px; }',
      /* Spinner */
      '.axpSpin { display:inline-block; width:18px; height:18px;',
        'border:2.5px solid rgba(78,204,163,.3); border-top-color:var(--teal);',
        'border-radius:50%; animation:axpSpin .6s linear infinite; vertical-align:middle; }',
      '@keyframes axpSpin { to { transform:rotate(360deg); } }',
      /* Toolbar */
      '.axpTBar { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }',
      /* Teacher banner */
      '.axpTchr { background:#f0fdf9; border:1px solid #6ee7b7; padding:10px 14px;',
        'border-radius:var(--r); font-size:12.5px; color:#065f46; margin-bottom:12px;',
        'display:flex; align-items:center; gap:10px; }',
      /* Restore banner */
      '#axpRB { display:none; background:#fffbeb; border:1.5px solid var(--amber);',
        'padding:14px 18px; border-radius:var(--r); margin-bottom:16px; }',
      /* Loading */
      '#axpLd { text-align:center; padding:60px 20px; }',
      '#axpLd .ls { width:40px; height:40px; border:4px solid rgba(78,204,163,.2);',
        'border-top-color:var(--teal); border-radius:50%;',
        'animation:axpSpin .7s linear infinite; margin:0 auto 16px; }',
      /* Modal */
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
      /* Toast */
      '#axpToast { position:fixed; bottom:24px; right:20px; z-index:2147483647;',
        'padding:11px 20px; font-size:13px; font-weight:700; color:#fff;',
        'border-radius:var(--r); box-shadow:0 8px 28px rgba(0,0,0,.25);',
        'display:none; animation:axpPop .2s ease; }',
      /* Info row */
      '.axpInfo { background:#f8fafc; border:1px solid var(--border); border-radius:var(--r);',
        'padding:10px 14px; font-size:12px; color:var(--slate); margin-bottom:12px; }',
      '.axpInfo strong { color:var(--ink); }',
      /* Utility */
      '.axpH { display:none !important; }',
      /* Responsive */
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

  /* ══════════════════════════════════════════════════════════════════════════
     BUILD SHELL
  ══════════════════════════════════════════════════════════════════════════ */
  function buildShell() {
    document.body.innerHTML = [
      /* Header */
      '<div id="axpHdr">',
        '<div>',
          '<div class="logo">AcademixPoint</div>',
          '<div class="sname" id="axpSN">Loading…</div>',
        '</div>',
        '<div style="margin-left:auto;display:flex;gap:8px;align-items:center;">',
          mkBtn('bi-trash3','Clear Cache','axpClearCache()','axpBG axpSm'),
        '</div>',
      '</div>',

      '<div class="axpW">',

        /* Loading */
        '<div id="axpLd"><div class="ls"></div>',
          '<div style="font-size:14px;color:var(--slate);">Verifying school code…</div>',
        '</div>',

        /* Error */
        '<div id="axpErr" class="axpH" style="background:#fff1f2;border-left:4px solid var(--red);',
          'padding:14px 18px;border-radius:var(--r);color:#991b1b;font-size:13px;">',
          '<strong>Error: </strong><span id="axpEM"></span>',
        '</div>',

        /* ── MAIN WIZARD ─────────────────────────────────────────────────── */
        '<div id="axpMain" class="axpH">',

          /* Restore banner */
          '<div id="axpRB">',
            '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">',
              '<i class="bi bi-cloud-arrow-down" style="font-size:20px;color:var(--amber);"></i>',
              '<div style="flex:1;">',
                '<div style="font-weight:700;font-size:13px;">Unsaved session found</div>',
                '<div style="font-size:12px;opacity:.8;" id="axpRI"></div>',
              '</div>',
              mkBtn('bi-arrow-counterclockwise','Restore','axpRestoreSession()','axpBP axpSm'),
              mkBtn('','Dismiss','axpDismissRestore()','axpBG axpSm'),
            '</div>',
          '</div>',

          /* School info bar */
          '<div class="axpInfo" id="axpSchoolBar" style="display:none;">',
            '<strong id="axpSchoolName2"></strong>',
            ' &nbsp;·&nbsp; Index: <strong id="axpSchoolIdx"></strong>',
            ' &nbsp;·&nbsp; Year: <strong id="axpSchoolYear"></strong>',
          '</div>',

          /* Step 1 — Class */
          mkCard('bi-people','Step 1 — Select Class','<div class="axpChips" id="axpCC"></div>'),

          /* Step 2 — Exam Type */
          '<div id="axpS2" class="axpH">'+mkCard('bi-journal-bookmark','Step 2 — Select Exam Type','<div class="axpChips" id="axpEC"></div>')+'</div>',

          /* Step 3 — Teacher */
          '<div id="axpS3" class="axpH">'+mkCard('bi-person-badge','Step 3 — Select Your Name','<div class="axpChips" id="axpTC"></div><div id="axpNoTeacher" style="font-size:12px;color:var(--slate);display:none;margin-top:8px;">No teachers assigned to this class. You may proceed anyway.</div>','<div style="margin-top:12px;" id="axpS3Proceed" style="display:none;">'+mkBtn('bi-arrow-right','Proceed without teacher','axpProceedNoTeacher()','axpBG axpSm')+'</div>')+'</div>',

          /* Step 4 — Subject (only when teacher selected) */
          '<div id="axpS4" class="axpH">'+mkCard('bi-book','Step 4 — Select Subject','<div class="axpChips" id="axpSubC"></div>')+'</div>',

          /* Load button */
          '<div id="axpLW" class="axpH" style="text-align:center;margin-bottom:16px;">',
            mkBtn('bi-cloud-download','Load Students','axpLoadStudents()','axpBP','id="axpLB"'),
          '</div>',

          /* ── ENTRY PANEL ────────────────────────────────────────────── */
          '<div id="axpEntry" class="axpH">',

            /* Teacher banner */
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
              '<div><div class="sName" id="axpSN2">—</div><div class="sMeta" id="axpSMeta"></div></div>',
              '<div style="text-align:right;">',
                '<div class="sCand" id="axpSCand"></div>',
                '<div style="font-size:11px;opacity:.6;margin-top:4px;" id="axpSPos"></div>',
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
              mkBtn('bi-chevron-left','Prev','axpPrev()','axpBG'),
              mkBtn('bi-skip-forward','Skip','axpSkip()','axpBG'),
              mkBtn2('Next','bi-chevron-right','axpNext()','axpBP'),
            '</div>',

            /* Submit */
            '<div style="margin-top:16px;text-align:center;">',
              '<button class="axpBtn axpBP" id="axpSubBtn" onclick="axpSubmitAll()"',
                ' style="background:linear-gradient(135deg,#065f46,#10b981);border-color:#6ee7b7;padding:12px 32px;">',
                '<i class="bi bi-send-fill"></i> Submit All Marks',
              '</button>',
            '</div>',

          '</div>',/* /axpEntry */

          /* ── DONE / SUMMARY ─────────────────────────────────────────── */
          '<div id="axpDone" class="axpH">',
            '<div class="axpCard">',
              '<div class="axpCT"><i class="bi bi-check2-all"></i> Marks Submitted</div>',
              '<div class="axpGG" id="axpGGrid"></div>',
              '<div class="axpTBar">',
                mkBtn('bi-file-pdf','Export PDF','axpExportPDF()','axpBP axpSm'),
                mkBtn('bi-pencil','Re-enter','axpReenter()','axpBG axpSm'),
                mkBtn('bi-download','CSV','axpExportCSV()','axpBG axpSm'),
                '<button class="axpBtn axpBP axpSm" onclick="axpStartNew()" style="margin-left:auto;">',
                  '<i class="bi bi-plus-circle"></i> New Entry',
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
          '</div>',/* /axpDone */

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

  function mkBtn(icon, label, onclick, cls, extra) {
    var ic = icon ? '<i class="bi ' + icon + '"></i> ' : '';
    return '<button class="axpBtn ' + (cls||'') + '" onclick="' + onclick + '" ' + (extra||'') + '>' + ic + label + '</button>';
  }
  function mkBtn2(label, icon, onclick, cls) {
    return '<button class="axpBtn ' + (cls||'') + '" onclick="' + onclick + '">' + label + ' <i class="bi ' + icon + '"></i></button>';
  }
  function mkCard(icon, title, body, extra) {
    return '<div class="axpCard"><div class="axpCT"><i class="bi ' + icon + '"></i> ' + title + '</div>' + body + (extra||'') + '</div>';
  }

  /* ══════════════════════════════════════════════════════════════════════════
     API HELPERS
  ══════════════════════════════════════════════════════════════════════════ */
  async function apiGet(p) {
    var url = new URL(AXP_SCRIPT_URL);
    Object.keys(p).forEach(function(k){ url.searchParams.append(k, p[k]); });
    return (await fetch(url.toString())).json();
  }
  async function apiPost(p) {
    var f = new FormData();
    Object.keys(p).forEach(function(k){ f.append(k, p[k]); });
    return (await fetch(AXP_SCRIPT_URL, { method:'POST', body:f })).json();
  }

  /* ══════════════════════════════════════════════════════════════════════════
     INIT — verify school index code then load all data
  ══════════════════════════════════════════════════════════════════════════ */
  async function axpInit() {
    try {
      /* ── STEP A: verify school index code against SCHOOLS sheet (col 6) ──
         getSchoolByIndex strips non-digits from the stored SCHOOL_INDEX column
         and compares against the URL digits — this IS the registration check.
         It also requires the school to exist in schoolIndex + have schoolMeta_.
         We additionally check account status so suspended/pending schools
         cannot access the marks entry page at all.                           */
      g('axpLd').querySelector('div:last-child').textContent = 'Verifying school code…';

      var res = await apiGet({ mode: 'schoolByIndex', schoolIndex: S.digits });

      /* Code not found in SCHOOLS sheet or not yet set up */
      if (res.status !== 'success') {
        throw new Error(
          'School code <strong>' + esc(S.digits) + '</strong> not recognised. ' +
          (res.message ? res.message : 'Please check the URL or contact your administrator.')
        );
      }

      /* ── STEP B: check account status ────────────────────────────────────
         getSchoolByIndex returns accountStatus from the SCHOOLS sheet.
         Only ACTIVE accounts may use this page.                              */
      var acctStatus = String(res.accountStatus || 'UNKNOWN').toUpperCase();
      if (acctStatus !== 'ACTIVE') {
        var statusMsg = {
          'PENDING'         : 'This school account is <strong>pending activation</strong>. Please complete the activation payment.',
          'INACTIVE'        : 'This school account is <strong>inactive</strong>. Contact your administrator.',
          'SUSPENDED'       : 'This school account has been <strong>suspended</strong>. Contact AcademixPoint support.',
          'DORMANT'         : 'This school account is <strong>dormant</strong>. Contact your administrator.',
          'WARNING'         : 'This school account has an <strong>active warning</strong>. Contact your administrator.',
          'AWAITING_DELETE' : 'This school account is <strong>scheduled for deletion</strong>. Contact support.',
          'UNKNOWN'         : 'Account status could not be verified. Contact your administrator.'
        }[acctStatus] || 'Account status <strong>' + esc(acctStatus) + '</strong> does not permit access.';

        showStatusBlock(acctStatus, statusMsg);
        return;
      }

      /* ── STEP C: store verified school data ──────────────────────────── */
      S.schoolId   = res.schoolId;
      S.schoolName = res.schoolName;
      S.meta       = res.meta;
      S.year       = S.meta.year;

      g('axpSN').textContent          = S.schoolName;
      g('axpSchoolName2').textContent  = S.schoolName;
      g('axpSchoolIdx').textContent    = S.digits;
      g('axpSchoolYear').textContent   = S.year;
      g('axpSchoolBar').style.display  = 'block';
      document.title = 'Marks Entry — ' + S.schoolName;

      /* ── STEP D: load teachers ─────────────────────────────────────────── */
      g('axpLd').querySelector('div:last-child').textContent = 'Loading teachers…';
      var tRes = await apiGet({ mode: 'teachers', schoolId: S.schoolId, year: S.year });
      S.allTeachers = (tRes.status === 'success' && tRes.teachers) ? tRes.teachers : [];

      /* ── STEP E: load feeding roster (bulk) ──────────────────────────── */
      g('axpLd').querySelector('div:last-child').textContent = 'Loading student roster…';
      var fRes = await apiGet({ mode: 'feedingRoster', schoolId: S.schoolId, year: S.year });
      S.feedData = (fRes.status === 'success') ? fRes : null;

      hideEl('axpLd');
      showEl('axpMain');
      buildClassChips();
      checkRestore();

    } catch(ex) { showErr(ex.message); }
  }

  /* Show a status-specific block instead of generic error */
  function showStatusBlock(status, htmlMsg) {
    hideEl('axpLd');
    var icons = {
      PENDING        : 'bi-hourglass-split',
      INACTIVE       : 'bi-x-circle',
      SUSPENDED      : 'bi-slash-circle',
      DORMANT        : 'bi-moon-stars',
      WARNING        : 'bi-exclamation-triangle',
      AWAITING_DELETE: 'bi-trash3',
      UNKNOWN        : 'bi-question-circle'
    };
    var colors = {
      PENDING        : '#f59e0b',
      INACTIVE       : '#ef4444',
      SUSPENDED      : '#ef4444',
      DORMANT        : '#64748b',
      WARNING        : '#f97316',
      AWAITING_DELETE: '#ef4444',
      UNKNOWN        : '#64748b'
    };
    var icon  = icons[status]  || 'bi-x-circle';
    var color = colors[status] || '#ef4444';
    var el = g('axpErr');
    el.style.background   = '#fff';
    el.style.border       = '1.5px solid ' + color;
    el.style.borderLeft   = '5px solid ' + color;
    el.style.padding      = '24px 20px';
    el.style.textAlign    = 'center';
    el.style.color        = '#060c1c';
    el.innerHTML =
      '<i class="bi ' + icon + '" style="font-size:40px;color:' + color + ';display:block;margin-bottom:12px;"></i>' +
      '<div style="font-size:15px;font-weight:700;margin-bottom:8px;">Access Denied</div>' +
      '<div style="font-size:13px;line-height:1.7;">' + htmlMsg + '</div>' +
      '<div style="margin-top:16px;font-size:12px;color:#64748b;">School Code: <strong>' + esc(S.digits) + '</strong> &nbsp;·&nbsp; Support: <strong>+255677819173</strong></div>';
    showEl('axpErr');
  }

  /* ══════════════════════════════════════════════════════════════════════════
     WIZARD — STEP 1: CLASS
  ══════════════════════════════════════════════════════════════════════════ */
  function buildClassChips() {
    var classes = (S.meta && S.meta.classes) ? S.meta.classes : [];
    fillChips('axpCC', classes, function(cls) {
      S.cls      = cls;
      S.examType = '';
      S.teacher  = null;
      hideEl('axpS2'); hideEl('axpS3'); hideEl('axpS4'); hideEl('axpLW');
      buildExamChips();
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     WIZARD — STEP 2: EXAM TYPE
  ══════════════════════════════════════════════════════════════════════════ */
  function buildExamChips() {
    var exams = (S.meta && S.meta.examTypes) ? S.meta.examTypes : [];
    fillChips('axpEC', exams, function(et) {
      S.examType = et;
      S.teacher  = null;
      hideEl('axpS3'); hideEl('axpS4'); hideEl('axpLW');
      buildTeacherChips();
    });
    showEl('axpS2');
  }

  /* ══════════════════════════════════════════════════════════════════════════
     WIZARD — STEP 3: TEACHER (filtered by class)
  ══════════════════════════════════════════════════════════════════════════ */
  function buildTeacherChips() {
    /* Find teachers assigned to the selected class */
    var classTeachers = S.allTeachers.filter(function(t) {
      return (t.assignments || []).some(function(a) {
        return String(a.class || '').trim().toUpperCase() === S.cls.toUpperCase();
      });
    });

    var tc = g('axpTC');
    var nt = g('axpNoTeacher');
    var sp = g('axpS3Proceed');
    tc.innerHTML = '';
    nt.style.display = 'none';
    if (sp) sp.style.display = 'none';

    if (!classTeachers.length) {
      nt.style.display = 'block';
      if (sp) sp.style.display = 'block';
    } else {
      /* Build chips — label = name + subject list for this class */
      classTeachers.forEach(function(t) {
        var mySubjects = (t.assignments || [])
          .filter(function(a){ return String(a.class||'').trim().toUpperCase() === S.cls.toUpperCase(); })
          .map(function(a){ return a.subject; });

        var b = document.createElement('button');
        b.className = 'axpChip';
        b.innerHTML = '<strong>' + esc(t.name) + '</strong>' +
          (mySubjects.length ? ' <span style="font-weight:400;font-size:11px;opacity:.7;">(' + mySubjects.join(', ') + ')</span>' : '');
        b.onclick = function() {
          Array.from(tc.querySelectorAll('.axpChip')).forEach(function(x){ x.classList.remove('on'); });
          b.classList.add('on');
          S.teacher = t;
          hideEl('axpS4'); hideEl('axpLW');
          buildSubjectChips();
        };
        tc.appendChild(b);
      });
    }

    showEl('axpS3');
    hideEl('axpS4');
    hideEl('axpLW');
  }

  /* Allow proceeding without a teacher */
  window.axpProceedNoTeacher = function() {
    S.teacher = null;
    buildSubjectChips();
  };

  /* ══════════════════════════════════════════════════════════════════════════
     WIZARD — STEP 4: SUBJECT
     Subjects come from meta.subjects[cls] — same as registration
  ══════════════════════════════════════════════════════════════════════════ */
  function buildSubjectChips() {
    /* If a teacher is selected, filter to only their subjects for this class */
    var allSubs = (S.meta.subjects && S.meta.subjects[S.cls]) ? S.meta.subjects[S.cls] : [];

    var subs = allSubs;
    if (S.teacher) {
      var teacherSubs = (S.teacher.assignments || [])
        .filter(function(a){ return String(a.class||'').trim().toUpperCase() === S.cls.toUpperCase(); })
        .map(function(a){ return String(a.subject||'').trim().toUpperCase(); });

      if (teacherSubs.length) {
        subs = allSubs.filter(function(s){
          return teacherSubs.indexOf(String(s).trim().toUpperCase()) > -1;
        });
        /* Fallback: if filter yields nothing (mismatch), show all */
        if (!subs.length) subs = allSubs;
      }
    }

    var sc = g('axpSubC');
    sc.innerHTML = '';

    if (!subs.length) {
      sc.innerHTML = '<div style="font-size:12px;color:var(--slate);">No subjects found for ' + esc(S.cls) + '.</div>';
      showEl('axpS4');
      return;
    }

    fillChips('axpSubC', subs, function(sub) {
      S.subject = sub;
      showEl('axpLW');
    });

    showEl('axpS4');
    hideEl('axpLW');
  }

  /* ══════════════════════════════════════════════════════════════════════════
     fillChips — generic chip builder
  ══════════════════════════════════════════════════════════════════════════ */
  function fillChips(containerId, items, onSelect) {
    var c = g(containerId);
    c.innerHTML = '';
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

  /* ══════════════════════════════════════════════════════════════════════════
     LOAD STUDENTS
     Uses feedingRoster (per-subject mode) to get enrolled students.
     Falls back to examRoster if needed.
  ══════════════════════════════════════════════════════════════════════════ */
  window.axpLoadStudents = async function() {
    var lb = g('axpLB');
    lb.disabled = true;
    lb.innerHTML = '<span class="axpSpin"></span> Loading…';

    try {
      /* Use feedingRoster per-subject — returns enrolled students + teacher */
      var res = await apiGet({
        mode     : 'feedingRoster',
        schoolId : S.schoolId,
        year     : S.year,
        examType : S.examType,
        'class'  : S.cls,
        subject  : S.subject
      });

      var students = [];

      if (res.status === 'success' && res.students && res.students.length) {
        /* feedingRoster returns { name, gender } objects already sorted F→M a→z */
        students = res.students;
      } else {
        /* Fallback: use examRoster (all students in exam sheet) */
        var er = await apiGet({
          mode     : 'examRoster',
          schoolId : S.schoolId,
          year     : S.year,
          examType : S.examType,
          'class'  : S.cls
        });
        if (er.status === 'success' && er.roster && er.roster.length) {
          students = er.roster; /* [ { name, gender } ] */
        }
      }

      if (!students.length) {
        axpAlert('No Students',
          'No students found for <strong>' + esc(S.subject) + '</strong> — <strong>' + esc(S.cls) + '</strong>.<br><br>' +
          'Check registration sheet subject enrollment.', 'warning');
        return;
      }

      /* Sort: females a→z first, then males a→z */
      students = sortStu(students);

      S.students  = students;
      S.marks     = {};
      S.idx       = 0;
      S.submitted = false;

      /* Teacher banner */
      if (S.teacher) {
        showEl('axpTchrBnr');
        g('axpTI').innerHTML = '<strong>' + esc(S.teacher.name) + '</strong>' +
          (S.teacher.email ? ' &nbsp;·&nbsp; ' + esc(S.teacher.email) : '') +
          ' <span style="opacity:.6;">(assigned teacher)</span>';
      } else if (res.teacher) {
        /* teacher came from feedingRoster */
        showEl('axpTchrBnr');
        g('axpTI').innerHTML = '<strong>' + esc(res.teacher.name) + '</strong>' +
          (res.teacher.email ? ' &nbsp;·&nbsp; ' + esc(res.teacher.email) : '') +
          ' <span style="opacity:.6;">(assigned)</span>';
      } else {
        hideEl('axpTchrBnr');
      }

      showEl('axpEntry');
      hideEl('axpDone');
      renderCard();
      saveCache();

    } catch(ex) {
      axpAlert('Load Error', 'Failed to load students: ' + ex.message, 'danger');
    } finally {
      lb.disabled = false;
      lb.innerHTML = '<i class="bi bi-cloud-download"></i> Load Students';
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER STUDENT CARD
  ══════════════════════════════════════════════════════════════════════════ */
  function renderCard() {
    var s     = S.students[S.idx];
    var total = S.students.length;
    var filled = Object.keys(S.marks).length;
    var pct   = Math.round(filled / total * 100);

    g('axpSN2').textContent   = s.name;
    g('axpSMeta').textContent = (s.gender === 'F' ? 'Female' : 'Male') +
      ' · ' + S.subject + ' · ' + S.cls + ' · ' + S.examType;
    g('axpSCand').textContent = candNo(S.idx);
    g('axpSPos').textContent  = (S.idx + 1) + ' of ' + total;
    g('axpPL').textContent    = filled + ' / ' + total + ' filled';
    g('axpPF').style.width    = pct + '%';
    g('axpPP').textContent    = pct + '%';

    var sc = S.marks[s.name];
    g('axpSI').value = (sc !== undefined) ? sc : '';
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

  /* ══════════════════════════════════════════════════════════════════════════
     SCORE INPUT HANDLERS (window-exposed for inline oninput/onkeydown)
  ══════════════════════════════════════════════════════════════════════════ */
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
    if (v !== '') {
      var n = parseInt(v);
      if (!isNaN(n) && n >= 0 && n <= 100) {
        S.marks[S.students[S.idx].name] = n;
      }
    }
  }

  window.axpNext = function() {
    saveCurrent();
    if (S.idx < S.students.length - 1) { S.idx++; renderCard(); }
    else { axpAlert('End of List', 'Last student reached. Click <strong>Submit All Marks</strong>.', 'info'); }
  };
  window.axpPrev = function() { saveCurrent(); if (S.idx > 0) { S.idx--; renderCard(); } };
  window.axpSkip = function() { if (S.idx < S.students.length - 1) { S.idx++; renderCard(); } };

  /* ══════════════════════════════════════════════════════════════════════════
     SUBMIT
     Sends: schoolId, year, examType, class, subject, studentNames, marks
     via mode=teacherMarksEntry → handleTeacherMarksEntry() in backend
  ══════════════════════════════════════════════════════════════════════════ */
  window.axpSubmitAll = function() {
    saveCurrent();

    var payload = S.students
      .filter(function(s){ return S.marks[s.name] !== undefined; })
      .map(function(s){ return { name: s.name, score: S.marks[s.name] }; });

    if (!payload.length) {
      axpAlert('No Marks', 'Enter at least one score before submitting.', 'warning');
      return;
    }

    axpConfirm(
      'Confirm Submission',
      'Submit <strong>' + payload.length + '</strong> mark(s) for<br>' +
      '<strong>' + esc(S.subject) + '</strong> &nbsp;—&nbsp; ' + esc(S.cls) +
      ' &nbsp;—&nbsp; ' + esc(S.examType) + '?',
      async function() {
        var btn = g('axpSubBtn');
        btn.disabled = true;
        btn.innerHTML = '<span class="axpSpin"></span> Submitting…';
        try {
          var res = await apiPost({
            mode                 : 'teacherMarksEntry',
            schoolId             : S.schoolId,
            year                 : S.year,
            examType             : S.examType,
            'class'              : S.cls,
            subject              : S.subject,
            'data[studentName]'  : payload.map(function(p){ return p.name; }).join(','),
            'data[marks]'        : payload.map(function(p){ return String(p.score); }).join(',')
          });

          if (res.status === 'success') {
            S.submitted = true;
            clearCache();
            showSummary();
            axpToast((res.saved || payload.length) + ' marks saved!', 'success');
            if (res.notFound && res.notFound.length) {
              axpAlert('Partial Submit',
                (res.saved || 0) + ' saved. ⚠️ ' + res.notFound.length +
                ' student(s) not found in exam sheet: ' +
                res.notFound.slice(0, 5).map(esc).join(', '), 'warning');
            }
          } else {
            axpAlert('Failed', res.message || 'Submission failed. Please try again.', 'danger');
          }
        } catch(ex) {
          axpAlert('Network Error', ex.message, 'danger');
        } finally {
          btn.disabled = false;
          btn.innerHTML = '<i class="bi bi-send-fill"></i> Submit All Marks';
        }
      },
      'Submit',
      'background:#065f46;border-color:#6ee7b7;color:#fff;'
    );
  };

  /* ══════════════════════════════════════════════════════════════════════════
     SUMMARY / DONE SCREEN
  ══════════════════════════════════════════════════════════════════════════ */
  function showSummary() {
    var gc  = { A:0, B:0, C:0, D:0, F:0, '—':0 };
    var gc2 = { A:'#10b981', B:'#4ecca3', C:'#f59e0b', D:'#f97316', F:'#ef4444', '—':'#94a3b8' };

    var rows = S.students.map(function(s, i) {
      var sc = S.marks[s.name];
      var gr = calcGrade(sc);
      gc[gr.g] = (gc[gr.g] || 0) + 1;
      return { cand: candNo(i), name: s.name, gender: s.gender, score: sc, gr: gr.g, col: gr.c };
    });

    /* Rank by score descending */
    var ranked = rows.filter(function(r){ return r.score !== undefined; })
      .slice().sort(function(a, b){ return b.score - a.score; });
    var pm = {}, p = 0, ls = null, lp = 0;
    ranked.forEach(function(r) {
      if (r.score !== ls) { p = lp + 1; ls = r.score; lp = p; }
      pm[r.name] = p;
    });

    /* Grade grid */
    g('axpGGrid').innerHTML = ['A','B','C','D','F','—'].map(function(gr) {
      return '<div class="axpGC"><div class="gv" style="color:' + gc2[gr] + '">' + (gc[gr] || 0) + '</div>' +
        '<div class="gl" style="color:' + gc2[gr] + '">Grade ' + gr + '</div></div>';
    }).join('');

    /* Table */
    g('axpTbody').innerHTML = rows.map(function(r) {
      return '<tr>' +
        '<td style="font-family:monospace;color:#4ecca3;font-weight:700;">' + esc(r.cand) + '</td>' +
        '<td style="font-weight:500;">' + esc(r.name) + '</td>' +
        '<td style="text-align:center;">' + (r.gender === 'F' ? 'F' : 'M') + '</td>' +
        '<td style="text-align:center;font-weight:700;">' + (r.score !== undefined ? r.score : '—') + '</td>' +
        '<td style="text-align:center;"><strong style="color:' + r.col + ';font-size:15px;">' + r.gr + '</strong></td>' +
        '<td style="text-align:center;font-weight:700;">' + (pm[r.name] || '—') + '</td>' +
      '</tr>';
    }).join('');

    hideEl('axpEntry');
    showEl('axpDone');
  }

  /* ══════════════════════════════════════════════════════════════════════════
     PDF EXPORT
  ══════════════════════════════════════════════════════════════════════════ */
  window.axpExportPDF = async function() {
    if (!window.jspdf) {
      await new Promise(function(res, rej) {
        var s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
    }
    var { jsPDF } = window.jspdf;
    var doc = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
    var ML=14, MR=14, MT=14, PW=210, PH=297, UW=PW-ML-MR, y=MT;

    function pct(n,t){ return t>0?(n/t*100).toFixed(1)+'%':'0%'; }
    function checkPage(need){ if(y+need>PH-14){ doc.addPage(); y=MT; } }
    function secTitle(title,r,g2,b){
      checkPage(12);
      doc.setFillColor(r||6,g2||12,b||28); doc.rect(ML,y,UW,8,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(8.5); doc.setTextColor(78,204,163);
      doc.text(title.toUpperCase(), ML+3, y+5.5);
      y+=10;
    }

    var withMarks = S.students.filter(function(s){ return S.marks[s.name]!==undefined; });
    var total  = withMarks.length;
    var GRD    = ['A','B','C','D','F'];
    var GPA_PT = {A:1,B:2,C:3,D:4,F:5};
    var stats  = {A:{F:0,M:0},B:{F:0,M:0},C:{F:0,M:0},D:{F:0,M:0},F:{F:0,M:0}};
    var gpaSum = 0;
    withMarks.forEach(function(s){
      var gr  = calcGrade(S.marks[s.name]).g;
      var sex = (s.gender||'').toUpperCase()==='F'?'F':'M';
      if(stats[gr]) stats[gr][sex]++;
      gpaSum += GPA_PT[gr]||5;
    });
    var gpaAll  = total>0?(gpaSum/total).toFixed(2):'—';
    var cntPass = (stats.A.F+stats.A.M)+(stats.B.F+stats.B.M)+(stats.C.F+stats.C.M)+(stats.D.F+stats.D.M);
    var cntFail = stats.F.F+stats.F.M;
    var cntA    = stats.A.F+stats.A.M;
    var cntAB   = cntA+(stats.B.F+stats.B.M);
    var cntABC  = cntAB+(stats.C.F+stats.C.M);
    var cntD    = stats.D.F+stats.D.M;

    var ranked = withMarks.slice().sort(function(a,b){return S.marks[b.name]-S.marks[a.name];});
    var pm={},p=0,ls=null,lp=0;
    ranked.forEach(function(s){var sc=S.marks[s.name];if(sc!==ls){p=lp+1;ls=sc;lp=p;}pm[s.name]=p;});
    var stuIdx={}; S.students.forEach(function(s,i){stuIdx[s.name]=i;});
    var gradeCol={A:[16,185,129],B:[4,120,87],C:[180,130,6],D:[194,65,12],F:[185,28,28]};

    /* Page 1 header */
    doc.setFillColor(6,12,28); doc.rect(ML,y,UW,24,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(78,204,163);
    doc.text(S.schoolName.toUpperCase(),PW/2,y+9,{align:'center'});
    doc.setFontSize(9); doc.setTextColor(200,200,200);
    doc.text('SUBJECT MARK SHEET & ANALYSIS REPORT',PW/2,y+16,{align:'center'});
    doc.setFontSize(8);
    doc.text(S.subject+' · '+S.cls+' · '+S.examType+' · Year: '+S.year,PW/2,y+21,{align:'center'});
    y+=28;
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(80,80,80);
    doc.text('Total Students: '+S.students.length+'   With Marks: '+total,ML,y);
    doc.text('Generated: '+new Date().toLocaleDateString(),PW-MR,y,{align:'right'});
    if(S.teacher){y+=5;doc.text('Teacher: '+S.teacher.name+(S.teacher.email?' <'+S.teacher.email+'>':''),ML,y);}
    y+=8;

    secTitle('1. Grade Distribution');
    var s1RH=7,s1LW=34,s1GW=Math.floor((UW-s1LW)/5),s1Last=UW-s1LW-s1GW*4;
    var s1Cols=[{l:'',w:s1LW},{l:'A',w:s1GW,g:'A'},{l:'B',w:s1GW,g:'B'},{l:'C',w:s1GW,g:'C'},{l:'D',w:s1GW,g:'D'},{l:'F',w:s1Last,g:'F'}];
    doc.setFillColor(6,12,28); doc.rect(ML,y,UW,s1RH,'F');
    doc.setDrawColor(0,0,0); doc.setLineWidth(0.2); doc.rect(ML,y,UW,s1RH,'S');
    var cxh=ML;
    s1Cols.forEach(function(c,ci){
      var col=c.g?(gradeCol[c.g]||[78,204,163]):[78,204,163];
      doc.setFont('helvetica','bold'); doc.setFontSize(ci===0?7:9);
      doc.setTextColor(col[0],col[1],col[2]);
      doc.line(cxh+c.w,y,cxh+c.w,y+s1RH);
      doc.text(ci===0?'Grade →':c.l,cxh+c.w/2,y+s1RH/2+2.5,{align:'center'});
      cxh+=c.w;
    });
    y+=s1RH;
    var s1Rows=[
      {label:'Female',vals:GRD.map(function(g2){return String(stats[g2].F);}),bg:[240,253,250],bold:false},
      {label:'Male',vals:GRD.map(function(g2){return String(stats[g2].M);}),bg:[239,246,255],bold:false},
      {label:'Total',vals:GRD.map(function(g2){return String(stats[g2].F+stats[g2].M);}),bg:[248,248,248],bold:true},
      {label:'GPA',vals:['','','','',''],bg:[255,251,235],bold:true,gpaRow:true}
    ];
    s1Rows.forEach(function(row){
      checkPage(s1RH+2);
      doc.setFillColor(row.bg[0],row.bg[1],row.bg[2]); doc.rect(ML,y,UW,s1RH,'F');
      doc.setDrawColor(0,0,0); doc.rect(ML,y,UW,s1RH,'S');
      var cx=ML;
      doc.setFont('helvetica',row.bold?'bold':'normal'); doc.setFontSize(7.5);
      doc.setTextColor(row.gpaRow?180:60,row.gpaRow?120:60,row.gpaRow?0:60);
      doc.line(cx+s1LW,y,cx+s1LW,y+s1RH);
      doc.text(row.label,cx+3,y+s1RH/2+2.5); cx+=s1LW;
      if(row.gpaRow){
        var gn=parseFloat(gpaAll),gg='—';
        if(!isNaN(gn)){if(gn<=1.5)gg='A';else if(gn<=2.5)gg='B';else if(gn<=3.5)gg='C';else if(gn<=4.5)gg='D';else gg='F';}
        var gc2=gradeCol[gg]||[180,120,0],mw=UW-s1LW;
        doc.setFillColor(gc2[0],gc2[1],gc2[2]); doc.rect(cx,y,mw,s1RH,'F');
        doc.setDrawColor(0,0,0); doc.line(cx+mw,y,cx+mw,y+s1RH);
        doc.setTextColor(255,255,255);
        doc.setFont('helvetica','bold'); doc.setFontSize(9);
        doc.text('GPA: '+gpaAll,cx+mw*0.38,y+s1RH/2+2.5,{align:'center'});
        doc.setFontSize(11);
        doc.text('Grade '+gg,cx+mw*0.70,y+s1RH/2+2.5,{align:'center'});
      } else {
        GRD.forEach(function(g2,gi){
          var cw=gi===4?s1Last:s1GW,val=row.vals[gi],gc3=gradeCol[g2]||[30,30,30];
          doc.setFont('helvetica',row.bold?'bold':'normal'); doc.setFontSize(8);
          if(row.bold){doc.setTextColor(gc3[0],gc3[1],gc3[2]);}else{doc.setTextColor(50,50,50);}
          doc.line(cx+cw,y,cx+cw,y+s1RH);
          doc.text(val,cx+cw/2,y+s1RH/2+2.5,{align:'center'}); cx+=cw;
        });
      }
      y+=s1RH;
    });
    y+=8;

    /* Full mark list */
    doc.addPage(); y=MT;
    doc.setFillColor(6,12,28); doc.rect(ML,y,UW,14,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(78,204,163);
    doc.text(S.schoolName.toUpperCase(),PW/2,y+6,{align:'center'});
    doc.setFontSize(7.5); doc.setTextColor(200,200,200);
    doc.text('FULL MARK LIST — '+S.subject+' · '+S.cls+' · '+S.examType+' · '+S.year,PW/2,y+11,{align:'center'});
    y+=18;
    var cols=[{l:'CAND. NO.',w:30},{l:'STUDENT NAME',w:68},{l:'SEX',w:12},{l:'SCORE',w:18},{l:'GRADE',w:16},{l:'POS',w:24}];
    var RH=7;
    function pdfHdr(){
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
    pdfHdr();
    var rc=0;
    S.students.forEach(function(s,i){
      if(S.marks[s.name]===undefined) return;
      if(y+RH>PH-14){doc.addPage();y=MT;pdfHdr();}
      var sc=S.marks[s.name],gr=calcGrade(sc);
      if(rc%2===1){doc.setFillColor(248,250,252);doc.rect(ML,y,UW,RH,'F');}
      doc.setDrawColor(0,0,0); doc.setLineWidth(0.2); doc.rect(ML,y,UW,RH,'S');
      var row=[candNo(i),s.name,s.gender==='F'?'F':'M',sc,gr.g,pm[s.name]||'—'];
      var cx=ML;
      row.forEach(function(v,ci){
        doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(30,30,30);
        doc.line(cx+cols[ci].w,y,cx+cols[ci].w,y+RH);
        var al=ci===1?'left':'center',tx=ci===1?cx+2:cx+cols[ci].w/2;
        doc.text(String(v||'').toUpperCase(),tx,y+RH/2+2.5,{align:al,maxWidth:cols[ci].w-3}); cx+=cols[ci].w;
      });
      y+=RH; rc++;
    });
    var nP=doc.internal.getNumberOfPages();
    for(var pg=1;pg<=nP;pg++){
      doc.setPage(pg);
      doc.setFont('helvetica','italic'); doc.setFontSize(7); doc.setTextColor(150,150,150);
      doc.text('AcademixPoint School Management · www.academixpoint.com',PW/2,PH-8,{align:'center'});
      doc.text('Page '+pg+' of '+nP,PW-MR,PH-8,{align:'right'});
    }
    doc.save('MarkSheet_'+S.cls+'_'+S.subject+'_'+S.examType+'.pdf');
  };

  /* ══════════════════════════════════════════════════════════════════════════
     CSV EXPORT
  ══════════════════════════════════════════════════════════════════════════ */
  window.axpExportCSV = function() {
    var ranked = S.students.filter(function(s){ return S.marks[s.name]!==undefined; })
      .slice().sort(function(a,b){ return S.marks[b.name]-S.marks[a.name]; });
    var pm={},p=0,ls=null,lp=0;
    ranked.forEach(function(s){ var sc=S.marks[s.name]; if(sc!==ls){p=lp+1;ls=sc;lp=p;} pm[s.name]=p; });
    var lines=['"Cand. No.","Name","Gender","Score","Grade","Position"'];
    S.students.forEach(function(s,i){
      var sc=S.marks[s.name],gr=calcGrade(sc);
      lines.push('"'+candNo(i)+'","'+s.name+'",'+(s.gender==='F'?'"F"':'"M"')+','+
        (sc!==undefined?sc:'')+','+gr.g+','+(pm[s.name]||''));
    });
    var a=document.createElement('a');
    a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(lines.join('\n'));
    a.download='Marks_'+S.cls+'_'+S.subject+'_'+S.examType+'.csv';
    a.click();
  };

  window.axpReenter  = function(){ S.idx=0; hideEl('axpDone'); showEl('axpEntry'); renderCard(); };

  window.axpStartNew = function() {
    S.cls=''; S.examType=''; S.teacher=null; S.subject='';
    S.students=[]; S.marks={}; S.submitted=false;
    hideEl('axpDone'); hideEl('axpEntry'); hideEl('axpLW');
    hideEl('axpS2'); hideEl('axpS3'); hideEl('axpS4');
    buildClassChips();
    clearCache();
  };

  /* ══════════════════════════════════════════════════════════════════════════
     LOCAL STORAGE SESSION PERSISTENCE
  ══════════════════════════════════════════════════════════════════════════ */
  function cKey(){ return 'axpT_' + S.digits + '_' + (S.schoolId || ''); }
  function saveCache() {
    try {
      localStorage.setItem(cKey(), JSON.stringify({
        cls: S.cls, examType: S.examType, subject: S.subject || '',
        teacher: S.teacher,
        marks: S.marks, idx: S.idx,
        savedAt: new Date().toISOString()
      }));
    } catch(ex){}
  }
  function clearCache(){ try{ localStorage.removeItem(cKey()); }catch(ex){} }

  function checkRestore() {
    try {
      var raw = localStorage.getItem(cKey());
      if (!raw) return;
      var d = JSON.parse(raw);
      if (!d.cls || !d.examType) return;
      g('axpRI').textContent = d.cls + ' · ' + d.examType + (d.subject ? ' · ' + d.subject : '') +
        ' — saved ' + new Date(d.savedAt).toLocaleString();
      g('axpRB').style.display = 'block';
      window._axpPR = d;
    } catch(ex){}
  }

  window.axpRestoreSession = function() {
    var d = window._axpPR; if (!d) return;
    g('axpRB').style.display = 'none';

    S.cls      = d.cls;
    S.examType = d.examType;
    S.teacher  = d.teacher || null;
    S.marks    = d.marks || {};

    buildClassChips();    hlChip('axpCC', d.cls);
    buildExamChips();     hlChip('axpEC', d.examType);
    buildTeacherChips();
    if (d.teacher) {
      S.teacher = d.teacher;
      /* Re-highlight teacher chip by name */
      Array.from(g('axpTC').querySelectorAll('.axpChip')).forEach(function(b) {
        if (b.textContent.indexOf(d.teacher.name) > -1) b.classList.add('on');
      });
    }
    if (d.subject) {
      S.subject = d.subject;
      buildSubjectChips();
      hlChip('axpSubC', d.subject);
      showEl('axpLW');
    }

    window.axpLoadStudents().then(function() {
      S.idx = Math.min(d.idx || 0, Math.max(S.students.length - 1, 0));
      renderCard();
      axpToast('Session restored ✓', 'success');
    });
  };

  window.axpDismissRestore = function() { g('axpRB').style.display='none'; clearCache(); };

  window.axpClearCache = function() {
    axpConfirm('Clear Cache', 'Delete all locally saved session data?', function() {
      try {
        Object.keys(localStorage)
          .filter(function(k){ return k.startsWith('axpT_'); })
          .forEach(function(k){ localStorage.removeItem(k); });
      } catch(ex){}
      axpToast('Cache cleared.', 'success');
      g('axpRB').style.display = 'none';
    }, 'Clear', 'background:#ef4444;border-color:#fca5a5;color:#fff;');
  };

  /* ══════════════════════════════════════════════════════════════════════════
     HELPERS
  ══════════════════════════════════════════════════════════════════════════ */
  function calcGrade(v) {
    if (v===undefined||v===null||v==='') return {g:'—',c:'#94a3b8'};
    var n=parseInt(v); if(isNaN(n)) return {g:'—',c:'#94a3b8'};
    if(n>=75) return {g:'A',c:'#10b981'};
    if(n>=65) return {g:'B',c:'#4ecca3'};
    if(n>=45) return {g:'C',c:'#f59e0b'};
    if(n>=30) return {g:'D',c:'#f97316'};
    return {g:'F',c:'#ef4444'};
  }

  function candNo(i){ return S.digits + '-' + String(i+1).padStart(4,'0'); }

  function sortStu(arr) {
    return arr.slice().sort(function(a,b){
      var af=(a.gender||'').toUpperCase()==='F'?0:1;
      var bf=(b.gender||'').toUpperCase()==='F'?0:1;
      if(af!==bf) return af-bf;
      return String(a.name).toUpperCase().localeCompare(String(b.name).toUpperCase());
    });
  }

  function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function g(id)  { return document.getElementById(id); }
  // show/hide replaced by showEl/hideEl
  // (removed)
  function showEl(id){ var el=g(id); if(el) el.classList.remove('axpH'); }
  function hideEl(id){ var el=g(id); if(el) el.classList.add('axpH'); }
  function hlChip(cid, val) {
    var c=g(cid); if(!c) return;
    Array.from(c.querySelectorAll('.axpChip')).forEach(function(b){
      if(b.textContent.trim()===String(val).trim()) b.classList.add('on');
    });
  }
  function showErr(msg){ hideEl('axpLd'); showEl('axpErr'); g('axpEM').textContent=msg; }

  /* ══════════════════════════════════════════════════════════════════════════
     MODAL
  ══════════════════════════════════════════════════════════════════════════ */
  var _icons = {
    info   : '<i class="bi bi-info-circle-fill" style="color:#3b82f6"></i>',
    success: '<i class="bi bi-check-circle-fill" style="color:#10b981"></i>',
    warning: '<i class="bi bi-exclamation-triangle-fill" style="color:#f59e0b"></i>',
    danger : '<i class="bi bi-x-octagon-fill" style="color:#ef4444"></i>'
  };

  function _modal(title, body, buttons, type) {
    g('axpMIcon').innerHTML    = _icons[type] || _icons.info;
    g('axpMTitle').textContent = title;
    g('axpMBd').innerHTML      = body;
    g('axpMFt').innerHTML      = buttons.map(function(b){
      return '<button onclick="'+b.a+'" class="axpBtn axpSm" style="'+b.s+'">'+b.l+'</button>';
    }).join('');
    g('axpMod').classList.add('open');
  }

  window.axpMClose = function(){ g('axpMod').classList.remove('open'); };

  function axpAlert(title, body, type) {
    _modal(title, body, [{
      l:'OK', a:'axpMClose()',
      s:'background:#060c1c;color:#4ecca3;border:1.5px solid #4ecca3;'
    }], type||'info');
  }

  function axpConfirm(title, body, onYes, yesLbl, yesStyle) {
    window._axpCB = onYes;
    _modal(title, body, [
      { l:'Cancel', a:'axpMClose()', s:'background:#f8fafc;color:#64748b;border:1.5px solid #e2e8f0;' },
      { l:yesLbl||'Confirm',
        a:'axpMClose();if(window._axpCB){window._axpCB();window._axpCB=null;}',
        s:yesStyle||'background:#060c1c;color:#4ecca3;border:1.5px solid #4ecca3;' }
    ], 'warning');
  }

  function axpToast(msg, type) {
    var colors={success:'#10b981',danger:'#ef4444',warning:'#f59e0b',info:'#3b82f6'};
    var el=g('axpToast');
    el.style.background = colors[type]||colors.info;
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(window._axpTT);
    window._axpTT = setTimeout(function(){ el.style.display='none'; }, 3000);
  }

})();
