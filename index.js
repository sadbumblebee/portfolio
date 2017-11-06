// #################
// ###  Plugins  ###
// #################
const Metalsmith  = require('metalsmith');
const markdown    = require('metalsmith-markdown');
const layouts     = require('metalsmith-layouts');
const permalinks  = require('metalsmith-permalinks');
const sass        = require('metalsmith-sass');
const watch       = require('metalsmith-watch');
const serve       = require('metalsmith-serve');

// #################
// ###  Options  ###
// #################
const layoutsOptions = {
  engine: 'handlebars',
  partials: 'layouts/partials',
  rename: true
}
// #################
// ###   Build   ###
// #################
Metalsmith(__dirname)
  .metadata({
    title: "sadbumblebee",
    description: "sadbumblebee",
    generator: "Metalsmith",
    url: "http://www.metalsmith.io/"
  })
  .source('./src')
  .destination('./docs')
  .clean(false)
  .use(markdown())
  .use(permalinks())

  .use(sass({
    outputDir: 'css/'   // This changes the output dir to "build/css/" instead of "build/scss/"
  }))
  .use(layouts(layoutsOptions))
  .use(serve())
  .use(watch({
    paths: {
      '${source}/**/*': true,
      'layouts/**/*': '**/*.md'
    },
    livereload: true,
    })
  )
  .build(function(err, files) {
    if (err) { throw err; }
  });
