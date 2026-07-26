/* ═══════════════════════════════════════════════════════════════════════════
   ANITA BISTROT — progressive enhancement
   Nessuna dipendenza. Se il JS è disattivato, il sito resta pienamente usabile:
   menu, telefono e orari (pagina Contatti) sono già HTML statico.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  // Legge gli orari iniettati dal build in <script id="anita-hours">.
  var hoursEl = document.getElementById("anita-hours");
  var HOURS = null;
  try { HOURS = hoursEl ? JSON.parse(hoursEl.textContent) : null; } catch (e) { HOURS = null; }

  // ── Utility ────────────────────────────────────────────────────────────────
  function toMin(hhmm) {
    if (hhmm === "24:00") return 1440;
    var p = hhmm.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }
  function fmt(min) {
    var m = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), mm = m % 60;
    return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm;
  }

  // Ora corrente nel fuso di Roma, indipendente dal fuso del dispositivo.
  function nowInRome() {
    var tz = (HOURS && HOURS.timezone) || "Europe/Rome";
    var parts;
    try {
      parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
      }).formatToParts(new Date());
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var wd = 0, hh = 0, mm = 0;
    parts.forEach(function (p) {
      if (p.type === "weekday") wd = map[p.value] != null ? map[p.value] : 0;
      else if (p.type === "hour") hh = parseInt(p.value, 10) % 24;
      else if (p.type === "minute") mm = parseInt(p.value, 10);
    });
    return { day: wd, min: hh * 60 + mm };
  }

  // Calcola lo stato di apertura corrente.
  // Ritorna { open:bool, closeMin?:int, openMin?:int, openDay?:int }
  function computeStatus() {
    if (!HOURS || !HOURS.schedule) return null;
    var sched = HOURS.schedule;
    var now = nowInRome();
    var today = sched[now.day] || [];
    var yest = sched[(now.day + 6) % 7] || [];

    // 1) Finestra di IERI che sfora oltre mezzanotte fino a oggi.
    for (var i = 0; i < yest.length; i++) {
      if (yest[i].overnight) {
        var c = toMin(yest[i].close);       // es. 02:00 = 120, valido stamattina
        if (now.min < c) return { open: true, closeMin: c };
      }
    }
    // 2) Finestre di OGGI.
    for (var j = 0; j < today.length; j++) {
      var o = toMin(today[j].open);
      var cl = today[j].overnight ? toMin(today[j].close) + 1440 : toMin(today[j].close);
      if (now.min >= o && now.min < cl) return { open: true, closeMin: cl };
    }
    // 3) Chiuso: trova la prossima apertura (oggi o nei giorni successivi).
    for (var d = 0; d < 7; d++) {
      var day = (now.day + d) % 7;
      var wins = sched[day] || [];
      for (var k = 0; k < wins.length; k++) {
        var om = toMin(wins[k].open);
        if (d === 0 && om <= now.min) continue; // già passata oggi
        return { open: false, openMin: om, openDay: day };
      }
    }
    return { open: false };
  }

  // ── Pill "Aperto ora" ────────────────────────────────────────────────────
  function renderPills() {
    var st = computeStatus();
    var pills = document.querySelectorAll("[data-livepill]");
    if (!pills.length) return;
    pills.forEach(function (el) {
      el.classList.remove("is-open", "is-closed");
      var dot = '<span class="dot" aria-hidden="true"></span>';
      var label;
      if (!st) { label = "Vedi orari di apertura"; }
      else if (st.open) {
        el.classList.add("is-open");
        label = "Aperto ora" + (st.closeMin != null ? " · chiude alle " + fmt(st.closeMin) : "");
      } else {
        el.classList.add("is-closed");
        var when = "";
        if (st.openMin != null) {
          var now = nowInRome();
          var dayTxt = (st.openDay != null && st.openDay !== now.day && HOURS.dayNames)
            ? HOURS.dayNames[st.openDay].toLowerCase() + " "
            : "";
          when = " · apre " + dayTxt + "alle " + fmt(st.openMin);
        }
        label = "Chiuso" + when;
      }
      el.innerHTML = dot + "<span>" + label + "</span>";
    });
  }

  // ── Evidenzia il giorno corrente nella tabella orari ───────────────────────
  function markToday() {
    var rows = document.querySelectorAll("[data-day]");
    if (!rows.length) return;
    var today = nowInRome().day;
    rows.forEach(function (r) {
      if (parseInt(r.getAttribute("data-day"), 10) === today) r.setAttribute("data-today", "");
      else r.removeAttribute("data-today");
    });
  }

  // ── Tab menu: stato attivo mentre si scorre ───────────────────────────────
  function menuTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".menutabs a"));
    if (!tabs.length || !("IntersectionObserver" in window)) return;
    var byId = {};
    tabs.forEach(function (t) { byId[t.getAttribute("href").slice(1)] = t; });

    function setActive(id) {
      tabs.forEach(function (t) { t.classList.remove("is-active"); });
      if (byId[id]) {
        byId[id].classList.add("is-active");
        // porta la tab attiva in vista nella barra orizzontale
        byId[id].scrollIntoView({ inline: "center", block: "nearest" });
      }
    }

    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
      });
      var best = null, bestR = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > bestR) { bestR = visible[id]; best = id; }
      });
      if (best) setActive(best);
    }, { rootMargin: "-140px 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] });

    document.querySelectorAll(".msec[id]").forEach(function (s) { io.observe(s); });
  }

  // ── Avvio ──────────────────────────────────────────────────────────────────
  function init() {
    renderPills();
    markToday();
    menuTabs();
    // aggiorna la pill ogni minuto
    setInterval(function () { renderPills(); markToday(); }, 60000);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
