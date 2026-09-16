(function(){
  var canvas = document.getElementById('bg-canvas');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.THREE || !canvas) return;

  var renderer, scene, camera, dustGeo, dustMat, dustPoints, clock;

  function glowTexture(){
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.3)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  function init(){
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0d0e16, 4, 18);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0.2, 7);
    camera.lookAt(0, 0.1, -3);

    var COUNT = 70;
    var positions = new Float32Array(COUNT * 3);
    var colors = new Float32Array(COUNT * 3);
    for (var i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 8 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
      var shade = 0.3 + Math.random() * 0.25;
      colors[i * 3] = 0.31 * shade * 3.2;
      colors[i * 3 + 1] = 0.62 * shade * 3.2;
      colors[i * 3 + 2] = 0.48 * shade * 3.2;
    }
    dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    dustGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    dustMat = new THREE.PointsMaterial({
      size: 0.09, vertexColors: true, transparent: true, opacity: 0.35,
      map: glowTexture(), alphaTest: 0.02, depthWrite: false, sizeAttenuation: true
    });
    dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    clock = new THREE.Clock();
    window.addEventListener('resize', onResize);

    if (reduced) {
      renderer.render(scene, camera);
    } else {
      animate();
    }
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();
    var pos = dustGeo.attributes.position;
    for (var i = 0; i < pos.count; i++) {
      var y = pos.getY(i) + 0.0016;
      var x = pos.getX(i) + Math.sin(t * 0.1 + i) * 0.0008;
      if (y > 7) y = -1.5;
      pos.setY(i, y);
      pos.setX(i, x);
    }
    pos.needsUpdate = true;
    camera.position.x = Math.sin(t * 0.03) * 0.3;
    camera.lookAt(0, 0.1, -3);
    renderer.render(scene, camera);
  }

  try { init(); } catch (e) { /* WebGL unavailable — solid background still holds */ }
})();

(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lines = document.querySelectorAll('.hero-term .tline[data-text]');
  var caret = document.querySelector('.hero-term .caret2');

  if (reduced) {
    lines.forEach(function(el){ el.textContent = el.getAttribute('data-text'); });
    if (caret) caret.classList.add('show');
  } else {
    var i = 0;
    function next(){
      if (i >= lines.length) { if (caret) caret.classList.add('show'); return; }
      var el = lines[i];
      var text = el.getAttribute('data-text');
      var isOut = el.classList.contains('out');
      var speed = isOut ? 9 : 24;
      var j = 0;
      function step(){
        el.textContent = text.slice(0, j);
        j++;
        if (j <= text.length) { setTimeout(step, speed); }
        else { i++; setTimeout(next, isOut ? 300 : 140); }
      }
      step();
    }
    next();
  }
})();

(function(){
  var canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (canHover && !reduced) {
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    var mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    });
    function loop(){
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    }
    loop();
    document.querySelectorAll('a,button,.work-card,.stack span').forEach(function(el){
      el.addEventListener('mouseenter', function(){ ring.classList.add('hover'); });
      el.addEventListener('mouseleave', function(){ ring.classList.remove('hover'); });
    });
  }

  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          var el = entry.target;
          requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('in'); }); });
          io.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.reveal, .reveal-item').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.reveal, .reveal-item').forEach(function(el){ el.classList.add('in'); });
  }
})();
