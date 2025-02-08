"use client"
import { Info } from "lucide-react"

const MobileNotice = () => {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            Estás en modo de solo lectura. Para publicar productos y seguir vendedores, visita Nostr Marketplace desde
            un ordenador con la extensión Alby instalada.
          </p>
          <p className="mt-2 text-sm">
            <a
              href="https://getalby.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline hover:text-blue-600"
            >
              Más información sobre Alby
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default MobileNotice