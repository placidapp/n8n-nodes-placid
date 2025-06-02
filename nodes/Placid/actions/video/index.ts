import { INodeProperties } from 'n8n-workflow';
import { createNestedLayerFields } from '../../utils/layerUtils';

export const videoOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['video'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Generate a new video from a template',
				action: 'Create a video from a template',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve an existing video by ID',
				action: 'Get a video by ID',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an existing video by ID',
				action: 'Delete a video by ID',
			},
		],
		default: 'create',
	},
];

export const videoFields: INodeProperties[] = [
	// ===== MULTI-CLIP CONFIGURATION =====
	{
		displayName: 'Configuration Mode',
		name: 'configurationMode',
		type: 'options',
		options: [
			{
				name: 'Simple',
				value: 'simple',
				description: 'Use form fields to configure clips and layers',
			},
			{
				name: 'Advanced',
				value: 'advanced',
				description: 'Define clips and layers using JSON',
			},
		],
		default: 'simple',
		description: 'Choose how you want to configure the video clips and layers',
		displayOptions: {
			show: {
				resource: ['video'],
				operation: ['create'],
			},
		},
	},

	// ===== SIMPLE MODE: MULTI-CLIP CONFIGURATION =====
	{
		displayName: 'Clips',
		name: 'clips',
		type: 'fixedCollection',
		default: { clipItems: [] },
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['video'],
				operation: ['create'],
				configurationMode: ['simple'],
			},
		},
		options: [
			{
				name: 'clipItems',
				displayName: 'Add Clip',
				values: [
					{
						displayName: 'Template',
						name: 'template_id',
						type: 'resourceLocator',
						default: { mode: 'list', value: '' },
						required: true,
						description: 'Select the Placid template to use for this clip',
						modes: [
							{
								displayName: 'From List',
								name: 'list',
								type: 'list',
								typeOptions: {
									searchListMethod: 'getTemplates',
									searchable: true,
								},
							},
							{
								displayName: 'By ID',
								name: 'id',
								type: 'string',
								hint: 'Enter the template UUID directly',
								placeholder: 'e.g., gpsm5pn5n4tpz',
								extractValue: {
									type: 'regex',
									regex: '^(.*)$',
								},
							},
						],
					},
					{
						displayName: 'Audio Settings',
						name: 'audioSettings',
						type: 'collection',
						placeholder: 'Add Audio Setting',
						default: {},
						options: [
							{
								displayName: 'Audio URL',
								name: 'audio',
								type: 'string',
								default: '',
								placeholder: 'https://example.com/audio.mp3',
								description: 'URL of MP3 audio file for this clip',
							},
							{
								displayName: 'Audio Duration',
								name: 'audio_duration',
								type: 'options',
								options: [
									{
										name: 'Auto (Trim to Video Length)',
										value: 'auto',
									},
									{
										name: 'Full (Include Whole Audio Track)',
										value: 'full',
									},
								],
								default: 'full',
								description: 'How to handle audio duration',
							},
							{
								displayName: 'Audio Trim Start',
								name: 'audio_trim_start',
								type: 'string',
								default: '',
								placeholder: '00:00:45 or 00:00:45.25',
								description: 'Timestamp of the trim start point (format: HH:MM:SS or HH:MM:SS.MS)',
							},
							{
								displayName: 'Audio Trim End',
								name: 'audio_trim_end',
								type: 'string',
								default: '',
								placeholder: '00:00:55 or 00:00:55.25',
								description: 'Timestamp of the trim end point (format: HH:MM:SS or HH:MM:SS.MS)',
							},
						],
					},
					// ===== UNIFIED LAYER CONFIGURATION FOR CLIPS =====
					...createNestedLayerFields('video'),
				],
			},
		],
	},

	// ===== ADVANCED MODE: JSON CONFIGURATION =====
	{
		displayName: 'Clips (JSON)',
		name: 'clipsJson',
		type: 'json',
		default: '[]',
		description: 'Define all clips as a JSON array. Each clip should have a template_uuid and layers object. Example: [{"template_uuid": "abc123", "layers": {"title": {"text": "Clip 1"}, "video": {"video": "https://example.com/video.mp4"}}}]',
		displayOptions: {
			show: {
				resource: ['video'],
				operation: ['create'],
				configurationMode: ['advanced'],
			},
		},
		typeOptions: {
			rows: 15,
		},
	},

	// ===== OPTIONAL SETTINGS =====
	{
		displayName: 'Additional Options',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['video'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Webhook Success URL',
				name: 'webhook_success',
				type: 'string',
				default: '',
				placeholder: 'https://your-webhook.url',
				description: 'Webhook URL to receive the video when generation is complete',
			},
			{
				displayName: 'Passthrough Data',
				name: 'passthrough',
				type: 'string',
				default: '',
				placeholder: 'Any custom data (max 1024 characters)',
				description: 'Custom data that will be included in webhook responses and requests for this video',
			},
		],
	},

	// ===== GET OPERATION FIELDS =====
	{
		displayName: 'Video ID',
		name: 'videoId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g., 12345',
		description: 'The unique ID of the video to retrieve',
		displayOptions: {
			show: {
				resource: ['video'],
				operation: ['get'],
			},
		},
	},

	// ===== DELETE OPERATION FIELDS =====
	{
		displayName: 'Video ID',
		name: 'videoId',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g., 12345',
		description: 'The unique ID of the video to delete',
		displayOptions: {
			show: {
				resource: ['video'],
				operation: ['delete'],
			},
		},
	},
]; 