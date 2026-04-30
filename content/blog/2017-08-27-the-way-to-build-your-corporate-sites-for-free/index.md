---
title: "The way to build your corporate sites for free"
slug: the-way-to-build-your-corporate-sites-for-free
date: 2017-08-27
authors:
  - Tomoya Amachi
published: true
description: ""
---
# TL; DL

1. Corporate site : [GitHub Pages](https://help.github.com/articles/creating-a-github-pages-site-with-the-jekyll-theme-chooser/)
2. Mail : Forward mail to own personal Gmail
3. CDN/SSL : [Cloudflare](https://cloudflare.com/)
4. Chat : [Slack](https://slack.com/)
---

# Requirements

## 1. Corporate site

- Company blog
- i18n
- Secure
- No need maintain maintain the server
## 2. Mail

- No need corporate's mail server.
- Forwarding mail to personal Gmail account. I don't wanna switch Google accounts anymore.
- No need maintain the mailserver
## 3. CDN/SSL

- No need to maintain certification files and servers
# Comparison

## Corporate site

- [Heroku](https://heroku.com/) is a better way if you want to use wordpress or so on.
## Mail

- [Zoho mail](https://www.zoho.com/mail/) is a better way if you want to corporate's mailserver. You can use free until 10 users, 2GB.
- [mailgun](https://www.mailgun.com/) is a better way if you want to do something when receive a mail.
## CDN/SSL

- You can choose [Let's encrypt](https://letsencrypt.org/), but it takes some cost if you want to updating certificate files automatically.
# Settings

## At first

1. Create your account at some name Domain Name Registory service
2. Register your corporate's domain
## DNS/CDN/SSL

1. [Create a Cloudflare account and add a website](https://support.cloudflare.com/hc/en-us/articles/201720164-Step-2-Create-a-Cloudflare-account-and-add-a-website)
2. [Change your domain name servers to Cloudflare](https://support.cloudflare.com/hc/en-us/articles/205195708-Step-3-Change-your-domain-name-servers-to-Cloudflare)
3. cloud mark if you want to use SSL/CDN. You can choose simple DNS feature if you don't check cloud mark.
## Mail

It would be set forward to another mail domain only [Onamae.com](https://onamae.com/).<br/>
Please let me know if you know how to set another NS hosting service.

1. Setting > Mail > Add
2. Log into Gmail
3. Set two factor auth if you don't.
4. Gmail > Setting > Add some account
5. Verify your domain [each ESP](https://help.mailgun.com/hc/en-us/articles/215238578-I-m-not-receiving-complaints-from-some-recipients-domains-How-can-I-fix-this-)
## GitHub Pages

1. Create or Login your personal GitHub account
2. Create your organization
3. Create repositories *your-organization*.github.io
4. Setting > GitHub pages
5. Choose a theme
6. Add CNAME www *your-organize-account*.github.io if you can access *your-organize-account*.github.io
## Each captures

1. Reference [this article](https://ossia.co.jp/blog/2017/02/06/gmail-onamae/)
- GitHub page
<!-- TODO: image download failed for 1ed5f904-d1bb-4e6f-97a0-8a24997c7597 src=https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c7914270-2903-4cb0-8a2d-fc179e26d534/gh-page.png -->

- Cloudflare
<!-- TODO: image download failed for 3c8d0b2e-de8d-4bc6-82b1-c65c4a91eb90 src=https://s3-us-west-2.amazonaws.com/secure.notion-static.com/85e62415-c400-45e1-b7cd-96f701b29933/cloudflare.png -->

- [Onamae.com](http://onamae.com/)

## Slack

1. No special way to setting. Create your team normally.
# Conclusion

Now You don't need money to create your new business environment.
Your payment is only to register your Domain.
Please advise me if you know a better way than my article.

<!-- TODO: image download failed for e2617a2f-717c-4956-9fc5-4d24ea7bbecb src=https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c1e3f275-3d98-4d20-b3d5-430732ab3e8d/onamae.png -->
