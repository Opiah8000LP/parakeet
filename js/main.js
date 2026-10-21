// Builds the page from config.js, then starts the redaction and the player.

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

function sections(){
  var host = document.getElementById('sections');
  for (var i = 0; i < C.sections.length; i++) {
    var s = C.sections[i];
    var sec = make('section', 'sec');
    sec.id = s.id;
    var head = make('header', 'sec-head');
    head.appendChild(make('span', 'tiny num', (i < 9 ? '0' : '') + (i + 1)));
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

function hero(){
  document.getElementById('name').textContent = C.name;
  document.title = C.name;
  var cap = document.getElementById('caption');
  for (var i = 0; i < C.caption.length; i++) { cap.appendChild(make('li', '', C.caption[i])); }
  if (C.assets.portrait) {
    var img = make('img', 'portrait');
    img.alt = '';
    img.src = C.assets.portrait;
    document.getElementById('hero').appendChild(img);
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

// reveals sections as they scroll in. fades only, nothing moves
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
  }, { threshold: 0.15 });
  for (var j = 0; j < items.length; j++) { io.observe(items[j]); }
}

function start(){
  document.getElementById('favicon').href = C.assets.favicon;
  document.documentElement.style.setProperty('--grain', "url('" + C.assets.grain + "')");
  hero();
  sections();
  foot();
  DW.redact.run();    // swaps every marker on the page
  DW.redact.watch();  // and anything added later
  DW.player.init();
  reveal();
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); }
else { start(); }
})();
