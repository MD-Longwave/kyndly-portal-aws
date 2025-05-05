# Zapier Integration for Google Workspace

This document outlines how to set up the Zapier integration for sending quote data to Google Workspace.

## Overview

When a quote is submitted through our system, we need to send the data to Google Workspace for further processing. This is achieved through a Zapier webhook that triggers a workflow to populate a Google Sheet or Google Form.

## Setup Instructions

1. Create a Zapier account if you don't already have one
2. Create a new Zap
3. Select "Webhook by Zapier" as the trigger
4. Choose "Catch Hook" as the event
5. Copy the webhook URL provided by Zapier
6. Set this URL as the `ZAPIER_WEBHOOK_URL` environment variable in the Lambda function

## Zapier Workflow Configuration

1. Set up the trigger to receive data from our webhook
2. Add a Google Sheets action to add a new row to a spreadsheet
3. Map the fields from the webhook payload to the appropriate columns in the Google Sheet
4. Optionally, add a Gmail action to send email notifications
5. Test the workflow to ensure data is being properly received and processed

## Data Structure

The webhook will send the following data:

```json
{
  "tpaId": "string",
  "employerId": "string",
  "submissionId": "string",
  "transperraRep": "string",
  "contactType": "string",
  "companyName": "string",
  "ichraEffectiveDate": "date",
  "pepm": "number",
  "currentFundingStrategy": "string",
  "targetDeductible": "number",
  "targetHSA": "string",
  "brokerName": "string",
  "brokerEmail": "string",
  "priorityLevel": "string",
  "censusFileUrl": "string",
  "planComparisonFileUrl": "string",
  "additionalNotes": "string"
}
```

## Testing the Integration

1. Use Postman or another API testing tool to send a test webhook to your Zapier webhook URL
2. Verify that the data appears correctly in your Google Sheet
3. Check that any notifications are being sent as expected

## Troubleshooting

- If data is not appearing in your Google Sheet, check the Zap history in Zapier for any errors
- Ensure that all required fields are being sent in the webhook payload
- Verify that the Google account has permission to access the target sheet 