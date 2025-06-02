/**
 * Barcode layer specific properties in Placid
 * Based on: https://placid.app/docs/2.0/rest/layers
 */

export interface BarcodePropertyOption {
	name: string;
	value: string;
	description: string;
	restrictedTo: string[]; // Empty array means available for all resources, otherwise specify resource types
	fieldType?: 'string' | 'color'; // Field type for UI generation
	placeholder?: string; // Placeholder text for the input field
}

export const barcodeProperties: BarcodePropertyOption[] = [
	{
		name: 'Barcode Value',
		value: 'value',
		description: 'The barcode value to encode',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'Enter barcode content...',
	},
	{
		name: 'Color',
		value: 'color',
		description: 'Color as hex-code (e.g., #FFFFFF)',
		restrictedTo: [], // Available for all resources
		fieldType: 'color',
	},
]; 