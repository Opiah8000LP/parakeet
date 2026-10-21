// Makes the page alive. One loop, one idea:
//
//   the page is dark and your cursor is the only light.
//   the music moves through the words themselves. every word listens to one slice of
//   the sound, left side = low notes, right side = high notes, so the text is a
//   spectrum analyser you can read. the redaction bars are the loudest part: each
//   hidden character is a tiny meter. the secrets vibrate but never show anything.
//
// when nothing plays the light still breathes slowly and drifts when you stop moving.

(function(){
var DW = window.DW;
var A = {};
DW.alive = A;

var root = document.documentElement;
var items = [];  // every word, redaction cell and name letter, with where it sits
var W = 0;
var H = 0;
var count = 0;  // letters in the name
var lx = 0;  // where the light is
var ly = 0;
var tx = 0;  // where it wants to be
var ty = 0;
var lastMove = 0;
var side, clock;

function pad(n, len){
  n = String(n);
  while (n.length < len) { n = '0' + n; }
  return n;
}

// wraps every word in a span so it can be lit on its own
function words(box){
  var walker = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
  var list = [];
  while (walker.nextNode()) { list.push(walker.currentNode); }
  for (var i = 0; i < list.length; i++) {
    var node = list[i];
    if (!node.nodeValue.trim()) { continue; }
    var parts = node.nodeValue.split(/(\s+)/);
    var frag = document.createDocumentFragment();
    for (var j = 0; j < parts.length; j++) {
      if (!parts[j]) { continue; }
      if (/^\s+$/.test(parts[j])) {
        frag.appendChild(document.createTextNode(parts[j]));
      } else {
        var w = document.createElement('span');
        w.className = 'w';
        w.textContent = parts[j];
        frag.appendChild(w);
      }
    }
    node.parentNode.replaceChild(frag, node);
  }
}

// remembers where everything is. runs again when the window changes
function measure(){
  W = innerWidth;
  H = innerHeight;
  var sy = window.pageYOffset;
  var list = document.querySelectorAll('.w, .redacted i, .ch');
  items = [];
  count = 0;
  for (var i = 0; i < list.length; i++) {
    var e = list[i];
    var r = e.getBoundingClientRect();
    var type = 0;
    if (e.classList.contains('ch')) { type = 2; count++; }
    else if (e.parentNode.classList.contains('redacted')) { type = 1; }
    var x = r.left + r.width / 2;
    if (type == 2) { x -= e._dx || 0; }  // the name letters are moved by the music
    // which slice of the sound this one listens to: far left = bass, far right = treble
    var f = Math.max(0, Math.min(1, (x / W - 0.08) / 0.84));
    items.push({
      el: e, type: type, x: x, y: r.top + sy + r.height / 2,
      k: Math.min(39, Math.floor(f * 40)), i: e._i || 0, v: -1
    });
  }
}

function frame(now){
  requestAnimationFrame(frame);
  DW.player.read();
  var spec = DW.spec;
  var level = DW.level;

  // the light follows you slowly. if you stop for a while it wanders by itself
  if (now - lastMove > 6000) {
    tx = W * (0.5 + 0.3 * Math.sin(now * 0.00021));
    ty = H * (0.5 + 0.28 * Math.sin(now * 0.00033 + 1.3));
  }
  lx += (tx - lx) * 0.05;
  ly += (ty - ly) * 0.05;

  var breath = 0.5 + 0.5 * Math.sin(now * 0.0007);  // about one breath every nine seconds
  var R = 150 + 90 * breath + 220 * level;  // the bass opens the light
  root.style.setProperty('--lvl', level.toFixed(3));

  var sy = window.pageYOffset;
  var py = ly + sy;
  var spread = 2 + 4 * breath + 30 * level;  // the name opens up on the bass
  var mid = (count - 1) / 2;
  var top = sy - 200;
  var bottom = sy + H + 200;

  for (var n = 0; n < items.length; n++) {
    var it = items[n];
    if (it.y < top || it.y > bottom) { continue; }
    var dx = it.x - lx;
    var dy = it.y - py;
    var t = 1 - Math.sqrt(dx * dx + dy * dy) / R;
    if (t < 0) { t = 0; }
    t = t * t * (3 - 2 * t);
    var e = spec[it.k];
    var v;
    if (it.type == 0) { v = 0.5 + 0.5 * t + 0.3 * e; }  // words
    else if (it.type == 1) { v = e * 0.34 + t * 0.1; }  // redaction cells. grey, never white
    else { v = 0.8 + 0.2 * t + 0.2 * e; }  // name letters
    if (v > 1) { v = 1; }
    v = Math.round(v * 100) / 100;
    if (v !== it.v) {
      it.v = v;
      it.el.style.opacity = v;
    }
    if (it.type == 2) {
      var d = (it.i - mid) * spread;
      it.el.style.transform = 'translateX(' + d.toFixed(1) + 'px)';
      it.el._dx = d;
    }
  }
}

function aim(x, y){
  tx = x;
  ty = y;
  lastMove = performance.now();
}

// small readouts in the corners
function readouts(){
  var visits = 1;
  try {
    visits = (parseInt(localStorage.getItem('dw-bio-visits'), 10) || 0) + 1;
    localStorage.setItem('dw-bio-visits', visits);
  } catch(e) {}
  document.getElementById('c-tl').textContent = DW.config.name + ' // BIO // VISIT ' + pad(visits, 3);

  var zone = '';
  try { zone = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace(/_/g, ' ').toUpperCase(); } catch(e) {}
  clock = document.getElementById('c-tr');
  function tick(){ clock.textContent = new Date().toTimeString().slice(0, 8) + ' ' + zone; }
  tick();
  setInterval(tick, 1000);

  side = document.getElementById('side');
  function scrolled(){
    var max = document.documentElement.scrollHeight - innerHeight;
    var pct = max > 0 ? Math.round(window.pageYOffset / max * 100) : 0;
    side.textContent = 'SCROLL ' + pad(pct, 3);
  }
  addEventListener('scroll', scrolled, { passive: true });
  scrolled();
}

A.init = function(){
  words(document.getElementById('sections'));
  words(document.getElementById('caption'));
  readouts();
  measure();

  var timer = 0;
  addEventListener('resize', function(){
    clearTimeout(timer);
    timer = setTimeout(measure, 150);
  });
  addEventListener('load', measure);
  setTimeout(measure, 1500);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(measure); }

  // clicking a redaction says no
  document.addEventListener('click', function(e){
    var b = e.target.closest ? e.target.closest('.redacted') : null;
    if (!b) { return; }
    b.classList.remove('deny');
    void b.offsetWidth;
    b.classList.add('deny');
    clearTimeout(b._t);
    b._t = setTimeout(function(){ b.classList.remove('deny'); }, 1200);
  });

  // leave the tab and the page calls you back
  var title = document.title;
  document.addEventListener('visibilitychange', function(){
    document.title = document.hidden ? 'COME BACK.' : title;
  });

  // reduced motion: no light, no loop. everything just sits readable
  if (DW.reduce) {
    root.classList.add('still');
    return;
  }

  lx = tx = W / 2;
  ly = ty = H / 2;
  lastMove = performance.now();
  addEventListener('pointermove', function(e){ aim(e.clientX, e.clientY); }, { passive: true });
  addEventListener('touchmove', function(e){
    var t = e.touches[0];
    if (t) { aim(t.clientX, t.clientY); }
  }, { passive: true });
  requestAnimationFrame(frame);
};
})();
