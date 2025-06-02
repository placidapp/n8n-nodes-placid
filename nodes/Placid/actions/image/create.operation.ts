import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { getImageById } from './get.operation';
import { processUnifiedLayers, LayerData } from '../../utils/layerUtils';

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const templateIdParam = this.getNodeParameter('template_id', i) as { value: string } | string;
	const configurationMode = this.getNodeParameter('configurationMode', i) as string;
	
	// Handle both resource locator modes: list mode (object with value) and ID mode (direct string)
	const templateId = typeof templateIdParam === 'string' ? templateIdParam : templateIdParam.value;
	
	// Create request body for REST API
	const body: { [key: string]: any } = {
		template_uuid: templateId,
		layers: {},
	};

	// Add optional fields
	const additionalFields = this.getNodeParameter('additionalFields', i, {}) as {
		webhook_success?: string;
		passthrough?: string;
	};

	if (additionalFields.webhook_success) {
		body.webhook_success = additionalFields.webhook_success;
	}

	if (additionalFields.passthrough) {
		body.passthrough = additionalFields.passthrough;
	}
	
	if (configurationMode === 'advanced') {
		// Advanced mode: use JSON directly
		const layersJson = this.getNodeParameter('layersJson', i) as string;
		try {
			body.layers = JSON.parse(layersJson);
		} catch (error) {
			throw new Error(`Invalid JSON in layers configuration: ${error.message}`);
		}
	} else {
		// Simple mode: process unified layer structure using utility function
		const layers = this.getNodeParameter('layers.layerItems', i, []) as LayerData[];
		body.layers = await processUnifiedLayers(layers, this, i);
	}
	

	
	// Use the standard REST API endpoint for creating images
	const createOptions = {
		method: 'POST' as IHttpRequestMethods,
		url: 'https://api.placid.app/api/rest/images',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body,
	};

	const createResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', createOptions);
	
	// If image was created successfully, poll for completion using the shared helper function
	if (createResponse.id) {
		const imageId = createResponse.id;
		const maxAttempts = 30; // Maximum polling attempts
		const pollInterval = 2000; // 2 seconds between polls
		
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			// Wait before polling (except for first attempt)
			if (attempt > 0) {
				await new Promise(resolve => setTimeout(resolve, pollInterval));
			}
			
			// Use the shared helper function to poll status
			const pollResponse = await getImageById(this, imageId);
			
			// Check if image is finished or has error
			if (pollResponse.status === 'finished') {
				return {
					json: pollResponse,
				};
			} else if (pollResponse.status === 'error') {
				throw new Error(`Image generation failed: ${pollResponse.error || 'Unknown error'}`);
			}

			
			// Continue polling if status is still "queued" or other pending status
		}
		
		// If we've reached max attempts without completion
		throw new Error(`Image generation timed out after ${maxAttempts} attempts. Last status: ${createResponse.status}`);
	}
	
	// Fallback: return the initial response if no ID was provided
	return {
		json: createResponse,
	};
} 