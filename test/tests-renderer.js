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
        expect(document.getElementById("svg")).to.be.not.equal(null);
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
            renderer.addRenderBlock(new RenderBlock(block)); // cannot add render block when the block is not bound to graph
        }).to.throw();
        const renderBlock = new RenderBlock(block);
        graph.addBlock(block);
        renderer.addRenderBlock(renderBlock);
        expect(renderBlock.id).to.be.equal(block.id);
        expect(renderer.renderBlockById(block.id)).to.be.equal(renderBlock);
        expect(renderer.renderBlockById(renderBlock.id)).to.be.equal(renderBlock);
        expect(renderer.renderBlockByBlock(block)).to.be.equal(renderBlock);
        expect(renderBlock.element.element.childElementCount).to.be.equal(4);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(1);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].children[0]).to.be.equal(renderBlock.element.element);
        expect(() => {
            renderer.addRenderBlock(renderBlock); // cannot add the same renderBlock twice
        }).to.throw();
        expect(() => {
            renderer.addRenderBlock(new RenderBlock(block)); // only one render block by block
        }).to.throw();
    });
    it("should remove render blocks", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const block1 = new Block();
        const block2 = new Block();
        const renderBlock1 = new RenderBlock(block1);
        const renderBlock2 = new RenderBlock(block2);
        graph.addBlock(block1);
        graph.addBlock(block2);
        renderer.addRenderBlock(renderBlock1);
        renderer.addRenderBlock(renderBlock2);
        expect(renderer.renderBlocks).to.have.lengthOf(2);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(2);
        renderer.removeRenderBlock(renderBlock1);
        expect(renderer.renderBlocks).to.have.lengthOf(1);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(1);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].children[0]).to.be.equal(renderBlock2.element.element);
        expect(() => {
            renderer.removeRenderBlock(renderBlock1); // cannot remove the same renderBlock twice
        }).to.throw();
        renderer.addRenderBlock(renderBlock1);
        expect(renderer.renderBlocks).to.have.lengthOf(2);
        expect(svg.getElementsByClassName("dude-graph-blocks")[0].childElementCount).to.be.equal(2);
        expect(renderBlock1.id).to.be.not.equal(renderBlock2.id);
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
        const point = new Point(true, {"name": "point", "valueType": "string"});
        const renderer = new Renderer(graph, svg);
        const renderBlock = new RenderBlock(block);
        const renderPoint = new RenderPoint(point);
        graph.addBlock(block);
        block.addPoint(point);
        renderer.addRenderBlock(renderBlock);
        expect(renderBlock.renderPoints).to.have.lengthOf(0);
        expect(renderBlock.element.select(".dude-graph-block-points").element.childElementCount).to.be.equal(0);
        expect(renderBlock.pointBy(true, "point")).to.be.equal(null);
        expect(renderBlock.inputByName("point")).to.be.equal(null);
        expect(renderBlock.renderPointByPoint(point)).to.be.equal(null);
        renderBlock.addRenderPoint(renderPoint);
        expect(renderer.renderPoints).to.have.lengthOf(1);
        expect(renderBlock.renderPoints).to.have.lengthOf(1);
        expect(renderBlock.element.select(".dude-graph-block-points").element.childElementCount).to.be.equal(1);
        expect(renderBlock.pointBy(true, "point")).to.be.equal(renderPoint);
        expect(renderBlock.inputByName("point")).to.be.equal(renderPoint);
        expect(renderBlock.renderPointByPoint(point)).to.be.equal(renderPoint);
        expect(() => {
            const otherBlock = new Block();
            const otherPoint = new Point(true, {"name": "point", "valueType": "string"});
            graph.addBlock(otherBlock);
            block.addPoint(otherPoint);
            renderBlock.addRenderPoint(new RenderPoint(otherPoint)); // otherPoint is not in the render block's block
        }).to.throw();
    });
    it("should add render connections", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        const outputPoint = new Point(false, {"name": "point", "valueType": "string"});
        const inputPoint = new Point(true, {"name": "point", "valueType": "string"});
        const renderer = new Renderer(graph, svg);
        const renderBlock1 = new RenderBlock(block1);
        const renderBlock2 = new RenderBlock(block2);
        const outputRenderPoint = new RenderPoint(outputPoint);
        const inputRenderPoint = new RenderPoint(inputPoint);
        graph.addBlock(block1);
        graph.addBlock(block2);
        block1.addPoint(outputPoint);
        block2.addPoint(inputPoint);
        renderer.addRenderBlock(renderBlock1);
        renderer.addRenderBlock(renderBlock2);
        expect(() => {
            renderer.connect(inputRenderPoint, outputRenderPoint); // the render points are not bound to render blocks
        }).to.throw();
        renderBlock1.addRenderPoint(outputRenderPoint);
        renderBlock2.addRenderPoint(inputRenderPoint);
        expect(renderer.renderPoints).to.have.lengthOf(2);
        expect(() => {
            renderer.connect(inputRenderPoint, outputRenderPoint); // 1st parameter must be the output point
        }).to.throw();
        expect(() => {
            renderer.connect(inputRenderPoint, outputRenderPoint); // the points are not connected in the graph
        }).to.throw();
        outputPoint.connect(inputPoint);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(renderer.renderConnectionsForRenderPoints(inputRenderPoint, outputRenderPoint)).to.be.equal(null);
        const renderConnection = renderer.connect(inputRenderPoint, outputRenderPoint);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(renderer.renderConnectionsForRenderPoints(inputRenderPoint, outputRenderPoint)).to.be.equal(renderConnection);
        expect(renderConnection.outputRenderPoint).to.be.equal(outputRenderPoint);
        expect(renderConnection.inputRenderPoint).to.be.equal(inputRenderPoint);
        expect(renderConnection.other(inputRenderPoint)).to.be.equal(outputRenderPoint);
        expect(renderConnection.other(outputRenderPoint)).to.be.equal(inputRenderPoint);
        expect(() => {
            renderer.connect(inputRenderPoint, outputRenderPoint); // already connected
        }).to.throw();
    });
    it("should remove a render connections", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        const outputPoint = new Point(false, {"name": "point", "valueType": "string"});
        const inputPoint = new Point(true, {"name": "point", "valueType": "string"});
        const renderer = new Renderer(graph, svg);
        const renderBlock1 = new RenderBlock(block1);
        const renderBlock2 = new RenderBlock(block2);
        const outputRenderPoint = new RenderPoint(outputPoint);
        const inputRenderPoint = new RenderPoint(inputPoint);
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
            renderer.disconnect(inputRenderPoint, outputRenderPoint); // render points not connected
        }).to.throw();
        renderer.connect(inputRenderPoint, outputRenderPoint);
        expect(() => {
            renderer.disconnect(outputRenderPoint, inputRenderPoint); // 1st parameter must be the input point
        }).to.throw();
        expect(renderer.renderConnectionsForRenderPoints(inputRenderPoint, outputRenderPoint)).to.be.not.equal(null);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(1);
        renderer.disconnect(inputRenderPoint, outputRenderPoint);
        expect(renderer.renderConnectionsForRenderPoints(inputRenderPoint, outputRenderPoint)).to.be.equal(null);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(0);
    });
    it("should be impossible to remove a non empty render block (with render points)", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const block = new Block();
        const outputPoint = new Point(false, {"name": "point", "valueType": "string"});
        const renderer = new Renderer(graph, svg);
        const renderBlock = new RenderBlock(block);
        const outputRenderPoint = new RenderPoint(outputPoint);
        graph.addBlock(block);
        block.addPoint(outputPoint);
        renderer.addRenderBlock(renderBlock);
        renderBlock.addRenderPoint(outputRenderPoint);
        expect(() => {
            renderer.removeRenderBlock(renderBlock);
        }).to.throw();
        renderBlock.removeRenderPoint(outputRenderPoint);
        renderer.removeRenderBlock(renderBlock);
    });
    it("should handle render nodes with null text", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const block = new Block();
        const renderer = new Renderer(graph, svg);
        const renderBlock = new RenderBlock(block);
        const renderGroup = new RenderGroup();
        graph.addBlock(block);
        renderer.addRenderBlock(renderBlock);
        renderer.addRenderGroup(renderGroup);
        renderBlock.name = null;
        renderBlock.updateAll();
        renderGroup.name = null;
        renderGroup.updateAll();
    });
    it("should set a color to a group", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const renderGroup = new RenderGroup();
        expect(renderGroup.color).to.be.equal(null);
        renderer.addRenderGroup(renderGroup);
        expect(renderGroup.color).to.be.equal(null);
        renderGroup.color = "#ff3322";
        expect(renderGroup.color).to.be.equal("#ff3322");
        renderer.removeRenderGroup(renderGroup);
        expect(renderGroup.color).to.be.equal("#ff3322");
    });
    it("should free the svg upon detach", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        expect(svg.childElementCount).to.be.equal(1);
        const svgRoot = svg.firstElementChild;
        expect(svgRoot.childElementCount).to.be.equal(3);
        expect(svgRoot.children[0]).to.be.equal(svg.getElementsByClassName("dude-graph-groups")[0]);
        expect(svgRoot.children[1]).to.be.equal(svg.getElementsByClassName("dude-graph-connections")[0]);
        expect(svgRoot.children[2]).to.be.equal(svg.getElementsByClassName("dude-graph-blocks")[0]);
        renderer.destroy();
        expect(svg.childElementCount).to.be.equal(0);
    });
});
describe("dude-renderer Events", () => {
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
        const point = new Point(true, {"name": "in", "valueType": "string"});
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
        const point = new Point(true, {"name": "in", "valueType": "string"});
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
