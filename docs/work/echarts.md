---
date: 2024-6-14
title: vue3 项目使用Echarts使用记录
tags:
  - work
describe: Echarts使用记录
---

## 按需引入 ECharts 图表和组件

项目中只需要使用 ECharts 中的柱状图、折线图和饼图等基本图表类型，全量引入过大。考虑使用按需引入的方式，仅导入我们用到的图表组件：

1. 添加 echarts 依赖

   ```bash
   npm install echarts --save
   ```

2. 生成 echarts.js 文件，按需加载的文件

   ```js
   import * as echarts from 'echarts/core'
   import { BarChart, LineChart, PieChart } from 'echarts/charts'
   import {
     TitleComponent,
     TooltipComponent,
     GridComponent,
     // 数据集组件
     DatasetComponent,
     // 内置数据转换器组件 (filter, sort)
     TransformComponent,
     // legend图例
     LegendComponent,
     // 工具栏。内置有导出图片，数据视图，动态类型切换，数据区域缩放，重置五个工具。
     ToolboxComponent,
   } from 'echarts/components'
   import { LabelLayout, UniversalTransition } from 'echarts/features'
   import { CanvasRenderer } from 'echarts/renderers'
   import type {
     // 系列类型的定义后缀都为 SeriesOption
     BarSeriesOption,
     LineSeriesOption,
     PieSeriesOption,
   } from 'echarts/charts'
   import type {
     // 组件类型的定义后缀都为 ComponentOption
     TitleComponentOption,
     TooltipComponentOption,
     GridComponentOption,
     DatasetComponentOption,
     LegendComponentOption,
     ToolboxComponentOption,
   } from 'echarts/components'
   import type { ComposeOption } from 'echarts/core'

   // 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
   export type ECOption = ComposeOption<
     | BarSeriesOption
     | LineSeriesOption
     | PieSeriesOption
     | TitleComponentOption
     | LegendComponentOption
     | ToolboxComponentOption
     | TooltipComponentOption
     | GridComponentOption
     | DatasetComponentOption
   >

   // 注册必须的组件
   echarts.use([
     TitleComponent,
     LegendComponent,
     ToolboxComponent,
     TooltipComponent,
     GridComponent,
     DatasetComponent,
     TransformComponent,
     BarChart,
     LineChart,
     PieChart,
     LabelLayout,
     UniversalTransition,
     CanvasRenderer,
   ])

   export { echarts }
   ```

   这样在 vue 文件中需要使用 ECharts 时可以直接引入封装好的 echarts.ts ，当增加了新的图表类型（如雷达图、热力图、桑基图等）时直接修改 echarts.ts 文件就可以，提高使用按需引入的便捷性

## 组件封装

### Hooks

封装一个统一的 useEChart Hook 函数，主要功能：

1. 统一绘制图表方法
2. 监听 props 变化，重新绘制
3. 监听 resize 变化，执行 resize 事件
4. 修改默认图表颜色，用 Antv G2 的配色方案（没话说，就是好看 😄）
5. 函数接收 customOptions 修改默认配置，这样方便所有图表共同使用

```js
import type { ShallowRef } from 'vue'
import { onMounted, ref } from 'vue'
import { debounce } from 'lodash'
import type { EChartsType } from 'echarts/types/dist/core'
import { type ECOption, echarts } from '@/utils/echarts'
import type {
  DataZoomComponentOption,
  LegendComponentOption,
  LineSeriesOption,
  XAXisOption,
  YAXisOption,
} from 'echarts/types/dist/shared'
/** category 默认配色 来源：https://github.com/antvis/G2/blob/v5/src/theme/light.ts */
export const CATEGORY_COLORS: string[] = [
  '#1783FF',
  '#F0884D',
  '#D580FF',
  '#7863FF',
  '#60C42D',
  '#BD8F24',
  '#FF80CA',
  '#2491B3',
  '#17C76F',
]

export default function useChart(props, customOptions?: ECOption) {
  /** 所有图表的默认配置 */
  const DEFAULT_OPTIONS: ECOption = {
    series: [
      {
        name: '数量',
        type: 'line',
        emphasis: {
          focus: 'self',
        },
        label: {
          show: true,
          position: 'inside',
          color: '#fff',
        },
        data: props.data,
      },
    ],
    xAxis: [
      {
        type: 'category',
        axisTick: {
          show: false,
        },
        data: props.xAxisData,
      },
    ],
    yAxis: [
      {
        type: 'value',
        minInterval: 1,
      },
    ],
    legend: {
      show: true,
      type: 'scroll',
      orient: 'horizontal',
      top: 25,
      left: 'center',
    },
  }
  // 要渲染的Dom元素
  const chartDom: Ref<HTMLDivElement | null> = ref(null)
  // 渲染的chart对象要用shallowRef
  const chart: ShallowRef<EChartsType | null | undefined> = shallowRef(null)

  const getHeight = computed(() => {
    return typeof props.height === 'number' ? `${props.height}px` : props.height
  })

  watch(() => props, drawChart, {
    deep: true,
  })

  // 绘制
  function drawChart() {
    const getSingleOption = (type) =>
      props[type] ? props[type] : customOptions?.[type] || DEFAULT_OPTIONS[type]

    const series: LineSeriesOption[] = getSingleOption('series')
    const xAxis: XAXisOption[] = getSingleOption('xAxis')
    const yAxis: YAXisOption[] = getSingleOption('yAxis')
    const legend: LegendComponentOption = getSingleOption('legend')
    const dataZoom: DataZoomComponentOption[] = getSingleOption('dataZoom')

    const options: ECOption = {
      // category自定义颜色
      // https://echarts.apache.org/zh/option.html#color
      color: CATEGORY_COLORS,
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend,
      grid: {
        left: 10,
        right: 10,
        bottom: props.dataZoom ? 40 : 10,
        containLabel: true,
      },
      // 右上角工具栏
      toolbox: {
        show: false,
        feature: {
          magicType: {
            type: ['line', 'bar'],
          },
          dataView: {
            readOnly: false,
          },
          saveAsImage: {},
        },
      },
      dataset: {
        source: props.datasetSource,
      },
      xAxis,
      yAxis,
      dataZoom,
      series,
    }
    // 开启notMerge保证配置数据不会叠加
    chart.value?.setOption(options, {
      notMerge: true,
    })
  }

  // 使用防抖debounce函数，减少resize的次数
  const chartResizeHandler = debounce(() => chart.value?.resize(), 100)
  onMounted(() => window.addEventListener('resize', chartResizeHandler))
  onBeforeUnmount(() =>
    window.removeEventListener('resize', chartResizeHandler)
  )

  onMounted(() => {
    chart.value = echarts.init(chartDom.value)
    drawChart()
  })

  return {
    chartDom,
    getHeight,
  }
}
```

### 组件

```vue
// BarChart.vue
<template>
  <div ref="chartDom" :style="{ height: getHeight }"></div>
</template>

<script setup lang="ts">
import type {
  BarSeriesOption,
  DataZoomComponentOption,
  LegendComponentOption,
  XAXisOption,
  YAXisOption,
} from 'echarts/types/dist/shared'
const props = withDefaults(
  defineProps<{
    /** 数据 */
    data?: string | number[]
    /** x轴数据 */
    xAxisData?: string[]
    /** 系列配置 */
    series?: BarSeriesOption[]
    /** x轴配置 */
    xAxis?: XAXisOption[]
    /** y轴配置 */
    yAxis?: YAXisOption[]
    /** 图例配置 */
    legend?: LegendComponentOption
    /** 区域缩放配置 */
    dataZoom?: DataZoomComponentOption[]
    /** 图形高度 */
    height?: number | string
    /** 数据集 */
    datasetSource?: any[]
  }>(),
  {
    data: () => [],
    xAxisData: () => [],
  }
)
const { getHeight, chartDom } = useEChart(props)
</script>
```

```vue
// PieChart.vue
<template>
  <div ref="chartDom" :style="{ height: getHeight }"></div>
</template>

<script setup lang="ts">
import type {
  DataZoomComponentOption,
  LegendComponentOption,
  PieSeriesOption,
} from 'echarts/types/dist/shared'
import type { ECOption } from '@/utils/echarts'

const DEFAULT_OPTIONS: ECOption = {
  tooltip: {
    trigger: 'item',
  },
  legend: {
    orient: 'vertical',
    left: 'left',
  },
}
const props = withDefaults(
  defineProps<{
    /** 数据 */
    data?: { name: string; value: number }[]
    /** 系列配置 */
    series?: PieSeriesOption[]
    /** 图例配置 */
    legend?: LegendComponentOption
    /** 区域缩放配置 */
    dataZoom?: DataZoomComponentOption[]
    /** 图形高度 */
    height?: number | string
    /** 数据集 */
    datasetSource?: any[]
  }>(),
  {
    data: () => [],
  }
)
const { chartDom, getHeight } = useEChart(props, DEFAULT_OPTIONS)
</script>
```

扇形图默认的配置与 useEChart hooks 中提供的默认配置不通用，通过传入 DEFAULT_OPTIONS 传入扇形图的默认配置

### 使用

```html
<pie-chart
  :height="400"
  :x-axis="[{ type: 'category' }]"
  :dataset-source="dataset"
  :series="pieSeries"
/>

<line-chart
  :height="400"
  :x-axis="[{ type: 'category' }]"
  :dataset-source="dataset"
  :series="lineSeries"
/>
```
