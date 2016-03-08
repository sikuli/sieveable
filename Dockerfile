# Sieveable Docker container
#
# Version: 0.2.0

FROM centos:7
MAINTAINER Khalid Alharbi "https://github.com/kalharbi"
# SET environment variables
ENV SOLR_VERSION 5.1.0
ENV JAVA_VERSION 1.7.0
ENV REDIS_VERSION 3.0.6
ENV NODE_VERSION 5
ENV SOLR_INSTALL_DIR /opt/solr
ENV REDIS_INSTALL_DIR /opt/redis
ENV SIEVEABLE_TARGET_DIR /opt/apps
ENV SIEVEABLE_PORT 3000
ENV NODE_ENV development
ENV PATH $SOLR_INSTALL_DIR/bin:$PATH
# Replace the default sh shell with bash
# Update packages that have fixes and install general dev packages
RUN rm /bin/sh && ln -s /bin/bash /bin/sh \
    && yum update-minimal \
    && yum -y install bzip2 \
    lsof \
    gcc \
    gcc-c++ \
    make \
    git \
    java-${JAVA_VERSION}-openjdk-devel \
    && yum -y clean all
# Install Node.js v5 and gulp globally
RUN curl --silent --location https://rpm.nodesource.com/setup_${NODE_VERSION}.x | bash - \
    && yum -y install nodejs && yum -y clean all \
    && npm install -g gulp
# Download and extract Apache Solr
RUN curl -O "http://archive.apache.org/dist/lucene/solr/${SOLR_VERSION}/solr-${SOLR_VERSION}.tgz" \
    && mkdir -p ${SOLR_INSTALL_DIR} \
    && tar -xzf solr-${SOLR_VERSION}.tgz -C ${SOLR_INSTALL_DIR} --strip-components=1 \
    && rm solr-${SOLR_VERSION}.tgz
# Install Redis v3
RUN curl -O "http://download.redis.io/releases/redis-${REDIS_VERSION}.tar.gz" \
    && mkdir -p ${REDIS_INSTALL_DIR} \
    && tar -xzf redis-${REDIS_VERSION}.tar.gz -C ${REDIS_INSTALL_DIR} --strip-components=1 \
    && rm redis-${REDIS_VERSION}.tar.gz \
    && make -C ${REDIS_INSTALL_DIR} \
    && make -C ${REDIS_INSTALL_DIR} install
# Start Solr and create our collections
RUN solr start -c -V -p 8983 \
    && solr create -c sieveable-listing -p 8983 \
    && solr create -c sieveable-code -p 8983 \
    && solr create -c sieveable-ui-tag -p 8983 \
    && solr create -c sieveable-ui-suffix -p 8983 \
    && solr create -c sieveable-manifest -p 8983
# Clone Sieveable
RUN git clone https://github.com/sikuli/sieveable.git ${SIEVEABLE_TARGET_DIR}/sieveable
WORKDIR ${SIEVEABLE_TARGET_DIR}/sieveable
# Start Redis
RUN redis-server config/redis.conf
# Install dependencies, run build tasks, and run test
RUN npm install && gulp && npm test
EXPOSE 3000
CMD ["node", "bin/www"]
