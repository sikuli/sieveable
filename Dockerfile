# Sieveable Docker container
#
# Version: 0.1.0

FROM centos:7
MAINTAINER Khalid Alharbi
# SET environment variables
ENV SOLR_VERSION 5.4.0
ENV JAVA_VERSION 1.7.0
ENV REDIS_VERSION 3.0.6
ENV NODE_VERSION 5
ENV SOLR_INSTALL_DIR /opt/solr
ENV REDIS_INSTALL_DIR /opt/redis
ENV SIEVEABLE_TARGET_DIR /opt/apps
ENV SIEVEABLE_PORT 3000
ENV NODE_ENV development
# Replace the default sh shell with bash
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
# Update packages that have fixes and install general dev packages
RUN yum update-minimal \
    && yum -y install bzip2 \
    && yum -y install lsof \
    && yum -y install gcc gcc-c++ make \
    && yum -y clean all
# Install JDK
RUN yum -y install java-${JAVA_VERSION}-openjdk-devel && yum -y clean all
# Install git
RUN yum install -y git && yum -y clean all
# Install Node.js v5
RUN curl --silent --location https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && yum -y install nodejs && yum -y clean all
# Download and extract Apache Solr
RUN curl -O "http://archive.apache.org/dist/lucene/solr/${SOLR_VERSION}/solr-${SOLR_VERSION}.tgz" \
    && mkdir -p ${SOLR_INSTALL_DIR} \
    && tar -xzf solr-${SOLR_VERSION}.tgz -C ${SOLR_INSTALL_DIR} --strip-components=1 \
    && rm solr-${SOLR_VERSION}.tgz
# Add Solr to PATH
ENV PATH ${SOLR_INSTALL_DIR}/bin:$PATH
# Install Redis v3
RUN curl -O "http://download.redis.io/releases/redis-${REDIS_VERSION}.tar.gz" \
    && mkdir -p ${REDIS_INSTALL_DIR} \
    && tar -xzf redis-${REDIS_VERSION}.tar.gz -C ${REDIS_INSTALL_DIR} --strip-components=1 \
    && rm redis-${REDIS_VERSION}.tar.gz \
    && make -C ${REDIS_INSTALL_DIR} \
    && make -C ${REDIS_INSTALL_DIR} install
# Install gulp and mocha
RUN npm install -g gulp mocha
