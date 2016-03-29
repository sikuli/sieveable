#!/bin/bash
# This script is used as a startup script on Google Compute Engine's virtual machines
# (CentOS v7.x) to perform automated tasks every time we boot up a new instance.
SOLR_VERSION=5.4.1
ZOOKEEPER_VERSION=3.4.6
NODE_VERSION=5
JAVA_VERSION=1.7.0
SOLR_INSTALL_DIR=/mnt/pd1/home/bin/solr
ZOOKEEPER_INSTALL_DIR=/mnt/pd1/home/bin/zookeeper
# Update and install lsof, gcc, gcc-c++, and make
sudo yum update-minimal
sudo yum -y install bzip2
sudo yum -y install lsof
sudo yum -y install gcc gcc-c++ make
# Install git
sudo yum install -y git
# Install tmux
sudo yum install -y tmux
# Install Java
sudo yum -y install java-$JAVA_VERSION-openjdk-devel
# Install node
curl --silent --location https://rpm.nodesource.com/setup_$NODE_VERSION.x | sudo bash -
sudo yum -y install nodejs
# Download and install Solr
curl -O "http://archive.apache.org/dist/lucene/solr/$SOLR_VERSION/solr-$SOLR_VERSION.tgz"
mkdir -p $SOLR_INSTALL_DIR
tar -xzf solr-$SOLR_VERSION.tgz -C $SOLR_INSTALL_DIR --strip-components=1
rm solr-$SOLR_VERSION.tgz
# Install zookeeper
curl -O "http://apache.arvixe.com/zookeeper/zookeeper-$ZOOKEEPER_VERSION/zookeeper-$ZOOKEEPER_VERSION.tar.gz"
mkdir -p $ZOOKEEPER_INSTALL_DIR
tar -xzf zookeeper-$ZOOKEEPER_VERSION.tar.gz -C $ZOOKEEPER_INSTALL_DIR --strip-components=1
rm zookeeper-$ZOOKEEPER_VERSION.tar.gz
# Install npm globals
sudo npm install -g gulp mocha
sudo yum -y clean all
# Add Solr scripts to PATH
echo "export PATH=/mnt/pd1/home/bin/solr/bin:\$PATH" >> ~/.bash_profile
source ~/.bash_profile
