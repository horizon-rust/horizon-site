import { HomePage } from "@/components/home-page";
import { pageMetadata } from "@/components/site";

export const metadata = pageMetadata({
  title: "Horizon: Minecraft Rust Edition, Java 26.3 reconstruido en Rust",
  description:
    "Minecraft: Java Edition 26.3 reescrito en Rust. Gratuito, de código abierto y probado contra vanilla. Descarga el launcher de Horizon para Windows, macOS y Linux.",
  path: "/es",
});

export default function HomeSpanish() {
  return <HomePage locale="es" />;
}
