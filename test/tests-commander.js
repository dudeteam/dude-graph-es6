import sinon from "sinon";

import {Commander} from "../src/dude-graph";

describe("dude-commander API", () => {
    it("should create a commander", () => {
        new Commander();
    });
    it("should add an action and undo/redo it", () => {
        let commander = new Commander();
        let redoSpy = sinon.spy();
        let undoSpy = sinon.spy();
        commander.action(redoSpy, undoSpy);
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
        let commander = new Commander();
        let redoSpy1 = sinon.spy();
        let redoSpy2 = sinon.spy();
        let redoSpy3 = sinon.spy();
        let undoSpy1 = sinon.spy();
        let undoSpy2 = sinon.spy();
        let undoSpy3 = sinon.spy();
        commander.action(redoSpy1, undoSpy1);
        sinon.assert.calledOnce(redoSpy1);
        sinon.assert.notCalled(redoSpy2);
        sinon.assert.notCalled(redoSpy3);
        commander.action(redoSpy2, undoSpy2);
        sinon.assert.calledOnce(redoSpy1);
        sinon.assert.calledOnce(redoSpy2);
        sinon.assert.notCalled(redoSpy3);
        commander.action(redoSpy3, undoSpy3);
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
    it("should clear redo stack if a new action is pushed after an undo", () => {
        let commander = new Commander();
        let undoSpy = sinon.spy();
        let redoSpy = sinon.spy();
        commander.action(redoSpy, undoSpy); // [action1], []
        commander.action(() => {}, () => {}); // [action2, action1], []
        commander.undo(); // [action1], [action2]
        sinon.assert.calledOnce(redoSpy);
        sinon.assert.notCalled(undoSpy);
        commander.undo(); // [], [action1, action2]
        sinon.assert.calledOnce(redoSpy);
        sinon.assert.calledOnce(undoSpy);
        commander.redo(); // [action1], [action2]
        sinon.assert.calledTwice(redoSpy);
        sinon.assert.calledOnce(undoSpy);
        commander.action(() => {}, () => {}); // [action3, action1], []
        commander.undo(); // [action1], [action3]
        sinon.assert.calledTwice(redoSpy);
        sinon.assert.calledOnce(undoSpy);
        commander.undo(); // [], [action1, action3]
        sinon.assert.calledTwice(redoSpy);
        sinon.assert.calledTwice(undoSpy);
    });
});
