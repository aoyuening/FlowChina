# 流动中国 · FLOWING CHINA

《流动中国——人口迁徙与城市吸引力数据可视化平台》是一个基于 HTML、CSS、JavaScript 与 ECharts 的单页交互式数据可视化作品。

## 本地运行

1. 使用 VS Code 打开 `FlowChina` 文件夹。
2. 安装扩展 **Live Server**。
3. 在 `index.html` 上右键，选择 **Open with Live Server**。
4. 推荐使用 Chrome 或 Edge，并在 1920×1080 或普通笔记本分辨率下浏览。

不要直接双击 `index.html`：浏览器的本地文件安全策略可能阻止 `data/china.json` 加载，从而导致地图无法显示。

## 文件说明

- `index.html`：页面结构与模块内容。
- `css/style.css`：完整视觉系统与响应式布局。
- `js/data.js`：页面运行使用的集中式演示数据。
- `js/charts.js`：ECharts 图表与地图配置。
- `js/main.js`：筛选、联动、滚动、数字动画等交互。
- `data/migration.json`：迁徙关系数据示例与替换字段说明。
- `data/china.json`：本地中国省级 GeoJSON 地图边界。

## 替换正式数据

正式提交前，主要替换 `js/data.js` 中的以下对象：

- `profileCities`：城市画像和年度趋势。
- `inflowRanking` / `outflowRanking`：净流入、净流出排名。
- `migrationFlows` / `sankey`：迁徙线路与省际关系。
- `nationalTrend` / `regionShare`：年度趋势与区域占比。
- `clusterHeatmap`：城市群对比数据。

页面所有人口与指数数值当前均为示例演示数据，不应作为官方统计结果引用。

## 地图排查

若地图无法显示：

1. 确认网址以 `http://127.0.0.1` 或 `http://localhost` 开头，而不是 `file:///`。
2. 确认 `data/china.json` 文件存在。
3. 打开浏览器开发者工具的 Network 面板，确认 `data/china.json` 返回 HTTP 200。
4. 确认网络可访问 jsDelivr，以加载 ECharts CDN；如比赛现场离线，请下载 `echarts.min.js` 到本地并修改 `index.html` 中的脚本路径。

