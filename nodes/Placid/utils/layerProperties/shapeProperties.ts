/**
 * Shape/Rectangle layer specific properties in Placid
 * Based on: https://placid.app/docs/2.0/rest/layers
 */

export interface ShapePropertyOption {
	name: string;
	value: string;
	description: string;
	restrictedTo: string[]; // Empty array means available for all resources, otherwise specify resource types
	fieldType?: 'string' | 'color'; // Field type for UI generation
	placeholder?: string; // Placeholder text for the input field
}

export const shapeProperties: ShapePropertyOption[] = [
	{
		name: 'Background Color',
		value: 'background_color',
		description: 'Background color as hex-code (e.g., #FFFFFF)',
		restrictedTo: [], // Available for all resources
		fieldType: 'color',
	},
	{
		name: 'Border Color',
		value: 'border_color',
		description: 'Border color as hex-code (e.g., #FFFFFF)',
		restrictedTo: [], // Available for all resources
		fieldType: 'color',
	},
	{
		name: 'Border Radius',
		value: 'border_radius',
		description: 'Border radius in px (e.g., 2px or 2) - only available for rectangles',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'e.g., 10, 50%, 5px',
	},
	{
		name: 'Border Width',
		value: 'border_width',
		description: 'Border width in px (e.g., 2px or 2)',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'e.g., 2, 2px',
	},
	{
		name: 'SVG URL',
		value: 'svg',
		description: 'SVG URL for vector graphics',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'https://example.com/icon.svg',
	},
]; 