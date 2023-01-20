import User from '../models/User.js'
import generarId from '../helpers/generarID.js'
import generarJWT from '../helpers/generarJWT.js'
import { emailRegistro, emailOlvidePassword } from '../helpers/email.js'

const registrar = async (req, res) =>{

    //Evitar usuarios duplicados
    const {email} = req.body
    const userExits = await User.findOne( { email })
    
    if(userExits) {
        const error = new Error('Usuario ya Registrado')
        return res.status(400).json( {msg: error.message })
    }

    try {
        const user = new User(req.body)
        user.token = generarId()
        await user.save()

        //Enviar email de confirmacion
        emailRegistro({
            email: user.email,
            nombre: user.nombre,
            token: user.token
        })

        res.json({msg: 'Usuario Creado Correctamente, Revisa tu email para confirmar tu cuenta'})
        
    } catch (error) {
        console.log(error)
    }
}

const autenticar = async (req, res) => {
    
    const {email, password} = req.body
    //compronar que el usuario existe
    const usuario = await User.findOne({ email });
    if(!usuario){
        const error = new Error('El usuario no Existe')
        return res.status(404).json({msg: error.message})
    }
    

    //comprobar si esta confirmado
    if(!usuario.confirmado){
        const error = new Error('Tu cuenta aun no ha sido confirmada')
        return res.status(403).json({msg: error.message})
    }

    //comprobar password
    if( await usuario.comprobarPassword(password)){
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id),
        })
    } else {
        const error = new Error('La contraseña es incorrecta')
        return res.status(403).json({msg: error.message})
    }

}
const confirmar = async (req, res) => {
    const { token } = req.params
    const usuarioConfirm = await User.findOne({ token })
    if(!usuarioConfirm){
        const error = new Error('Token no valido')
        return res.status(403).json({msg: error.message})
    }

    try {
        usuarioConfirm.confirmado = true
        usuarioConfirm.token = ''
        await usuarioConfirm.save()
        res.json({msg: 'Usuario Confirmado Correctamente'})
    } catch (error) {
        console.log(error)
    }
}

const cambiarPassword = async (req, res) => {
    const { email } = req.body

    //comprobar que existe el usuario
    const usuario = await User.findOne({ email })
    if(!usuario){
        const error = new Error('El usuario no Existe')
        return res.status(404).json({msg: error.message})
    }

    try {
        usuario.token = generarId()
        await usuario.save()

        //Enviar email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({msg: 'Hemos enviado un email con las instrucciones'})
    } catch (error) {
        console.log(error)
    }
}

const comprobarToken = async (req, res) => {
    const { token } = req.params

    const tokenValido = await User.findOne({ token})
    
    if(tokenValido){
        res.json({msg: 'Token Valido y el usuario existe'})
    }else{
        const error = new Error('token no valido')
        return res.status(404).json({msg: error.message})
    }
} 

const nuevoPassword = async (req, res) => {
    const {token} = req.params
    const {password} = req.body

    const usuario = await User.findOne({ token})
    
    if(usuario){
        usuario.password = password;
        usuario.token = '';
        try {
            await usuario.save();
            res.json({msg: 'Contraseña modificada Correctamente'})
        } catch (error) {
            console.log(error)
        }
    }else{
        const error = new Error('token no valido')
        return res.status(404).json({msg: error.message})
    }
}

const perfil = async (req, res) => {
    const { usuario} = req

    res.json(usuario)
}

export {
    registrar,
    autenticar,
    confirmar,
    cambiarPassword,
    comprobarToken,
    nuevoPassword,
    perfil
}