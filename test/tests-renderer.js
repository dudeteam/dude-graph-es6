import {Renderer} from "../src/dude-graph"
import {expect} from "chai";

describe("dude-renderer api", () => {
    it("should import Renderer", () => {
        expect(Renderer).to.be.not.undefined;
        expect(new Renderer).to.be.instanceOf(Renderer);
    });
});
