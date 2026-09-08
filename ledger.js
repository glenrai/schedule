
(function(){
  "use strict";

  var CFG = window.LEDGER_CONFIG || {};
  var canEdit = !!CFG.editable;
  var DATA_URL = CFG.dataUrl || "./data.json";

  var CATS = [
    {key:"free",    label:"Free",                  short:"Free",       bg:"--cat-free-bg",    ink:"--cat-free-ink",    editable:true,  dashed:true},
    {key:"teaching", label:"Teaching",              short:"Teaching",   bg:"--cat-teaching-bg", ink:"--cat-teaching-ink", editable:true},
    {key:"consult", label:"Student consultation",   short:"Consult",    bg:"--cat-consult-bg", ink:"--cat-consult-ink", editable:true},
    {key:"hr",      label:"Homeroom / consult",     short:"Homeroom",   bg:"--cat-hr-bg",      ink:"--cat-hr-ink",      editable:true},
    {key:"lunch",   label:"Lunch / rec duty",       short:"Lunch duty", bg:"--cat-lunch-bg",   ink:"--cat-lunch-ink",   editable:true},
    {key:"lunchbreak", label:"Lunch",               short:"Lunch",      bg:"--cat-lunchbreak-bg", ink:"--cat-lunchbreak-ink", editable:true},
    {key:"head",    label:"Dept. head duty",        short:"Dept head",  bg:"--cat-head-bg",    ink:"--cat-head-ink",    editable:true},
    {key:"prep",    label:"Lesson prep",            short:"Prep",       bg:"--cat-prep-bg",    ink:"--cat-prep-ink",    editable:true},
    {key:"grading", label:"Grading & feedback",     short:"Grading",    bg:"--cat-grading-bg", ink:"--cat-grading-ink", editable:true},
    {key:"admin",   label:"Admin",                  short:"Admin",      bg:"--cat-admin-bg",   ink:"--cat-admin-ink",   editable:true},
    {key:"meeting", label:"Meeting",                short:"Meeting",    bg:"--cat-meeting-bg", ink:"--cat-meeting-ink", editable:true},
    {key:"event",   label:"School Event",           short:"Event",      bg:"--cat-event-bg",   ink:"--cat-event-ink",   editable:true},
    {key:"cover",   label:"Cover",                  short:"Cover",      bg:"--cat-cover-bg",   ink:"--cat-cover-ink",   editable:true},
    {key:"misc",    label:"Miscellaneous",          short:"Misc",       bg:"--cat-misc-bg",    ink:"--cat-misc-ink",    editable:true},
    {key:"off",     label:"Day off / Vacation",     short:"Off",        bg:"--cat-off-bg",     ink:"--cat-off-ink",     editable:true}
  ];
  var CAT_BY_KEY = {};
  CATS.forEach(function(c){ CAT_BY_KEY[c.key]=c; });

  /* fixed light-theme hex values, used to render PDF pages consistently regardless of viewer theme */
  var LIGHT_VARS = {
    "ink":"#1c2b27", "ink-soft":"#57655e", "ink-faint":"#8b968e",
    "surface":"#fbfcfa", "surface-2":"#e3e8de", "border":"#d2d9cb", "border-soft":"#e0e5d9",
    "cat-free-bg":"#eef1ec", "cat-free-border":"#c3cabb", "cat-free-ink":"#8b968e",
    "cat-teaching-bg":"#2f7446", "cat-teaching-ink":"#ffffff",
    "cat-consult-bg":"#2e799e", "cat-consult-ink":"#ffffff",
    "cat-hr-bg":"#ab3640", "cat-hr-ink":"#ffffff",
    "cat-lunch-bg":"#157fac", "cat-lunch-ink":"#ffffff",
    "cat-lunchbreak-bg":"#ede4ab", "cat-lunchbreak-ink":"#373210",
    "cat-head-bg":"#a55127", "cat-head-ink":"#ffffff",
    "cat-prep-bg":"#643e98", "cat-prep-ink":"#ffffff",
    "cat-grading-bg":"#944294", "cat-grading-ink":"#ffffff",
    "cat-admin-bg":"#63574b", "cat-admin-ink":"#ffffff",
    "cat-meeting-bg":"#384ba8", "cat-meeting-ink":"#ffffff",
    "cat-event-bg":"#983e6b", "cat-event-ink":"#ffffff",
    "cat-cover-bg":"#8d6b1b", "cat-cover-ink":"#ffffff",
    "cat-misc-bg":"#4f7326", "cat-misc-ink":"#ffffff",
    "cat-off-bg":"#63746d", "cat-off-ink":"#ffffff"
  };

  var PERIODS = [
    {i:0,start:"8:15",end:"9:00 am"},
    {i:1,start:"9:00",end:"9:45 am"},
    {i:2,start:"9:55",end:"10:40 am"},
    {i:3,start:"10:45",end:"11:30 am"},
    {i:4,start:"11:30 am",end:"12:15 pm"},
    {i:5,start:"12:15",end:"1:00 pm"},
    {i:6,start:"1:00",end:"1:45 pm"},
    {i:7,start:"1:55",end:"2:40 pm"},
    {i:8,start:"2:45",end:"3:30 pm"},
    {i:9,start:"3:30",end:"4:15 pm"},
    {i:10,start:"4:15",end:"5:00 pm"}
  ];

  var DAYS = [
    {k:"Mon",label:"Monday"},
    {k:"Tue",label:"Tuesday"},
    {k:"Wed",label:"Wednesday"},
    {k:"Thu",label:"Thursday"},
    {k:"Fri",label:"Friday"}
  ];

  var DEPT_HEAD_TARGET = 5;
  var HRS_PER_PERIOD = 0.75;

  var PRESET = [
    ["Mon",1,"teaching","Eng 1 · Gr 11a, 11b · A2208"],
    ["Mon",4,"teaching","Eng · Gr 10a · A3205"],
    ["Mon",5,"consult","Student consultation hour"],
    ["Mon",7,"teaching","Eng 1 · Gr 12a, 12b · MYP1 A3206"],
    ["Tue",4,"teaching","Eng · Gr 10a · A3205"],
    ["Tue",5,"teaching","Eng 1 · Gr 12a, 12b · Eesti A3204"],
    ["Tue",9,"hr","Gr 11a (A3205) & 11b (Eesti A3204)"],
    ["Wed",1,"teaching","Eng 1 · Gr 12a, 12b · C1212"],
    ["Thu",0,"consult","Student consultation hour"],
    ["Thu",1,"teaching","Eng · Gr 10a · A3209 (Math rm)"],
    ["Thu",7,"teaching","Eng 1 · Gr 11a, 11b · A3210 (Physics rm)"],
    ["Thu",9,"hr","Gr 11b (Eesti A3204) & 11a (A3205)"],
    ["Fri",5,"lunch","Lunch/Rec duty · Gr 8, 9, 10a, 10b"],
    ["Fri",6,"teaching","Eng · Gr 10a · MYP1 A3206"],
    ["Fri",7,"teaching","Eng · Gr 10a · MYP1 A3206"]
  ];

  function defaultCellsForWeek(){
    var cells={};
    DAYS.forEach(function(d){
      PERIODS.forEach(function(p){
        cells[d.k+"-"+p.i]={cat:"free",label:""};
      });
    });
    PRESET.forEach(function(row){
      cells[row[0]+"-"+row[1]]={cat:row[2],label:row[3]};
    });
    return cells;
  }

  function defaultState(){
    return {updatedAt:null, weeks:{}};
  }

  /* ---- academic-year week range: Mon 31 Aug 2026 through the week of Mon 28 Jun 2027 ---- */
  var MONTH_ABBR=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];
  function pad2(n){ return (n<10?"0":"")+n; }
  function toEpoch(y,m,d){ return Math.floor(Date.UTC(y,m,d)/86400000); }
  function fromEpoch(e){ var dt=new Date(e*86400000); return {y:dt.getUTCFullYear(), m:dt.getUTCMonth(), d:dt.getUTCDate()}; }
  function isoFromEpoch(e){ var p=fromEpoch(e); return p.y+"-"+pad2(p.m+1)+"-"+pad2(p.d); }
  function epochFromIso(iso){ var parts=iso.split("-").map(Number); return toEpoch(parts[0],parts[1]-1,parts[2]); }

  var YEAR_START_EPOCH=toEpoch(2026,7,31);  /* Mon 31 Aug 2026 */
  var YEAR_END_EPOCH=toEpoch(2027,5,30);    /* cap: Wed 30 Jun 2027 */

  var WEEK_STARTS=(function(){
    var arr=[], e=YEAR_START_EPOCH;
    while(e<=YEAR_END_EPOCH){ arr.push(isoFromEpoch(e)); e+=7; }
    return arr;
  })();

  function monthKeyFor(weekIso){
    var p=fromEpoch(epochFromIso(weekIso));
    return p.y+"-"+pad2(p.m+1);
  }

  /* ordered list of the school-year months, for the PDF month picker */
  var ALL_MONTHS=(function(){
    var seen={}, arr=[];
    WEEK_STARTS.forEach(function(w){
      var key=monthKeyFor(w);
      if(!seen[key]){
        seen[key]=true;
        var p=fromEpoch(epochFromIso(w));
        arr.push({key:key, label:MONTH_NAMES[p.m]+" "+p.y});
      }
    });
    return arr;
  })();

  function formatWeekRange(weekIso){
    var se=epochFromIso(weekIso), fe=se+4;
    var sp=fromEpoch(se), fp=fromEpoch(fe);
    if(sp.m===fp.m){ return MONTH_ABBR[sp.m]+" "+sp.d+"–"+fp.d+", "+sp.y; }
    return MONTH_ABBR[sp.m]+" "+sp.d+" – "+MONTH_ABBR[fp.m]+" "+fp.d+", "+fp.y;
  }

  function computeDefaultWeek(){
    var todayIso;
    try{ todayIso=new Date().toISOString().slice(0,10); }catch(e){ todayIso=WEEK_STARTS[0]; }
    var te=epochFromIso(todayIso);
    var lastStart=epochFromIso(WEEK_STARTS[WEEK_STARTS.length-1]);
    if(te<YEAR_START_EPOCH) te=YEAR_START_EPOCH;
    if(te>lastStart) te=lastStart;
    var idx=Math.floor((te-YEAR_START_EPOCH)/7);
    if(idx<0) idx=0;
    if(idx>=WEEK_STARTS.length) idx=WEEK_STARTS.length-1;
    return WEEK_STARTS[idx];
  }

  var state = defaultState();
  var currentWeekIso = computeDefaultWeek();

  function getEffectiveCells(weekIso){
    var w=state.weeks[weekIso];
    return w ? w.cells : defaultCellsForWeek();
  }
  function ensureWeekWritable(weekIso){
    if(!state.weeks[weekIso]){
      state.weeks[weekIso]={cells: defaultCellsForWeek()};
    }
    return state.weeks[weekIso].cells;
  }

  function isDayOff(cells, dayKey){
    return PERIODS.every(function(p){
      var c=cells[dayKey+"-"+p.i];
      return c && c.cat==="off";
    });
  }

  /* toggles an entire day between "off" and its prior per-period values */
  function toggleDayOff(weekIso, dayKey){
    var writable=ensureWeekWritable(weekIso);
    var weekEntry=state.weeks[weekIso];
    if(isDayOff(writable, dayKey)){
      var backup=weekEntry.offBackup && weekEntry.offBackup[dayKey];
      PERIODS.forEach(function(p){
        writable[dayKey+"-"+p.i]=(backup && backup[p.i]) ? backup[p.i] : {cat:"free", label:""};
      });
      if(weekEntry.offBackup) delete weekEntry.offBackup[dayKey];
    } else {
      if(!weekEntry.offBackup) weekEntry.offBackup={};
      var backupObj={};
      PERIODS.forEach(function(p){
        backupObj[p.i]=writable[dayKey+"-"+p.i] || {cat:"free", label:""};
      });
      weekEntry.offBackup[dayKey]=backupObj;
      PERIODS.forEach(function(p){
        writable[dayKey+"-"+p.i]={cat:"off", label:""};
      });
    }
  }

  function escapeHtml(s){
    return String(s==null?"":s).replace(/[&<>"']/g,function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function fmtUpdated(iso){
    if(!iso) return "Not yet saved";
    var d=new Date(iso);
    var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var h=d.getHours(), m=d.getMinutes();
    var ampm=h>=12?"pm":"am"; var h12=h%12; if(h12===0) h12=12;
    var mm=(m<10?"0":"")+m;
    return "Saved "+months[d.getMonth()]+" "+d.getDate()+", "+h12+":"+mm+ampm;
  }

  function weeksInMonth(monthKey){
    return WEEK_STARTS.filter(function(w){ return monthKeyFor(w)===monthKey; }).length;
  }

  function tallyForMonth(monthKey){
    var counts={}; CATS.forEach(function(c){counts[c.key]=0;});
    WEEK_STARTS.forEach(function(w){
      if(monthKeyFor(w)!==monthKey) return;
      var cells=getEffectiveCells(w);
      Object.keys(cells).forEach(function(k){
        var c=cells[k].cat;
        if(counts[c]===undefined) counts[c]=0;
        counts[c]++;
      });
    });
    return counts;
  }

  function fmtLongToday(){
    var d=new Date();
    var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();
  }

  function renderPrintLegend(){
    return '<div class="print-legend">'+CATS.map(function(c){
      return '<span class="legend-item"><span class="legend-swatch" style="background:var('+c.bg+')"></span>'+escapeHtml(c.label)+'</span>';
    }).join("")+'</div>';
  }

  function monthLabelFor(weekIso){
    var p=fromEpoch(epochFromIso(weekIso));
    return MONTH_NAMES[p.m]+" "+p.y;
  }

  function buildPrintWeekTable(weekIso){
    var cells=getEffectiveCells(weekIso);
    var weekStartEpoch=epochFromIso(weekIso);
    var theadHtml='<thead><tr><th class="print-daycol"></th>'+
      PERIODS.map(function(p){
        return '<th><div class="print-p-idx">P'+p.i+'</div><div class="print-p-time">'+p.start+'–'+p.end+'</div></th>';
      }).join("")+'</tr></thead>';
    var rowsHtml=DAYS.map(function(d,di){
      var dayDate=fromEpoch(weekStartEpoch+di);
      var cellsHtml=PERIODS.map(function(p){
        var key=d.k+"-"+p.i;
        var cell=cells[key]||{cat:"free",label:""};
        var cat=CAT_BY_KEY[cell.cat]||CAT_BY_KEY.free;
        if(cat.key==="free"){
          return '<td class="print-pcell"><div class="print-badge is-free">Free</div></td>';
        }
        if(cat.key==="off"){
          return '<td class="print-pcell"><div class="print-badge" style="background:var('+cat.bg+');">&nbsp;</div></td>';
        }
        var detail=cell.label? '<div class="print-detail">'+escapeHtml(cell.label)+'</div>' : "";
        return '<td class="print-pcell"><div class="print-badge" style="background:var('+cat.bg+');color:var('+cat.ink+');">'+escapeHtml(cat.short)+'</div>'+detail+'</td>';
      }).join("");
      return '<tr><td class="print-daycol"><div class="print-day-name">'+d.label+'</div><div class="print-day-date">'+MONTH_ABBR[dayDate.m]+' '+dayDate.d+'</div></td>'+cellsHtml+'</tr>';
    }).join("");
    return '<div class="print-grid-wrap"><table class="print-table">'+theadHtml+'<tbody>'+rowsHtml+'</tbody></table></div>';
  }

  /* full school-year printable view: every week, in order, grouped under a month heading */
  function buildPrintView(){
    var html='<div class="print-header">'+
      '<span class="print-eyebrow">Weekly Duty Ledger</span>'+
      '<div class="print-title">Glen Rai · Head of English · IST Tallinn</div>'+
      '<div class="print-meta">Sept 2026 – June 2027 · generated '+fmtLongToday()+'</div>'+
      renderPrintLegend()+
    '</div>';
    var lastMonth=null;
    WEEK_STARTS.forEach(function(weekIso){
      var monthLabel=monthLabelFor(weekIso);
      var showMonth=(monthLabel!==lastMonth);
      lastMonth=monthLabel;
      html+='<div class="print-week-page">'+
        (showMonth? '<div class="print-month-label">'+monthLabel+'</div>' : '')+
        '<div class="print-week-title">Week of '+formatWeekRange(weekIso)+'</div>'+
        buildPrintWeekTable(weekIso)+
      '</div>';
    });
    return html;
  }

  function buildPdfPageHtml(weekIso, showFullHeader, showMonthLabel){
    var html="";
    if(showFullHeader){
      html+='<div class="print-header">'+
        '<span class="print-eyebrow">Weekly Duty Ledger</span>'+
        '<div class="print-title">Glen Rai · Head of English · IST Tallinn</div>'+
        '<div class="print-meta">generated '+fmtLongToday()+'</div>'+
        renderPrintLegend()+
      '</div>';
    }
    if(showMonthLabel){
      html+='<div class="print-month-label">'+monthLabelFor(weekIso)+'</div>';
    }
    html+='<div class="print-week-title">Week of '+formatWeekRange(weekIso)+'</div>';
    html+=buildPrintWeekTable(weekIso);
    return html;
  }

  /* ---- lazy-loaded PDF export libraries (only fetched when the user actually exports) ---- */
  function loadScript(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement("script");
      s.src=src; s.async=true;
      s.onload=function(){ resolve(); };
      s.onerror=function(){ reject(new Error("load failed: "+src)); };
      document.head.appendChild(s);
    });
  }
  var libsPromise=null;
  function ensurePdfLibs(){
    if(!libsPromise){
      libsPromise=Promise.all([
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"),
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
      ]);
    }
    return libsPromise;
  }

  /* plain-browser file download, no host capability needed */
  function saveBlob(filename, blob){
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");
    a.href=url; a.download=filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
  }

  /* ---- month-picker modal ---- */
  var pdfSelectedMonths=null; // Set-like object of month keys currently checked

  function closeModal(){
    var root=document.getElementById("modal-root");
    if(root) root.innerHTML="";
  }

  function renderPdfModal(opts){
    opts=opts||{};
    var root=document.getElementById("modal-root");
    if(!root) return;
    if(!pdfSelectedMonths){
      pdfSelectedMonths={};
      ALL_MONTHS.forEach(function(m){ pdfSelectedMonths[m.key]=true; });
    }
    var busy=!!opts.busy, progress=opts.progress||"", error=opts.error||"";
    var checkedCount=ALL_MONTHS.filter(function(m){ return pdfSelectedMonths[m.key]; }).length;

    var monthsHtml=ALL_MONTHS.map(function(m){
      var checked=pdfSelectedMonths[m.key]? " checked" : "";
      return '<label class="pdf-month-item"><input type="checkbox" class="pdf-month-cb" data-month="'+m.key+'"'+checked+(busy?" disabled":"")+'> '+m.label+'</label>';
    }).join("");

    root.innerHTML=
      '<div class="pdf-modal-overlay" id="pdf-modal-overlay">'+
        '<div class="pdf-modal" role="dialog" aria-modal="true" aria-label="Download PDF">'+
          '<h2>Download PDF</h2>'+
          '<div class="sub">Choose which months to include — each week prints as its own page.</div>'+
          '<div class="pdf-month-head">'+
            '<span class="label">Months</span>'+
            '<span class="pdf-month-links">'+
              '<button type="button" class="link-btn" id="pdf-select-all"'+(busy?" disabled":"")+'>All</button>'+
              '<button type="button" class="link-btn" id="pdf-select-none"'+(busy?" disabled":"")+'>None</button>'+
            '</span>'+
          '</div>'+
          '<div class="pdf-month-list">'+monthsHtml+'</div>'+
          (error? '<div class="pdf-error">'+escapeHtml(error)+'</div>' : '')+
          (busy? '<div class="pdf-progress">'+escapeHtml(progress)+'</div>' : '')+
          '<div class="pdf-modal-actions">'+
            '<button type="button" class="btn-secondary" id="pdf-cancel"'+(busy?" disabled":"")+'>Cancel</button>'+
            '<button type="button" class="btn-primary" id="pdf-confirm"'+((busy||checkedCount===0)?" disabled":"")+'>'+(busy?"Generating…":"Download")+'</button>'+
          '</div>'+
        '</div>'+
      '</div>';

    var overlay=document.getElementById("pdf-modal-overlay");
    if(overlay) overlay.addEventListener("mousedown", function(e){ if(e.target===overlay && !busy) closeModal(); });

    if(!busy){
      var cbs=root.querySelectorAll(".pdf-month-cb");
      for(var i=0;i<cbs.length;i++){
        cbs[i].addEventListener("change", function(e){
          var key=e.target.getAttribute("data-month");
          pdfSelectedMonths[key]=e.target.checked;
          renderPdfModal();
        });
      }
      var allBtn=document.getElementById("pdf-select-all");
      if(allBtn) allBtn.addEventListener("click", function(){
        ALL_MONTHS.forEach(function(m){ pdfSelectedMonths[m.key]=true; });
        renderPdfModal();
      });
      var noneBtn=document.getElementById("pdf-select-none");
      if(noneBtn) noneBtn.addEventListener("click", function(){
        ALL_MONTHS.forEach(function(m){ pdfSelectedMonths[m.key]=false; });
        renderPdfModal();
      });
      var cancelBtn=document.getElementById("pdf-cancel");
      if(cancelBtn) cancelBtn.addEventListener("click", closeModal);
      var confirmBtn=document.getElementById("pdf-confirm");
      if(confirmBtn) confirmBtn.addEventListener("click", function(){ runPdfExport(); });
    }
  }

  function openPdfModal(){
    ensurePdfLibs(); // pre-warm in the background
    renderPdfModal();
  }

  function runPdfExport(){
    var weeks=WEEK_STARTS.filter(function(w){ return pdfSelectedMonths[monthKeyFor(w)]; });
    if(weeks.length===0) return;

    renderPdfModal({busy:true, progress:"Loading PDF tools…"});

    var pdf=null;

    ensurePdfLibs().then(function(){
      if(!window.jspdf || !window.html2canvas){
        throw new Error("PDF tools failed to load");
      }
      var jsPDF=window.jspdf.jsPDF;
      pdf=new jsPDF({orientation:"landscape", unit:"mm", format:"a4"});
      var slot=document.getElementById("pdf-render-slot");
      Object.keys(LIGHT_VARS).forEach(function(k){ slot.style.setProperty("--"+k, LIGHT_VARS[k]); });

      var lastMonth=null;
      var chain=Promise.resolve();
      weeks.forEach(function(weekIso, idx){
        chain=chain.then(function(){
          renderPdfModal({busy:true, progress:"Rendering week "+(idx+1)+" of "+weeks.length+"…"});
          var monthLabel=monthLabelFor(weekIso);
          var showMonth=(monthLabel!==lastMonth);
          lastMonth=monthLabel;
          slot.innerHTML=buildPdfPageHtml(weekIso, idx===0, showMonth);
          return window.html2canvas(slot, {scale:1.6, backgroundColor:"#ffffff", useCORS:true}).then(function(canvas){
            var imgData=canvas.toDataURL("image/jpeg", 0.9);
            if(idx>0) pdf.addPage("a4","landscape");
            pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
          });
        });
      });
      return chain;
    }).then(function(){
      renderPdfModal({busy:true, progress:"Preparing download…"});
      var blob=pdf.output("blob");
      var firstKey=null, lastKey=null;
      ALL_MONTHS.forEach(function(m){
        if(pdfSelectedMonths[m.key]){
          if(!firstKey) firstKey=m.key;
          lastKey=m.key;
        }
      });
      var slug=function(k){ var parts=k.split("-"); return MONTH_ABBR[parseInt(parts[1],10)-1]+parts[0]; };
      var filename="Weekly-Duty-Ledger-"+(firstKey===lastKey? slug(firstKey) : slug(firstKey)+"-"+slug(lastKey))+".pdf";
      saveBlob(filename, blob);
      closeModal();
    }).catch(function(err){
      renderPdfModal({error:"Couldn't build the PDF. "+(err&&err.message?err.message:"Please try again.")});
    });
  }

  /* ================= GitHub Contents API sync (editable page only) ================= */

  function ghSettings(){
    try{
      return {
        owner: localStorage.getItem("ledger_gh_owner")||"",
        repo: localStorage.getItem("ledger_gh_repo")||"",
        branch: localStorage.getItem("ledger_gh_branch")||"main",
        token: localStorage.getItem("ledger_gh_token")||"",
        path: localStorage.getItem("ledger_gh_path")||"data.json"
      };
    }catch(e){ return {owner:"",repo:"",branch:"main",token:"",path:"data.json"}; }
  }

  function ghConfigured(){
    var s=ghSettings();
    return !!(s.owner && s.repo && s.token);
  }

  function b64EncodeUtf8(str){
    var bytes=new TextEncoder().encode(str);
    var binary="";
    for(var i=0;i<bytes.length;i++){ binary+=String.fromCharCode(bytes[i]); }
    return btoa(binary);
  }

  function ghApiUrl(s){
    return "https://api.github.com/repos/"+encodeURIComponent(s.owner)+"/"+encodeURIComponent(s.repo)+"/contents/"+s.path.split("/").map(encodeURIComponent).join("/");
  }

  function ghHeaders(s){
    return {"Authorization":"token "+s.token, "Accept":"application/vnd.github+json"};
  }

  function ghGetSha(s){
    var url=ghApiUrl(s)+"?ref="+encodeURIComponent(s.branch)+"&_="+Date.now();
    return fetch(url, {headers: ghHeaders(s), cache:"no-store"}).then(function(res){
      if(res.status===404) return null;
      if(!res.ok) return res.text().then(function(t){ var e=new Error("GitHub error "+res.status+": "+t.slice(0,200)); e.status=res.status; throw e; });
      return res.json().then(function(j){ return j.sha; });
    });
  }

  function ghPut(s, sha){
    var body={
      message:"Update duty ledger data — "+new Date().toISOString(),
      content:b64EncodeUtf8(JSON.stringify(state, null, 2)),
      branch:s.branch
    };
    if(sha) body.sha=sha;
    return fetch(ghApiUrl(s), {
      method:"PUT",
      headers:Object.assign({"Content-Type":"application/json"}, ghHeaders(s)),
      body:JSON.stringify(body)
    }).then(function(res){
      if(res.ok) return res.json();
      return res.text().then(function(t){ var e=new Error("GitHub error "+res.status+": "+t.slice(0,200)); e.status=res.status; throw e; });
    });
  }

  var syncState="idle", syncMsg="";
  function setSyncStatus(st, msg){
    syncState=st; syncMsg=msg||"";
    var el=document.getElementById("sync-status");
    if(el){
      el.textContent=syncStatusLabel();
      el.className="sync-status sync-"+syncState;
      el.title=syncMsg||"";
    }
  }
  function syncStatusLabel(){
    if(syncState==="unconfigured") return "Sync not set up";
    if(syncState==="syncing") return "Saving to GitHub…";
    if(syncState==="ok") return "Synced to GitHub";
    if(syncState==="error") return "Sync error · retry";
    return "";
  }

  var syncPending=false, syncQueued=false;
  function queueSync(){
    if(!canEdit) return;
    if(syncPending){ syncQueued=true; return; }
    syncPending=true;
    doSync(1).then(function(){
      syncPending=false;
      if(syncQueued){ syncQueued=false; queueSync(); }
    });
  }
  function delay(ms){
    return new Promise(function(resolve){ setTimeout(resolve, ms); });
  }

  function doSync(attempt){
    attempt = attempt||1;
    if(!ghConfigured()){
      setSyncStatus("unconfigured","Add your GitHub settings to enable sync");
      return Promise.resolve();
    }
    setSyncStatus("syncing","Saving…");
    var s=ghSettings();
    return ghGetSha(s).then(function(sha){
      return ghPut(s, sha);
    }).then(function(){
      setSyncStatus("ok","Saved to GitHub just now");
    }).catch(function(err){
      /* 409 = the sha we read is already stale (common right after a manual upload,
         or two saves landing close together) — back off briefly and re-read+retry */
      if(err && err.status===409 && attempt<5){
        return delay(400*attempt).then(function(){ return doSync(attempt+1); });
      }
      setSyncStatus("error", err && err.message ? err.message : "Sync failed");
    });
  }

  /* ---- settings modal ---- */
  function renderSettingsModal(opts){
    opts=opts||{};
    var root=document.getElementById("modal-root");
    if(!root) return;
    var s=ghSettings();
    var testMsg=opts.testMsg||"", testErr=opts.testErr||"", testing=!!opts.testing;
    root.innerHTML=
      '<div class="pdf-modal-overlay" id="gh-modal-overlay">'+
        '<div class="pdf-modal" role="dialog" aria-modal="true" aria-label="GitHub sync settings">'+
          '<h2>GitHub sync settings</h2>'+
          '<div class="sub">Edits save straight to your GitHub repo so your boss’s page updates automatically. These settings are stored only in this browser.</div>'+
          '<label class="gh-field"><span>Owner</span><input type="text" id="gh-owner" value="'+escapeHtml(s.owner)+'" placeholder="e.g. glenrai" autocomplete="off" spellcheck="false"></label>'+
          '<label class="gh-field"><span>Repository</span><input type="text" id="gh-repo" value="'+escapeHtml(s.repo)+'" placeholder="e.g. duty-ledger" autocomplete="off" spellcheck="false"></label>'+
          '<label class="gh-field"><span>Branch</span><input type="text" id="gh-branch" value="'+escapeHtml(s.branch)+'" placeholder="main" autocomplete="off" spellcheck="false"></label>'+
          '<label class="gh-field"><span>Data file path</span><input type="text" id="gh-path" value="'+escapeHtml(s.path)+'" placeholder="data.json" autocomplete="off" spellcheck="false"></label>'+
          '<label class="gh-field"><span>Personal access token</span><input type="password" id="gh-token" value="'+escapeHtml(s.token)+'" placeholder="paste token here" autocomplete="off" spellcheck="false"></label>'+
          (testErr? '<div class="pdf-error">'+escapeHtml(testErr)+'</div>' : '')+
          (testMsg? '<div class="pdf-progress">'+escapeHtml(testMsg)+'</div>' : '')+
          '<div class="pdf-modal-actions">'+
            '<button type="button" class="btn-secondary" id="gh-test"'+(testing?' disabled':'')+'>'+(testing?"Testing…":"Test connection")+'</button>'+
            '<button type="button" class="btn-secondary" id="gh-cancel">Close</button>'+
            '<button type="button" class="btn-primary" id="gh-save">Save</button>'+
          '</div>'+
        '</div>'+
      '</div>';

    var overlay=document.getElementById("gh-modal-overlay");
    if(overlay) overlay.addEventListener("mousedown", function(e){ if(e.target===overlay) closeModal(); });
    var cancelBtn=document.getElementById("gh-cancel");
    if(cancelBtn) cancelBtn.addEventListener("click", closeModal);
    var saveBtn=document.getElementById("gh-save");
    if(saveBtn) saveBtn.addEventListener("click", function(){
      saveGhSettings();
      closeModal();
      setSyncStatus("idle","");
      queueSync();
    });
    var testBtn=document.getElementById("gh-test");
    if(testBtn) testBtn.addEventListener("click", function(){
      saveGhSettings();
      renderSettingsModal({testing:true});
      testGhConnection().then(function(msg){
        renderSettingsModal({testMsg:msg});
      }).catch(function(err){
        renderSettingsModal({testErr: err && err.message ? err.message : "Connection failed"});
      });
    });
  }

  function saveGhSettings(){
    try{
      localStorage.setItem("ledger_gh_owner", document.getElementById("gh-owner").value.trim());
      localStorage.setItem("ledger_gh_repo", document.getElementById("gh-repo").value.trim());
      localStorage.setItem("ledger_gh_branch", document.getElementById("gh-branch").value.trim()||"main");
      localStorage.setItem("ledger_gh_path", document.getElementById("gh-path").value.trim()||"data.json");
      localStorage.setItem("ledger_gh_token", document.getElementById("gh-token").value.trim());
    }catch(e){}
  }

  function testGhConnection(){
    var s=ghSettings();
    if(!s.owner||!s.repo||!s.token) return Promise.reject(new Error("Fill in owner, repo, and token first."));
    return fetch(ghApiUrl(s)+"?ref="+encodeURIComponent(s.branch)+"&_="+Date.now(), {headers: ghHeaders(s), cache:"no-store"}).then(function(res){
      if(res.status===404) return "Connected — "+s.path+" doesn’t exist yet on "+s.branch+", it will be created on first save.";
      if(res.status===401) throw new Error("Authentication failed — check the token.");
      if(res.status===403) throw new Error("Forbidden — check the token has Contents read/write access to this repo.");
      if(!res.ok) throw new Error("GitHub error "+res.status);
      return "Connected — found "+s.path+" on "+s.branch+".";
    });
  }

  /* ================= render ================= */

  function render(){
    var currentMonthKey=monthKeyFor(currentWeekIso);
    var counts=tallyForMonth(currentMonthKey);
    var cells=getEffectiveCells(currentWeekIso);
    var weekIdx=WEEK_STARTS.indexOf(currentWeekIso);
    var monthHeadTarget=DEPT_HEAD_TARGET*weeksInMonth(currentMonthKey);

    function tile(catKey, opts){
      opts=opts||{};
      var c=CAT_BY_KEY[catKey];
      var n=counts[catKey]||0;
      var hrs=(n*HRS_PER_PERIOD);
      var hrsText=(hrs%1===0? hrs : hrs.toFixed(2)).toString().replace(/\.00$/,"")+"h";
      var ofText=opts.target? ' <span class="of">/ '+opts.target+'</span>' : "";
      var bar=opts.target? '<div class="tile-bar"><div class="tile-bar-fill" style="width:'+Math.min(100,Math.round(n/opts.target*100))+'%;background:var('+c.bg+');"></div></div>' : "";
      return '<div class="tile'+(opts.target && n>=opts.target?' hit':'')+'">'+
        '<div class="tile-label"><span class="tile-swatch" style="background:var('+c.bg+')"></span>'+escapeHtml(c.label)+'</div>'+
        '<div class="tile-num mono">'+n+ofText+'</div>'+
        '<div class="tile-hrs">'+hrsText+' this month</div>'+
        bar+
      '</div>';
    }

    var tallyCaptionHtml='<div class="tally-caption">Monthly totals · '+monthLabelFor(currentWeekIso)+'</div>';

    var tallyHtml='<div class="tally">'+
      tile("head",{target:monthHeadTarget})+
      tile("prep")+
      tile("grading")+
      tile("admin")+
      tile("teaching")+
      tile("free")+
      tile("off")+
    '</div>';

    var legendHtml='<div class="legend">'+CATS.map(function(c){
      return '<span class="legend-item"><span class="legend-swatch" style="background:var('+c.bg+')"></span>'+escapeHtml(c.label)+'</span>';
    }).join("")+'</div>';

    var theadHtml='<thead><tr><th class="daycol-head">Day</th>'+
      PERIODS.map(function(p){
        return '<th><div class="p-idx">P'+p.i+'</div><div class="p-time">'+p.start+'–'+p.end+'</div></th>';
      }).join("")+'</tr></thead>';

    var weekStartEpoch=epochFromIso(currentWeekIso);
    var rowsHtml=DAYS.map(function(d,di){
      var dayDate=fromEpoch(weekStartEpoch+di);
      var dayDateText=MONTH_ABBR[dayDate.m]+" "+dayDate.d;
      var dayOff=isDayOff(cells, d.k);
      var cellsHtml=PERIODS.map(function(p){
        var key=d.k+"-"+p.i;
        var cell=cells[key]||{cat:"free",label:""};
        var cat=CAT_BY_KEY[cell.cat]||CAT_BY_KEY.free;
        /* a day marked off shows as a plain gray bar — no repeated "Off" label or empty details box in every period */
        var selectTextColor = cat.key==="off" ? 'var('+cat.bg+')' : 'var('+cat.ink+')';
        var selectHtml='<select class="cell-select" data-key="'+key+'" data-cat="'+cat.key+'" '+
          'style="background:var('+cat.bg+');color:'+selectTextColor+';" '+(canEdit?'':'disabled')+'>'+
          CATS.map(function(c){ return '<option value="'+c.key+'"'+(c.key===cat.key?' selected':'')+'>'+escapeHtml(c.short)+'</option>'; }).join("")+
        '</select>';
        var labelHtml = (cat.key!=="free" && cat.key!=="off") ?
          '<textarea class="cell-label" rows="5" data-key="'+key+'" placeholder="details" '+(canEdit?'':'disabled')+'>'+escapeHtml(cell.label)+'</textarea>' : "";
        return '<td class="pcell">'+selectHtml+labelHtml+'</td>';
      }).join("");
      var offBtnHtml='<input type="checkbox" class="day-off-checkbox" data-day="'+d.k+'" '+(dayOff?' checked':'')+' '+(canEdit?'':'disabled')+' title="'+(dayOff?'Restore this day':'Mark this day off / vacation')+'" aria-label="Mark '+escapeHtml(d.label)+' off">';
      return '<tr><td class="daycol"><div class="daycol-top"><span class="day-name">'+d.label+'</span>'+offBtnHtml+'</div><div class="day-date">'+dayDateText+'</div></td>'+cellsHtml+'</tr>';
    }).join("");

    var gridHtml='<div class="grid-wrap"><table class="week">'+theadHtml+'<tbody>'+rowsHtml+'</tbody></table></div>';

    var topRightControls;
    if(canEdit){
      topRightControls=
        '<span class="sync-status sync-'+syncState+'" id="sync-status" title="'+escapeHtml(syncMsg)+'">'+syncStatusLabel()+'</span> '+
        '<button class="btn-secondary" id="btn-gh-settings" title="GitHub sync settings">⚙ Sync settings</button> ';
    } else {
      topRightControls='<div class="status-pill">View only</div>';
    }

    var weekNavHtml='<div class="week-nav">'+
      '<button class="navbtn" id="btn-prev-week" aria-label="Previous week"'+(weekIdx<=0?' disabled':'')+'>‹</button>'+
      '<span class="week-label">Week of '+formatWeekRange(currentWeekIso)+'</span>'+
      '<button class="navbtn" id="btn-next-week" aria-label="Next week"'+(weekIdx>=WEEK_STARTS.length-1?' disabled':'')+'>›</button>'+
      '<select class="week-jump" id="week-jump">'+
        WEEK_STARTS.map(function(w,i){ return '<option value="'+w+'"'+(w===currentWeekIso?' selected':'')+'>Week '+(i+1)+' · '+formatWeekRange(w)+'</option>'; }).join("")+
      '</select>'+
      '<button class="btn-today" id="btn-this-week">This week</button>'+
      '<span class="week-count">Week '+(weekIdx+1)+' of '+WEEK_STARTS.length+'</span>'+
    '</div>';

    document.getElementById("app").innerHTML=
      '<div class="topbar">'+
        '<div>'+
          '<span class="eyebrow">Glen Rai · Head of English · IST Tallinn</span>'+
          '<h1>Weekly Duty Ledger</h1>'+
          '<div class="sub">Your teaching timetable plus every non-teaching hour — log prep, grading, admin and department-head time against your free periods.</div>'+
          '<div class="year-range">Sept 2026 – June 2027</div>'+
        '</div>'+
        '<div>'+topRightControls+'<button class="btn-export" id="btn-export-pdf">⬇ Download PDF</button> '+weekNavHtml+'<div class="updated mono">'+fmtUpdated(state.updatedAt)+'</div></div>'+
      '</div>'+
      tallyCaptionHtml+
      tallyHtml+
      legendHtml+
      gridHtml;

    var printEl=document.getElementById("print-view");
    if(printEl) printEl.innerHTML=buildPrintView();

    wireEvents();
  }

  function wireEvents(){
    var app=document.getElementById("app");
    var selects=app.querySelectorAll(".cell-select");
    for(var i=0;i<selects.length;i++){
      selects[i].addEventListener("change", function(e){
        var key=e.target.getAttribute("data-key");
        var writable=ensureWeekWritable(currentWeekIso);
        var prev=writable[key]||{cat:"free",label:""};
        var newCat=e.target.value;
        writable[key]={cat:newCat, label:(newCat==="free"?"":prev.label)};
        persist();
      });
    }
    var labels=app.querySelectorAll(".cell-label");
    for(var j=0;j<labels.length;j++){
      labels[j].addEventListener("blur", function(e){
        var key=e.target.getAttribute("data-key");
        var writable=ensureWeekWritable(currentWeekIso);
        if(!writable[key]) return;
        writable[key].label=e.target.value;
        persist();
      });
    }

    var offBoxes=app.querySelectorAll(".day-off-checkbox");
    for(var k=0;k<offBoxes.length;k++){
      offBoxes[k].addEventListener("change", function(e){
        var dayKey=e.currentTarget.getAttribute("data-day");
        toggleDayOff(currentWeekIso, dayKey);
        persist();
      });
    }

    var prevBtn=document.getElementById("btn-prev-week");
    if(prevBtn) prevBtn.addEventListener("click", function(){
      var idx=WEEK_STARTS.indexOf(currentWeekIso);
      if(idx>0){ currentWeekIso=WEEK_STARTS[idx-1]; render(); }
    });
    var nextBtn=document.getElementById("btn-next-week");
    if(nextBtn) nextBtn.addEventListener("click", function(){
      var idx=WEEK_STARTS.indexOf(currentWeekIso);
      if(idx<WEEK_STARTS.length-1){ currentWeekIso=WEEK_STARTS[idx+1]; render(); }
    });
    var jump=document.getElementById("week-jump");
    if(jump) jump.addEventListener("change", function(e){
      currentWeekIso=e.target.value; render();
    });
    var todayBtn=document.getElementById("btn-this-week");
    if(todayBtn) todayBtn.addEventListener("click", function(){
      currentWeekIso=computeDefaultWeek(); render();
    });
    var exportBtn=document.getElementById("btn-export-pdf");
    if(exportBtn) exportBtn.addEventListener("click", function(){
      openPdfModal();
    });
    var settingsBtn=document.getElementById("btn-gh-settings");
    if(settingsBtn) settingsBtn.addEventListener("click", function(){
      renderSettingsModal();
    });
    var syncPill=document.getElementById("sync-status");
    if(syncPill) syncPill.addEventListener("click", function(){
      if(syncState==="error") queueSync();
    });
  }

  /* re-renders without losing where the user was scrolled to — a plain render()
     rebuilds the whole grid, which otherwise snaps the view back to Monday/period 0 */
  function renderPreservingScroll(){
    var gridWrap=document.querySelector(".grid-wrap");
    var scrollLeft=gridWrap? gridWrap.scrollLeft : 0;
    var winX=window.scrollX, winY=window.scrollY;
    render();
    var newGridWrap=document.querySelector(".grid-wrap");
    if(newGridWrap) newGridWrap.scrollLeft=scrollLeft;
    window.scrollTo(winX, winY);
  }

  function persist(){
    state.updatedAt=new Date().toISOString();
    state.lastWeekIso=currentWeekIso;
    renderPreservingScroll();
    queueSync();
  }

  /* ================= data loading ================= */

  function loadData(isRefresh){
    var url=DATA_URL+(DATA_URL.indexOf("?")===-1?"?":"&")+"t="+Date.now();
    return fetch(url, {cache:"no-store"}).then(function(res){
      if(!res.ok) throw new Error("HTTP "+res.status);
      return res.json();
    }).then(function(json){
      state=(json && json.weeks) ? json : defaultState();
      if(!isRefresh){
        currentWeekIso=(state.lastWeekIso && WEEK_STARTS.indexOf(state.lastWeekIso)!==-1) ? state.lastWeekIso : computeDefaultWeek();
      }
    }).catch(function(){
      if(!isRefresh){
        state=defaultState();
        currentWeekIso=computeDefaultWeek();
      }
    }).then(function(){
      render();
      if(canEdit){ setSyncStatus(ghConfigured()?"idle":"unconfigured",""); }
    });
  }

  loadData(false);

  /* view-only page: periodically re-fetch so it stays current without a manual reload */
  if(!canEdit){
    setInterval(function(){ loadData(true); }, 45000);
  }

})();
