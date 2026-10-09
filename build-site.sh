#!/bin/sh
# Arma _site/ para GitHub Pages (y para previsualizar en local: sh build-site.sh && npx http-server _site)
set -e
rm -rf _site && mkdir -p _site/stories
cp site/index.html _site/
cp -r animations brand media _site/
cp -r stories/fonts _site/stories/
touch _site/.nojekyll
