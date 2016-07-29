import sinon from "sinon";
import gjsdom from "jsdom-global";
import {expect} from "chai";

import {Renderer} from "../src/dude-graph";
import {Commander} from "../src/dude-graph";
import {Graph, Block, Point} from "../src/dude-graph";

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
        commander.redo();
        sinon.assert.calledTwice(redoSpy);
        sinon.assert.calledOnce(undoSpy);
        commander.undo();
        sinon.assert.calledTwice(redoSpy);
        sinon.assert.calledTwice(undoSpy);
        commander.undo();
        sinon.assert.calledTwice(redoSpy);
        sinon.assert.calledTwice(undoSpy);
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
        sinon.assert.notCalled(redoSpy1);
        sinon.assert.notCalled(redoSpy2);
        sinon.assert.notCalled(undoSpy1);
        sinon.assert.notCalled(undoSpy2);
        commander.rollback();
        sinon.assert.notCalled(redoSpy1);
        sinon.assert.notCalled(redoSpy2);
        sinon.assert.notCalled(undoSpy1);
        sinon.assert.notCalled(undoSpy2);
        commander.transaction();
        commander.command(redoSpy1, undoSpy1);
        commander.command(redoSpy2, undoSpy2);
        sinon.assert.notCalled(redoSpy1);
        sinon.assert.notCalled(redoSpy2);
        sinon.assert.notCalled(undoSpy1);
        sinon.assert.notCalled(undoSpy2);
        commander.commit();
        sinon.assert.calledOnce(redoSpy1);
        sinon.assert.calledOnce(redoSpy2);
        sinon.assert.notCalled(undoSpy1);
        sinon.assert.notCalled(undoSpy2);
        commander.undo();
        sinon.assert.calledOnce(redoSpy1);
        sinon.assert.calledOnce(redoSpy2);
        sinon.assert.calledOnce(undoSpy1);
        sinon.assert.calledOnce(undoSpy2);
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
        commander.command(redoSpy1, undoSpy1);
        commander.transaction();
        commander.command(redoSpy2, undoSpy2);
        commander.rollback();
        commander.command(redoSpy3, undoSpy3);
        commander.commit();
        commander.undo();
        sinon.assert.calledOnce(redoSpy1);
        sinon.assert.notCalled(redoSpy2);
        sinon.assert.calledOnce(redoSpy3);
        sinon.assert.calledOnce(undoSpy1);
        sinon.assert.notCalled(undoSpy2);
        sinon.assert.calledOnce(undoSpy3);
        commander.redo();
        sinon.assert.calledTwice(redoSpy1);
        sinon.assert.notCalled(redoSpy2);
        sinon.assert.calledTwice(redoSpy3);
        sinon.assert.calledOnce(undoSpy1);
        sinon.assert.notCalled(undoSpy2);
        sinon.assert.calledOnce(undoSpy3);
    });
});
describe("dude-commander graph API", () => {
    beforeEach(function () {
        this.jsdom = gjsdom(`<html><body><svg id="svg"></svg></body></html>`);
    });
    afterEach(function () {
        this.jsdom();
    });
    it("should add/remove a block", () => {
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
});
