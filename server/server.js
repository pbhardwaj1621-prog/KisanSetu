import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
// TODO: yahan routes mount karo: app.use('/api', routes)

const PORT = process.env.PORT || 5001
app.listen(PORT, () => console.log(`Kisan Setu API on http://localhost:${PORT}`))
