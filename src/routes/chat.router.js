import express from 'express'


const router = express.Router()

router.get('/', (req, res) => {
    const user = req.session.user
    res.render('chat', {user})
})

export default router