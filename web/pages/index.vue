<template lang="pug">
  .bg-dark.text-light
    #main.w-100.vh-100.d-flex.center.position-relative
      #click-target.text-dark.d-flex.center(@click="addClick")
        #perfect.fill-size(:class="{ active: perfectActive }")
      #click-text.w-100.text-center.position-absolute {{ click }}
      #click-title.w-100.text-center.position-absolute
        | {{ totalClicksDisplay || '' }}
        br
        | POPNOTE
</template>

<script lang="ts">
import Vue from 'vue'
import VueCookies from 'vue-cookies'
import { Howl } from 'howler'

import tapfx from '@/assets/tapfx.wav'

Vue.use(VueCookies)

export default Vue.extend({
  data() { return ({
    click: Number(this.$cookies.get('click') || 0),
    sentClick: Number(this.$cookies.get('sentClick') || 0),
    totalClicks: Number(this.$cookies.get('totalClicks') || 0),
    totalClicksDisplay: Number(this.$cookies.get('totalClicks') || 0),
    perfectActive: false,
    sound: new Howl({ src: tapfx }),
    totalUpdateInterval: 1000,
    intervals: [] as Array<ReturnType<typeof setInterval>>,
  })},
  mounted() {
    document.addEventListener("keydown", e => {
      if (!e.repeat) this.addClick()
    })
    this.intervals.push(setInterval(this.sendClick, 1000))
    this.intervals.push(setInterval(this.getTotal, this.totalUpdateInterval))
  },
  beforeDestroy () {
    this.intervals.forEach(interval => clearInterval(interval))
  },
  methods: {
    async req(url: string) {
      return await this.$axios.$get(url);
    },
    addClick() {
      this.sound.play()
      this.click += 1
      this.$cookies.set('click', Number(this.click))
      this.perfectActive = true
      setTimeout(() => {
        this.perfectActive = false
      }, 0)
    },
    async sendClick() {
      const clicksToSend = this.click - this.sentClick
      if (!clicksToSend) return
      await this.req('http://cloud.harlos.me:6969/add/' + clicksToSend)
      this.sentClick = this.click
      this.$cookies.set('sentClick', this.click)
    },
    async getTotal() {
      const res = await this.req('http://cloud.harlos.me:6969/total')
      this.totalClicks = Number(res.totalClicks) || 0
      this.$cookies.set('totalClicks', this.totalClicks)
      this.totalAnim(this.totalClicksDisplay, this.totalClicks, this.totalUpdateInterval)
    },
    totalAnim(start: number, end: number, duration: number) {
      let startTimestamp = null as number | null
      const step = (timestamp: number) => {
        startTimestamp = startTimestamp || timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        this.totalClicksDisplay = Math.floor(progress * (end - start) + start)
        if (progress < 1) window.requestAnimationFrame(step)
      }
      window.requestAnimationFrame(step)
    },
  }
})
</script>

<style lang="sass" scoped>
body
  -webkit-touch-callout: none
  -webkit-user-select: none
  -khtml-user-select: none
  -moz-user-select: none
  -ms-user-select: none
  user-select: none

.center
  align-items: center
  justify-content: center

.fill-size
  width: 100%
  height: 100%

#main
  font-family: 'Fira Code Light', monospace

#perfect
  background-image: url(assets/perfect.png)
  background-size: contain
  background-position: center
  background-repeat: no-repeat
  transform: scale(200%)
  opacity: 0
  transition: opacity 200ms

#perfect.active
  opacity: 1
  transition: none

#click-text
  font-size: 6rem
  top: 0

#click-title
  font-size: 6rem
  bottom: 0

#click-target
  width: 400px
  height: 400px
  background-image: url(assets/note.png)
  background-size: contain
  background-position: center
  background-repeat: no-repeat
</style>
