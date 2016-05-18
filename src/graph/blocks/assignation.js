import Point from "../point";
import Block from "../block";
import StreamPoint from "../points/stream";

export default class AssignationBlock extends Block {

    /**
     * Called when the static points are created
     * @override
     */
    validatePoints() {
        if (!(this.inputByName("in") instanceof StreamPoint)) {
            throw new Error("`" + this.fancyName + "` must have an input `in` of type `Stream`");
        }
        if (!(this.inputByName("variable") instanceof Point)) {
            throw new Error("`" + this.fancyName + "` must have an input `variable` of type `Point`");
        }
        if (!(this.inputByName("value") instanceof Point)) {
            throw new Error("`" + this.fancyName + "` must have an input `value` of type `Point`");
        }
        if (this.inputByName("variable").pointValueType !== this.inputByName("value").pointValueType) {
            throw new Error("`" + this.fancyName + "` inputs `variable` and `value` must have the same pointValueType");
        }
        if (!(this.outputByName("out") instanceof StreamPoint)) {
            throw new Error("`" + this.fancyName + "` must have an output `out` of type `Stream`");
        }
    }

}
