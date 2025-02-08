import { SimplePool } from "nostr-tools"

class NostrMarketplace {
  constructor() {
    this.relays = ["wss://relay.damus.io", "wss://nos.lol", "wss://nostr.wine"]
    this.pool = new SimplePool()
    this.PRODUCT_KIND = 30402
    this.APP_TAG = ["t", "nostrmarketplace"]

    console.log("Using product event kind:", this.PRODUCT_KIND)
  }

  async connect() {
    try {
      const MIN_REQUIRED_RELAYS = 1
      const successfulConnections = []

      for (const relay of this.relays) {
        try {
          await this.pool.ensureRelay(relay)
          console.log(`Successfully connected to ${relay}`)
          successfulConnections.push(relay)

          if (successfulConnections.length >= MIN_REQUIRED_RELAYS) {
            break
          }
        } catch (error) {
          console.warn(`Failed to connect to ${relay}:`, error.message)
        }
      }

      console.log("Successfully connected relays:", successfulConnections)

      if (successfulConnections.length < MIN_REQUIRED_RELAYS) {
        console.error(
          `Not enough relays connected. Required: ${MIN_REQUIRED_RELAYS}, Connected: ${successfulConnections.length}`,
        )
        return false
      }

      this.relays = successfulConnections
      console.log(`Connected to ${successfulConnections.length} relays`)
      return true
    } catch (error) {
      console.error("Error in connect method:", error)
      return false
    }
  }

  cleanImageUrl(url) {
    try {
      if (!url) return null
      const cleanUrl = url.trim()
      const baseUrl = cleanUrl.split("#")[0].split("?")[0]
      const imageExtRegex = /\.(jpg|jpeg|png|gif|webp)$/i
      if (!imageExtRegex.test(baseUrl)) return null

      try {
        new URL(baseUrl)
        return baseUrl
      } catch {
        return null
      }
    } catch {
      return null
    }
  }

  parseContent(content) {
    try {
      return content
        .replace(/\[([^\]]+)\]$$([^)]+)$$/g, "$2")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    } catch {
      return content
    }
  }

  async publishProduct({
    title,
    summary,
    description,
    price,
    currency,
    paymentMethods,
    deliveryMethods,
    provincia,
    website,
    contactInfo,
    images,
    notes,
    categories = [],
  }) {
    try {
      await this.connect()

      let formattedWebsite = website
      if (website && !website.startsWith("http")) {
        formattedWebsite = "https://" + website
      }

      const contentMd =
        `# ${title}\n\n${description}\n\n` +
        (notes ? `### Notas Adicionales\n${notes}\n\n` : "") +
        (formattedWebsite ? `🌐 [Sitio Web](${formattedWebsite})\n` : "") +
        `📞 Contacto: ${contactInfo}\n`

      const tags = [
        ["d", title.toLowerCase().replace(/\s+/g, "-")],
        ["title", title],
        ["summary", summary],
        ["published_at", Math.floor(Date.now() / 1000).toString()],
        ["location", provincia],
        ["price", price.toString(), currency],
        ["c", "nostr-marketplace-app"],
        this.APP_TAG,
      ]

      if (website) {
        tags.push(["website", formattedWebsite])
      }

      categories.forEach((category) => {
        tags.push(["t", category])
      })

      paymentMethods.forEach((method) => {
        tags.push(["payment", method])
      })

      deliveryMethods.forEach((method) => {
        tags.push(["delivery", method])
      })

      if (images && images.length > 0) {
        images.forEach((image) => {
          tags.push(["image", image])
        })
      }

      const event = {
        kind: this.PRODUCT_KIND,
        pubkey: await window.nostr.getPublicKey(),
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content: contentMd,
      }

      try {
        const signedEvent = await window.nostr.signEvent(event)
        console.log("Event signed successfully:", signedEvent)
        await this.pool.publish(this.relays, signedEvent)
        console.log("Event published successfully")

        // Return the formatted product data
        return {
          id: signedEvent.id,
          pubkey: signedEvent.pubkey,
          created_at: signedEvent.created_at,
          title,
          summary,
          price,
          currency,
          provincia,
          images,
          paymentMethods,
          deliveryMethods,
          description,
          website: formattedWebsite,
          contactInfo,
          tags: signedEvent.tags,
        }
      } catch (publishError) {
        console.error("Failed to publish to relays:", publishError)
        throw publishError
      }
    } catch (error) {
      console.error("Error publishing product:", error)
      throw error
    }
  }

  async searchProducts(filters = {}) {
    try {
      await this.connect()
      console.log("Searching products with filters:", filters)

      const events = await this.pool.list(this.relays, [
        {
          kinds: [this.PRODUCT_KIND],
          limit: 100,
          ...filters,
          "#t": ["nostrmarketplace"],
        },
      ])

      console.log("Raw events found:", events.length)

      return events
        .filter((event) => {
          console.log("\nProcessing event:", {
            id: event.id,
            created_at: event.created_at,
            content: event.content?.substring(0, 100) + "...",
          })
          console.log("Event tags:", event.tags)

          const hasContent = !!event.content
          const hasMarketplaceTag = event.tags.some((t) => t[0] === "t" && t[1] === "nostrmarketplace")
          const isCreatedByThisApp = event.tags.some((t) => t[0] === "c" && t[1] === "nostr-marketplace-app")

          if (!hasContent) {
            console.log("Event filtered: no content")
            return false
          }
          if (!hasMarketplaceTag) {
            console.log("Event filtered: no marketplace tag")
            return false
          }
          if (!isCreatedByThisApp) {
            console.log("Event filtered: not created by this app")
            return false
          }

          return true
        })
        .map((event) => {
          const images = event.tags
            .filter((t) => t[0] === "image")
            .map((t) => {
              const cleanedUrl = this.cleanImageUrl(t[1])
              console.log("Image processing:", {
                tag: t,
                originalUrl: t[1],
                cleanedUrl,
              })
              return cleanedUrl || t[1]
            })
            .filter((url) => url)

          console.log("Final processed images:", images)

          return {
            id: event.id,
            pubkey: event.pubkey,
            created_at: event.created_at,
            title: event.tags.find((t) => t[0] === "title")?.[1],
            summary: event.tags.find((t) => t[0] === "summary")?.[1],
            price: event.tags.find((t) => t[0] === "price")?.[1],
            currency: event.tags.find((t) => t[0] === "price")?.[2],
            provincia: event.tags.find((t) => t[0] === "location")?.[1],
            images,
            paymentMethods: [...new Set(event.tags.filter((t) => t[0] === "payment").map((t) => t[1]))],
            deliveryMethods: [...new Set(event.tags.filter((t) => t[0] === "delivery").map((t) => t[1]))],
            description: this.parseContent(event.content),
            website: event.tags.find((t) => t[0] === "website")?.[1],
            contactInfo: event.content.match(/📞 Contacto: (.+)$/m)?.[1],
            tags: event.tags,
          }
        })
        .sort((a, b) => b.created_at - a.created_at)
    } catch (error) {
      console.error("Error searching products:", error)
      return []
    }
  }

  async followSeller(pubkey) {
    try {
      await this.connect()

      const event = {
        kind: 3,
        pubkey: await window.nostr.getPublicKey(),
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", pubkey]],
        content: "",
      }

      try {
        const signedEvent = await window.nostr.signEvent(event)
        await this.pool.publish(this.relays, signedEvent)
        console.log("Successfully followed seller:", pubkey)
      } catch (publishError) {
        console.error("Failed to publish follow:", publishError)
        throw publishError
      }
    } catch (error) {
      console.error("Error following seller:", error)
      throw error
    }
  }

  async getFollowedSellers() {
    try {
      await this.connect()

      const pubkey = await window.nostr.getPublicKey()

      const events = await this.pool.list(this.relays, [
        {
          kinds: [3],
          authors: [pubkey],
        },
      ])

      const sellers = new Set()
      events.forEach((event) => {
        const sellerTags = event.tags.filter((tag) => tag[0] === "p")
        sellerTags.forEach((tag) => sellers.add(tag[1]))
      })

      console.log("Retrieved followed sellers:", Array.from(sellers))
      return Array.from(sellers)
    } catch (error) {
      console.error("Error getting followed sellers:", error)
      return []
    }
  }

  async getUserPublicKey() {
    try {
      return await window.nostr.getPublicKey()
    } catch (error) {
      console.error("Error getting user public key:", error)
      return null
    }
  }
}

export default NostrMarketplace