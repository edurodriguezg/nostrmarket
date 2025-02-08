"use client"

import { useState } from "react"
import { Info } from "lucide-react"

const InfoModal = () => {
  const [isOpen, setIsOpen] = useState(false)

  const relays = [
    "wss://relay.damus.io",
    "wss://nostr.wine",
    "wss://relay.nostr.band",
    "wss://nostr.mom",
    "wss://relay.snort.social",
  ]

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

  return (
    <>
      {/* Info Button */}
      <button
        onClick={openModal}
        className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
        title="Información"
      >
        <Info className="h-5 w-5" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Información de Nostr Marketplace</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Relays:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {relays.map((relay, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {relay}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sobre este Marketplace:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Todos los productos se publican en la red Nostr (NIP-99, kind: 30402)</li>
                  <li>Búsqueda por tag: #nostrmarketplace</li>
                  <li>Los datos son accesibles desde cualquier cliente Nostr compatible con NIP-99</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Para Desarrolladores:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Integra con los relays listados arriba</li>
                  <li>Filtra por kind:30402 y tag:nostrmarketplace</li>
                  <li>Los productos son eventos Nostr que siguen la especificación NIP-99</li>
                  <li>
                    Usa el tag "c" con valor "nostr-marketplace-app" para identificar productos creados por esta app
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={closeModal} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default InfoModal