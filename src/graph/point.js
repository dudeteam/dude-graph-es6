import EventClass from "event-class";

export default class Point extends EventClass {

    constructor() {
        super()
    }

    get name() {}
    get valueType() {}
    get value() {}

    added() {}
    accept() {}
    removed() {}

    changeValue() {}
    changeValueType() {}

    empty() {}
    emptyValue() {}
    emptyConnection() {}

    connect() {}
    disconnect() {}
    disconnectAll() {}

    connected() {}

    static create() {}

}
