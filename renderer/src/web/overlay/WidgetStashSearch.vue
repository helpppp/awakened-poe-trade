<template>
  <widget :config="config" move-handles="corners" :inline-edit="false">
    <div class="widget-default-style p-1" style="min-width: 5rem;">
      <div class="text-gray-100 m-1 leading-4 truncate">{{ config.wmTitle || 'Untitled' }}</div>
      <div class="flex flex-col gap-y-1 mt-2">
        <button v-for="entry in config.entries" :key="entry.id" @click="stashSearch(entry.text)"
          class="leading-4 text-gray-100 p-2 rounded text-left bg-gray-800 whitespace-nowrap">
            {{ entry.name || entry.text }}
            <span v-if="entry.hotkey"
              class="text-center inline-block text-black bg-gray-400 rounded px-1">{{ entry.hotkey }}</span>
        </button>
      </div>
    </div>
  </widget>
</template>

<script lang="ts">
import { defineComponent, inject, PropType } from 'vue'
import Widget from './Widget.vue'
import { MainProcess } from '@/web/background/IPC'
import { WidgetManager, StashSearchWidget } from './interfaces'

export default defineComponent({
  components: { Widget },
  props: {
    config: {
      type: Object as PropType<StashSearchWidget>,
      required: true
    }
  },
  setup (props) {
    const wm = inject<WidgetManager>('wm')!

    if (props.config.wmFlags[0] === 'uninitialized') {
      props.config.wmFlags = ['invisible-on-blur']
      props.config.anchor = {
        pos: 'tl',
        x: (Math.random() * (40 - 20) + 20),
        y: (Math.random() * (40 - 20) + 20)
      }
      props.config.entries = [{
        id: 1, text: 'Currency', name: '', hotkey: null
      }]
      wm.show(props.config.wmId)
    }

    return {
      stashSearch (text: string) {
        MainProcess.sendEvent({
          name: 'OVERLAY->MAIN::stash-search',
          payload: { text }
        })
      }
    }
  }
})
</script>
