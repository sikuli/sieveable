#!/bin/bash
# This script is used as a startup script on Google Compute Engine's virtual machines
# (CentOS v7.x) to perform automated tasks every time we boot up a new instance.
SOLR_VERSION=5.4.1
REDIS_VERSION=3.0.6
ZOOKEEPER_VERSION=3.4.6
NODE_VERSION=5
JAVA_VERSION=1.7.0
SOLR_INSTALL_DIR=/mnt/pd1/home/bin/solr
REDIS_INSTALL_DIR=/mnt/pd1/home/bin/redis
ZOOKEEPER_INSTALL_DIR=/mnt/pd1/home/bin/zookeeper
# Update and install lsof, gcc, gcc-c++, and make
yum update-minimal
yum -y install bzip2
yum -y install lsof
yum -y install gcc gcc-c++ make
# Install git
yum install -y git
# Install tmux
yum install -y tmux
# Install Java
yum -y install java-$JAVA_VERSION-openjdk-devel
# Install node
curl --silent --location https://rpm.nodesource.com/setup_$NODE_VERSION.x | bash -
yum -y install nodejs
# Download and install Solr
curl -O "http://archive.apache.org/dist/lucene/solr/$SOLR_VERSION/solr-$SOLR_VERSION.tgz"
mkdir -p $SOLR_INSTALL_DIR
tar -xzf solr-$SOLR_VERSION.tgz -C $SOLR_INSTALL_DIR --strip-components=1
rm solr-$SOLR_VERSION.tgz
# Download and install Redis
curl -O "http://download.redis.io/releases/redis-$REDIS_VERSION.tar.gz"
mkdir -p $REDIS_INSTALL_DIR
tar -xzf redis-$REDIS_VERSION.tar.gz -C $REDIS_INSTALL_DIR --strip-components=1
rm redis-$REDIS_VERSION.tar.gz
make -C $REDIS_INSTALL_DIR
make -C $REDIS_INSTALL_DIR install
# Install zookeeper
curl -O "http://apache.arvixe.com/zookeeper/zookeeper-$ZOOKEEPER_VERSION/zookeeper-$ZOOKEEPER_VERSION.tar.gz"
mkdir -p $ZOOKEEPER_INSTALL_DIR
tar -xzf zookeeper-$ZOOKEEPER_VERSION.tar.gz -C $ZOOKEEPER_INSTALL_DIR --strip-components=1
rm zookeeper-$ZOOKEEPER_VERSION.tar.gz
# Install npm globals
npm install -g gulp mocha
yum -y clean all
