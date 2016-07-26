#!/bin/bash
SOLR_PORT=8983
SOLR_OPTS="-p $SOLR_PORT"
deleteCollection () {
   solr delete -c $1 -p $SOLR_PORT -deleteConfig true
   rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi
}
deleteCollection sieveable_listing
deleteCollection sieveable_code
deleteCollection sieveable_ui_tag
deleteCollection sieveable_ui_suffix
deleteCollection sieveable_manifest
solr stop $SOLR_OPTS
