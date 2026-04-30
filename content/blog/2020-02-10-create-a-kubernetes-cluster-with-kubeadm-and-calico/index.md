---
title: "Create a Kubernetes Cluster with Kubeadm and Calico on GCP instances"
slug: create-a-kubernetes-cluster-with-kubeadm-and-calico
date: 2020-02-10
authors:
  - Tomoya Amachi
published: true
description: ""
---
# Glossary

## Kubeadm

### What is it?

> kubeadm helps you bootstrap a minimum viable Kubernetes cluster that conforms to best practices. With kubeadm, your cluster should pass Kubernetes Conformance tests. Kubeadm also supports other cluster lifecycle functions, such as upgrades, downgrade, and managing bootstrap tokens.

source: [Creating a single control-plane cluster with kubeadm](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/)

> Creating a single control-plane cluster with kubeadm

### Spec

> Before you begin
- One or more machines running a deb/rpm-compatible OS, for example Ubuntu or CentOS
- 2 GB or more of RAM per machine. Any less leaves little room for your apps.
- 2 CPUs or more on the control-plane node
- Full network connectivity among all machines in the cluster. A public or private network is fine.

We only need to run 3 steps if you want to create 1 master node and 1 worker node cluster.

1. run "kubeadm init" on master node
2. install CNI on master node ("kubectl apply")
3. run "kubeadm join —token=xxxx" on worker node
## [Calico](https://www.projectcalico.org/)

> Calico is an open source networking and network security solution for containers, virtual machines, and native host-based workloads.

Calico is a popular CNI(container network interface) plugin. CNI makes it easy to configure container networking when containers are created or destroyed. Calico has good performance, flexibility, and security.

<!-- TODO: image download failed for 6edc6464-4b26-44d5-9913-f18e5a8a591b src=https://s3-us-west-2.amazonaws.com/secure.notion-static.com/d1372c00-ce31-436b-9671-c01c24fd3b79/Untitled.png -->

source: [Benchmark results of Kubernetes network plugins (CNI) over 10Gbit/s network](https://itnext.io/benchmark-results-of-kubernetes-network-plugins-cni-over-10gbit-s-network-updated-april-2019-4a9886efe9c4)

# Overview

1. Create instances
2. Create Firewalls
3. Install docker, kubelet and kubeadm to each server
4. Initialize kubeadm master node
5. Install calico
6. Add other master node servers to control-plane
7. Join worker node to the cluster
<!-- TODO: image download failed for 2fe019ac-2d3b-43ca-b15b-d8bcd774e172 src=https://s3-us-west-2.amazonaws.com/secure.notion-static.com/4b475aab-2643-4db2-95be-c0a333559354/Untitled.png -->

# code block examples

```bash
# : comments of following commands

#> : expected stdout

<xxx> : variables
```

# 1. install docker

Run following commands in each server

```bash
# kubelet/kubernetes need to set swapoff
# https://github.com/kubernetes/kubernetes/issues/53533
sudo swapoff -a
# persist swapoff 
sudo sh -c "cat <<EOF > /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
vm.swappiness = 0
EOF"
sudo sysctl --system

# Set SELinux in permissive mode (effectively disabling it)
# to allow containers access to access the host filesystem
sudo setenforce 0
sudo sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config

# install docker and set docker daemon
sudo yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-engine
sudo yum install -y yum-utils device-mapper-persistent-data lvm2
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo
sudo yum makecache fast
sudo yum update -y
sudo yum install -y docker-ce docker-ce-cli containerd.io

# docker daemon should use the systemd cgroup
sudo mkdir /etc/docker
sudo sh -c 'cat <<EOF > /etc/docker/daemon.json
{
 "exec-opts": ["native.cgroupdriver=systemd"],
 "log-driver": "json-file",
 "log-opts": {
   "max-size": "100m"
 },
 "storage-driver": "overlay2",
 "storage-opts": [
   "overlay2.override_kernel_check=true"
 ]
}
EOF'
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo systemctl enable docker
sudo systemctl daemon-reload
sudo systemctl start docker
```

# 2. install kubeadm and kubelet

```bash
sudo sh -c "cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-x86_64
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
EOF"
sudo yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes
sudo mkdir /var/lib/kubelet

# run with systemd
# https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/kubelet-integration/#the-kubelet-drop-in-file-for-systemd
sudo sh -c 'cat <<EOF > /var/lib/kubelet/config.yaml
kind: KubeletConfiguration
apiVersion: kubelet.config.k8s.io/v1beta1
cgroupDriver: "systemd"
EOF'
sudo mkdir /etc/systemd/kubelet.service.d
sudo sh -c 'cat <<EOF > /etc/systemd/kubelet.service.d/20-extra-args.conf
[Service]
Environment="KUBELET_EXTRA_ARGS=--fail-swap-on=false"
EOF'
sudo systemctl enable --now kubelet
sudo systemctl daemon-reload

# check cgroup driver
sudo docker info | grep Cgroup
#> Cgroup Driver: systemd
```

# 3. create kubeadm to master nodes

## 1st master node

```bash
# create Load Balancer by opening port 6443

# 192.168.0.0/16 using for subnet in Calico 
sudo sh -c 'cat <<EOF > kubeadm-config.yaml
apiVersion: kubeadm.k8s.io/v1beta1
kind: ClusterConfiguration
kubernetesVersion: stable
apiServer:
  certSANs:
  - <MASTER_NODE>
controlPlaneEndpoint: "<MASTER_NODE>:6443"
networking:
  podSubnet: "192.168.0.0/16"
EOF'
sudo kubeadm reset --force
sudo kubeadm init --config=kubeadm-config.yaml

# Copy the displayed output to notepad
#> kubeadm join <MASTER_NODE>:6443 --token xxxxxx --discovery-token-ca-cert-hash xxxxxx
```

"kubeadm init" runs following steps

- preflight checks
- start kubelet
- generate configuration files
- generate manifest for etcd
- start control plane
- labeling
- install kube-proxy and CoreDNS

next step registering credential information to kubectl.

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Now, we can access the `<MASTER_NODE>:6443/api/`.

#  Apply CNI to calico

Next step, installing calico for communicates between other server's pods.

Calico is one of the most popular network plugin for Kubernetes.

```bash
# applying Calico and creating initial configuration files on master1 server
# https://docs.projectcalico.org/v3.10/getting-started/kubernetes/installation/calico
kubectl apply -f https://docs.projectcalico.org/v3.11/getting-started/kubernetes/installation/hosted/rbac-kdd.yaml
kubectl apply -f https://docs.projectcalico.org/v3.11/getting-started/kubernetes/installation/hosted/kubernetes-datastore/calico-networking/1.7/calico.yaml

# check pods labeled "calico-node"
kubectl get pods -n kube-system -l k8s-app=calico-node 
```

Copy credential and configuration files from the first master node to other master nodes.

```bash
# Copy files to other masters
CIPS="<master2ip> <master3ip>"
USER=<USERNAME>
for host in ${CIPS};do
  scp /etc/kubernetes/pki/ca.crt "${USER}"@$host:
  scp /etc/kubernetes/pki/ca.key "${USER}"@$host:

  scp /etc/kubernetes/pki/sa.key "${USER}"@$host:
  scp /etc/kubernetes/pki/sa.pub "${USER}"@$host:

  scp /etc/kubernetes/pki/front-proxy-ca.crt "${USER}"@$host:
  scp /etc/kubernetes/pki/front-proxy-ca.key "${USER}"@$host:

  scp /etc/kubernetes/pki/etcd/ca.crt "${USER}"@$host:etcd-ca.crt
  scp /etc/kubernetes/pki/etcd/ca.key "${USER}"@$host:etcd-ca.key

  scp /etc/kubernetes/admin.conf "${USER}"@$host:
done

```

## Other master nodes

Clone credential information and configuration files and run "kubeadm join" which memorized command result of "kubeadm init" on the 1st master node.

Clone creadential and configuration files and `kubeadm join` with the copied results from "kubeadm init" commands on master1 node.

```bash
sudo mkdir -p /etc/kubernetes/pki/etcd
sudo mv -vi /home/$USER/ca.crt /etc/kubernetes/pki/
sudo mv -vi /home/$USER/ca.key /etc/kubernetes/pki/

sudo mv -vi /home/$USER/sa.key /etc/kubernetes/pki/
sudo mv -vi /home/$USER/sa.pub /etc/kubernetes/pki/

sudo mv -vi /home/$USER/front-proxy-ca.crt /etc/kubernetes/pki/
sudo mv -vi /home/$USER/front-proxy-ca.key /etc/kubernetes/pki/

sudo mv -vi /home/$USER/etcd-ca.crt /etc/kubernetes/pki/etcd/ca.crt
sudo mv -vi /home/$USER/etcd-ca.key /etc/kubernetes/pki/etcd/ca.key
sudo mv -vi /home/$USER/admin.conf /etc/kubernetes/admin.conf

sudo mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo shown $(id -u):$(id -g) $HOME/.kube/config

# join to kubeadm as master node with --control-plane option
# paste memorized command with --experimental-control-plan option
sudo kubeadm join <MASTER_URL>:6443 --token <COPIED_TOKEN> \
    --discovery-token-ca-cert-hash <COPIED_HASH> \
    --control-plane
```

Now we can check iptables rule changed by Calico.

```bash
sudo iptables -L
```

# Worker nodes

Worker nodes only necessary to run "kubeadm join".

```bash

sudo kubeadm join <MASTER_URL>:6443 --token <COPIED_TOKEN> \
    --discovery-token-ca-cert-hash <COPIED_HASH>
```

# Run some applications

```bash
kubectl create ns hello-test
kubectl create deployment hello-node --image=gcr.io/hello-minikube-zero-install/hello-node -n hello-test
kubectl expose deployment hello-node --type=LoadBalancer --port=80 -n hello-test
kubectl get po -n hello-test
#> NAME                          READY   STATUS    RESTARTS   AGE
#  hello-node-7676b5fb8d-xzkb8   1/1     Running   0          32s
kubectl get svc hello-node -n hello-test
#> NAME         TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
#  hello-node   LoadBalancer   10.111.27.104   <pending>     80:<PODPORT>/TCP   27s
kubectl get po/<podname> -o jsonpath='{.status.hostIP}'
#> <HOSTIP>
curl <HOSTIP>:<PODPORT>
#> Hello, World!

# delete all of them
kubectl delete ns hello-test
```

# Delete a worker node

On a master node

```bash
kubectl cardon <node>
kubectl drain <node> --delete-local-data --force ---ignore-daemonsets
kubectl delete node <node>
```

## On the deleted node

"kubectl delete" with kubeadm cannot delete target node's iptables. We need to delete iptables on our own.

```bash
sudo kubeadm reset
sudo sh -c "iptables -F && iptables -t nat -F && iptables -t mangle -F && iptables -X"
```

---
