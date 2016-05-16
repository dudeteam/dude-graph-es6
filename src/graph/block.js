import EventClass from "event-class";

export default class Block extends EventClass {

    constructor() {
        super()
    }

    get id() {}
    get name() {}
    get inputs() {}
    get outputs() {}

    added() {}
    pointAdded() {}
    pointConnected() {}
    pointValueChanged() {}
    pointDisconnected() {}
    pointRemoved() {}
    removed() {}

    changeTemplate() {}
    templateById() {}

    addPoint() {}
    removePoint() {}
    removePoints() {}
    inputByName() {}
    outputByName() {}

    static create() {}

}

/**
 * @typedef {Object} dudeGraph.Block.blockDataTypedef
 * @property {String|null} [id=null]
 * @property {String} name
 * @property {Object<String, Graph.templateTypedef>} [blockTemplates={}]
 */
