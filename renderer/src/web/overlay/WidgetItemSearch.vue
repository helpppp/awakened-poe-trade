<template>
  <widget :config="config" move-handles="tl" readonly :removable="false">
    <div class="widget-default-style p-1" style="min-width: 24rem;">
      <div v-if="starred.length"
        class="mb-1 flex gap-x-2 py-1 pl-1 pr-2 bg-gray-800 rounded">
        <div v-for="item in starred" :key="item.name"
          class="flex flex-col">
          <item-quick-price
            :item-img="item.icon"
            :price="item.price"
            currency-text
          ></item-quick-price>
          <div class="ml-1 truncate" style="max-width: 7rem;">{{ item.name }}</div>
        </div>
      </div>
      <div class="flex gap-x-1 bg-gray-800 p-1 rounded-t">
        <input type="text" :placeholder="t('Search by name…')" class="rounded bg-gray-900 px-1 flex-1"
          v-model="searchValue">
        <button @click="clearItems" class="btn"><i class="fas fa-times" /> {{ t('Reset items') }}</button>
      </div>
      <div class="flex bg-gray-800 gap-x-2 px-2 mb-px1 py-1">
        <span>{{ t('Heist target:') }}</span>
        <div class="flex gap-x-1">
          <button class="rounded px-2 bg-gray-900 border">{{ t('Skill Gem') }}</button>
          <button class="rounded px-2 bg-gray-900">Replica, Base item <span class="text-xs bg-orange-700 px-1 rounded">WIP</span></button>
        </div>
      </div>
      <div class="flex flex-col bg-gray-800 rounded-b">
        <div v-for="item in (results || [])" :key="item.name">
          <div class="flex" :class="$style.itemWrapper">
            <div class="w-8 h-8 flex">
              <img :src="item.icon" class="max-w-full max-h-full overflow-hidden">
            </div>
            <div>
              <div class="h-8 flex items-center px-1">{{ item.name }}</div>
              <div class="flex gap-x-1">
                <button v-for="altQuality in item.gem!.altQuality" :key="altQuality"
                  @click="selectGem(item, altQuality)"
                  >{{ t(altQuality) }}</button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="results === false"
          class="text-center p-8 max-w-xs"><i class="fas fa-search" /> {{ t('too_many') }}</div>
        <div v-else-if="!results.length"
          class="text-center p-8 max-w-xs"><i class="fas fa-exclamation-triangle" /> {{ t('not_found') }}</div>
      </div>
    </div>
  </widget>
</template>

<script lang="ts">
import { defineComponent, PropType, shallowRef, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ItemSearchWidget } from './interfaces'
import ItemQuickPrice from '@/web/ui/ItemQuickPrice.vue'
import Widget from './Widget.vue'
import { BaseType, ITEMS_ITERATOR } from '@/assets/data'
import { AppConfig } from '@/web/Config'
import { findPriceByQuery, autoCurrency } from '@/web/background/Prices'

function capitalize (str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

interface SelectedItem {
  name: string
  icon: string
  chaos?: number
  price?: ReturnType<typeof autoCurrency>
}

function useSelectedItems () {
  const items = ref<SelectedItem[]>([])

  function addItem (newItem: SelectedItem) {
    if (items.value.length < 5) {
      items.value.push(newItem)
      items.value.sort((a, b) => {
        return (b.chaos ?? 0) - (a.chaos ?? 0)
      })
    } else {
      items.value = [newItem]
    }
  }

  function clearItems () {
    items.value = []
  }

  return { items, addItem, clearItems }
}

function findItems (search: string): BaseType[] | false {
  if (search.length < 2) return false

  const out = []
  const jsonSearch = (AppConfig().language === 'en')
    ? capitalize(search.split(' ', 1)[0])
    : search.split(' ', 1)[0]

  const MAX_HITS = 70 // NOTE: based on first word only, so don't be too strict
  const MAX_RESULTS_VISIBLE = 5 // NOTE: don't want to pick from too many results
  const MAX_RESULTS = 10
  let hits = 0
  for (const match of ITEMS_ITERATOR(jsonSearch)) {
    hits += 1
    const lcName = match.name.toLowerCase()
    const lcSearch = search.toLowerCase().split(' ')
    if (
      match.namespace === 'GEM' &&
      match.gem!.altQuality?.length &&
      lcSearch.every(part => lcName.includes(part))
    ) {
      out.push(match)
      if (out.length > MAX_RESULTS) return false
    }
    if (hits >= MAX_HITS) return false
  }
  return out.slice(0, MAX_RESULTS_VISIBLE)
}

export default defineComponent({
  components: { Widget, ItemQuickPrice },
  props: {
    config: {
      type: Object as PropType<ItemSearchWidget>,
      required: true
    }
  },
  setup () {
    const searchValue = shallowRef('')
    const { items: starred, addItem, clearItems } = useSelectedItems()

    function selectGem (item: BaseType, altQuality: string) {
      const price = findPriceByQuery({
        ns: item.namespace,
        name: `${altQuality} ${item.refName}`,
        variant: '1'
      })
      addItem({
        name: item.name,
        icon: item.icon,
        chaos: price?.chaos,
        price: (price != null) ? autoCurrency(price.chaos, 'chaos') : undefined
      })
      searchValue.value = ''
    }

    const { t } = useI18n()

    return {
      t,
      searchValue,
      results: computed(() => findItems(searchValue.value)),
      selectGem,
      clearItems,
      starred
    }
  }
})
</script>

<style lang="postcss" module>
.itemWrapper {
  @apply pl-1 pt-1;
  overflow: hidden;

  &:hover {
    background: linear-gradient(to left, theme('colors.gray.800'), theme('colors.gray.900'));
  }

  button {
    @apply text-gray-600;
    @apply px-1;
    @apply rounded;
  }

  &:hover button {
    @apply text-gray-400;
    @apply bg-gray-700;
  }
}
</style>

<i18n>
{
  "en": {
    "too_many": "Too many items found, enter the name more precisely.",
    "not_found": "No items found."
  },
  "ru": {
    "Search by name…": "Искать по имени…",
    "Reset items": "Сбросить предметы",
    "Heist target:": "Цель Кражи:",
    "Skill Gem": "Камни умений",
    "too_many": "Найдено слишком много предметов, уточните название.",
    "not_found": "Не найдено ни одного предмета."
  }
}
</i18n>
