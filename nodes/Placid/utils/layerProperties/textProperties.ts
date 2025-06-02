/**
 * Text layer specific properties in Placid
 * Based on: https://placid.app/docs/2.0/rest/layers
 */

export interface TextPropertyOption {
	name: string;
	value: string;
	description: string;
	restrictedTo: string[]; // Empty array means available for all resources, otherwise specify resource types
	fieldType?: 'string' | 'color'; // Field type for UI generation
	placeholder?: string; // Placeholder text for the input field
}

export const textProperties: TextPropertyOption[] = [
	{
		name: 'Text Content',
		value: 'text',
		description: 'Text content. Line breaks can be forced using .',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'Enter text content...',
	},
	{
		name: 'Text Color',
		value: 'text_color',
		description: 'Text color as hex-code (e.g., #FFFFFF)',
		restrictedTo: [], // Available for all resources
		fieldType: 'color',
	},
	{
		name: 'Font',
		value: 'font',
		description: 'Set the font-family of the text layer',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'e.g., Arial, Helvetica, sans-serif',
	},
	{
		name: 'Alt Text Color',
		value: 'alt_text_color',
		description: 'Alternate text color as hex-code (e.g., #FFFFFF)',
		restrictedTo: [], // Available for all resources
		fieldType: 'color',
	},
	{
		name: 'Alt Font',
		value: 'alt_font',
		description: 'Set the alternative font-family of the text layer',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'e.g., Arial, Helvetica, sans-serif',
	},
]; 