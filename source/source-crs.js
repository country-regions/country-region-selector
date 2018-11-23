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
    var _memoizedIndexes = {};

    // included during grunt build step (run `grunt generate` on the command line)
    //<%=__DATA__%>

    var _init = function () {
        _countries = _data;

        var countryDropdowns = document.getElementsByClassName(_countryClass);
        for (var i = 0; i < countryDropdowns.length; i++) {
            _populateCountryFields(countryDropdowns[i]);
        }
    };


    var _populateCountryFields = function (countryElement) {

        // ensure the dropdown only gets initialized once
        var loaded = countryElement.getAttribute("data-crs-loaded");
        if (loaded === "true") {
            return;
        }

        countryElement.length = 0;
        var customOptionStr = countryElement.getAttribute("data-default-option");
        var defaultOptionStr = customOptionStr ? customOptionStr : _defaultCountryStr;
        var showEmptyOption = countryElement.getAttribute("data-show-default-option");
        _showEmptyCountryOption = (showEmptyOption === null) ? true : (showEmptyOption === "true");

        var defaultSelectedValue = countryElement.getAttribute("data-default-value");
        var customValue = countryElement.getAttribute("data-value");
        var foundIndex = 0;

        if (_showEmptyCountryOption) {
            countryElement.options[0] = new Option(defaultOptionStr, '');
        }

        // parses the region data into a more manageable format
        _initRegions();

        var countries = _getCountries(countryElement);

        for (var i = 0; i < countries.length; i++) {
            var val = (customValue === "shortcode" || customValue === "2-char") ? countries[i][1] : countries[i][0];

            // workaround to allow the preferred countries delimiter have an empty value
            if (countries[i][4]) {
                val = "";
            }
            countryElement.options[countryElement.length] = new Option(countries[i][0], val);

            if (defaultSelectedValue != null && defaultSelectedValue === val) {
                foundIndex = i;
                if (_showEmptyCountryOption) {
                    foundIndex++;
                }
            }
        }
        countryElement.selectedIndex = foundIndex;

        var regionID = countryElement.getAttribute("data-region-id");
        if (!regionID) {
            console.error("Missing data-region-id on country-region-selector country field.");
            return;
        }

        var regionElement = document.getElementById(regionID);
        if (regionElement) {
            _initRegionField(regionElement);

            countryElement.onchange = function () {
                _populateRegionFields(countryElement, regionElement);
            };

            // if the country dropdown has a default value, populate the region field as well
            if (defaultSelectedValue !== null && countryElement.selectedIndex > 0) {
                _populateRegionFields(countryElement, regionElement);

                var defaultRegionSelectedValue = regionElement.getAttribute("data-default-value");
                var useShortcode = (regionElement.getAttribute("data-value") === "shortcode");
                if (defaultRegionSelectedValue !== null) {
                    var index = (_showEmptyCountryOption) ? countryElement.selectedIndex - 1 : countryElement.selectedIndex;
                    var data = countries[index][3];
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
        var customOptionStr = el.getAttribute("data-blank-option");
        var defaultOptionStr = customOptionStr ? customOptionStr : "-";
        var showEmptyOption = el.getAttribute("data-show-default-option");
        _showEmptyRegionOption = (showEmptyOption === null) ? true : (showEmptyOption === "true");

        el.length = 0;
        if (_showEmptyRegionOption) {
            el.options[0] = new Option(defaultOptionStr, "");
            el.selectedIndex = 0;
        }
    };

    // called for every component instantiation. Before, this used to construct _countries with the appropriate list
    // based on whitelist/blacklist, but that causes problems when there are multiple fields some with/without
    // black/whitelists. Instead, this just memoizes the whitelist/blacklist for quick lookup
    var _getCountrySubset = function (params) {
        var key = params.whitelist + "|" + params.blacklist;
        var i = 0;

        if (!_memoizedIndexes.hasOwnProperty(key)) {
            _memoizedIndexes[key] = [];
            if (params.whitelist) {
                var whitelist = params.whitelist.split(",");
                for (i = 0; i < _data.length; i++) {
                    if (whitelist.indexOf(_data[i][1]) !== -1) {
                        _memoizedIndexes[key].push(i);
                    }
                }
            } else if (params.blacklist) {
                var blacklist = params.blacklist.split(",");
                for (i = 0; i < _data.length; i++) {
                    if (blacklist.indexOf(_data[i][1]) === -1) {
                        _memoizedIndexes[key].push(i);
                    }
                }
            }
        }

        // now return the data in the memoized indexes
        var countries = [];
        for (i = 0; i < _memoizedIndexes[key].length; i++) {
            countries.push(_data[_memoizedIndexes[key][i]]);
        }

        return countries;
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

        var customOptionStr = regionElement.getAttribute("data-default-option");
        var displayType = regionElement.getAttribute("data-value");
        var defaultOptionStr = customOptionStr ? customOptionStr : _defaultRegionStr;

        if (countryElement.value === "") {
            _initRegionField(regionElement);
        } else {
            regionElement.length = 0;
            if (_showEmptyRegionOption) {
                regionElement.options[0] = new Option(defaultOptionStr, "");
            }

            var countries = _getCountries(countryElement);
            var regionData = countries[selectedCountryIndex][3];

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

    // returns the list of countries for this instance, taking into account black- and whitelists
    var _getCountries = function (countryElement) {
        var whitelist = countryElement.getAttribute("data-whitelist");
        var blacklist = countryElement.getAttribute("data-blacklist");
        var preferred = countryElement.getAttribute("data-preferred");
        var preferredDelim = countryElement.getAttribute("data-preferred-delim");

        var countries = _countries;
        if (whitelist || blacklist) {
            countries = _getCountrySubset({
                whitelist: whitelist,
                blacklist: blacklist
            })
        }

        if (preferred) {
            countries = _applyPreferredCountries(countries, preferred, preferredDelim);
        }

        return countries;
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

    /*!
     * contentloaded.js
     *
     * Author: Diego Perini (diego.perini at gmail.com)
     * Summary: cross-browser wrapper for DOMContentLoaded
     * Updated: 20101020
     * License: MIT
     * Version: 1.2
     *
     * URL:
     * http://javascript.nwbox.com/ContentLoaded/
     * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
     *
     */

    // @win window reference
    // @fn function reference
    var _contentLoaded = function (win, fn) {
        var done = false, top = true,

            doc = win.document, root = doc.documentElement,

            add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
            rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
            pre = doc.addEventListener ? '' : 'on',

            init = function (e) {
                if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
                (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
                if (!done && (done = true)) fn.call(win, e.type || e);
            },

            poll = function () {
                try {
                    root.doScroll('left');
                } catch (e) {
                    setTimeout(poll, 50);
                    return;
                }
                init('poll');
            };

        if (doc.readyState == 'complete') fn.call(win, 'lazy');
        else {
            if (doc.createEventObject && root.doScroll) {
                try {
                    top = !win.frameElement;
                } catch (e) {
                }
                if (top) poll();
            }
            doc[add](pre + 'DOMContentLoaded', init, false);
            doc[add](pre + 'readystatechange', init, false);
            win[add](pre + 'load', init, false);
        }
    };

    // when the page has loaded, run our init function
    _contentLoaded(window, _init);

    // exposed to allow re-initialization for dynamic environments
    return {
        init: _init
    };

}));
