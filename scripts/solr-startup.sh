#!/bin/bash
SOLR_PORT=8983
SOLR_OPTS="-cloud -V -m 1g -p $SOLR_PORT"
solr start $SOLR_OPTS
rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi
createCollection () {
   solr create -c $1 -p $SOLR_PORT
   rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi
}
createCollection sieveable_listing
createCollection sieveable_code
createCollection sieveable_ui_tag
createCollection sieveable_ui_suffix
createCollection sieveable_manifest
