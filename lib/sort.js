'use strict';
const _ = require('lodash'),
    sort = (obj) => {
        return sortAttributes(obj);
    };

/**
 * Sorts the attributes of the given object by their names.
 * @param obj the object to be sorted. The object must contains a property
 * named 'attributes' which has a value of an array that holds objects with name
 * and value properties.
 * Example: {tag: 'Button', type: 'tag', attributes': [{name: 'text', value:'click'}]}
 * @returns {Object} the sorted object.
 */
function sortAttributes(obj) {
    if (!_.isObject(obj) || !('attributes' in obj)) {
        return undefined;
    }
    const sortedObj = {},
        // get all attributes and sort them by name
        nameAttributes = _.pluck(obj.attributes, 'name').sort(),
        sortedNameAttributes = [];
    // get the values of the sorted attributes
    _.forEach(nameAttributes, (value) => {
        let toReturn = false;
        const attrVal = _.result(_.find(obj.attributes, (attrObj) => {
            toReturn = attrObj.toReturn;
            return attrObj.name === value;
        }), 'value');
        sortedNameAttributes.push({
            name: value,
            value: attrVal,
            toReturn: toReturn
        });
    });
    const otherProperties = _.filter(_.keys(obj), (v) => {
        return v !== 'attributes';
    });
    _.map(otherProperties, (val) => {
        sortedObj[val] = obj[val];
    });
    sortedObj.attributes = sortedNameAttributes;
    return sortedObj;
}

module.exports = sort;
