---
title: "Trivy adopted by Harbor and Docker Enterprise"
slug: trivy-harbor-docker-enterprise
date: 2020-03-15
authors:
  - Tomoya Amachi
published: true
description: ""
---
Today, Trivy adopted by famous container registry services, Harbor registry and Mirantis Docker Enterprise. Trivy is an easy-to-use open-source vulnerability scanner for container images. It detects vulnerabilities not only in OS packages but also in application libraries, e.g. node(JavaScript), gem(Ruby).

---

[Trivy Vulnerability Scanner from Aqua Security Adopted by Leading Cloud Native Platforms](https://securityboulevard.com/2020/03/trivy-vulnerability-scanner-from-aqua-security-adopted-by-leading-cloud-native-platforms/)

Trivy originally developed by [@knqyf263(Teppei Fukuda)](https://github.com/knqyf263) in May 2019, and I also helped to develop Trivy first version. At that time, there were many competitors in vulnerability scanners for container images, but Teppei created the best container image scanner. He passionately cared about simplicity. For example, simple features, simple command-line options, and users do not need any preparations before scanning.

He researched competitors and noticed they are not perfect. I helped to create Trivy, but I only developed to retrieve OS packages and some of the application libraries from container image files. He developed the rest of the features with his great passion. It was very interesting to help.

I remember the weekend in which Trivy was released. I attended the Go Conference Tokyo. I promoted how great Trivy is while I was there. I said to a Google engineer “Why not use Trivy to default image scanner of Google Container Registry?” half-jokingly. Google Container Registry is a very well known container image registry and already has an original vulnerability scanner. So, I meant Trivy is a new tool and there were no example cases, but it was worth using it.

Today, Trivy is really used by very well known container image registries. Harbor and Docker Enterprise!! I am so excited to hear the news.

I hope to Trivy would be a more nice tool, and want to help it.
