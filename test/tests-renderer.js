import gjsdom from "jsdom-global";
import {expect} from "chai";

import {Renderer} from "../src/dude-graph";

describe("dude-renderer api", () => {
    beforeEach(function () {
        this.jsdom = gjsdom(`<html><body><svg id="svg"></svg></body></html>`);
    });
    afterEach(function () {
        this.jsdom()
    });
    it("should sets up a basic DOM with a svg tag", () => {
        expect(document.getElementById("svg")).to.be.not.null;
    });
    it("should create a renderer and create svg layers", () => {
        let svg = document.getElementById("svg");
        expect(svg.childElementCount).to.be.equal(0);
        let renderer = new Renderer(svg);
        expect(svg.childElementCount).to.be.equal(3);
        expect(svg.children[0]).to.be.equal(svg.getElementsByClassName("dude-graph-groups")[0]);
        expect(svg.children[1]).to.be.equal(svg.getElementsByClassName("dude-graph-connections")[0]);
        expect(svg.children[2]).to.be.equal(svg.getElementsByClassName("dude-graph-blocks")[0]);
    });
});
