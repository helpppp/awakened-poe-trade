import { ParsedItem } from '@/parser'
import { stat } from '@/assets/data'
import { StatRoll, StatSource, statSourcesTotal } from '@/parser/modifiers'

export const QUALITY_STATS = {
  ARMOUR: {
    flat: [stat('+# to Armour')],
    incr: [
      stat('#% increased Armour'),
      stat('#% increased Armour and Energy Shield'),
      stat('#% increased Armour and Evasion'),
      stat('#% increased Armour, Evasion and Energy Shield')
    ]
  },
  EVASION: {
    flat: [stat('+# to Evasion Rating')],
    incr: [
      stat('#% increased Evasion Rating'),
      stat('#% increased Armour and Evasion'),
      stat('#% increased Evasion and Energy Shield'),
      stat('#% increased Armour, Evasion and Energy Shield')
    ]
  },
  ENERGY_SHIELD: {
    flat: [stat('+# to maximum Energy Shield')],
    incr: [
      stat('#% increased Energy Shield'),
      stat('#% increased Armour and Energy Shield'),
      stat('#% increased Evasion and Energy Shield'),
      stat('#% increased Armour, Evasion and Energy Shield')
    ]
  },
  WARD: {
    flat: [stat('+# to Ward')],
    incr: [
      stat('#% increased Ward')
    ]
  },
  PHYSICAL_DAMAGE: {
    flat: [stat('Adds # to # Physical Damage')],
    incr: [
      stat('#% increased Physical Damage')
    ]
  }
}

export function propAt20Quality (
  total: number,
  statRefs: { flat: string[], incr: string[] },
  item: ParsedItem
): { roll: StatRoll, sources: StatSource[] } {
  const { incr, flat, sources } = calcPropBase(statRefs, item)
  const base = calcBase(total, incr.value + (item.quality ?? 0), flat.value)
  const quality = Math.max(20, item.quality ?? 0)
  return {
    roll: {
      value: calcIncreased(base + flat.value, incr.value + quality),
      min: calcIncreased(base + flat.min, incr.min + quality),
      max: calcIncreased(base + flat.max, incr.max + quality)
    },
    sources: sources.map(source => ({ ...source, contributes: undefined }))
  }
}

export function calcPropBounds (
  total: number,
  statRefs: { flat: string[], incr: string[] },
  item: ParsedItem
): { roll: StatRoll, sources: StatSource[] } {
  const { incr, flat, sources } = calcPropBase(statRefs, item)
  const base = calcBase(total, incr.value, flat.value)
  return {
    roll: {
      value: calcIncreased(base + flat.value, incr.value),
      min: calcIncreased(base + flat.min, incr.min),
      max: calcIncreased(base + flat.max, incr.max)
    },
    sources: (statRefs.incr.length && statRefs.flat.length)
      ? sources.map(source => ({ ...source, contributes: undefined }))
      : (statRefs.incr.length)
          ? sources.map(source => ({
            ...source,
            contributes: {
              value: base * source.contributes!.value / 100,
              min: base * source.contributes!.min / 100,
              max: base * source.contributes!.max / 100
            }
          }))
          : sources
  }
}

function calcPropBase (
  statRefs: { flat: string[], incr: string[] },
  item: ParsedItem
) {
  const incr: StatRoll = { value: 0, min: 0, max: 0 }
  const flat: StatRoll = { value: 0, min: 0, max: 0 }
  const sources: StatSource[] = []

  for (const calc of item.statsByType) {
    let total: StatRoll
    if (statRefs.flat.includes(calc.stat.ref)) {
      total = flat
    } else if (statRefs.incr.includes(calc.stat.ref)) {
      total = incr
    } else {
      continue
    }
    const roll = statSourcesTotal(calc.sources)!
    total.value += roll.value
    total.min += roll.min
    total.max += roll.max
    sources.push(...calc.sources)
  }

  return { incr, flat, sources }
}

function calcBase (total: number, incr: number, flat: number) {
  return (total / (1 + incr / 100)) - flat
}

function calcIncreased (flat: number, incr: number) {
  return flat * (1 + incr / 100)
}
