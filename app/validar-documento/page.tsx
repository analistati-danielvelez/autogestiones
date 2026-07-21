"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { CheckCircle2, FileSearch, Info, XCircle } from "lucide-react";

type ResultadoValidacion = {
  encontrado: boolean;
  codigo?: string;
  tipoDocumento?: string;
  quienSolicita?: string;
  dirigidoA?: string;
  nombreEnmascarado?: string;
  documentoEnmascarado?: string;
  fechaEmision?: string;
  message?: string;
};

function AnimacionValidando() {
    return (
      <div className="mt-8 overflow-hidden rounded-2xl border border-[#0090D1]/20 bg-[#F5FAFD] px-5 py-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="absolute h-14 w-14 animate-spin rounded-full border-4 border-[#0090D1]/20 border-t-[#0090D1]" />
            <FileSearch className="h-7 w-7 text-[#002869]" />
          </div>
        </div>
  
        <p className="mt-5 text-lg font-bold text-[#002869]">
          Validando autenticidad
        </p>
  
        <p className="mt-2 text-sm text-gray-600">
          Estamos consultando si el código corresponde a un documento generado o registrado por Cotrafa Social.
        </p>
  
        <div className="mx-auto mt-5 max-w-sm space-y-3 text-left text-sm">
          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#0090D1]" />
            <span className="text-gray-700">Verificando código de autenticidad</span>
          </div>
  
          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#0090D1] [animation-delay:200ms]" />
            <span className="text-gray-700">Consultando registro del documento</span>
          </div>
  
          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#0090D1] [animation-delay:400ms]" />
            <span className="text-gray-700">Protegiendo la información personal</span>
          </div>
        </div>
      </div>
    );
  }

export default function ValidarDocumentoPage() {
  const [codigo, setCodigo] = useState("");
  const [validando, setValidando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoValidacion | null>(null);

  const validarCodigo = async (codigoValidar?: string) => {
    const codigoConsulta = (codigoValidar || codigo).trim();

    if (!codigoConsulta) {
      alert("Por favor ingresa el código de validación.");
      return;
    }

    setValidando(true);
    setResultado(null);

    try {
      const respuesta = await fetch("/api/validar-documento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: codigoConsulta,
        }),
      });

      const data = await respuesta.json();
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (!respuesta.ok) {
        alert(data.message || "No fue posible validar el documento.");
        return;
      }

      setResultado(data);
    } catch (error) {
      alert("No fue posible validar el documento en este momento.");
    } finally {
      setValidando(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codigoUrl = params.get("codigo");

    if (codigoUrl) {
      setCodigo(codigoUrl);
      validarCodigo(codigoUrl);
    }
  }, []);

  return (
    <main className="min-h-screen bg-white px-4 py-6">
      <section className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0090D1]/10">
            <FileSearch className="h-8 w-8 text-[#0090D1]" />
          </div>

          <h1 className="text-3xl font-extrabold text-[#002869]">
            Validación de documento
          </h1>

          <p className="mt-3 text-gray-600">
            Ingresa el código de autenticidad para consultar la información asociada al documento.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-[#F5FAFD] p-5">
          <Input
            type="text"
            label="Código de autenticidad"
            placeholder="Ej: CS-20260710-XXXXXX-XXXXXX-XXXXXX"
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value);
              setResultado(null);
            }}
            isRequired
          />

            <Button
            className={`mt-5 w-full px-8 py-6 font-bold ${
                validando
                ? "bg-gray-300 text-gray-500"
                : "bg-[#0090D1] text-white hover:bg-[#007bb3]"
            }`}
            onClick={() => validarCodigo()}
            disabled={validando}
            >
            {validando ? "Consultando documento..." : "Validar documento"}
            </Button>
        </div>

        {validando && <AnimacionValidando />}

        {resultado?.encontrado && (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-5 py-5 text-left text-sm text-green-800">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 flex-none text-green-700" />
              <div>
                <p className="text-lg font-bold text-green-800">
                  Documento validado
                </p>
                <p className="text-green-700">
                  Este código corresponde a un documento generado o registrado por Cotrafa Social.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p>
                <span className="font-semibold">Código:</span>{" "}
                {resultado.codigo}
              </p>

              <p>
                <span className="font-semibold">Corresponde a:</span>{" "}
                {resultado.tipoDocumento || "Documento"}
              </p>

              <p>
                <span className="font-semibold">Nombre:</span>{" "}
                {resultado.nombreEnmascarado || "No disponible"}
              </p>

              <p>
                <span className="font-semibold">Documento:</span>{" "}
                {resultado.documentoEnmascarado || "No disponible"}
              </p>

              <p>
                <span className="font-semibold">Dirigido a:</span>{" "}
                {resultado.dirigidoA || "No disponible"}
              </p>

              <p>
                <span className="font-semibold">Fecha de emisión o gestión:</span>{" "}
                {resultado.fechaEmision || "No disponible"}
              </p>
            </div>
          </div>
        )}

        {resultado && !resultado.encontrado && (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 px-5 py-5 text-left text-sm text-red-700">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-6 w-6 flex-none text-red-600" />
              <p>
                {resultado.message ||
                  "No encontramos un documento asociado al código ingresado."}
              </p>
            </div>
          </div>
        )}

        {!validando && (
        <div className="mt-8 rounded-xl border border-[#0090D1]/20 bg-[#F5FAFD] px-5 py-4 text-left text-sm text-[#002869]">
            <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 flex-none text-[#0090D1]" />
            <p>
                Por seguridad, la información se muestra parcialmente enmascarada.
                Si tienes dudas sobre la autenticidad del documento, comunícate con nuestra línea de servicio al cliente.
            </p>
            </div>
        </div>
        )}
      </section>
    </main>
  );
}