// Music player. Silent interface: no UI sounds, only the tracks you list in config.js.
// The page reacts to the music through DW.level (0 to 1), a slow smoothed loudness value.

(function(){
window.DW = window.DW || {};
var P = {};
DW.player = P;

var cfg = DW.config.player || {};
var tracks = cfg.tracks || [];
var icons = DW.config.assets.icons;

var el = new Audio();
el.preload = 'metadata';
var idx = 0;
var dragging = false;
var ctx, analyser, data;
var level = 0;
var raf = 0;
var ui = {};

DW.level = 0;
P.el = el;
P.playing = false;

function $(id){ return document.getElementById(id); }

function fmt(s){
  if (!isFinite(s)) { s = 0; }
  s = Math.floor(s);
  var m = Math.floor(s / 60);
  var r = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
}

function setIcon(btn, name){
  var img = btn.querySelector('img');
  if (img) { img.src = icons[name]; }
}

/* loading tracks */

function load(i, play){
  if (!tracks.length) { return; }
  idx = (i + tracks.length) % tracks.length;
  var t = tracks[idx];
  el.src = t.file;
  ui.title.textContent = (t.artist ? t.artist + ' / ' : '') + t.title;
  ui.seek.value = 0;
  ui.time.textContent = '00:00 / 00:00';
  mark();
  if (play) { P.play(); }
}

function mark(){
  var rows = ui.list.children;
  for (var i = 0; i < rows.length; i++) {
    rows[i].classList.toggle('on', i === idx);
  }
}

/* analyser, made on the first play because browsers need a click first */

function listen(){
  if (ctx) { return; }
  try {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { return; }
    ctx = new AC();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.9;
    ctx.createMediaElementSource(el).connect(analyser);
    analyser.connect(ctx.destination);
    data = new Uint8Array(analyser.frequencyBinCount);
  } catch(e) {
    // no analyser, the page just stays still
    analyser = null;
  }
}

function frame(){
  raf = requestAnimationFrame(frame);
  var target = 0;
  if (analyser && P.playing) {
    analyser.getByteFrequencyData(data);
    var sum = 0;
    for (var i = 0; i < 24; i++) { sum += data[i]; }  // low end only
    target = sum / (24 * 255);
  }
  // slow rise, slower fall. nothing sudden
  var k = target > level ? 0.04 : 0.02;
  level += (target - level) * k;
  DW.level = level;
  document.documentElement.style.setProperty('--lvl', level.toFixed(3));
  if (!P.playing && level < 0.002) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
}

function run(){
  if (!raf && !DW.reduce) { raf = requestAnimationFrame(frame); }
}

/* controls */

P.play = function(){
  if (!tracks.length) { return; }
  if (!el.src) { load(idx, false); }
  listen();
  if (ctx && ctx.state === 'suspended') { ctx.resume(); }
  var p = el.play();
  if (p && p.catch) { p.catch(function(){}); }
};
P.pause = function(){ el.pause(); };
P.toggle = function(){ if (el.paused) { P.play(); } else { P.pause(); } };
P.next = function(){ load(idx + 1, !el.paused || P.playing); };
P.prev = function(){
  if (el.currentTime > 3) { el.currentTime = 0; return; }
  load(idx - 1, !el.paused || P.playing);
};

function volume(v){
  v = Math.max(0, Math.min(1, v));
  el.volume = v;
  el.muted = v === 0;
  ui.vol.value = Math.round(v * 100);
  setIcon(ui.mute, v === 0 ? 'mute' : 'volume');
}

/* setup */

P.init = function(){
  ui.title = $('pl-title');
  ui.time = $('pl-time');
  ui.seek = $('seek');
  ui.vol = $('vol');
  ui.mute = $('b-mute');
  ui.play = $('b-play');
  ui.list = $('pl-list');
  var panel = $('playlist');
  var last = 0.6;

  // fill the playlist
  for (var i = 0; i < tracks.length; i++) {
    (function(n){
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      var num = document.createElement('span');
      num.className = 'num';
      num.textContent = (n < 9 ? '0' : '') + (n + 1);
      var name = document.createElement('span');
      name.className = 'nm';
      name.textContent = tracks[n].title;
      var by = document.createElement('span');
      by.className = 'by';
      by.textContent = tracks[n].artist || '';
      b.appendChild(num); b.appendChild(name); b.appendChild(by);
      b.addEventListener('click', function(){ load(n, true); });
      li.appendChild(b);
      ui.list.appendChild(li);
    })(i);
  }
  if (!tracks.length) {
    var empty = document.createElement('li');
    empty.className = 'empty tiny';
    empty.textContent = 'NO TRACKS. ADD FILES TO ASSETS/MUSIC AND LIST THEM IN CONFIG.JS';
    ui.list.appendChild(empty);
    ui.title.textContent = 'NO TRACK';
    $('player').classList.add('empty');
  } else {
    load(0, false);
  }

  // fill every icon from the config paths
  var imgs = document.querySelectorAll('img[data-icon]');
  for (var k = 0; k < imgs.length; k++) { imgs[k].src = icons[imgs[k].getAttribute('data-icon')]; }

  $('b-play').addEventListener('click', P.toggle);
  $('b-next').addEventListener('click', P.next);
  $('b-prev').addEventListener('click', P.prev);
  $('b-list').addEventListener('click', function(){ panel.hidden = !panel.hidden; });
  $('pl-close').addEventListener('click', function(){ panel.hidden = true; });
  ui.mute.addEventListener('click', function(){
    if (el.volume > 0 && !el.muted) { last = el.volume; volume(0); }
    else { volume(last || 0.6); }
  });
  ui.vol.addEventListener('input', function(){ volume(ui.vol.value / 100); });

  ui.seek.addEventListener('input', function(){
    dragging = true;
    if (el.duration) { ui.time.textContent = fmt(el.duration * ui.seek.value / 1000) + ' / ' + fmt(el.duration); }
  });
  ui.seek.addEventListener('change', function(){
    if (el.duration) { el.currentTime = el.duration * ui.seek.value / 1000; }
    dragging = false;
  });

  el.addEventListener('timeupdate', function(){
    if (dragging || !el.duration) { return; }
    ui.seek.value = Math.round(el.currentTime / el.duration * 1000);
    ui.time.textContent = fmt(el.currentTime) + ' / ' + fmt(el.duration);
  });
  el.addEventListener('loadedmetadata', function(){
    ui.time.textContent = '00:00 / ' + fmt(el.duration);
  });
  el.addEventListener('play', function(){
    P.playing = true;
    setIcon(ui.play, 'pause');
    ui.play.setAttribute('aria-label', 'Pause');
    document.body.classList.add('playing');
    run();
  });
  el.addEventListener('pause', function(){
    P.playing = false;
    setIcon(ui.play, 'play');
    ui.play.setAttribute('aria-label', 'Play');
    document.body.classList.remove('playing');
    run();
  });
  el.addEventListener('ended', function(){
    if (tracks.length > 1) { load(idx + 1, true); }
    else { el.currentTime = 0; }
  });
  el.addEventListener('error', function(){
    ui.title.textContent = 'FILE NOT FOUND';
  });

  // keyboard: space plays, arrows skip. nothing else
  addEventListener('keydown', function(e){
    var t = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey) { return; }
    if (t && /^(input|textarea|select|button)$/i.test(t.tagName) && t.type !== 'range') { return; }
    if (e.code === 'Space') { e.preventDefault(); P.toggle(); }
    else if (e.key === 'ArrowRight' && t && t.type !== 'range') { P.next(); }
    else if (e.key === 'ArrowLeft' && t && t.type !== 'range') { P.prev(); }
    else if (e.key === 'Escape') { panel.hidden = true; }
  });

  volume(cfg.volume !== undefined ? cfg.volume : 0.6);
};
})();
