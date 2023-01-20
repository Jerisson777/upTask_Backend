import nodemailer from 'nodemailer'

export const emailRegistro = async (datos) => {
    const {email, nombre, token} = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT ,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      //Informacion del email
      const info = await transport.sendMail({
        from: '"UpTask - Adminstra tus Proyectos" <cuentas@uptask.com>',
        to: email,
        subject: 'UpTask - Comprueba tu Cuenta',
        text: "Comprueba tu Cuenta",
        html: `<p>Hola: ${nombre} Confirma tu cuenta en UpTask</p>
            <p>Tu Cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace </p>
        
            <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar Cuenta</a>

            <p>Si tu No creaste esta cuenta, puedes ignorar este mensaje</p>

        `,
      })
}


export const emailOlvidePassword = async (datos) => {
  const {email, nombre, token} = datos

  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
    });

    //Informacion del email
    const info = await transport.sendMail({
      from: '"UpTask - Adminstra tus Proyectos" <cuentas@uptask.com>',
      to: email,
      subject: 'UpTask - Reestablece tu Contraseña',
      text: "Reestablece tu Contraseña",
      html: `<p>Hola: ${nombre} ha Solicitado reestablecer su Contraseña</p>
          <p>Sigue el siguiente enlace para generar una nueva contraseña </p>
      
          <a href="${process.env.FRONTEND_URL}/cambiar-password/${token}">Reestablece tu Contraseña</a>

          <p>Si tu No creaste esta cuenta, puedes ignorar este mensaje</p>

      `,
    })
}