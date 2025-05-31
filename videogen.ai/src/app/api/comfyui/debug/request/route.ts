import { NextRequest, NextResponse } from 'next/server';

// This endpoint is for debugging the request format
export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    
    // Create an object to hold the form data for inspection
    const formDataObj: Record<string, any> = {};
    
    // Process each form data entry
    for (const key of formData.keys()) {
      const value = formData.get(key);
      
      if (value instanceof File) {
        formDataObj[key] = {
          type: 'File',
          name: value.name,
          size: value.size,
          contentType: value.type
        };
      } else {
        // For non-file values, try to parse as JSON if it looks like JSON
        if (typeof value === 'string' && 
            ((value.startsWith('{') && value.endsWith('}')) || 
             (value.startsWith('"') && value.endsWith('"')))) {
          try {
            formDataObj[key] = {
              type: 'JSON',
              rawValue: value,
              parsedValue: JSON.parse(value)
            };
          } catch (e) {
            formDataObj[key] = {
              type: 'String (invalid JSON)',
              value
            };
          }
        } else {
          formDataObj[key] = {
            type: 'String',
            value
          };
        }
      }
    }
    
    // Create a new FormData object with the correct format for ComfyUI
    const comfyFormData = new FormData();
    
    // Process each form data entry to match the ComfyUI API spec
    for (const key of formData.keys()) {
      const value = formData.get(key);
      
      if (value instanceof File) {
        // Files are passed as-is
        comfyFormData.append(key, value);
      } else if (typeof value === 'string') {
        // All string values are passed as-is
        comfyFormData.append(key, value);
      }
    }
    
    // Create an object to hold the corrected form data for inspection
    const correctedFormDataObj: Record<string, any> = {};
    
    // Process each corrected form data entry
    for (const key of comfyFormData.keys()) {
      const value = comfyFormData.get(key);
      
      if (value instanceof File) {
        correctedFormDataObj[key] = {
          type: 'File',
          name: value.name,
          size: value.size,
          contentType: value.type
        };
      } else {
        // For non-file values, try to parse as JSON if it looks like JSON
        if (typeof value === 'string' && 
            ((value.startsWith('{') && value.endsWith('}')) || 
             (value.startsWith('"') && value.endsWith('"')))) {
          try {
            correctedFormDataObj[key] = {
              type: 'JSON',
              rawValue: value,
              parsedValue: JSON.parse(value)
            };
          } catch (e) {
            correctedFormDataObj[key] = {
              type: 'String (invalid JSON)',
              value
            };
          }
        } else {
          correctedFormDataObj[key] = {
            type: 'String',
            value
          };
        }
      }
    }
    
    // Return the form data for inspection
    return NextResponse.json({
      originalFormData: formDataObj,
      correctedFormData: correctedFormDataObj,
      message: 'This is a debug endpoint to inspect the request format'
    });
  } catch (error) {
    console.error('Error in debug request endpoint:', error);
    return NextResponse.json({ 
      error: 'Error processing request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
