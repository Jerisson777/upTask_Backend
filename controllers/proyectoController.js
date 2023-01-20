import Proyecto from '../models/Proyecto.js'
import User from '../models/User.js'

const getProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
        $or: [
            { colaboradores: {$in: req.usuario} },
            { creador: {$in: req.usuario} }
        ],
    }).select('-tareas')

    res.json(proyectos)
}
const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoNuevo = await proyecto.save()
        res.json(proyectoNuevo)
    } catch (error) {
        console.log(error)
    }

}

const getProyecto = async (req, res) => {
    const {id} = req.params
    
    const proyecto = await Proyecto.findById(id.trim())
        .populate({ path: 'tareas', populate: { path : 'completado', select: 'nombre'} })
        .populate('colaboradores', 'nombre email')

    if(!proyecto){
        const error = new Error('Proyecto No encontrado')
        return res.status(404).json({msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some((colaborador) => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error('Permiso Denegado')
        return res.status(401).json({msg: error.message})
    }

    //Obtener las tareas del proyecto
    //const tareas = await Tarea.find().where('proyecto').equals(proyecto._id)

    res.json(proyecto)
}

const editarProyecto = async (req, res) => {
    const {id} = req.params

    const proyecto = await Proyecto.findById(id.trim())

    if(!proyecto){
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({msg: error.message})
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Permiso Denegado')
        return res.status(401).json({msg: error.message})
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const eliminarProyecto = async (req, res) => {
    const {id} = req.params

    const proyecto = await Proyecto.findById(id.trim())

    if(!proyecto){
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({msg: error.message})
    }
    if(proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Permiso Denegado')
        return res.status(401).json({msg: error.message})
    }

    try {
        await Proyecto.deleteOne()
        res.json({msg: 'Proyecto Eliminado'})
    } catch (error) {
        console.log(error)
    }

}

const buscarColaborador = async (req, res) => {
    const { email } = req.body

    const usuario = await User.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')

    if(!usuario){
        const error = new Error('Usuario No Encontrado')
        return res.status(404).json({msg: error.message})
    }
    res.json(usuario)
}

const agregarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    if(!proyecto){
        const error = new Error('Proyecto no Encontrado')
        return res.status(404).json({ msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString() ){
        const error = new Error('Accion No Valida')
        return res.status(404).json({ msg: error.message})
    }

    const { email } = req.body

    const usuario = await User.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v')

    if(!usuario){
        const error = new Error('Usuario No Encontrado')
        return res.status(404).json({msg: error.message})
    }

    //el colaborador no es el admin del proyecto
    if(proyecto.creador.toString() === usuario._id.toString()){
        const error = new Error('El creador del Proyecto no Puede Ser colaborador')
        return res.status(404).json({msg: error.message})
    }

    //Revisar que no este ya agregado al proyecto
    if(proyecto.colaboradores.includes(usuario._id)){
        const error = new Error('El Usuario pertenece al Proyecto')
        return res.status(404).json({msg: error.message})
    }

    //Agregar los colaboradores
    proyecto.colaboradores.push(usuario._id)
    await proyecto.save()
    res.json({ msg: 'Colaborador Agregado Correctamente'})
}


const eliminarColaborador = async (req, res) => {
    const proyecto = await Proyecto.findById(req.params.id)

    if(!proyecto){
        const error = new Error('Proyecto no Encontrado')
        return res.status(404).json({ msg: error.message})
    }

    if(proyecto.creador.toString() !== req.usuario._id.toString() ){
        const error = new Error('Accion No Valida')
        return res.status(404).json({ msg: error.message})
    }

    //eliminar los colaboradores
    proyecto.colaboradores.pull(req.body.id)
    await proyecto.save()
    res.json({ msg: 'Colaborador Eliminado Correctamente'})
}
/*
const getTareas = async (req, res) => {
    //esta es la forma normal de obtener todas las tareas de un proyecto
    const { id } = req.params

    const proyectoExist = await Proyecto.findById(id)
    if(!proyectoExist){
        const error = new Error('Proyecto no encontrado')
        return res.status(404).json({msg: error.message})
    }

    //tienes que ser el creador del proyecto o el colaborador
    const tareas = await Tarea.find().where('proyecto').equals(id)

    res.json(tareas)
}
*/
export {
    getProyectos,
    nuevoProyecto,
    getProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador
}