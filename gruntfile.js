module.exports = function(grunt) {
	"use strict";

  var fs = require("fs");
  var _ = require("underscore");

  var packageFile = grunt.file.readJSON("package.json");
  var countriesJSON = grunt.file.readJSON("source/data.json");

	grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-template");


  // used for the customBuild target. This generates a custom build of CRS with the list of countries specified
  // by the user
  function getCountryList () {
    var countries = grunt.option("countries");
    if (!countries) {
      grunt.fail.fatal("Country list not passed. Example usage: `grunt customBuild --countries=Canada,United States`");
    }

    var targetCountries = countries.split(",");

    var countryData = [];
    var foundCountryNames = [];
    _.each(countriesJSON.data, function (countryInfo) {
      var countryName = countryInfo[0];
      if (_.contains(targetCountries, countryName)) {
        countryData.push(countryInfo);
        foundCountryNames.push(countryName);
      }
    });

    // if one or more of the countries wasn't found, they probably made a typo: throw a warning but continue
    if (targetCountries.length !== countryData.length) {
      grunt.log.error("The following countries weren't found (check the source/data.json file to ensure you entered the exact country string):");
      var missing = _.difference(targetCountries, foundCountryNames);
      _.each(missing, function (countryName) {
        grunt.log.error("--", countryName);
      });
    }

    config.template.customBuild.options.data.__DATA__ = "\nvar _data = " + JSON.stringify(countryData)
  }


	var config = {
    template: {
      generate: {
        options: {
          data: {
            __VERSION__: packageFile.version,
            __DATA__: "\nvar _data = " + JSON.stringify(countriesJSON.data)
          }
        },
        files: {
          "dist/crs.js": ["source/source-crs.js"],
          "dist/jquery.crs.js": ["source/source-jquery.crs.js"]
        }
      },

      customBuild: {
        options: {
          data: {
            __VERSION__: packageFile.version,
            __DATA__: ""  // populated dynamically
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
		},
    build: {
    }
	};


	grunt.initConfig(config);
	grunt.registerTask("default", ["template:generate", "uglify"]);
	grunt.registerTask("generate", ["template:generate", "uglify"]);
  grunt.registerTask("customBuild", ["build", "template:customBuild", "uglify"]);
  grunt.registerTask("build", getCountryList);
};
