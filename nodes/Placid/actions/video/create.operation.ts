import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { getVideoById } from './get.operation';
import { processUnifiedLayers, LayerData } from '../../utils/layerUtils';

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
		// Advanced mode: use JSON directly
		const clipsJson = this.getNodeParameter('clipsJson', i) as string;
		try {
			const clips = JSON.parse(clipsJson);
			if (!Array.isArray(clips)) {
				throw new Error('Clips JSON must be an array');
			}
			body.clips = clips;
		} catch (error) {
			throw new Error(`Invalid JSON in clips configuration: ${error.message}`);
		}
	} else {
		// Simple mode: process form fields for each clip
		const clips = this.getNodeParameter('clips.clipItems', i, []) as Array<{
			template_id: { value: string } | string;
			audioSettings?: {
				audio?: string;
				audio_duration?: string;
				audio_trim_start?: string;
				audio_trim_end?: string;
			};
			layerData: {
				layerItems?: LayerData[];
			};
		}>;

		if (!clips || clips.length === 0) {
			throw new Error('At least one clip is required for video generation');
		}

		// Process each clip
		for (const clip of clips) {
			// Handle both resource locator modes: list mode (object with value) and ID mode (direct string)
			const templateId = typeof clip.template_id === 'string' ? clip.template_id : clip.template_id.value;
			
			if (!templateId) {
				throw new Error('Template ID is required for each clip');
			}

			const clipData: { template_uuid: string; layers: { [key: string]: any }; [key: string]: any } = {
				template_uuid: templateId,
				layers: {},
			};

			// Add audio settings if provided
			if (clip.audioSettings) {
				Object.assign(clipData, clip.audioSettings);
			}

			// Process layers for this clip using the unified utility function
			const layers = clip.layerData?.layerItems || [];
			clipData.layers = await processUnifiedLayers(layers, this, i);

			body.clips.push(clipData);
		}
	}
	

	
	// Use the standard REST API endpoint for creating videos
	const createOptions = {
		method: 'POST' as IHttpRequestMethods,
		url: 'https://api.placid.app/api/rest/videos',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body,
	};

	const createResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', createOptions);
	
	// If video was created successfully, poll for completion using the shared helper function
	if (createResponse.id) {
		const videoId = createResponse.id;
		const maxAttempts = 60; // Maximum polling attempts (videos take longer)
		const pollInterval = 5000; // 5 seconds between polls
		
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			// Wait before polling (except for first attempt)
			if (attempt > 0) {
				await new Promise(resolve => setTimeout(resolve, pollInterval));
			}
			
			// Use the shared helper function to poll status
			const pollResponse = await getVideoById(this, videoId);
			
			// Check if video is finished or has error
			if (pollResponse.status === 'finished') {
				return {
					json: pollResponse,
				};
			} else if (pollResponse.status === 'error') {
				throw new Error(`Video generation failed: ${pollResponse.error || 'Unknown error'}`);
			}
			
			// Continue polling if status is still "queued" or other pending status
		}
		
		// If we've reached max attempts without completion
		throw new Error(`Video generation timed out after ${maxAttempts} attempts. Last status: ${createResponse.status}`);
	}
	
	// Fallback: return the initial response if no ID was provided
	return {
		json: createResponse,
	};
} 