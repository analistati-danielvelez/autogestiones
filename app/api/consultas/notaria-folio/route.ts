import { NextResponse } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ConfiguracionArchivoNotaria = {
  spreadsheetId: string;
  nombreArchivo: string;
  columnas: {
    nombreFallecido: number;
    cedula: number;
    fechaFallecimiento: number;
    municipio: number;
    notaria: number;
    folio: number;
  };
};

type ResultadoNotaria = {
  encontrado: boolean;
  nombreFallecido?: string;
  cedulaFallecido?: string;
  fechaFallecimiento?: string;
  municipio?: string;
  notaria?: string;
  folio?: string;
  archivo?: string;
  hoja?: string;
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

function normalizarCedula(valor: unknown) {
  return String(valor || "")
    .replace(/\D/g, "")
    .trim();
}

function obtenerTextoCelda(valor: unknown) {
  return String(valor || "").trim();
}

function obtenerConfiguracionArchivos(): ConfiguracionArchivoNotaria[] {
  const principal = process.env.NOTARIA_SHEET_PRINCIPAL_ID;
  const secundario1 = process.env.NOTARIA_SHEET_SECUNDARIO_1_ID;
  const secundario2 = process.env.NOTARIA_SHEET_SECUNDARIO_2_ID;

  if (!principal || !secundario1 || !secundario2) {
    throw new Error("Faltan variables de entorno de los archivos de notaría.");
  }

  return [
    {
      spreadsheetId: principal,
      nombreArchivo: "Principal",
      columnas: {
        nombreFallecido: 1, // B
        cedula: 2, // C
        fechaFallecimiento: 3, // D
        notaria: 5, // F
        municipio: 6, // G
        folio: 7, // H
      },
    },
    {
      spreadsheetId: secundario1,
      nombreArchivo: "Secundario 1",
      columnas: {
        nombreFallecido: 1, // B
        cedula: 2, // C
        fechaFallecimiento: 3, // D
        notaria: 5, // F
        folio: 6, // G
        municipio: 7, // H
      },
    },
    {
      spreadsheetId: secundario2,
      nombreArchivo: "Secundario 2",
      columnas: {
        nombreFallecido: 1, // B
        cedula: 2, // C
        fechaFallecimiento: 3, // D
        notaria: 5, // F
        municipio: 6, // G
        folio: 7, // H
      },
    },
  ];
}

async function obtenerNombresHojas(
  sheets: ReturnType<typeof google.sheets>,
  spreadsheetId: string
) {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
  });

  return (
    metadata.data.sheets
      ?.map((sheet) => sheet.properties?.title)
      .filter((title): title is string => Boolean(title)) || []
  );
}

async function buscarEnArchivo(params: {
  sheets: ReturnType<typeof google.sheets>;
  configuracion: ConfiguracionArchivoNotaria;
  cedulaBuscada: string;
}): Promise<ResultadoNotaria | null> {
  const { sheets, configuracion, cedulaBuscada } = params;

  const nombresHojas = await obtenerNombresHojas(
    sheets,
    configuracion.spreadsheetId
  );

  for (const nombreHoja of nombresHojas) {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: configuracion.spreadsheetId,
      range: `'${nombreHoja}'!A:Z`,
    });

    const filas = response.data.values || [];

    for (const fila of filas) {
      const cedulaFila = normalizarCedula(
        fila[configuracion.columnas.cedula]
      );

      if (!cedulaFila) {
        continue;
      }

      if (cedulaFila !== cedulaBuscada) {
        continue;
      }

      return {
        encontrado: true,
        nombreFallecido: obtenerTextoCelda(
          fila[configuracion.columnas.nombreFallecido]
        ),
        cedulaFallecido: obtenerTextoCelda(
          fila[configuracion.columnas.cedula]
        ),
        fechaFallecimiento: obtenerTextoCelda(
          fila[configuracion.columnas.fechaFallecimiento]
        ),
        municipio: obtenerTextoCelda(fila[configuracion.columnas.municipio]),
        notaria: obtenerTextoCelda(fila[configuracion.columnas.notaria]),
        folio: obtenerTextoCelda(fila[configuracion.columnas.folio]),
        archivo: configuracion.nombreArchivo,
        hoja: nombreHoja,
      };
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const { cedulaFallecido } = await request.json();

    const cedulaBuscada = normalizarCedula(cedulaFallecido);

    if (!cedulaBuscada) {
      return NextResponse.json(
        {
          ok: false,
          message: "Debe ingresar la cédula del fallecido.",
        },
        { status: 400 }
      );
    }

    const auth = obtenerClienteGoogleSheets();

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    const archivos = obtenerConfiguracionArchivos();

    for (const configuracion of archivos) {
      const resultado = await buscarEnArchivo({
        sheets,
        configuracion,
        cedulaBuscada,
      });

      if (resultado) {
        return NextResponse.json(
          {
            ok: true,
            ...resultado,
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      {
        ok: true,
        encontrado: false,
        message:
          "No encontramos información asociada a la consulta realizada. Para recibir acompañamiento, comunícate con nuestra línea de atención al cliente 456 7000 ext 5.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error consultando notaría y folio:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "No fue posible consultar la información de notaría y folio en este momento.",
      },
      { status: 500 }
    );
  }
}