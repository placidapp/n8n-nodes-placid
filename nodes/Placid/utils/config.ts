/**
 * Placid API Configuration
 * Centralizes all configuration constants, endpoints, and settings for the Placid n8n node
 */

export class PlacidConfig {
	/**
	 * API Base URLs
	 */
	static readonly API = {
		BASE_URL: 'https://api.placid.app/api',
		REST_BASE: 'https://api.placid.app/api/rest',
	} as const;

	/**
	 * API Endpoints by resource type
	 */
	static readonly ENDPOINTS = {
		IMAGES: '/images',
		PDFS: '/pdfs', 
		VIDEOS: '/videos',
		TEMPLATES: '/templates',
		MEDIA: '/media'
	} as const;

	/**
	 * Credential test configuration
	 */
	static readonly CREDENTIAL_TEST = {
		BASE_URL: 'https://api.placid.app/api',
		ENDPOINT: '/n8n/auth',
	} as const;

	/**
	 * Polling configuration for async operations
	 */
	static readonly POLLING = {
		IMAGE: {
			MAX_ATTEMPTS: 30,
			INTERVAL_MS: 2000, // 2 seconds
			TIMEOUT_MESSAGE: 'Image generation timed out',
		},
		PDF: {
			MAX_ATTEMPTS: 30,
			INTERVAL_MS: 2000, // 2 seconds  
			TIMEOUT_MESSAGE: 'PDF generation timed out',
		},
		VIDEO: {
			MAX_ATTEMPTS: 60,
			INTERVAL_MS: 5000, // 5 seconds (videos take longer)
			TIMEOUT_MESSAGE: 'Video generation timed out',
		},
	} as const;

	/**
	 * HTTP request defaults
	 */
	static readonly HTTP = {
		HEADERS: {
			ACCEPT: 'application/json',
			CONTENT_TYPE: 'application/json',
			PLACID_INTEGRATION: 'n8n',
		}
	} as const;

  

	/**
	 * Helper methods for building full URLs
	 */
	static getRestUrl(endpoint: string): string {
		return `${this.API.REST_BASE}${endpoint}`;
	}

	/**
	 * Helper methods for getting polling config by resource
	 */
	static getPollingConfig(resource: keyof typeof PlacidConfig.POLLING) {
		return this.POLLING[resource];
	}
}

/**
 * Type definitions for better type safety
 */ 