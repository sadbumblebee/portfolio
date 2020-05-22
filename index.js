// #################
// ###  Plugins  ###
// #################
const fsExtra = require('fs-extra');

// RSS feed
const RSS_URL = 'https://cms.qz.com/feed/author/dwolfeqz/'

// Local content
var content = JSON.parse(
  fsExtra.readFileSync(__dirname + '/src/content.json')
)

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
// Available in pug as the object: locals
  .metadata({
    title: "Daniel Wolfe, data journalist",
    description: "Hey there metadata, nice to be a little preview text here. Whether this little thumb is in Slack or Twitter, I\'m happy to be here 👋.",
    thumb: 'assets/sadbumblebee-social.png',
    generator: "Metalsmith",
    url: "https://www.sadbumblebee.com/",
    content: content
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
    ],
    'browserifyOptions': {
      'debug': true
    }
  }))
  .use(serve())
  .build(function (err, files) {
    if (err) { throw err; }
  });
