---
title: "Hosting HELM chart private repositories in GitHub and GitLab"
slug: hosting-helm-chart-private-repository-in-github-and-gitlab
date: 2020-02-14
authors:
  - Tomoya Amachi
published: true
description: ""
---
Helm is a popular tool for Kubernetes package manager. This article introduces what is  Helm and how to host private helm repositories.

---

# Helm's concept and glossary

> The package manager for Kubernetes

[Official site](https://helm.sh/)

Helm is a popular tool for Kubernetes package manager. Helm contains 3 main concepts.

### Repos

A "Repo" is a charts registry. You can add your own registry.

The official Helm stable repo is popular. You can add repos with following commands.

```bash
$ helm repo add stable https://kubernetes-charts.storage.googleapis.com/
$ helm repo update
$ helm search repo stable
NAME                                    CHART VERSION   APP VERSION                     DESCRIPTION
stable/acs-engine-autoscaler            2.2.2           2.1.1                           DEPRECATED Scales worker nodes within agent pools
stable/aerospike                        0.2.8           v4.5.0.5                        A Helm chart for Aerospike in Kubernetes
stable/airflow                          4.1.0           1.10.4                          Airflow is a platform to programmatically autho...
stable/ambassador                       4.1.0           0.81.0                          A Helm chart for Datawire Ambassador
...
```

### Charts

A "Chart" is the term used for a package. A "Chart" is a collection of files that describe a related set of Kubernetes resources.

```bash
$ helm show chart stable/aerospike
apiVersion: v1
appVersion: v4.5.0.5
description: A Helm chart for Aerospike in Kubernetes
home: http://aerospike.com
icon: https://s3-us-west-1.amazonaws.com/aerospike-fd/wp-content/uploads/2016/06/Aerospike_square_logo.png
keywords:
- aerospike
- big-data
maintainers:
- email: kavehmz@gmail.com
  name: kavehmz
- email: okgolove@markeloff.net
  name: okgolove
name: aerospike
sources:
- https://github.com/aerospike/aerospike-server
version: 0.3.2
```

### Releases

> When a chart is installed, the Helm library creates a release to track that installation. A single chart may be installed many times into the same cluster, and create many different releases.

Release names always changed when we install charts. 

We can set release name with a parameter.

```bash
$ helm install [RELEASE_NAME] stable/aerospike
```

Or we can use generated values.

```bash
$ helm install --generate-name stable/aerospike
```

### Values

> Values provide a way to override template defaults with your own information.

We can check templates with values.

```bash
$ helm template stable/aerospike -f test_values.yml
```

And we can install with values.

```bash
$ helm install --generate-name stable/aerospike -f test_values.yml
```

# Versions

helm v3.0.3

# GitLab

## Public Repository

We can use [GitLab Pages](https://about.gitlab.com/stages-devops-lifecycle/pages/) in a Public Repository. We need running GitLab runner to publish GitLab Pages. 

```yaml
# .gitlab-ci.yml
pages:
  image:
    name: linkyard/docker-helm
    entrypoint: ["/bin/sh", "-c"]
  stage: deploy
  script:
    - helm init --client-only
    - mkdir -p ../public
    - "echo \"User-Agent: *\nDisallow: /\" > ../public/robots.txt"
    - helm package * --destination ../public
    - echo https://${CI_PROJECT_NAMESPACE}.gitlab.io/${CI_PROJECT_NAME}
    - helm repo index --url https://${CI_PROJECT_NAMESPACE}.gitlab.io/${CI_PROJECT_NAME} .
    - mv index.yaml ../public
    - mv ../public .
  artifacts:
    paths:
      - public
  only:
    - master
```

After that 

```yaml
helm repo add mygitlab https://t-amachi.gitlab.io/helm-catalogs/
```

## Private Repository

If you use index.yaml we need to build a new server which hosts index.yaml.

But helm v3 can evaluate OCI format, so we can use GitLab Packages.

At first, we create a new chart.

```bash
# OCI format is experimental feature
export HELM_EXPERIMENTAL_OCI=1

helm registry login -u tomoyamachi --password <token> https://registry.gitlab.com/

helm chart save map-collector gitlab.com/tomoyamachi/catalog:v0.0.1

helm chart list
#>
# 
helm chart push gitlab.com/tomoyamachi/catalog:v0.0.1
```

Then we try to fetch the target chart in another environment.

```bash
helm registry login -u tomoyamachi --password <token> https://registry.gitlab.com/
export HELM_EXPERIMENTAL_OCI=1
helm chart pull gitlab.com/tomoyamachi/catalog:v0.0.1
helm chart list

```

Now we can use the catalog chart in this environment.

# GitHub

When using GitHub, we use [https://raw.githubusercontent.com](https://raw.githubusercontent.com/).

You only need to set the index.yaml to the root path of the target repository.

```bash
helm repo add my-public-github https://raw.githubusercontent.com/tomoyamachi/helm-catalogs/master
```

You can provide a username and password(token) with parameters.

```bash
helm repo add --username tomoyamachi --password $TOKEN my-private-github https://raw.githubusercontent.com/tomoyamachi/helm-catalogs/master
```
