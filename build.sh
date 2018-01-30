#!/bin/bash

./clean.sh

cp node_modules/bootstrap/dist/css/bootstrap.min.css.map public/stylesheets
cp node_modules/bootstrap/dist/css/bootstrap.min.css public/stylesheets/
cp node_modules/bootstrap/dist/js/bootstrap.min.js public/javascripts
cp node_modules/jquery/dist/jquery.min.js public/javascripts
cp node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css public/stylesheets
cp node_modules/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js public/javascripts
