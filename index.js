//De esta manera se crea el servidor express con node 
//de esta manera es con commonJS
//const express = require('express')
//y esta con Esm
import express from 'express'
import conectarDb from './config/db.js'
import dotenv from 'dotenv'
import cors from 'cors'
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'

const app = express();
app.use(express.json());

dotenv.config()

conectarDb();

//configurar cors esto sirve para permitit conectar el backend con el frontend debido a que permite las peticiones de diferentes puertos
const whitelist = [process.env.FRONTEND_URL]

const corsOption = {
    origin: function (origin, callback){
      //  console.log(origin)
        if(whitelist.includes(origin)){
            //puede consultar la api
            callback(null, true)
        }else{
            //no esta permitido
            callback(new Error('Error de Cors'))
        }
    }
}

app.use(cors(corsOption))
//Routing
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/proyectos', proyectoRoutes)
app.use('/api/tareas', tareaRoutes)

const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () => {
    console.log(`Servidor Iniciado Corriendo en el puerto: ${PORT}`)
})


// Socket IO
import {Server} from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
})

io.on('connection', (socket) => {
   // console.log('Conectado a Socket.io')

    //definir eventos de socket.io
    socket.on('abrir proyecto', (proyecto) => {
        socket.join(proyecto)
    })

    //Actualizar el Dom en tiempo real cuando se crea una tarea
    socket.on('nueva tarea', (tarea) => {
        socket.to(tarea.proyecto).emit('tarea agregada', tarea)
    })

//Actualizar el Dom en tiempo real cuando se elimina una tarea    
    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    //Actualizar el Dom en tiempo real cuando se actualiza una tarea
    socket.on('actualizar tarea', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea actualizada', tarea)
    })

    //Actualizar el Dom en tiempo real cuando se cambia el estado de una tarea
    socket.on('cambiar estado', tarea => {
        //const proyecto = tarea.proyecto._id
        socket.to(tarea.proyecto._id).emit('nuevo estado', tarea)
    })
})


