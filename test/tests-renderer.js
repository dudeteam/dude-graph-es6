import {Renderer} from "../src/dude-graph"
import {expect} from "chai";

describe("dude-renderer api", () => {
    it("should import Renderer", () => {
        expect(new Renderer).to.be.instanceOf(Renderer);
    });
});
