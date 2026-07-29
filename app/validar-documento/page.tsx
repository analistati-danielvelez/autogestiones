"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  CheckCircle2,
  ExternalLink,
  FileSearch,
  Info,
  ShieldCheck,
  XCircle,
} from "lucide-react";

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
        Estamos consultando si el código corresponde a un documento generado o
        registrado por Cotrafa Social.
      </p>

      <div className="mx-auto mt-5 max-w-sm space-y-3 text-left text-sm">
        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#0090D1]" />
          <span className="text-gray-700">
            Verificando código de autenticidad
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#0090D1] [animation-delay:200ms]" />
          <span className="text-gray-700">
            Consultando registro del documento
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#0090D1] [animation-delay:400ms]" />
          <span className="text-gray-700">
            Protegiendo la información personal
          </span>
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
    <main className="min-h-screen bg-[#F7FAFC]">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Image
              src="/logo-cotrafasocial.png"
              alt="Cotrafa Social"
              width={92}
              height={92}
              className="h-auto w-[68px] sm:w-[76px]"
              priority
            />
  
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0090D1]">
                Cotrafa Social
              </p>
              <h1 className="text-lg font-extrabold text-[#002869] sm:text-xl">
                Validación documental
              </h1>
            </div>
          </div>
  
          <a
            href="https://cotrafasocial.com/"
            className="inline-flex items-center gap-2 rounded-full border border-[#002869] px-4 py-2 text-xs font-bold text-[#002869] transition hover:bg-[#002869] hover:text-white sm:text-sm"
          >
            Volver al sitio oficial
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </header>
  
      {/* Franja institucional */}
      <section className="border-b border-[#002869]/10 bg-[#002869]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-[#F4B321]" />
                Validación segura
              </div>

              <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                Consulta la autenticidad de tus documentos
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-6 text-white/80 sm:text-right">
              Verifica si un documento fue generado o registrado por{" "}
              <strong className="whitespace-nowrap">Cotrafa Social</strong>.
            </p>
          </div>
        </div>
      </section>
  
      {/* Contenido principal */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-[28px] border border-gray-100 bg-white p-6 shadow-xl shadow-[#002869]/10 sm:p-9">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0090D1]/10">
              <FileSearch className="h-8 w-8 text-[#0090D1]" />
            </div>
  
            <h3 className="text-3xl font-extrabold text-[#002869]">
              Validación de documento
            </h3>
  
            <p className="mt-3 text-gray-600">
              Ingresa el código de autenticidad para consultar la información
              asociada al documento.
            </p>
          </div>
  
          <div className="rounded-2xl border border-[#0090D1]/10 bg-[#F5FAFD] p-5">
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
              className={`mt-5 w-full px-8 py-6 text-base font-bold ${
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
                    Este código corresponde a un documento generado o registrado
                    por Cotrafa Social.
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
                  <span className="font-semibold">
                    Fecha de emisión o gestión:
                  </span>{" "}
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
                  Por seguridad, la información se muestra parcialmente
                  enmascarada. Si tienes dudas sobre la autenticidad del
                  documento, comunícate con nuestra línea de servicio al cliente.
                </p>
              </div>
            </div>
          )}
  
          <div className="mt-8 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-500">
              Servicio de validación documental de Cotrafa Social
            </p>
          </div>
        </section>
      </section>
  
      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-gray-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Cotrafa Social · Validación de documentos
        </div>
      </footer>
    </main>
  );
}