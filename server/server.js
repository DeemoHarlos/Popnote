const express = require('express')
const app = express()

let totalClicks = 0;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.enable('trust proxy')

app.get('/add/:num', async (req, res) => {
	console.log('New request!')
	res.append('Access-Control-Allow-Origin', '*')

	const num = Math.min(Number(req.params.num) || 0, 1000)
	if (num <= 0) return res.status(400).send('Invalid Number')
	totalClicks += Number(num)
	console.log('Current Clicks: ', totalClicks)
	res.sendStatus(200)
})

app.get('/total', async (req, res) => {
	console.log('New request!')
	res.append('Access-Control-Allow-Origin', '*')

	console.log('Current Clicks: ', totalClicks)
	res.status(200).json({ totalClicks })
})

app.listen(6969, ()=>{
	console.log('Listening at port 6969...')
})
