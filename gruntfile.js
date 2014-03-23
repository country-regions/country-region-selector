module.exports = function(grunt) {
	"use strict";

	// load what we need
	grunt.loadNpmTasks('grunt-template');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	var config = {

	};

	grunt.initConfig(config);
	grunt.registerTask('default', ['uglify']);
	grunt.registerTask('generate', ['uglify']);
};