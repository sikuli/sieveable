module.exports = Item

// an object representing a 'found' item
// scope or results would be a list of these items
// each findBy plugin can add properties to it

function Item(id){
    this.id = id
}