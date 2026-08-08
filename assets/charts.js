// assets/charts.js — GCC 编译原理教学网站 · ECharts 图表配置
(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  var fontHead = "'Outfit','PingFang SC','Microsoft YaHei',sans-serif";
  var fontMono = "'JetBrainsMono',Consolas,monospace";

  /* ---------- 图 1-1：GCC 版本演进折线 ---------- */
  var elVersion = document.getElementById('chart-version');
  if (elVersion && window.echarts) {
    var chart1 = echarts.init(elVersion, null, { renderer: 'svg' });
    chart1.setOption({
      animation: false,
      grid: { left: 46, right: 30, top: 36, bottom: 46 },
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: '#101b15',
        borderColor: '#1c2b24',
        textStyle: { color: '#d9e8df' },
        formatter: function (p) {
          var d = p[0];
          return '<b>' + d.axisValue + ' 年</b><br/>GCC ' + d.data + '.0 发布';
        }
      },
      xAxis: {
        type: 'category',
        data: [1987, 1992, 1999, 2001, 2004, 2005, 2009, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: muted, fontFamily: fontMono, fontSize: 10 }
      },
      yAxis: {
        type: 'value',
        name: '版本号',
        nameTextStyle: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontFamily: fontMono, fontSize: 10 }
      },
      series: [{
        name: 'GCC 主版本',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: [1, 2, 2.95, 3, 3.4, 4, 4.4, 4.9, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        lineStyle: { width: 3, color: accent },
        itemStyle: {
          color: function (p) { return p.value >= 16 ? accent2 : accent; },
          borderColor: '#ffffff',
          borderWidth: 1.5
        },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent + '55' },
              { offset: 1, color: accent + '05' }
            ]
          }
        },
        label: {
          show: true,
          position: 'top',
          color: muted,
          fontFamily: fontMono,
          fontSize: 9,
          formatter: function (p) { return p.dataIndex >= 12 && p.dataIndex % 2 === 0 ? '' : p.data; }
        }
      }]
    });
    window.addEventListener('resize', function () { chart1.resize(); });
  }

  /* ---------- 图 2-2：编译各阶段耗时占比饼图 ---------- */
  var elStage = document.getElementById('chart-stage-time');
  if (elStage && window.echarts) {
    var chart2 = echarts.init(elStage, null, { renderer: 'svg' });
    chart2.setOption({
      animation: false,
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        backgroundColor: '#101b15',
        borderColor: '#1c2b24',
        textStyle: { color: '#d9e8df' },
        formatter: '{b}：{c}%（{d}%）'
      },
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: ink, fontSize: 12 }
      },
      series: [{
        type: 'pie',
        radius: ['46%', '72%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#ffffff', borderWidth: 2 },
        label: {
          color: ink,
          fontFamily: fontHead,
          fontSize: 12,
          formatter: '{b}\n{c}%'
        },
        labelLine: { lineStyle: { color: rule } },
        data: [
          { value: 3, name: '预处理', itemStyle: { color: accent2 } },
          { value: 88, name: '编译 cc1', itemStyle: { color: accent } },
          { value: 6, name: '汇编 as', itemStyle: { color: accent + '77' } },
          { value: 3, name: '链接 ld', itemStyle: { color: muted } }
        ]
      }]
    });
    window.addEventListener('resize', function () { chart2.resize(); });
  }

  /* ---------- 图 8-1：-O 等级 编译时间 vs 运行时间 ---------- */
  var elO = document.getElementById('chart-olevel');
  if (elO && window.echarts) {
    var chart3 = echarts.init(elO, null, { renderer: 'svg' });
    chart3.setOption({
      animation: false,
      grid: { left: 48, right: 34, top: 44, bottom: 44 },
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: '#101b15',
        borderColor: '#1c2b24',
        textStyle: { color: '#d9e8df' },
        axisPointer: { type: 'shadow' }
      },
      legend: {
        top: 4,
        icon: 'roundRect',
        itemWidth: 14,
        itemHeight: 8,
        textStyle: { color: ink, fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: ['-O0', '-O1', '-O2', '-O3', '-Os', '-Ofast'],
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: ink, fontFamily: fontMono, fontSize: 12, fontWeight: 700 }
      },
      yAxis: {
        type: 'value',
        name: '相对值（-O2 运行时间 = 1.0）',
        nameTextStyle: { color: muted, fontSize: 10 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontFamily: fontMono, fontSize: 10 }
      },
      series: [
        {
          name: '编译时间（越长越慢）',
          type: 'bar',
          barWidth: 18,
          data: [1.0, 1.4, 1.8, 2.3, 1.9, 2.6],
          itemStyle: { color: accent2, borderRadius: [4, 4, 0, 0] }
        },
        {
          name: '运行时间（越短越快）',
          type: 'bar',
          barWidth: 18,
          data: [4.8, 1.6, 1.0, 0.95, 1.05, 0.9],
          itemStyle: { color: accent, borderRadius: [4, 4, 0, 0] }
        }
      ]
    });
    window.addEventListener('resize', function () { chart3.resize(); });
  }
  /* ---------- 图 2-3：工程规模 × 编译策略（示意） ---------- */
  var elScale = document.getElementById('chart-scale');
  if (elScale && window.echarts) {
    var chartS = echarts.init(elScale, null, { renderer: 'svg' });
    chartS.setOption({
      animation: false,
      grid: { left: 50, right: 30, top: 44, bottom: 44 },
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: '#101b15',
        borderColor: '#1c2b24',
        textStyle: { color: '#d9e8df' },
        axisPointer: { type: 'shadow' }
      },
      legend: {
        top: 2, icon: 'roundRect', itemWidth: 14, itemHeight: 8,
        textStyle: { color: ink, fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: ['1K 行', '10K 行', '100K 行', '1M 行'],
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: ink, fontFamily: fontMono, fontSize: 11 }
      },
      yAxis: {
        type: 'value',
        name: '编译时间（分钟，对数感示意）',
        nameTextStyle: { color: muted, fontSize: 10 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontFamily: fontMono, fontSize: 10 }
      },
      series: [
        {
          name: '单线程（无缓存）', type: 'line', smooth: true,
          symbol: 'circle', symbolSize: 7,
          data: [0.01, 0.1, 1.0, 10.0],
          lineStyle: { width: 3, color: accent2 },
          itemStyle: { color: accent2 }
        },
        {
          name: 'make -j8', type: 'line', smooth: true,
          symbol: 'circle', symbolSize: 7,
          data: [0.01, 0.05, 0.3, 2.0],
          lineStyle: { width: 3, color: accent },
          itemStyle: { color: accent }
        },
        {
          name: 'ccache（二次构建）', type: 'line', smooth: true,
          symbol: 'circle', symbolSize: 7,
          data: [0.005, 0.01, 0.03, 0.1],
          lineStyle: { width: 3, color: muted, type: 'dashed' },
          itemStyle: { color: muted }
        }
      ]
    });
    window.addEventListener('resize', function () { chartS.resize(); });
  }

  /* ---------- 图 1-2：GCC 源码规模增长（示意） ---------- */
  var elGrow = document.getElementById('chart-grow');
  if (elGrow && window.echarts) {
    var chartG = echarts.init(elGrow, null, { renderer: 'svg' });
    chartG.setOption({
      animation: false,
      grid: { left: 46, right: 30, top: 30, bottom: 44 },
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        backgroundColor: '#101b15',
        borderColor: '#1c2b24',
        textStyle: { color: '#d9e8df' },
        formatter: function (p) { return '<b>' + p[0].axisValue + '</b><br/>约 ' + p[0].data + ' 百万行'; }
      },
      xAxis: {
        type: 'category',
        data: ['1987\nGCC 1.0', '1999\n2.95', '2005\n4.0', '2015\n5', '2019\n9', '2022\n12', '2026\n16'],
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: muted, fontFamily: fontMono, fontSize: 10, lineHeight: 14 }
      },
      yAxis: {
        type: 'value',
        name: '百万行',
        nameTextStyle: { color: muted, fontSize: 11 },
        splitLine: { lineStyle: { color: rule, type: 'dashed' } },
        axisLabel: { color: muted, fontFamily: fontMono, fontSize: 10 }
      },
      series: [{
        type: 'bar',
        barWidth: 30,
        data: [0.1, 1.5, 3, 10, 14, 16, 18],
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: accent },
              { offset: 1, color: accent + '55' }
            ]
          },
          borderRadius: [5, 5, 0, 0]
        },
        label: { show: true, position: 'top', color: muted, fontFamily: fontMono, fontSize: 9 }
      }]
    });
    window.addEventListener('resize', function () { chartG.resize(); });
  }

  /* ---------- 图 18-1：常见 GCC 报错阶段分布 ---------- */
  var elErr = document.getElementById('chart-errors');
  if (elErr && window.echarts) {
    var chart4 = echarts.init(elErr, null, { renderer: 'svg' });
    chart4.setOption({
      animation: false,
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        backgroundColor: '#101b15',
        borderColor: '#1c2b24',
        textStyle: { color: '#d9e8df' },
        formatter: '{b}：{c}%（{d}%）'
      },
      legend: {
        bottom: 0,
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: ink, fontSize: 12 }
      },
      series: [{
        type: 'pie',
        radius: ['44%', '70%'],
        center: ['50%', '44%'],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: '#ffffff', borderWidth: 2 },
        label: {
          color: ink,
          fontFamily: fontHead,
          fontSize: 12,
          formatter: '{b}\n{c}%'
        },
        labelLine: { lineStyle: { color: rule } },
        data: [
          { value: 3, name: '词法', itemStyle: { color: muted } },
          { value: 25, name: '语法', itemStyle: { color: accent2 } },
          { value: 55, name: '语义', itemStyle: { color: accent } },
          { value: 12, name: '链接', itemStyle: { color: accent2 + '99' } },
          { value: 5, name: '警告类', itemStyle: { color: '#d97706' } }
        ]
      }]
    });
    window.addEventListener('resize', function () { chart4.resize(); });
  }
})();
