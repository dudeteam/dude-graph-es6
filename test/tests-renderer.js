import sinon from "sinon";
import gjsdom from "jsdom-global";
import {expect} from "chai";

import {Renderer, RenderBlock, RenderGroup, RenderPoint} from "../src/dude-graph";
import {Graph, Block, Point} from "../src/dude-graph";

describe("dude-renderer API", () => {
    beforeEach(function () {
        this.jsdom = gjsdom(`<html><body><svg id="svg"></svg></body></html>`);
    });
    afterEach(function () {
        this.jsdom();
    });
    it("should sets up a basic DOM with a svg tag", () => {
        expect(document.getElementById("svg")).to.be.not.null;
    });
    it("should create a renderer and create svg layers", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        expect(svg.childElementCount).to.be.equal(0);
        new Renderer(graph, svg);
        expect(svg.childElementCount).to.be.equal(1);
        const svgRoot = svg.firstElementChild;
        expect(svgRoot.childElementCount).to.be.equal(3);
        expect(svgRoot.children[0]).to.be.equal(svg.getElementsByClassName("dude-graph-groups")[0]);
        expect(svgRoot.children[1]).to.be.equal(svg.getElementsByClassName("dude-graph-connections")[0]);
        expect(svgRoot.children[2]).to.be.equal(svg.getElementsByClassName("dude-graph-blocks")[0]);
    });
    it("should create render blocks", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const block = new Block();
        expect(() => {
            renderer.addRenderBlock(new RenderBlock(block)); // block not bound to graph
        }).to.throw();
        const renderBlock = new RenderBlock(block);
        graph.addBlock(block);
        renderer.addRenderBlock(renderBlock);
        expect(() => {
            renderer.addRenderBlock(renderBlock); // cannot add the same renderBlock twice
        }).to.throw();
        expect(renderer.renderBlocksByBlock(block)).to.have.lengthOf(1);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(1);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].children[0]).to.be.equal(renderBlock.element.element);
        expect(renderBlock.element.element.childElementCount).to.be.equal(4);
        expect(renderer.renderBlockById(renderBlock.id)).to.be.equal(renderBlock);
    });
    it("should remove render blocks", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const block = new Block();
        const renderBlock = new RenderBlock(block);
        const renderBlock2 = new RenderBlock(block);
        graph.addBlock(block);
        renderer.addRenderBlock(renderBlock);
        renderer.addRenderBlock(renderBlock2);
        expect(renderer.renderBlocksByBlock(block)).to.have.lengthOf(2);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(2);
        renderer.removeRenderBlock(renderBlock);
        expect(renderer.renderBlocksByBlock(block)).to.have.lengthOf(1);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(1);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].children[0]).to.be.equal(renderBlock2.element.element);
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
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const renderGroup = new RenderGroup();
        expect(svg.getElementsByClassName("dude-graph-groups")[0].childElementCount).to.be.equal(0);
        renderer.addRenderGroup(renderGroup);
        expect(svg.getElementsByClassName("dude-graph-groups")[0].childElementCount).to.be.equal(1);
        expect(renderGroup.element.element.childElementCount).to.be.equal(2);
        expect(() => {
            renderer.addRenderGroup(renderGroup); // cannot add the same render group twice
        }).to.throw();
        expect(renderer.renderGroupById(renderGroup.id)).to.be.equal(renderGroup);
    });
    it("should remove render groups", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const renderGroup = new RenderGroup();
        const renderGroup2 = new RenderGroup();
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
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const block = new Block();
        const block2 = new Block();
        const block3 = new Block();
        const renderer = new Renderer(graph, svg);
        const renderer2 = new Renderer(graph, svg);
        const renderBlock = new RenderBlock(block);
        const renderBlock2 = new RenderBlock(block2);
        const renderBlock3 = new RenderBlock(block3);
        const renderGroup = new RenderGroup();
        const renderGroup2 = new RenderGroup();
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
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const block = new Block();
        const renderer = new Renderer(graph, svg);
        const renderBlock = new RenderBlock(block);
        const renderGroup = new RenderGroup();
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
    it("should add render points", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const block = new Block();
        const point = new Point(false, {"pointName": "point", "pointValueType": "string"});
        const renderer = new Renderer(graph, svg);
        const renderBlock = new RenderBlock(block);
        const renderPoint = new RenderPoint(point);
        graph.addBlock(block);
        block.addPoint(point);
        renderer.addRenderBlock(renderBlock);
        expect(renderBlock.renderPoints).to.have.lengthOf(0);
        expect(renderBlock.element.select(".dude-graph-block-points").element.childElementCount).to.be.equal(0);
        renderBlock.addRenderPoint(renderPoint);
        expect(renderBlock.renderPoints).to.have.lengthOf(1);
        expect(renderBlock.element.select(".dude-graph-block-points").element.childElementCount).to.be.equal(1);
    });
    it("should add render connections", () => {
        let svg = document.getElementById("svg");
        let graph = new Graph();
        let block1 = new Block();
        let block2 = new Block();
        let outputPoint = new Point(true, {"pointName": "point", "pointValueType": "string"});
        let inputPoint = new Point(false, {"pointName": "point", "pointValueType": "string"});
        let renderer = new Renderer(graph, svg);
        let renderBlock1 = new RenderBlock(block1);
        let renderBlock2 = new RenderBlock(block2);
        let outputRenderPoint = new RenderPoint(outputPoint);
        let inputRenderPoint = new RenderPoint(inputPoint);
        graph.addBlock(block1);
        graph.addBlock(block2);
        block1.addPoint(outputPoint);
        block2.addPoint(inputPoint);
        renderer.addRenderBlock(renderBlock1);
        renderer.addRenderBlock(renderBlock2);
        expect(() => {
            renderer.connect(outputRenderPoint, inputRenderPoint); // the render points are not bound to render blocks
        }).to.throw();
        renderBlock1.addRenderPoint(outputRenderPoint);
        renderBlock2.addRenderPoint(inputRenderPoint);
        expect(() => {
            renderer.connect(inputRenderPoint, outputRenderPoint); // 1st parameter must be the output point
        }).to.throw();
        expect(() => {
            renderer.connect(outputRenderPoint, inputRenderPoint); // the points are not connected in the graph
        }).to.throw();
        outputPoint.connect(inputPoint);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(renderer.renderConnectionsForRenderPoints(outputRenderPoint, inputRenderPoint)).to.be.null;
        let renderConnection = renderer.connect(outputRenderPoint, inputRenderPoint);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(renderer.renderConnectionsForRenderPoints(outputRenderPoint, inputRenderPoint)).to.be.equal(renderConnection);
        expect(renderConnection.outputRenderPoint).to.be.equal(outputRenderPoint);
        expect(renderConnection.inputRenderPoint).to.be.equal(inputRenderPoint);
        expect(() => {
            renderer.connect(outputRenderPoint, inputRenderPoint); // already connected
        }).to.throw();
    });
    it("should remove a render connections", () => {
        let svg = document.getElementById("svg");
        let graph = new Graph();
        let block1 = new Block();
        let block2 = new Block();
        let outputPoint = new Point(true, {"pointName": "point", "pointValueType": "string"});
        let inputPoint = new Point(false, {"pointName": "point", "pointValueType": "string"});
        let renderer = new Renderer(graph, svg);
        let renderBlock1 = new RenderBlock(block1);
        let renderBlock2 = new RenderBlock(block2);
        let outputRenderPoint = new RenderPoint(outputPoint);
        let inputRenderPoint = new RenderPoint(inputPoint);
        graph.addBlock(block1);
        graph.addBlock(block2);
        block1.addPoint(outputPoint);
        block2.addPoint(inputPoint);
        renderer.addRenderBlock(renderBlock1);
        renderer.addRenderBlock(renderBlock2);
        renderBlock1.addRenderPoint(outputRenderPoint);
        renderBlock2.addRenderPoint(inputRenderPoint);
        outputPoint.connect(inputPoint);
        expect(() => {
            renderer.disconnect(outputRenderPoint, inputRenderPoint); // render points not connected
        }).to.throw();
        renderer.connect(outputRenderPoint, inputRenderPoint);
        expect(() => {
            renderer.disconnect(inputRenderPoint, outputRenderPoint); // 1st parameter must be the output point
        }).to.throw();
        expect(renderer.renderConnectionsForRenderPoints(outputRenderPoint, inputRenderPoint)).to.be.not.null;
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(1);
        renderer.disconnect(outputRenderPoint, inputRenderPoint);
        expect(renderer.renderConnectionsForRenderPoints(outputRenderPoint, inputRenderPoint)).to.be.null;
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(0);
    });
});
describe("dude-renderer events", () => {
    beforeEach(function () {
        this.jsdom = gjsdom(`<html><body><svg id="svg"></svg></body></html>`);
    });
    afterEach(function () {
        this.jsdom();
    });
    it("should test render-block-add", () => {
        const spy = sinon.spy();
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const block = new Block();
        const renderBlock = new RenderBlock(block);
        graph.addBlock(block);
        renderer.on("render-block-add", spy);
        sinon.assert.notCalled(spy);
        renderer.addRenderBlock(renderBlock);
        sinon.assert.calledWith(spy, renderBlock);
    });
    it("should test render-group-add", () => {
        const spy = sinon.spy();
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const renderGroup = new RenderGroup();
        renderer.on("render-group-add", spy);
        sinon.assert.notCalled(spy);
        renderer.addRenderGroup(renderGroup);
        sinon.assert.calledWith(spy, renderGroup);
    });
    it("should test render-point-add", () => {
        const spy = sinon.spy();
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const block = new Block();
        const point = new Point(false, {"pointName": "in", "pointValueType": "string"});
        const renderBlock = new RenderBlock(block);
        const renderPoint = new RenderPoint(point);
        graph.addBlock(block);
        block.addPoint(point);
        renderer.addRenderBlock(renderBlock);
        renderer.on("render-point-add", spy);
        sinon.assert.notCalled(spy);
        renderBlock.addRenderPoint(renderPoint);
        sinon.assert.calledWith(spy, renderBlock, renderPoint);
    });
    it("should test render-block-remove", () => {
        const spy = sinon.spy();
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const block = new Block();
        const renderBlock = new RenderBlock(block);
        graph.addBlock(block);
        renderer.addRenderBlock(renderBlock);
        sinon.assert.notCalled(spy);
        renderer.on("render-block-remove", spy);
        renderer.removeRenderBlock(renderBlock);
        sinon.assert.calledWith(spy, renderBlock);
    });
    it("should test render-group-remove", () => {
        const spy = sinon.spy();
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const renderGroup = new RenderGroup();
        renderer.addRenderGroup(renderGroup);
        sinon.assert.notCalled(spy);
        renderer.on("render-group-remove", spy);
        renderer.removeRenderGroup(renderGroup);
        sinon.assert.calledWith(spy, renderGroup);
    });
    it("should test render-point-add", () => {
        const spy = sinon.spy();
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const block = new Block();
        const point = new Point(false, {"pointName": "in", "pointValueType": "string"});
        const renderBlock = new RenderBlock(block);
        const renderPoint = new RenderPoint(point);
        graph.addBlock(block);
        block.addPoint(point);
        renderer.addRenderBlock(renderBlock);
        renderBlock.addRenderPoint(renderPoint);
        renderer.on("render-point-remove", spy);
        sinon.assert.notCalled(spy);
        renderBlock.removeRenderPoint(renderPoint);
        sinon.assert.calledWith(spy, renderBlock, renderPoint);
    });
});
