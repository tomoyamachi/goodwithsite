---
title: "How to host static site by Google Cloud Storage"
slug: how-to-host-static-site-by-cloud-storage
date: 2018-02-22
authors:
  - Tomoya Amachi
published: true
description: ""
---
Some of our front-end projects are hosted by [Google Cloud Storage](https://cloud.google.com/storage/), and cached by [Cloudflare](https://www.cloudflare.com/).
Today I will introduce how to host with GCS and Cloudflare.

---

# Steps

## 1. Verify your domain

I like verifying by Domain Name provider because no need to host servers and really easy.

1. Go [Webmaster Central](https://www.google.com/webmasters/verification/home?hl=en)
2. Click "ADD A PROPERTY"
3. Choose "Alternative methods"
4. Choose "Domain name provider"
5. Type: `TXT`, Name : `@`, Content: `google-site` in Cloudflare
6. Click "VERIFY"
This DNS record must not be deleted if you want to keep the verification.

## 2. Create Storage Bucket

1. Create Bucket : `gsutil mb gs://www.example.com`, if you host `https://www.example.com`
2. Upload files : `gsutil rsync -R /path/to/dir gs://www.example.com`
3. `chmod` your files : `gsutil acl -r ch -u AllUsers:R gs://www.example.com/*`
4. Set index/error pages : `gsutil web set -m index.html -e 404.html gs://www.example.com`
## 3. Add `CNAME` Record

1. Create a CNAME record that points to `c.storage.googleapis.com`
<!-- TODO: image download failed for d8a52a52-4184-4f63-8ada-5145576b7c5a src=https://s3-us-west-2.amazonaws.com/secure.notion-static.com/afcc2d1b-d637-449e-9b42-2cb15cd71993/cloudflare_settings.png -->

# Conclusion

It's very easy to host static files.

<!-- TODO: image download failed for 89d0056a-1af4-4196-b727-d9ba9d2d5022 src=https://s3-us-west-2.amazonaws.com/secure.notion-static.com/d45b7f66-73d2-46a1-aa96-1bc384a1fcc3/verifying.png -->
