import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResultadoValidacion = {
  encontrado: boolean;
  codigo?: string;
  tipoDocumento?: string;
  quienSolicita?: string;
  dirigidoA?: string;
  nombreEnmascarado?: string;
  documentoEnmascarado?: string;
  fechaEmision?: string;
};

function obtenerClienteGoogleSheets() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const subject = process.env.GOOGLE_WORKSPACE_SUBJECT;

  if (!clientEmail || !privateKey || !subject) {
    throw new Error("Faltan variables de entorno de Google Workspace.");
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    subject,
  });
}

function obtenerTexto(valor: unknown) {
  return typeof valor === "string" && valor.trim() !== "" ? valor.trim() : "";
}

function enmascararNombre(nombre: string) {
  const limpio = nombre.replace(/\s+/g, " ").trim();

  if (!limpio) {
    return "No disponible";
  }

  const partes = limpio.split(" ");

  return partes
    .map((parte) => {
      if (parte.length <= 4) {
        return `${parte.slice(0, 2)}***`;
      }

      return `${parte.slice(0, 4)}***`;
    })
    .join(" ");
}

function enmascararDocumento(documento: string) {
  const limpio = documento.replace(/\D/g, "").trim();

  if (!limpio) {
    return "No disponible";
  }

  if (limpio.length <= 4) {
    return `${limpio.slice(0, 2)}***`;
  }

  return `${limpio.slice(0, 4)}***`;
}

function obtenerDatosDesdeJson(datosDocTexto: string) {
  try {
    const parsed = JSON.parse(datosDocTexto);

    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed[0] as Record<string, unknown>;
    }

    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }

    return {};
  } catch {
    return {};
  }
}

const CONFIG_HOJAS_NIVEL2 = [
  {
    hoja: "CERTIFICADOS",
    columnaCodigo: 8, // I - Correo Electronico / Observación
    columnaFechaGestion: 11, // L - Fecha de realización
  },
  {
    hoja: "6. Detalles de pagos",
    columnaCodigo: 7, // H - Datos de envio
    columnaFechaGestion: 10, // K - Fecha de Envio
  },
  {
    hoja: "8. Certificado de gastos",
    columnaCodigo: 11, // L - Observación
    columnaFechaGestion: 12, // M - Fecha de elaboración
  },
  {
    hoja: "10. Copia contrato",
    columnaCodigo: 7, // H - Observación
    columnaFechaGestion: 11, // L - Fecha de entrega / envío
  },
  {
    hoja: "11. Retencion en la fuente",
    columnaCodigo: 7, // H - Observación
    columnaFechaGestion: 11, // L - Fecha de entrega / envío
  },
];

async function buscarFechaGestionNivel2(params: {
  sheets: ReturnType<typeof google.sheets>;
  codigoBuscado: string;
}) {
  const spreadsheetId = process.env.GOOGLE_SHEET_NIVEL2_ID;

  if (!spreadsheetId) {
    throw new Error("Falta GOOGLE_SHEET_NIVEL2_ID.");
  }

  for (const configuracion of CONFIG_HOJAS_NIVEL2) {
    const respuesta = await params.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${configuracion.hoja}'!A:Z`,
    });

    const filas = respuesta.data.values || [];

    for (const fila of filas) {
      const celdaCodigo = obtenerTexto(fila[configuracion.columnaCodigo])
        .toUpperCase();

      if (!celdaCodigo.includes(params.codigoBuscado)) {
        continue;
      }

      const fechaGestion = obtenerTexto(
        fila[configuracion.columnaFechaGestion]
      );

      return fechaGestion || "";
    }
  }

  return "";
}

function codigoDebeBuscarFechaNivel2(codigoDoc: string) {
  return codigoDoc.startsWith("SOL-") || codigoDoc.startsWith("GAS-");
}

export async function POST(request: Request) {
  try {
    const { codigo } = await request.json();

    const codigoBuscado = obtenerTexto(codigo).toUpperCase();

    if (!codigoBuscado) {
      return NextResponse.json(
        {
          ok: false,
          message: "Debe ingresar el código de validación.",
        },
        { status: 400 }
      );
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error("Falta GOOGLE_SHEET_ID.");
    }

    const auth = obtenerClienteGoogleSheets();

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    const respuesta = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'Solicitudes'!A:I",
    });

    const filas = respuesta.data.values || [];

    for (const fila of filas) {
      const fechaCreacion = obtenerTexto(fila[0]);
      const codigoDoc = obtenerTexto(fila[4]).toUpperCase();
      const tipoDoc = obtenerTexto(fila[5]);
      const quienNecesitaDoc = obtenerTexto(fila[6]);
      const dirigidoADoc = obtenerTexto(fila[7]);
      const datosDocTexto = obtenerTexto(fila[8]);

      if (!codigoDoc || codigoDoc !== codigoBuscado) {
        continue;
      }

      const datosDoc = obtenerDatosDesdeJson(datosDocTexto);

        const fallecido =
        datosDoc.fallecido &&
        typeof datosDoc.fallecido === "object" &&
        !Array.isArray(datosDoc.fallecido)
            ? (datosDoc.fallecido as Record<string, unknown>)
            : null;

        const titular =
        datosDoc.titular &&
        typeof datosDoc.titular === "object" &&
        !Array.isArray(datosDoc.titular)
            ? (datosDoc.titular as Record<string, unknown>)
            : null;

        const certificadoTexto =
        obtenerTexto(datosDoc.certificado) || tipoDoc || "Documento";

        const esCertificadoFallecido = certificadoTexto
        .toLowerCase()
        .includes("fallecido");

        const nombre = esCertificadoFallecido
        ? obtenerTexto(fallecido?.nombreCompleto) ||
            obtenerTexto(datosDoc.nombreFallecido) ||
            "No disponible"
        : obtenerTexto(datosDoc.nombre) ||
            obtenerTexto(datosDoc.nombreTitular) ||
            obtenerTexto(titular?.nombre) ||
            "No disponible";

        const identificacion = esCertificadoFallecido
        ? obtenerTexto(fallecido?.identificacion) ||
            obtenerTexto(datosDoc.documentoFallecido) ||
            "No disponible"
        : obtenerTexto(datosDoc.identificacion) ||
            obtenerTexto(datosDoc.cedula) ||
            obtenerTexto(datosDoc.cedulaTitular) ||
            obtenerTexto(titular?.identificacion) ||
            obtenerTexto(datosDoc.documentoBeneficiario) ||
            "No disponible";

            const debeBuscarFechaNivel2 = codigoDebeBuscarFechaNivel2(codigoDoc);

            const fechaGestionNivel2 = debeBuscarFechaNivel2
              ? await buscarFechaGestionNivel2({
                  sheets,
                  codigoBuscado,
                })
              : "";

            const fechaEmisionDocumento = debeBuscarFechaNivel2
              ? fechaGestionNivel2 || "No disponible"
              : fechaCreacion || "No disponible";

            const resultado: ResultadoValidacion = {
              encontrado: true,
              codigo: codigoDoc,
              tipoDocumento: certificadoTexto,
              quienSolicita: quienNecesitaDoc || "No disponible",
              dirigidoA: dirigidoADoc || obtenerTexto(datosDoc.dirigidoA) || "No disponible",
              nombreEnmascarado: enmascararNombre(nombre),
              documentoEnmascarado: enmascararDocumento(identificacion),
              fechaEmision: fechaEmisionDocumento,
            };

      return NextResponse.json(
        {
          ok: true,
          ...resultado,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        encontrado: false,
        message:
          "No encontramos un documento asociado al código ingresado. Verifica el código e intenta nuevamente.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validando documento:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "No fue posible validar el documento en este momento.",
      },
      { status: 500 }
    );
  }
}