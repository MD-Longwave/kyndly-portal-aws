// CORS-enabled Lambda function with S3 upload capability
const AWS = require('aws-sdk');
const Busboy = require('busboy');
const jwt_decode = require('jwt-decode');

// Configure AWS SDK
const s3 = new AWS.S3();
const ses = new AWS.SES({ region: 'us-east-2' });
const S3_BUCKET = 'kyndly-ichra-documents';

// Email notification settings
const EMAIL_FROM = 'mike@longwave.solutions'; // Verified sender email
const EMAIL_TO = ['mike@longwave.solutions']; // Verified recipient email
const EMAIL_SUBJECT = 'New Quote Submission Received';

// Check if we're in SES sandbox mode
const checkSESStatus = async () => {
  try {
    console.log('Checking SES account status...');
    const accountStatus = await ses.getAccountSendingEnabled().promise();
    console.log('SES account status:', accountStatus);
    
    // Check if the sender is verified
    const senderVerification = await ses.getIdentityVerificationAttributes({
      Identities: [EMAIL_FROM]
    }).promise();
    console.log('Sender verification status:', senderVerification);
    
    return {
      accountEnabled: accountStatus.Enabled,
      senderVerified: senderVerification.VerificationAttributes[EMAIL_FROM]?.VerificationStatus === 'Success'
    };
  } catch (error) {
    console.error('Error checking SES status:', error);
    return { accountEnabled: false, senderVerified: false };
  }
};

// Helper function to send email notification
const sendEmailNotification = async (submissionData, uploadResults) => {
  console.log('Sending email notification...');
  console.log('Submission data:', JSON.stringify(submissionData));
  console.log('Upload results:', JSON.stringify(uploadResults));
  
  // Check SES status first
  const sesStatus = await checkSESStatus();
  console.log('SES status check result:', sesStatus);
  
  if (!sesStatus.accountEnabled || !sesStatus.senderVerified) {
    console.warn('SES is not properly configured or verified. Cannot send email.');
    return null;
  }
  
  // Format the files information
  let filesHtml = '';
  if (uploadResults && Object.keys(uploadResults).length > 0) {
    filesHtml = '<h3>Uploaded Files:</h3><ul>';
    for (const [fieldName, fileInfo] of Object.entries(uploadResults)) {
      filesHtml += `<li>${fieldName}: ${fileInfo.filename} (${fileInfo.size} bytes)</li>`;
    }
    filesHtml += '</ul>';
  } else {
    filesHtml = '<p>No files were uploaded with this submission.</p>';
  }
  
  // Format the form fields information
  let fieldsHtml = '<h3>Form Fields:</h3><ul>';
  for (const [key, value] of Object.entries(submissionData)) {
    if (key !== 'files' && typeof value !== 'object') {
      fieldsHtml += `<li>${key}: ${value}</li>`;
    }
  }
  fieldsHtml += '</ul>';
  
  // Construct email body
  const emailHtml = `
    <html>
      <head>
        <title>New Quote Submission</title>
      </head>
      <body>
        <h2>New Quote Submission Received</h2>
        <p>A new quote has been submitted with the following details:</p>
        <p><strong>Submission ID:</strong> ${submissionData.submissionId}</p>
        <p><strong>Submission Date:</strong> ${submissionData.submissionDate}</p>
        <p><strong>TPA ID:</strong> ${submissionData.tpaId}</p>
        <p><strong>Employer ID:</strong> ${submissionData.employerId}</p>
        ${fieldsHtml}
        ${filesHtml}
        <p>The files have been stored in S3 with the path: submissions/${submissionData.tpaId}/${submissionData.employerId}/${submissionData.submissionId}/</p>
      </body>
    </html>
  `;
  
  // Email parameters
  const params = {
    Source: EMAIL_FROM,
    Destination: {
      ToAddresses: EMAIL_TO
    },
    Message: {
      Subject: {
        Data: `${EMAIL_SUBJECT} - ${submissionData.submissionId}`
      },
      Body: {
        Html: {
          Data: emailHtml
        }
      }
    }
  };
  
  console.log('Email parameters:', JSON.stringify(params, null, 2));
  
  try {
    console.log('Attempting to send email via SES...');
    const result = await ses.sendEmail(params).promise();
    console.log('Email notification sent successfully:', result.MessageId);
    return result.MessageId;
  } catch (error) {
    console.error('Error sending email notification:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error;
  }
};

// Helper function to parse multipart form data
const parseMultipartForm = (event) => {
  return new Promise((resolve, reject) => {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return resolve({
        fields: {},
        files: {}
      });
    }
    
    // Create busboy instance with binary handling configuration
    const busboy = Busboy({ 
      headers: {
        'content-type': contentType
      },
      defCharset: 'binary', // Force binary charset
      preservePath: true    // Preserve original file path
    });
    
    const result = {
      fields: {},
      files: {}
    };
    
    // Handle form fields
    busboy.on('field', (fieldname, value) => {
      console.log(`Parsed field ${fieldname}: ${value}`);
      result.fields[fieldname] = value;
    });
    
    // Handle file uploads with binary handling
    busboy.on('file', (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      console.log(`Processing file: ${filename} (${mimeType})`);
      console.log(`Original encoding (ignored): ${encoding}`);
      
      const chunks = [];
      let totalSize = 0;
      
      file.on('data', (data) => {
        // Always create a new Buffer from the chunk
        const chunk = Buffer.from(data);
        totalSize += chunk.length;
        chunks.push(chunk);
        console.log(`Received chunk of size: ${chunk.length} bytes, total so far: ${totalSize} bytes`);
      });
      
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        console.log(`File processing complete: ${filename}`);
        console.log(`Final size: ${buffer.length} bytes`);
        console.log(`Mime type: ${mimeType}`);
        
        result.files[fieldname] = {
          filename,
          mimeType,
          encoding: 'binary', // Force binary encoding
          content: buffer,
          size: buffer.length
        };
      });
      
      file.on('error', (error) => {
        console.error(`Error processing file ${filename}:`, error);
      });
    });
    
    // Error handling
    busboy.on('error', error => {
      reject(error);
    });
    
    // Finish event
    busboy.on('finish', () => {
      console.log('Finished parsing form data');
      resolve(result);
    });
    
    // Convert base64 body to buffer if needed
    let bodyBuffer;
    if (event.isBase64Encoded) {
      console.log('Handling base64 encoded body');
      bodyBuffer = Buffer.from(event.body, 'base64');
    } else if (event.body instanceof Buffer) {
      console.log('Body is already a Buffer');
      bodyBuffer = event.body;
    } else if (typeof event.body === 'string') {
      console.log('Converting string body to Buffer');
      bodyBuffer = Buffer.from(event.body);
    } else {
      console.error('Unexpected body type:', typeof event.body);
      throw new Error('Unexpected body type');
    }
    
    console.log('Body buffer length:', bodyBuffer.length, 'bytes');
    
    // Pass the data to busboy
    busboy.write(bodyBuffer);
    busboy.end();
  });
};

// Extract TPA ID and Employer ID from Cognito token or form data
const extractIdentifiers = (event, formData) => {
  let tpaId = 'unknown-tpa';
  let employerId = 'unknown-employer';
  
  console.log('Extracting identifiers from request...');
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  
  // Try to extract from Authorization header if available
  try {
    const authHeader = event.headers.Authorization || event.headers.authorization;
    console.log('Auth header present:', !!authHeader);
    
    if (authHeader) {
      console.log('Auth header format check:', authHeader.startsWith('Bearer '));
      
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('Token extracted, length:', token.length);
        console.log('Token first 20 chars:', token.substring(0, 20) + '...');
        
        try {
          const decodedToken = jwt_decode(token);
          console.log('Decoded token keys:', Object.keys(decodedToken));
          
          // Check for custom attributes with complete path
          if (decodedToken['custom:tpa_id']) {
            tpaId = decodedToken['custom:tpa_id'];
            console.log(`Found custom:tpa_id in token: ${tpaId}`);
          }
          
          if (decodedToken['custom:employer_id']) {
            employerId = decodedToken['custom:employer_id'];
            console.log(`Found custom:employer_id in token: ${employerId}`);
          }
          
          // Try other possible attribute names (sometimes they're mapped differently)
          if (tpaId === 'unknown-tpa') {
            const possibleTpaKeys = ['tpa_id', 'tpaId', 'TPAId', 'tpa-id'];
            for (const key of possibleTpaKeys) {
              if (decodedToken[key]) {
                tpaId = decodedToken[key];
                console.log(`Found ${key} in token: ${tpaId}`);
                break;
              }
            }
          }
          
          if (employerId === 'unknown-employer') {
            const possibleEmployerKeys = ['employer_id', 'employerId', 'EmployerId', 'employer-id'];
            for (const key of possibleEmployerKeys) {
              if (decodedToken[key]) {
                employerId = decodedToken[key];
                console.log(`Found ${key} in token: ${employerId}`);
                break;
              }
            }
          }
          
          // Dump the full token data for inspection (redact some sensitive data)
          const sensitiveKeys = ['email', 'phone_number', 'sub'];
          const sanitizedToken = {};
          for (const [key, value] of Object.entries(decodedToken)) {
            if (sensitiveKeys.includes(key)) {
              sanitizedToken[key] = '[REDACTED]';
            } else {
              sanitizedToken[key] = value;
            }
          }
          console.log('Sanitized token data:', JSON.stringify(sanitizedToken, null, 2));
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
        }
      }
    }
  } catch (error) {
    console.warn('Error extracting identifiers from token:', error.message);
  }
  
  // Check form data last (allows override for testing)
  if (formData && formData.fields) {
    console.log('Form data fields:', JSON.stringify(formData.fields, null, 2));
    if (formData.fields.tpa_id) {
      tpaId = formData.fields.tpa_id;
      console.log(`Found tpa_id in form data: ${tpaId}`);
    }
    if (formData.fields.employer_id) {
      employerId = formData.fields.employer_id;
      console.log(`Found employer_id in form data: ${employerId}`);
    }
  }
  
  console.log(`Final identifiers - TPA ID: ${tpaId}, Employer ID: ${employerId}`);
  return { tpaId, employerId };
};

// Helper function to upload a file to S3 with the new partitioning strategy
const uploadToS3 = async (file, submissionData) => {
  if (!file || !file.content) {
    console.log('No file content to upload');
    return null;
  }
  
  // Extract TPA ID and Employer ID from submission data
  const tpaId = submissionData.tpaId;
  const employerId = submissionData.employerId;
  const submissionId = submissionData.submissionId;
  
  // Construct the S3 key with the proper partitioning strategy
  const key = `submissions/${tpaId}/${employerId}/${submissionId}/${file.filename}`;
  console.log(`Preparing to upload file to S3:`);
  console.log(`- Key: ${key}`);
  console.log(`- Content Type: ${file.mimeType}`);
  console.log(`- Size: ${file.size} bytes`);
  
  // Ensure we're working with a Buffer for binary data
  const fileContent = Buffer.from(file.content);
  
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: fileContent,
    ContentType: file.mimeType || 'application/octet-stream',
    ContentLength: fileContent.length,
    Metadata: {
      'original-filename': file.filename,
      'content-type': file.mimeType,
      'file-size': String(fileContent.length)
    }
  };
  
  try {
    console.log('Starting S3 upload with params:', JSON.stringify({
      ...params,
      Body: `<Binary data of length ${fileContent.length}>`
    }, null, 2));
    
    const result = await s3.upload(params).promise();
    console.log('S3 upload successful:', result.Location);
    
    // Verify the upload
    try {
      const headResult = await s3.headObject({
        Bucket: S3_BUCKET,
        Key: key
      }).promise();
      
      console.log('Upload verification:', {
        size: headResult.ContentLength,
        type: headResult.ContentType,
        metadata: headResult.Metadata
      });
      
      if (headResult.ContentLength !== fileContent.length) {
        console.warn('Warning: Uploaded file size mismatch!', {
          expected: fileContent.length,
          actual: headResult.ContentLength
        });
      }
    } catch (verifyError) {
      console.error('Error verifying upload:', verifyError);
    }
    
    return result.Location;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

exports.handler = async (event) => {
    // API Key for authentication
    const API_KEY = 'EOpsK0PFHivt1qB5pbGH1GHRPKzFeG27ooU4KX8f';
    
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': 'https://clean-main.dw8hkdzhqger0.amplifyapp.com',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Credentials': 'true'  // Added for handling credentials
    };
    
    console.log('Event:', JSON.stringify({
        httpMethod: event.httpMethod,
        path: event.path,
        headers: event.headers,
        queryStringParameters: event.queryStringParameters
    }, null, 2));
    
    // Handle OPTIONS request (preflight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight successful' })
        };
    }

    // Check for API key
    const requestApiKey = event.headers['x-api-key'] || event.headers['X-Api-Key'];
    
    if (requestApiKey !== API_KEY) {
        return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ message: 'Invalid API key' })
        };
    }

    // For GET requests to health endpoint
    if (event.httpMethod === 'GET' && event.path === '/health') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ status: 'ok', message: 'Service is healthy' })
        };
    }
    
    // Handle quote submissions
    if (event.httpMethod === 'POST' && event.path === '/quotes') {
        try {
            console.log('Processing quote submission...');
            
            // Check content type
            const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
            
            // Process based on content type
            if (contentType.includes('multipart/form-data')) {
                // Parse multipart form data
                const formData = await parseMultipartForm(event);
                console.log('Form fields:', Object.keys(formData.fields));
                console.log('Form files:', Object.keys(formData.files));
                
                // Generate a unique ID for this submission
                const submissionId = `submission-${Date.now()}`;
                
                // Extract TPA ID and Employer ID from Cognito token or form data
                const { tpaId, employerId } = extractIdentifiers(event, formData);
                
                // Create a submission data object with the necessary IDs
                const submissionData = {
                    ...formData.fields,
                    submissionId,
                    submissionDate: new Date().toISOString(),
                    tpaId,
                    employerId
                };
                
                // Upload files to S3
                const uploadResults = {};
                for (const [fieldName, file] of Object.entries(formData.files)) {
                    try {
                        const fileUrl = await uploadToS3(file, submissionData);
                        uploadResults[fieldName] = {
                            filename: file.filename,
                            url: fileUrl,
                            size: file.size
                        };
                    } catch (uploadError) {
                        console.error(`Error uploading ${fieldName}:`, uploadError);
                        uploadResults[fieldName] = {
                            filename: file.filename,
                            error: uploadError.message
                        };
                    }
                }
                
                // Store form fields in S3 as a JSON metadata file
                try {
                    const formMetadata = {
                        ...submissionData,
                        files: uploadResults
                    };
                    
                    await uploadToS3({
                        filename: 'submission-data.json',
                        content: Buffer.from(JSON.stringify(formMetadata, null, 2)),
                        mimeType: 'application/json'
                    }, submissionData);
                } catch (metadataError) {
                    console.error('Error storing form metadata:', metadataError);
                }
                
                // Send email notification
                let emailResult = null;
                try {
                    emailResult = await sendEmailNotification(submissionData, uploadResults);
                    console.log('Email notification sent successfully:', emailResult);
                } catch (emailError) {
                    console.error('Error sending email notification:', emailError);
                }
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Quote submitted successfully',
                        quoteId: submissionId,
                        uploadResults,
                        emailSent: !!emailResult,
                        identifiers: {
                            tpaId,
                            employerId
                        }
                    })
                };
            } else {
                // For non-multipart requests, also try to send notification
                // Generate a unique ID for this submission
                const submissionId = `QUOTE-${Date.now()}`;
                
                // Try to extract identifiers, even from JSON requests
                let parsedBody = {};
                if (event.body && typeof event.body === 'string') {
                    try {
                        parsedBody = JSON.parse(event.body);
                    } catch (e) {
                        console.warn('Could not parse request body as JSON');
                    }
                }
                
                // Create form data structure for the extractor
                const formData = {
                    fields: parsedBody
                };
                
                // Extract TPA ID and Employer ID
                const { tpaId, employerId } = extractIdentifiers(event, formData);
                
                // Create submission data
                const submissionData = {
                    ...parsedBody,
                    submissionId,
                    submissionDate: new Date().toISOString(),
                    tpaId,
                    employerId
                };
                
                // Try to send email notification for JSON submissions too
                let emailResult = null;
                try {
                    emailResult = await sendEmailNotification(submissionData, {});
                    console.log('Email notification for JSON submission sent successfully:', emailResult);
                } catch (emailError) {
                    console.error('Error sending email notification for JSON submission:', emailError);
                }
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ 
                        success: true, 
                        message: 'Quote submitted successfully',
                        quoteId: submissionId,
                        note: 'Files can only be uploaded using multipart/form-data',
                        emailSent: !!emailResult,
                        identifiers: {
                            tpaId,
                            employerId
                        }
                    })
                };
            }
        } catch (error) {
            console.error('Error processing quote submission:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    message: 'Error processing quote submission', 
                    error: error.message 
                })
            };
        }
    }
    
    // Default response for other paths
    return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Not found' })
    };
}; 