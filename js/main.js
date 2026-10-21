// Builds the page from config.js, then starts everything else.

(function(){
var DW = window.DW;
var C = DW.config;

DW.reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

function make(tag, cls, text){
  var e = document.createElement(tag);
  if (cls) { e.className = cls; }
  if (text !== undefined) { e.textContent = text; }
  return e;
}

// only allow normal links
function safe(u){
  return /^(https?:|mailto:|\.{0,2}\/|#)/i.test(String(u));
}

// the name, one letter at a time, so each letter can move on its own
function name(){
  var h = document.getElementById('name');
  h.textContent = '';
  h.setAttribute('aria-label', C.name);
  document.title = C.name;
  for (var i = 0; i < C.name.length; i++) {
    var ch = make('span', 'ch');
    ch.setAttribute('aria-hidden', 'true');
    ch._i = i;
    ch.style.setProperty('--i', i);
    ch.appendChild(make('i', '', C.name[i] == ' ' ? ' ' : C.name[i]));
    h.appendChild(ch);
  }
  var cap = document.getElementById('caption');
  for (var j = 0; j < C.caption.length; j++) { cap.appendChild(make('li', '', C.caption[j])); }
}

function sections(){
  var host = document.getElementById('sections');
  for (var i = 0; i < C.sections.length; i++) {
    var s = C.sections[i];
    var sec = make('section', 'sec');
    var head = make('header', 'sec-head');
    head.appendChild(make('span', 'tiny', (i < 9 ? '0' : '') + (i + 1)));
    head.appendChild(make('h2', '', s.title));
    sec.appendChild(head);

    var body = make('div', 'sec-body');
    if (s.text) {
      for (var a = 0; a < s.text.length; a++) { body.appendChild(make('p', '', s.text[a])); }
    }
    if (s.list) {
      var ul = make('ul', 'lst');
      for (var b = 0; b < s.list.length; b++) { ul.appendChild(make('li', '', s.list[b])); }
      body.appendChild(ul);
    }
    if (s.rows) {
      var dl = make('dl', 'rows');
      for (var c = 0; c < s.rows.length; c++) {
        dl.appendChild(make('dt', 'tiny', s.rows[c][0]));
        dl.appendChild(make('dd', '', s.rows[c][1]));
      }
      body.appendChild(dl);
    }
    sec.appendChild(body);
    host.appendChild(sec);
  }
}

function foot(){
  var ul = document.getElementById('links');
  for (var i = 0; i < C.links.length; i++) {
    if (!safe(C.links[i][1])) { continue; }
    var li = make('li');
    var a = make('a', '', C.links[i][0]);
    a.href = C.links[i][1];
    a.rel = 'noopener';
    var ic = make('img');
    ic.alt = '';
    ic.src = C.assets.icons.arrow;
    a.appendChild(ic);
    li.appendChild(a);
    ul.appendChild(li);
  }
  document.getElementById('footer-text').textContent = C.footer;
}

// sections come out of the dark as you reach them
function reveal(){
  var items = document.querySelectorAll('.sec, #foot');
  if (!('IntersectionObserver' in window) || DW.reduce) {
    for (var i = 0; i < items.length; i++) { items[i].classList.add('in'); }
    return;
  }
  var io = new IntersectionObserver(function(list){
    for (var i = 0; i < list.length; i++) {
      if (list[i].isIntersecting) {
        list[i].target.classList.add('in');
        io.unobserve(list[i].target);
      }
    }
  }, { threshold: 0.12 });
  for (var j = 0; j < items.length; j++) { io.observe(items[j]); }
}

function start(){
  document.getElementById('favicon').href = C.assets.favicon;
  document.documentElement.style.setProperty('--grain', "url('" + C.assets.grain + "')");
  name();
  sections();
  foot();
  DW.redact.run();    // swaps every marker on the page for a bar
  DW.alive.init();    // words, light, music reaction
  DW.redact.watch();  // and anything added later
  DW.player.init();
  reveal();
}

if (document.readyState == 'loading') { document.addEventListener('DOMContentLoaded', start); }
else { start(); }
})();
