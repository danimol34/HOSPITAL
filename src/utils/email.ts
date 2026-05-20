import nodemailer from 'nodemailer';
import path from 'path';

export async function sendWelcomeEmail(to: string, tempPassword: string, rol: string) {
  // If credentials are not set, log and return to avoid crashing the app
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('No SMTP credentials found. Skipping email sending.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const rolName = rol === 'admin' ? 'Administrador' : 'Visor';

  const htmlTemplate = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <img src="cid:logo" alt="Logo" style="width: 120px; height: auto; margin-bottom: 10px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Bienvenido al Sistema Administrativo</h1>
      <p style="color: #e5e7eb; margin: 2px 0 0 0; font-size: 13px;">Hospital N.S. del Carmen</p>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #10b981; font-size: 20px;">¡Hola!</h2>
      <p style="color: #d1d5db; line-height: 1.6;">
        Se ha creado una cuenta para ti en nuestro sistema interno con el rol de <strong>${rolName}</strong>. 
        A continuación, te proporcionamos tus credenciales de acceso:
      </p>
      
      <div style="background-color: #18181b; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #27272a;">
        <p style="margin: 0 0 10px 0; color: #a1a1aa; font-size: 14px;">Correo electrónico:</p>
        <p style="margin: 0; font-weight: bold; color: #ffffff; font-size: 16px;">${to}</p>
        
        <p style="margin: 15px 0 10px 0; color: #a1a1aa; font-size: 14px;">Contraseña Temporal:</p>
        <p style="margin: 0; font-weight: bold; color: #10b981; font-size: 16px; letter-spacing: 1px;">${tempPassword}</p>
      </div>

      <p style="color: #d1d5db; font-size: 14px;">Te recomendamos guardar esta información en un lugar seguro.</p>
      
      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Ingresar al Sistema</a>
      </div>
    </div>
    <div style="background-color: #18181b; padding: 15px; text-align: center; border-top: 1px solid #27272a;">
      <p style="color: #71717a; font-size: 12px; margin: 0;">Este es un mensaje automático, por favor no respondas a este correo.</p>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"Hospital N.S. del Carmen" <${process.env.SMTP_USER}>`,
    to: to,
    subject: `Tus Credenciales de Acceso - Hospital N.S. del Carmen`,
    html: htmlTemplate,
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(process.cwd(), 'public', 'logo.png'),
        cid: 'logo'
      }
    ]
  });
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('No SMTP credentials found. Skipping email sending.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlTemplate = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
    <div style="background-color: #10b981; padding: 20px; text-align: center;">
      <img src="cid:logo" alt="Logo" style="width: 120px; height: auto; margin-bottom: 10px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Restablecer Contraseña</h1>
      <p style="color: #e5e7eb; margin: 2px 0 0 0; font-size: 13px;">Hospital N.S. del Carmen</p>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #10b981; font-size: 20px;">¡Hola!</h2>
      <p style="color: #d1d5db; line-height: 1.6;">
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
        Si no realizaste esta solicitud, puedes ignorar este correo.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Restablecer Contraseña</a>
      </div>

      <p style="color: #d1d5db; font-size: 14px;">El enlace expirará en breve. Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
      <p style="color: #10b981; font-size: 12px; word-break: break-all;">${resetLink}</p>
    </div>
    <div style="background-color: #18181b; padding: 15px; text-align: center; border-top: 1px solid #27272a;">
      <p style="color: #71717a; font-size: 12px; margin: 0;">Este es un mensaje automático, por favor no respondas a este correo.</p>
    </div>
  </div>
  `;

  await transporter.sendMail({
    from: `"Hospital N.S. del Carmen" <${process.env.SMTP_USER}>`,
    to: to,
    subject: `Restablecer Contraseña - Hospital N.S. del Carmen`,
    html: htmlTemplate,
    attachments: [
      {
        filename: 'logo.png',
        path: path.join(process.cwd(), 'public', 'logo.png'),
        cid: 'logo'
      }
    ]
  });
}
