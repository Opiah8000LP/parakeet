// Music player: a small card you can drag anywhere. No UI sounds, only your tracks.
// Type '1.mp3' in config.js and it hunts for the file in the folders listed there,
// then looks next to it for 1.png / 1.jpg / 1.webp as the cover.
// It also measures the music (DW.spec, DW.level) so alive.js can make the page react.

(function(){
window.DW = window.DW || {};
var P = {};
DW.player = P;

var cfg = DW.config.player;
var icons = DW.config.assets.icons;
var el = new Audio();
el.preload = 'metadata';

var tracks = [];
var idx = 0;
var job = 0;  // goes up with every track change, so old searches know theyre out of date
var found = null;  // the folder that worked last, tried first next time
var seeking = false;
var ctx, analyser, raw;
var peak = 0.2;  // loudest recent value, so quiet songs still move the page
var ui = {};
var card, handle;
var BANDS = 40;
var ranges = [];
var now = [];

P.el = el;
P.playing = false;
DW.level = 0;
DW.spec = [];
for (var s = 0; s < BANDS; s++) { DW.spec.push(0); now.push(0); }

function $(id){ return document.getElementById(id); }

function fmt(s){
  if (!isFinite(s)) { s = 0; }
  s = Math.floor(s);
  var m = Math.floor(s / 60);
  var r = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
}

function pad(n){ return (n < 10 ? '0' : '') + n; }

function icon(btn, name){
  btn.querySelector('img').src = icons[name];
}

/* the track list */

function clean(){
  var list = cfg.tracks || [];
  for (var i = 0; i < list.length; i++) {
    var t = list[i];
    if (typeof t == 'string') { t = { file: t }; }
    var file = String(t.file);
    var name = file.split('/').pop().replace(/\.[^.]+$/, '');
    tracks.push({ file: file, title: t.title || name, artist: t.artist || '' });
  }
}

// every place the file could be, best guess first
function where(file){
  if (file.indexOf('/') >= 0) { return [file]; }
  var out = [];
  if (found !== null) { out.push(found + file); }
  for (var i = 0; i < cfg.folders.length; i++) {
    if (cfg.folders[i] !== found) { out.push(cfg.folders[i] + file); }
  }
  return out;
}

/* loading */

function open(i, play){
  if (!tracks.length) { return; }
  idx = (i + tracks.length) % tracks.length;
  var t = tracks[idx];
  var my = ++job;
  var list = where(t.file);
  var n = 0;

  ui.title.textContent = t.title;
  ui.artist.textContent = t.artist;
  ui.seek.value = 0;
  ui.time.textContent = '00:00 / 00:00';
  cover('');
  mark();

  // try the next place until one works
  function next(){
    if (my !== job) { return; }
    if (n >= list.length) {
      ui.title.textContent = 'NOT FOUND: ' + t.file;
      return;
    }
    el.src = list[n];
    n++;
    if (play) { start(); }
  }
  el.onerror = next;
  el.onloadedmetadata = function(){
    if (my !== job) { return; }
    el.onerror = null;
    var path = list[n - 1];
    found = path.slice(0, path.length - t.file.length);
    findCover(path, my);
  };
  next();
}

// looks for the cover next to the song, same name, one type at a time
function findCover(path, my){
  var base = path.replace(/\.[^.\/]+$/, '');
  var types = cfg.coverTypes;
  var n = 0;
  function next(){
    if (my !== job) { return; }
    if (n >= types.length) { cover(''); return; }
    var url = base + '.' + types[n];
    n++;
    var img = new Image();
    img.onload = function(){ if (my === job) { cover(url); } };
    img.onerror = next;
    img.src = url;
  }
  next();
}

// shows the cover in the player and faintly behind the name
function cover(url){
  var back = $('back');
  if (url) {
    ui.cover.src = url;
    $('back-img').src = url;
  }
  ui.cover.hidden = !url;
  ui.empty.hidden = !!url;
  back.classList.toggle('on', !!url);
}

function mark(){
  var rows = ui.list.children;
  for (var i = 0; i < rows.length; i++) {
    rows[i].classList.toggle('on', i === idx);
  }
  ui.label.textContent = tracks.length ? pad(idx + 1) + ' / ' + pad(tracks.length) : 'PLAYER';
  ui.empty.textContent = pad(idx + 1);
}

/* measuring the music */

function listen(){
  if (ctx) { return; }
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.7;
    ctx.createMediaElementSource(el).connect(analyser);
    analyser.connect(ctx.destination);
    raw = new Uint8Array(analyser.frequencyBinCount);
    // 40 bands from low to high, spaced like hearing is
    for (var k = 0; k < BANDS; k++) {
      var lo = Math.floor(Math.pow(256, k / BANDS));
      var hi = Math.max(lo, Math.floor(Math.pow(256, (k + 1) / BANDS)) - 1);
      ranges.push([lo, hi]);
    }
  } catch(e) {
    analyser = null;
  }
}

// called every frame by alive.js. fills DW.spec (40 bands, 0 to 1) and DW.level (bass)
P.read = function(){
  var spec = DW.spec;
  var live = analyser && P.playing;
  var top = 0;
  var k;
  if (live) {
    analyser.getByteFrequencyData(raw);
    for (k = 0; k < BANDS; k++) {
      var sum = 0;
      for (var b = ranges[k][0]; b <= ranges[k][1]; b++) { sum += raw[b]; }
      now[k] = sum / (ranges[k][1] - ranges[k][0] + 1) / 255;
      if (now[k] > top) { top = now[k]; }
    }
    peak = Math.max(peak * 0.9995, top, 0.05);
  }
  // opened from a file instead of a server: the browser hides the sound, so fake a slow breath
  var blocked = P.playing && location.protocol == 'file:';
  for (k = 0; k < BANDS; k++) {
    var goal = 0;
    if (live) { goal = Math.min(1, Math.pow(now[k] / peak, 1.5)); }
    else if (blocked) { goal = 0.3 + 0.25 * Math.sin(Date.now() / 1400 + k * 0.5); }
    spec[k] += (goal - spec[k]) * (goal > spec[k] ? 0.14 : 0.035);
  }
  var bass = 0;
  for (k = 0; k < 5; k++) { bass += spec[k]; }
  DW.level = bass / 5;
};

/* controls */

function start(){
  listen();
  if (ctx && ctx.state == 'suspended') { ctx.resume(); }
  var p = el.play();
  if (p && p.catch) { p.catch(function(){}); }
}

P.play = function(){
  if (!tracks.length) { return; }
  if (!el.src) { open(idx, true); return; }
  start();
};
P.pause = function(){ el.pause(); };
P.toggle = function(){ if (el.paused) { P.play(); } else { P.pause(); } };
P.next = function(){ open(idx + 1, !el.paused); };
P.prev = function(){
  if (el.currentTime > 3) { el.currentTime = 0; return; }
  open(idx - 1, !el.paused);
};

function volume(v){
  v = Math.max(0, Math.min(1, v));
  el.volume = v;
  ui.vol.value = Math.round(v * 100);
  icon(ui.mute, v === 0 ? 'mute' : 'volume');
}

/* dragging. the top bar moves the whole card */

function place(x, y){
  x = Math.max(0, Math.min(innerWidth - card.offsetWidth, x));
  y = Math.max(0, Math.min(innerHeight - card.offsetHeight, y));
  card.style.left = x + 'px';
  card.style.top = y + 'px';
}

function save(){
  try { localStorage.setItem('dw-bio-pos', JSON.stringify([card.offsetLeft, card.offsetTop])); } catch(e) {}
}

function drag(){
  var ox = 0;
  var oy = 0;
  var on = false;
  handle.addEventListener('pointerdown', function(e){
    if (e.target.closest('button')) { return; }
    e.preventDefault();  // stops the browser starting its own drag
    on = true;
    ox = e.clientX - card.offsetLeft;
    oy = e.clientY - card.offsetTop;
    handle.setPointerCapture(e.pointerId);
    card.classList.add('held');
  });
  handle.addEventListener('pointermove', function(e){
    if (on) { place(e.clientX - ox, e.clientY - oy); }
  });
  function up(){
    if (!on) { return; }
    on = false;
    card.classList.remove('held');
    save();
  }
  handle.addEventListener('dragstart', function(e){ e.preventDefault(); });
  handle.addEventListener('pointerup', up);
  handle.addEventListener('pointercancel', up);
  addEventListener('resize', function(){ place(card.offsetLeft, card.offsetTop); });
}

/* setup */

P.init = function(){
  card = $('player');
  handle = $('pl-handle');
  ui.label = $('pl-label');
  ui.cover = $('cover');
  ui.empty = $('cover-empty');
  ui.title = $('pl-title');
  ui.artist = $('pl-artist');
  ui.time = $('pl-time');
  ui.seek = $('seek');
  ui.vol = $('vol');
  ui.mute = $('b-mute');
  ui.play = $('b-play');
  ui.list = $('pl-list');
  var last = 0.6;

  clean();

  var imgs = document.querySelectorAll('img[data-icon]');
  for (var k = 0; k < imgs.length; k++) { imgs[k].src = icons[imgs[k].getAttribute('data-icon')]; }

  // playlist rows
  for (var i = 0; i < tracks.length; i++) {
    (function(n){
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      var a = document.createElement('span');
      a.textContent = pad(n + 1);
      var c = document.createElement('span');
      c.textContent = tracks[n].title;
      b.appendChild(a);
      b.appendChild(c);
      b.addEventListener('click', function(){ open(n, true); });
      li.appendChild(b);
      ui.list.appendChild(li);
    })(i);
  }
  if (tracks.length) { open(0, false); }
  else {
    card.classList.add('empty');
    ui.title.textContent = 'NO TRACK';
    ui.artist.textContent = 'ADD FILES TO CONFIG.JS';
  }

  $('b-play').addEventListener('click', P.toggle);
  $('b-next').addEventListener('click', P.next);
  $('b-prev').addEventListener('click', P.prev);
  $('b-list').addEventListener('click', function(){
    ui.list.hidden = !ui.list.hidden;
    place(card.offsetLeft, card.offsetTop);
  });
  $('b-min').addEventListener('click', function(){
    var small = card.classList.toggle('min');
    icon($('b-min'), small ? 'max' : 'min');
    place(card.offsetLeft, card.offsetTop);
  });
  ui.mute.addEventListener('click', function(){
    if (el.volume > 0) { last = el.volume; volume(0); }
    else { volume(last || 0.6); }
  });
  ui.vol.addEventListener('input', function(){ volume(ui.vol.value / 100); });

  ui.seek.addEventListener('input', function(){
    seeking = true;
    if (el.duration) { ui.time.textContent = fmt(el.duration * ui.seek.value / 1000) + ' / ' + fmt(el.duration); }
  });
  ui.seek.addEventListener('change', function(){
    if (el.duration) { el.currentTime = el.duration * ui.seek.value / 1000; }
    seeking = false;
  });

  el.addEventListener('timeupdate', function(){
    if (seeking || !el.duration) { return; }
    ui.seek.value = Math.round(el.currentTime / el.duration * 1000);
    ui.time.textContent = fmt(el.currentTime) + ' / ' + fmt(el.duration);
  });
  el.addEventListener('loadedmetadata', function(){
    ui.time.textContent = '00:00 / ' + fmt(el.duration);
  });
  el.addEventListener('play', function(){
    P.playing = true;
    icon(ui.play, 'pause');
    ui.play.setAttribute('aria-label', 'Pause');
    document.body.classList.add('playing');
  });
  el.addEventListener('pause', function(){
    P.playing = false;
    icon(ui.play, 'play');
    ui.play.setAttribute('aria-label', 'Play');
    document.body.classList.remove('playing');
  });
  el.addEventListener('ended', function(){
    if (tracks.length > 1) { open(idx + 1, true); }
    else { el.currentTime = 0; }
  });

  // space plays, arrows skip. nothing else
  addEventListener('keydown', function(e){
    var t = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey) { return; }
    if (t && /^(input|textarea|select|button)$/i.test(t.tagName)) { return; }
    if (e.code == 'Space') { e.preventDefault(); P.toggle(); }
    else if (e.key == 'ArrowRight') { P.next(); }
    else if (e.key == 'ArrowLeft') { P.prev(); }
  });

  volume(cfg.volume !== undefined ? cfg.volume : 0.6);

  // phones start with the card folded so it doesnt cover the page
  if (innerWidth < 720) {
    card.classList.add('min');
    icon($('b-min'), 'max');
  }

  // put it back where it was left, or bottom right the first time
  var x = innerWidth - card.offsetWidth - 21;
  var y = innerHeight - card.offsetHeight - 21;
  try {
    var p = JSON.parse(localStorage.getItem('dw-bio-pos'));
    if (p && isFinite(p[0]) && isFinite(p[1])) { x = p[0]; y = p[1]; }
  } catch(e) {}
  place(x, y);
  card.classList.add('ready');
  drag();
};
})();
