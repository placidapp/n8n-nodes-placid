/**
 * Layer properties index - exports all layer type properties
 * Based on: https://placid.app/docs/2.0/rest/layers
 */

// Import all property arrays
import { generalProperties } from './generalProperties';
import { textProperties } from './textProperties';
import { pictureProperties } from './pictureProperties';
import { shapeProperties } from './shapeProperties';
import { browserframeProperties } from './browserframeProperties';
import { barcodeProperties } from './barcodeProperties';
import { ratingProperties } from './ratingProperties';
import { subtitleProperties } from './subtitleProperties';

// Export all property types and interfaces
export * from './generalProperties';
export * from './textProperties';
export * from './pictureProperties';
export * from './shapeProperties';
export * from './browserframeProperties';
export * from './barcodeProperties';
export * from './ratingProperties';
export * from './subtitleProperties';

// Re-export for convenience
export { generalProperties, textProperties, pictureProperties, shapeProperties, browserframeProperties, barcodeProperties, ratingProperties, subtitleProperties };

/**
 * Layer type enumeration
 */
export enum LayerType {
	TEXT = 'text',
	PICTURE = 'picture',
	SHAPE = 'shape',
	BROWSERFRAME = 'browserframe',
	BARCODE = 'barcode',
	RATING = 'rating',
	SUBTITLE = 'subtitle',
}

/**
 * Resource type enumeration
 */
export enum ResourceType {
	IMAGE = 'image',
	PDF = 'pdf',
	VIDEO = 'video',
}

/**
 * Base property option interface
 */
export interface PropertyOption {
	name: string;
	value: string;
	description: string;
	restrictedTo: string[];
	fieldType?: 'string' | 'color' | 'options' | 'binary'; // Field type for UI generation
	placeholder?: string; // Placeholder text for the input field
	options?: { name: string; value: string }[]; // Options for 'options' field type
}

/**
 * Filter properties based on resource type restrictions
 */
export function filterPropertiesByResource(properties: PropertyOption[], resourceType: string): PropertyOption[] {
	return properties.filter(property => 
		property.restrictedTo.length === 0 || property.restrictedTo.includes(resourceType)
	);
}

/**
 * Get properties for a specific layer type, optionally filtered by resource type
 */
export function getPropertiesForLayerType(layerType: LayerType | string, resourceType?: string): PropertyOption[] {
	let properties: PropertyOption[] = [];
	
	switch (layerType) {
		case LayerType.TEXT:
		case 'text':
			properties = textProperties;
			break;
		case LayerType.PICTURE:
		case 'picture':
			properties = pictureProperties;
			break;
		case LayerType.SHAPE:
		case 'shape':
			properties = shapeProperties;
			break;
		case LayerType.BROWSERFRAME:
		case 'browserframe':
			properties = browserframeProperties;
			break;
		case LayerType.BARCODE:
		case 'barcode':
			properties = barcodeProperties;
			break;
		case LayerType.RATING:
		case 'rating':
			properties = ratingProperties;
			break;
		case LayerType.SUBTITLE:
		case 'subtitle':
			properties = subtitleProperties;
			break;
		default:
			return [];
	}
	
	// Filter by resource type if specified
	if (resourceType) {
		return filterPropertiesByResource(properties, resourceType);
	}
	
	return properties;
}

/**
 * Get general properties, optionally filtered by resource type
 */
export function getGeneralProperties(resourceType?: string): PropertyOption[] {
	if (resourceType) {
		return filterPropertiesByResource(generalProperties, resourceType);
	}
	return generalProperties;
}

/**
 * Get all available layer types
 */
export function getAllLayerTypes() {
	return [
		{ name: 'Text', value: LayerType.TEXT, description: 'Text layer for displaying text content' },
		{ name: 'Picture', value: LayerType.PICTURE, description: 'Picture layer for displaying images or videos' },
		{ name: 'Shape', value: LayerType.SHAPE, description: 'Shape/Rectangle layer for backgrounds and geometric shapes' },
		{ name: 'Browserframe', value: LayerType.BROWSERFRAME, description: 'Browserframe layer for website screenshots with browser UI' },
		{ name: 'Barcode', value: LayerType.BARCODE, description: 'Barcode layer for generating barcodes' },
		{ name: 'Rating', value: LayerType.RATING, description: 'Rating layer for star ratings and scores' },
		{ name: 'Subtitle', value: LayerType.SUBTITLE, description: 'Subtitle layer for video captions and subtitles' },
	];
}

/**
 * Get all properties for a layer type including general properties, optionally filtered by resource type
 */
export function getAllPropertiesForLayerType(layerType: LayerType | string, resourceType?: string): PropertyOption[] {
	const layerSpecificProperties = getPropertiesForLayerType(layerType, resourceType);
	const generalProps = getGeneralProperties(resourceType);
	
	return [...layerSpecificProperties, ...generalProps];
} 