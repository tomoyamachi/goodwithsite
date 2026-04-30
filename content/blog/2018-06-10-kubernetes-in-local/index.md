---
title: "Create Development Environment with Kubernetes Clusters in your mac (with MySQL, ElasticSearch)"
slug: kubernetes-in-local
date: 2018-06-10
authors:
  - Tomoya Amachi
published: true
description: ""
---
I created development environment in minikube.
I took some times to setup keep Volume in own machine.

---

Finally, I created NFS in my mac and k8s volume mount to it.
This article only about macOSX.
You have to create shared folder in your VM if you use windows.

# Versions

- [Docker](https://docs.docker.com/engine/installation) : v18.03.1-ce-mac65
- [kubectl (Client)](https://kubernetes.io/docs/tasks/tools/install-kubectl/) : v1.10.2
- [kubectl (Server)](https://kubernetes.io/docs/tasks/tools/install-kubectl/) : v1.10.0
- [minikube](https://github.com/kubernetes/minikube/) : v0.27.0
- [VirtualBox](https://www.virtualbox.org/wiki/Downloads) or so on...
- [skaffold](https://github.com/GoogleContainerTools/skaffold) : v0.6.0
- [nfsd](https://www.systutorials.com/docs/linux/man/7-nfsd) : Network File System
# Image

<!-- TODO: image download failed for c47886d4-97a5-43f9-bf71-5daa76ddd956 src=https://s3-us-west-2.amazonaws.com/secure.notion-static.com/2e072a70-7d72-4564-bae1-f1ddca35902d/k8s-minikube.png -->

# Commands

### Setup NetworkFileSystem

in macOS

```plain text
$ sudo mkdir /Users/Shared/mysql
$ sudo chmod 777 /Users/Shared/mysql
$ sudo vi /etc/exports

# add following lines
/crm/mysql -maproot=root:mysql -network 192.168.99.0 -mask 255.255.255.0

$ sudo nfsd update
$ sudo showmount -e
Exports list on localhost:
/Users/Shared/mysql                 192.168.99.0
/Users/Shared/elasticsearch         192.168.99.0
```

`192.168.99.1` is minikube's IP address in MacOS.
I added access permission from minikube.

### start VM and minikube

```plain text
$ minikube start --disk-size 20g
$ minikube status
minikube: Running
cluster: Running
kubectl: Correctly Configured: pointing to minikube-vm at 192.168.99.100
```

### Create pods with skaffold

```plain text
$ skaffold dev
Starting build...
Found [minikube] context, using local docker daemon.
Sending build context to Docker daemon  25.67MB
Step 1/5 : FROM php:7.1-fpm
 ---> 11517dccf6fd
Step 2/5 : RUN apt-get update && apt-get install -y libmcrypt-dev mysql-client git     && docker-php-ext-install mcrypt pdo_mysql     && apt-get clean; rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*
 ---> Using cache
 ---> 3ab2884fb363
Step 3/5 : COPY ./main /var/www
 ---> Using cache
 ---> 7dcd45befe33
Step 4/5 : RUN chmod -R 777 /var/www/storage
 ---> Using cache
 ---> 28c46963494d
Step 5/5 : WORKDIR /var/www
 ---> Using cache
 ---> dd39afe581c9
Successfully built dd39afe581c9
Successfully tagged 11b3344bd05b3589691ba369cbd6ecf9:latest
Successfully tagged api-bizcrm:dd39afe581c911ae0a319282f57b6649db16c2e7efafac50c6676a554b9fa657
Build complete in 2.690496822s
Starting deploy...
service "api-http" created
deployment.extensions "api-http" unchanged
Deploy complete in 192.537363ms
Watching for changes...
```

check your pods' status :

```plain text
$ kubectl get po
NAME                         READY     STATUS    RESTARTS   AGE
api-http-779f4558cb-5zntl    3/3       Running   0          15m
api-mysql-86cf68bfdb-hltnn   1/1       Running   1          44m
```

or you can check on GUI : `minikube dashboard`

- for minikube's driver
skaffold build containers when you changed project files.
You should wait a second after saving file.

```plain text
[api-http-779f4558cb-5zntl api] [09-May-2018 17:30:34] NOTICE: ready to handle connections
```

# If you don't wanna use skaffold

You can develop without skaffold to following steps :

```plain text
$ cd /path/to/api-bizcrm
$ eval $(minikube docker-env)
$ export VERSION=<set your version>
$ docker build -f Dockerfile.minikube -t api-bizcrm:$VERSION .
$ kubectl set image deployment/api-http api=api-bizcrm:$VERSION
deployment.apps "api-http" image updated
```

but I think it's too tedious process to develop.
