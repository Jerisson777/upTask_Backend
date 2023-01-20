import express from 'express'
const router = express.Router();
import { 
    registrar, 
    autenticar, 
    confirmar, 
    cambiarPassword,
    comprobarToken,
    nuevoPassword,
    perfil } from '../controllers/usuarioController.js'
import checkAuth from '../middleware/checkAuth.js';

//Autenticacion, Creacion, Registro y confirmacion de usuarios
router.post('/', registrar)//crea un nuevo usuario
router.post('/login', autenticar)//autenticar usuario
router.get('/confirmar/:token', confirmar)
router.post('/cambiar-password', cambiarPassword); //cambiar contraseña porque se olvido
router.route('/cambiar-password/:token').get(comprobarToken).post(nuevoPassword)

router.get('/perfil', checkAuth, perfil)



export default router