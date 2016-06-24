import sinon from "sinon";

import {Commander} from "../src/dude-graph";

describe("dude-commander API", () => {
    it("should create a commander", () => {
        new Commander(null);
    });
    it("should add an command and undo/redo it", () => {
        let commander = new Commander(null);
        let redoSpy = sinon.spy();
        let undoSpy = sinon.spy();
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
        let commander = new Commander(null);
        let redoSpy1 = sinon.spy();
        let redoSpy2 = sinon.spy();
        let redoSpy3 = sinon.spy();
        let undoSpy1 = sinon.spy();
        let undoSpy2 = sinon.spy();
        let undoSpy3 = sinon.spy();
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
        let commander = new Commander(null);
        let redoSpy = sinon.spy();
        let undoSpy = sinon.spy();
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
        let commander = new Commander(null);
        let redoSpy1 = sinon.spy();
        let redoSpy2 = sinon.spy();
        let undoSpy1 = sinon.spy();
        let undoSpy2 = sinon.spy();
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
        let commander = new Commander(null);
        let redoSpy1 = sinon.spy();
        let redoSpy2 = sinon.spy();
        let redoSpy3 = sinon.spy();
        let undoSpy1 = sinon.spy();
        let undoSpy2 = sinon.spy();
        let undoSpy3 = sinon.spy();
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
