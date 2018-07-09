var _ = require("underscore");

module.exports = function (grunt) {
    "use strict";

    var packageFile = grunt.file.readJSON("package.json");
    var countriesJSON = grunt.file.readJSON("node_modules/country-region-data/data.json");

    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-template");


    // used for the customBuild target. This generates a custom build of CRS with the list of countries specified
    // by the user
    function getCountryList() {
        var countries = grunt.option("countries");
        if (!countries) {
            grunt.fail.fatal("Country list not passed. Example usage: `grunt customBuild --countries=Canada,United States`");
        }

        // countries may contain commas in their names. Bit ugly, but simple. This swiches out those escaped commas
        // and replaces them later
        var commaReplaced = countries.replace(/\\,/g, '{COMMA}');
        var targetCountries = _.map(commaReplaced.split(","), function (country) {
            return country.replace(/\{COMMA\}/, ',').trim();
        });

        var countryData = [];
        var foundCountryNames = [];

        var formattedData = minifyJSON(countriesJSON);
        _.each(formattedData, function (countryInfo) {
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

            // all good! Let the user know what bundle is being created, just to remove any ambiguity
        } else {
            grunt.log.writeln("");
            grunt.log.writeln("Creating bundle with following countries:");
            _.each(targetCountries, function (country) {
                grunt.log.writeln("* " + country);
            });
        }

        config.template.customBuild.options.data.__DATA__ = "\nvar _data = " + JSON.stringify(countryData);
    }


    // converts the data.json content from the country-region-data
    function minifyJSON(json) {
        var js = [];

        json.forEach(function (countryData) {
            var pairs = [];
            countryData.regions.forEach(function (info) {
                if (_.has(info, 'shortCode')) {
                    pairs.push(info.name + '~' + info.shortCode);
                } else {
                    pairs.push(info.name);
                }
            });

            var regionListStr = pairs.join('|');
            js.push([
                countryData.countryName,
                countryData.countryShortCode,
                regionListStr
            ]);
        });

        return js;
    }


    var config = {
        template: {
            generate: {
                options: {
                    data: {
                        __VERSION__: packageFile.version,
                        __DATA__: "\nvar _data = " + JSON.stringify(minifyJSON(countriesJSON))
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
        build: {}
    };


    grunt.initConfig(config);
    grunt.registerTask("default", ["template:generate", "uglify"]);
    grunt.registerTask("generate", ["template:generate", "uglify"]);
    grunt.registerTask("customBuild", ["build", "template:customBuild", "uglify"]);
    grunt.registerTask("build", getCountryList);
};
