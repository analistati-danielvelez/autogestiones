# Seguridad de la aplicación

## Controles implementados

- Los endpoints que consultan o generan información personal requieren una prueba
  de reCAPTCHA firmada, de corta duración y ligada a la IP del cliente.
- Todas las operaciones `POST` de la API validan el origen, tienen límite de
  frecuencia y rechazan anticipadamente cuerpos con tamaño excesivo.
- Las respuestas de API no se almacenan en caché.
- La aplicación publica CSP, protección contra framing y MIME sniffing, una
  política de permisos restrictiva y HSTS.
- Las imágenes remotas no están habilitadas de forma global.

## Configuración operativa

- Configure `APP_URL` con el origen público canónico. `NEXT_PUBLIC_APP_URL` se
  mantiene como alternativa por compatibilidad.
- `RECAPTCHA_SECRET_KEY` es también la clave de firma de las pruebas de captcha y
  debe ser un secreto de alta entropía, exclusivo de cada ambiente.
- El limitador en memoria protege cada instancia. En un despliegue horizontal se
  recomienda sustituirlo por un almacén compartido (por ejemplo Redis o el
  limitador administrado de la plataforma/WAF).
- El proxy frontal debe sobrescribir, no concatenar desde clientes no confiables,
  `X-Forwarded-For` y aplicar un límite de cuerpo igual o menor a 16 MiB.

## Riesgos residuales y recomendaciones

- Los archivos adjuntos se validan por extensión y MIME declarado. Para defensa
  en profundidad deben analizarse con antivirus y validación por firma mágica
  antes de enviarlos o conservarlos.
- Los datos personales se integran con Google Sheets, correo y Karing. Deben
  aplicarse mínimo privilegio, rotación de credenciales, auditoría y políticas de
  retención en esos servicios.
- Añada pruebas DAST y análisis de dependencias al CI. El comando `npm audit`
  depende de que el registro configurado permita consultar su API de advisories.
