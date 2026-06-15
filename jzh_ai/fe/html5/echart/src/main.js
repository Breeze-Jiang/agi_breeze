import './style.css';
import * as echarts from 'echarts';
import { months, shoeSales } from './data.js';

// 初始化图表
const chartDom = document.getElementById('chart');
const myChart = echarts.init(chartDom);

// 配置项
const option = {
  title: {
    text: '肖氏电商集团 — 2025年运动鞋月度销售额（百万元）',
    left: 'center',
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
    valueFormatter: (value) => `${value} 百万元`,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: months,
    axisLabel: {
      rotate: 30,
    },
  },
  yAxis: {
    type: 'value',
    name: '销售额（百万元）',
    min: 0,
    max: 18,
    interval: 2,
  },
  series: [
    {
      name: '运动鞋销售额',
      type: 'bar',
      data: shoeSales,
      itemStyle: {
        color: '#646cff',
        borderRadius: [4, 4, 0, 0],
      },
      emphasis: {
        itemStyle: {
          color: '#4b4fcc',
        },
      },
      label: {
        show: true,
        position: 'top',
        formatter: '{c}',
        fontSize: 11,
      },
    },
  ],
};

// 设置配置项并渲染
myChart.setOption(option);

// 响应式调整
window.addEventListener('resize', () => {
  myChart.resize();
});
