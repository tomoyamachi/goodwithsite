---
title: "MySQL to Elasticsearch via logstash on AWS Elasticsearch Service"
slug: "elasticsearch"
date: 2026-04-30
authors: []
published: false
description: ""
---
# Setting up Logstash

following [this page steps](https://www.elastic.co/guide/en/logstash/current/installing-logstash.html)

```bash
sudo apt-get update && sudo apt-get install default-jre
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-7.x.list
sudo apt-get update && sudo apt-get install logstash
```

# run as systemd

```bash
sudo systemctl enable logstash
sudo systemctl start logstash

# check status
sudo systemctl status logstash
> ● logstash.service - logstash
   Loaded: loaded (/etc/systemd/system/logstash.service; enabled; vendor preset: enabled)
   Active: active (running) since Sun 2020-02-16 21:32:32 UTC; 12s ago
 Main PID: 7498 (java)
    Tasks: 14 (limit: 2361)
   CGroup: /system.slice/logstash.service
           └─7498 /usr/bin/java -Xms1g -Xmx1g -XX:+UseConcMarkSweepGC -XX:CMSInitiatingOccupancyFraction=75 -XX:+UseCM
```

# Setting JDBC

Download from [MySQL Community Downloads](https://dev.mysql.com/downloads/connector/j/).

[https://www.elastic.co/downloads/jdbc-client](https://www.elastic.co/downloads/jdbc-client)
