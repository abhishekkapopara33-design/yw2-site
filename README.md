# Deployment


## Media
Media is kept on AWS S3 and accessed through CloudFront

### Deployment
cd yw2-media
sam build; sam validate --lint;
sam deploy --guided --capabilities CAPABILITY_NAMED_IAM


## Website
Checkout the main branch
git push origin main
This will trigger the CloudFlare CI/CD pipeline to publish /website/dist



Cloudflare
  - DNS
  - Email Routing
  - Pages & workers

CDN

AWS
  SES
  S3
  CloudFront


- Make sure to update _scripts/push-herovideo-to-s3.sh if using a different s3 bucket name
- Make sure to update the Cloudflare [] if updating S3 bucket


# Updating the Website
The website is attached to CloudFlare by this repo's main brain at /website/dist