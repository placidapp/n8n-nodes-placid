import { INodeProperties } from 'n8n-workflow';
import { getAllLayerTypes, getAllPropertiesForLayerType } from './layerProperties';
import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { PlacidConfig } from './config';

// ===== SHARED LAYER CONFIGURATION FIELDS =====

/**
 * Resource types that support layer configuration
 */
export type ResourceType = 'image' | 'pdf' | 'video';



/**
 * Generates dynamic layer configuration fields that automatically populate layer names from the selected template
 * @param resourceType - The resource type (image, video, pdf) for display options and feature customization
 * @param operationType - The operation type (create) for display options
 * @param configModeField - The configuration mode field name (configurationMode)
 * @param collectionName - The name of the collection (layers, layerData, etc.)
 * @param itemName - The name of the collection items (layerItems, textLayers, etc.)
 * @param displayName - The display name for the collection item (Add Layer, Text Layer, etc.)
 */
export function createDynamicLayerConfigurationFields(
	resourceType: ResourceType,
	operationType: string,
	configModeField: string,
	collectionName: string,
	itemName: string,
	displayName: string
): INodeProperties[] {
	// Get all available layer types from the layer properties system for property generation
	const allLayerTypes = getAllLayerTypes();

	// Generate unified property field with all properties from all layer types
	const propertyFields: INodeProperties[] = [];
	
	// Collect all unique properties from all layer types into one unified dropdown
	const allPropertiesArray: {name: string, value: string, description: string}[] = [];
	
	allLayerTypes.forEach(layerType => {
		const properties = getAllPropertiesForLayerType(layerType.value, resourceType);
		properties.forEach(prop => {
			// Skip custom property - we'll add it once at the end
			if (prop.value === 'custom') {
				return;
			}
			
			// Use a string key to avoid duplicates
			const key = `${prop.value}|${prop.name}`;
			if (!allPropertiesArray.some(p => `${p.value}|${p.name}` === key)) {
				// Add layer type prefix to property name for better UX
				const prefixedName = `${layerType.name.toUpperCase()}: ${prop.name}`;
				allPropertiesArray.push({
					name: prefixedName,
					value: prop.value,
					description: `${prop.description}`,
				});
			}
		});
	});
	
	// Sort all properties alphabetically
	allPropertiesArray.sort((a, b) => a.name.localeCompare(b.name));
	
	// Add custom property once at the end (no layer type prefix since it works for all)
	allPropertiesArray.push({
		name: 'Custom Property',
		value: 'custom',
		description: 'Set a custom property name and value (works with any layer type)',
	});

	// Create single unified property dropdown with all properties
	if (allPropertiesArray.length > 0) {
		propertyFields.push({
			displayName: 'Property',
			name: 'property',
			type: 'options' as const,
			options: allPropertiesArray,
			default: allPropertiesArray[0]?.value || '',
			description: 'Choose what property to set for this layer',
		});
	}

	// Generate value input fields for all possible properties
	const valueFields: INodeProperties[] = [];
	
	// Get all unique properties across all layer types for this resource
	const allProperties = new Map<string, any>();
	allLayerTypes.forEach(layerType => {
		const properties = getAllPropertiesForLayerType(layerType.value, resourceType);
		properties.forEach(prop => {
			if (!allProperties.has(prop.value)) {
				allProperties.set(prop.value, {
					...prop,
					layerTypes: [layerType.value]
				});
			} else {
				allProperties.get(prop.value)!.layerTypes.push(layerType.value);
			}
		});
	});

	// Create value input fields for each unique property
	allProperties.forEach((propInfo, propValue) => {
		// Skip custom properties as they are handled separately
		if (propValue === 'custom') {
			return;
		}

		// Use fieldType and placeholder from the property definition, with fallbacks
		let fieldType = propInfo.fieldType || 'string';
		const placeholder = propInfo.placeholder || '';
		const description = propInfo.description;

		// Special handling for imageArray - use textarea for multiple URLs
		if (propValue === 'imageArray') {
			fieldType = 'string';
		}

		// Special handling for binary fields - use string input for field name
		if (fieldType === 'binary') {
			fieldType = 'string';
		}

		// Create the base field configuration
		const fieldConfig: any = {
			displayName: propValue === 'value' ? 'Value' : propInfo.name,
			name: `${propValue}Value`,
			type: fieldType,
			default: '',
			description,
			displayOptions: {
				show: {
					property: [propValue],
				},
			},
		};

		// Add type-specific properties
		if (fieldType === 'options' && propInfo.options) {
			fieldConfig.options = propInfo.options;
			fieldConfig.default = propInfo.options[0]?.value || '';
		} else {
			fieldConfig.placeholder = placeholder;
			
			// Special handling for imageArray - use textarea
			if (propValue === 'imageArray') {
				fieldConfig.typeOptions = {
					rows: 4,
				};
			}

			// Special handling for binary fields - add hint about binary data
			if (propInfo.fieldType === 'binary') {
				fieldConfig.description = `${description} - Enter the field name containing the binary file data (e.g., "data")`;
				fieldConfig.hint = 'The field name from the input data that contains the binary file data';
			}
		}

		valueFields.push(fieldConfig);
	});

	// Add custom property fields
	valueFields.push(
		{
			displayName: 'Custom Property Name',
			name: 'customPropertyName',
			type: 'string' as const,
			default: '',
			placeholder: 'e.g., lineHeight, letterSpacing, transform',
			description: 'The name of the custom property to set',
			displayOptions: {
				show: {
					property: ['custom'],
				},
			},
		},
		{
			displayName: 'Custom Property Value',
			name: 'customPropertyValue',
			type: 'string' as const,
			default: '',
			placeholder: 'e.g., 1.5, 2px, scale(1.2)',
			description: 'The value for the custom property',
			displayOptions: {
				show: {
					property: ['custom'],
				},
			},
		}
	);

	return [
		{
			displayName: collectionName,
			name: collectionName.toLowerCase(),
			type: 'fixedCollection' as const,
			default: { [itemName]: [] },
			typeOptions: {
				multipleValues: true,
			},
			displayOptions: {
				show: {
					resource: [resourceType],
					operation: [operationType],
					[configModeField]: ['simple'],
				},
			},
			options: [
				{
					name: itemName,
					displayName: displayName,
					values: [
						{
							displayName: 'Layer Name',
							name: 'layerId',
							type: 'options' as const,
							description: 'Select the layer to modify from the template',
							default: '',
							required: true,
							typeOptions: {
								loadOptionsMethod: 'getTemplateLayers',
								loadOptionsDependsOn: ['template_id'],
							},
						},
						// Note: Layer Type field is removed - it will be extracted from the layerId value
						...propertyFields,
						...valueFields,
					],
				},
			],
		},
	];
}

// ===== SHARED LAYER PROCESSING FUNCTIONS =====

/**
 * Interface for unified layer data structure
 */
export interface LayerData {
	layerId: string; // Contains: "layerName|layerType" for template-driven layers, or just "layerName" for backward compatibility
	layerType?: string; // Optional - no longer used for property filtering, all properties are available
	property: string;
	// Text layer properties
	textValue?: string;
	colorValue?: string;
	fontSizeValue?: string;
	fontFamilyValue?: string;
	// Picture layer properties
	imageValue?: string;
	imageBinaryValue?: string; // Binary field name for image upload
	imageArrayValue?: string[] | string; // Support for image arrays in video generation - can be string from textarea or array
	videoValue?: string;
	videoBinaryValue?: string; // Binary field name for video upload
	opacityValue?: string;
	rotationValue?: string;
	borderRadiusValue?: string;
	// Shape layer properties
	background_colorValue?: string;
	border_colorValue?: string;
	border_radiusValue?: string;
	border_widthValue?: string;
	svgValue?: string;
	// Browserframe layer properties
	urlValue?: string;
	image_viewportValue?: string;
	// Barcode and Rating layer properties
	valueValue?: string;
	// Text layer additional properties
	text_colorValue?: string;
	alt_text_colorValue?: string;
	fontValue?: string;
	alt_fontValue?: string;
	// Subtitle layer properties
	subtitle_textValue?: string;
	srtValue?: string;
	// General properties
	hideValue?: string;
	visibilityValue?: string;
	position_x_absoluteValue?: string;
	position_y_absoluteValue?: string;
	position_x_relativeValue?: string;
	position_y_relativeValue?: string;
	widthValue?: string;
	heightValue?: string;
	link_targetValue?: string;
	// Custom properties
	customPropertyName?: string;
	customPropertyValue?: string;
}



/**
 * Helper function to upload a binary file and get its URL
 * @param executeFunctions - The n8n execution functions
 * @param index - The current item index
 * @param fieldName - The binary field name
 * @returns Promise<string> - The uploaded file URL
 */
export async function uploadBinaryFile(
	executeFunctions: IExecuteFunctions,
	index: number,
	fieldName: string
): Promise<string> {
	const items = executeFunctions.getInputData();
	const item = items[index];

	if (!item.binary || !item.binary[fieldName]) {
		throw new NodeOperationError(
			executeFunctions.getNode(),
			`No binary data found for field "${fieldName}"`
		);
	}

	const binaryData = item.binary[fieldName];
	const fileBuffer = await executeFunctions.helpers.getBinaryDataBuffer(index, fieldName);

	// Determine filename
	let fileName = binaryData.fileName;
	if (!fileName) {
		// Generate a default filename based on mime type
		const extension = binaryData.mimeType?.split('/')[1] || 'bin';
		fileName = `upload.${extension}`;
	}

	// Prepare form data for upload (same as upload media operation)
	const formData: { [key: string]: any } = {
		file: {
			value: fileBuffer,
			options: {
				filename: fileName,
				contentType: binaryData.mimeType || 'application/octet-stream',
			},
		},
	};

	try {
		// Make the upload request (same as upload media operation)
		const response = await executeFunctions.helpers.requestWithAuthentication.call(
			executeFunctions,
			'placidApi',
			{
				method: 'POST',
				url: PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.MEDIA),
				formData,
				json: false, // Important: don't parse as JSON since we're sending multipart
				headers: {
					'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
				},
			},
		);

		// Parse the response (same as upload media operation)
		let responseData;
		try {
			responseData = typeof response === 'string' ? JSON.parse(response) : response;
		} catch (error) {
			throw new NodeOperationError(
				executeFunctions.getNode(),
				`Failed to parse upload response: ${error.message}`
			);
		}

		// Check if the response contains media data (same as upload media operation)
		if (!responseData.media || !Array.isArray(responseData.media) || responseData.media.length === 0) {
			throw new NodeOperationError(
				executeFunctions.getNode(),
				'Invalid response format from Placid media upload API'
			);
		}

		// Return the file URL
		return responseData.media[0].file_id;
	} catch (error) {
		if (error.response) {
			const statusCode = error.response.status;
			const errorMessage = error.response.data?.message || error.response.data || error.message;
			throw new NodeOperationError(
				executeFunctions.getNode(),
				`Media upload failed (${statusCode}): ${errorMessage}`
			);
		}
		throw new NodeOperationError(
			executeFunctions.getNode(),
			`Media upload failed: ${error.message}`
		);
	}
}

/**
 * Processes unified layer data and converts it to Placid API format
 * @param layers - Array of layer data
 * @param executeFunctions - The n8n execution functions (optional, required for binary uploads)
 * @param index - The current item index (optional, required for binary uploads)
 * @returns Object with layer configurations for Placid API
 */
export async function processUnifiedLayers(
	layers: LayerData[],
	executeFunctions?: IExecuteFunctions,
	index?: number
): Promise<{ [key: string]: any }> {
	const processedLayers: { [key: string]: any } = {};

	for (const layer of layers) {
		// Extract layer name and type from encoded layerId value
		let layerName: string;
		let layerType: string;
		
		// Check if layerId contains the new encoded format (layerName|layerType)
		if (layer.layerId && layer.layerId.includes('|')) {
			const parts = layer.layerId.split('|');
			layerName = parts[0];
			layerType = parts[1] || 'unknown';
		} else {
			// Fallback for backward compatibility or manual input
			layerName = layer.layerId;
			layerType = layer.layerType || 'unknown';
		}
		
		if (!layerName) continue;
		
		// Note: layerType is extracted for potential future validation or debugging
		// Currently used for extracting the correct layer name from encoded format
		void layerType; // Suppress TypeScript unused variable warning
		
		// Initialize layer object if it doesn't exist
		if (!processedLayers[layerName]) {
			processedLayers[layerName] = {};
		}
		
		// Handle custom properties first
		if (layer.property === 'custom' && layer.customPropertyName && layer.customPropertyValue) {
			processedLayers[layerName][layer.customPropertyName] = layer.customPropertyValue;
			continue;
		}
		
		// Handle all other properties dynamically based on the property value and corresponding field
		const propertyValue = layer.property;
		let valueToSet: any = null;
		
		// Map property values to their corresponding field names in LayerData
		switch (propertyValue) {
			case 'text':
				valueToSet = layer.textValue;
				break;
			case 'color':
				valueToSet = layer.colorValue;
				break;
			case 'text_color':
				valueToSet = layer.text_colorValue;
				break;
			case 'alt_text_color':
				valueToSet = layer.alt_text_colorValue;
				break;
			case 'background_color':
				valueToSet = layer.background_colorValue;
				break;
			case 'border_color':
				valueToSet = layer.border_colorValue;
				break;
			case 'font':
				valueToSet = layer.fontValue;
				break;
			case 'alt_font':
				valueToSet = layer.alt_fontValue;
				break;
			case 'fontFamily':
				valueToSet = layer.fontFamilyValue;
				break;
			case 'fontSize':
				valueToSet = layer.fontSizeValue;
				break;
			case 'image':
				// Support both single image and image arrays (for video generation)
				valueToSet = layer.imageArrayValue && layer.imageArrayValue.length > 0 
					? layer.imageArrayValue 
					: layer.imageValue;
				break;
			case 'imageBinary':
				// Handle binary image upload
				if (layer.imageBinaryValue && executeFunctions && index !== undefined) {
					try {
						valueToSet = await uploadBinaryFile(executeFunctions, index, layer.imageBinaryValue);
						// Set as 'image' property in the API
						if (valueToSet) {
							processedLayers[layerName]['image'] = valueToSet;
						}
						continue; // Skip the normal property setting below
					} catch (error) {
						throw error; // Re-throw the error to be handled by the calling function
					}
				}
				break;
			case 'imageArray':
				// Handle image arrays for video generation
				if (layer.imageArrayValue) {
					if (Array.isArray(layer.imageArrayValue)) {
						// If we already have an array, use it directly
						valueToSet = layer.imageArrayValue.length > 0 ? layer.imageArrayValue : null;
					} else if (typeof layer.imageArrayValue === 'string') {
						// If we have a string (from textarea), split by newlines and filter empty lines
						const imageUrls = layer.imageArrayValue.split('\n')
							.map(url => url.trim())
							.filter(url => url.length > 0);
						valueToSet = imageUrls.length > 0 ? imageUrls : null;
					}
				}
				// Set the property as 'image' in the API (Placid expects 'image' property with array value)
				if (valueToSet !== null && valueToSet !== undefined && valueToSet !== '') {
					processedLayers[layerName]['image'] = valueToSet;
				}
				continue; // Skip the normal property setting below
			case 'video':
				valueToSet = layer.videoValue;
				break;
			case 'videoBinary':
				// Handle binary video upload
				if (layer.videoBinaryValue && executeFunctions && index !== undefined) {
					try {
						valueToSet = await uploadBinaryFile(executeFunctions, index, layer.videoBinaryValue);
						// Set as 'video' property in the API
						if (valueToSet) {
							processedLayers[layerName]['video'] = valueToSet;
						}
						continue; // Skip the normal property setting below
					} catch (error) {
						throw error; // Re-throw the error to be handled by the calling function
					}
				}
				break;
			case 'opacity':
				valueToSet = layer.opacityValue;
				break;
			case 'rotation':
				valueToSet = layer.rotationValue;
				break;
			case 'border_radius':
			case 'borderRadius':
				valueToSet = layer.borderRadiusValue;
				break;
			case 'border_width':
				valueToSet = (layer as any).border_widthValue;
				break;
			case 'url':
				valueToSet = (layer as any).urlValue;
				break;
			case 'svg':
				valueToSet = (layer as any).svgValue;
				break;
			case 'image_viewport':
				valueToSet = (layer as any).image_viewportValue;
				break;
			case 'value': // For barcode and rating layers
				valueToSet = (layer as any).valueValue;
				break;
			case 'srt': // For subtitle layers
				valueToSet = (layer as any).srtValue;
				break;
			default:
				// For any other properties, try to find a corresponding field
				const fieldName = `${propertyValue}Value`;
				valueToSet = (layer as any)[fieldName];
				break;
		}
		
		// Only set the property if we have a value
		if (valueToSet !== null && valueToSet !== undefined && valueToSet !== '') {
			processedLayers[layerName][propertyValue] = valueToSet;
		}
	}

	return processedLayers;
}



 