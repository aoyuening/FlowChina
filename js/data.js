/**
 * 流动中国 · 演示数据中心
 * 说明：以下数值为数据可视化作品的示例演示数据，不代表官方统计结果。
 * 正式比赛请使用国家统计局、统计年鉴、统计公报等公开权威数据替换。
 */
window.FlowChinaData = (() => {
  const years = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const yearFactors = { 2018: 0.62, 2019: 0.74, 2020: 0.32, 2021: 0.66, 2022: 0.49, 2023: 0.79, 2024: 0.91, 2025: 1 };

  const cityCoordinates = {
    北京: [116.40, 39.90], 上海: [121.47, 31.23], 深圳: [114.06, 22.55], 广州: [113.26, 23.13],
    杭州: [120.16, 30.25], 成都: [104.07, 30.67], 武汉: [114.31, 30.52], 苏州: [120.58, 31.30],
    南京: [118.80, 32.06], 重庆: [106.55, 29.56], 西安: [108.94, 34.34], 郑州: [113.62, 34.75],
    天津: [117.20, 39.12], 石家庄: [114.51, 38.04], 哈尔滨: [126.64, 45.76], 长春: [125.32, 43.82],
    太原: [112.55, 37.87], 南昌: [115.86, 28.68], 兰州: [103.84, 36.06], 呼和浩特: [111.75, 40.84],
    沈阳: [123.43, 41.80], 贵阳: [106.63, 26.65], 合肥: [117.23, 31.82], 福州: [119.30, 26.08],
    昆明: [102.71, 25.04], 济南: [117.12, 36.65], 青岛: [120.38, 36.07], 长沙: [112.94, 28.23]
  };

  const profileCities = [
    {
      name: "北京", en: "BEIJING", code: "CN·BJ", region: "京津冀城市群", populationChange: 8.6, netInflow: 13.8,
      attraction: 86.2, employment: 91, youth: 82, industry: 90, income: 94, publicService: 93,
      yearlyChange: [3.2, 4.5, -1.1, 2.8, 1.6, 5.1, 7.2, 8.6],
      insight: "高质量就业与公共服务形成稳定吸引力，但生活成本使青年人口吸引力略低于就业表现。"
    },
    {
      name: "上海", en: "SHANGHAI", code: "CN·SH", region: "长三角城市群", populationChange: 10.4, netInflow: 17.9,
      attraction: 88.7, employment: 93, youth: 86, industry: 94, income: 96, publicService: 92,
      yearlyChange: [5.1, 6.9, -0.6, 4.2, 2.3, 6.6, 8.9, 10.4],
      insight: "收入、产业与就业三项指标表现均衡，叠加长三角协同效应，综合吸引力保持在样本前列。"
    },
    {
      name: "深圳", en: "SHENZHEN", code: "CN·SZ", region: "粤港澳大湾区", populationChange: 28.2, netInflow: 42.6,
      attraction: 92.4, employment: 95, youth: 96, industry: 98, income: 91, publicService: 82,
      yearlyChange: [16.5, 21.4, 8.2, 19.8, 13.5, 22.7, 26.1, 28.2],
      insight: "产业活跃度与青年人口吸引力构成主要优势，是样本中人口增量和创新就业联动最明显的城市。"
    },
    {
      name: "杭州", en: "HANGZHOU", code: "CN·HZ", region: "长三角城市群", populationChange: 23.7, netInflow: 35.4,
      attraction: 90.1, employment: 92, youth: 94, industry: 96, income: 88, publicService: 86,
      yearlyChange: [12.8, 16.6, 7.4, 17.9, 12.1, 19.6, 22.3, 23.7],
      insight: "数字产业与青年人才形成相互强化的增长回路，城市吸引力在样本期内保持较高稳定性。"
    },
    {
      name: "成都", en: "CHENGDU", code: "CN·CD", region: "成渝城市群", populationChange: 20.5, netInflow: 31.8,
      attraction: 87.5, employment: 88, youth: 93, industry: 89, income: 80, publicService: 88,
      yearlyChange: [10.7, 14.1, 6.6, 15.2, 11.6, 17.3, 19.4, 20.5],
      insight: "青年吸引力与公共服务是突出长板，区域中心功能带动人口由省内及西部周边持续集聚。"
    },
    {
      name: "武汉", en: "WUHAN", code: "CN·WH", region: "长江中游城市群", populationChange: 17.2, netInflow: 26.1,
      attraction: 84.6, employment: 86, youth: 91, industry: 87, income: 78, publicService: 90,
      yearlyChange: [9.8, 12.2, -2.8, 10.9, 8.3, 13.7, 15.8, 17.2],
      insight: "高校资源与综合公共服务支撑青年人口吸引力，产业转化效率是进一步提升综合指数的关键。"
    }
  ];

  const inflowRanking = [
    { name: "深圳", value: 42.6 }, { name: "杭州", value: 35.4 }, { name: "成都", value: 31.8 },
    { name: "广州", value: 29.7 }, { name: "武汉", value: 26.1 }, { name: "苏州", value: 23.8 },
    { name: "上海", value: 17.9 }, { name: "南京", value: 16.2 }, { name: "重庆", value: 14.9 }, { name: "北京", value: 13.8 }
  ];

  const outflowRanking = [
    { name: "哈尔滨", value: 20.8 }, { name: "石家庄", value: 18.6 }, { name: "长春", value: 16.7 },
    { name: "太原", value: 15.4 }, { name: "南昌", value: 13.8 }, { name: "兰州", value: 12.6 },
    { name: "天津", value: 11.9 }, { name: "呼和浩特", value: 10.7 }, { name: "沈阳", value: 9.8 }, { name: "贵阳", value: 8.9 }
  ];

  const mapCities = [
    ...inflowRanking.map((item) => ({ ...item, type: "inflow" })),
    ...outflowRanking.slice(0, 6).map((item) => ({ ...item, type: "outflow" }))
  ];

  const migrationFlows = [
    { source: "郑州", target: "北京", value: 20 }, { source: "郑州", target: "上海", value: 15 },
    { source: "石家庄", target: "北京", value: 14 }, { source: "哈尔滨", target: "北京", value: 11 },
    { source: "合肥", target: "杭州", value: 18 }, { source: "南昌", target: "杭州", value: 13 },
    { source: "武汉", target: "深圳", value: 17 }, { source: "长沙", target: "深圳", value: 15 },
    { source: "重庆", target: "成都", value: 16 }, { source: "贵阳", target: "成都", value: 12 },
    { source: "福州", target: "广州", value: 10 }, { source: "济南", target: "苏州", value: 9 }
  ];

  const nationalTrend = {
    populationChange: [122, 148, 61, 137, 96, 164, 188, 207],
    netInflow: [96, 118, 43, 109, 72, 131, 152, 171]
  };

  const regionShare = [
    { name: "东部", value: 46 }, { name: "中部", value: 22 }, { name: "西部", value: 23 }, { name: "东北", value: 9 }
  ];

  const sankey = {
    nodes: ["河南", "安徽", "湖北", "四川", "湖南", "江西", "北京", "上海", "杭州", "武汉", "成都", "深圳"].map((name) => ({ name })),
    links: [
      { source: "河南", target: "北京", value: 18 }, { source: "河南", target: "上海", value: 14 },
      { source: "安徽", target: "杭州", value: 22 }, { source: "安徽", target: "上海", value: 11 },
      { source: "湖北", target: "武汉", value: 26 }, { source: "湖北", target: "深圳", value: 12 },
      { source: "四川", target: "成都", value: 29 }, { source: "四川", target: "深圳", value: 9 },
      { source: "湖南", target: "深圳", value: 16 }, { source: "湖南", target: "武汉", value: 8 },
      { source: "江西", target: "杭州", value: 13 }, { source: "江西", target: "上海", value: 10 }
    ]
  };

  const clusterHeatmap = {
    groups: ["长三角", "粤港澳\n大湾区", "京津冀", "成渝", "长江中游\n城市群"],
    dimensions: ["人口增量", "就业机会", "收入水平", "产业活跃", "公共服务", "青年吸引"],
    values: [
      [87, 91, 93, 94, 89, 90],
      [91, 94, 92, 97, 85, 95],
      [76, 89, 91, 87, 92, 80],
      [84, 86, 78, 88, 86, 92],
      [80, 84, 75, 83, 88, 89]
    ]
  };

  const weights = [
    { name: "人口增量", value: 25 }, { name: "就业机会", value: 20 }, { name: "收入水平", value: 15 },
    { name: "产业活跃度", value: 15 }, { name: "公共服务", value: 10 }, { name: "青年吸引力", value: 15 }
  ];

  const insights = [
    { title: "人口持续向核心城市群集聚", text: "样本流向中，长三角、粤港澳大湾区、成渝等城市群汇集了较多高强度迁徙联系。" },
    { title: "新一线城市青年吸引力较高", text: "杭州、成都、武汉在青年人口吸引力维度表现突出，与产业机会和生活服务共同形成吸引。" },
    { title: "两大沿海城市群保持较强吸附力", text: "长三角与粤港澳大湾区在就业、收入和产业活跃度上呈现较均衡的高分结构。" },
    { title: "人口流入与产业发展呈同向关系", text: "在当前样本中，产业活跃度较高的城市通常也具有更高的净流入规模，二者呈明显同向变化。" },
    { title: "省内与城市群内部流动占比较高", text: "桑基关系显示，省会及区域中心城市承接了相当比例的省内流动，近距离迁徙仍是重要组成。" },
    { title: "公共服务强化长期吸引力", text: "北京、上海、武汉等城市的公共服务维度较高，为就业之外的长期人口留存提供支撑。" }
  ];

  return {
    disclaimer: "示例演示数据，正式比赛请替换为公开权威数据",
    years, yearFactors, cityCoordinates, profileCities, inflowRanking, outflowRanking,
    mapCities, migrationFlows, nationalTrend, regionShare, sankey, clusterHeatmap, weights, insights
  };
})();
