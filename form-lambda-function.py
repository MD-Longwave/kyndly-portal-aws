import boto3
import base64
import json
import os
from datetime import datetime
from jwt import decode as jwt_decode
from requests_toolbelt.multipart import decoder

s3 = boto3.client('s3')
ses = boto3.client('ses', region_name='us-east-2')

S3_BUCKET = 'kyndly-ichra-documents'
EMAIL_FROM = 'mike@longwave.solutions'
EMAIL_TO = ['mike@longwave.solutions']
EMAIL_SUBJECT = 'New Quote Submission Received'
API_KEY = os.environ.get('API_KEY', 'EOpsK0PFHivt1qB5pbGH1GHRPKzFeG27ooU4KX8f')

def check_ses_status():
    try:
        status = ses.get_account_sending_enabled()
        verify = ses.get_identity_verification_attributes(Identities=[EMAIL_FROM])
        return status['Enabled'] and verify['VerificationAttributes'][EMAIL_FROM]['VerificationStatus'] == 'Success'
    except Exception as e:
        print(f'SES Check Error: {e}')
        return False

def send_email(data, files): 
    if not check_ses_status():
        return None

    fields_html = ''.join(f"<li>{k}: {v}</li>" for k, v in data.items() if isinstance(v, str))
    files_html = (
        '<ul>' + ''.join(f"<li>{f['filename']} ({f['size']} bytes)</li>" for f in files.values()) + '</ul>'
        if files else '<p>No files uploaded.</p>'
    )

    body = f"""
    <html><body>
    <h2>{EMAIL_SUBJECT}</h2>
    <p><strong>Submission ID:</strong> {data['submissionId']}</p>
    <p><strong>Submission Date:</strong> {data['submissionDate']}</p>
    <p><strong>TPA ID:</strong> {data['tpaId']}</p>
    <p><strong>Broker ID:</strong> {data['brokerId']}</p>
    <p><strong>Employer ID:</strong> {data['employerId']}</p>
    <h3>Fields</h3><ul>{fields_html}</ul>
    <h3>Files</h3>{files_html}
    </body></html>"""

    ses.send_email(
        Source=EMAIL_FROM,
        Destination={'ToAddresses': EMAIL_TO},
        Message={
            'Subject': {'Data': f"{EMAIL_SUBJECT} - {data['submissionId']}"},
            'Body': {'Html': {'Data': body}}
        }
    )

def extract_tpa_id_from_token(headers):
    """Extract ONLY TPA ID from the authentication token"""
    auth = headers.get('authorization') or headers.get('Authorization')
    tpa_id = 'unknown-tpa'
    
    if auth and auth.startswith('Bearer '):
        try:
            token = auth.split(' ')[1]
            decoded = jwt_decode(token, options={'verify_signature': False})
            print(f"Decoded token keys: {list(decoded.keys())}")
            
            # Check for custom attributes with complete path
            if 'custom:tpa_id' in decoded:
                tpa_id = decoded['custom:tpa_id']
                print(f"Found custom:tpa_id in token: {tpa_id}")
            
            # Try other possible attribute names if not found
            if tpa_id == 'unknown-tpa':
                possible_tpa_keys = ['tpa_id', 'tpaId', 'TPAId', 'tpa-id']
                for key in possible_tpa_keys:
                    if key in decoded:
                        tpa_id = decoded[key]
                        print(f"Found {key} in token: {tpa_id}")
                        break
        except Exception as e:
            print(f"Token decode error: {str(e)}")
    
    return tpa_id

def upload_to_s3(file, key_path, metadata):
    if not file or not file.get('content'):
        print("Skipping empty file upload.")
        return None
    s3.put_object(
        Bucket=S3_BUCKET,
        Key=key_path,
        Body=file['content'],
        ContentType=file['content_type'],
        Metadata=metadata
    )
    return f"s3://{S3_BUCKET}/{key_path}"

def lambda_handler(event, context):
    headers = {k.lower(): v for k, v in event.get('headers', {}).items()}

    if event['httpMethod'] == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Credentials': 'true'
            },
            'body': json.dumps({'message': 'CORS OK'})
        }

    if headers.get('x-api-key') != API_KEY:
        return {'statusCode': 403, 'body': json.dumps({'message': 'Forbidden'})}

    try:
        content_type = headers.get('content-type', '')
        body = base64.b64decode(event['body']) if event.get('isBase64Encoded') else event['body'].encode()

        if 'multipart/form-data' in content_type:
            parts = decoder.MultipartDecoder(body, content_type).parts
            fields, files = {}, {}
            for part in parts:
                disposition = part.headers.get(b'Content-Disposition', b'').decode()
                name = next((item.split('=')[1].strip('"') for item in disposition.split(';') if item.strip().startswith('name=')), '')
                filename = next((item.split('=')[1].strip('"') for item in disposition.split(';') if item.strip().startswith('filename=')), None)
                if filename:
                    files[name] = {
                        'filename': filename,
                        'content': part.content,
                        'content_type': part.headers.get(b'Content-Type', b'application/octet-stream').decode()
                    }
                else:
                    fields[name] = part.text
        elif 'application/json' in content_type:
            fields, files = json.loads(body), {}
        else:
            raise ValueError(f"Unexpected mimetype in content-type: '{content_type}'")

        # Generate submission ID
        submission_id = f"submission-{int(datetime.utcnow().timestamp() * 1000)}"
        
        # Extract TPA ID from token
        tpa_id = extract_tpa_id_from_token(headers)
        
        # Get broker and employer IDs from form data
        broker_id = fields.get('brokerId', 'unknown-broker')
        employer_id = fields.get('employerId', 'unknown-employer')
        
        print(f"Form fields: {fields}")
        print(f"IDs from extraction - TPA: {tpa_id}, Broker: {broker_id}, Employer: {employer_id}")
        
        # Create submission data
        submission_data = {
            "submissionId": submission_id,
            "submissionDate": datetime.utcnow().isoformat(),
            "tpaId": tpa_id,
            "brokerId": broker_id,
            "employerId": employer_id,
            **fields
        }

        # Upload files to S3
        upload_results = {}
        for field, file in files.items():
            # Construct S3 key with proper partitioning
            key = f"submissions/{tpa_id}/{broker_id}/{employer_id}/{submission_id}/{file['filename']}"
            print(f"Uploading file to S3 path: {key}")
            
            url = upload_to_s3(file, key, {
                'original-filename': file['filename'],
                'content-type': file['content_type'],
                'file-size': str(len(file['content']))
            })
            if url:
                upload_results[field] = {
                    'filename': file['filename'],
                    'url': url,
                    'size': len(file['content'])
                }

        # Store submission metadata
        metadata_key = f"submissions/{tpa_id}/{broker_id}/{employer_id}/{submission_id}/submission-data.json"
        upload_to_s3({
            'filename': 'submission-data.json',
            'content': json.dumps(submission_data).encode(),
            'content_type': 'application/json'
        }, metadata_key, {})

        # Send email notification
        send_email(submission_data, upload_results)

        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'message': 'Quote submitted successfully',
                'quoteId': submission_id,
                'uploadResults': upload_results,
                'emailSent': True,
                'identifiers': {
                    'tpaId': tpa_id, 
                    'brokerId': broker_id, 
                    'employerId': employer_id
                }
            })
        }

    except Exception as e:
        print("Handler Error:", str(e))
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'message': 'Internal server error', 'error': str(e)})
        } 