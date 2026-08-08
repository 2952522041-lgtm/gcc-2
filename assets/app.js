// assets/app.js — GCC 编译原理教学网站 · 交互逻辑
(function () {
  'use strict';

  /* ---------- Mermaid 初始化 ---------- */
  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: "'Outfit','PingFang SC','Microsoft YaHei',sans-serif",
      themeVariables: {
        primaryColor: '#e8f6ef',
        primaryTextColor: '#101b15',
        primaryBorderColor: '#0b9e6b',
        lineColor: '#5e6d64',
        secondaryColor: '#eaf0ff',
        tertiaryColor: '#ffffff',
        fontFamily: "'Outfit','PingFang SC','Microsoft YaHei',sans-serif",
        fontSize: '14px'
      }
    });
  }

  /* ---------- 移动端侧栏 ---------- */
  var sidebar = document.getElementById('sidebar');
  var hamburger = document.getElementById('hamburger');
  var overlay = document.getElementById('overlay');
  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
  }
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      if (sidebar) sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show');
    });
  }
  if (overlay) overlay.addEventListener('click', closeSidebar);

  /* ---------- 阅读进度条 ---------- */
  var progress = document.getElementById('progress');
  function updateProgress() {
    var doc = document.documentElement;
    var total = doc.scrollHeight - window.innerHeight;
    var ratio = total > 0 ? window.scrollY / total : 0;
    if (progress) progress.style.width = (ratio * 100) + '%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- 滚动高亮导航（scrollspy） ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.sidebar-nav a.nav-link'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(function (s) { return s; });

  function spy() {
    var pos = window.scrollY + 90;
    var current = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= pos) current = sections[i].id;
    }
    navLinks.forEach(function (a) {
      var id = a.getAttribute('href').replace('#', '');
      if (id === current) a.classList.add('active');
      else a.classList.remove('active');
    });
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* ---------- 在线测验 ---------- */
  var quizRoot = document.getElementById('quizRoot');
  var scoreBox = document.getElementById('quizScore');
  var resetBtn = document.getElementById('quizReset');
  if (quizRoot) {
    var boxes = Array.prototype.slice.call(quizRoot.querySelectorAll('.quiz-box'));
    var state = {}; // name -> answered flag

    boxes.forEach(function (box) {
      var answer = parseInt(box.getAttribute('data-answer'), 10);
      var inputs = Array.prototype.slice.call(box.querySelectorAll('input[type="radio"]'));
      var explain = box.querySelector('.explain');
      var opts = Array.prototype.slice.call(box.querySelectorAll('.opt'));

      inputs.forEach(function (input) {
        input.addEventListener('change', function () {
          if (state[input.name]) return; // 已作答，不可修改
          state[input.name] = true;
          var chosen = parseInt(input.value, 10);

          opts.forEach(function (opt, idx) {
            var inp = opt.querySelector('input');
            if (idx === answer) opt.classList.add('correct');
            else if (inp.checked) opt.classList.add('wrong');
            opt.style.pointerEvents = 'none';
          });
          if (explain) explain.classList.add('show');
          updateScore();
        });
      });
    });

    function updateScore() {
      var answered = 0;
      var correct = 0;
      boxes.forEach(function (box) {
        var answer = parseInt(box.getAttribute('data-answer'), 10);
        var checked = box.querySelector('input[type="radio"]:checked');
        if (checked) {
          answered++;
          if (parseInt(checked.value, 10) === answer) correct++;
        }
      });
      if (scoreBox) {
        if (answered === 0) {
          scoreBox.classList.remove('show');
          return;
        }
        scoreBox.classList.add('show');
        var pct = Math.round(correct / boxes.length * 100);
        var msg = pct === 100 ? '🎉 满分！你是编译原理大师！'
          : pct >= 80 ? '🌟 优秀！只差一点点'
          : pct >= 60 ? '👍 及格！建议复习错题对应章节'
          : '📚 还需努力，建议从头再学一遍';
        scoreBox.innerHTML = '已作答 <b>' + correct + '/' + boxes.length + '</b>　正确率 <b>' + pct + '%</b><br><span style="font-size:.9rem;font-weight:600;color:var(--ink)">' + msg + '</span>';
      }
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state = {};
        boxes.forEach(function (box) {
          box.querySelectorAll('input[type="radio"]').forEach(function (i) { i.checked = false; });
          box.querySelectorAll('.opt').forEach(function (o) {
            o.classList.remove('correct', 'wrong');
            o.style.pointerEvents = '';
          });
          var ex = box.querySelector('.explain');
          if (ex) ex.classList.remove('show');
        });
        if (scoreBox) scoreBox.classList.remove('show');
      });
    }
  }
  /* ---------- 代码块一键复制 ---------- */
  document.querySelectorAll('.codeblock').forEach(function (block) {
    var cap = block.querySelector('figcaption');
    var pre = block.querySelector('pre');
    if (!cap || !pre) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = '复制';
    cap.appendChild(btn);
    btn.addEventListener('click', function () {
      var text = pre.innerText;
      var ok = function () {
        btn.textContent = '已复制 ✓';
        btn.classList.add('copied');
        setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('copied'); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok).catch(function () { fallback(text, ok); });
      } else { fallback(text, ok); }
    });
    function fallback(text, ok) {
      var ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  });

  /* ---------- 侧边栏章节搜索过滤 ---------- */
  (function () {
    var input = document.getElementById('navSearch');
    if (!input) return;
    var links = Array.prototype.slice.call(document.querySelectorAll('.sidebar-nav a.nav-link'));
    var labels = Array.prototype.slice.call(document.querySelectorAll('.sidebar-nav .nav-label'));
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var anyVisible = false;
      links.forEach(function (a) {
        var hit = !q || a.textContent.toLowerCase().indexOf(q) !== -1;
        a.style.display = hit ? '' : 'none';
        if (hit) anyVisible = true;
      });
      labels.forEach(function (l) {
        l.style.display = (!q || anyVisible) ? '' : 'none';
      });
    });
  })();

  /* ---------- 每章末尾注入 上一章/下一章 导航 ---------- */
  (function () {
    var chs = Array.prototype.slice.call(document.querySelectorAll('section.chapter'))
      .filter(function (s) { return /^ch\d+$/.test(s.id); });
    chs.forEach(function (sec, idx) {
      var nav = document.createElement('div');
      nav.className = 'chap-nav';
      if (idx > 0) {
        var a = document.createElement('a');
        a.className = 'cn-btn';
        a.href = '#' + chs[idx - 1].id;
        a.textContent = '← ' + chs[idx - 1].id.toUpperCase();
        nav.appendChild(a);
      }
      if (idx < chs.length - 1) {
        var b = document.createElement('a');
        b.className = 'cn-btn next';
        b.href = '#' + chs[idx + 1].id;
        b.textContent = chs[idx + 1].id.toUpperCase() + ' →';
        nav.appendChild(b);
      }
      if (nav.children.length) sec.appendChild(nav);
    });
    /* ---------- 深色模式切换 ---------- */
  (function () {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-btn';
    btn.setAttribute('aria-label', '切换深色模式');
    btn.title = '切换深色/浅色模式';
    btn.textContent = '🌙';
    document.body.appendChild(btn);

    function apply(theme) {
      document.body.classList.toggle('dark', theme === 'dark');
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    var saved = null;
    try { saved = localStorage.getItem('gcc-theme'); } catch (e) { /* ignore */ }
    if (!saved) {
      saved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    apply(saved);
    btn.addEventListener('click', function () {
      var next = document.body.classList.contains('dark') ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('gcc-theme', next); } catch (e) { /* ignore */ }
    });
  })();
})();

  /* ---------- 回到顶部按钮 ---------- */
  (function () {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'to-top';
    btn.title = '回到顶部';
    btn.setAttribute('aria-label', '回到顶部');
    btn.textContent = '↑';
    document.body.appendChild(btn);
    window.addEventListener('scroll', function () {
      if (window.scrollY > 600) btn.classList.add('show');
      else btn.classList.remove('show');
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();
})();
