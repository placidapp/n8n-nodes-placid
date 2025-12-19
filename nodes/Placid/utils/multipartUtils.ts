/**
 * Multipart form-data utilities for file uploads
 * Builds multipart/form-data body without external dependencies
 */

export interface MultipartFile {
	key: string;
	buffer: Buffer;
	filename: string;
	contentType: string;
}

export interface MultipartBody {
	body: Buffer;
	boundary: string;
}

/**
 * Builds a multipart/form-data body from files without external dependencies
 */
export function buildMultipartBody(files: MultipartFile[]): MultipartBody {
	const boundary = '----n8nPlacidBoundary' + Date.now().toString(36) + Math.random().toString(36).slice(2);
	const parts: Buffer[] = [];

	for (const file of files) {
		const header =
			`--${boundary}\r\n` +
			`Content-Disposition: form-data; name="${file.key}"; filename="${file.filename}"\r\n` +
			`Content-Type: ${file.contentType}\r\n\r\n`;

		parts.push(Buffer.from(header, 'utf-8'));
		parts.push(file.buffer);
		parts.push(Buffer.from('\r\n', 'utf-8'));
	}

	parts.push(Buffer.from(`--${boundary}--\r\n`, 'utf-8'));

	return {
		body: Buffer.concat(parts),
		boundary,
	};
}
