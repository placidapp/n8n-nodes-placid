/**
 * Rating layer specific properties in Placid
 * Based on: https://placid.app/docs/2.0/rest/layers
 */

export interface RatingPropertyOption {
	name: string;
	value: string;
	description: string;
	restrictedTo: string[]; // Empty array means available for all resources, otherwise specify resource types
	fieldType?: 'string' | 'color'; // Field type for UI generation
	placeholder?: string; // Placeholder text for the input field
}

export const ratingProperties: RatingPropertyOption[] = [
	{
		name: 'Rating Value',
		value: 'value',
		description: 'The rating value (0-5 or 0-10 depending on layer settings, including decimals like 3.64)',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'e.g., 4.5, 3',
	},
]; 