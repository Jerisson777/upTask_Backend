import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tareas.js"

const agregarTarea = async ( req, res) => {
    const { proyecto } = req.body

    const proyectoExits = await Proyecto.findById(proyecto)

    if(!proyectoExits){
        const error = new Error('El proyecto no Existe')
        return res.status(404).json({msg: error.message})
    }

    if(proyectoExits.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('No tienes Permisos para añadir Tareas')
        return res.status(401).json({msg: error.message})
    }

    try {
        const tareaAdd = await Tarea.create(req.body)
        //Almacenar el ID en el proyecto
        proyectoExits.tareas.push(tareaAdd._id)
        await proyectoExits.save()
        res.json(tareaAdd)
    } catch (error) {
        console.log(error)
    }
}
const obtenerTarea = async (req, res) => {
    const { id } = req.params

    const tarea = await Tarea.findById(id).populate('proyecto')

    if(!tarea){
        const error = new Error('Tarea No Encontrada')
        return res.status(404).json({msg: error.message})
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no Valida')
        return res.status(403).json({msg: error.message})
    }

    res.json(tarea)

}

const actualizarTarea = async (req, res) => {
    const { id } = req.params

    //encontrar la tarea y su creador
    const tarea = await Tarea.findById(id).populate('proyecto')

    //verificar que exista la tarea
    if(!tarea){
        const error = new Error('Tarea No Encontrada')
        return res.status(404).json({msg: error.message})
    }

    //comparar que el creador de la tarea sea el mismo que la modifique de lo contrario marca error
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no Valida')
        return res.status(403).json({msg: error.message})
    }

    //Actualizacion de los datos y en caso de que no se mande nada mantenga lo que tenia antes
    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.prioridad = req.body.prioridad || tarea.prioridad
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega

    try {
        const tareaAdd = await tarea.save()
        res.json(tareaAdd)
    } catch (error) {
        console.log(error)
    }
}

const eliminarTarea = async (req, res) => {
    const { id } = req.params

    //encontrar la tarea y su creador
    const tarea = await Tarea.findById(id).populate('proyecto')

    //verificar que exista la tarea
    if(!tarea){
        const error = new Error('Tarea No Encontrada')
        return res.status(404).json({msg: error.message})
    }

    //comparar que el creador de la tarea sea el mismo que la modifique de lo contrario marca error
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
        const error = new Error('Accion no Valida')
        return res.status(403).json({msg: error.message})
    }

    try {
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])
        
        res.json({msg: 'Tarea Eliminada'})
    } catch (error) {
        console.log(error)
    }
}

const cambiarEstados = async (req, res) => {
    const { id } = req.params

    //encontrar la tarea y su creador
    const tarea = await Tarea.findById(id).populate('proyecto')
    

    //verificar que exista la tarea
    if(!tarea){
        const error = new Error('Tarea No Encontrada')
        return res.status(404).json({msg: error.message})
    }
    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some((colaborador) => colaborador._id.toString() === req.usuario._id.toString())){
        const error = new Error('Accion no Valida')
        return res.status(403).json({msg: error.message})
    }

    tarea.estado = !tarea.estado
    tarea.completado = req.usuario._id
    await tarea.save()

    const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate('completado')
    res.json(tareaAlmacenada)    
}

export{
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstados
}