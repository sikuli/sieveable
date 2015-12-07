'use strict';
const _ = require('lodash');

let attributeCounter = 0;

function init() {
    attributeCounter = 0;
}

function getElementName(element) {
    let selector = element.name;
    if (selector === '_') {
        selector = '*';
    }
    if ('attributes' in element) {
        const actualAttributes = _filterExtraAttributes(element.attributes);
        selector += getAttributeSelectors(actualAttributes);
    }
    return escapeSpecialCharacters(selector);
}

function getChildName(child) {
    let childName = child.name;
    if (childName === '_') {
        childName = '*';
    }
    if ('attributes' in child) {
        const actualAttributes = _filterExtraAttributes(child.attributes);
        childName += getAttributeSelectors(actualAttributes);
    }
    if (childName !== '*') {
        childName = escapeSpecialCharacters(childName);
    }
    return childName;
}

function getAttributeSelectors(attributes) {
    let attributesSelector = '';
    _.forEach(attributes, (attribute) => {
        const idx = attribute.value.indexOf('*');
        // Attribute value equals to a value
        if (idx === -1) {
            attributesSelector += '[' + (attribute.name) +
                '="' + (attribute.value) + '"]';
        }
        // Attribute value starts with a value
        else if (idx === attribute.value.length - 1) {
            attributesSelector += '[' + (attribute.name) +
                '^="' + (attribute.value.split('*')[0]) + '"]';
        }
        // Attribute value ends with a value
        else if (idx === 0) {
            attributesSelector += '[' + (attribute.name) +
                '$="' + (attribute.value.split('*')[1]) + '"]';
        }
    });
    return attributesSelector;
}

function _filterExtraAttributes(attributes) {
    return _.filter(attributes, (attribute) => {
        return _.indexOf(['__name', '__exactly'], attribute.name) === -1;
    });
}

function getReturnAttributes(elements, attributes) {
    if (_.isEmpty(elements) || _.isEmpty(attributes)) {
        return undefined;
    }
    const attributesToReturn = _.filter(attributes, (attribute) => {
            return attribute.toReturn === true;
        }),
        attributesValues = {};
    _.forEach(attributesToReturn, (attribute) => {
        attributeCounter++;
        const retField = '$' + attributeCounter;
        attributesValues[retField] = [];
        _.forEach(elements, (elem) => {
            const returnedValue = elem.attribs[attribute.name];
            if (returnedValue) {
                attributesValues[retField].push(returnedValue);
            }
        });
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
    const r = str.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\$1');
    return r.replace(/(:|\.)/g, '\\$1');
}

module.exports = {
    init: init,
    getElementName: getElementName,
    escapeSpecialCharacters: escapeSpecialCharacters,
    getReturnAttributes: getReturnAttributes,
    getChildName: getChildName,
    getAttributeSelectors: getAttributeSelectors

};
