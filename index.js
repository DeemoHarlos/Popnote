const req = (url, type) => {
	return new Promise(resolve => {
		let request = new XMLHttpRequest()
		request.responseType = type || 'text'
		request.open('GET', url)
		request.onreadystatechange = () => {
			if (request.readyState === 4) resolve(request)
		}
		request.send()
	})
}

let main = new Vue({
	el: '#main',
	data: {
		click: Number(Cookies.get('click') || 0),
		sentClick: Number(Cookies.get('sentClick') || 0),
		totalClicks: Number(Cookies.get('totalClicks') || 0),
		totalClicksDisplay: Number(Cookies.get('totalClicks') || 0),
		perfectActive: false,
		sound: new Howl({ src: ['assets/tapfx.wav'] }),
		totalUpdateInterval: 1000,
	},
	methods: {
		addClick() {
			this.sound.play()
			this.click += 1
			Cookies.set('click', Number(this.click))
			this.perfectActive = true
			setTimeout(() => {
				this.perfectActive = false
			}, 0)
		},
		async sendClick() {
			const clicksToSend = this.click - this.sentClick
			if (!clicksToSend) return
			const request = await req('http://cloud.deemoharlos.space:6969/add/' + clicksToSend)
			if (request.status === 200) {
				this.sentClick = this.click
				Cookies.set('sentClick', this.click)
			}
		},
		async getTotal() {
			const request = await req('http://cloud.deemoharlos.space:6969/total', 'json')
			if (request.status === 200) {
				const res = request.response
				this.totalClicks = Number(res.totalClicks) || 0
				Cookies.set('totalClicks', this.totalClicks)
				this.totalAnim(this.totalClicksDisplay, this.totalClicks, this.totalUpdateInterval)
			}
		},
		totalAnim(start, end, duration) {
			let startTimestamp = null
			const step = (timestamp) => {
				if (!startTimestamp) startTimestamp = timestamp
				const progress = Math.min((timestamp - startTimestamp) / duration, 1)
				this.totalClicksDisplay = Math.floor(progress * (end - start) + start)
				if (progress < 1) window.requestAnimationFrame(step)
			}
			window.requestAnimationFrame(step)
		},
	},
	mounted: async function() {
		document.addEventListener("keydown", e => {
			if (!e.repeat) this.addClick()
		})
		setInterval(this.sendClick, 1000)
		setInterval(this.getTotal, this.totalUpdateInterval)
	}
})
