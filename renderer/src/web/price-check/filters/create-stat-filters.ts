import { ParsedItem, ItemRarity, ItemCategory } from '@/parser'
import { ModifierType, StatCalculated, statSourcesTotal, translateStatWithRoll } from '@/parser/modifiers'
import { percentRoll, percentRollDelta, roundRoll } from './util'
import { FilterTag, ItemHasEmptyModifier, StatFilter } from './interfaces'
import { filterPseudo } from './pseudo'
import { applyRules as applyAtzoatlRules } from './pseudo/atzoatl-rules'
import { filterItemProp } from './pseudo/item-property'
import { StatBetter } from '@/assets/data'

export interface FiltersCreationContext {
  readonly item: ParsedItem
  readonly searchInRange: number
  filters: StatFilter[]
  statsByType: StatCalculated[]
}

export function createExactStatFilters (
  item: ParsedItem,
  statsByType: StatCalculated[],
  _opts: {}
): StatFilter[] {
  if (item.mapBlighted) return []
  if (
    item.isUnidentified &&
    item.rarity === ItemRarity.Unique &&
    !item.isSynthesised
  ) return []

  const keepByType = [ModifierType.Pseudo, ModifierType.Fractured]
  if (
    item.category !== ItemCategory.Amulet &&
    item.category !== ItemCategory.Ring &&
    item.category !== ItemCategory.Flask
  ) {
    keepByType.push(ModifierType.Enchant)
  }

  if (
    !item.influences.length &&
    !item.isFractured
  ) {
    keepByType.push(ModifierType.Implicit)
  }

  if (item.rarity === ItemRarity.Magic && (
    item.category !== ItemCategory.Flask &&
    item.category !== ItemCategory.ClusterJewel &&
    item.category !== ItemCategory.Map &&
    item.category !== ItemCategory.Invitation &&
    item.category !== ItemCategory.HeistContract &&
    item.category !== ItemCategory.HeistBlueprint
  )) {
    keepByType.push(ModifierType.Explicit)
  }

  const ctx: FiltersCreationContext = {
    item,
    searchInRange: 100,
    filters: [],
    statsByType: statsByType.filter(calc => keepByType.includes(calc.type))
  }

  ctx.filters.push(
    ...ctx.statsByType.map(mod => calculatedStatToFilter(mod, ctx.searchInRange, item))
  )

  if (item.info.refName === 'Chronicle of Atzoatl') {
    applyAtzoatlRules(ctx.filters)
    return ctx.filters
  }

  for (const filter of ctx.filters) {
    filter.hidden = undefined

    if (filter.tag === FilterTag.Explicit) {
      filter.disabled = !filter.sources.some(source =>
        source.modifier.info.tier != null &&
        source.modifier.info.tier <= 2
      )
    } else {
      filter.disabled = false
    }

    if (filter.statRef === '# uses remaining') {
      filter.roll!.min = filter.roll!.value
      filter.roll!.default.min = filter.roll!.value
      filter.roll!.default.max = filter.roll!.value
    }
  }

  if (item.category === ItemCategory.ClusterJewel) {
    applyClusterJewelRules(ctx.filters)
  }

  return ctx.filters
}

export function initUiModFilters (
  item: ParsedItem,
  opts: {
    searchStatRange: number
  }
): StatFilter[] {
  const ctx: FiltersCreationContext = {
    item,
    filters: [],
    searchInRange: (item.rarity === ItemRarity.Normal || item.rarity === ItemRarity.Magic)
      ? 100 // only care about Tier
      : opts.searchStatRange,
    statsByType: item.statsByType.map(calc => {
      if (calc.type === ModifierType.Fractured && calc.stat.trade.ids[ModifierType.Explicit]) {
        return { ...calc, type: ModifierType.Explicit }
      } else {
        return calc
      }
    })
  }

  filterItemProp(ctx)
  filterPseudo(ctx)

  if (item.isVeiled) {
    ctx.statsByType = ctx.statsByType.filter(mod => mod.type !== ModifierType.Veiled)
  }

  ctx.filters.push(
    ...ctx.statsByType.map(mod => calculatedStatToFilter(mod, ctx.searchInRange, item))
  )

  if (item.isVeiled) {
    ctx.filters.forEach(filter => { filter.disabled = true })
  }

  finalFilterTweaks(ctx)

  return ctx.filters
}

export function calculatedStatToFilter (
  calc: StatCalculated,
  percent: number,
  item: ParsedItem
): StatFilter {
  const { stat, sources, type } = calc
  let filter: StatFilter

  if (stat.trade.option) {
    filter = {
      tradeId: stat.trade.ids[type],
      statRef: stat.ref,
      text: sources[0].stat.translation.string,
      tag: (type === ModifierType.Enchant)
        ? FilterTag.Enchant
        : FilterTag.Variant,
      sources: sources,
      option: {
        value: sources[0].contributes!.value
      },
      disabled: false
    }
  }

  const roll = statSourcesTotal(calc.sources)
  const translation = translateStatWithRoll(calc, roll)

  filter ??= {
    tradeId: stat.trade.ids[type],
    statRef: stat.ref,
    text: translation.string,
    tag: (type as unknown) as FilterTag,
    sources: sources,
    roll: undefined,
    disabled: true
  }

  if (type === ModifierType.Implicit) {
    if (sources.some(s => s.modifier.info.generation === 'corrupted')) {
      filter.tag = FilterTag.Corrupted
    } else if (sources.some(s => s.modifier.info.generation === 'eldritch')) {
      filter.tag = FilterTag.Eldritch
    } else if (item.isSynthesised) {
      filter.tag = FilterTag.Synthesised
    }
  } else if (type === ModifierType.Explicit) {
    if (item.info.unique?.fixedStats) {
      const fixedStats = item.info.unique.fixedStats
      if (!fixedStats.includes(filter.statRef)) {
        filter.tag = FilterTag.Variant
      }
    }
  }

  if (roll && !filter.option) {
    const dp =
    calc.stat.dp ||
    calc.sources.some(s => s.stat.stat.ref === calc.stat.ref && s.stat.roll!.dp)

    const filterBounds = {
      min: percentRoll(roll.min, -0, Math.floor, dp),
      max: percentRoll(roll.max, +0, Math.ceil, dp)
    }

    const filterDefault = (item.rarity === ItemRarity.Unique)
      ? {
          min: percentRollDelta(roll.value, (roll.max - roll.min), -percent, Math.floor, dp),
          max: percentRollDelta(roll.value, (roll.max - roll.min), +percent, Math.ceil, dp)
        }
      : {
          min: percentRoll(roll.value, -percent, Math.floor, dp),
          max: percentRoll(roll.value, +percent, Math.ceil, dp)
        }
    filterDefault.min = Math.max(filterDefault.min, filterBounds.min)
    filterDefault.max = Math.min(filterDefault.max, filterBounds.max)

    filter.roll = {
      value: roundRoll(roll.value, dp),
      min: undefined,
      max: undefined,
      default: filterDefault,
      bounds: (roll.min !== roll.max && item.rarity === ItemRarity.Unique)
        ? filterBounds
        : undefined,
      dp: dp,
      isNegated: false,
      tradeInvert: calc.stat.trade.inverted
    }

    filterFillMinMax(filter.roll, calc.stat.better)

    if (translation.negate) {
      filterAdjustmentForNegate(filter.roll)
    }
  }

  hideNotVariableStat(filter, item)

  return filter
}

function hideNotVariableStat (filter: StatFilter, item: ParsedItem) {
  if (item.rarity !== ItemRarity.Unique) return
  if (
    filter.tag !== FilterTag.Implicit &&
    filter.tag !== FilterTag.Explicit &&
    filter.tag !== FilterTag.Pseudo
  ) return

  if (!filter.roll) {
    filter.hidden = 'Roll is not variable'
  } else if (!filter.roll.bounds) {
    filter.roll.min = undefined
    filter.roll.max = undefined
    filter.hidden = 'Roll is not variable'
  }
}

function filterFillMinMax (
  roll: NonNullable<StatFilter['roll']>,
  better: StatBetter
) {
  switch (better) {
    case StatBetter.PositiveRoll:
      roll.min = roll.default.min
      break
    case StatBetter.NegativeRoll:
      roll.max = roll.default.max
      break
    case StatBetter.NotComparable:
      roll.min = roll.default.min
      roll.max = roll.default.max
      break
  }
}

function filterAdjustmentForNegate (
  roll: NonNullable<StatFilter['roll']>
) {
  roll.tradeInvert = !roll.tradeInvert
  roll.isNegated = true
  const swap = JSON.parse(JSON.stringify(roll)) as typeof roll

  if (swap.bounds && roll.bounds) {
    roll.bounds.min = -1 * swap.bounds.max
    roll.bounds.max = -1 * swap.bounds.min
  }

  roll.default.min = -1 * swap.default.max
  roll.default.max = -1 * swap.default.min

  roll.value = -1 * swap.value
  roll.min = (typeof swap.max === 'number')
    ? -1 * swap.max
    : undefined
  roll.max = (typeof swap.min === 'number')
    ? -1 * swap.min
    : undefined
}

function finalFilterTweaks (ctx: FiltersCreationContext) {
  const { item } = ctx

  if (item.category === ItemCategory.ClusterJewel && item.rarity !== ItemRarity.Unique) {
    applyClusterJewelRules(ctx.filters)
  }

  const hasEmptyModifier = showHasEmptyModifier(ctx)
  if (hasEmptyModifier !== false) {
    ctx.filters.push({
      tradeId: ['item.has_empty_modifier'],
      text: '1 Empty or Crafted Modifier',
      statRef: '1 Empty or Crafted Modifier',
      disabled: true,
      hidden: 'Select only if item has 6 modifiers (1 of which is crafted) or if it has 5 modifiers',
      tag: FilterTag.Pseudo,
      sources: [],
      option: {
        value: hasEmptyModifier
      }
    })
  }

  if (item.category === ItemCategory.Amulet) {
    const anointment = ctx.filters.find(filter => filter.statRef === 'Allocates #')
    if (anointment) {
      if (item.talismanTier) {
        anointment.disabled = false
      } else if (!item.isCorrupted && !item.isMirrored) {
        anointment.hidden = 'Buyer will likely change anointment'
        anointment.disabled = true
      }
    }
  }

  for (const filter of ctx.filters) {
    if (filter.tag === FilterTag.Fractured) {
      const mod = ctx.item.statsByType.find(mod => mod.stat.ref === filter.statRef)!
      if (mod.stat.trade.ids[ModifierType.Explicit]) {
        // hide only if fractured mod has corresponding explicit variant
        filter.hidden = 'Select only if price-checking as base item for crafting'
      }
    }
  }
}

function applyClusterJewelRules (filters: StatFilter[]) {
  for (const filter of filters) {
    if (filter.statRef === '# Added Passive Skills are Jewel Sockets') {
      filter.hidden = 'Roll is not variable'
      filter.disabled = true
    }

    // https://www.poewiki.net/wiki/Cluster_Jewel#Optimal_passive_skill_amounts
    if (filter.statRef === 'Adds # Passive Skills') {
      filter.disabled = false

      // 4 is [_, 5]
      if (filter.roll!.value === 4) {
        filter.roll!.max = 5
      // 5 is [5, 5]
      } else if (filter.roll!.value === 5) {
        filter.roll!.min = filter.roll!.default.min
      // 3, 6, 10, 11, 12 are [n, _]
      } else if (
        filter.roll!.value === 3 ||
        filter.roll!.value === 6 ||
        filter.roll!.value === 10 ||
        filter.roll!.value === 11 ||
        filter.roll!.value === 12
      ) {
        filter.roll!.min = filter.roll!.default.min
        filter.roll!.max = undefined
      }
      // else 2, 8, 9 are [_ , n]
    }
  }
}

// TODO
// +1 Prefix Modifier allowed
// -1 Suffix Modifier allowed
function showHasEmptyModifier (ctx: FiltersCreationContext): ItemHasEmptyModifier | false {
  const { item } = ctx

  if (
    item.rarity !== ItemRarity.Rare ||
    item.isCorrupted ||
    item.isMirrored
  ) return false

  const randomMods = item.newMods.filter(mod =>
    mod.info.type === ModifierType.Explicit ||
    mod.info.type === ModifierType.Fractured ||
    mod.info.type === ModifierType.Veiled ||
    mod.info.type === ModifierType.Crafted)

  const craftedMod = randomMods.find(mod => mod.info.type === ModifierType.Crafted)

  if (
    (randomMods.length === 5 && !craftedMod) ||
    (randomMods.length === 6 && craftedMod)
  ) {
    let prefixes = randomMods.filter(mod => mod.info.generation === 'prefix').length
    let suffixes = randomMods.filter(mod => mod.info.generation === 'suffix').length

    if (craftedMod) {
      if (craftedMod.info.generation === 'prefix') {
        prefixes -= 1
      } else {
        suffixes -= 1
      }
    }

    if (prefixes === 2) return ItemHasEmptyModifier.Prefix
    if (suffixes === 2) return ItemHasEmptyModifier.Suffix
  }

  return false
}
