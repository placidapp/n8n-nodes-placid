/**
 * General properties that can be used on every layer type in Placid
 * Based on: https://placid.app/docs/2.0/rest/layers
 */

export interface GeneralPropertyOption {
	name: string;
	value: string;
	description: string;
	restrictedTo: string[]; // Empty array means available for all resources, otherwise specify resource types
	fieldType?: 'string' | 'color' | 'options'; // Field type for UI generation
	placeholder?: string; // Placeholder text for the input field
	options?: { name: string; value: string }[]; // Options for 'options' field type
}

export const generalProperties: GeneralPropertyOption[] = [
	{
		name: 'Visibility',
		value: 'visibility',
		description: 'Set the layer visibility state',
		restrictedTo: [], // Available for all resources
		fieldType: 'options',
		options: [
			{ name: 'Visible', value: 'visible' },
			{ name: 'Hidden', value: 'hidden' }
		],
	}, 
	{
		name: 'Link Target',
		value: 'link_target',
		description: 'Add a clickable link to a custom target URL when rendering a non-rastered PDF',
		restrictedTo: ['pdf'], // Only available for PDF resources
		fieldType: 'string',
		placeholder: 'https://example.com',
	},
	{
		name: 'Custom Property',
		value: 'custom',
		description: 'Set a custom property not listed above',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'Custom property value',
	},
]; 