import { Stats } from 'lib/constants'
import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/constants'
import { basicRev, precisionRound, skillRev, talentRev, ultRev } from 'lib/conditionals/utils'
import { Eidolon } from 'types/Character'
import { ContentItem } from 'types/Conditionals'
import { CharacterConditional, PrecomputedCharacterConditional } from 'types/CharacterConditional'
import { Form } from 'types/Form'

export default (e: Eidolon): CharacterConditional => {
  const talentAtkScalingValue = talentRev(e, 0.20, 0.22)

  const basicScaling = basicRev(e, 1.00, 1.10)
  const skillScaling = skillRev(e, 1.25, 1.375)
  const ultScaling = ultRev(e, 4.5, 4.80)
  const ultEnhancedScaling = ultRev(e, 2.70, 2.88)
  const ultEnhancedScaling2 = ultRev(e, 1.62, 1.728)

  const content: ContentItem[] = [{
    formItem: 'switch',
    id: 'enhancedUlt',
    name: 'Enhanced Ult',
    text: 'AoE ult',
    title: 'AoE ULT - Split DMG to adjacent enemies',
    content: `Choose between two attack modes to deliver a full strike. ::BR:: Blowout: (ST) Farewell Hit deals Physical DMG equal to ${precisionRound(ultScaling * 100)}% of the Trailblazer's ATK to a single enemy. 
    ::BR::Blowout: (Blast) RIP Home Run deals Physical DMG equal to ${precisionRound(ultEnhancedScaling * 100)}% of the Trailblazer's ATK to a single enemy, and Physical DMG equal to ${precisionRound(ultEnhancedScaling2 * 100)}% of the Trailblazer's ATK to enemies adjacent to it.`,
  }, {
    formItem: 'slider',
    id: 'talentStacks',
    name: 'Talent stacks',
    text: 'Talent stacks',
    title: `Talent stacks`,
    content: `Each time after this character inflicts Weakness Break on an enemy, ATK increases by ${precisionRound(talentAtkScalingValue * 100)}% and DEF increases by 10%. This effect stacks up to 2 times.`,
    min: 0,
    max: 2,
  }]

  return {
    content: () => content,
    teammateContent: () => [],
    defaults: () => ({
      enhancedUlt: true,
      talentStacks: 2,
    }),
    teammateDefaults: () => ({
    }),
    precomputeEffects: (request) => {
      const r = request.characterConditionals
      const x = Object.assign({}, baseComputedStatsObject)

      // Stats
      x[Stats.ATK_P] += r.talentStacks * talentAtkScalingValue
      x[Stats.DEF_P] += r.talentStacks * 0.10
      x[Stats.CR] += (request.enemyWeaknessBroken) ? 0.25 : 0

      // Scaling
      x.BASIC_SCALING += basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += (r.enhancedUlt) ? ultEnhancedScaling : ultScaling

      // Boost
      x.SKILL_BOOST += 0.25
      x.ULT_BOOST += (r.enhancedUlt) ? 0.25 : 0

      return x
    },
    precomputeMutualEffects: (_x: ComputedStatsObject, _request: Form) => {
    },
    calculateBaseMultis: (c: PrecomputedCharacterConditional) => {
      const x = c['x']

      x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
      x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
      x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
    },
  }
}
