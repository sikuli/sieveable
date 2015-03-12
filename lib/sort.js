var _ = require('lodash');

var sort = function (obj) {
    return sortAttributes(obj);
}

/**
 * Sorts the attributes of the given object by their names.
 * @param obj the object to be sorted. The object must contains a property
 * named 'attributes' which has a value of an array that holds objects with name
 * and value properties.
 * Example: {tag: 'Button', type: 'tag', attributes': [{name: 'text', value:'click'}]}
 * @returns {Object} the sorted object.
 */
function sortAttributes(obj) {
    if (!_.isObject(obj) || !'attributes' in obj) {
        return undefined;
    }
    var sortedObj = {};
    // get all attributes and sort them by name
    var nameAttributes = _.pluck(obj.attributes, 'name').sort();
    var sortedNameAttributes = new Array();
    // get the values of the sorted attributes
    _.forEach(nameAttributes, function (value) {
        var attrVal = _.result(_.find(obj.attributes, function (attrObj) {
            return attrObj.name == value;
        }), 'value');
        sortedNameAttributes.push({name: value, value: attrVal});
    });
    //
    var otherProperties = _.filter(_.keys(obj), function (v) {
        return v != 'attributes'
    });
    _.map(otherProperties, function (val) {
        sortedObj[val] = obj[val];
    })
    sortedObj['attributes'] = sortedNameAttributes;
    return sortedObj;
}

module.exports = sort;