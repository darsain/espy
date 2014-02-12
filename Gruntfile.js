/*jshint node:true */
/*global module */
module.exports = function(grunt) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('component.json'),
		meta: {
			banner: '/*!\n' +
				' * <%= pkg.name %> <%= pkg.version %> - <%= grunt.template.today("dS mmm yyyy") %>\n' +
				' * <%= pkg.homepage %>\n' +
				' *\n' +
				' * Licensed under the <%= pkg.licenses[0].type %> license.\n' +
				' * <%= pkg.licenses[0].url %>\n' +
				' */\n\n',
			bannerLight: '/*! <%= pkg.name %> <%= pkg.version %>' +
				' - <%= grunt.template.today("dS mmm yyyy") %> | <%= pkg.homepage %> */'
		},
		jshint: {
			options: grunt.file.readJSON('.jshintrc'),
			gruntfile: {
				src: ['Gruntfile.js']
			},
			app: {
				src: ['src/espy.js']
			}
		},
		concat: {
			options: {
				banner: '<%= meta.banner %>'
			},
			dist: {
				src: [
					'src/espy.js'
				],
				dest: 'dist/jquery.espy.js'
			}
		},
		gcc: {
			dist: {
				options: {
					banner: '<%= meta.bannerLight %>'
				},
				src: 'src/espy.js',
				dest: 'dist/jquery.espy.min.js'
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-gcc');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Defined tasks
	grunt.registerTask('default', 'jshint');
	grunt.registerTask('release', ['jshint', 'concat', 'gcc']);
};