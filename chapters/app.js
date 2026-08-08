// chapters/app.js — GCC 编译原理分章版 · 共享交互
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
        primaryColor: '#e8f6ef', primaryTextColor: '#101b15', primaryBorderColor: '#0b9e6b',
        lineColor: '#5e6d64', secondaryColor: '#eaf0ff', tertiaryColor: '#ffffff',
        fontFamily: "'Outfit','PingFang SC','Microsoft YaHei',sans-serif", fontSize: '14px'
      }
    });
  }

  /* ---------- 阅读进度条 ---------- */
  var progress = document.getElementById('progress');
  function upd() {
    var doc = document.documentElement;
    var total = doc.scrollHeight - window.innerHeight;
    var r = total > 0 ? window.scrollY / total : 0;
    if (progress) progress.style.width = (r * 100) + '%';
  }
  window.addEventListener('scroll', upd, { passive: true });
  upd();

  /* ---------- 深色模式 ---------- */
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

  /* ---------- 回到顶部 ---------- */
  (function () {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'to-top';
    btn.title = '回到顶部';
    btn.setAttribute('aria-label', '回到顶部');
    btn.textContent = '↑';
    document.body.appendChild(btn);
    window.addEventListener('scroll', function () {
      btn.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  })();

  /* ---------- 代码块复制 ---------- */
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

  /* ---------- 章内目录滚动高亮（章节页） ---------- */
  (function () {
    var toc = document.querySelector('.c-toc');
    if (!toc) return;
    var links = Array.prototype.slice.call(toc.querySelectorAll('a'));
    var targets = links.map(function (a) {
      return document.getElementById(a.getAttribute('href').replace('#', ''));
    }).filter(Boolean);
    function spy() {
      var pos = window.scrollY + 100;
      var current = null;
      targets.forEach(function (t) {
        if (t.offsetTop <= pos) current = t.id;
      });
      links.forEach(function (a) {
        if (a.getAttribute('href').replace('#', '') === current) a.style.fontWeight = '700';
        else a.style.fontWeight = '400';
      });
    }
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  })();

  /* ---------- 索引页卡片搜索 ---------- */
  (function () {
    var input = document.getElementById('cardSearch');
    if (!input) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.c-card'));
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      cards.forEach(function (c) {
        c.style.display = (!q || c.textContent.toLowerCase().indexOf(q) !== -1) ? '' : 'none';
      });
    });
  })();

  /* ---------- 索引页：分类标签 + 学习进度勾选 ---------- */
  (function () {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.c-card'));
    if (!cards.length) return;
    var CATS = { ch01: '基础', ch02: '基础', ch03: '基础', ch04: '基础', ch05: '基础', ch06: '基础',
      ch07: '进阶', ch08: '进阶', ch09: '进阶', ch10: '进阶', ch11: '进阶', ch12: '进阶',
      ch13: '实战', ch14: '测验', ch15: '专题', ch16: '实战', ch17: '专题', ch18: '专题', ch19: '参考' };
    cards.forEach(function (c) {
      var key = c.getAttribute('href').replace('.html', '');
      if (CATS[key]) {
        var tag = document.createElement('span');
        tag.className = 'cat';
        tag.textContent = CATS[key];
        c.appendChild(tag);
      }
    });
    var read = [];
    try { read = JSON.parse(localStorage.getItem('gcc-ch-read') || '[]'); } catch (e) { /* ignore */ }
    read.forEach(function (k) {
      var el = document.querySelector('.c-card[href="' + k + '.html"]');
      if (el) el.classList.add('done');
    });
    cards.forEach(function (c) {
      c.addEventListener('click', function () {
        var k = c.getAttribute('href').replace('.html', '');
        if (read.indexOf(k) === -1) read.push(k);
        try { localStorage.setItem('gcc-ch-read', JSON.stringify(read)); } catch (e) { /* ignore */ }
        c.classList.add('done');
      });
    });
  })();

  /* ---------- 跨章知识链：每页注入相关章节 ---------- */
  (function () {
    var T = {
      ch01: '绪论', ch02: '四阶段流水线', ch03: '预处理', ch04: '词法分析', ch05: '语法分析',
      ch06: '语义分析', ch07: '中间表示 IR', ch08: '优化', ch09: '汇编生成', ch10: '链接',
      ch11: '内部架构', ch12: '工具链', ch13: '动手实验', ch14: '在线测验', ch15: '选项手册',
      ch16: '迷你编译器', ch17: '交叉编译', ch18: '错误图鉴', ch19: '术语表'
    };
    var REL = {
      ch01: ['ch02', 'ch11'], ch02: ['ch01', 'ch10'], ch03: ['ch04', 'ch15'], ch04: ['ch05', 'ch16'],
      ch05: ['ch04', 'ch16'], ch06: ['ch05', 'ch08'], ch07: ['ch08', 'ch11'], ch08: ['ch07', 'ch09'],
      ch09: ['ch07', 'ch12'], ch10: ['ch09', 'ch17'], ch11: ['ch07', 'ch16'], ch12: ['ch10', 'ch09'],
      ch13: ['ch02', 'ch15'], ch14: ['ch01', 'ch19'], ch15: ['ch03', 'ch17'], ch16: ['ch05', 'ch11'],
      ch17: ['ch10', 'ch15'], ch18: ['ch06', 'ch10'], ch19: ['ch07', 'ch18']
    };
    var footnav = document.querySelector('.c-footnav');
    if (!footnav) return;
    var name = (location.pathname.split('/').pop() || '').replace('.html', '');
    if (!REL[name]) return;
    var box = document.createElement('div');
    box.className = 'c-related';
    var label = document.createElement('span');
    label.className = 'rl';
    label.textContent = '🔗 相关章节';
    box.appendChild(label);
    REL[name].forEach(function (k) {
      var a = document.createElement('a');
      a.href = k + '.html';
      a.textContent = 'CH' + k.replace('ch', '') + ' · ' + T[k];
      box.appendChild(a);
    });
    footnav.parentNode.insertBefore(box, footnav);
  })();

  /* ---------- 每章快问快答（判断题） ---------- */
  (function () {
    var Q = {
      ch01: ['编译器必须一次生成全部目标代码才算"编译"', '错 —— 现代编译器可以增量编译（.o 文件、LTO），"整体翻译"指语义层面而非一次性输出。'],
      ch02: ['gcc 命令本身就是一个完整的编译器', '错 —— gcc 是驱动程序（driver），真正干活的是 cc1 / as / ld。'],
      ch03: ['预处理后的 .i 文件仍然是 C 源码', '对 —— 宏已展开、头文件已内联，但语法层面仍是 C 代码。'],
      ch04: ['词法分析器能识别出"这句代码有没有语法错误"', '错 —— 语法错误由语法分析器负责，词法只负责切分 token。'],
      ch05: ['运算符优先级决定了 AST 的树形结构', '对 —— 优先级高的运算符更早成为子表达式（更深层子树）。'],
      ch06: ['符号表只记录变量名和类型', '错 —— 还记录作用域、存储类别、源位置、链接属性等。'],
      ch07: ['SSA 形式要求每个变量只能被赋值一次', '对 —— 后续赋值产生新版本，配合 PHI 节点处理汇合点。'],
      ch08: ['-O3 一定比 -O2 生成的程序快', '错 —— 可能因指令缓存、寄存器压力反而更慢，应实测。'],
      ch09: ['寄存器分配决定变量放寄存器还是内存', '对 —— 分配不下的虚拟寄存器会溢出（spill）到栈上。'],
      ch10: ['undefined reference 发生在编译阶段', '错 —— 发生在链接阶段（符号解析失败）。'],
      ch11: ['GCC 支持 60 多种目标架构', '对 —— 依靠前端/中端/后端三段式架构实现。'],
      ch12: ['objdump -d 可以把汇编还原成 C 源码', '错 —— 只能反汇编成机器码对应的汇编，还原"伪 C"需要人工或反编译器。'],
      ch13: ['make 的增量编译基于文件时间戳', '对 —— 目标比依赖旧就重跑配方命令。'],
      ch14: ['测验里 undefined reference 属于链接错误', '对 —— 见第 10 章。'],
      ch15: ['-Wall -Werror 能保证代码零 bug', '错 —— 只把已知警告升级为错误，无法发现所有逻辑问题。'],
      ch16: ['tinycc 用了递归下降解析器', '对 —— 每个产生式对应一个函数。'],
      ch17: ['交叉编译就是换个编译器选项即可，无需考虑 ABI', '错 —— 还要考虑 sysroot、浮点 ABI、架构参数等。'],
      ch18: ['warning 表示代码一定有问题', '错 —— 表示"合法但可疑"，是善意的提醒。'],
      ch19: ['术语表建议先按主题分组理解术语', '对 —— 术语间的关系比单个定义更重要。']
    };
    var body = document.querySelector('.c-body');
    if (!body) return;
    var name = (location.pathname.split('/').pop() || '').replace('.html', '');
    if (!Q[name]) return;
    var box = document.createElement('div');
    box.className = 'c-quiz';
    var t = document.createElement('div');
    t.className = 'qt';
    t.textContent = '💡 本章快问快答';
    var q = document.createElement('div');
    q.className = 'qbody';
    q.textContent = '"' + Q[name][0] + '" —— 这句话对吗？';
    var btn = document.createElement('span');
    btn.className = 'qans';
    btn.textContent = '点击查看答案';
    btn.addEventListener('click', function () {
      btn.textContent = Q[name][1];
      btn.style.cursor = 'default';
      btn.style.borderStyle = 'solid';
    });
    box.appendChild(t); box.appendChild(q); box.appendChild(btn);
    body.appendChild(box);
  })();

  /* ---------- 测验（ch14 页） ---------- */
  (function () {
    var quizRoot = document.getElementById('quizRoot');
    if (!quizRoot) return;
    var boxes = Array.prototype.slice.call(quizRoot.querySelectorAll('.quiz-box'));
    var scoreBox = document.getElementById('quizScore');
    var resetBtn = document.getElementById('quizReset');
    var state = {};
    boxes.forEach(function (box) {
      var answer = parseInt(box.getAttribute('data-answer'), 10);
      var inputs = Array.prototype.slice.call(box.querySelectorAll('input[type="radio"]'));
      var explain = box.querySelector('.explain');
      var opts = Array.prototype.slice.call(box.querySelectorAll('.opt'));
      inputs.forEach(function (input) {
        input.addEventListener('change', function () {
          if (state[input.name]) return;
          state[input.name] = true;
          opts.forEach(function (opt, idx) {
            if (idx === answer) opt.classList.add('correct');
            else if (opt.querySelector('input').checked) opt.classList.add('wrong');
            opt.style.pointerEvents = 'none';
          });
          if (explain) explain.classList.add('show');
          updateScore();
        });
      });
    });
    function updateScore() {
      var correct = 0, answered = 0;
      boxes.forEach(function (box) {
        var answer = parseInt(box.getAttribute('data-answer'), 10);
        var checked = box.querySelector('input[type="radio"]:checked');
        if (checked) {
          answered++;
          if (parseInt(checked.value, 10) === answer) correct++;
        }
      });
      if (scoreBox) {
        if (!answered) { scoreBox.classList.remove('show'); return; }
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
  })();
})();
