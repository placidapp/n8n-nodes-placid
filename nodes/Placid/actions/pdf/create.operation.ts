import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { getPdfById } from './get.operation';
import { processUnifiedLayers, LayerData } from '../../utils/layerUtils';
import { PlacidConfig } from '../../utils/config';

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const configurationMode = this.getNodeParameter('configurationMode', i) as string;
	
	// Create request body for REST API
	const body: { [key: string]: any } = {
		pages: [],
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
		// Advanced mode: multi-page JSON configuration
		const pagesJson = this.getNodeParameter('pagesJson', i) as string;
		try {
			const pages = JSON.parse(pagesJson);
			if (!Array.isArray(pages)) {
				throw new Error('Pages JSON must be an array');
			}
			body.pages = pages;
		} catch (error) {
			throw new Error(`Invalid JSON in pages configuration: ${error.message}`);
		}
	} else {
		// Simple mode: single template + layers (like image action)
		const templateIdParam = this.getNodeParameter('template_id', i) as { value: string } | string;
		const templateId = typeof templateIdParam === 'string' ? templateIdParam : templateIdParam.value;
		
		if (!templateId) {
			throw new Error('Template ID is required');
		}
		
		const pageData: { template_uuid: string; layers: { [key: string]: any } } = {
			template_uuid: templateId,
			layers: {},
		};

		// Process layers using the unified utility function (same as image action)
		const layers = this.getNodeParameter('layers.layerItems', i, []) as LayerData[];
		pageData.layers = await processUnifiedLayers(layers, this, i);

		body.pages = [pageData];
	}
	

	
	// Use the standard REST API endpoint for creating PDFs
	const createOptions = {
		method: 'POST' as IHttpRequestMethods,
		url: PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.PDFS),
		headers: {
			'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
			'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
			'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
		},
		body,
	};

	const createResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', createOptions);
	
	// If PDF was created successfully, poll for completion using the shared helper function
	if (createResponse.id) {
		const pdfId = createResponse.id;
		const pollingConfig = PlacidConfig.getPollingConfig('PDF');
		const maxAttempts = pollingConfig.MAX_ATTEMPTS;
		const pollInterval = pollingConfig.INTERVAL_MS;
		
		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			// Wait before polling (except for first attempt)
			if (attempt > 0) {
				await new Promise(resolve => setTimeout(resolve, pollInterval));
			}
			
			// Use the shared helper function to poll status
			const pollResponse = await getPdfById(this, pdfId);
			
			// Check if PDF is finished or has error
			if (pollResponse.status === 'finished') {
				return {
					json: pollResponse,
				};
			} else if (pollResponse.status === 'error') {
				throw new Error(`PDF generation failed: ${pollResponse.error || 'Unknown error'}`);
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