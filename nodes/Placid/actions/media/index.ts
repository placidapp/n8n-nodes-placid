import { INodeProperties } from 'n8n-workflow';

export const otherOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['other'],
			},
		},
		options: [
			{
				name: 'Upload Media',
				value: 'uploadMedia',
				description: 'Upload media files to Placid storage for use in templates',
				action: 'Upload media files',
			},
		],
		default: 'uploadMedia',
	},
];

export const otherFields: INodeProperties[] = [
	// ===== UPLOAD MEDIA OPERATION FIELDS =====
	{
		displayName: 'Files',
		name: 'files',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			sortable: true,
		},
		default: { fileItems: [{ file: '', fileName: '' }] },
		required: true,
		description: 'Files to upload (up to 5 files, max 2MB each)',
		displayOptions: {
			show: {
				resource: ['other'],
				operation: ['uploadMedia'],
			},
		},
		options: [
			{
				name: 'fileItems',
				displayName: 'File',
				values: [
					{
						displayName: 'Input Data Field Name',
						name: 'file',
						type: 'string',
						default: '',
						required: true,
						placeholder: 'data',
						description: 'Name of the input field containing the file data (e.g., "data" for binary data)',
						hint: 'The field name from the input data that contains the binary file data',
					},
					{
						displayName: 'File Name',
						name: 'fileName',
						type: 'string',
						default: '',
						placeholder: 'image.jpg',
						description: 'Custom name for the uploaded file (optional). If not provided, will use the original filename.',
					},
					{
						displayName: 'File Key',
						name: 'fileKey',
						type: 'string',
						default: '',
						placeholder: 'file1',
						description: 'Custom key name for this file in the upload request (optional). If not provided, will use "file" + index.',
					},
				],
			},
		],
	},

	// ===== ADDITIONAL OPTIONS =====
	{
		displayName: 'Additional Options',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['other'],
				operation: ['uploadMedia'],
			},
		},
		options: [
			{
				displayName: 'Return Full Response',
				name: 'returnFullResponse',
				type: 'boolean',
				default: false,
				description: 'Whether to return the full API response or just the media URLs',
			},
		],
	},
]; 