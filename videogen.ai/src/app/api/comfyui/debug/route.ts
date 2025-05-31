import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Create a simple HTML page with diagnostic tools
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ComfyUI Integration Debug</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      border-bottom: 1px solid #eee;
      padding-bottom: 10px;
    }
    .card {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 20px;
      margin-bottom: 20px;
      background-color: #f9f9f9;
    }
    .success {
      color: #155724;
      background-color: #d4edda;
      border-color: #c3e6cb;
    }
    .error {
      color: #721c24;
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }
    .warning {
      color: #856404;
      background-color: #fff3cd;
      border-color: #ffeeba;
    }
    .info {
      color: #0c5460;
      background-color: #d1ecf1;
      border-color: #bee5eb;
    }
    button {
      background-color: #4CAF50;
      border: none;
      color: white;
      padding: 10px 20px;
      text-align: center;
      text-decoration: none;
      display: inline-block;
      font-size: 16px;
      margin: 4px 2px;
      cursor: pointer;
      border-radius: 4px;
    }
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    pre {
      background-color: #f5f5f5;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
    .loader {
      border: 5px solid #f3f3f3;
      border-top: 5px solid #3498db;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 2s linear infinite;
      display: inline-block;
      margin-right: 10px;
      vertical-align: middle;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <h1>ComfyUI Integration Debug</h1>
  
  <div class="card">
    <h2>1. Check ComfyUI Connection</h2>
    <p>This will test if the ComfyUI service is running and accessible.</p>
    <button id="testConnectionBtn">Test Connection</button>
    <div id="connectionResult"></div>
  </div>

  <div class="card">
    <h2>2. View Environment Configuration</h2>
    <p>This shows the current environment configuration for the ComfyUI integration.</p>
    <button id="checkEnvBtn">Check Environment</button>
    <div id="envResult"></div>
  </div>

  <div class="card">
    <h2>3. Test Job Creation</h2>
    <p>This will create a test job without sending any files to ComfyUI.</p>
    <button id="testJobBtn">Create Test Job</button>
    <div id="jobResult"></div>
  </div>

  <div class="card">
    <h2>4. View Recent Jobs</h2>
    <p>This will show the most recent jobs in the job store.</p>
    <button id="viewJobsBtn">View Recent Jobs</button>
    <div id="jobsResult"></div>
  </div>

  <script>
    // Test Connection
    document.getElementById('testConnectionBtn').addEventListener('click', async function() {
      this.disabled = true;
      const resultDiv = document.getElementById('connectionResult');
      resultDiv.innerHTML = '<div class="loader"></div> Testing connection...';
      
      try {
        const response = await fetch('/api/comfyui/test');
        const data = await response.json();
        
        if (response.ok) {
          resultDiv.innerHTML = \`
            <div class="\${data.status === 'success' ? 'card success' : 'card error'}">
              <h3>\${data.message}</h3>
              <p>API URL: \${data.apiUrl}</p>
              <pre>\${JSON.stringify(data, null, 2)}</pre>
            </div>
          \`;
        } else {
          resultDiv.innerHTML = \`
            <div class="card error">
              <h3>Error: \${response.status} \${response.statusText}</h3>
              <pre>\${JSON.stringify(data, null, 2)}</pre>
            </div>
          \`;
        }
      } catch (error) {
        resultDiv.innerHTML = \`
          <div class="card error">
            <h3>Connection Error</h3>
            <p>\${error.message}</p>
          </div>
        \`;
      } finally {
        this.disabled = false;
      }
    });

    // Check Environment
    document.getElementById('checkEnvBtn').addEventListener('click', async function() {
      this.disabled = true;
      const resultDiv = document.getElementById('envResult');
      resultDiv.innerHTML = '<div class="loader"></div> Checking environment...';
      
      try {
        const response = await fetch('/api/comfyui/debug/env');
        const data = await response.json();
        
        if (response.ok) {
          resultDiv.innerHTML = \`
            <div class="card info">
              <h3>Environment Configuration</h3>
              <pre>\${JSON.stringify(data, null, 2)}</pre>
            </div>
          \`;
        } else {
          resultDiv.innerHTML = \`
            <div class="card error">
              <h3>Error: \${response.status} \${response.statusText}</h3>
              <pre>\${JSON.stringify(data, null, 2)}</pre>
            </div>
          \`;
        }
      } catch (error) {
        resultDiv.innerHTML = \`
          <div class="card error">
            <h3>Error</h3>
            <p>\${error.message}</p>
          </div>
        \`;
      } finally {
        this.disabled = false;
      }
    });

    // Test Job Creation
    document.getElementById('testJobBtn').addEventListener('click', async function() {
      this.disabled = true;
      const resultDiv = document.getElementById('jobResult');
      resultDiv.innerHTML = '<div class="loader"></div> Creating test job...';
      
      try {
        const response = await fetch('/api/comfyui/debug/job');
        const data = await response.json();
        
        if (response.ok) {
          resultDiv.innerHTML = \`
            <div class="card success">
              <h3>Test Job Created</h3>
              <p>Job ID: \${data.jobId}</p>
              <pre>\${JSON.stringify(data, null, 2)}</pre>
            </div>
          \`;
        } else {
          resultDiv.innerHTML = \`
            <div class="card error">
              <h3>Error: \${response.status} \${response.statusText}</h3>
              <pre>\${JSON.stringify(data, null, 2)}</pre>
            </div>
          \`;
        }
      } catch (error) {
        resultDiv.innerHTML = \`
          <div class="card error">
            <h3>Error</h3>
            <p>\${error.message}</p>
          </div>
        \`;
      } finally {
        this.disabled = false;
      }
    });

    // View Recent Jobs
    document.getElementById('viewJobsBtn').addEventListener('click', async function() {
      this.disabled = true;
      const resultDiv = document.getElementById('jobsResult');
      resultDiv.innerHTML = '<div class="loader"></div> Fetching recent jobs...';
      
      try {
        const response = await fetch('/api/comfyui/debug/jobs');
        const data = await response.json();
        
        if (response.ok) {
          resultDiv.innerHTML = \`
            <div class="card info">
              <h3>Recent Jobs</h3>
              <pre>\${JSON.stringify(data, null, 2)}</pre>
            </div>
          \`;
        } else {
          resultDiv.innerHTML = \`
            <div class="card error">
              <h3>Error: \${response.status} \${response.statusText}</h3>
              <pre>\${JSON.stringify(data, null, 2)}</pre>
            </div>
          \`;
        }
      } catch (error) {
        resultDiv.innerHTML = \`
          <div class="card error">
            <h3>Error</h3>
            <p>\${error.message}</p>
          </div>
        \`;
      } finally {
        this.disabled = false;
      }
    });
  </script>
</body>
</html>
  `;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
