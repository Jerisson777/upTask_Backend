import mongoose from 'mongoose'
import moongose from 'mongoose'

const tareaSchema = moongose.Schema({
    nombre: {
        type: String,
        trim: true,
        required: true
    },
    descripcion: {
        type: String,
        trim: true,
        required: true
    },
    estado: {
        type: Boolean,
        default: false
    },
    fechaEntrega:{
        type: Date,
        required: true,
        default: Date.now()
    },
    prioridad:{
        type: String,
        required: true,
        enum: ["Baja", "Media", "Alta"]
    },
    proyecto: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'Proyecto',
    },
    completado: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true
})
 
const Tarea = mongoose.model('Tarea', tareaSchema)
export default Tarea