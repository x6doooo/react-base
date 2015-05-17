var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var reactify = require('reactify');
var watchify = require('watchify');
var del = require('del');
var source = require('vinyl-source-stream');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license']
});

var options = {
    src: 'app',
    tmp: '.tmp',
    dist: 'dist',
    browserify: {
        debug: true,
        bundleConfigs: [{
            entries: 'app/scripts/app.js',
            outputName: 'app.js'
        }]
    },
    errorHandler: function (title) {
        return function (err) {
            gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
            this.emit('end');
        };
    }
};

gulp.task('scripts', function (callback) {

    browserSync.notify('Compiling JavaScript');

    var bundleQueue = options.browserify.bundleConfigs.length;

    var browserifyThis = function (bundleConfig) {

        var bundler = browserify({
            cache: {}, packageCache: {}, fullPaths: false,
            entries: bundleConfig.entries,
            debug: true//config.debug
        });

        var bundle = function () {
            return bundler
                .bundle()
                .on('error', $.util.log.bind($.util, 'Browserify Error'))
                .pipe(source(bundleConfig.outputName))
                .pipe(gulp.dest(options.tmp + '/scripts'))
                .on('end', reportFinished);
        };

        //bundler = watchify(bundler);
        //bundler.on('update', bundle);

        var reportFinished = function () {

            if (bundleQueue) {
                bundleQueue--;
                if (bundleQueue === 0) {
                    //reload();
                    callback();
                }
            }
        };

        return bundle();
    };

    options.browserify.bundleConfigs.forEach(browserifyThis);
});

gulp.task('jade', function () {
    return gulp.src(options.src + '/**/*.jade')
        .pipe($.jade({
            pretty: true
        }))
        .pipe(gulp.dest(options.tmp))
});

gulp.task('sass', function () {
    var sassOptions = {
        style: 'expanded'
    };
    return gulp.src([options.src + '/styles/*.sass', options.src + '/styles/*.scss'])
        .pipe($.sourcemaps.init())
        .pipe($.sass(sassOptions)).on('error', options.errorHandler('Sass'))
        .pipe($.autoprefixer()).on('error', options.errorHandler('Autoprefixer'))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(options.tmp + '/styles/'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('copy', function() {
    return gulp.src([
            options.src + '/**/*',
            '!' + options.src + '/scripts',
            '!' + options.src + '/styles',
            '!' + options.src + '/*.jade'
        ])
        .pipe(gulp.dest(options.tmp));
});

gulp.task('extras', function () {
    return gulp.src(['app/*.txt', 'app/*.ico'])
        .pipe(gulp.dest(options.dist))
        .pipe($.size());
});

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

gulp.task('json', function () {
    gulp.src('app/json/**/*.json')
        .pipe(gulp.dest('dist/json'));
});

gulp.task('fonts', function () {
    return gulp.src(require('main-bower-files')({
        filter: '**/*.{eot,svg,ttf,woff,woff2}'
    }).concat('app/fonts/**/*'))
        .pipe(gulp.dest('dist/fonts'));
});


gulp.task('watch', ['clean', 'copy', 'jade', 'sass', 'scripts'], function() {
    browserSync({
        notify: false,
        logPrefix: 'BS',
        // https: true,
        //browser: 'safari',
        server: [options.tmp]
    });
    gulp.watch('app/scripts/**/*.js', ['scripts', reload]);
    gulp.watch('app/*.jade', ['jade', reload]);
    gulp.watch(['app/styles/**/*.scss', 'app/styles/**/*.css', 'app/styles/**/*.sass'], ['styles', reload]);
});

gulp.task('clean', function (cb) {
    $.cache.clearAll();
    cb(del.sync([options.tmp, options.dist]));
});

//gulp.task('cssmin', ['sass'], function() {
//});

gulp.task('build', ['clean', 'copy', 'jade', 'sass', 'scripts', 'fonts', 'json', 'images', 'extras'], function() {

    var htmlFilter = $.filter('*.html');
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src(options.tmp + '/*.html')
        .pipe($.useref.assets())
        .pipe(jsFilter)
        .pipe($.uglify({preserveComments: $.uglifySaveLicense})).on('error', options.errorHandler('Uglify'))
        //.pipe($.stripDebug())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(htmlFilter)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true,
            conditionals: true
        }))
        .pipe($.rename(function(p){
            //console.log(p)
            if (p.extname === '.html') {
                p.extname = '.tpl'
            }
        }))
        .pipe(htmlFilter.restore())
        .pipe(gulp.dest(options.dist));
});
