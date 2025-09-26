import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods, sleep } from 'n8n-workflow';
import { getImageById } from './get.operation';
import { processUnifiedLayers, LayerData } from '../../utils/layerUtils';
import { PlacidConfig } from '../../utils/config';

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
		url: PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.IMAGES),
		headers: {
			'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
			'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
			'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
		},
		body,
	};

	const createResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', createOptions);
	
	// If image was created successfully, poll for completion using the shared helper function
	if (createResponse.id) {
		const imageId = createResponse.id;
		const pollingConfig = PlacidConfig.getPollingConfig('IMAGE');
		const maxAttempts = pollingConfig.MAX_ATTEMPTS;
		const pollInterval = pollingConfig.INTERVAL_MS;
		
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			// Wait before polling (except for first attempt)
			if (attempt > 0) {
				await sleep(pollInterval);
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
		throw new Error(`${pollingConfig.TIMEOUT_MESSAGE} after ${maxAttempts} attempts. Last status: ${createResponse.status}`);
	}
	
	// Fallback: return the initial response if no ID was provided
	return {
		json: createResponse,
	};
} 