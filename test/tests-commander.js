import sinon from "sinon";
import gjsdom from "jsdom-global";
import {expect} from "chai";

import {Commander} from "../src/dude-graph";
import {Graph, Block, Point} from "../src/dude-graph";
import {Renderer, RenderBlock, RenderGroup, RenderPoint} from "../src/dude-graph";

describe("dude-commander API", () => {
    beforeEach(function () {
        this.jsdom = gjsdom(`<html><body><svg id="svg"></svg></body></html>`);
    });
    afterEach(function () {
        this.jsdom();
    });
    it("should create a commander", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        expect(commander.graph).to.be.equal(graph);
        expect(commander.renderer).to.be.equal(renderer);
    });
    it("should add an command and undo/redo it", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const redoSpy = sinon.spy();
        const undoSpy = sinon.spy();
        commander.command(redoSpy, undoSpy);
        sinon.assert.calledOnce(redoSpy);
        sinon.assert.notCalled(undoSpy);
        commander.undo();
        sinon.assert.calledOnce(redoSpy);
        sinon.assert.calledOnce(undoSpy);
        commander.redo();
        sinon.assert.calledTwice(redoSpy);
        sinon.assert.calledOnce(undoSpy);
        expect(() => {
            commander.redo(); // There is nothing to redo
        }).to.throw();
        commander.undo();
        sinon.assert.calledTwice(redoSpy);
        sinon.assert.calledTwice(undoSpy);
        expect(() => {
            commander.undo(); // There is nothing to undo
        }).to.throw();
    });
    it("should add 3 actions and undo/redo them", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const redoSpy1 = sinon.spy();
        const redoSpy2 = sinon.spy();
        const redoSpy3 = sinon.spy();
        const undoSpy1 = sinon.spy();
        const undoSpy2 = sinon.spy();
        const undoSpy3 = sinon.spy();
        commander.command(redoSpy1, undoSpy1);
        sinon.assert.calledOnce(redoSpy1);
        sinon.assert.notCalled(redoSpy2);
        sinon.assert.notCalled(redoSpy3);
        commander.command(redoSpy2, undoSpy2);
        sinon.assert.calledOnce(redoSpy1);
        sinon.assert.calledOnce(redoSpy2);
        sinon.assert.notCalled(redoSpy3);
        commander.command(redoSpy3, undoSpy3);
        sinon.assert.calledOnce(redoSpy1);
        sinon.assert.calledOnce(redoSpy2);
        sinon.assert.calledOnce(redoSpy3);
        commander.undo();
        sinon.assert.calledOnce(undoSpy3);
        sinon.assert.notCalled(undoSpy2);
        sinon.assert.notCalled(undoSpy1);
        commander.undo();
        sinon.assert.calledOnce(undoSpy3);
        sinon.assert.calledOnce(undoSpy2);
        sinon.assert.notCalled(undoSpy1);
        commander.undo();
        sinon.assert.calledOnce(undoSpy3);
        sinon.assert.calledOnce(undoSpy2);
        sinon.assert.calledOnce(undoSpy1);
        commander.redo();
        sinon.assert.calledTwice(redoSpy1);
        sinon.assert.calledOnce(redoSpy2);
        sinon.assert.calledOnce(redoSpy3);
        commander.redo();
        sinon.assert.calledTwice(redoSpy1);
        sinon.assert.calledTwice(redoSpy2);
        sinon.assert.calledOnce(redoSpy3);
        commander.undo();
        sinon.assert.calledOnce(undoSpy3);
        sinon.assert.calledTwice(undoSpy2);
        sinon.assert.calledOnce(undoSpy1);
    });
    it("should clear redo stack if a new command is pushed after an undo", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const redoSpy = sinon.spy();
        const undoSpy = sinon.spy();
        commander.command(redoSpy, undoSpy); // [action1], []
        commander.command(() => {}, () => {}); // [action2, action1], []
        commander.undo(); // [action1], [action2]
        sinon.assert.calledOnce(redoSpy);
        sinon.assert.notCalled(undoSpy);
        commander.undo(); // [], [action1, action2]
        sinon.assert.calledOnce(redoSpy);
        sinon.assert.calledOnce(undoSpy);
        commander.redo(); // [action1], [action2]
        sinon.assert.calledTwice(redoSpy);
        sinon.assert.calledOnce(undoSpy);
        commander.command(() => {}, () => {}); // [action3, action1], []
        commander.undo(); // [action1], [action3]
        sinon.assert.calledTwice(redoSpy);
        sinon.assert.calledOnce(undoSpy);
        commander.undo(); // [], [action1, action3]
        sinon.assert.calledTwice(redoSpy);
        sinon.assert.calledTwice(undoSpy);
    });
    it("should create a transaction", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const redoSpy1 = sinon.spy();
        const redoSpy2 = sinon.spy();
        const undoSpy1 = sinon.spy();
        const undoSpy2 = sinon.spy();
        expect(() => {
            commander.commit(); // there is no transaction to commit
        }).to.throw();
        expect(() => {
           commander.rollback(); // there is no transaction to rollback
        }).to.throw();
        commander.transaction();
        commander.command(redoSpy1, undoSpy1);
        commander.command(redoSpy2, undoSpy2);
        sinon.assert.calledOnce(redoSpy1);
        sinon.assert.calledOnce(redoSpy2);
        sinon.assert.notCalled(undoSpy1);
        sinon.assert.notCalled(undoSpy2);
        commander.rollback();
        sinon.assert.calledOnce(redoSpy1);
        sinon.assert.calledOnce(redoSpy2);
        sinon.assert.calledOnce(undoSpy1);
        sinon.assert.calledOnce(undoSpy2);
        commander.transaction();
        commander.command(redoSpy1, undoSpy1);
        commander.command(redoSpy2, undoSpy2);
        sinon.assert.calledTwice(redoSpy1);
        sinon.assert.calledTwice(redoSpy2);
        sinon.assert.calledOnce(undoSpy1);
        sinon.assert.calledOnce(undoSpy2);
        commander.commit();
        sinon.assert.calledTwice(redoSpy1);
        sinon.assert.calledTwice(redoSpy2);
        sinon.assert.calledOnce(undoSpy1);
        sinon.assert.calledOnce(undoSpy2);
        commander.undo();
        sinon.assert.calledTwice(redoSpy1);
        sinon.assert.calledTwice(redoSpy2);
        sinon.assert.calledTwice(undoSpy1);
        sinon.assert.calledTwice(undoSpy2);
    });
    it("should create nested transactions", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const redoSpy1 = sinon.spy();
        const redoSpy2 = sinon.spy();
        const redoSpy3 = sinon.spy();
        const undoSpy1 = sinon.spy();
        const undoSpy2 = sinon.spy();
        const undoSpy3 = sinon.spy();
        commander.transaction();
        commander.command(redoSpy1, undoSpy1); // 2 1
        commander.transaction();
        commander.command(redoSpy2, undoSpy2); // 1 1
        commander.rollback();
        commander.command(redoSpy3, undoSpy3); // 2 1
        commander.commit();
        commander.undo();
        sinon.assert.calledOnce(redoSpy1);
        sinon.assert.calledOnce(redoSpy2);
        sinon.assert.calledOnce(redoSpy3);
        sinon.assert.calledOnce(undoSpy1);
        sinon.assert.calledOnce(undoSpy2);
        sinon.assert.calledOnce(undoSpy3);
        commander.redo();
        sinon.assert.calledTwice(redoSpy1);
        sinon.assert.calledOnce(redoSpy2);
        sinon.assert.calledTwice(redoSpy3);
        sinon.assert.calledOnce(undoSpy1);
        sinon.assert.calledOnce(undoSpy2);
        sinon.assert.calledOnce(undoSpy3);
    });
    it("should ensure strong exception safety", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block = new class extends Block {
            added() {
                throw new Error("throw for no reason");
            }
        };
        const redoSpy1 = sinon.spy();
        const undoSpy1 = sinon.spy();
        commander.command(redoSpy1, undoSpy1);
        sinon.assert.calledOnce(redoSpy1);
        expect(() => {
            commander.addBlock(block);
        }).to.throw();
        commander.undo();
        sinon.assert.calledOnce(undoSpy1);
        commander.redo();
        sinon.assert.calledTwice(redoSpy1);
        commander.transaction();
        expect(() => {
            commander.removeBlock(null);
        }).to.throw();
        commander.commit(); // Empty transaction is discarded
        commander.undo();
        sinon.assert.calledTwice(undoSpy1);
        expect(() => {
            commander.undo(); // Empty transaction is discarded, cannot be undone
        }).to.throw();
        commander.redo();
        sinon.assert.calledThrice(redoSpy1);
    });
    it("should test commander canUndo/canRedo", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const times = 8;
        let undoes = 0;
        let redoes = 0;
        for (let i = 0; i < times; i++) {
            commander.command(
                () => {

                },
                () => {

                }
            );
        }
        for (; commander.canUndo(); undoes++) {
            commander.undo();
        }
        expect(undoes).to.be.equal(times);
        for (; commander.canRedo(); redoes++) {
            commander.redo();
        }
        expect(redoes).to.be.equal(times);
    });
    it("should test a commit with reverseUndo", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        let value = 32;
        commander.transaction();
        commander.command(
            () => value = 64,
            () => value = 32
        );
        commander.command(
            () => expect(value).to.be.equal(64),
            () => expect(value).to.be.equal(32)
        );
        commander.commit(true);
        commander.undo();
        commander.redo();
    });
});
describe("dude-commander graph API", () => {
    beforeEach(function () {
        this.jsdom = gjsdom(`<html><body><svg id="svg"></svg></body></html>`);
    });
    afterEach(function () {
        this.jsdom();
    });
    it("should add/remove a block with no points", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block = new Block();
        expect(graph.blocks).have.lengthOf(0);
        commander.addBlock(block);
        expect(graph.blocks).have.lengthOf(1);
        commander.undo();
        expect(graph.blocks).have.lengthOf(0);
        commander.redo();
        expect(graph.blocks).have.lengthOf(1);
        commander.removeBlock(block);
        expect(graph.blocks).have.lengthOf(0);
        commander.undo();
        expect(graph.blocks).have.lengthOf(1);
        commander.redo();
        expect(graph.blocks).have.lengthOf(0);
    });
    it("should add/remove a point into a block", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block = new Block();
        const point = new Point(true, {"name": "out", "valueType": "number"});
        commander.addBlock(block);
        expect(block.points).have.lengthOf(0);
        commander.addBlockPoint(block, point);
        expect(block.points).have.lengthOf(1);
        commander.undo();
        expect(block.points).have.lengthOf(0);
        commander.redo();
        expect(block.points).have.lengthOf(1);
        commander.removeBlockPoint(block, point);
        expect(block.points).have.lengthOf(0);
        commander.undo();
        expect(block.points).have.lengthOf(1);
        commander.redo();
        expect(block.points).have.lengthOf(0);
    });
    it("should connect/disconnect points", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block1 = new Block();
        const block2 = new Block();
        const input = new Point(true, {"name": "in", "valueType": "number"});
        const output = new Point(false, {"name": "out", "valueType": "number"});
        commander.transaction();
        commander.addBlock(block1);
        commander.addBlock(block2);
        commander.addBlockPoint(block1, input);
        commander.addBlockPoint(block2, output);
        commander.commit();
        expect(graph.connectionForPoints(input, output)).to.be.equal(null);
        commander.connectPoints(input, output);
        expect(graph.connectionForPoints(input, output)).to.be.not.equal(null);
        commander.undo();
        expect(graph.connectionForPoints(input, output)).to.be.equal(null);
        commander.redo();
        expect(graph.connectionForPoints(input, output)).to.be.not.equal(null);
        commander.disconnectPoints(input, output);
        expect(graph.connectionForPoints(input, output)).to.be.equal(null);
        commander.undo();
        expect(graph.connectionForPoints(input, output)).to.be.not.equal(null);
        commander.redo();
        expect(graph.connectionForPoints(input, output)).to.be.equal(null);
    });
    it("should assign a point value", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block = new Block();
        const point = new Point(true, {"name": "in", "valueType": "number"});
        commander.addBlock(block);
        commander.addBlockPoint(block, point);
        expect(point.value).to.be.equal(null);
        commander.changePointValue(point, 42);
        expect(point.value).to.be.equal(42);
        commander.undo();
        expect(point.value).to.be.equal(null);
        commander.redo();
        expect(point.value).to.be.equal(42);
    });
    it("should change a point name", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block = new Block();
        const point = new Point(true, {"name": "in", "valueType": "number"});
        commander.addBlock(block);
        commander.addBlockPoint(block, point);
        expect(point.name).to.be.equal("in");
        commander.changePointName(point, "in2");
        expect(point.name).to.be.equal("in2");
        commander.undo();
        expect(point.name).to.be.equal("in");
        commander.redo();
        expect(point.name).to.be.equal("in2");
    });
    it("should remove a block with connected points", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block1 = new Block();
        const block2 = new Block();
        const input = new Point(true, {"name": "in", "valueType": "number"});
        const output = new Point(false, {"name": "out", "valueType": "number"});
        commander.addBlock(block1);
        commander.addBlock(block2);
        commander.addBlockPoint(block1, input);
        commander.addBlockPoint(block2, output);
        commander.connectPoints(input, output);
        expect(graph.blocks).to.have.lengthOf(2);
        expect(block1.points).to.have.lengthOf(1);
        expect(block2.points).to.have.lengthOf(1);
        expect(graph.connections).to.have.lengthOf(1);
        expect(input.connections).to.have.lengthOf(1);
        expect(output.connections).to.have.lengthOf(1);
        commander.removeBlock(block1);
        expect(graph.blocks).to.have.lengthOf(1);
        expect(block1.points).to.have.lengthOf(0);
        expect(block2.points).to.have.lengthOf(1);
        expect(graph.connections).to.have.lengthOf(0);
        expect(input.connections).to.have.lengthOf(0);
        expect(output.connections).to.have.lengthOf(0);
        commander.undo();
        expect(graph.blocks).to.have.lengthOf(2);
        expect(block1.points).to.have.lengthOf(1);
        expect(block2.points).to.have.lengthOf(1);
        expect(graph.connections).to.have.lengthOf(1);
        expect(input.connections).to.have.lengthOf(1);
        expect(output.connections).to.have.lengthOf(1);
        commander.redo();
        expect(graph.blocks).to.have.lengthOf(1);
        expect(block1.points).to.have.lengthOf(0);
        expect(block2.points).to.have.lengthOf(1);
        expect(graph.connections).to.have.lengthOf(0);
        expect(input.connections).to.have.lengthOf(0);
        expect(output.connections).to.have.lengthOf(0);
    });
});
describe("dude-commander renderer API", () => {
    beforeEach(function () {
        this.jsdom = gjsdom(`<html><body><svg id="svg"></svg></body></html>`);
    });
    afterEach(function () {
        this.jsdom();
    });
    it("should add/remove a render block with no render points", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block = new Block();
        const renderBlock = new RenderBlock(block);
        commander.addBlock(block);
        expect(renderer.renderBlocks).to.have.lengthOf(0);
        commander.addRenderBlock(renderBlock);
        expect(renderer.renderBlocks).to.have.lengthOf(1);
        commander.undo();
        expect(renderer.renderBlocks).to.have.lengthOf(0);
        commander.redo();
        expect(renderer.renderBlocks).to.have.lengthOf(1);
        commander.removeRenderBlock(renderBlock);
        expect(renderer.renderBlocks).to.have.lengthOf(0);
        commander.undo();
        expect(renderer.renderBlocks).to.have.lengthOf(1);
        commander.redo();
        expect(renderer.renderBlocks).to.have.lengthOf(0);
    });
    it("should add/remove a render group with no render blocks", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const renderGroup = new RenderGroup();
        expect(renderer.renderBlocks).to.have.lengthOf(0);
        commander.addRenderGroup(renderGroup);
        expect(renderer.renderGroups).to.have.lengthOf(1);
        commander.undo();
        expect(renderer.renderGroups).to.have.lengthOf(0);
        commander.redo();
        expect(renderer.renderGroups).to.have.lengthOf(1);
        commander.removeRenderGroup(renderGroup);
        expect(renderer.renderGroups).to.have.lengthOf(0);
        commander.undo();
        expect(renderer.renderGroups).to.have.lengthOf(1);
        commander.redo();
        expect(renderer.renderGroups).to.have.lengthOf(0);
    });
    it("should add/remove render points", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block = new Block();
        const point = new Point(true, {"name": "in", "valueType": "number"});
        const renderBlock = new RenderBlock(block);
        const renderPoint = new RenderPoint(point);
        commander.addBlock(block);
        commander.addBlockPoint(block, point);
        commander.addRenderBlock(renderBlock);
        expect(renderBlock.renderPoints).to.have.lengthOf(0);
        commander.addRenderBlockRenderPoint(renderBlock, renderPoint);
        expect(renderBlock.renderPoints).to.have.lengthOf(1);
        commander.undo();
        expect(renderBlock.renderPoints).to.have.lengthOf(0);
        commander.redo();
        expect(renderBlock.renderPoints).to.have.lengthOf(1);
        commander.removeRenderBlockRenderPoint(renderBlock, renderPoint);
        expect(renderBlock.renderPoints).to.have.lengthOf(0);
        commander.undo();
        expect(renderBlock.renderPoints).to.have.lengthOf(1);
        commander.redo();
        expect(renderBlock.renderPoints).to.have.lengthOf(0);
    });
    it("should connect/disconnect render points", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block1 = new Block();
        const block2 = new Block();
        const input = new Point(true, {"name": "in", "valueType": "number"});
        const output = new Point(false, {"name": "out", "valueType": "number"});
        const renderBlock1 = new RenderBlock(block1);
        const renderBlock2 = new RenderBlock(block2);
        const inputRenderPoint = new RenderPoint(input);
        const outputRenderPoint = new RenderPoint(output);
        commander.addBlock(block1);
        commander.addBlock(block2);
        commander.addBlockPoint(block1, input);
        commander.addBlockPoint(block2, output);
        commander.connectPoints(input, output);
        commander.addRenderBlock(renderBlock1);
        commander.addRenderBlock(renderBlock2);
        commander.addRenderBlockRenderPoint(renderBlock1, inputRenderPoint);
        commander.addRenderBlockRenderPoint(renderBlock2, outputRenderPoint);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(0);
        commander.connectRenderPoints(inputRenderPoint, outputRenderPoint);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(1);
        commander.undo();
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(0);
        commander.redo();
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(1);
        commander.disconnectRenderPoints(inputRenderPoint, outputRenderPoint);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(0);
        commander.undo();
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(1);
        commander.redo();
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(0);
    });
    it("should remove render group with render blocks", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block = new Block();
        const renderGroup = new RenderGroup();
        const renderBlock = new RenderBlock(block);
        commander.addBlock(block);
        commander.addRenderGroup(renderGroup);
        commander.addRenderBlock(renderBlock);
        commander.addRenderGroupRenderBlock(renderGroup, renderBlock);
        expect(renderGroup.renderBlocks).to.have.lengthOf(1);
        expect(renderBlock.parent).to.be.equal(renderGroup);
        commander.removeRenderGroup(renderGroup);
        expect(renderGroup.renderBlocks).to.have.lengthOf(0);
        expect(renderBlock.parent).to.be.equal(null);
        commander.undo();
        expect(renderGroup.renderBlocks).to.have.lengthOf(1);
        expect(renderBlock.parent).to.be.equal(renderGroup);
        commander.redo();
        expect(renderGroup.renderBlocks).to.have.lengthOf(0);
        expect(renderBlock.parent).to.be.equal(null);
    });
    it("should remove a render block with connected render points", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block1 = new Block();
        const block2 = new Block();
        const input = new Point(true, {"name": "in", "valueType": "number"});
        const output = new Point(false, {"name": "out", "valueType": "number"});
        const renderGroup = new RenderGroup();
        const renderBlock1 = new RenderBlock(block1);
        const renderBlock2 = new RenderBlock(block2);
        const inputRenderPoint = new RenderPoint(input);
        const outputRenderPoint = new RenderPoint(output);
        commander.addBlock(block1);
        commander.addBlock(block2);
        commander.addBlockPoint(block1, input);
        commander.addBlockPoint(block2, output);
        commander.connectPoints(input, output);
        commander.addRenderGroup(renderGroup);
        commander.addRenderBlock(renderBlock1);
        commander.addRenderBlock(renderBlock2);
        commander.addRenderGroupRenderBlock(renderGroup, renderBlock1);
        commander.addRenderBlockRenderPoint(renderBlock1, inputRenderPoint);
        commander.addRenderBlockRenderPoint(renderBlock2, outputRenderPoint);
        commander.connectRenderPoints(inputRenderPoint, outputRenderPoint);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(renderGroup.renderBlocks).to.have.lengthOf(1);
        expect(renderBlock1.renderPoints).to.have.lengthOf(1);
        expect(renderer.renderBlocks).to.have.lengthOf(2);
        expect(renderer.renderConnections).to.have.lengthOf(1);
        commander.removeRenderBlock(renderBlock1);
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(renderGroup.renderBlocks).to.have.lengthOf(0);
        expect(renderBlock1.renderPoints).to.have.lengthOf(0);
        expect(renderer.renderBlocks).to.have.lengthOf(1);
        expect(renderer.renderConnections).to.have.lengthOf(0);
        commander.undo();
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(1);
        expect(renderGroup.renderBlocks).to.have.lengthOf(1);
        expect(renderBlock1.renderPoints).to.have.lengthOf(1);
        expect(renderer.renderBlocks).to.have.lengthOf(2);
        expect(renderer.renderConnections).to.have.lengthOf(1);
        commander.redo();
        expect(inputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(outputRenderPoint.renderConnections).to.have.lengthOf(0);
        expect(renderGroup.renderBlocks).to.have.lengthOf(0);
        expect(renderBlock1.renderPoints).to.have.lengthOf(0);
        expect(renderer.renderBlocks).to.have.lengthOf(1);
        expect(renderer.renderConnections).to.have.lengthOf(0);
    });
    it("should remove a render block and its block", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const block1 = new Block();
        const block2 = new Block();
        const renderBlock1 = new RenderBlock(block1);
        const renderBlock2 = new RenderBlock(block2);
        commander.addBlock(block1);
        commander.addBlock(block2);
        commander.addRenderBlock(renderBlock1);
        commander.addRenderBlock(renderBlock2);
        expect(graph.blocks).to.have.lengthOf(2);
        expect(renderer.renderBlocks).to.have.lengthOf(2);
        commander.removeRenderBlock(renderBlock1, true);
        expect(graph.blocks).to.have.lengthOf(1);
        expect(renderer.renderBlocks).to.have.lengthOf(1);
        commander.undo();
        expect(graph.blocks).to.have.lengthOf(2);
        expect(renderer.renderBlocks).to.have.lengthOf(2);
        commander.redo();
        expect(graph.blocks).to.have.lengthOf(1);
        expect(renderer.renderBlocks).to.have.lengthOf(1);
        commander.removeRenderBlock(renderBlock2, false);
        expect(graph.blocks).to.have.lengthOf(1);
        expect(renderer.renderBlocks).to.have.lengthOf(0);
        commander.undo();
        expect(graph.blocks).to.have.lengthOf(1);
        expect(renderer.renderBlocks).to.have.lengthOf(1);
        commander.removeRenderBlock(renderBlock2, true);
        expect(graph.blocks).to.have.lengthOf(0);
        expect(renderer.renderBlocks).to.have.lengthOf(0);
    });
    it("should change a group color", () => {
        const svg = document.getElementById("svg");
        const graph = new Graph();
        const renderer = new Renderer(graph, svg);
        const commander = new Commander(graph, renderer);
        const renderGroup = new RenderGroup();
        commander.addRenderGroup(renderGroup);
        expect(renderGroup.color).to.be.equal(null);
        commander.changeRenderGroupColor(renderGroup, "red");
        expect(renderGroup.color).to.be.equal("red");
        commander.undo();
        expect(renderGroup.color).to.be.equal(null);
        commander.redo();
        expect(renderGroup.color).to.be.equal("red");
        commander.changeRenderGroupColor(renderGroup, "blue", "green");
        expect(renderGroup.color).to.be.equal("blue");
        commander.undo();
        expect(renderGroup.color).to.be.equal("green");
        commander.undo();
        expect(renderGroup.color).to.be.equal(null);
    });
});
