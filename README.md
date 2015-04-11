## Country-Region-Selector

A common form feature is dynamic, connected country and region dropdowns, where the region field is updated to contain
whatever regions (provinces / states / territories / counties etc.) are appropriate for the selected country. It's super
easy to do this, but requires a lot of leg work tracking down the data and hooking it all up. This script lets you easily
add this feature to your form without having to write any code.

It comes in two flavours:
- [standalone script](./source/crs.min.js) (no dependencies, just plain JS) - **54KB** (minified version)
- a [jQuery-dependent version](./source/crs.min.js) (ever-so slightly smaller) - **53KB** (minified version)

The reason the files are so large is that they contain all the country and region strings.

### Features

- Lets you customize the default "Please select" field for each country/region with whatever language you want.
- Lets you specify a default value for each field.
- Lets you customize the appearance and value of the country field ("Canada" or "CA") - they can be different, if desired
(e.g. 2 char code for saving to database; full name for displaying purposes).
- Lets you have as many country-region-mapped fields as you need in your page.
- The standalone version has no dependencies on other any libs (jQuery etc) and you can include the JS file anywhere you want
(head/foot).
- Works with dynamically inserted DOM content.


### Example

Check out the following page for an example of the various ways it can be configured and used.
[http://benkeen.github.io/country-region-selector/](http://benkeen.github.io/country-region-selector/)


### How to Use

It's very easy.

1. Include the `crs.min.js` file in your webpage.
2. Add two `<select>` fields in the appropriate locations in your form.
3. Give the country field a class of `crs-country`.
4. Now we need to map each country field to its corresponding region field so the script knows what to update when
a country is selected. Add an attribute to the country dropdown: `data-region-id="ABC"` where ABC is any string. Now
Give the region dropdown an **id** of "ABC".
5. That's it! You're done.

But here's a few more tips for further configuration.

#### Default "Please select" Values

If you want to add default "Please select" options to either the country or region fields, just go ahead and add it
directly in the markup. The script will **append** the country and region `<option>` fields - not overwrite them.

#### Adding default values for each field

If your form is used for people returning to it (e.g. "Edit Contact Info" or whatever), you'll need the country and
region fields to be prefilled with the appropriate value on page load. To do that, just add a `data-default-value=""`
attribute to each element containing the country / region value last saved. Note: the region value will only ever be
populated if the country field is as well.

### List of data-* attributes

This lists all the available data-* attributes that you can add to the country/region fields to customize the appearance
and behaviour.

##### country fields

- `data-region-id` - required. This should contain the ID of the region field that it's being mapped to.
- `data-default-option` - optional. Default: "Select country". This determines the default, blank option display value.
- `data-default-value` - optional. The default selected value in the country dropdown (e.g. "Canada")
- `data-value="2-char"` - optional. The default behaviour is for the value attributes of the country dropdown options
to be the full country name. If you'd rather use a 2-char code, add this attribute. Note: the 2-char codes are **mostly**
ISO standard 2-char country codes, but not all. They are, however, unique across the dataset.

##### region fields
- `data-blank-option` - before the user selects a country, there's a single <option> displayed which by default is the
"-" character.
- `data-default-option` - optional. Default: "Select region". This determines the default, blank option display value
that shows up after a user has selected a country.
- `data-default-value` - optional. The default selected value in the region dropdown (e.g. "British Columbis")

### Working with dynamic HTML 

In case your page is being generated on the fly, you'll need to manually re-initialize the script after the new DOM 
content is inserted. 

##### AMD example

With AMD (requireJS), just include the lib as you usually would. If you inspect the return value, you'll see it has a 
single `init` function. Just call that method whenever you need it (i.e. after new DOM content is inserted into your
page).

```javascript
define(['/path/to/crs.min'], function(crs) {
    // when you're ready... 
    crs.init();
});
```
##### Plain vanilla JS example

If you're just including the crs.min.js in a `<script>` tag in your page, it'll automatically expose a `crs` property
on your global `window` object. Then you can call `window.crs.init()` whenever your new page content has been dynamically
inserted. That will initialize the newly inserted country-region fields. 


### Notes for Developers

If you want to edit the source code, go right ahead (pull requests welcome, of course!). The unminified source
is found in the `/source` folder. To re-generate the minified version, just run the Grunt task. In case you're not
familiar with Grunt, here's how you get that hooked up.

1. Install [Node](http://nodejs.org) on your computer.
2. Clone this repository to your local computer.
3. In the command line, navigate to to the root of the cloned repo (i.e. the folder with this README file in it).
4. Type `npm install` to download all necessary require modules.
5. Type `npm install -g grunt-cli` to install the Grunt command line tool to run properly.
6. Type `grunt`

That will then re-generate the minified files in your ./source folder.

### Changelog

- `0.1.6` - Apr 10, 2015. Russian regions updated by @Konair0s
- `0.1.5` - Apr 5, 2015. Bug fix.
- `0.1.4` - Apr 4, 2015. Lib now wrapped in UMD (accessible with RequireJS, CommonJS, Node); custom init() function exposed
- `0.1.3` - Feb 10, 2015. Updated Ukraine regions.
- `0.1.2` - Nov 1, 2014. Fix for typo in UK counties list.
- `0.1.1` - April 24, 2014. Updated country list for ISO 3166 countries and short codes
- `0.1.0` - March 27, 2014. Initial version

### License

MIT.
