import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Validación documental | Cotrafa Social",
  description: "Consulta la autenticidad de documentos emitidos por Cotrafa Social.",
  icons: {
    icon: "/logo-cotrafasocial.png",
    shortcut: "/logo-cotrafasocial.png",
    apple: "/logo-cotrafasocial.png",
  },
};

export default function ValidarDocumentoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}