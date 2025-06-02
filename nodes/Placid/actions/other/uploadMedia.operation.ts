import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData> {
	const files = this.getNodeParameter('files.fileItems', index, []) as Array<{
		file: string;
		fileName?: string;
		fileKey?: string;
	}>;

	const additionalFields = this.getNodeParameter('additionalFields', index, {}) as {
		returnFullResponse?: boolean;
	};

	if (!files || files.length === 0) {
		throw new NodeOperationError(this.getNode(), 'At least one file must be specified');
	}

	if (files.length > 5) {
		throw new NodeOperationError(this.getNode(), 'Maximum of 5 files can be uploaded at once');
	}

	// Get input data to access binary files
	const items = this.getInputData();
	const item = items[index];

	if (!item.binary) {
		throw new NodeOperationError(this.getNode(), 'No binary data found in input');
	}

	// Prepare form data for multipart upload
	const formData: { [key: string]: any } = {};

	for (let i = 0; i < files.length; i++) {
		const fileConfig = files[i];
		const fieldName = fileConfig.file;

		if (!fieldName) {
			throw new NodeOperationError(this.getNode(), `File field name is required for file ${i + 1}`);
		}

		const binaryData = item.binary[fieldName];
		if (!binaryData) {
			throw new NodeOperationError(this.getNode(), `No binary data found for field "${fieldName}"`);
		}

		// Determine the file key for the upload
		const fileKey = fileConfig.fileKey || `file${i === 0 ? '' : i + 1}`;

		// Get file buffer
		const fileBuffer = await this.helpers.getBinaryDataBuffer(index, fieldName);

		// Determine filename
		let fileName = fileConfig.fileName;
		if (!fileName && binaryData.fileName) {
			fileName = binaryData.fileName;
		}
		if (!fileName) {
			// Generate a default filename based on mime type
			const extension = binaryData.mimeType?.split('/')[1] || 'bin';
			fileName = `file${i + 1}.${extension}`;
		}

		// Add to form data
		formData[fileKey] = {
			value: fileBuffer,
			options: {
				filename: fileName,
				contentType: binaryData.mimeType || 'application/octet-stream',
			},
		};
	}

	try {
		// Make the API request
		const response = await this.helpers.requestWithAuthentication.call(
			this,
			'placidApi',
			{
				method: 'POST',
				url: 'https://api.placid.app/api/rest/media',
				formData,
				json: false, // Important: don't parse as JSON since we're sending multipart
			},
		);

		// Parse the response
		let responseData;
		try {
			responseData = typeof response === 'string' ? JSON.parse(response) : response;
		} catch (error) {
			throw new NodeOperationError(this.getNode(), `Failed to parse API response: ${error.message}`);
		}

		// Check if the response contains media data
		if (!responseData.media || !Array.isArray(responseData.media)) {
			throw new NodeOperationError(this.getNode(), 'Invalid response format from Placid API');
		}

		// Return the appropriate response based on user preference
		if (additionalFields.returnFullResponse) {
			return {
				json: responseData,
				pairedItem: { item: index },
			};
		} else {
			// Return simplified response with just the media URLs
			const mediaUrls = responseData.media.map((media: any) => ({
				file_key: media.file_key,
				file_id: media.file_id,
			}));

			return {
				json: {
					success: true,
					uploaded_files: mediaUrls.length,
					media: mediaUrls,
				},
				pairedItem: { item: index },
			};
		}
	} catch (error) {
		if (error.response) {
			const statusCode = error.response.status;
			const errorMessage = error.response.data?.message || error.response.data || error.message;
			throw new NodeOperationError(
				this.getNode(),
				`Placid API error (${statusCode}): ${errorMessage}`,
			);
		}
		throw new NodeOperationError(this.getNode(), `Upload failed: ${error.message}`);
	}
} 