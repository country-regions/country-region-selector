module.exports = function(grunt) {
	"use strict";

	// load what we need
	grunt.loadNpmTasks('grunt-template');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	var config = {
		uglify: {
			standalone: {
				files: {
					'source/country-region-selector.min.js': 'source/country-region-selector.js'
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