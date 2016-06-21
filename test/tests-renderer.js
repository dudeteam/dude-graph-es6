import gjsdom from "jsdom-global";
import {expect} from "chai";

import {Renderer, RenderBlock, RenderGroup} from "../src/dude-graph";
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
        let renderBlock = new RenderBlock(block);
        graph.addBlock(block);
        renderer.addRenderBlock(renderBlock);
        expect(() => {
            renderer.addRenderBlock(renderBlock); // cannot add the same renderBlock twice
        }).to.throw();
        expect(renderer.renderBlocksByBlock(block)).to.have.lengthOf(1);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(1);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].children[0]).to.be.equal(renderBlock.element.node());
        expect(renderBlock.element.node().childElementCount).to.be.equal(3);
        expect(renderer.renderBlockById(renderBlock.id)).to.be.equal(renderBlock);
    });
    it("should remove render blocks", () => {
        let svg = document.getElementById("svg");
        let graph = new Graph();
        let renderer = new Renderer(svg, graph);
        let block = new Block();
        let renderBlock = new RenderBlock(block);
        let renderBlock2 = new RenderBlock(block);
        graph.addBlock(block);
        renderer.addRenderBlock(renderBlock);
        renderer.addRenderBlock(renderBlock2);
        expect(renderer.renderBlocksByBlock(block)).to.have.lengthOf(2);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(2);
        renderer.removeRenderBlock(renderBlock);
        expect(renderer.renderBlocksByBlock(block)).to.have.lengthOf(1);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(1);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].children[0]).to.be.equal(renderBlock2.element.node());
        expect(() => {
            renderer.removeRenderBlock(renderBlock); // cannot remove the same renderBlock twice
        }).to.throw();
        expect(() => {
            renderBlock.id = renderBlock2.id;
            renderer.addRenderBlock(renderBlock); // cannot have twice the same id
        }).to.throw();
        renderBlock.id = null;
        renderer.addRenderBlock(renderBlock);
        expect(renderer.renderBlocksByBlock(block)).to.have.lengthOf(2);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(2);
        expect(renderBlock.id).to.be.not.equal(renderBlock2.id);
        renderer.removeRenderBlock(renderBlock2);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(1);
    });
    it("should create render groups", () => {
        let svg = document.getElementById("svg");
        let graph = new Graph();
        let renderer = new Renderer(svg, graph);
        let renderGroup = new RenderGroup();
        expect(svg.getElementsByClassName("dude-graph-groups")[0].childElementCount).to.be.equal(0);
        renderer.addRenderGroup(renderGroup);
        expect(svg.getElementsByClassName("dude-graph-groups")[0].childElementCount).to.be.equal(1);
        expect(renderGroup.element.node().childElementCount).to.be.equal(2);
        expect(() => {
            renderer.addRenderGroup(renderGroup); // cannot add the same render group twice
        }).to.throw();
        expect(renderer.renderGroupById(renderGroup.id)).to.be.equal(renderGroup);
    });
    it("should remove render groups", () => {
        let svg = document.getElementById("svg");
        let graph = new Graph();
        let renderer = new Renderer(svg, graph);
        let renderGroup = new RenderGroup();
        let renderGroup2 = new RenderGroup();
        renderer.addRenderGroup(renderGroup);
        renderer.addRenderGroup(renderGroup2);
        expect(svg.getElementsByClassName("dude-graph-groups")[0].childElementCount).to.be.equal(2);
        renderer.removeRenderGroup(renderGroup);
        expect(svg.getElementsByClassName("dude-graph-groups")[0].childElementCount).to.be.equal(1);
        expect(() => {
            renderer.removeRenderGroup(renderGroup); // cannot remove the same renderGroup twice
        }).to.throw();
        renderer.removeRenderGroup(renderGroup2);
        expect(svg.getElementsByClassName("dude-graph-groups")[0].childElementCount).to.be.equal(0);
    });
    it("should add render blocks into render groups", () => {
        let svg = document.getElementById("svg");
        let graph = new Graph();
        let block = new Block();
        let block2 = new Block();
        let block3 = new Block();
        let renderer = new Renderer(svg, graph);
        let renderer2 = new Renderer(svg, graph);
        let renderBlock = new RenderBlock(block);
        let renderBlock2 = new RenderBlock(block2);
        let renderBlock3 = new RenderBlock(block3);
        let renderGroup = new RenderGroup();
        let renderGroup2 = new RenderGroup();
        graph.addBlock(block);
        graph.addBlock(block2);
        graph.addBlock(block3);
        expect(renderGroup.renderBlocks).to.have.lengthOf(0);
        expect(() => {
            renderGroup.addRenderBlock(renderBlock); // renderGroup is not in the renderer
        }).to.throw();
        renderer.addRenderGroup(renderGroup);
        expect(() => {
            renderGroup.addRenderBlock(renderBlock); // renderGroup cannot add twice the same renderBlock
        }).to.throw();
        expect(() => {
            renderGroup.addRenderBlock(renderBlock); // renderBlock is not in the renderer
        }).to.throw();
        renderer.addRenderBlock(renderBlock);
        renderer2.addRenderBlock(renderBlock2);
        renderGroup.addRenderBlock(renderBlock);
        expect(renderGroup.renderBlocks).to.have.lengthOf(1);
        expect(() => {
            renderGroup.addRenderBlock(renderBlock2); // renderBlock2 is not in the same renderer
        }).to.throw();
        expect(() => {
            renderGroup.removeRenderBlock(renderBlock2); // renderBlock2 is not in renderGroup
        }).to.throw();
        renderGroup.removeRenderBlock(renderBlock);
        expect(renderGroup.renderBlocks).to.have.lengthOf(0);
        renderer.addRenderBlock(renderBlock3);
        renderer.addRenderGroup(renderGroup2);
        renderGroup2.addRenderBlock(renderBlock3);
        expect(() => {
            renderGroup.addRenderBlock(renderBlock3); // renderBlock3 has a different parent
        }).to.throw();
        renderGroup2.removeRenderBlock(renderBlock3);
        renderGroup.addRenderBlock(renderBlock3);
    });
    it("should not let the renderer to remove a render block with a parent or render group with children", () => {
        let svg = document.getElementById("svg");
        let graph = new Graph();
        let block = new Block();
        let renderer = new Renderer(svg, graph);
        let renderBlock = new RenderBlock(block);
        let renderGroup = new RenderGroup();
        graph.addBlock(block);
        renderer.addRenderBlock(renderBlock);
        renderer.addRenderGroup(renderGroup);
        renderGroup.addRenderBlock(renderBlock);
        expect(() => {
            renderer.removeRenderBlock(renderBlock);
        }).to.throw();
        expect(() => {
            renderer.removeRenderGroup(renderGroup);
        }).to.throw();
    });
});
