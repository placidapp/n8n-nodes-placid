/**
 * Picture layer specific properties in Placid
 * Based on: https://placid.app/docs/2.0/rest/layers
 */

export interface PicturePropertyOption {
	name: string;
	value: string;
	description: string;
	restrictedTo: string[]; // Empty array means available for all resources, otherwise specify resource types
	fieldType?: 'string' | 'color' | 'binary'; // Field type for UI generation
	placeholder?: string; // Placeholder text for the input field
}

export const pictureProperties: PicturePropertyOption[] = [
	{
		name: 'Image URL',
		value: 'image',
		description: 'Image URL (.jpg, .png, .gif, .webp)',
		restrictedTo: [], // Available for all resources
		fieldType: 'string',
		placeholder: 'https://example.com/image.jpg',
	},
	{
		name: 'Image File (Binary)',
		value: 'imageBinary',
		description: 'Upload an image file directly from binary data',
		restrictedTo: [], // Available for all resources
		fieldType: 'binary',
		placeholder: 'data',
	},
	{
		name: 'Image URLs (Array)',
		value: 'imageArray',
		description: 'Multiple image URLs for dynamic video generation (one per line)',
		restrictedTo: ['video'], // Only available for video resources
		fieldType: 'string',
		placeholder: 'https://example.com/image1.jpg\nhttps://example.com/image2.jpg\nhttps://example.com/image3.jpg',
	}, 
	{
		name: 'Video URL',
		value: 'video',
		description: 'Video URL (.mp4)',
		restrictedTo: ['video'], // Only available for video resources
		fieldType: 'string',
		placeholder: 'https://example.com/video.mp4',
	},
	{
		name: 'Video File (Binary)',
		value: 'videoBinary',
		description: 'Upload a video file directly from binary data',
		restrictedTo: ['video'], // Only available for video resources
		fieldType: 'binary',
		placeholder: 'data',
	},
]; 