// Redaction: turns <REDACTED_n> markers into solid black bars n characters wide.
// Only the marker is ever in the source. The hidden text does not exist anywhere,
// so there is nothing to uncover in the page source, the DOM or the scripts.
//
// Use it anywhere:
//   in HTML:     &lt;REDACTED_7&gt;   (the escaped form, so the browser keeps it as text)
//   in config:   '<REDACTED_7>'
//   from code:   DW.redact.run(someElement)  (also runs by itself on new content)
//
// Each bar is made of n empty cells, one per hidden character. alive.js lights them
// up with the music, but they hold nothing. there is no text behind them.

(function(){
window.DW = window.DW || {};
var R = {};
DW.redact = R;

var MAX = 200;  // longest bar allowed
var MARK = /<REDACTED_(\d+)>/g;

function bar(n){
  var el = document.createElement('span');
  el.className = 'redacted';
  el.style.setProperty('--n', n);
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', 'redacted, ' + n + ' characters');
  for (var i = 0; i < n; i++) {
    el.appendChild(document.createElement('i'));
  }
  return el;
}

// splits one text node into text + bars
function swap(node){
  var s = node.nodeValue;
  MARK.lastIndex = 0;
  if (!MARK.test(s)) { return; }
  MARK.lastIndex = 0;

  var frag = document.createDocumentFragment();
  var last = 0;
  var m;
  while ((m = MARK.exec(s)) !== null) {
    if (m.index > last) { frag.appendChild(document.createTextNode(s.slice(last, m.index))); }
    var n = Math.min(parseInt(m[1], 10), MAX);
    if (n > 0) { frag.appendChild(bar(n)); }
    last = m.index + m[0].length;
  }
  if (last < s.length) { frag.appendChild(document.createTextNode(s.slice(last))); }
  node.parentNode.replaceChild(frag, node);
}

R.run = function(root){
  root = root || document.body;
  var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: function(n){
      var p = n.parentNode;
      if (p && /^(script|style|textarea|noscript)$/i.test(p.nodeName)) { return NodeFilter.FILTER_REJECT; }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  var list = [];
  while (walker.nextNode()) { list.push(walker.currentNode); }
  for (var i = 0; i < list.length; i++) { swap(list[i]); }
};

// catches text added later (other scripts, new content)
R.watch = function(){
  if (!window.MutationObserver) { return; }
  new MutationObserver(function(list){
    for (var i = 0; i < list.length; i++) {
      var add = list[i].addedNodes;
      for (var j = 0; j < add.length; j++) {
        var n = add[j];
        if (n.nodeType == 3) { swap(n); }
        else if (n.nodeType == 1 && !n.classList.contains('redacted')) { R.run(n); }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
};
})();
