// #################
// ###  Plugins  ###
// #################
const Metalsmith  = require('metalsmith');
const markdown    = require('metalsmith-markdown');
const layouts     = require('metalsmith-layouts');
const permalinks  = require('metalsmith-permalinks');
const less        = require('metalsmith-less');
const watch       = require('metalsmith-watch');
const serve       = require('metalsmith-serve');

// #################
// ###  Options  ###
// #################
const layoutsOptions = {
  engine: 'handlebars',
  partials: 'layouts/partials',
  rename: true
};

const lessOptions = {
  pattern: ['**/milligram.less']
};

// #################
// ###   Build   ###
// #################
Metalsmith(__dirname)
  .metadata({
    title: "Hot Chicks, Down to Lay",
    description: "Watch these little chickens run wild.",
    generator: "Metalsmith",
    url: "http://www.metalsmith.io/"
  })
  .source('./src')
  .destination('./docs')
  .clean(false)
  .use(markdown())
  .use(permalinks())
  .use(less(lessOptions))
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
