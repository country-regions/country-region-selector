/**
 * country-region-selector
 * -----------------------
 * <%=__VERSION__%>
 * @author Ben Keen
 * @repo https://github.com/benkeen/country-region-selector
 * @licence MIT
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module
        define([], factory);
    } else if (typeof exports === 'object') {
        // Add try/catch for CommonJS-like environments that support module.exports
        try {
            module.exports = factory(require());
        } catch (err) {
            module.exports = factory();
        }
    } else {
        // browser globals (root is window)
        root.crs = factory(root);
    }
}(this, function () {

    "use strict";

    var _countryClass = "crs-country";
    var _defaultCountryStr = "Select country";
    var _defaultRegionStr = "Select region";
    var _showEmptyCountryOption = true;
    var _showEmptyRegionOption = true;
    var _countries = [];

    // included during grunt build step (run `grunt generate` on the command line)
    //<%=__DATA__%>

    var _init = function () {
        $("." + _countryClass).each(_populateCountryFields);
    };

    var _populateCountryFields = function () {
        var countryElement = this;

        // ensure the dropdown only gets initialized once
        var loaded = countryElement.getAttribute("data-crs-loaded");
        if (loaded === "true") {
            return;
        }

        countryElement.length = 0;
        var customOptionStr = $(countryElement).attr("data-default-option");
        var defaultOptionStr = customOptionStr ? customOptionStr : _defaultCountryStr;
        var showEmptyOption = countryElement.getAttribute("data-show-default-option");
        _showEmptyCountryOption = (showEmptyOption === null) ? true : (showEmptyOption === "true");

        var defaultSelectedValue = $(countryElement).attr("data-default-value");
        var customValue = $(countryElement).attr("data-value");
        var foundIndex = 0;

        if (_showEmptyCountryOption) {
            this.options[0] = new Option(defaultOptionStr, '');
        }
        _initDataSet({
            whitelist: countryElement.getAttribute("data-whitelist"),
            blacklist: countryElement.getAttribute("data-blacklist"),
            preferred: countryElement.getAttribute("data-preferred"),
            preferredDelim: countryElement.getAttribute("data-preferred-delim")
        });

        for (var i = 0; i < _countries.length; i++) {
            var val = (customValue == "shortcode" || customValue === "2-char") ? _countries[i][1] : _countries[i][0];
            if (_countries[i][4]) {
                val = "";
            }
            countryElement.options[countryElement.length] = new Option(_countries[i][0], val);

            if (defaultSelectedValue != null && defaultSelectedValue === val) {
                foundIndex = i;
                if (_showEmptyCountryOption) {
                    foundIndex++;
                }
            }
        }
        this.selectedIndex = foundIndex;

        var regionID = $(countryElement).attr("data-region-id");
        if (!regionID) {
            console.error("Missing data-region-id on country-region-selector country field.");
            return;
        }

        var regionElement = $("#" + regionID)[0];
        if (regionElement) {
            _initRegionField(regionElement);

            $(this).on("change", function () {
                _populateRegionFields(countryElement, regionElement);
            });

            // if the country dropdown has a default value, populate the region field as well
            if (defaultSelectedValue && countryElement.selectedIndex > 0) {
                _populateRegionFields(countryElement, regionElement);

                var defaultRegionSelectedValue = $(regionElement).attr("data-default-value");

                var useShortcode = (regionElement.getAttribute("data-value") === "shortcode");
                if (defaultRegionSelectedValue !== null) {
                    var index = (_showEmptyCountryOption) ? countryElement.selectedIndex - 1 : countryElement.selectedIndex;
                    var data = _countries[index][3];
                    _setDefaultRegionValue(regionElement, data, defaultRegionSelectedValue, useShortcode);
                }
            } else if (_showEmptyCountryOption === false) {
                _populateRegionFields(countryElement, regionElement);
            }
        } else {
            console.error("Region dropdown DOM node with ID " + regionID + " not found.");
        }

        countryElement.setAttribute("data-crs-loaded", "true");
    };

    var _initRegionField = function (el) {
        var customOptionStr = $(el).attr("data-blank-option");
        var defaultOptionStr = customOptionStr ? customOptionStr : "-";
        var showEmptyOption = el.getAttribute("data-show-default-option");
        _showEmptyRegionOption = (showEmptyOption === null) ? true : (showEmptyOption === "true");

        el.length = 0;
        if (_showEmptyRegionOption) {
            el.options[0] = new Option(defaultOptionStr, "");
            el.selectedIndex = 0;
        }
    };

    // called on country field initialization. It reduces the subset of countries depending on whether the user
    // specified a white/blacklist and parses the region list to extract the
    var _initDataSet = function (params) {
        var countries = _data;
        var subset = [], i = 0;
        if (params.whitelist) {
            var whitelist = params.whitelist.split(",");
            for (i = 0; i < _data.length; i++) {
                if (whitelist.indexOf(_data[i][1]) !== -1) {
                    subset.push(_data[i]);
                }
            }
            countries = subset;
        } else if (params.blacklist) {
            var blacklist = params.blacklist.split(",");
            for (i = 0; i < _data.length; i++) {
                if (blacklist.indexOf(_data[i][1]) === -1) {
                    subset.push(_data[i]);
                }
            }
            countries = subset;
        }

        if (params.preferred) {
            countries = _applyPreferredCountries(countries, params.preferred, params.preferredDelim);
        }

        _countries = countries;

        // now init the regions
        _initRegions();
    };

    var _initRegions = function () {
        for (var i = 0; i < _countries.length; i++) {
            var regionData = {
                hasShortcodes: /~/.test(_countries[i][2]),
                regions: []
            };
            var regions = _countries[i][2].split("|");
            for (var j = 0; j < regions.length; j++) {
                var parts = regions[j].split("~");
                regionData.regions.push([parts[0], parts[1]]); // 2nd index will be undefined for regions that don't have shortcodes
            }
            _countries[i][3] = regionData;
        }
    };

    var _setDefaultRegionValue = function (field, data, val, useShortcode) {
        for (var i = 0; i < data.regions.length; i++) {
            var currVal = (useShortcode && data.hasShortcodes && data.regions[i][1]) ? data.regions[i][1] : data.regions[i][0];
            if (currVal === val) {
                field.selectedIndex = (_showEmptyRegionOption) ? i + 1 : i;
                break;
            }
        }
    };

    var _populateRegionFields = function (countryElement, regionElement) {
        var selectedCountryIndex = (_showEmptyCountryOption) ? countryElement.selectedIndex - 1 : countryElement.selectedIndex;
        var customOptionStr = $(regionElement).attr("data-default-option");
        var displayType = regionElement.getAttribute("data-value");
        var defaultOptionStr = customOptionStr ? customOptionStr : _defaultRegionStr;

        if (countryElement.value === "") {
            _initRegionField(regionElement);
        } else {
            regionElement.length = 0;
            if (_showEmptyRegionOption) {
                regionElement.options[0] = new Option(defaultOptionStr, '');
            }
            var regionData = _countries[selectedCountryIndex][3];

            var weWantAndHaveShortCodes = displayType === 'shortcode' && regionData.hasShortcodes;
            var indexToSort = weWantAndHaveShortCodes ? 1 : 0;
            regionData.regions.sort(function(a, b) {
                var x = a[indexToSort].toLowerCase();
                var y = b[indexToSort].toLowerCase();
                return x < y ? -1 : x > y ? 1 : 0;
            });

            for (var i = 0; i < regionData.regions.length; i++) {
                var val = weWantAndHaveShortCodes ? regionData.regions[i][1] : regionData.regions[i][0];
                regionElement.options[regionElement.length] = new Option(regionData.regions[i][0], val);
            }

            regionElement.selectedIndex = 0;
        }
    };


    // in 0.5.0 we added the option for "preferred" countries that get listed first. This just causes the preferred
    // countries to get listed at the top of the list with an optional delimiter row following them
    var _applyPreferredCountries = function (countries, preferred, preferredDelim) {
        var preferredShortCodes = preferred.split(',').reverse();
        var preferredMap = {};
        var foundPreferred = false;

        var updatedCountries = countries.filter(function (c) {
            if (preferredShortCodes.indexOf(c[1]) !== -1) {
                preferredMap[c[1]] = c;
                foundPreferred = true;
                return false;
            }
            return true;
        });

        if (foundPreferred && preferredDelim) {
            updatedCountries.unshift([preferredDelim, "", "", {}, true]);
        }

        // now prepend the preferred countries
        for (var i=0; i<preferredShortCodes.length; i++) {
            var code = preferredShortCodes[i];
            updatedCountries.unshift(preferredMap[code]);
        }

        return updatedCountries;
    };


    $(_init);

    return {
        init: _init
    };

}));
