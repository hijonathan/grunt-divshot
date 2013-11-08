/*
 * grunt-divshot
 * https://github.com/divshot/grunt-divshot
 *
 * Copyright (c) 2013 Divshot
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
  var path = require('path');
  var superstaticDefaults = require('superstatic/lib/defaults');
  
  grunt.registerMultiTask('divshot', 'Run Divshot.io locally', function() {
    var done = this.async();
    var options = this.options({
      port: superstaticDefaults.PORT,
      hostname: superstaticDefaults.HOST,
      root: superstaticDefaults.DIRECTORY,
      clean_urls: false,
      routes: {},
      cache_control: {}
    });
    
    // Config file
    var config;
    var dioExists = grunt.file.exists(process.cwd() + '/divshot.json');
    var ssExists = grunt.file.exists(process.cwd() + '/superstatic.json');
    
    if (!dioExists && !ssExists) {
      grunt.file.write(process.cwd() + '/divshot.json', JSON.stringify({
        root: options.root,
        clean_urls: options.clean_urls,
        routes: options.routes,
        cache_control: options.cache_control,
        error_page: options.error_page
      }, null, 2));
      
      dioExists = true;
    }
    
    if (dioExists) config = grunt.file.readJSON(process.cwd() + '/divshot.json');
    if (ssExists) config = grunt.file.readJSON(process.cwd() + '/superstatic.json');
    
    // Let them know
    grunt.log.writeln();
    grunt.log.writeln('Running Divshot.io server at ' + options.hostname.bold + ':'.bold + (options.port+'').bold);
    
    // Start the server
    var server = grunt.util.spawn({
      cmd: path.resolve(__dirname, '../node_modules/.bin/superstatic'),
      args: ['--port', options.port, '--host', options.hostname],
      opts: {}
    }, function (err, result, code) {
      if (err) {
        grunt.fail.fatal(err);
        done();
      }
    });
    
    server.stdout.on('data', function () {
      process.nextTick(function () {
        if (grunt.file.exists(process.cwd() + '/divshot.json')) grunt.file.delete(process.cwd() + '/divshot.json');
      });
    });
    
    server.stderr.on('data', function (data) {
      process.stderr.write(data.toString().red);
    });
  });
};
