/**
 * Browserframe layer specific properties in Placid
 * Based on: https://placid.app/docs/2.0/rest/layers
 */

export interface BrowserframePropertyOption {
	name: string;
	value: string;
	description: string;
	restrictedTo: string[]; // Empty array means available for all resources, otherwise specify resource types
	fieldType?: 'string' | 'color'; // Field type for UI generation
	placeholder?: string; // Placeholder text for the input field
}

export const browserframeProperties: BrowserframePropertyOption[] = [
	{
		name: 'Image URL',
		value: 'image',
		description: 'Image URL or URL of the website to screenshot',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'https://example.com/image.jpg',
	},
	{
		name: 'Image Viewport',
		value: 'image_viewport',
		description: 'Viewport size of screenshots (widthxheight; defaults to 1280x1024)',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'e.g., 1280x1024',
	},
	{
		name: 'URL',
		value: 'url',
		description: 'URL to insert into the browserframe\'s address bar',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'https://example.com',
	},
]; 