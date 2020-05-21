// #################
// ###  Plugins  ###
// #################
const fsExtra = require('fs-extra');

// Metalsmith
var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var permalinks = require('metalsmith-permalinks');
var pug = require('metalsmith-pug');
var ignore = require('metalsmith-ignore');
var stylus = require('metalsmith-stylus');
var serve = require('metalsmith-serve');
var browserSync = require('metalsmith-browser-sync');
var browserify = require('metalsmith-browserify')

// #################
// ###   Build   ###
// #################
Metalsmith(__dirname)
  .metadata({
    title: "sadbumblebee",
    description: "sadbumblebee",
    generator: "Metalsmith",
    url: "https://www.sadbumblebee.com/"
  })
  .source('./src')
  .destination('./docs')
  .clean(false)
  .use(markdown())
  .use(permalinks())
  .use(ignore([
    'includes/*',
    'css/import/*'
  ]))
  .use(pug({ useMetadata: true }))
  .use(stylus({
    master: 'site.styl',
    output: 'site.css',
    outputDir: '.'
  }))
  .use(browserSync({
    server: 'docs',
    files: ['src/**/*']
  }))
  .use(browserify({
    'entries': [
      'js/app.js',
      'js/portfolio.js'
    ]
  }))
  .use(serve())
  .build(function (err, files) {
    if (err) { throw err; }
  });
