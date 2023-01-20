import express from 'express'
import {
    getProyectos,
    nuevoProyecto,
    getProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador
} from '../controllers/proyectoController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

router.route('/').get(checkAuth, getProyectos).post(checkAuth, nuevoProyecto)

router.route('/:id').get(checkAuth, getProyecto).put(checkAuth, editarProyecto).delete(checkAuth, eliminarProyecto)

router.post('/colaboradores', checkAuth, buscarColaborador)
router.post('/colaboradores/:id', checkAuth, agregarColaborador)
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador)


export default router