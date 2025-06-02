/**
 * Subtitle layer specific properties in Placid
 * Based on: https://placid.app/docs/2.0/rest/layers
 */

export interface SubtitlePropertyOption {
	name: string;
	value: string;
	description: string;
	restrictedTo: string[]; // Empty array means available for all resources, otherwise specify resource types
	fieldType?: 'string' | 'color'; // Field type for UI generation
	placeholder?: string; // Placeholder text for the input field
}

export const subtitleProperties: SubtitlePropertyOption[] = [
	{
		name: 'SRT File URL',
		value: 'srt',
		description: '(optional) URL to SRT file - if not supplied, video clip will be auto transcribed',
		restrictedTo: ['video'], // Only available for video resources
		fieldType: 'string',
		placeholder: 'https://example.com/subtitles.srt',
	},
]; 