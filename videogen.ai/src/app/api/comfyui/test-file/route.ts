import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// This endpoint checks for a test.jpg file in the output directory and serves it
export async function GET(request: NextRequest) {
  try {
    // Define the output directory and test file path
    const outputDir = 'D:\\AI_OUTPUT';
    const testFilePath = path.join(outputDir, 'test.jpg');
    
    console.log(`[TestFile] Checking for file at: ${testFilePath}`);
    
    // Check if the file exists
    try {
      await fs.promises.access(testFilePath, fs.constants.F_OK);
      console.log(`[TestFile] File found: ${testFilePath}`);
      
      // Read the file
      const fileBuffer = await fs.promises.readFile(testFilePath);
      console.log(`[TestFile] File read successfully, size: ${fileBuffer.length} bytes`);
      
      // Create a blob from the file buffer
      const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
      
      // Return the file
      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Disposition': 'inline; filename="test.jpg"',
        },
      });
    } catch (error) {
      console.log(`[TestFile] File not found: ${testFilePath}`);
      
      // List all files in the directory to help with debugging
      try {
        const files = await fs.promises.readdir(outputDir);
        console.log(`[TestFile] Files in ${outputDir}:`, files);
        
        return NextResponse.json({
          error: 'Test file not found',
          directory: outputDir,
          filesInDirectory: files
        }, { status: 404 });
      } catch (dirError) {
        console.error(`[TestFile] Error reading directory ${outputDir}:`, dirError);
        return NextResponse.json({
          error: 'Test file not found and could not list directory',
          directory: outputDir,
          directoryError: dirError instanceof Error ? dirError.message : 'Unknown error'
        }, { status: 404 });
      }
    }
  } catch (error) {
    console.error('[TestFile] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// This endpoint allows uploading a test.jpg file to the output directory
export async function POST(request: NextRequest) {
  try {
    // Define the output directory and test file path
    const outputDir = 'D:\\AI_OUTPUT';
    const testFilePath = path.join(outputDir, 'test.jpg');
    
    // Ensure the directory exists
    try {
      await fs.promises.access(outputDir, fs.constants.F_OK);
    } catch (error) {
      console.log(`[TestFile] Creating directory: ${outputDir}`);
      await fs.promises.mkdir(outputDir, { recursive: true });
    }
    
    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({
        error: 'No file provided or invalid file'
      }, { status: 400 });
    }
    
    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write the file
    await fs.promises.writeFile(testFilePath, buffer);
    console.log(`[TestFile] File written successfully: ${testFilePath}`);
    
    return NextResponse.json({
      message: 'File uploaded successfully',
      path: testFilePath
    });
  } catch (error) {
    console.error('[TestFile] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
