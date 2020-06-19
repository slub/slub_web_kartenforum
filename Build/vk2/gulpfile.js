var gulp = require('gulp');
var closureCompiler = require('gulp-closure-compiler');
var minifyCss = require('gulp-minify-css');

/**
 * Externs used by the closure compiler
 */
var closureExterns = [
	'externs/cesium-externs.js',
	'externs/glif.js',
	'externs/proj4.js',
	'externs/ol-externs.js',
	'externs/ol-cesium-externs.js',
	'externs/jquery.js',
	'externs/general.js',
	'externs/vk2x.js'
];

/**
 * Target directory for compiled files
 */
var targetDir = '../../Resources/Public/';

/**
 * Minifies the css
 */
gulp.task('minify-css', function() {
	return gulp.src('css/*.css')
		.pipe(minifyCss({compatibility: 'ie8'}))
	    .pipe(gulp.dest(targetDir + 'Css/'));
});

/**
 * Build of library with google closure compiler - simple optimization
 */
gulp.task('js-compile-simple', function() {
	return gulp.src(['vk2-require.js', 'src/**/*.js', 'lib/closure-library/closure/goog/**/*.js'])
	.pipe(closureCompiler({
		compilerPath: 'node_modules/closure-compiler/node_modules/google-closure-compiler/compiler.jar',
		fileName: targetDir + 'JavaScript/Dist/' + 'vk2.js',
		compilerFlags: {
			closure_entry_point: 'vk2.require',
			compilation_level: 'SIMPLE',
			only_closure_dependencies: true,
			generate_exports: true,
			define: [
				'goog.DEBUG=false'
			],
			externs: closureExterns,
			output_wrapper: '(function(){%output%}).call(window);',
			warning_level: 'VERBOSE'
		}
	}))
	.pipe(gulp.dest('../../Resources/Public')
	);
});


/**
 * Build of library with google closure compiler - advanced optimization (debug)
 */
gulp.task('js-compile-advanced-debug', function() {
	return gulp.src(['vk2-require.js', 'src/**/*.js', 'lib/closure-library/closure/goog/**/*.js'])
    	.pipe(closureCompiler({
    		compilerPath: 'node_modules/closure-compiler/node_modules/google-closure-compiler/compiler.jar',
    		fileName: targetDir + 'JavaScript/Dist/' + 'vk2-min-debug.js',
    		compilerFlags: {
    			closure_entry_point: 'vk2.require',
    			formatting: [
    			     'pretty_print',
    			],
    			compilation_level: 'ADVANCED_OPTIMIZATIONS',
    			only_closure_dependencies: true,
			    generate_exports: true,
    			define: [
    			    'goog.DEBUG=false'
    			],
    			externs: closureExterns,
    			output_wrapper: '(function(){%output%}).call(window);',
    			warning_level: 'VERBOSE'
    		}
    	}))
    	.pipe(gulp.dest('../../Resources/Public')
    );
});

/**
 * Build of library with google closure compiler - advanced optimization
 */
gulp.task('js-compile-advanced', function() {
	return gulp.src(['vk2-require.js', 'src/**/*.js', 'lib/closure-library/closure/goog/**/*.js'])
    	.pipe(closureCompiler({
    		compilerPath: 'node_modules/closure-compiler/node_modules/google-closure-compiler/compiler.jar',
    		fileName: targetDir + 'JavaScript/Dist/' + 'vk2-min.js',
    		compilerFlags: {
    			closure_entry_point: 'vk2.require',
    			compilation_level: 'ADVANCED_OPTIMIZATIONS',
    			only_closure_dependencies: true,
			    generate_exports: true,
    			define: [
    			    'goog.DEBUG=false'
    			],
    			externs: closureExterns,
    			output_wrapper: '(function(){%output%}).call(window);',
    			warning_level: 'VERBOSE'
    		}
    	}))
    	.pipe(gulp.dest('../../Resources/Public')
    );
});

gulp.task('default', ['minify-css', 'js-compile-advanced']);
gulp.task('builds', ['js-compile-simple', 'js-compile-advanced-debug']);
