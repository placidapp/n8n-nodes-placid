import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods, sleep, NodeOperationError } from 'n8n-workflow';
import { getVideoById } from './get.operation';
import { processUnifiedLayers, LayerData } from '../../utils/layerUtils';
import { PlacidConfig } from '../../utils/config';

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const configurationMode = this.getNodeParameter('configurationMode', i) as string;
	
	// Create request body for REST API
	const body: { [key: string]: any } = {
		clips: [],
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
		// Advanced mode: multi-clip JSON configuration (unchanged)
		const clipsJson = this.getNodeParameter('clipsJson', i) as string;
		try {
			const clips = JSON.parse(clipsJson);
			if (!Array.isArray(clips)) {
				throw new NodeOperationError(this.getNode(), 'Clips JSON must be an array');
			}
			body.clips = clips;
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Invalid JSON in clips configuration: ${error.message}`);
		}
	} else {
		// Simple mode: single template + layers (like image/PDF action)
		const templateIdParam = this.getNodeParameter('template_id', i) as { value: string } | string;
		const templateId = typeof templateIdParam === 'string' ? templateIdParam : templateIdParam.value;
		
		if (!templateId) {
			throw new NodeOperationError(this.getNode(), 'Template ID is required');
		}

		const clipData: { template_uuid: string; layers: { [key: string]: any }; [key: string]: any } = {
			template_uuid: templateId,
			layers: {},
		};

		// Add audio settings if provided (video-specific)
		const audioSettings = this.getNodeParameter('audioSettings', i, {}) as {
			audio?: string;
			audio_duration?: string;
			audio_trim_start?: string;
			audio_trim_end?: string;
		};
		
		if (audioSettings && Object.keys(audioSettings).length > 0) {
			Object.assign(clipData, audioSettings);
		}

		// Process layers using the unified utility function (same as image/PDF action)
		const layers = this.getNodeParameter('layers.layerItems', i, []) as LayerData[];
		clipData.layers = await processUnifiedLayers(layers, this, i);

		body.clips = [clipData];
	}
	

	
	// Use the standard REST API endpoint for creating videos
	const createOptions = {
		method: 'POST' as IHttpRequestMethods,
		url: PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.VIDEOS),
		headers: {
			'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
			'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
			'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
		},
		body,
	};

	const createResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', createOptions);
	
	// If video was created successfully, poll for completion using the shared helper function
	if (createResponse.id) {
		const videoId = createResponse.id;
		const pollingConfig = PlacidConfig.getPollingConfig('VIDEO');
		const maxAttempts = pollingConfig.MAX_ATTEMPTS;
		const pollInterval = pollingConfig.INTERVAL_MS;
		
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			// Wait before polling (except for first attempt)
			if (attempt > 0) {
				await sleep(pollInterval);
			}
			
			// Use the shared helper function to poll status
			const pollResponse = await getVideoById(this, videoId);
			
			// Check if video is finished or has error
			if (pollResponse.status === 'finished') {
				return {
					json: pollResponse,
					pairedItem: { item: i },
				};
			} else if (pollResponse.status === 'error') {
				throw new NodeOperationError(this.getNode(), `Video generation failed: ${pollResponse.error || 'Unknown error'}`);
			}
			
			// Continue polling if status is still "queued" or other pending status
		}
		
		// If we've reached max attempts without completion
		throw new NodeOperationError(this.getNode(), `${pollingConfig.TIMEOUT_MESSAGE} after ${maxAttempts} attempts. Last status: ${createResponse.status}`);
	}
	
	// Fallback: return the initial response if no ID was provided
	return {
		json: createResponse,
		pairedItem: { item: i },
	};
} 