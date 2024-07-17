---
date: 2024-7-8
title: 图表库选型——G2 vs ECharts 🔥
tags:
  - work
describe: 图表库选型——G2 vs ECharts 🔥
---

## G2

[G2](https://g2.antv.antgroup.com/) 作为底层依赖，使用了图形语法，上手成本相对较高，功能强大

### G2Plot

[G2Plot](https://g2plot.antv.antgroup.com/) 是在 G2 基础上，屏蔽复杂概念的前提下，保留 G2 强大图形能力，通过 Adaptor 将 G2 能力转换成 config 的形势透出，封装出业务上常用的统计图表库，开箱即用、易于配置。

如果是在项目中使用，推荐使用 G2Plot，而不是直接使用 G2。

### Ant Design Charts

[Ant Design Charts](https://ant-design-charts.antgroup.com/) 基于 G2Plot，弥补 Ant Design 组件库在统计图表上的缺失，作为 Ant Design 的官方图表组件解决方案。G2Plot 的 React 版本，基于 React 封装了 G2Plot，React 项目使用最佳。

网友评论：全是 kpi 项目，不好用 😅

## ECharts

ECharts 简单好用、文档比较丰富，尤其 ECharts 的配置非常清晰，默认颜色虽然丑，但它是可以改颜色的。

## 对比

因为是在 Vue 项目中使用，重点对比 G2Plot 和 ECharts。

### Github star 数

- G2Plot: 2.5k
- ECharts: 59.4k

通过 star 数来看，ECharts 碾压 G2Plot，我们知道 star 数体现了项目的受欢迎程度，通常来说，一个高星数的项目可能在功能、文档、稳定性等方面做得比较好，能够满足较多用户的需求。并且 star 数也体现了社区活跃度，高 star 代表这高的社区活跃度。

单从这方面来看，ECharts 显然是更好的选择。

### 功能点

G2Plot 和 ECharts 的图表种类都很丰富，支持多种类型的图表，包括折线图、柱状图、饼图、散点图等，ECharts 还支持地图和 3D 图表。

### 易用性

G2Plot 和 ECharts 都提供了大量的图表实例，方便开发者参考和学习，但大多数网友认为 G2 的文档比较乱，没有 ECharts 的清晰。

ECharts 拥有非常详细和灵活的配置项，很方便的对各个方面进行定制，如样式、动画、交互、数据处理等，通过配置和编程实现高度自定义的图表效果。

## 最终选择 ECharts

ECharts 支持[按需加载](https://echarts.apache.org/handbook/zh/basics/import)
