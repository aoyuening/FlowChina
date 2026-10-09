/**
 * 流动中国 · 图表管理器
 * 负责 ECharts 初始化、数据更新、地图注册与窗口自适应。
 */
window.FlowChinaCharts = (() => {
  const data = window.FlowChinaData;
  const charts = {};
  let activeYear = 2025;
  let activeCity = "北京";
  let mapLoaded = false;

  const colors = {
    text: "#dceceb",
    muted: "#718e93",
    grid: "rgba(126, 184, 185, 0.09)",
    teal: "#3dd9c5",
    teal2: "#49b9d1",
    tealDim: "rgba(61, 217, 197, 0.16)",
    orange: "#f0a25c",
    orangeDim: "rgba(240, 162, 92, 0.17)",
    red: "#d87967",
    blue: "#5f92c9"
  };

  const tooltip = {
    backgroundColor: "rgba(5, 22, 29, 0.95)",
    borderColor: "rgba(72, 211, 194, 0.28)",
    borderWidth: 1,
    padding: [10, 12],
    textStyle: { color: colors.text, fontSize: 11 },
    extraCssText: "box-shadow:0 10px 30px rgba(0,0,0,.3);border-radius:4px;"
  };

  const axisLabel = { color: colors.muted, fontSize: 10 };
  const splitLine = { lineStyle: { color: colors.grid } };

  function createChart(id) {
    const element = document.getElementById(id);
    if (!element) return null;
    const instance = echarts.getInstanceByDom(element) || echarts.init(element, null, { renderer: "canvas" });
    charts[id] = instance;
    return instance;
  }

  function scaleByYear(value, index = 0) {
    const factor = data.yearFactors[activeYear] || 1;
    const variation = 1 + ((((index + activeYear) % 5) - 2) * 0.018);
    return +(value * factor * variation).toFixed(1);
  }

  function rankingOption(items, tone = "teal") {
    const ranked = items.map((item, index) => ({ ...item, displayValue: scaleByYear(item.value, index) }));
    const isWarm = tone === "warm";
    return {
      animationDuration: 700,
      animationEasing: "cubicOut",
      grid: { left: 18, right: 28, top: 6, bottom: 12, containLabel: true },
      tooltip: {
        ...tooltip,
        trigger: "axis",
        axisPointer: { type: "shadow", shadowStyle: { color: "rgba(99, 178, 180, .06)" } },
        formatter(params) {
          const p = params[0];
          return `<b>${p.name}</b><br/>${isWarm ? "净流出" : "净流入"}：<span style="color:${isWarm ? colors.orange : colors.teal}">${p.value} 万人</span><br/><span style="color:#718e93">${activeYear} 年示例值</span>`;
        }
      },
      xAxis: { type: "value", show: false, max: (value) => Math.ceil(value.max * 1.18) },
      yAxis: {
        type: "category", inverse: true, data: ranked.map((item) => item.name), axisTick: { show: false },
        axisLine: { show: false }, axisLabel: { ...axisLabel, color: "#a5bbbc", margin: 12 }
      },
      series: [{
        type: "bar", data: ranked.map((item) => item.displayValue), barWidth: 7, showBackground: true,
        backgroundStyle: { color: "rgba(116, 181, 181, .055)", borderRadius: 5 },
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: isWarm ? "rgba(216,121,103,.35)" : "rgba(61,217,197,.25)" },
            { offset: 1, color: isWarm ? colors.orange : colors.teal }
          ])
        },
        label: { show: true, position: "right", color: isWarm ? colors.orange : colors.text, fontSize: 9, formatter: "{c}" }
      }]
    };
  }

  function renderRankings() {
    charts["inflow-chart"].setOption(rankingOption(data.inflowRanking));
    charts["outflow-chart"].setOption(rankingOption(data.outflowRanking, "warm"));
  }

  function renderAttraction() {
    const sorted = [...data.profileCities].sort((a, b) => b.attraction - a.attraction);
    charts["attraction-chart"].setOption({
      animationDuration: 700,
      grid: { left: 20, right: 32, top: 10, bottom: 18, containLabel: true },
      tooltip: { ...tooltip, trigger: "axis", axisPointer: { type: "shadow" }, formatter: (p) => `<b>${p[0].name}</b><br/>吸引力指数：<span style="color:${colors.orange}">${p[0].value} 分</span>` },
      xAxis: { type: "value", min: 70, max: 100, axisLabel, splitLine, axisLine: { show: false }, axisTick: { show: false } },
      yAxis: { type: "category", inverse: true, data: sorted.map((city) => city.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { ...axisLabel, color: "#a5bbbc" } },
      series: [{
        type: "bar", barWidth: 10, data: sorted.map((city, index) => ({
          value: city.attraction,
          itemStyle: { color: index < 2 ? colors.orange : new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: "rgba(61,217,197,.28)" }, { offset: 1, color: colors.teal }]) }
        })),
        showBackground: true, backgroundStyle: { color: "rgba(116,181,181,.05)" },
        label: { show: true, position: "right", color: colors.text, fontSize: 9, formatter: "{c}" }
      }]
    });
  }

  function nationalTrendOption() {
    const selectedIndex = data.years.indexOf(activeYear);
    return {
      animationDuration: 700,
      grid: { left: 26, right: 26, top: 14, bottom: 18, containLabel: true },
      tooltip: { ...tooltip, trigger: "axis", formatter(params) { return `<b>${params[0].axisValue} 年</b><br/>${params.map((p) => `${p.marker}${p.seriesName}：${p.value} 万人`).join("<br/>")}<br/><span style="color:#718e93">示例样本汇总</span>`; } },
      xAxis: { type: "category", boundaryGap: false, data: data.years, axisLabel, axisLine: { lineStyle: { color: colors.grid } }, axisTick: { show: false } },
      yAxis: { type: "value", name: "万人", nameTextStyle: { color: colors.muted, fontSize: 9 }, axisLabel, splitLine, axisLine: { show: false } },
      series: [
        {
          name: "样本城市人口增量", type: "line", smooth: .36, symbol: "circle", symbolSize: 6,
          data: data.nationalTrend.populationChange, lineStyle: { width: 2, color: colors.teal }, itemStyle: { color: colors.teal, borderColor: "#09252b", borderWidth: 2 },
          areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "rgba(61,217,197,.2)" }, { offset: 1, color: "rgba(61,217,197,0)" }]) },
          markPoint: { symbol: "circle", symbolSize: 8, data: [{ coord: [selectedIndex, data.nationalTrend.populationChange[selectedIndex]] }], itemStyle: { color: colors.orange }, label: { show: false } }
        },
        {
          name: "净流入规模", type: "line", smooth: .36, symbol: "emptyCircle", symbolSize: 5,
          data: data.nationalTrend.netInflow, lineStyle: { width: 1.5, color: colors.orange }, itemStyle: { color: colors.orange }
        }
      ]
    };
  }

  function renderNationalTrend() { charts["national-trend-chart"].setOption(nationalTrendOption(), true); }

  function renderRegionDonut() {
    charts["region-donut-chart"].setOption({
      animationDuration: 800,
      color: [colors.teal, colors.teal2, colors.orange, colors.blue],
      tooltip: { ...tooltip, trigger: "item", formatter: "{b}<br/>流动占比：{c}%" },
      legend: { bottom: 9, left: "center", itemWidth: 7, itemHeight: 7, itemGap: 14, textStyle: axisLabel },
      graphic: [{ type: "text", left: "center", top: "39%", style: { text: "区域构成", fill: colors.muted, font: "10px sans-serif", textAlign: "center" } }, { type: "text", left: "center", top: "46%", style: { text: "100%", fill: colors.text, font: "500 24px Bahnschrift", textAlign: "center" } }],
      series: [{
        type: "pie", radius: ["48%", "68%"], center: ["50%", "44%"], avoidLabelOverlap: true,
        itemStyle: { borderColor: "#0a1c24", borderWidth: 3 },
        label: { color: colors.text, fontSize: 9, formatter: "{b}\n{d}%" }, labelLine: { length: 10, length2: 8, lineStyle: { color: "rgba(124,183,184,.35)" } },
        data: data.regionShare
      }]
    });
  }

  function cityTrendOption(cityName, targetId = "city-trend-chart") {
    const city = data.profileCities.find((item) => item.name === cityName) || data.profileCities[0];
    const selectedIndex = data.years.indexOf(activeYear);
    return {
      animationDuration: 650,
      grid: { left: 28, right: 22, top: 28, bottom: 26, containLabel: true },
      tooltip: { ...tooltip, trigger: "axis", formatter: (p) => `<b>${city.name} · ${p[0].axisValue} 年</b><br/>人口变化：<span style="color:${colors.teal}">${p[0].value} 万人</span><br/><span style="color:#718e93">示例数据</span>` },
      xAxis: { type: "category", boundaryGap: false, data: data.years, axisLabel, axisLine: { lineStyle: { color: colors.grid } }, axisTick: { show: false } },
      yAxis: { type: "value", name: "万人", nameTextStyle: { color: colors.muted, fontSize: 9 }, axisLabel, splitLine, axisLine: { show: false } },
      series: [{
        name: city.name, type: "line", smooth: .42, data: city.yearlyChange, symbol: "circle", symbolSize: 7,
        lineStyle: { color: colors.teal, width: 2 }, itemStyle: { color: colors.teal, borderWidth: 2, borderColor: "#09252b" },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: "rgba(61,217,197,.24)" }, { offset: 1, color: "rgba(61,217,197,0)" }]) },
        markPoint: { symbol: "pin", symbolSize: targetId === "profile-trend-chart" ? 34 : 30, data: [{ coord: [selectedIndex, city.yearlyChange[selectedIndex]], value: city.yearlyChange[selectedIndex] }], itemStyle: { color: colors.orange }, label: { color: "#102229", fontSize: 8 } }
      }]
    };
  }

  function renderCityTrend(cityName) { charts["city-trend-chart"].setOption(cityTrendOption(cityName), true); }

  function renderRadar(cityName) {
    const city = data.profileCities.find((item) => item.name === cityName) || data.profileCities[0];
    const values = [city.populationChange > 25 ? 100 : Math.round(60 + city.populationChange * 1.5), city.employment, city.income, city.industry, city.publicService, city.youth];
    charts["radar-chart"].setOption({
      animationDuration: 650,
      tooltip: { ...tooltip, trigger: "item", formatter: () => `<b>${city.name} · 六维画像</b><br/>人口增量：${values[0]}<br/>就业机会：${values[1]}<br/>收入水平：${values[2]}<br/>产业活跃度：${values[3]}<br/>公共服务：${values[4]}<br/>青年吸引力：${values[5]}` },
      radar: {
        center: ["50%", "53%"], radius: "62%", splitNumber: 4,
        indicator: ["人口增量", "就业机会", "收入水平", "产业活跃度", "公共服务", "青年吸引力"].map((name) => ({ name, max: 100 })),
        axisName: { color: "#91aaad", fontSize: 10 }, axisLine: { lineStyle: { color: "rgba(117,185,183,.17)" } },
        splitLine: { lineStyle: { color: "rgba(117,185,183,.12)" } }, splitArea: { areaStyle: { color: ["rgba(61,217,197,.015)", "rgba(61,217,197,.035)"] } }
      },
      series: [{ type: "radar", data: [{ value: values, name: city.name }], symbol: "circle", symbolSize: 5, lineStyle: { color: colors.teal, width: 2 }, itemStyle: { color: colors.orange }, areaStyle: { color: "rgba(61,217,197,.25)" } }]
    }, true);
  }

  function renderProfileTrend(cityName) { charts["profile-trend-chart"].setOption(cityTrendOption(cityName, "profile-trend-chart"), true); }

  function renderSankey() {
    charts["sankey-chart"].setOption({
      animationDuration: 800,
      tooltip: { ...tooltip, trigger: "item", formatter(params) { return params.dataType === "edge" ? `<b>${params.data.source} → ${params.data.target}</b><br/>迁徙流量指数：${params.data.value}` : `<b>${params.name}</b><br/>点击或悬停查看关联流向`; } },
      series: [{
        type: "sankey", left: 28, right: 32, top: 24, bottom: 24,
        data: data.sankey.nodes, links: data.sankey.links, nodeWidth: 9, nodeGap: 17, draggable: true,
        emphasis: { focus: "adjacency" },
        label: { color: "#a8bdbe", fontSize: 10 },
        itemStyle: { color: colors.teal, borderWidth: 0 },
        levels: [
          { depth: 0, itemStyle: { color: colors.blue }, lineStyle: { color: "source", opacity: .28 } },
          { depth: 1, itemStyle: { color: colors.orange }, lineStyle: { color: "gradient", opacity: .34 } }
        ],
        lineStyle: { color: "gradient", curveness: .52, opacity: .3 }
      }]
    });
  }

  function renderHeatmap() {
    const heatData = [];
    data.clusterHeatmap.values.forEach((row, y) => row.forEach((value, x) => heatData.push([x, y, value])));
    charts["cluster-heatmap-chart"].setOption({
      animationDuration: 750,
      grid: { left: 84, right: 24, top: 24, bottom: 64 },
      tooltip: { ...tooltip, position: "top", formatter: (p) => `<b>${data.clusterHeatmap.groups[p.value[1]].replace("\n", "")}</b><br/>${data.clusterHeatmap.dimensions[p.value[0]]}：<span style="color:${colors.orange}">${p.value[2]} 分</span>` },
      xAxis: { type: "category", data: data.clusterHeatmap.dimensions, splitArea: { show: false }, axisLabel: { ...axisLabel, interval: 0, rotate: 30 }, axisLine: { lineStyle: { color: colors.grid } }, axisTick: { show: false } },
      yAxis: { type: "category", inverse: true, data: data.clusterHeatmap.groups, axisLabel: { ...axisLabel, color: "#9eb5b6", lineHeight: 14 }, axisLine: { show: false }, axisTick: { show: false } },
      visualMap: { min: 70, max: 100, calculable: false, orient: "horizontal", left: "center", bottom: 9, itemWidth: 110, itemHeight: 6, text: ["高", "低"], textStyle: axisLabel, inRange: { color: ["#163843", "#28736f", colors.teal, colors.orange] } },
      series: [{ type: "heatmap", data: heatData, label: { show: true, color: "#eaf5f3", fontSize: 10 }, itemStyle: { borderColor: "#0a1c24", borderWidth: 4 }, emphasis: { itemStyle: { shadowBlur: 14, shadowColor: "rgba(61,217,197,.35)" } } }]
    });
  }

  function cityMapValue(city) {
    const coords = data.cityCoordinates[city.name];
    return coords ? [...coords, scaleByYear(city.value)] : null;
  }

  function flowLine(flow, index) {
    const source = data.cityCoordinates[flow.source];
    const target = data.cityCoordinates[flow.target];
    if (!source || !target) return null;
    return { fromName: flow.source, toName: flow.target, coords: [source, target], value: scaleByYear(flow.value, index) };
  }

  async function loadAndRenderMap() {
    try {
      const response = await fetch("data/china.json");
      if (!response.ok) throw new Error(`地图数据请求失败：${response.status}`);
      const geoJson = await response.json();
      echarts.registerMap("china-flow", geoJson);
      mapLoaded = true;
      renderMap();
    } catch (error) {
      mapLoaded = false;
      const mapElement = document.getElementById("china-map");
      if (charts["china-map"]) charts["china-map"].dispose();
      delete charts["china-map"];
      mapElement.innerHTML = `<div class="map-error"><div><strong>地图边界未能加载</strong><br/>请通过 VS Code Live Server 访问本项目，不要直接双击 HTML 文件。<br/><small>${error.message}</small></div></div>`;
      window.dispatchEvent(new CustomEvent("flowchina:map-error", { detail: error.message }));
    }
  }

  function renderMap() {
    if (!mapLoaded || !charts["china-map"]) return;
    const inflowCities = data.mapCities.filter((item) => item.type === "inflow").map((item) => ({ name: item.name, value: cityMapValue(item), flowType: item.type })).filter((item) => item.value);
    const outflowCities = data.mapCities.filter((item) => item.type === "outflow").map((item) => ({ name: item.name, value: cityMapValue(item), flowType: item.type })).filter((item) => item.value);
    const lines = data.migrationFlows.map(flowLine).filter(Boolean);

    charts["china-map"].setOption({
      animationDurationUpdate: 650,
      tooltip: {
        ...tooltip,
        trigger: "item",
        formatter(params) {
          if (params.seriesType === "effectScatter") {
            const isIn = params.data.flowType === "inflow";
            return `<b>${params.name}</b><br/>${isIn ? "净流入" : "净流出"}：<span style="color:${isIn ? colors.teal : colors.orange}">${params.value[2]} 万人</span><br/><span style="color:#718e93">点击查看城市信息</span>`;
          }
          if (params.seriesType === "lines") return `<b>${params.data.fromName} → ${params.data.toName}</b><br/>流量指数：${params.data.value}`;
          return params.name || "";
        }
      },
      geo: {
        map: "china-flow", roam: true, center: [104.4, 35.8], zoom: 1.08,
        scaleLimit: { min: .9, max: 4 },
        layoutCenter: ["51%", "54%"], layoutSize: "99%",
        label: { show: false },
        itemStyle: { areaColor: "#0d2b35", borderColor: "rgba(81,161,164,.45)", borderWidth: .7 },
        emphasis: { label: { show: true, color: "#dceceb", fontSize: 9 }, itemStyle: { areaColor: "#16424a", borderColor: colors.teal } },
        select: { disabled: true }
      },
      series: [
        {
          name: "迁徙流向", type: "lines", coordinateSystem: "geo", zlevel: 2, effect: { show: true, period: 5.8, trailLength: .25, symbol: "arrow", symbolSize: 4, color: colors.teal },
          lineStyle: { color: colors.teal, width: .8, opacity: .34, curveness: .24 }, emphasis: { lineStyle: { opacity: .9, width: 1.5 } }, data: lines
        },
        {
          name: "净流入城市", type: "effectScatter", coordinateSystem: "geo", zlevel: 3, data: inflowCities, rippleEffect: { period: 4.5, scale: 3, brushType: "stroke" },
          symbolSize: (value) => Math.max(7, Math.min(15, 5 + value[2] / 5)), itemStyle: { color: colors.teal, shadowBlur: 12, shadowColor: colors.teal }, emphasis: { scale: 1.4 },
          label: { show: true, position: "right", distance: 5, color: "rgba(213,235,233,.8)", fontSize: 8, formatter: "{b}" },
          labelLayout: { hideOverlap: true }
        },
        {
          name: "净流出城市", type: "effectScatter", coordinateSystem: "geo", zlevel: 3, data: outflowCities, rippleEffect: { period: 5.2, scale: 2.5, brushType: "stroke" },
          symbolSize: (value) => Math.max(6, Math.min(12, 4 + value[2] / 6)), itemStyle: { color: colors.orange, shadowBlur: 9, shadowColor: colors.orange }, emphasis: { scale: 1.35 },
          label: { show: false }
        }
      ]
    }, true);

    charts["china-map"].off("click");
    charts["china-map"].on("click", (params) => {
      if (params.seriesType === "effectScatter") {
        window.dispatchEvent(new CustomEvent("flowchina:map-city", { detail: { name: params.name, value: params.value[2], type: params.data.flowType } }));
      }
    });
  }

  function resetMap() {
    if (!mapLoaded || !charts["china-map"]) return;
    renderMap();
  }

  function updateYear(year) {
    activeYear = Number(year);
    renderRankings();
    renderNationalTrend();
    renderMap();
    const selectedTrendCity = document.getElementById("trend-city-select")?.value || activeCity;
    renderCityTrend(selectedTrendCity);
    renderProfileTrend(activeCity);
  }

  function updateCity(cityName) {
    activeCity = cityName;
    if (charts["radar-chart"]) renderRadar(cityName);
    if (charts["profile-trend-chart"]) renderProfileTrend(cityName);
  }

  function resizeAll() {
    Object.values(charts).forEach((chart) => { if (chart && !chart.isDisposed()) chart.resize(); });
  }

  async function init() {
    if (!window.echarts) throw new Error("ECharts 未加载，请检查网络连接或 CDN 地址。");
    ["inflow-chart", "china-map", "attraction-chart", "national-trend-chart", "outflow-chart", "region-donut-chart", "city-trend-chart", "radar-chart", "profile-trend-chart", "sankey-chart", "cluster-heatmap-chart"].forEach(createChart);
    renderRankings();
    renderAttraction();
    renderNationalTrend();
    renderRegionDonut();
    renderCityTrend(activeCity);
    renderRadar(activeCity);
    renderProfileTrend(activeCity);
    renderSankey();
    renderHeatmap();
    await loadAndRenderMap();
    return { mapLoaded };
  }

  return { init, updateYear, updateCity, renderCityTrend, resetMap, resizeAll, getActiveYear: () => activeYear, getMapStatus: () => mapLoaded };
})();
