import {expect} from "chai";
import sinon from "sinon";
import {Graph, Block, Point, PointPolicy, Variable, VariableBlock} from "../src/dude-graph";

describe("dude-graph API", () => {
    /**
     *  Connection typing system (always output to input)
     *
     * `Number` ===> `Number` - Direct connection
     * `Number` =~=> `String` - Compatible connection
     * `String` =/=> `Number` - Impossible connection
     * `Template:String` =#=> `Number` - Template connection
     * `Template:String` =/=> `Array` - Impossible template connection
     */
    /**
     *  Value typing system
     *  `Number` ===> `Number` - Direct assignation
     *  `Number` =~=> `Number` - Conversion and assignation
     *  `Number` =/=> `Number` - Impossible assignation
     */
    it("should create a graph", () => {
        const graph = new Graph();
        expect(graph.graphBlocks).to.have.lengthOf(0);
        expect(graph.graphConnections).to.have.lengthOf(0);
        expect(graph.valueTypeByName("number")).to.be.not.null;
        expect(graph.valueTypeByName("string")).to.be.not.null;
        expect(graph.valueTypeByName("boolean")).to.be.not.null;
        expect(graph.valueTypeByName("object")).to.be.not.null;
        expect(graph.valueTypeByName("array")).to.be.not.null;
    });
    it("should create blocks", () => {
        const block = new Block({
            "blockId": "testId",
            "blockName": "Test",
            "blockTemplates": {
                "ValueType": ["number", "string"]
            }
        });
        expect(block.blockId).to.be.equal("testId");
        expect(block.blockType).to.be.equal("Block");
        expect(block.blockName).to.be.equal("Test");
        expect(block.blockTemplates).to.be.eql({
            "ValueType": ["number", "string"]
        });
        // Different ways of creating a block
        new Block();
        new Block({
            "blockId": "testId"
        });
        new Block({
            "blockName": "testId"
        });
        new Block({
            "blockTemplates": {
                "ValueType": ["number", "string"]
            }
        });
    });
    it("should test graph blocksByName and blocksByType", () => {
        class AssignationBlock extends Block {}
        const graph = new Graph();
        expect(graph.blocksByName("AssignationBlock")).to.have.lengthOf(0);
        expect(graph.blocksByType(AssignationBlock)).to.have.lengthOf(0);
        const block = new AssignationBlock();
        graph.addBlock(block);
        expect(graph.blocksByName("AssignationBlock")).to.have.lengthOf(1);
        expect(graph.blocksByType(AssignationBlock)).to.have.lengthOf(1);
    });
    it("should create block with unique ids", () => {
        const graph = new Graph();
        const ids = {};
        for (let i = 0; i < 100; i++) {
            const id = graph.nextBlockId();
            if (typeof ids[id] !== "undefined") {
                throw new Error(id + " redefined");
            }
            ids[id] = true;
        }
    });
    it("should add blocks to a graph", () => {
        const graph = new Graph();
        const block = new Block();
        expect(block.blockId).to.be.null;
        graph.addBlock(block);
        expect(block.blockId).to.be.not.null;
        expect(graph.graphBlocks[0]).to.be.equal(block);
        // Cannot add the same block again
        expect(() => {
            graph.addBlock(block);
        }).to.throw();
        const graph2 = new Graph();
        expect(() => {
            graph2.addBlock(block); // block is already in graph
        }).to.throw();
    });
    it("should create points", () => {
        const outputPoint = new Point(true, {
            "pointName": "output",
            "pointValueType": "Whatever" // pointValueType is enforced only when adding to a block
        });
        expect(outputPoint.pointBlock).to.be.null;
        expect(outputPoint.pointOutput).to.be.true;
        expect(outputPoint.pointType).to.be.equal("Point");
        expect(outputPoint.pointName).to.be.equal("output");
        expect(outputPoint.pointValueType).to.be.equal("Whatever");
        expect(outputPoint.hasPolicy(PointPolicy.VALUE)).to.be.true;
        expect(outputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.true;
        expect(outputPoint.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)).to.be.false;
        expect(outputPoint.hasPolicy(PointPolicy.CONVERSION)).to.be.true;
        const inputPoint = new Point(false, {
            "pointName": "input",
            "pointValueType": "WhateverAgain", // pointValueType is enforced only when adding to a block
            "pointValue": {"whatever": true}, // pointValue is enforced to valueType only when adding to a block,
            "pointPolicy": ["VALUE", "CONVERSION"]
        });
        expect(inputPoint.pointBlock).to.be.null;
        expect(inputPoint.pointOutput).to.be.false;
        expect(inputPoint.pointType).to.be.equal("Point");
        expect(inputPoint.pointName).to.be.equal("input");
        expect(inputPoint.pointValueType).to.be.equal("WhateverAgain");
        expect(inputPoint.pointValue).to.be.eql({"whatever": true});
        expect(inputPoint.hasPolicy(PointPolicy.VALUE)).to.be.true;
        expect(inputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.false;
        expect(inputPoint.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)).to.be.false;
        expect(inputPoint.hasPolicy(PointPolicy.CONVERSION)).to.be.true;
        // Ill-formed points
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            new Point(); // pointOutput is required
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            new Point(true, {
                "pointName": "output"
                // pointValueType is required
            });
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            new Point(true, {
                // pointName is required
                "pointValueType": "Whatever"
            });
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            new Point(true, {
                "pointName": false, // pointName must be a String
                "pointValueType": "Whatever"
            });
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            new Point(true, {
                "pointName": "output",
                "pointValueType": new Graph() // pointValueType must be a String
            });
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            new Point(true, {
                "pointName": "output",
                "pointValueType": "string",
                "pointPolicy": ["UNKNOWN_POLICY"] // Unknown point policy
            });
        }).to.throw();
        expect(() => {
            const graph = new Graph();
            const block = new Block();
            graph.addBlock(block);
            block.addPoint(new Point(false, {
                "pointName": "input2",
                "pointValueType": "WhateverAgain"
            }));
        }).to.throw();
        expect(() => {
            const graph = new Graph();
            const block = new Block();
            graph.addBlock(block);
            block.addPoint(new Point(false, {
                "pointName": "input2",
                "pointValueType": "string",
                "pointValue": Object
            }));
        }).to.throw();
        expect(() => {
            const graph = new Graph();
            const block = new Block({});
            graph.addBlock(block);
            block.addPoint(new Point(false, {
                "pointName": "input2",
                "pointTemplate": "Whatever template"
            }));
        }).to.throw();
    });
    it("should add points to a block", () => {
        const graph = new Graph();
        const block = new Block();
        const outputPoint = new Point(true, {
            "pointName": "output",
            "pointValueType": "string"
        });
        expect(() => {
            block.addPoint(outputPoint); // The block must be added to the graph to accept points
        }).to.throw();
        graph.addBlock(block);
        block.addPoint(outputPoint);
        expect(block.blockOutputs).to.have.lengthOf(1);
        expect(block.blockInputs).to.have.lengthOf(0);
        expect(() => {
            block.addPoint(new Point(true, {
                "pointName": "output", // Cannot add 2 outputs with the same name
                "pointValueType": "string"
            }));
        }).to.throw();
        block.addPoint(new Point(false, {
            "pointName": "output", // But can add an input with the same name as an output
            "pointValueType": "string"
        }));
        expect(block.blockOutputs).to.have.lengthOf(1);
        expect(block.blockInputs).to.have.lengthOf(1);
        expect(() => {
            block.addPoint(new Point(false, {
                "pointName": "output", // But still cannot add 2 inputs with the same name
                "pointValueType": "string"
            }));
        }).to.throw();
        expect(() => {
            block.addPoint(new Point(false, {
                "pointName": "unknown_type", // But still cannot add 2 inputs with the same name
                "pointValueType": "UnknownType"
            }));
        }).to.throw();
    });
    it("should add points to a given position to a block", () => {
        const graph = new Graph();
        const block = new Block();
        graph.addBlock(block);
        const outputPoint1 = new Point(true, {
            "pointName": "out1",
            "pointValueType": "number"
        });
        const outputPoint2 = new Point(true, {
            "pointName": "out2",
            "pointValueType": "number"
        });
        const outputPoint3 = new Point(true, {
            "pointName": "out3",
            "pointValueType": "number"
        });
        const outputPoint4 = new Point(true, {
            "pointName": "out4",
            "pointValueType": "number"
        });
        const outputPoint5 = new Point(true, {
            "pointName": "out5",
            "pointValueType": "number"
        });
        block.addPoint(outputPoint4); // Add to end [4]
        block.addPoint(outputPoint2, 0); // Add to start [2, 4]
        block.addPoint(outputPoint1, 0); // Add to start [1, 2, 4]
        block.addPoint(outputPoint5); // Add to end [1, 2, 4, 5]
        block.addPoint(outputPoint3, 2); // Add to 2nd position [1, 2, 3, 4, 5]
        expect(block.blockOutputs[0]).to.be.equal(outputPoint1);
        expect(block.blockOutputs[1]).to.be.equal(outputPoint2);
        expect(block.blockOutputs[2]).to.be.equal(outputPoint3);
        expect(block.blockOutputs[3]).to.be.equal(outputPoint4);
        expect(block.blockOutputs[4]).to.be.equal(outputPoint5);
    });
    it("should assign and test point value", () => {
        const graph = new Graph();
        const block = new Block();
        const inputPoint = new Point(true, {
            "pointName": "in",
            "pointValueType": "number"
        });
        graph.addBlock(block);
        block.addPoint(inputPoint);
        // Test value of type `Number`
        inputPoint.pointValue = 42;
        expect(inputPoint.pointValue).to.be.equal(42);
        inputPoint.pointValue = NaN;
        expect(inputPoint.pointValue).to.be.NaN;
        inputPoint.pointValue = null;
        expect(inputPoint.pointValue).to.be.null;
        inputPoint.pointValue = Infinity;
        expect(inputPoint.pointValue).to.be.equal(Infinity);
        inputPoint.pointValue = -Infinity;
        expect(inputPoint.pointValue).to.be.equal(-Infinity);
        // Test compatible pointValue "32.444" with `Number`
        inputPoint.pointValue = "32.444";
        expect(inputPoint.pointValue).to.be.equal(32.444);
        inputPoint.pointValue = true;
        expect(inputPoint.pointValue).to.be.equal(1);
        expect(() => {
            inputPoint.pointValue = "1234.435.12"; // "1234.435.12" =/=> `Number`
        }).to.throw();
        expect(() => {
            inputPoint.pointValue = [3, true, {}];
        }).to.throw();
        const inputPoint2 = new Point(true, {
            "pointName": "in2",
            "pointValueType": "string",
            "pointValue": 42 // 42 =~=> `String`
        });
        block.addPoint(inputPoint2);
        expect(inputPoint2.pointValue).to.be.equal("42");
        inputPoint2.pointValue = 32;
        expect(inputPoint2.pointValue).to.be.equal("32");
        inputPoint2.pointValue = true;
        expect(inputPoint2.pointValue).to.be.equal("true");
        expect(() => {
            block.addPoint(new Point(false, {
                "pointName": "in2",
                "pointValueType": "number",
                "pointValue": "NaN" // "NaN" =/=> `Number`
            }));
        }).to.throw();
    });
    it("should assign and test point value type", () => {
        const graph = new Graph();
        const block = new Block();
        const inputPoint = new Point(true, {
            "pointName": "in",
            "pointValueType": "number"
        });
        graph.addBlock(block);
        block.addPoint(inputPoint);
        inputPoint.pointValue = 32;
        inputPoint.pointValueType = "string";
        expect(inputPoint.pointValueType).to.be.equal("string");
        expect(inputPoint.pointValue).to.be.equal("32");
        expect(() => {
            inputPoint.pointValueType = "array";
        }).to.throw();
        inputPoint.pointValue = null;
        inputPoint.pointValueType = "array";
        expect(inputPoint.pointValueType).to.be.equal("array");
        inputPoint.pointValue = [32, [], {}];
        expect(inputPoint.pointValue).to.be.eql([32, [], {}]);
        expect(() => {
            block.addPoint(new Point(true, {
                "pointName": "in2",
                "pointValueType": "UnknownValueType" // Unknown type
            }));
        }).to.throw();
        graph.addValueType({
            "typeName": "NewType",
            "typeConvert": function (value) {
                if (value === "NewValue") {
                    return "ThisIsACorrectNewValue";
                }
                return undefined;
            }
        });
        expect(() => {
            graph.addValueType({
                "typeName": "NewType", // Cannot add twice the same type name
                "typeConvert": () => {}
            });
        }).to.throw();
        inputPoint.pointValue = null;
        inputPoint.pointValueType = "NewType";
        inputPoint.pointValue = "NewValue";
        expect(inputPoint.pointValueType).to.be.equal("NewType");
        expect(inputPoint.pointValue).to.be.equal("ThisIsACorrectNewValue");
        expect(() => {
            inputPoint.pointValue = "NewNewValue"; // Only "NewValue" is accepted for `NewType`
        }).to.throw();
        // Reconvert to `String` as "ThisIsACorrectNewValue" is convertible to `String`
        inputPoint.pointValueType = "string";
        expect(inputPoint.pointValue).to.be.equal("ThisIsACorrectNewValue");
        inputPoint.pointValue = "NewValue";
        expect(inputPoint.pointValue).to.be.equal("NewValue");
        // Reconvert to `NewType` as "NewValue" is acceptable as `NewType`
        inputPoint.pointValueType = "NewType";
        expect(inputPoint.pointValueType).to.be.equal("NewType");
        expect(inputPoint.pointValue).to.be.equal("ThisIsACorrectNewValue");
    });
    it("should connect points of same type", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint1 = new Point(true, {
            "pointName": "out",
            "pointValueType": "number"
        });
        const inputPoint1 = new Point(false, {
            "pointName": "in",
            "pointValueType": "number"
        });
        expect(() => {
            outputPoint1.connect(inputPoint1); // The points are not bound to blocks
        }).to.throw();
        block1.addPoint(outputPoint1);
        expect(() => {
            outputPoint1.connect(inputPoint1); // inputPoint2 is not bound to a block
        }).to.throw();
        block2.addPoint(inputPoint1);
        const connection = outputPoint1.connect(inputPoint1);
        expect(graph.graphConnections).to.have.lengthOf(1);
        expect(outputPoint1.pointConnections).to.have.lengthOf(1);
        expect(inputPoint1.pointConnections).to.have.lengthOf(1);
        expect(graph.graphConnections[0]).to.be.equal(connection);
        expect(outputPoint1.pointConnections[0]).to.be.equal(connection);
        expect(inputPoint1.pointConnections[0]).to.be.equal(connection);
        expect(connection.connectionOutputPoint).to.be.equal(outputPoint1);
        expect(connection.connectionInputPoint).to.be.equal(inputPoint1);
        expect(graph.connectionForPoints(outputPoint1, inputPoint1)).to.be.equal(connection);
    });
    it("should disconnect points of same type", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint1 = new Point(true, {
            "pointName": "out",
            "pointValueType": "number"
        });
        const inputPoint1 = new Point(false, {
            "pointName": "in",
            "pointValueType": "number"
        });
        expect(() => {
            outputPoint1.disconnect(inputPoint1); // The points are not bound to blocks
        }).to.throw();
        block1.addPoint(outputPoint1);
        expect(() => {
            outputPoint1.disconnect(inputPoint1); // inputPoint2 is not bound to a block
        }).to.throw();
        block2.addPoint(inputPoint1);
        expect(() => {
            outputPoint1.disconnect(inputPoint1); // Cannot disconnect non connected points
        }).to.throw();
        expect(() => {
            inputPoint1.disconnect(outputPoint1); // Cannot disconnect non connected points
        }).to.throw();
        outputPoint1.connect(inputPoint1);
        expect(graph.graphConnections).to.have.lengthOf(1);
        outputPoint1.disconnect(inputPoint1);
        expect(graph.graphConnections).to.have.lengthOf(0);
        expect(outputPoint1.pointConnections).to.have.lengthOf(0);
        expect(inputPoint1.pointConnections).to.have.lengthOf(0);
        expect(graph.connectionForPoints(outputPoint1, inputPoint1)).to.be.equal(null);
    });
    it("should ensure connect/disconnect commutativity", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint1 = new Point(true, {
            "pointName": "out",
            "pointValueType": "number"
        });
        const inputPoint2 = new Point(false, {
            "pointName": "in",
            "pointValueType": "number"
        });
        block1.addPoint(outputPoint1);
        block2.addPoint(inputPoint2);
        outputPoint1.connect(inputPoint2);
        expect(graph.graphConnections).to.have.lengthOf(1);
        expect(outputPoint1.pointConnections).to.have.lengthOf(1);
        expect(inputPoint2.pointConnections).to.have.lengthOf(1);
        outputPoint1.disconnect(inputPoint2);
        expect(graph.graphConnections).to.have.lengthOf(0);
        expect(outputPoint1.pointConnections).to.have.lengthOf(0);
        expect(inputPoint2.pointConnections).to.have.lengthOf(0);
        inputPoint2.connect(outputPoint1);
        expect(graph.graphConnections).to.have.lengthOf(1);
        expect(outputPoint1.pointConnections).to.have.lengthOf(1);
        expect(inputPoint2.pointConnections).to.have.lengthOf(1);
        inputPoint2.disconnect(outputPoint1);
        expect(graph.graphConnections).to.have.lengthOf(0);
        expect(outputPoint1.pointConnections).to.have.lengthOf(0);
        expect(inputPoint2.pointConnections).to.have.lengthOf(0);
        outputPoint1.connect(inputPoint2);
        expect(graph.graphConnections).to.have.lengthOf(1);
        expect(outputPoint1.pointConnections).to.have.lengthOf(1);
        expect(inputPoint2.pointConnections).to.have.lengthOf(1);
        inputPoint2.disconnect(outputPoint1);
        expect(graph.graphConnections).to.have.lengthOf(0);
        expect(outputPoint1.pointConnections).to.have.lengthOf(0);
        expect(inputPoint2.pointConnections).to.have.lengthOf(0);
        inputPoint2.connect(outputPoint1);
        expect(graph.graphConnections).to.have.lengthOf(1);
        expect(outputPoint1.pointConnections).to.have.lengthOf(1);
        expect(inputPoint2.pointConnections).to.have.lengthOf(1);
        outputPoint1.disconnect(inputPoint2);
        expect(graph.graphConnections).to.have.lengthOf(0);
        expect(outputPoint1.pointConnections).to.have.lengthOf(0);
        expect(inputPoint2.pointConnections).to.have.lengthOf(0);
    });
    it("should connect compatible types", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint1Number = new Point(true, {
            "pointName": "out",
            "pointValueType": "number"
        });
        const outputPoint1Boolean = new Point(true, {
            "pointName": "out3",
            "pointValueType": "boolean"
        });
        const outputPoint1String = new Point(true, {
            "pointName": "out4",
            "pointValueType": "string"
        });
        const inputPoint2Number = new Point(false, {
            "pointName": "in",
            "pointValueType": "number"
        });
        const inputPoint2Boolean = new Point(false, {
            "pointName": "in2",
            "pointValueType": "boolean"
        });
        const inputPoint2String = new Point(false, {
            "pointName": "in3",
            "pointValueType": "string"
        });
        block1.addPoint(outputPoint1Number);
        block1.addPoint(outputPoint1Boolean);
        block1.addPoint(outputPoint1String);
        block2.addPoint(inputPoint2Number);
        block2.addPoint(inputPoint2Boolean);
        block2.addPoint(inputPoint2String);
        // Direct connection
        outputPoint1Number.connect(inputPoint2Number); // `Number` ===> `Number`
        outputPoint1Number.disconnect(inputPoint2Number);
        outputPoint1Boolean.connect(inputPoint2Boolean); // `Boolean` ===> `Boolean`
        outputPoint1Boolean.disconnect(inputPoint2Boolean);
        outputPoint1String.connect(inputPoint2String); // `String` ===> `String`
        outputPoint1String.disconnect(inputPoint2String);
        // Convert connection
        outputPoint1Number.connect(inputPoint2String); // `Number` =~=> `String`
        outputPoint1Number.disconnect(inputPoint2String);
        outputPoint1Boolean.connect(inputPoint2Number); // `Boolean` =~=> `Number`
        outputPoint1Boolean.disconnect(inputPoint2Number);
        outputPoint1Number.connect(inputPoint2Boolean); // `Number` =~=> `Boolean`
        outputPoint1Number.disconnect(inputPoint2Boolean);
        // Impossible connection
        expect(() => {
            outputPoint1String.connect(inputPoint2Number); // `String` =/=> `Number`
        }).to.throw();
        expect(() => {
            outputPoint1String.connect(inputPoint2Boolean); // `String` =/=> `Boolean`
        }).to.throw();
    });
    it("should ensure we cannot mix connect and point value", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint = new Point(true, {
            "pointName": "out",
            "pointValueType": "number"
        });
        const inputPoint = new Point(false, {
            "pointName": "in",
            "pointValueType": "number"
        });
        block1.addPoint(outputPoint);
        block2.addPoint(inputPoint);
        inputPoint.pointValue = 32;
        expect(() => {
            outputPoint.connect(inputPoint); // Cannot connect a point with a non-null pointValue
        }).to.throw();
        expect(() => {
            inputPoint.connect(outputPoint); // Cannot connect a point with a non-null pointValue (commutativity)
        }).to.throw();
        inputPoint.pointValue = null;
        outputPoint.connect(inputPoint);
        expect(() => {
            inputPoint.pointValue = 32; // Cannot assign pointValue when a point is connected
        }).to.throw();
        outputPoint.disconnect(inputPoint);
        inputPoint.connect(outputPoint);
        expect(() => {
            outputPoint.pointValue = 32; // Cannot assign pointValue when a point is connected (commutativity)
        }).to.throw();
        inputPoint.disconnect(outputPoint);
    });
    it("should ensure connect conversion", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint11 = new Point(true, {
            "pointName": "out",
            "pointValueType": "number",
            "pointSingleConnection": false
        });
        const inputPoint21 = new Point(false, {
            "pointName": "in",
            "pointValueType": "number"
        });
        const inputPoint22 = new Point(false, {
            "pointName": "in2",
            "pointValueType": "boolean"
        });
        block1.addPoint(outputPoint11);
        block2.addPoint(inputPoint21);
        block2.addPoint(inputPoint22);
        outputPoint11.connect(inputPoint21); // `Number` => `Boolean`
    });
    it("should connect multiple points and disconnect them all", () => {
        const graph = new Graph();
        const block1 = new Block();
        const outputPoint1 = new Point(true, {
            "pointName": "out",
            "pointValueType": "number",
            "pointSingleConnection": false,
            "pointPolicy": ["VALUE", "MULTIPLE_CONNECTIONS", "CONVERSION"]
        });
        expect(outputPoint1.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.false;
        const outputPoint2 = new Point(true, {
            "pointName": "out2",
            "pointValueType": "number",
            "pointPolicy": ["VALUE", "SINGLE_CONNECTION", "CONVERSION"]
        });
        expect(outputPoint2.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.true;
        graph.addBlock(block1);
        block1.addPoint(outputPoint1);
        const block2 = new Block();
        const inputPoint1 = new Point(false, {
            "pointName": "in",
            "pointValueType": "number"
        });
        expect(inputPoint1.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.true;
        const inputPoint2 = new Point(false, {
            "pointName": "in2",
            "pointValueType": "number"
        });
        expect(inputPoint2.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.true;
        graph.addBlock(block2);
        block2.addPoint(inputPoint1);
        block2.addPoint(inputPoint2);
        outputPoint1.connect(inputPoint1);
        outputPoint1.connect(inputPoint2);
        expect(graph.graphConnections).to.have.lengthOf(2);
        expect(outputPoint1.pointConnections).to.have.lengthOf(2);
        expect(() => {
            inputPoint2.connect(outputPoint2);
        }).to.throw();
        outputPoint1.disconnectAll();
        expect(graph.graphConnections).to.have.lengthOf(0);
        expect(outputPoint1.pointConnections).to.have.lengthOf(0);
        outputPoint1.connect(inputPoint1);
        outputPoint1.connect(inputPoint2);
        expect(graph.graphConnections).to.have.lengthOf(2);
        expect(outputPoint1.pointConnections).to.have.lengthOf(2);
        outputPoint1.disconnect(inputPoint2);
        expect(graph.graphConnections).to.have.lengthOf(1);
        expect(outputPoint1.pointConnections).to.have.lengthOf(1);
    });
    it("should remove points from block", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint1 = new Point(true, {
            "pointName": "out",
            "pointValueType": "number"
        });
        const inputPoint2 = new Point(false, {
            "pointName": "in",
            "pointValueType": "number"
        });
        block1.addPoint(outputPoint1);
        block2.addPoint(inputPoint2);
        expect(() => {
            block1.removePoint(inputPoint2); // inputPoint2 is not in block1
        }).to.throw();
        expect(() => {
            block2.removePoint(outputPoint1); // outputPoint1 is not in block2
        }).to.throw();
        block1.removePoint(outputPoint1);
        block2.removePoint(inputPoint2);
        block1.addPoint(outputPoint1);
        block2.addPoint(inputPoint2);
        const connection = outputPoint1.connect(inputPoint2);
        expect(graph.graphConnections).to.have.lengthOf(1);
        expect(outputPoint1.pointConnections).to.have.lengthOf(1);
        expect(inputPoint2.pointConnections).to.have.lengthOf(1);
        expect(graph.graphConnections[0]).to.be.equal(connection);
        expect(outputPoint1.pointConnections[0]).to.be.equal(connection);
        expect(inputPoint2.pointConnections[0]).to.be.equal(connection);
        expect(connection.connectionOutputPoint).to.be.equal(outputPoint1);
        expect(connection.connectionInputPoint).to.be.equal(inputPoint2);
        block1.removePoint(outputPoint1);
        expect(graph.graphConnections).to.have.lengthOf(0);
        expect(inputPoint2.pointConnections).to.have.lengthOf(0);
    });
    it("should remove all block points", () => {
        const graph = new Graph();
        const block = new Block();
        graph.addBlock(block);
        block.addPoint(new Point(true, {
            "pointName": "out",
            "pointValueType": "number"
        }));
        block.addPoint(new Point(true, {
            "pointName": "out2",
            "pointValueType": "number"
        }));
        block.addPoint(new Point(true, {
            "pointName": "out3",
            "pointValueType": "number"
        }));
        block.addPoint(new Point(true, {
            "pointName": "out4",
            "pointValueType": "number"
        }));
        block.addPoint(new Point(true, {
            "pointName": "out5",
            "pointValueType": "number"
        }));
        block.addPoint(new Point(false, {
            "pointName": "in",
            "pointValueType": "number"
        }));
        block.addPoint(new Point(false, {
            "pointName": "in2",
            "pointValueType": "number"
        }));
        block.addPoint(new Point(false, {
            "pointName": "in3",
            "pointValueType": "number"
        }));
        expect(block.blockOutputs).to.have.lengthOf(5);
        expect(block.blockInputs).to.have.lengthOf(3);
        block.removePoints();
        expect(block.blockOutputs).to.have.lengthOf(0);
        expect(block.blockInputs).to.have.lengthOf(0);
    });
    it("should test block templates", () => {
        const graph = new Graph();
        expect(() => {
            const badBlock = new Block({
                "blockTemplates": {
                    "TemplateName": {} // `valueType` is required, `templates` is required
                }
            });
            graph.addBlock(badBlock);
        }).to.throw();
        expect(() => {
            const badBlock = new Block({
                "blockTemplates": {
                    "TemplateName": {
                        "valueType": "number"
                        // `templates` is required
                    }
                }
            });
            graph.addBlock(badBlock);
        }).to.throw();
        expect(() => {
            const badBlock = new Block({
                "blockTemplates": {
                    "TemplateName": {
                        // `valueType` is required
                        "templates": ["number"]
                    }
                }
            });
            graph.addBlock(badBlock);
        }).to.throw();
        expect(() => {
            const badBlock = new Block({
                "blockTemplates": {
                    "TemplateName": {
                        "valueType": "string",
                        "templates": ["number", "boolean"] // `valueType` must be included in `templates`
                    }
                }
            });
            graph.addBlock(badBlock);
        }).to.throw();
        expect(() => {
            const badBlock = new Block({
                "blockTemplates": {
                    "TemplateName": {
                        "valueType": "UnknownType", // `valueType` must be a graph known type
                        "templates": ["UnknownType"]
                    }
                }
            });
            graph.addBlock(badBlock);
        }).to.throw();
        const block = new Block({
            "blockTemplates": {
                "TemplateTest": {
                    "valueType": "number",
                    "templates": ["number", "string"]
                }
            }
        });
        expect(() => {
            block.templateByName("TemplateTest"); // Cannot manipulate templates while not bound to a graph
        }).to.throw();
        expect(() => {
            block.changeTemplate("TemplateTest", "string"); // Cannot manipulate templates while not bound to a graph
        }).to.throw();
        graph.addBlock(block);
        block.changeTemplate("TemplateTest", "string");
        expect(block.templateByName("TemplateTest").valueType).to.equals("string");
        expect(block.templateByName("TemplateTest").templates).to.eql(["number", "string"]);
        block.changeTemplate("TemplateTest", "number");
        expect(block.templateByName("TemplateTest").valueType).to.equals("number");
        expect(block.templateByName("TemplateTest").templates).to.eql(["number", "string"]);
        block.changeTemplate("TemplateTest", "string");
        expect(block.templateByName("TemplateTest").valueType).to.equals("string");
        expect(block.templateByName("TemplateTest").templates).to.eql(["number", "string"]);
        expect(() => {
            block.changeTemplate("TemplateTest", "boolean"); // `TemplateTest` has no template `Boolean`
        }).to.throw();
    });
    it("should test point templates", () => {
        const graph = new Graph();
        const block = new Block({
            "blockTemplates": {
                "TemplateTest": {
                    "valueType": "number",
                    "templates": ["number", "string"]
                }
            }
        });
        graph.addBlock(block);
        const inputPoint11 = new Point(false, {
            "pointName": "in",
            "pointTemplate": "TemplateTest",
            "pointValueType": null
        });
        const inputPoint12 = new Point(false, {
            "pointName": "in2",
            "pointTemplate": "TemplateTest",
            "pointValueType": null
        });
        block.addPoint(inputPoint11);
        block.addPoint(inputPoint12);
        expect(inputPoint11.pointValueType).to.be.equals("number");
        expect(inputPoint12.pointValueType).to.be.equals("number");
        block.changeTemplate("TemplateTest", "string");
        expect(inputPoint11.pointValueType).to.be.equals("string");
        expect(inputPoint12.pointValueType).to.be.equals("string");
        inputPoint11.pointValue = "I'm a String, and NotANumber";
        inputPoint12.pointValue = "Me neither";
        expect(() => {
            block.changeTemplate("TemplateTest", "number"); // All points cannot safely be transformed to `Number`
        }).to.throw();
        inputPoint11.pointValue = "64";
        inputPoint12.pointValue = "32";
        block.changeTemplate("TemplateTest", "number"); // Now they can be transformed to `Number`
        expect(inputPoint11.pointValue);
    });
    it("should test point templates and connections", () => {
        const graph = new Graph();
        const block1 = new Block({
            "blockTemplates": {
                "TemplateTest": {
                    "valueType": "number",
                    "templates": ["number", "string", "boolean"]
                }
            }
        });
        graph.addBlock(block1);
        const inputPoint11 = new Point(false, {
            "pointName": "in",
            "pointTemplate": "TemplateTest"
        });
        const inputPoint12 = new Point(false, {
            "pointName": "in2",
            "pointTemplate": "TemplateTest"
        });
        const inputPoint13 = new Point(false, {
            "pointName": "in3",
            "pointTemplate": "TemplateTest"
        });
        block1.addPoint(inputPoint11);
        expect(inputPoint11.pointValueType).to.be.equals("number");
        block1.addPoint(inputPoint12);
        expect(inputPoint12.pointValueType).to.be.equals("number");
        block1.addPoint(inputPoint13);
        expect(inputPoint13.pointValueType).to.be.equals("number");
        const block2 = new Block();
        graph.addBlock(block2);
        const outputPointNumber = new Point(true, {
            "pointName": "out",
            "pointValueType": "number"
        });
        const outputPointString = new Point(true, {
            "pointName": "out2",
            "pointValueType": "string"
        });
        const outputPointBoolean = new Point(true, {
            "pointName": "out3",
            "pointValueType": "boolean"
        });
        const outputPointArray = new Point(true, {
            "pointName": "out4",
            "pointValueType": "array"
        });
        block2.addPoint(outputPointNumber);
        block2.addPoint(outputPointString);
        block2.addPoint(outputPointBoolean);
        block2.addPoint(outputPointArray);
        expect(() => {
            outputPointArray.connect(inputPoint11); // `Array` =/=> `TemplateTest:Number`
        }).to.throw();
        outputPointNumber.connect(inputPoint11); // `Number` ===> `TemplateTest:Number`
        outputPointNumber.disconnect(inputPoint11);
        inputPoint12.pointValue = 32;
        block1.changeTemplate("TemplateTest", "string"); // inputPoint1_2 `TemplateTest:Number` =~=> `String`
        expect(inputPoint11.pointValueType).to.be.equal("string");
        expect(inputPoint12.pointValueType).to.be.equal("string");
        expect(inputPoint13.pointValueType).to.be.equal("string");
        expect(inputPoint12.pointValue).to.be.equal("32");
        inputPoint12.pointValue = null;
        outputPointBoolean.connect(inputPoint11); // inputPoint1_1 `Boolean` =~=> `TemplateTest:String`
        inputPoint12.pointValue = false;
        inputPoint13.pointValue = true;
        expect(inputPoint11.pointValueType).to.be.equal("string");
        expect(inputPoint12.pointValueType).to.be.equal("string");
        expect(inputPoint13.pointValueType).to.be.equal("string");
        expect(inputPoint12.pointValue).to.be.equal("false");
        expect(inputPoint13.pointValue).to.be.equal("true");
    });
    it("should test point templates and connections w/o conversion", () => {
        const graph = new Graph();
        const block1 = new Block({
            "blockTemplates": {
                "TemplateTest": {
                    "valueType": "string",
                    "templates": ["number", "string", "boolean"]
                }
            }
        });
        graph.addBlock(block1);
        const inputPoint11 = new Point(false, {
            "pointName": "in",
            "pointTemplate": "TemplateTest"
        });
        const inputPoint12 = new Point(false, {
            "pointName": "in2",
            "pointTemplate": "TemplateTest"
        });
        const inputPoint13 = new Point(false, {
            "pointName": "in3",
            "pointTemplate": "TemplateTest"
        });
        block1.addPoint(inputPoint11);
        expect(inputPoint11.pointValueType).to.be.equals("string");
        block1.addPoint(inputPoint12);
        expect(inputPoint12.pointValueType).to.be.equals("string");
        block1.addPoint(inputPoint13);
        expect(inputPoint13.pointValueType).to.be.equals("string");
        const block2 = new Block();
        graph.addBlock(block2);
        const outputPointNumberConversion = new Point(true, {
            "pointName": "out1",
            "pointValueType": "number"
        });
        const outputPointNumberNoConversion = new Point(true, {
            "pointName": "out2",
            "pointValueType": "number",
            "pointPolicy": ["VALUE", "SINGLE_CONNECTION"]
        });
        const outputPointArrayNoConversion = new Point(true, {
            "pointName": "out3",
            "pointValueType": "array",
            "pointPolicy": ["VALUE", "SINGLE_CONNECTION"]
        });
        block2.addPoint(outputPointNumberConversion);
        expect(outputPointNumberConversion.pointValueType).to.be.equals("number");
        block2.addPoint(outputPointNumberNoConversion);
        expect(outputPointNumberNoConversion.pointValueType).to.be.equals("number");
        block2.addPoint(outputPointArrayNoConversion);
        expect(outputPointArrayNoConversion.pointValueType).to.be.equals("array");
        outputPointNumberConversion.connect(inputPoint11);
        expect(block1.templateByName("TemplateTest").valueType).to.be.equals("string");
        expect(outputPointNumberConversion.pointValueType).to.be.equals("number");
        expect(inputPoint11.pointValueType).to.be.equals("string");
        outputPointNumberNoConversion.connect(inputPoint12);
        expect(block1.templateByName("TemplateTest").valueType).to.be.equals("number");
        expect(outputPointNumberConversion.pointValueType).to.be.equals("number");
        expect(inputPoint11.pointValueType).to.be.equals("number");
        expect(inputPoint12.pointValueType).to.be.equals("number");
        expect(inputPoint13.pointValueType).to.be.equals("number");
        expect(() => {
            outputPointArrayNoConversion.connect(inputPoint13);
        }).to.throw();
    });
    it("should test point policy", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        const inputPoint1 = new Point(false, {
            "pointName": "in1",
            "pointValueType": "string"
        });
        const inputPoint2 = new Point(false, {
            "pointName": "in2",
            "pointValueType": "string",
            "pointPolicy": ["VALUE"]
        });
        const inputPoint3 = new Point(false, {
            "pointName": "in3",
            "pointValueType": "string",
            "pointPolicy": ["SINGLE_CONNECTION"]
        });
        const inputPoint4 = new Point(false, {
            "pointName": "in4",
            "pointValueType": "string",
            "pointPolicy": ["MULTIPLE_CONNECTIONS"]
        });
        const inputPoint5 = new Point(false, {
            "pointName": "in5",
            "pointValueType": "string",
            "pointPolicy": ["VALUE", "SINGLE_CONNECTION"]
        });
        const inputPoint6 = new Point(false, {
            "pointName": "in6",
            "pointValueType": "string",
            "pointPolicy": ["VALUE", "MULTIPLE_CONNECTIONS"]
        });
        const outputPoint1 = new Point(true, {
            "pointName": "out1",
            "pointValueType": "string"
        });
        const outputPoint2 = new Point(true, {
            "pointName": "out2",
            "pointValueType": "string"
        });
        graph.addBlock(block1);
        graph.addBlock(block2);
        block1.addPoint(inputPoint1);
        block1.addPoint(inputPoint2);
        block1.addPoint(inputPoint3);
        block1.addPoint(inputPoint4);
        block1.addPoint(inputPoint5);
        block1.addPoint(inputPoint6);
        block2.addPoint(outputPoint1);
        block2.addPoint(outputPoint2);
        // Default policy (VALUE | SINGLE_CONNECTION | CONVERSION)
        expect(inputPoint1.pointPolicy).to.be.equals(
            PointPolicy.VALUE |
            PointPolicy.SINGLE_CONNECTION |
            PointPolicy.CONVERSION
        );
        // VALUE
        inputPoint2.pointValue = "Hello there";
        inputPoint2.pointValue = null;
        expect(() => {
            inputPoint2.connect(outputPoint1);
        }).to.throw();
        // SINGLE_CONNECTION
        expect(() => {
            inputPoint3.pointValue = "Hello there";
        }).to.throw();
        inputPoint3.connect(outputPoint1);
        expect(() => {
            inputPoint3.connect(outputPoint2);
        }).to.throw();
        inputPoint3.disconnect(outputPoint1);
        // MULTIPLE_CONNECTIONS
        expect(() => {
            inputPoint4.pointValue = "Hello there";
        }).to.throw();
        inputPoint4.connect(outputPoint1);
        inputPoint4.connect(outputPoint2);
        inputPoint4.disconnect(outputPoint1);
        inputPoint4.disconnect(outputPoint2);
        // VALUE, SINGLE_CONNECTION
        inputPoint5.pointValue = "Hello there";
        inputPoint5.pointValue = null;
        inputPoint5.connect(outputPoint1);
        expect(() => {
            inputPoint5.connect(outputPoint2);
        }).to.throw();
        inputPoint5.disconnect(outputPoint1);
        // VALUE, MULTIPLE_CONNECTIONS
        inputPoint6.pointValue = "Hello there";
        inputPoint6.pointValue = null;
        inputPoint6.connect(outputPoint1);
        inputPoint6.connect(outputPoint2);
        inputPoint6.disconnect(outputPoint1);
        inputPoint6.disconnect(outputPoint2);
        // Cannot mix SINGLE_CONNECTION and MULTIPLE_CONNECTIONS
        expect(() => {
            new Point(false, {
                "pointName": "invalid1",
                "pointValueType": "string",
                "pointPolicy": ["SINGLE_CONNECTION", "MULTIPLE_CONNECTIONS"]
            });
        }).to.throw();
    });
    it("should remove block from graph", () => {
        const graph = new Graph();
        const block1 = new Block({
            "blockTemplates": {
                "TemplateTest": {
                    "valueType": "number",
                    "templates": ["number", "string"]
                }
            }
        });
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const inputPoint1 = new Point(false, {
            "pointName": "in",
            "pointTemplate": "TemplateTest",
            "pointValueType": null
        });
        block1.addPoint(inputPoint1);
        const outputPoint2 = new Point(true, {
            "pointName": "out",
            "pointValueType": "number"
        });
        block2.addPoint(outputPoint2);
        outputPoint2.connect(inputPoint1);
        expect(graph.graphBlocks).to.have.lengthOf(2);
        expect(graph.blockById(block1.blockId)).to.be.equals(block1);
        expect(graph.blockById(block2.blockId)).to.be.equals(block2);
        expect(graph.graphConnections).to.have.lengthOf(1);
        expect(block1.blockInputs).to.have.lengthOf(1);
        expect(block2.blockOutputs).to.have.lengthOf(1);
        expect(outputPoint2.pointConnections).to.have.lengthOf(1);
        graph.removeBlock(block1);
        expect(graph.graphBlocks).to.have.lengthOf(1);
        expect(graph.blockById(block1.blockId)).to.be.null;
        expect(graph.blockById(block2.blockId)).to.be.equals(block2);
        expect(graph.graphConnections).to.have.lengthOf(0);
        expect(block1.blockInputs).to.have.lengthOf(0);
        expect(block2.blockOutputs).to.have.lengthOf(1);
        expect(outputPoint2.pointConnections).to.have.lengthOf(0);
    });
    it("should create custom block and custom point and test their callbacks", () => {
        // TODO: test acceptConnect
        const pointAddedSpy = sinon.spy();
        const pointConnectedSpy = sinon.spy();
        const pointDisconnectedSpy = sinon.spy();
        const pointRemovedSpy = sinon.spy();

        // TODO: test acceptConnect
        const blockAddedSpy = sinon.spy();
        const blockRemovedSpy = sinon.spy();
        const blockPointAddedSpy = sinon.spy();
        const blockPointConnectedSpy = sinon.spy();
        const blockPointValueChangedSpy = sinon.spy();
        const blockPointDisconnectedSpy = sinon.spy();
        const blockPointRemovedSpy = sinon.spy();

        class StreamPoint extends Point {
            added() { pointAddedSpy.apply(this, arguments); }
            connected() { pointConnectedSpy.apply(this, arguments); }
            disconnected() { pointDisconnectedSpy.apply(this, arguments); }
            removed() { pointRemovedSpy.apply(this, arguments); }
        }
        class AssignationBlock extends Block {
            added() { blockAddedSpy.apply(this, arguments); }
            removed() { blockRemovedSpy.apply(this, arguments); }
            pointAdded() { blockPointAddedSpy.apply(this, arguments); }
            pointConnected() { blockPointConnectedSpy.apply(this, arguments); }
            pointValueChanged() { blockPointValueChangedSpy.apply(this, arguments); }
            pointDisconnected() { blockPointDisconnectedSpy.apply(this, arguments); }
            pointRemoved() { blockPointRemovedSpy.apply(this, arguments); }
            validatePoints() {
                if (!(this.inputByName("in") instanceof StreamPoint)) {
                    throw new Error("`" + this.fancyName + "` must have an input `in` of type `Stream`");
                }
                if (!(this.inputByName("variable") instanceof Point)) {
                    throw new Error("`" + this.fancyName + "` must have an input `variable` of type `Point`");
                }
                if (!(this.inputByName("value") instanceof Point)) {
                    throw new Error("`" + this.fancyName + "` must have an input `value` of type `Point`");
                }
                if (this.inputByName("variable").pointValueType !== this.inputByName("value").pointValueType) {
                    throw new Error("`" + this.fancyName + "` inputs `variable` and `value` must have the same pointValueType");
                }
                if (!(this.outputByName("out") instanceof StreamPoint)) {
                    throw new Error("`" + this.fancyName + "` must have an output `out` of type `Stream`");
                }
            }
        }

        const graph = new Graph();
        const assignationBlock = new AssignationBlock();
        const block = new Block();
        graph.addBlock(assignationBlock);
        sinon.assert.called(blockAddedSpy);
        graph.addBlock(block);

        block.addPoint(new StreamPoint(true, {"pointName": "out", "pointValueType": "stream"}));

        assignationBlock.addPoint(new StreamPoint(false, {"pointName": "in", "pointValueType": "stream"}));
        sinon.assert.called(pointAddedSpy);
        sinon.assert.calledWith(blockPointAddedSpy, assignationBlock.inputByName("in"));

        assignationBlock.addPoint(new Point(false, {"pointName": "variable", "pointValueType": "number"}));
        assignationBlock.addPoint(new Point(false, {"pointName": "value", "pointValueType": "number", "pointValue": 2}));
        expect(() => {
            assignationBlock.validatePoints();
        }).to.throw();
        assignationBlock.addPoint(new StreamPoint(true, {"pointName": "out", "pointValueType": "stream"}));
        assignationBlock.validatePoints();

        assignationBlock.inputByName("value").pointValue = 4;
        sinon.assert.calledWith(blockPointValueChangedSpy, assignationBlock.inputByName("in"), 4, 2);

        assignationBlock.inputByName("in").connect(block.outputByName("out"));
        sinon.assert.calledWith(pointConnectedSpy, block.outputByName("out"));
        sinon.assert.calledWith(blockPointConnectedSpy, assignationBlock.inputByName("in"), block.outputByName("out"));

        assignationBlock.inputByName("in").disconnect(block.outputByName("out"));
        sinon.assert.calledWith(pointDisconnectedSpy, block.outputByName("out"));
        sinon.assert.calledWith(blockPointDisconnectedSpy, assignationBlock.inputByName("in"), block.outputByName("out"));

        const inPoint = assignationBlock.inputByName("in");
        assignationBlock.removePoint(inPoint);
        sinon.assert.called(pointRemovedSpy);
        sinon.assert.calledWith(blockPointRemovedSpy, inPoint);

        graph.removeBlock(assignationBlock);
        sinon.assert.called(blockRemovedSpy);
        graph.removeBlock(block);
    });
    it("should create and remove variables", () => {
        const graph = new Graph();
        const variable = new Variable({
            "variableName": "Hello",
            "variableValueType": "string"
        });
        graph.addVariable(variable);
        expect(graph.graphVariables).to.have.lengthOf(1);
        expect(graph.variableByName("Hello")).to.be.equal(variable);
        expect(() => {
            graph.addVariable(variable); // Duplicate name
        }).to.throw();
        graph.removeVariable(variable);
        expect(() => {
            graph.removeVariable(variable); // Already removed
        }).to.throw();
        expect(graph.graphVariables).to.have.lengthOf(0);
        expect(graph.variableByName("Hello")).to.be.null;
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            graph.addVariable(new Variable({
                // variableType is missing
                // variableName is missing
            }));
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            graph.addVariable(new Variable({
                "variableName": "not",
                "variableValueType": 32 // variableValueType is not a String
            }));
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            graph.addVariable(new Variable({
                "variableName": 32, // variableName is not a String
                "variableValueType": "string"
            }));
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            graph.addVariable(new Variable({
                // variableName is missing
                "variableValueType": "string"
            }));
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            graph.addVariable(new Variable({
                "variableName": "no_type"
                // variableType is missing
            }));
        }).to.throw();
        expect(() => {
            graph.addVariable(new Variable({
                "variableType": "UnknownType",
                "variableName": "no_type"
            }));
        }).to.throw();
    });
    it("should create variable value", () => {
        const graph = new Graph();
        const variable = new Variable({
            "variableName": "Hello",
            "variableValueType": "string"
        });
        expect(() => {
            variable.variableValue = 32; // Cannot change variableValue when not bound to graph
        }).to.throw();
        graph.addVariable(variable);
        variable.variableValue = "Hello"; // `String` ===> `String`
        expect(variable.variableValue).to.be.equal("Hello");
        variable.variableValue = 32; // `Number` =~=> `String`
        expect(variable.variableValue).to.be.equal("32");
        expect(() => {
            variable.variableValue = {}; // `Object` =/=> `String`
        }).to.throw();
    });
    it("should bind a VariableBlock to a graph variable", () => {
        const graph = new Graph();
        const variable = new Variable({
            "variableName": "Hello",
            "variableValueType": "string"
        });
        graph.addVariable(variable);
        let variableBlock = new VariableBlock({
            "blockName": "Hello"
        });
        graph.addBlock(variableBlock);
        expect(variable.variableBlock).to.be.equal(variableBlock);
        expect(graph.graphBlocks).to.have.lengthOf(1);
        expect(() => {
            graph.addBlock(new VariableBlock({
                "blockName": "Hello" // Duplicate VariableBlock for Hello
            }));
        }).to.throw();
        graph.removeBlock(variableBlock);
        expect(variable.variableBlock).to.be.null;
        expect(graph.graphBlocks).to.have.lengthOf(0);
        variableBlock = new VariableBlock({
            "blockName": "Hello"
        });
        graph.addBlock(variableBlock);
        expect(variable.variableBlock).to.be.equal(variableBlock);
        expect(graph.graphBlocks).to.have.lengthOf(1);
        graph.removeVariable(variable); // Should remove all related blocks
        expect(graph.graphBlocks).to.have.lengthOf(0);
    });
});
describe("dude-graph Events", () => {
    it("should test block-add", () => {
        const spy = sinon.spy();
        const graph = new Graph();
        const block = new Block();
        graph.on("block-add", spy);
        graph.addBlock(block);
        sinon.assert.calledWith(spy, block);
    });
    it("should test block-remove", () => {
        const spy = sinon.spy();
        const graph = new Graph();
        const block = new Block();
        graph.on("block-remove", spy);
        graph.addBlock(block);
        graph.removeBlock(block);
        sinon.assert.calledWith(spy, block);
    });
    it("should test point-add", () => {
        const graphSpy = sinon.spy();
        const blockSpy = sinon.spy();
        const graph = new Graph();
        const block = new Block();
        const point = new Point(true, {"pointName": "out", "pointValueType": "number"});
        graph.on("block-point-add", graphSpy);
        block.on("point-add", blockSpy);
        graph.addBlock(block);
        block.addPoint(point);
        sinon.assert.calledWith(graphSpy, block, point);
        sinon.assert.calledWith(blockSpy, point);
    });
    it("should test point-remove", () => {
        const graphSpy = sinon.spy();
        const blockSpy = sinon.spy();
        const graph = new Graph();
        const block = new Block();
        const point = new Point(true, {"pointName": "out", "pointValueType": "number"});
        graph.on("block-point-remove", graphSpy);
        block.on("point-remove", blockSpy);
        graph.addBlock(block);
        block.addPoint(point);
        block.removePoint(point);
        sinon.assert.calledWith(graphSpy, block, point);
        sinon.assert.calledWith(blockSpy, point);
    });
    it("should test point-value-type-change", () => {
        const graphSpy = sinon.spy();
        const pointSpy = sinon.spy();
        const graph = new Graph();
        const block = new Block();
        const point = new Point(true, {"pointName": "out", "pointValueType": "number"});
        graph.addBlock(block);
        block.addPoint(point);
        graph.on("point-value-type-change", graphSpy);
        point.on("value-type-change", pointSpy);
        point.pointValueType = "string";
        sinon.assert.calledWith(graphSpy, point, "string", "number");
        sinon.assert.calledWith(pointSpy, "string", "number");
    });
    it("should test point-value-change", () => {
        const graphSpy = sinon.spy();
        const pointSpy = sinon.spy();
        const graph = new Graph();
        const block = new Block();
        const point = new Point(true, {"pointName": "out", "pointValueType": "number"});
        graph.addBlock(block);
        block.addPoint(point);
        graph.on("point-value-change", graphSpy);
        point.on("value-change", pointSpy);
        point.pointValue = 42;
        sinon.assert.calledWith(graphSpy, point, 42, null);
        sinon.assert.calledWith(pointSpy, 42, null);
    });
    it("should test point-connect", () => {
        const graphSpy = sinon.spy();
        const pointSpy = sinon.spy();
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        const point1 = new Point(true, {"pointName": "out", "pointValueType": "number"});
        const point2 = new Point(false, {"pointName": "in", "pointValueType": "number"});
        graph.addBlock(block1);
        graph.addBlock(block2);
        block1.addPoint(point1);
        block2.addPoint(point2);
        graph.on("point-connect", graphSpy);
        point1.on("connect", pointSpy);
        const connection = point1.connect(point2);
        sinon.assert.calledWith(graphSpy, point1, connection);
        sinon.assert.calledWith(pointSpy, connection);
    });
    it("should test point-disconnect", () => {
        const graphSpy = sinon.spy();
        const pointSpy = sinon.spy();
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        const point1 = new Point(true, {"pointName": "out", "pointValueType": "number"});
        const point2 = new Point(false, {"pointName": "in", "pointValueType": "number"});
        graph.addBlock(block1);
        graph.addBlock(block2);
        block1.addPoint(point1);
        block2.addPoint(point2);
        graph.on("point-disconnect", graphSpy);
        point1.on("disconnect", pointSpy);
        const connection = point1.connect(point2);
        point1.disconnect(point2);
        sinon.assert.calledWith(graphSpy, point1, connection);
        sinon.assert.calledWith(pointSpy, connection);
    });
    it("should test block-template-update", () => {
        const graphSpy = sinon.spy();
        const blockSpy = sinon.spy();
        const graph = new Graph();
        const block = new Block({
            "blockTemplates": {
                "Test": {
                    "valueType": "number",
                    "templates": ["number", "string"]
                }
            }
        });
        graph.addBlock(block);
        graph.on("block-template-update", graphSpy);
        block.on("template-update", blockSpy);
        block.changeTemplate("Test", "string");
        sinon.assert.calledWith(graphSpy, block, "Test", "string", "number");
        sinon.assert.calledWith(blockSpy, "Test", "string", "number");
    });
    it("should test variable-add", () => {
        const spy = sinon.spy();
        const graph = new Graph();
        const variable = new Variable({
            "variableName": "variable",
            "variableValueType": "string"
        });
        graph.on("variable-add", spy);
        graph.addVariable(variable);
        sinon.assert.calledWith(spy, variable);
    });
    it("should test variable-remove", () => {
        const spy = sinon.spy();
        const graph = new Graph();
        const variable = new Variable({
            "variableName": "variable",
            "variableValueType": "string"
        });
        graph.on("variable-remove", spy);
        graph.addVariable(variable);
        graph.removeVariable(variable);
        sinon.assert.calledWith(spy, variable);
    });
});
