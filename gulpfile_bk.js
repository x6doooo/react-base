'use strict';

var gulp = require('gulp');
var del = require('del');


var path = require('path');


var config = {
    browserify: {
        // Enable source maps
        debug: true,
        // Additional file extensions to make optional
        extensions: ['.coffee', '.hbs'],
        // A separate bundle will be generated for each
        // bundle config in the list below
        bundleConfigs: [{
            entries: './' + srcAssets + '/javascripts/application.js',
            dest: developmentAssets + '/js',
            outputName: 'application.js'
        }, {
            entries: './' + srcAssets + '/javascripts/head.js',
            dest: developmentAssets + '/js',
            outputName: 'head.js'
        }]
    }
};

/**
 * Run JavaScript through Browserify
 */
gulp.task('scripts', function (callback) {

    browsersync.notify('Compiling JavaScript');

    var bundleQueue = config.bundleConfigs.length;

    var browserifyThis = function (bundleConfig) {

        var bundler = browserify({
            // Required watchify args
            cache: {}, packageCache: {}, fullPaths: false,
            // Specify the entry point of your app
            entries: bundleConfig.entries,
            // Add file extentions to make optional in your requires
            extensions: config.extensions,
            // Enable source maps!
            debug: config.debug
        });

        var bundle = function () {
            // Log when bundling starts
            bundleLogger.start(bundleConfig.outputName);

            return bundler
                .bundle()
                // Report compile errors
                .on('error', handleErrors)
                // Use vinyl-source-stream to make the
                // stream gulp compatible. Specifiy the
                // desired output filename here.
                .pipe(source(bundleConfig.outputName))
                // Specify the output destination
                .pipe(gulp.dest(bundleConfig.dest))
                .on('end', reportFinished);
        };

        if (global.isWatching) {
            // Wrap with watchify and rebundle on changes
            bundler = watchify(bundler);
            // Rebundle on update
            bundler.on('update', bundle);
        }

        var reportFinished = function () {
            // Log when bundling completes
            bundleLogger.end(bundleConfig.outputName)

            if (bundleQueue) {
                bundleQueue--;
                if (bundleQueue === 0) {
                    // If queue is empty, tell gulp the task is complete.
                    // https://github.com/gulpjs/gulp/blob/master/docs/API.md#accept-a-callback
                    callback();
                }
            }
        };

        return bundle();
    };

    // Start bundling with Browserify for each bundleConfig specified
    config.bundleConfigs.forEach(browserifyThis);
});


// Load plugins
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream'),

    sourceFile = './app/scripts/*.js',

    destFolder = './dist/scripts',
    destFileName = 'app.js';

var browserSync = require('browser-sync');
var reload = browserSync.reload;

// Styles
gulp.task('styles', ['sass']);

gulp.task('sass', function () {
    return gulp.src(['app/styles/**/*.sass', 'app/styles/**/*.css'])
        .pipe($.rubySass({
            style: 'expanded',
            precision: 10,
            loadPath: ['app/bower_components']
        }))
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('dist/styles'))
        .pipe($.size());
});

/*

 var bundler = watchify(browserify({
 entries: [sourceFile],
 debug: true,
 insertGlobals: true,
 cache: {},
 packageCache: {},
 fullPaths: true
 }));

 bundler.on('update', rebundle);
 bundler.on('log', $.util.log);

 function rebundle() {
 return bundler.bundle()
 // log errors if they happen
 .on('error', $.util.log.bind($.util, 'Browserify Error'))
 .pipe(source(destFileName))
 .pipe(gulp.dest(destFolder))
 .on('end', function() {
 reload();
 });
 }

 // Scripts
 gulp.task('scripts', rebundle);

 gulp.task('buildScripts', function() {
 return browserify(sourceFile)
 .bundle()
 .pipe(source(destFileName))
 .pipe(gulp.dest('dist/scripts'));
 });




 gulp.task('jade', function() {
 return gulp.src('app/template/*.jade')
 .pipe($.jade({
 pretty: true
 }))
 .pipe(gulp.dest('dist'));
 })



 // HTML
 gulp.task('html', function() {
 return gulp.src('app/*.html')
 .pipe($.useref())
 .pipe(gulp.dest('dist'))
 .pipe($.size());
 });
 */
// Images
gulp.task('images', function () {
    return gulp.src('app/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe($.size());
});

// Fonts
gulp.task('fonts', function () {
    return gulp.src(require('main-bower-files')({
        filter: '**/*.{eot,svg,ttf,woff,woff2}'
    }).concat('app/fonts/**/*'))
        .pipe(gulp.dest('dist/fonts'));
});

// Clean
gulp.task('clean', function (cb) {
    $.cache.clearAll();
    cb(del.sync(['dist/styles', 'dist/scripts', 'dist/images']));
});

// Bundle
gulp.task('bundle', ['styles', 'scripts', 'bower'], function () {
    return gulp.src('./app/*.html')
        .pipe($.useref.assets())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'));
});

gulp.task('buildBundle', ['styles', 'buildScripts', 'bower'], function () {
    return gulp.src('./app/*.html')
        .pipe($.useref.assets())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('dist'));
});

// Bower helper
gulp.task('bower', function () {
    gulp.src('app/bower_components/**/*.js', {
        base: 'app/bower_components'
    })
        .pipe(gulp.dest('dist/bower_components/'));

});

gulp.task('json', function () {
    gulp.src('app/scripts/json/**/*.json', {
        base: 'app/scripts'
    })
        .pipe(gulp.dest('dist/scripts/'));
});

// Robots.txt and favicon.ico
gulp.task('extras', function () {
    return gulp.src(['app/*.txt', 'app/*.ico'])
        .pipe(gulp.dest(options.tmp))
        .pipe($.size());
});

// Watch
gulp.task('watch', ['html', 'fonts', 'bundle'], function () {

    browserSync({
        notify: false,
        logPrefix: 'BS',
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: ['dist', 'app']
    });

    // Watch .json files
    gulp.watch('app/scripts/**/*.json', ['json']);

    // Watch .html files
    gulp.watch('app/*.html', ['html']);

    gulp.watch(['app/styles/**/*.scss', 'app/styles/**/*.css'], ['styles', reload]);


    // Watch .jade files
    gulp.watch('app/template/**/*.jade', ['jade', 'html', reload]);


    // Watch image files
    gulp.watch('app/images/**/*', reload);
});

// Build
gulp.task('build', ['html', 'buildBundle', 'images', 'fonts', 'extras'], function () {
    gulp.src('dist/scripts/app.js')
        .pipe($.uglify())
        .pipe($.stripDebug())
        .pipe(gulp.dest('dist/scripts'));
});

// Default task
gulp.task('default', ['clean', 'build', 'jest']);
