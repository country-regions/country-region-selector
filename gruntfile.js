module.exports = function(grunt) {
	"use strict";

  var fs = require("fs");
  var packageFile = grunt.file.readJSON("package.json");

	grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-template");


	var config = {
    template: {
      generate: {
        options: {
          data: {
            __VERSION__: packageFile.version,
            __DATA__: fs.readFileSync("source/data.js", "utf8")
          }
        },
        files: {
          "dist/crs.js": ["source/source-crs.js"],
          "dist/jquery.crs.js": ["source/source-jquery.crs.js"]
        }
      }
    },
		uglify: {
			standalone: {
				files: {
					"dist/crs.min.js": "dist/crs.js",
					"dist/jquery.crs.min.js": "dist/jquery.crs.js"
				},
				options: {
					report: "min",
					compress: {},
          mangleProperties: true,
          banner: "/*!\n" +
            "* country-region-selector\n" +
            "* ------------------------\n" +
            "* " + packageFile.version + "\n" +
            "* @author Ben Keen\n" +
            "* @repo https://github.com/benkeen/country-region-selector\n" +
            "* @licence MIT\n" +
            "*/\n"
        }
			}
		}
	};

	grunt.initConfig(config);
	grunt.registerTask("default", ["template:generate", "uglify"]);
	grunt.registerTask("generate", ["template:generate", "uglify"]);
};
