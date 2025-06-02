import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods } from 'n8n-workflow';
import { getPdfById } from './get.operation';
import { processUnifiedLayers, LayerData } from '../../utils/layerUtils';

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
		// Advanced mode: use JSON directly
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
		// Simple mode: process form fields for each page
		const pages = this.getNodeParameter('pages.pageItems', i, []) as Array<{
			template_id: { value: string } | string;
			layerData: {
				layerItems?: LayerData[];
			};
		}>;

		if (!pages || pages.length === 0) {
			throw new Error('At least one page is required for PDF generation');
		}

		// Process each page
		for (const page of pages) {
			// Handle both resource locator modes: list mode (object with value) and ID mode (direct string)
			const templateId = typeof page.template_id === 'string' ? page.template_id : page.template_id.value;
			
			if (!templateId) {
				throw new Error('Template ID is required for each page');
			}

			const pageData: { template_uuid: string; layers: { [key: string]: any } } = {
				template_uuid: templateId,
				layers: {},
			};

			// Process layers for this page using the unified utility function
			const layers = page.layerData?.layerItems || [];
			pageData.layers = await processUnifiedLayers(layers, this, i);

			body.pages.push(pageData);
		}
	}
	

	
	// Use the standard REST API endpoint for creating PDFs
	const createOptions = {
		method: 'POST' as IHttpRequestMethods,
		url: 'https://api.placid.app/api/rest/pdfs',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body,
	};

	const createResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', createOptions);
	
	// If PDF was created successfully, poll for completion using the shared helper function
	if (createResponse.id) {
		const pdfId = createResponse.id;
		const maxAttempts = 30; // Maximum polling attempts
		const pollInterval = 2000; // 2 seconds between polls
		
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
		throw new Error(`PDF generation timed out after ${maxAttempts} attempts. Last status: ${createResponse.status}`);
	}
	
	// Fallback: return the initial response if no ID was provided
	return {
		json: createResponse,
	};
} 