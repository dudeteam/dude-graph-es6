import {expect} from "chai";
import sinon from "sinon";

import {Commander} from "../src/dude-graph";
import {Graph, Block, Point} from "../src/dude-graph";

describe("dude-commander API", () => {
    it("should create a commander", () => {
        new Commander(null, null);
    });
    it("should add an command and undo/redo it", () => {
        const commander = new Commander(null, null);
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
        const commander = new Commander(null, null);
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
        const commander = new Commander(null, null);
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
        const commander = new Commander(null, null);
        const redoSpy1 = sinon.spy();
        const redoSpy2 = sinon.spy();
        const undoSpy1 = sinon.spy();
        const undoSpy2 = sinon.spy();
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
        const commander = new Commander(null, null);
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
    it("should add/remove a block", () => {
        const graph = new Graph();
        const block = new Block();
        const commander = new Commander(graph, null);
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
        const graph = new Graph();
        const block = new Block();
        const point = new Point(false, {"name": "out", "valueType": "number"});
        const commander = new Commander(graph, null);
        commander.addBlock(block);
        expect(block.outputs).have.lengthOf(0);
        commander.addBlockPoint(block, point);
        expect(block.outputs).have.lengthOf(1);
        commander.undo();
        expect(block.outputs).have.lengthOf(0);
        commander.redo();
        expect(block.outputs).have.lengthOf(1);
        commander.removeBlockPoint(block, point);
        expect(block.outputs).have.lengthOf(0);
        commander.undo();
        expect(block.outputs).have.lengthOf(1);
        commander.redo();
        expect(block.outputs).have.lengthOf(0);
    });
    it("should connect/disconnect points", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        const input = new Point(true, {"name": "in", "valueType": "number"});
        const output = new Point(false, {"name": "out", "valueType": "number"});
        const commander = new Commander(graph, null);
        commander.transaction();
        commander.addBlock(block1);
        commander.addBlock(block2);
        commander.addBlockPoint(block1, input);
        commander.addBlockPoint(block2, output);
        commander.commit();
        expect(graph.connectionForPoints(input, output)).to.be.null;
        commander.connectPoints(input, output);
        expect(graph.connectionForPoints(input, output)).to.be.not.null;
        commander.undo();
        expect(graph.connectionForPoints(input, output)).to.be.null;
        commander.redo();
        expect(graph.connectionForPoints(input, output)).to.be.not.null;
        commander.disconnectPoints(input, output);
        expect(graph.connectionForPoints(input, output)).to.be.null;
        commander.undo();
        expect(graph.connectionForPoints(input, output)).to.be.not.null;
        commander.redo();
        expect(graph.connectionForPoints(input, output)).to.be.null;
    });
});
