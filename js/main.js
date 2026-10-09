/**
 * 流动中国 · 页面交互入口
 * 负责筛选器、城市画像联动、数字动画、滚动导航与背景粒子。
 */
document.addEventListener("DOMContentLoaded", () => {
  const data = window.FlowChinaData;
  const charts = window.FlowChinaCharts;
  let selectedYear = 2025;
  let selectedCity = "北京";
  let toastTimer = null;
  let resizeTimer = null;
  let pendingMapCity = null;

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  function showToast(message, duration = 2400) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
  }

  function animateNumber(element, target, decimals = 0) {
    if (!element) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = Number(element.dataset.current || 0);
    const duration = reduceMotion ? 0 : 680;
    const startTime = performance.now();

    function update(now) {
      const progress = duration === 0 ? 1 : Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = start + (target - start) * eased;
      element.textContent = value.toLocaleString("zh-CN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      if (progress < 1) requestAnimationFrame(update);
      else element.dataset.current = String(target);
    }
    requestAnimationFrame(update);
  }

  function populateControls() {
    const yearSelect = $("#year-select");
    data.years.forEach((year) => yearSelect.add(new Option(`${year} 年`, String(year), year === selectedYear, year === selectedYear)));

    const trendCitySelect = $("#trend-city-select");
    data.profileCities.forEach((city) => trendCitySelect.add(new Option(city.name, city.name, city.name === selectedCity, city.name === selectedCity)));

    const selector = $("#city-selector");
    data.profileCities.forEach((city) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `city-button${city.name === selectedCity ? " active" : ""}`;
      button.dataset.city = city.name;
      button.setAttribute("aria-pressed", city.name === selectedCity ? "true" : "false");
      button.textContent = city.name;
      selector.appendChild(button);
    });

    const insightList = $("#insight-list");
    data.insights.forEach((insight, index) => {
      const article = document.createElement("article");
      article.className = "insight-card";
      article.dataset.index = String(index + 1).padStart(2, "0");
      article.innerHTML = `<h3>${insight.title}</h3><p>${insight.text}</p>`;
      insightList.appendChild(article);
    });

    const formulaParts = $("#formula-parts");
    data.weights.forEach((weight) => {
      const part = document.createElement("div");
      part.className = "formula-part";
      part.innerHTML = `<span>${weight.name}</span><b>× ${weight.value}%</b>`;
      formulaParts.appendChild(part);
    });
  }

  function getScaledInflow(cityName) {
    const base = data.inflowRanking.find((item) => item.name === cityName)?.value || data.profileCities.find((item) => item.name === cityName)?.netInflow || 0;
    return +(base * (data.yearFactors[selectedYear] || 1)).toFixed(1);
  }

  function updateMetrics() {
    const yearIndex = data.years.indexOf(selectedYear);
    const averageAttraction = data.profileCities.reduce((sum, city) => sum + city.attraction, 0) / data.profileCities.length;
    const values = {
      cityCount: data.mapCities.length,
      totalChange: data.nationalTrend.populationChange[yearIndex],
      inflowCount: data.inflowRanking.filter((item, index) => item.value * (data.yearFactors[selectedYear] || 1) > 7 + index * .25).length,
      avgAttraction: averageAttraction
    };
    $$(".counter").forEach((element) => {
      const key = element.dataset.metric;
      animateNumber(element, values[key], key === "avgAttraction" ? 1 : 0);
    });
  }

  function dimensionRanks(city) {
    const metrics = [
      ["综合吸引力", "attraction"], ["就业机会", "employment"], ["青年吸引力", "youth"],
      ["产业活跃度", "industry"], ["收入水平", "income"], ["公共服务", "publicService"]
    ];
    return metrics.map(([label, key]) => {
      const sorted = [...data.profileCities].sort((a, b) => b[key] - a[key]);
      return { label, rank: sorted.findIndex((item) => item.name === city.name) + 1, score: city[key] };
    });
  }

  function updateCityProfile(cityName, notify = false) {
    const city = data.profileCities.find((item) => item.name === cityName);
    if (!city) return false;
    selectedCity = cityName;
    const yearIndex = data.years.indexOf(selectedYear);
    $("#city-code").textContent = city.code;
    $("#profile-city-name").textContent = city.name;
    $("#profile-city-en").textContent = city.en;
    $("#profile-city-region").textContent = city.region;
    $("#city-insight").textContent = `“${city.insight}”`;

    const metricData = [
      ["人口变化", city.yearlyChange[yearIndex], "万人"], ["净流入量", getScaledInflow(city.name), "万人"],
      ["吸引力指数", city.attraction, "分"], ["就业指数", city.employment, "分"],
      ["青年人口指数", city.youth, "分"], ["产业活跃指数", city.industry, "分"]
    ];
    $("#city-metrics").innerHTML = metricData.map(([label, value, unit]) => `<div class="city-metric"><span>${label}</span><strong>${value}</strong><em>${unit}</em></div>`).join("");

    $("#indicator-rank-list").innerHTML = dimensionRanks(city).map((item) => `<div class="rank-item"><span>${item.label}<b>第 ${item.rank} 名</b></span><div class="rank-track"><i style="--score:${item.score}%"></i></div></div>`).join("");

    $$(".city-button").forEach((button) => {
      const active = button.dataset.city === cityName;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    charts.updateCity(cityName);
    if (notify) showToast(`已切换至 ${cityName} 城市画像`);
    return true;
  }

  function updateYear(year) {
    selectedYear = Number(year);
    $("#year-status").textContent = `当前展示 ${selectedYear} 年样本`;
    updateMetrics();
    updateCityProfile(selectedCity);
    charts.updateYear(selectedYear);
    showToast(`已更新为 ${selectedYear} 年示例数据`);
  }

  function updateMapFocus(detail) {
    pendingMapCity = detail.name;
    const direction = detail.type === "inflow" ? "净流入" : "净流出";
    $("#map-focus-city").textContent = detail.name;
    $("#map-focus-detail").textContent = `${selectedYear} 年${direction}示例值 ${detail.value} 万人`;
    const profileAvailable = data.profileCities.some((city) => city.name === detail.name);
    $("#map-profile-button").hidden = !profileAvailable;
  }

  function resetMapFocus() {
    pendingMapCity = null;
    $("#map-focus-city").textContent = "全国迁徙网络";
    $("#map-focus-detail").textContent = "点击地图城市点查看流入与流出信息";
    $("#map-profile-button").hidden = true;
  }

  function bindInteractions() {
    $("#year-select").addEventListener("change", (event) => updateYear(event.target.value));
    $("#trend-city-select").addEventListener("change", (event) => {
      charts.renderCityTrend(event.target.value);
      showToast(`趋势图已切换至 ${event.target.value}`);
    });
    $("#city-selector").addEventListener("click", (event) => {
      const button = event.target.closest(".city-button");
      if (button) updateCityProfile(button.dataset.city, true);
    });
    $("#map-reset").addEventListener("click", () => {
      charts.resetMap();
      resetMapFocus();
      showToast(charts.getMapStatus() ? "地图视图已重置" : "地图尚未加载，请使用 Live Server 运行");
    });
    $("#map-profile-button").addEventListener("click", () => {
      if (!pendingMapCity || !updateCityProfile(pendingMapCity)) return;
      $("#city-profile").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    window.addEventListener("flowchina:map-city", (event) => updateMapFocus(event.detail));
    window.addEventListener("flowchina:map-error", () => showToast("地图加载失败：请使用 Live Server 运行项目", 4200));

    $$(".nav-link, .brand").forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        const target = id && document.querySelector(id);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });

    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => charts.resizeAll(), 120);
    });
  }

  function setupScrollObservers() {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: "0px 0px -5%" });
    $$(".reveal").forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 4, 2) * 80}ms`;
      revealObserver.observe(element);
    });

    const sections = $$("[data-section]");
    const navObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      $$(".nav-link").forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`));
    }, { rootMargin: "-20% 0px -65%", threshold: [0, .2, .5] });
    sections.forEach((section) => navObserver.observe(section));

    window.addEventListener("scroll", () => $("#site-header").classList.toggle("scrolled", window.scrollY > 24), { passive: true });
  }

  function setupParticles() {
    const canvas = $("#particle-canvas");
    const context = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let ratio = 1;
    let particles = [];

    function resize() {
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(16, Math.min(42, Math.round(width / 44)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: (index * 83.7) % width, y: (index * 127.3) % height,
        r: .5 + (index % 3) * .35, vx: .04 + (index % 4) * .025, vy: -.03 - (index % 3) * .02, alpha: .08 + (index % 5) * .025
      }));
    }

    function draw() {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        if (particle.x > width + 4) particle.x = -4;
        if (particle.y < -4) particle.y = height + 4;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        context.fillStyle = `rgba(91, 224, 207, ${particle.alpha})`;
        context.fill();
      });
      if (!reduceMotion) requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
  }

  async function start() {
    populateControls();
    bindInteractions();
    setupScrollObservers();
    setupParticles();
    updateMetrics();
    updateCityProfile(selectedCity);

    try {
      await charts.init();
      charts.updateYear(selectedYear);
    } catch (error) {
      showToast(error.message || "可视化初始化失败，请检查网络后刷新", 5000);
      document.querySelectorAll(".chart").forEach((element) => {
        if (!element.children.length) element.innerHTML = `<div class="map-error">${error.message || "图表初始化失败"}</div>`;
      });
    } finally {
      setTimeout(() => $("#loading-screen").classList.add("hidden"), 520);
    }
  }

  start();
});
