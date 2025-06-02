# Layer Properties with Resource Restrictions

This directory contains all layer property definitions for Placid API integration, with support for resource-specific property filtering.

## Features

- **Resource Restrictions**: Each property can specify which resource types (image, pdf, video) it's available for
- **Automatic Filtering**: Utility functions to filter properties based on current resource context
- **Type Safety**: Full TypeScript interfaces for all property types

## Usage Examples

### Basic Property Retrieval

```typescript
import { getPropertiesForLayerType, LayerType } from './layerProperties';

// Get all text properties (no filtering)
const allTextProperties = getPropertiesForLayerType(LayerType.TEXT);

// Get text properties available for video resources only
const videoTextProperties = getPropertiesForLayerType(LayerType.TEXT, 'video');
```

### Resource-Specific Filtering

```typescript
import { 
  getPropertiesForLayerType, 
  getGeneralProperties,
  getAllPropertiesForLayerType,
  filterPropertiesByResource 
} from './layerProperties';

// Get picture properties for video resources (includes video URL)
const videoPictureProps = getPropertiesForLayerType('picture', 'video');
// Result includes: Image URL, Image Viewport, Video URL

// Get picture properties for image resources (excludes video URL)
const imagePictureProps = getPropertiesForLayerType('picture', 'image');
// Result includes: Image URL, Image Viewport (no Video URL)

// Get general properties for PDF resources (includes link_target)
const pdfGeneralProps = getGeneralProperties('pdf');
// Result includes all general properties including link_target

// Get general properties for image resources (excludes link_target)
const imageGeneralProps = getGeneralProperties('image');
// Result excludes link_target (PDF-only)
```

### Complete Layer Configuration

```typescript
// Get all properties (layer-specific + general) for a layer type and resource
const allVideoTextProps = getAllPropertiesForLayerType('text', 'video');
// Result includes: text properties + general properties available for video
```

## Property Restrictions

### Current Restrictions

- **Video URL** (`video`): Only available for `video` resources
- **Link Target** (`link_target`): Only available for `pdf` resources  
- **SRT File URL** (`srt`): Only available for `video` resources (subtitle layers)

### Adding New Restrictions

To restrict a property to specific resources, update the `restrictedTo` array:

```typescript
{
  name: 'Property Name',
  value: 'property_value',
  description: 'Property description',
  restrictedTo: ['video'], // Only show for video resources
}

// For all resources (default):
restrictedTo: [], // Empty array = available everywhere
```

## Resource Types

- `image` - Image generation
- `pdf` - PDF generation  
- `video` - Video generation

## Files Structure

- `generalProperties.ts` - Properties available on all layer types
- `textProperties.ts` - Text layer specific properties
- `pictureProperties.ts` - Picture layer specific properties
- `shapeProperties.ts` - Shape/Rectangle layer properties
- `browserframeProperties.ts` - Browserframe layer properties
- `barcodeProperties.ts` - Barcode layer properties
- `ratingProperties.ts` - Rating layer properties
- `subtitleProperties.ts` - Subtitle layer properties (video-only)
- `index.ts` - Main exports and utility functions 