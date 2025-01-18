// NostrMarketplace.js
import { SimplePool } from 'nostr-tools';

class NostrMarketplace {
  constructor() {
    this.relays = [
      'wss://nos.lol',
      'wss://relay.nostr.band',
      'wss://relay.damus.io',
      'wss://nostr.mom',
      'wss://relay.nostr.bg'
    ];
    this.pool = new SimplePool();
    this.PRODUCT_KIND = 30017;
  }

  async connect() {
    try {
      await Promise.any(
        this.relays.map(relay => this.pool.ensureRelay(relay))
      );
      console.log('Connected to relays');
      return true;
    } catch (error) {
      console.error('Error connecting to relays:', error);
      return false;
    }
  }

  async publishProduct({
    title,
    description,
    price,
    currency,
    paymentMethods,
    website,
    contactInfo,
    deliveryMethods,
    images,
    notes,
    categories = []
  }) {
    try {
      await this.connect();

      // Basic tags that are always included
      const tags = [
        ['c', 'marketplace']
      ];

      // Add price tag if price exists
      if (price) {
        tags.push(['price', price.toString(), currency || 'BTC']);
      }

      // Add payment methods if they exist
      if (Array.isArray(paymentMethods) && paymentMethods.length > 0) {
        paymentMethods.forEach(method => {
          tags.push(['payment', method]);
        });
      }

      // Add categories if they exist
      if (Array.isArray(categories) && categories.length > 0) {
        categories.forEach(category => {
          tags.push(['t', category]);
        });
      }

      // Add website if it exists
      if (website) {
        tags.push(['r', website]);
      }

      const content = JSON.stringify({
        title: title || 'Untitled Product',
        description: description || '',
        price: price || 0,
        currency: currency || 'BTC',
        paymentMethods: paymentMethods || [],
        website: website || '',
        contactInfo: contactInfo || '',
        deliveryMethods: deliveryMethods || [],
        images: images || [],
        notes: notes || ''
      });

      const pubkey = await window.nostr.getPublicKey();
      
      const event = {
        kind: this.PRODUCT_KIND,
        pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags,
        content
      };

      try {
        const signedEvent = await window.nostr.signEvent(event);
        await this.pool.publish(this.relays, signedEvent);
        return signedEvent;
      } catch (publishError) {
        console.error('Failed to publish to relays:', publishError);
        throw publishError;
      }
    } catch (error) {
      console.error('Error publishing product:', error);
      throw error;
    }
  }

  async searchProducts(filters) {
    try {
      await this.connect();

      const events = await this.pool.list(this.relays, [{
        kinds: [this.PRODUCT_KIND],
        limit: 100,
        ...filters
      }]);

      return events
        .filter(event => {
          // Filter out empty or deleted events
          if (!event.content || event.tags.some(tag => tag[0] === 'deleted')) {
            return false;
          }
          
          try {
            const content = JSON.parse(event.content);
            return content && typeof content === 'object';
          } catch (error) {
            return false;
          }
        })
        .map(event => {
          const content = JSON.parse(event.content);
          return {
            ...content,
            id: event.id,
            pubkey: event.pubkey,
            created_at: event.created_at,
            tags: event.tags
          };
        })
        .sort((a, b) => b.created_at - a.created_at);
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async followSeller(pubkey) {
    try {
      await this.connect();

      const event = {
        kind: 3,
        pubkey: await window.nostr.getPublicKey(),
        created_at: Math.floor(Date.now() / 1000),
        tags: [['p', pubkey]],
        content: ''
      };

      try {
        const signedEvent = await window.nostr.signEvent(event);
        await this.pool.publish(this.relays, signedEvent);
      } catch (publishError) {
        console.error('Failed to publish follow:', publishError);
        throw publishError;
      }
    } catch (error) {
      console.error('Error following seller:', error);
      throw error;
    }
  }

  async getFollowedSellers() {
    try {
      await this.connect();

      const pubkey = await window.nostr.getPublicKey();
      
      const events = await this.pool.list(this.relays, [{
        kinds: [3],
        authors: [pubkey]
      }]);

      const sellers = new Set();
      events.forEach(event => {
        const sellerTags = event.tags.filter(tag => tag[0] === 'p');
        sellerTags.forEach(tag => sellers.add(tag[1]));
      });

      return Array.from(sellers);
    } catch (error) {
      console.error('Error getting followed sellers:', error);
      return [];
    }
  }
}

export default NostrMarketplace;