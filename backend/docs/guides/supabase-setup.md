# Guía de Configuración de Supabase para Ligenia

Esta guía describe los pasos necesarios para configurar un proyecto de Supabase que se utilizará para la autenticación y gestión de usuarios en la aplicación Ligenia.

## 1. Crear una cuenta en Supabase

1. Visita [https://supabase.com/](https://supabase.com/) y haz clic en "Start your project" o "Sign Up".
2. Puedes registrarte con GitHub, GitLab, Google o con un correo electrónico y contraseña.
3. Sigue las instrucciones para completar el registro.

## 2. Crear un nuevo proyecto

1. Una vez que hayas iniciado sesión, haz clic en "New Project".
2. Selecciona la organización (o crea una nueva si es necesario).
3. Proporciona los siguientes detalles:
   - **Nombre del proyecto**: `ligenia`
   - **Base de datos**: Puedes mantener el nombre generado automáticamente o personalizarlo.
   - **Región**: Selecciona la región más cercana a tu ubicación para reducir la latencia.
   - **Contraseña**: Establece una contraseña segura para la base de datos.
4. Haz clic en "Create new project".
5. Espera a que se complete la configuración del proyecto (puede tardar unos minutos).

## 3. Configurar la autenticación

1. En el panel de control de Supabase, navega a la sección "Authentication" en el menú lateral.
2. En la pestaña "Providers", asegúrate de que el proveedor "Email" esté habilitado.
3. Configura las opciones de autenticación según tus necesidades:
   - **Confirm email**: Puedes desactivar esta opción para desarrollo, pero en producción debería estar activada.
   - **Secure email change**: Mantén esta opción activada para mayor seguridad.
   - **Custom SMTP**: Para desarrollo, puedes usar el servicio de correo predeterminado de Supabase.

4. En la pestaña "URL Configuration", configura las URLs de redirección:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/auth/callback`

## 4. Obtener las credenciales necesarias

1. En el panel de control de Supabase, navega a la sección "Project Settings" (icono de engranaje).
2. Selecciona "API" en el menú lateral.
3. Aquí encontrarás las credenciales necesarias:
   - **Project URL**: La URL de tu proyecto Supabase (por ejemplo, `https://abcdefghijklm.supabase.co`).
   - **API Key**: Hay dos tipos de claves:
     - **anon public**: Para operaciones del lado del cliente.
     - **service_role**: Para operaciones del lado del servidor con privilegios elevados.

4. Copia estas credenciales, las necesitarás para configurar las variables de entorno de la aplicación.

## 5. Configurar las variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto backend con las siguientes variables:

```
NODE_ENV=development
DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/ligenia
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_service_role_key
JWT_SECRET=un_secreto_seguro
```

2. Para pruebas de integración, crea un archivo `.env.test` con configuraciones similares pero apuntando a una base de datos de prueba.

## 6. Integración con el modelo de usuario de Prisma

Nuestra aplicación utiliza Prisma como ORM para interactuar con la base de datos. El modelo de usuario en Prisma (`User`) debe sincronizarse con los usuarios de Supabase. Para ello:

1. Cuando un usuario se registra en Supabase, también se crea un registro en nuestra base de datos de Prisma.
2. Los campos como `id`, `email` y `name` se sincronizan entre ambos sistemas.
3. Campos adicionales como `roles`, `preferredHand` y `playingLevel` se almacenan en los metadatos del usuario en Supabase.

## 7. Pruebas de integración

Para ejecutar las pruebas de integración con Supabase:

1. Configura el entorno de prueba:
   ```bash
   npm run setup:integration
   ```

2. Ejecuta las pruebas de integración:
   ```bash
   npm run test:integration
   ```

## 8. Consideraciones para producción

1. **Seguridad**: En producción, asegúrate de:
   - Activar la confirmación de email.
   - Configurar un servidor SMTP personalizado para enviar emails.
   - Utilizar HTTPS para todas las comunicaciones.

2. **Escalabilidad**: Supabase ofrece diferentes planes según tus necesidades. Considera actualizar a un plan de pago si necesitas:
   - Mayor capacidad de almacenamiento.
   - Mayor número de conexiones simultáneas.
   - Soporte para un mayor número de usuarios.

3. **Backups**: Configura backups regulares de tu base de datos para evitar pérdida de datos.

## 9. Recursos adicionales

- [Documentación oficial de Supabase](https://supabase.com/docs)
- [Guía de autenticación de Supabase](https://supabase.com/docs/guides/auth)
- [API de JavaScript de Supabase](https://supabase.com/docs/reference/javascript/introduction) 