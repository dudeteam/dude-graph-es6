import gjsdom from "jsdom-global";
import {expect} from "chai";

import {Renderer, RenderBlock} from "../src/dude-graph";
import {Graph, Block} from "../src/dude-graph";

describe("dude-renderer API", () => {
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
        let graph = new Graph();
        expect(svg.childElementCount).to.be.equal(0);
        new Renderer(svg, graph);
        expect(svg.childElementCount).to.be.equal(3);
        expect(svg.children[0]).to.be.equal(svg.getElementsByClassName("dude-graph-groups")[0]);
        expect(svg.children[1]).to.be.equal(svg.getElementsByClassName("dude-graph-connections")[0]);
        expect(svg.children[2]).to.be.equal(svg.getElementsByClassName("dude-graph-blocks")[0]);
    });
    it("should create render blocks", () => {
        let svg = document.getElementById("svg");
        let graph = new Graph();
        let renderer = new Renderer(svg, graph);
        let block = new Block();
        expect(() => {
            renderer.addRenderBlock(new RenderBlock(block)); // block not bound to graph
        }).to.throw();
        graph.addBlock(block);
        let renderBlock = new RenderBlock(block);
        renderer.addRenderBlock(renderBlock);
        expect(() => {
            renderer.addRenderBlock(renderBlock); // cannot add the same renderBlock twice
        }).to.throw();
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(1);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].children[0]).to.be.equal(renderBlock.element.node());
        expect(renderBlock.element.node().childElementCount).to.be.equal(3);
        renderer.removeRenderBlock(renderBlock);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(0);
    });
});
