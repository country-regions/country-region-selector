module.exports = function(grunt) {
	"use strict";

	// load what we need
	grunt.loadNpmTasks('grunt-contrib-uglify');

	var config = {
		uglify: {
			standalone: {
				files: {
					'source/crs.min.js': 'source/crs.js',
					'source/jquery.crs.min.js': 'source/jquery.crs.js'
				},
				options: {
					report: "min",
					compress: true
				}
			}
		}
	};

	grunt.initConfig(config);
	grunt.registerTask('default', ['uglify']);
	grunt.registerTask('generate', ['uglify']);
};