#!/bin/bash

rm -f public/stylesheets/bootstrap.min.css.map
rm -f public/stylesheets/bootstrap.min.css
rm -f public/javascripts/bootstrap.min.js
rm -f public/javascripts/jquery.min.js

cp node_modules/bootstrap/dist/css/bootstrap.min.css.map public/stylesheets
cp node_modules/bootstrap/dist/css/bootstrap.min.css public/stylesheets/
cp node_modules/bootstrap/dist/js/bootstrap.min.js public/javascripts
cp node_modules/jquery/dist/jquery.min.js public/javascripts