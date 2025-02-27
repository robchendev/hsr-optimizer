import tinygradient from 'tinygradient'
import { Constants } from './constants.ts'
import { OptimizerTabController } from './optimizerTabController'

let optimizerGridGradient = tinygradient([
  { color: '#5A1A06', pos: 0 }, // red
  { color: '#343127', pos: 0.35 },
  { color: '#38821F', pos: 1 }, // green
])
let relicGridGradient = tinygradient('#343127', '#38821F')
let relicColumnRanges

export const Gradient = {
  getColor: (decimal, gradient) => {
    return gradient.rgbAt(decimal).toHexString()
  },

  getOptimizerColumnGradient: (params) => {
    let aggs = OptimizerTabController.getAggs()

    try {
      let colId = params.column.colId

      if (params.data && aggs && OptimizerTabController.getColumnsToAggregate(true)[colId]) {
        let min = aggs.minAgg[colId]
        let max = aggs.maxAgg[colId]
        let value = params.value

        let range = (value - min) / (max - min)
        if (max == min) {
          range = 0.5
        }
        // console.log(min, max, value, range);

        let color = Gradient.getColor(Math.min(Math.max(range, 0), 1), optimizerGridGradient)
        return {
          backgroundColor: color,
        }
      }
    } catch (e) { console.error(e) }
  },

  getRelicGradient(params) {
    let col = params.column.colId
    let value = params.value
    if (!relicColumnRanges) {
      // Not maxes, just for visual representation of gradient. Calculated by low roll x 5
      relicColumnRanges = {
        [`augmentedStats.${Constants.Stats.HP}`]: 169.35,
        [`augmentedStats.${Constants.Stats.ATK}`]: 84.675,
        [`augmentedStats.${Constants.Stats.DEF}`]: 84.675,
        [`augmentedStats.${Constants.Stats.SPD}`]: 10,
        [`augmentedStats.${Constants.Stats.ATK_P}`]: 0.1728,
        [`augmentedStats.${Constants.Stats.HP_P}`]: 0.1728,
        [`augmentedStats.${Constants.Stats.DEF_P}`]: 0.216,
        [`augmentedStats.${Constants.Stats.CR}`]: 0.1296,
        [`augmentedStats.${Constants.Stats.CD}`]: 0.2592,
        [`augmentedStats.${Constants.Stats.EHR}`]: 0.1728,
        [`augmentedStats.${Constants.Stats.RES}`]: 0.1728,
        [`augmentedStats.${Constants.Stats.BE}`]: 0.2592,
        [`cv`]: 0.40,
        cs: 35,
        ss: 35,
        ds: 35,
        relicsTabWeight: 64.8,
        bestCaseWeight: 64.8,
        averageCaseWeight: 64.8,
      }
    }

    if (value == 0) {
      return {}
    }

    let range
    if (col == 'relicsTabWeight' || col == 'bestCaseWeight' || col == 'averageCaseWeight') {
      range = Math.max(0, value - 64.8) / relicColumnRanges[col]
    } else {
      range = value / relicColumnRanges[col]
    }

    let color = Gradient.getColor(Math.min(Math.max(range, 0), 1), relicGridGradient)

    return {
      backgroundColor: color,
    }
  },
}
