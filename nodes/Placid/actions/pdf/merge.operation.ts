import { IExecuteFunctions, INodeExecutionData, IHttpRequestMethods, sleep, NodeOperationError } from 'n8n-workflow';
import { getPdfById } from './get.operation';
import { PlacidConfig } from '../../utils/config';
import { buildMultipartBody, MultipartFile } from '../../utils/multipartUtils';

interface PdfSource {
	sourceType: 'url' | 'binary';
	url?: string;
	binaryField?: string;
}

/**
 * Upload a single binary file to Placid media storage and return its URL
 */
async function uploadBinaryFileToMedia(
	context: IExecuteFunctions,
	itemIndex: number,
	fieldName: string,
): Promise<string> {
	const items = context.getInputData();
	const item = items[itemIndex];

	if (!item.binary) {
		throw new NodeOperationError(context.getNode(), 'No binary data found in input');
	}

	const binaryData = item.binary[fieldName];
	if (!binaryData) {
		throw new NodeOperationError(context.getNode(), `No binary data found for field "${fieldName}"`);
	}

	const fileBuffer = await context.helpers.getBinaryDataBuffer(itemIndex, fieldName);

	// Determine filename
	let fileName = binaryData.fileName;
	if (!fileName) {
		const extension = binaryData.mimeType?.split('/')[1] || 'pdf';
		fileName = `file.${extension}`;
	}

	const filesToUpload: MultipartFile[] = [{
		key: 'file',
		buffer: fileBuffer,
		filename: fileName,
		contentType: binaryData.mimeType || 'application/pdf',
	}];

	const { body, boundary } = buildMultipartBody(filesToUpload);

	try {
		const response = await context.helpers.httpRequestWithAuthentication.call(
			context,
			'placidApi',
			{
				method: 'POST' as IHttpRequestMethods,
				url: PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.MEDIA),
				body,
				headers: {
					'Content-Type': `multipart/form-data; boundary=${boundary}`,
					'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
				},
			},
		);

		// Parse response and extract URL
		let responseData;
		try {
			responseData = typeof response === 'string' ? JSON.parse(response) : response;
		} catch (parseError) {
			throw new NodeOperationError(context.getNode(), `Failed to parse upload response for "${fieldName}": ${parseError.message}`);
		}

		if (!responseData.media || !Array.isArray(responseData.media) || responseData.media.length === 0) {
			throw new NodeOperationError(context.getNode(), `Failed to upload file "${fieldName}": Invalid response from Placid API`);
		}

		// Get the URL from the uploaded media
		const uploadedMedia = responseData.media[0];
		if (!uploadedMedia.file_id) {
			throw new NodeOperationError(context.getNode(), `Failed to get URL for uploaded file "${fieldName}"`);
		}

		// Return the file_id - it's already a full URL
		return uploadedMedia.file_id;
	} catch (error) {
		if (error instanceof NodeOperationError) {
			throw error;
		}
		if (error.response) {
			const statusCode = error.response.status;
			const errorMessage = error.response.data?.message || error.response.data || error.message;
			throw new NodeOperationError(context.getNode(), `Failed to upload file "${fieldName}": ${errorMessage} (${statusCode})`);
		}
		throw new NodeOperationError(context.getNode(), `Failed to upload file "${fieldName}": ${error.message}`);
	}
}

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData> {
	const configurationMode = this.getNodeParameter('configurationMode', i, 'simple') as string;
	let urls: string[] = [];

	if (configurationMode === 'advanced') {
		// Advanced mode: parse JSON array of URLs
		const urlsJson = this.getNodeParameter('urlsJson', i) as string;
		try {
			const parsedUrls = JSON.parse(urlsJson);
			if (!Array.isArray(parsedUrls)) {
				throw new NodeOperationError(this.getNode(), 'URLs JSON must be an array');
			}
			urls = parsedUrls.filter((url: unknown) => typeof url === 'string' && url.trim().length > 0);
		} catch (error) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(this.getNode(), `Invalid JSON in URLs configuration: ${error.message}`);
		}

		// Validate URL count (2-10 required)
		if (urls.length < 2) {
			throw new NodeOperationError(this.getNode(), 'At least 2 valid PDF URLs are required for merging');
		}
		if (urls.length > 10) {
			throw new NodeOperationError(this.getNode(), 'Maximum 10 PDF URLs allowed for merging');
		}
	} else {
		// Simple mode: Get PDF sources from fixedCollection
		const pdfSourcesData = this.getNodeParameter('pdfSources', i) as { sources?: PdfSource[] };
		const sources = pdfSourcesData.sources || [];

		// Validate source count (2-10 required)
		if (sources.length < 2) {
			throw new NodeOperationError(this.getNode(), 'At least 2 PDF sources are required for merging');
		}
		if (sources.length > 10) {
			throw new NodeOperationError(this.getNode(), 'Maximum 10 PDF sources allowed for merging');
		}

		// Process each source - collect URLs (uploading binary files as needed)
		for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex++) {
			const source = sources[sourceIndex];

			if (source.sourceType === 'binary') {
				// Upload binary file and get URL
				if (!source.binaryField) {
					throw new NodeOperationError(this.getNode(), `Binary field name is required for source ${sourceIndex + 1}`);
				}
				const url = await uploadBinaryFileToMedia(this, i, source.binaryField);
				urls.push(url);
			} else {
				// Use URL directly
				if (!source.url) {
					throw new NodeOperationError(this.getNode(), `URL is required for source ${sourceIndex + 1}`);
				}
				urls.push(source.url);
			}
		}
	}

	// Build request body
	const body: { [key: string]: any } = {
		urls,
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

	// POST to /pdfs/merge endpoint
	const createOptions = {
		method: 'POST' as IHttpRequestMethods,
		url: PlacidConfig.getRestUrl(PlacidConfig.ENDPOINTS.PDFS_MERGE),
		headers: {
			'Accept': PlacidConfig.HTTP.HEADERS.ACCEPT,
			'Content-Type': PlacidConfig.HTTP.HEADERS.CONTENT_TYPE,
			'x-placid-integration': PlacidConfig.HTTP.HEADERS.PLACID_INTEGRATION,
		},
		body,
	};

	const createResponse = await this.helpers.httpRequestWithAuthentication.call(this, 'placidApi', createOptions);

	// If PDF merge was initiated successfully, poll for completion
	if (createResponse.id) {
		const pdfId = createResponse.id;
		const pollingConfig = PlacidConfig.getPollingConfig('PDF');
		const maxAttempts = pollingConfig.MAX_ATTEMPTS;
		const pollInterval = pollingConfig.INTERVAL_MS;
		let lastStatus = createResponse.status;

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			// Wait before polling (except for first attempt)
			if (attempt > 0) {
				await sleep(pollInterval);
			}

			// Use the shared helper function to poll status
			const pollResponse = await getPdfById(this, pdfId);
			lastStatus = pollResponse.status;

			// Check if PDF is finished or has error
			if (pollResponse.status === 'finished') {
				return {
					json: pollResponse,
					pairedItem: { item: i },
				};
			} else if (pollResponse.status === 'error') {
				const errorMsg = pollResponse.error || pollResponse.message || pollResponse.error_message || JSON.stringify(pollResponse);
				throw new NodeOperationError(this.getNode(), `PDF merge failed: ${errorMsg}`);
			}

			// Continue polling if status is still "queued" or other pending status
		}

		// If we've reached max attempts without completion
		throw new NodeOperationError(this.getNode(), `${pollingConfig.TIMEOUT_MESSAGE} after ${maxAttempts} attempts. Last status: ${lastStatus}`);
	}

	// Fallback: return the initial response if no ID was provided
	return {
		json: createResponse,
		pairedItem: { item: i },
	};
}
