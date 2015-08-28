/**
 * country-region-selector
 * -----------------------
 * <%=__VERSION__%>
 * @author Ben Keen
 * @repo https://github.com/benkeen/country-region-selector
 * @licence MIT
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but only CommonJS-like environments that support module.exports,
    // like Node
    module.exports = factory(require());
  } else {
    // browser globals (root is window)
    root.crs = factory(root);
  }
}(this, function() {

	"use strict";

	var _countryClass = "crs-country";
	var _defaultCountryStr = "Select country";
	var _defaultRegionStr = "Select region";
  var _showEmptyCountryOption = true;
  var _showEmptyRegionOption = true;

	// included during grunt build step (run `grunt generate` on the command line)
  //<%=__DATA__%>

	var _init = function() {
		var countryDropdowns = document.getElementsByClassName(_countryClass);
		for (var i=0; i<countryDropdowns.length; i++) {
			_populateCountryFields(countryDropdowns[i]);
		}
	};


	var _populateCountryFields = function(countryElement) {

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
		for (var i=0; i<_data.length; i++) {
			var val = (customValue === "2-char") ? _data[i][1] : _data[i][0];
			countryElement.options[countryElement.length] = new Option(_data[i][0], val);

			if (defaultSelectedValue != null && defaultSelectedValue === val) {
        foundIndex = i;
        if (_showEmptyCountryOption) {
          foundIndex++;
        }
			}
		}
		countryElement.selectedIndex = foundIndex;

		var regionID = countryElement.getAttribute("data-region-id");
		if (regionID) {
			var regionElement = document.getElementById(regionID);
			if (regionElement) {
				_initRegionField(regionElement);

				countryElement.onchange = function() {
					_populateRegionFields(countryElement, regionElement);
				};

				// if the country dropdown has a default value, populate the region field as well
				if (defaultSelectedValue !== null) {
					_populateRegionFields(countryElement, regionElement);

					var defaultRegionSelectedValue = regionElement.getAttribute("data-default-value");
					if (defaultRegionSelectedValue !== null) {
						var data = _data[countryElement.selectedIndex-1][2].split("|");
						_setDefaultRegionValue(regionElement, data, defaultRegionSelectedValue);
					}
				} else if (_showEmptyCountryOption === false) {
          _populateRegionFields(countryElement, regionElement);
        }
			} else {
				console.error("Region dropdown DOM node with ID " + regionID + " not found.");
			}
		}

    countryElement.setAttribute("data-crs-loaded", "true");
	};

	var _initRegionField = function(el) {
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

	var _setDefaultRegionValue = function(field, data, val) {
		for (var i=0; i<data.length; i++) {
			if (data[i] === val) {
				field.selectedIndex = i+1;
				break;
			}
		}
	};

	var _populateRegionFields = function(countryElement, regionElement) {
		var selectedCountryIndex = (_showEmptyCountryOption) ? countryElement.selectedIndex - 1 : countryElement.selectedIndex;
		var customOptionStr = regionElement.getAttribute("data-default-option");
		var defaultOptionStr = customOptionStr ? customOptionStr : _defaultRegionStr;

		if (countryElement.value === "") {
			_initRegionField(regionElement);
		} else {
			regionElement.length = 0;
      if (_showEmptyRegionOption) {
        regionElement.options[0] = new Option(defaultOptionStr, '');
      }
			var regions = _data[selectedCountryIndex][2].split("|");
			for (var i=0; i<regions.length; i++) {
				regionElement.options[regionElement.length] = new Option(regions[i], regions[i]);
			}
			regionElement.selectedIndex = 0;
		}
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
	var _contentLoaded = function(win, fn) {
		var done = false, top = true,

			doc = win.document, root = doc.documentElement,

			add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
			rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
			pre = doc.addEventListener ? '' : 'on',

			init = function(e) {
				if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
				(e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
				if (!done && (done = true)) fn.call(win, e.type || e);
			},

			poll = function() {
				try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
				init('poll');
			};

		if (doc.readyState == 'complete') fn.call(win, 'lazy');
		else {
			if (doc.createEventObject && root.doScroll) {
				try { top = !win.frameElement; } catch(e) { }
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
