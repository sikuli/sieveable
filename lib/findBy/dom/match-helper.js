var _ = require("lodash");

var attributeCounter = 0;

function init() {
    attributeCounter = 0;
}
function get_element_name(element) {
    var selector = element.name;
    if (selector == '_') {
        selector = '*'
    }
    if ('attributes' in element) {
        var actualAttributes = _filterExtraAttributes(element.attributes);
        selector += getAttributeSelectors(actualAttributes);
    }
    return escapeSpecialCharacters(selector);
}

function get_child_name(child) {
    var childName = child.name;
    if (childName == '_') {
        childName = '*'
    }
    if ('attributes' in child) {
        var actualAttributes = _filterExtraAttributes(child.attributes);
        childName += getAttributeSelectors(actualAttributes);
    }
    if (childName != '*') {
        childName = escapeSpecialCharacters(childName);
    }
    return childName;
}

function getAttributeSelectors(attributes) {
    var attributesSelector = '';
    _.forEach(attributes, function (attribute) {
        var idx = attribute['value'].indexOf('*');
        // Attribute value equals to a value
        if (idx == -1) {
            attributesSelector += '[' + (attribute.name) +
                '="' + (attribute.value) + '"]';
        }
        // Attribute value starts with a value
        else if (idx == attribute['value'].length - 1) {
            attributesSelector += '[' + (attribute.name) +
                '^="' + (attribute.value.split('*')[0]) + '"]';
        }
        // Attribute value ends with a value
        else if (idx == 0) {
            attributesSelector += '[' + (attribute.name) +
                '$="' + (attribute.value.split('*')[1]) + '"]';
        }
    });
    return attributesSelector;
}

function _filterExtraAttributes(attributes) {
    return _.filter(attributes, function (attribute) {
        return attribute.name != '__name';
    })
}

function getReturnAttributes(elements, attributes) {
    if (_.isEmpty(elements) || _.isEmpty(attributes)) {
        return undefined;
    }
    var attributesToReturn = _.filter(attributes, function (attribute) {
        return attribute.toReturn === true;
    });
    var attributesValues = {};
    _.forEach(attributesToReturn, function (attribute) {
        attributeCounter++;
        var retField = "$" + attributeCounter;
        attributesValues[retField] = [];
        _.forEach(elements, function (elem) {
            var returnedValue = elem.attribs[attribute.name];
            if (returnedValue) {
                attributesValues[retField].push(returnedValue);
            }
        })
    });
    return attributesValues;
}

/**
 * Escape names that use any of JQuery meta-characters as a literal part of a name.
 * @param str a String that may use any of the meta-characters
 * @returns {String} The escaped string with two backslashes replacing the
 * JQuery's special meta-characters
 * @private
 */
function escapeSpecialCharacters(str) {
    var r = str.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\$1');
    return r.replace(/(:|\.)/g, "\\$1");
}

module.exports = {
    init: init,
    get_element_name: get_element_name,
    escapeSpecialCharacters: escapeSpecialCharacters,
    getReturnAttributes: getReturnAttributes,
    get_child_name: get_child_name,
    getAttributeSelectors: getAttributeSelectors

};