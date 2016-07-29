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
        expect(graph.blocks).to.have.lengthOf(0);
        expect(graph.connections).to.have.lengthOf(0);
        expect(graph.valueTypeByName("number")).to.be.not.null;
        expect(graph.valueTypeByName("string")).to.be.not.null;
        expect(graph.valueTypeByName("boolean")).to.be.not.null;
        expect(graph.valueTypeByName("object")).to.be.not.null;
        expect(graph.valueTypeByName("array")).to.be.not.null;
    });
    it("should create blocks", () => {
        const block = new Block({
            "id": "testId",
            "name": "Test",
            "templates": {
                "ValueType": ["number", "string"]
            }
        });
        expect(block.id).to.be.equal("testId");
        expect(block.type).to.be.equal("Block");
        expect(block.name).to.be.equal("Test");
        expect(block.templates).to.be.eql({
            "ValueType": ["number", "string"]
        });
        // Different ways of creating a block
        new Block();
        new Block({
            "id": "testId"
        });
        new Block({
            "name": "testId"
        });
        new Block({
            "templates": {
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
            const id = graph.nextId();
            if (typeof ids[id] !== "undefined") {
                throw new Error(id + " redefined");
            }
            ids[id] = true;
        }
    });
    it("should add blocks to a graph", () => {
        const graph = new Graph();
        const block = new Block();
        expect(block.id).to.be.null;
        graph.addBlock(block);
        expect(block.id).to.be.not.null;
        expect(graph.blocks[0]).to.be.equal(block);
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
        const outputPoint = new Point(false, {
            "name": "output",
            "valueType": "Whatever" // valueType is enforced only when adding to a block
        });
        expect(outputPoint.block).to.be.null;
        expect(outputPoint.output).to.be.true;
        expect(outputPoint.type).to.be.equal("Point");
        expect(outputPoint.name).to.be.equal("output");
        expect(outputPoint.valueType).to.be.equal("Whatever");
        expect(outputPoint.hasPolicy(PointPolicy.VALUE)).to.be.true;
        expect(outputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.true;
        expect(outputPoint.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)).to.be.false;
        expect(outputPoint.hasPolicy(PointPolicy.CONVERSION)).to.be.true;
        const inputPoint = new Point(true, {
            "name": "input",
            "valueType": "WhateverAgain", // valueType is enforced only when adding to a block
            "pointValue": {"whatever": true}, // value is enforced to valueType only when adding to a block,
            "policy": ["VALUE", "CONVERSION"]
        });
        expect(inputPoint.block).to.be.null;
        expect(inputPoint.output).to.be.false;
        expect(inputPoint.type).to.be.equal("Point");
        expect(inputPoint.name).to.be.equal("input");
        expect(inputPoint.valueType).to.be.equal("WhateverAgain");
        expect(inputPoint.value).to.be.eql({"whatever": true});
        expect(inputPoint.hasPolicy(PointPolicy.VALUE)).to.be.true;
        expect(inputPoint.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.false;
        expect(inputPoint.hasPolicy(PointPolicy.MULTIPLE_CONNECTIONS)).to.be.false;
        expect(inputPoint.hasPolicy(PointPolicy.CONVERSION)).to.be.true;
        // Ill-formed points
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            new Point(); // output is required
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            new Point(false, {
                "name": "output"
                // valueType is required
            });
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            new Point(false, {
                // name is required
                "valueType": "Whatever"
            });
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            new Point(false, {
                "name": false, // name must be a String
                "valueType": "Whatever"
            });
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            new Point(false, {
                "name": "output",
                "valueType": new Graph() // valueType must be a String
            });
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            new Point(false, {
                "name": "output",
                "valueType": "string",
                "policy": ["UNKNOWN_POLICY"] // Unknown point policy
            });
        }).to.throw();
        expect(() => {
            const graph = new Graph();
            const block = new Block();
            graph.addBlock(block);
            block.addPoint(new Point(true, {
                "name": "input2",
                "valueType": "WhateverAgain"
            }));
        }).to.throw();
        expect(() => {
            const graph = new Graph();
            const block = new Block();
            graph.addBlock(block);
            block.addPoint(new Point(true, {
                "name": "input2",
                "valueType": "string",
                "pointValue": Object
            }));
        }).to.throw();
        expect(() => {
            const graph = new Graph();
            const block = new Block({});
            graph.addBlock(block);
            block.addPoint(new Point(true, {
                "name": "input2",
                "template": "Whatever template"
            }));
        }).to.throw();
    });
    it("should add points to a block", () => {
        const graph = new Graph();
        const block = new Block();
        const outputPoint = new Point(false, {
            "name": "output",
            "valueType": "string"
        });
        expect(() => {
            block.addPoint(outputPoint); // The block must be added to the graph to accept points
        }).to.throw();
        graph.addBlock(block);
        block.addPoint(outputPoint);
        expect(block.outputs).to.have.lengthOf(1);
        expect(block.inputs).to.have.lengthOf(0);
        expect(() => {
            block.addPoint(new Point(false, {
                "name": "output", // Cannot add 2 outputs with the same name
                "valueType": "string"
            }));
        }).to.throw();
        block.addPoint(new Point(true, {
            "name": "output", // But can add an input with the same name as an output
            "valueType": "string"
        }));
        expect(block.outputs).to.have.lengthOf(1);
        expect(block.inputs).to.have.lengthOf(1);
        expect(() => {
            block.addPoint(new Point(true, {
                "name": "output", // But still cannot add 2 inputs with the same name
                "valueType": "string"
            }));
        }).to.throw();
        expect(() => {
            block.addPoint(new Point(true, {
                "name": "unknown_type", // But still cannot add 2 inputs with the same name
                "valueType": "UnknownType"
            }));
        }).to.throw();
    });
    it("should add points to a given position to a block", () => {
        const graph = new Graph();
        const block = new Block();
        graph.addBlock(block);
        const outputPoint1 = new Point(false, {
            "name": "out1",
            "valueType": "number"
        });
        const outputPoint2 = new Point(false, {
            "name": "out2",
            "valueType": "number"
        });
        const outputPoint3 = new Point(false, {
            "name": "out3",
            "valueType": "number"
        });
        const outputPoint4 = new Point(false, {
            "name": "out4",
            "valueType": "number"
        });
        const outputPoint5 = new Point(false, {
            "name": "out5",
            "valueType": "number"
        });
        block.addPoint(outputPoint4); // Add to end [4]
        block.addPoint(outputPoint2, 0); // Add to start [2, 4]
        block.addPoint(outputPoint1, 0); // Add to start [1, 2, 4]
        block.addPoint(outputPoint5); // Add to end [1, 2, 4, 5]
        block.addPoint(outputPoint3, 2); // Add to 2nd position [1, 2, 3, 4, 5]
        expect(block.outputs[0]).to.be.equal(outputPoint1);
        expect(block.outputs[1]).to.be.equal(outputPoint2);
        expect(block.outputs[2]).to.be.equal(outputPoint3);
        expect(block.outputs[3]).to.be.equal(outputPoint4);
        expect(block.outputs[4]).to.be.equal(outputPoint5);
    });
    it("should assign and test point value", () => {
        const graph = new Graph();
        const block = new Block();
        const inputPoint = new Point(false, {
            "name": "in",
            "valueType": "number"
        });
        graph.addBlock(block);
        block.addPoint(inputPoint);
        // Test value of type `Number`
        inputPoint.value = 42;
        expect(inputPoint.value).to.be.equal(42);
        inputPoint.value = NaN;
        expect(inputPoint.value).to.be.NaN;
        inputPoint.value = null;
        expect(inputPoint.value).to.be.null;
        inputPoint.value = Infinity;
        expect(inputPoint.value).to.be.equal(Infinity);
        inputPoint.value = -Infinity;
        expect(inputPoint.value).to.be.equal(-Infinity);
        // Test compatible value "32.444" with `Number`
        inputPoint.value = "32.444";
        expect(inputPoint.value).to.be.equal(32.444);
        inputPoint.value = true;
        expect(inputPoint.value).to.be.equal(1);
        expect(() => {
            inputPoint.value = "1234.435.12"; // "1234.435.12" =/=> `Number`
        }).to.throw();
        expect(() => {
            inputPoint.value = [3, true, {}];
        }).to.throw();
        const inputPoint2 = new Point(false, {
            "name": "in2",
            "valueType": "string",
            "pointValue": 42 // 42 =~=> `String`
        });
        block.addPoint(inputPoint2);
        expect(inputPoint2.value).to.be.equal("42");
        inputPoint2.value = 32;
        expect(inputPoint2.value).to.be.equal("32");
        inputPoint2.value = true;
        expect(inputPoint2.value).to.be.equal("true");
        expect(() => {
            block.addPoint(new Point(true, {
                "name": "in2",
                "valueType": "number",
                "pointValue": "NaN" // "NaN" =/=> `Number`
            }));
        }).to.throw();
    });
    it("should assign and test point value type", () => {
        const graph = new Graph();
        const block = new Block();
        const inputPoint = new Point(false, {
            "name": "in",
            "valueType": "number"
        });
        graph.addBlock(block);
        block.addPoint(inputPoint);
        inputPoint.value = 32;
        inputPoint.valueType = "string";
        expect(inputPoint.valueType).to.be.equal("string");
        expect(inputPoint.value).to.be.equal("32");
        expect(() => {
            inputPoint.valueType = "array";
        }).to.throw();
        inputPoint.value = null;
        inputPoint.valueType = "array";
        expect(inputPoint.valueType).to.be.equal("array");
        inputPoint.value = [32, [], {}];
        expect(inputPoint.value).to.be.eql([32, [], {}]);
        expect(() => {
            block.addPoint(new Point(false, {
                "name": "in2",
                "valueType": "UnknownValueType" // Unknown type
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
        inputPoint.value = null;
        inputPoint.valueType = "NewType";
        inputPoint.value = "NewValue";
        expect(inputPoint.valueType).to.be.equal("NewType");
        expect(inputPoint.value).to.be.equal("ThisIsACorrectNewValue");
        expect(() => {
            inputPoint.value = "NewNewValue"; // Only "NewValue" is accepted for `NewType`
        }).to.throw();
        // Reconvert to `String` as "ThisIsACorrectNewValue" is convertible to `String`
        inputPoint.valueType = "string";
        expect(inputPoint.value).to.be.equal("ThisIsACorrectNewValue");
        inputPoint.value = "NewValue";
        expect(inputPoint.value).to.be.equal("NewValue");
        // Reconvert to `NewType` as "NewValue" is acceptable as `NewType`
        inputPoint.valueType = "NewType";
        expect(inputPoint.valueType).to.be.equal("NewType");
        expect(inputPoint.value).to.be.equal("ThisIsACorrectNewValue");
    });
    it("should connect points of same type", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint1 = new Point(false, {
            "name": "out",
            "valueType": "number"
        });
        const inputPoint1 = new Point(true, {
            "name": "in",
            "valueType": "number"
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
        expect(graph.connections).to.have.lengthOf(1);
        expect(outputPoint1.connections).to.have.lengthOf(1);
        expect(inputPoint1.connections).to.have.lengthOf(1);
        expect(graph.connections[0]).to.be.equal(connection);
        expect(outputPoint1.connections[0]).to.be.equal(connection);
        expect(inputPoint1.connections[0]).to.be.equal(connection);
        expect(connection.outputPoint).to.be.equal(outputPoint1);
        expect(connection.inputPoint).to.be.equal(inputPoint1);
        expect(graph.connectionForPoints(inputPoint1, outputPoint1)).to.be.equal(connection);
    });
    it("should disconnect points of same type", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint1 = new Point(false, {
            "name": "out",
            "valueType": "number"
        });
        const inputPoint1 = new Point(true, {
            "name": "in",
            "valueType": "number"
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
        expect(graph.connections).to.have.lengthOf(1);
        outputPoint1.disconnect(inputPoint1);
        expect(graph.connections).to.have.lengthOf(0);
        expect(outputPoint1.connections).to.have.lengthOf(0);
        expect(inputPoint1.connections).to.have.lengthOf(0);
        expect(graph.connectionForPoints(outputPoint1, inputPoint1)).to.be.equal(null);
    });
    it("should ensure connect/disconnect commutativity", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint1 = new Point(false, {
            "name": "out",
            "valueType": "number"
        });
        const inputPoint2 = new Point(true, {
            "name": "in",
            "valueType": "number"
        });
        block1.addPoint(outputPoint1);
        block2.addPoint(inputPoint2);
        outputPoint1.connect(inputPoint2);
        expect(graph.connections).to.have.lengthOf(1);
        expect(outputPoint1.connections).to.have.lengthOf(1);
        expect(inputPoint2.connections).to.have.lengthOf(1);
        outputPoint1.disconnect(inputPoint2);
        expect(graph.connections).to.have.lengthOf(0);
        expect(outputPoint1.connections).to.have.lengthOf(0);
        expect(inputPoint2.connections).to.have.lengthOf(0);
        inputPoint2.connect(outputPoint1);
        expect(graph.connections).to.have.lengthOf(1);
        expect(outputPoint1.connections).to.have.lengthOf(1);
        expect(inputPoint2.connections).to.have.lengthOf(1);
        inputPoint2.disconnect(outputPoint1);
        expect(graph.connections).to.have.lengthOf(0);
        expect(outputPoint1.connections).to.have.lengthOf(0);
        expect(inputPoint2.connections).to.have.lengthOf(0);
        outputPoint1.connect(inputPoint2);
        expect(graph.connections).to.have.lengthOf(1);
        expect(outputPoint1.connections).to.have.lengthOf(1);
        expect(inputPoint2.connections).to.have.lengthOf(1);
        inputPoint2.disconnect(outputPoint1);
        expect(graph.connections).to.have.lengthOf(0);
        expect(outputPoint1.connections).to.have.lengthOf(0);
        expect(inputPoint2.connections).to.have.lengthOf(0);
        inputPoint2.connect(outputPoint1);
        expect(graph.connections).to.have.lengthOf(1);
        expect(outputPoint1.connections).to.have.lengthOf(1);
        expect(inputPoint2.connections).to.have.lengthOf(1);
        outputPoint1.disconnect(inputPoint2);
        expect(graph.connections).to.have.lengthOf(0);
        expect(outputPoint1.connections).to.have.lengthOf(0);
        expect(inputPoint2.connections).to.have.lengthOf(0);
    });
    it("should connect compatible types", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint1Number = new Point(false, {
            "name": "out",
            "valueType": "number"
        });
        const outputPoint1Boolean = new Point(false, {
            "name": "out3",
            "valueType": "boolean"
        });
        const outputPoint1String = new Point(false, {
            "name": "out4",
            "valueType": "string"
        });
        const inputPoint2Number = new Point(true, {
            "name": "in",
            "valueType": "number"
        });
        const inputPoint2Boolean = new Point(true, {
            "name": "in2",
            "valueType": "boolean"
        });
        const inputPoint2String = new Point(true, {
            "name": "in3",
            "valueType": "string"
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
        // Connection other
        const connection = outputPoint1Number.connect(inputPoint2Number); // `Number` =~=> `Boolean`
        expect(() => {
            connection.other(outputPoint1Boolean); // outputPoint1Boolean is not part of this connection
        }).to.throw();
    });
    it("should ensure we cannot mix connect and point value", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint = new Point(false, {
            "name": "out",
            "valueType": "number"
        });
        const inputPoint = new Point(true, {
            "name": "in",
            "valueType": "number"
        });
        block1.addPoint(outputPoint);
        block2.addPoint(inputPoint);
        inputPoint.value = 32;
        expect(() => {
            outputPoint.connect(inputPoint); // Cannot connect a point with a non-null value
        }).to.throw();
        expect(() => {
            inputPoint.connect(outputPoint); // Cannot connect a point with a non-null value (commutativity)
        }).to.throw();
        inputPoint.value = null;
        outputPoint.connect(inputPoint);
        expect(() => {
            inputPoint.value = 32; // Cannot assign value when a point is connected
        }).to.throw();
        outputPoint.disconnect(inputPoint);
        inputPoint.connect(outputPoint);
        expect(() => {
            outputPoint.value = 32; // Cannot assign value when a point is connected (commutativity)
        }).to.throw();
        inputPoint.disconnect(outputPoint);
    });
    it("should ensure connect conversion", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint11 = new Point(false, {
            "name": "out",
            "valueType": "number",
            "pointSingleConnection": false
        });
        const inputPoint21 = new Point(true, {
            "name": "in",
            "valueType": "number"
        });
        const inputPoint22 = new Point(true, {
            "name": "in2",
            "valueType": "boolean"
        });
        block1.addPoint(outputPoint11);
        block2.addPoint(inputPoint21);
        block2.addPoint(inputPoint22);
        outputPoint11.connect(inputPoint21); // `Number` => `Boolean`
    });
    it("should connect multiple points and disconnect them all", () => {
        const graph = new Graph();
        const block1 = new Block();
        const outputPoint1 = new Point(false, {
            "name": "out",
            "valueType": "number",
            "pointSingleConnection": false,
            "policy": ["VALUE", "MULTIPLE_CONNECTIONS", "CONVERSION"]
        });
        expect(outputPoint1.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.false;
        const outputPoint2 = new Point(false, {
            "name": "out2",
            "valueType": "number",
            "policy": ["VALUE", "SINGLE_CONNECTION", "CONVERSION"]
        });
        expect(outputPoint2.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.true;
        graph.addBlock(block1);
        block1.addPoint(outputPoint1);
        const block2 = new Block();
        const inputPoint1 = new Point(true, {
            "name": "in",
            "valueType": "number"
        });
        expect(inputPoint1.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.true;
        const inputPoint2 = new Point(true, {
            "name": "in2",
            "valueType": "number"
        });
        expect(inputPoint2.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.true;
        graph.addBlock(block2);
        block2.addPoint(inputPoint1);
        block2.addPoint(inputPoint2);
        outputPoint1.connect(inputPoint1);
        outputPoint1.connect(inputPoint2);
        expect(graph.connections).to.have.lengthOf(2);
        expect(outputPoint1.connections).to.have.lengthOf(2);
        expect(() => {
            inputPoint2.connect(outputPoint2);
        }).to.throw();
        outputPoint1.disconnectAll();
        expect(graph.connections).to.have.lengthOf(0);
        expect(outputPoint1.connections).to.have.lengthOf(0);
        outputPoint1.connect(inputPoint1);
        outputPoint1.connect(inputPoint2);
        expect(graph.connections).to.have.lengthOf(2);
        expect(outputPoint1.connections).to.have.lengthOf(2);
        outputPoint1.disconnect(inputPoint2);
        expect(graph.connections).to.have.lengthOf(1);
        expect(outputPoint1.connections).to.have.lengthOf(1);
    });
    it("should remove points from block", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const outputPoint1 = new Point(false, {
            "name": "out",
            "valueType": "number"
        });
        const inputPoint2 = new Point(true, {
            "name": "in",
            "valueType": "number"
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
        expect(graph.connections).to.have.lengthOf(1);
        expect(outputPoint1.connections).to.have.lengthOf(1);
        expect(inputPoint2.connections).to.have.lengthOf(1);
        expect(graph.connections[0]).to.be.equal(connection);
        expect(outputPoint1.connections[0]).to.be.equal(connection);
        expect(inputPoint2.connections[0]).to.be.equal(connection);
        expect(connection.outputPoint).to.be.equal(outputPoint1);
        expect(connection.inputPoint).to.be.equal(inputPoint2);
        block1.removePoint(outputPoint1);
        expect(graph.connections).to.have.lengthOf(0);
        expect(inputPoint2.connections).to.have.lengthOf(0);
    });
    it("should remove all block points", () => {
        const graph = new Graph();
        const block = new Block();
        graph.addBlock(block);
        block.addPoint(new Point(false, {
            "name": "out",
            "valueType": "number"
        }));
        block.addPoint(new Point(false, {
            "name": "out2",
            "valueType": "number"
        }));
        block.addPoint(new Point(false, {
            "name": "out3",
            "valueType": "number"
        }));
        block.addPoint(new Point(false, {
            "name": "out4",
            "valueType": "number"
        }));
        block.addPoint(new Point(false, {
            "name": "out5",
            "valueType": "number"
        }));
        block.addPoint(new Point(true, {
            "name": "in",
            "valueType": "number"
        }));
        block.addPoint(new Point(true, {
            "name": "in2",
            "valueType": "number"
        }));
        block.addPoint(new Point(true, {
            "name": "in3",
            "valueType": "number"
        }));
        expect(block.outputs).to.have.lengthOf(5);
        expect(block.inputs).to.have.lengthOf(3);
        block.removePoints();
        expect(block.outputs).to.have.lengthOf(0);
        expect(block.inputs).to.have.lengthOf(0);
    });
    it("should test block templates", () => {
        const graph = new Graph();
        expect(() => {
            const badBlock = new Block({
                "templates": {
                    "TemplateName": {} // `valueType` is required, `templates` is required
                }
            });
            graph.addBlock(badBlock);
        }).to.throw();
        expect(() => {
            const badBlock = new Block({
                "templates": {
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
                "templates": {
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
                "templates": {
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
                "templates": {
                    "TemplateName": {
                        "valueType": "UnknownType", // `valueType` must be a graph known type
                        "templates": ["UnknownType"]
                    }
                }
            });
            graph.addBlock(badBlock);
        }).to.throw();
        const block = new Block({
            "templates": {
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
            "templates": {
                "TemplateTest": {
                    "valueType": "number",
                    "templates": ["number", "string"]
                }
            }
        });
        graph.addBlock(block);
        const inputPoint11 = new Point(true, {
            "name": "in",
            "template": "TemplateTest",
            "valueType": null
        });
        const inputPoint12 = new Point(true, {
            "name": "in2",
            "template": "TemplateTest",
            "valueType": null
        });
        block.addPoint(inputPoint11);
        block.addPoint(inputPoint12);
        expect(inputPoint11.valueType).to.be.equals("number");
        expect(inputPoint12.valueType).to.be.equals("number");
        block.changeTemplate("TemplateTest", "string");
        expect(inputPoint11.valueType).to.be.equals("string");
        expect(inputPoint12.valueType).to.be.equals("string");
        inputPoint11.value = "I'm a String, and NotANumber";
        inputPoint12.value = "Me neither";
        expect(() => {
            block.changeTemplate("TemplateTest", "number"); // All points cannot safely be transformed to `Number`
        }).to.throw();
        inputPoint11.value = "64";
        inputPoint12.value = "32";
        block.changeTemplate("TemplateTest", "number"); // Now they can be transformed to `Number`
        expect(inputPoint11.value);
    });
    it("should test point templates and connections", () => {
        const graph = new Graph();
        const block1 = new Block({
            "templates": {
                "TemplateTest": {
                    "valueType": "number",
                    "templates": ["number", "string", "boolean"]
                }
            }
        });
        graph.addBlock(block1);
        const inputPoint11 = new Point(true, {
            "name": "in",
            "template": "TemplateTest"
        });
        const inputPoint12 = new Point(true, {
            "name": "in2",
            "template": "TemplateTest"
        });
        const inputPoint13 = new Point(true, {
            "name": "in3",
            "template": "TemplateTest"
        });
        block1.addPoint(inputPoint11);
        expect(inputPoint11.valueType).to.be.equals("number");
        block1.addPoint(inputPoint12);
        expect(inputPoint12.valueType).to.be.equals("number");
        block1.addPoint(inputPoint13);
        expect(inputPoint13.valueType).to.be.equals("number");
        const block2 = new Block();
        graph.addBlock(block2);
        const outputPointNumber = new Point(false, {
            "name": "out",
            "valueType": "number"
        });
        const outputPointString = new Point(false, {
            "name": "out2",
            "valueType": "string"
        });
        const outputPointBoolean = new Point(false, {
            "name": "out3",
            "valueType": "boolean"
        });
        const outputPointArray = new Point(false, {
            "name": "out4",
            "valueType": "array"
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
        inputPoint12.value = 32;
        block1.changeTemplate("TemplateTest", "string"); // inputPoint1_2 `TemplateTest:Number` =~=> `String`
        expect(inputPoint11.valueType).to.be.equal("string");
        expect(inputPoint12.valueType).to.be.equal("string");
        expect(inputPoint13.valueType).to.be.equal("string");
        expect(inputPoint12.value).to.be.equal("32");
        inputPoint12.value = null;
        outputPointBoolean.connect(inputPoint11); // inputPoint1_1 `Boolean` =~=> `TemplateTest:String`
        inputPoint12.value = false;
        inputPoint13.value = true;
        expect(inputPoint11.valueType).to.be.equal("string");
        expect(inputPoint12.valueType).to.be.equal("string");
        expect(inputPoint13.valueType).to.be.equal("string");
        expect(inputPoint12.value).to.be.equal("false");
        expect(inputPoint13.value).to.be.equal("true");
    });
    it("should test point templates and connections w/o conversion", () => {
        const graph = new Graph();
        const block1 = new Block({
            "templates": {
                "TemplateTest": {
                    "valueType": "string",
                    "templates": ["number", "string", "boolean"]
                }
            }
        });
        graph.addBlock(block1);
        const inputPoint11 = new Point(true, {
            "name": "in",
            "template": "TemplateTest"
        });
        const inputPoint12 = new Point(true, {
            "name": "in2",
            "template": "TemplateTest"
        });
        const inputPoint13 = new Point(true, {
            "name": "in3",
            "template": "TemplateTest"
        });
        block1.addPoint(inputPoint11);
        expect(inputPoint11.valueType).to.be.equals("string");
        block1.addPoint(inputPoint12);
        expect(inputPoint12.valueType).to.be.equals("string");
        block1.addPoint(inputPoint13);
        expect(inputPoint13.valueType).to.be.equals("string");
        const block2 = new Block();
        graph.addBlock(block2);
        const outputPointNumberConversion = new Point(false, {
            "name": "out1",
            "valueType": "number"
        });
        const outputPointNumberNoConversion = new Point(false, {
            "name": "out2",
            "valueType": "number",
            "policy": ["VALUE", "SINGLE_CONNECTION"]
        });
        const outputPointArrayNoConversion = new Point(false, {
            "name": "out3",
            "valueType": "array",
            "policy": ["VALUE", "SINGLE_CONNECTION"]
        });
        block2.addPoint(outputPointNumberConversion);
        expect(outputPointNumberConversion.valueType).to.be.equals("number");
        block2.addPoint(outputPointNumberNoConversion);
        expect(outputPointNumberNoConversion.valueType).to.be.equals("number");
        block2.addPoint(outputPointArrayNoConversion);
        expect(outputPointArrayNoConversion.valueType).to.be.equals("array");
        outputPointNumberConversion.connect(inputPoint11);
        expect(block1.templateByName("TemplateTest").valueType).to.be.equals("string");
        expect(outputPointNumberConversion.valueType).to.be.equals("number");
        expect(inputPoint11.valueType).to.be.equals("string");
        outputPointNumberNoConversion.connect(inputPoint12);
        expect(block1.templateByName("TemplateTest").valueType).to.be.equals("number");
        expect(outputPointNumberConversion.valueType).to.be.equals("number");
        expect(inputPoint11.valueType).to.be.equals("number");
        expect(inputPoint12.valueType).to.be.equals("number");
        expect(inputPoint13.valueType).to.be.equals("number");
        expect(() => {
            outputPointArrayNoConversion.connect(inputPoint13);
        }).to.throw();
    });
    it("should test point templates conversion failure", () => {
        class PPoint extends Point {
            constructor(a, b) {
                super(a, b);
            }
            changeValueType(newValueType, ignoreEmit) {
                if (newValueType !== "boolean") {
                    super.changeValueType(newValueType, ignoreEmit);
                } else {
                    throw new Error("failure for test");
                }
            }
        }
        const graph = new Graph();
        const block = new Block({
            "templates": {
                "TemplateName": {
                    "valueType": "number",
                    "templates": ["number", "boolean"]
                }
            }
        });
        const point1 = new Point(true, {"name": "in1", "template": "TemplateName", "pointValue": 2});
        const point2 = new Point(true, {"name": "in2", "template": "TemplateName", "pointValue": 0});
        const point3 = new PPoint(true, {"name": "in3", "template": "TemplateName", "pointValue": 1});
        const point4 = new Point(false, {"name": "out1", "template": "TemplateName", "pointValue": 4});

        graph.addBlock(block);
        block.addPoint(point1);
        block.addPoint(point2);
        block.addPoint(point3);
        block.addPoint(point4);

        expect(point1.valueType).to.be.equal("number");
        expect(point1.value).to.be.equal(2);
        expect(point2.valueType).to.be.equal("number");
        expect(point2.value).to.be.equal(0);
        expect(point3.valueType).to.be.equal("number");
        expect(point3.value).to.be.equal(1);
        expect(point4.valueType).to.be.equal("number");
        expect(point4.value).to.be.equal(4);

        expect(() => {
            block.changeTemplate("TemplateName", "boolean"); // 2 will be converted to true, then 0 to false and 1 will throw
        }).to.throw();

        expect(point1.valueType).to.be.equal("number");
        expect(point1.value).to.be.equal(2); // Must keep its original value and not the conversion from true => 1
        expect(point2.valueType).to.be.equal("number");
        expect(point2.value).to.be.equal(0);
        expect(point3.valueType).to.be.equal("number");
        expect(point3.value).to.be.equal(1);
        expect(point4.valueType).to.be.equal("number");
        expect(point4.value).to.be.equal(4);
    });
    it("should test PointPolicy", () => {
        const policy = PointPolicy.deserialize(["VALUE", "MULTIPLE_CONNECTIONS"]);
        expect(PointPolicy.has(policy, PointPolicy.VALUE)).to.be.true;
        expect(PointPolicy.has(policy, PointPolicy.SINGLE_CONNECTION)).to.be.false;
        expect(PointPolicy.has(policy, PointPolicy.MULTIPLE_CONNECTIONS)).to.be.true;
        expect(PointPolicy.has(policy, PointPolicy.CONVERSION)).to.be.false;
        const policyLabels = PointPolicy.serialize(policy);
        expect(policyLabels).to.include("VALUE");
        expect(policyLabels).to.not.include("SINGLE_CONNECTION");
        expect(policyLabels).to.include("MULTIPLE_CONNECTIONS");
        expect(policyLabels).to.not.include("CONVERSION");
    });
    it("should test point policy", () => {
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        const inputPoint1 = new Point(true, {
            "name": "in1",
            "valueType": "string"
        });
        const inputPoint2 = new Point(true, {
            "name": "in2",
            "valueType": "string",
            "policy": ["VALUE"]
        });
        const inputPoint3 = new Point(true, {
            "name": "in3",
            "valueType": "string",
            "policy": ["SINGLE_CONNECTION"]
        });
        const inputPoint4 = new Point(true, {
            "name": "in4",
            "valueType": "string",
            "policy": ["MULTIPLE_CONNECTIONS"]
        });
        const inputPoint5 = new Point(true, {
            "name": "in5",
            "valueType": "string",
            "policy": ["VALUE", "SINGLE_CONNECTION"]
        });
        const inputPoint6 = new Point(true, {
            "name": "in6",
            "valueType": "string",
            "policy": ["VALUE", "MULTIPLE_CONNECTIONS"]
        });
        const outputPoint1 = new Point(false, {
            "name": "out1",
            "valueType": "string"
        });
        const outputPoint2 = new Point(false, {
            "name": "out2",
            "valueType": "string"
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
        expect(inputPoint1.policy).to.be.equals(
            PointPolicy.VALUE |
            PointPolicy.SINGLE_CONNECTION |
            PointPolicy.CONVERSION
        );
        // VALUE
        inputPoint2.value = "Hello there";
        inputPoint2.value = null;
        expect(() => {
            inputPoint2.connect(outputPoint1);
        }).to.throw();
        // SINGLE_CONNECTION
        expect(() => {
            inputPoint3.value = "Hello there";
        }).to.throw();
        inputPoint3.connect(outputPoint1);
        expect(() => {
            inputPoint3.connect(outputPoint2);
        }).to.throw();
        inputPoint3.disconnect(outputPoint1);
        // MULTIPLE_CONNECTIONS
        expect(() => {
            inputPoint4.value = "Hello there";
        }).to.throw();
        inputPoint4.connect(outputPoint1);
        inputPoint4.connect(outputPoint2);
        inputPoint4.disconnect(outputPoint1);
        inputPoint4.disconnect(outputPoint2);
        // VALUE, SINGLE_CONNECTION
        inputPoint5.value = "Hello there";
        inputPoint5.value = null;
        inputPoint5.connect(outputPoint1);
        expect(() => {
            inputPoint5.connect(outputPoint2);
        }).to.throw();
        inputPoint5.disconnect(outputPoint1);
        // VALUE, MULTIPLE_CONNECTIONS
        inputPoint6.value = "Hello there";
        inputPoint6.value = null;
        inputPoint6.connect(outputPoint1);
        inputPoint6.connect(outputPoint2);
        inputPoint6.disconnect(outputPoint1);
        inputPoint6.disconnect(outputPoint2);
        // Cannot mix SINGLE_CONNECTION and MULTIPLE_CONNECTIONS
        expect(() => {
            new Point(true, {
                "name": "invalid1",
                "valueType": "string",
                "policy": ["SINGLE_CONNECTION", "MULTIPLE_CONNECTIONS"]
            });
        }).to.throw();
    });
    it("should remove block from graph", () => {
        const graph = new Graph();
        const block1 = new Block({
            "templates": {
                "TemplateTest": {
                    "valueType": "number",
                    "templates": ["number", "string"]
                }
            }
        });
        const block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        const inputPoint1 = new Point(true, {
            "name": "in",
            "template": "TemplateTest",
            "valueType": null
        });
        block1.addPoint(inputPoint1);
        const outputPoint2 = new Point(false, {
            "name": "out",
            "valueType": "number"
        });
        block2.addPoint(outputPoint2);
        outputPoint2.connect(inputPoint1);
        expect(graph.blocks).to.have.lengthOf(2);
        expect(graph.blockById(block1.id)).to.be.equals(block1);
        expect(graph.blockById(block2.id)).to.be.equals(block2);
        expect(graph.connections).to.have.lengthOf(1);
        expect(block1.inputs).to.have.lengthOf(1);
        expect(block2.outputs).to.have.lengthOf(1);
        expect(outputPoint2.connections).to.have.lengthOf(1);
        graph.removeBlock(block1);
        expect(graph.blocks).to.have.lengthOf(1);
        expect(graph.blockById(block1.id)).to.be.null;
        expect(graph.blockById(block2.id)).to.be.equals(block2);
        expect(graph.connections).to.have.lengthOf(0);
        expect(block1.inputs).to.have.lengthOf(0);
        expect(block2.outputs).to.have.lengthOf(1);
        expect(outputPoint2.connections).to.have.lengthOf(0);
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
                if (this.inputByName("variable").valueType !== this.inputByName("value").valueType) {
                    throw new Error("`" + this.fancyName + "` inputs `variable` and `value` must have the same valueType");
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

        block.addPoint(new StreamPoint(false, {"name": "out", "valueType": "stream"}));

        assignationBlock.addPoint(new StreamPoint(true, {"name": "in", "valueType": "stream"}));
        sinon.assert.called(pointAddedSpy);
        sinon.assert.calledWith(blockPointAddedSpy, assignationBlock.inputByName("in"));

        assignationBlock.addPoint(new Point(true, {"name": "variable", "valueType": "number"}));
        assignationBlock.addPoint(new Point(true, {"name": "value", "valueType": "number", "pointValue": 2}));
        expect(() => {
            assignationBlock.validatePoints();
        }).to.throw();
        assignationBlock.addPoint(new StreamPoint(false, {"name": "out", "valueType": "stream"}));
        assignationBlock.validatePoints();

        assignationBlock.inputByName("value").value = 4;
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
            "name": "Hello",
            "valueType": "string"
        });
        graph.addVariable(variable);
        expect(graph.variables).to.have.lengthOf(1);
        expect(graph.variableByName("Hello")).to.be.equal(variable);
        expect(() => {
            graph.addVariable(variable); // Duplicate name
        }).to.throw();
        graph.removeVariable(variable);
        expect(() => {
            graph.removeVariable(variable); // Already removed
        }).to.throw();
        expect(graph.variables).to.have.lengthOf(0);
        expect(graph.variableByName("Hello")).to.be.null;
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            graph.addVariable(new Variable({
                // variableType is missing
                // name is missing
            }));
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            graph.addVariable(new Variable({
                "name": "not",
                "valueType": 32 // valueType is not a String
            }));
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            graph.addVariable(new Variable({
                "name": 32, // name is not a String
                "valueType": "string"
            }));
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            graph.addVariable(new Variable({
                // name is missing
                "valueType": "string"
            }));
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            graph.addVariable(new Variable({
                "name": "no_type"
                // variableType is missing
            }));
        }).to.throw();
        expect(() => {
            graph.addVariable(new Variable({
                "variableType": "UnknownType",
                "name": "no_type"
            }));
        }).to.throw();
    });
    it("should create variable value", () => {
        const graph = new Graph();
        const variable = new Variable({
            "name": "Hello",
            "valueType": "string"
        });
        expect(() => {
            variable.value = 32; // Cannot change value when not bound to graph
        }).to.throw();
        graph.addVariable(variable);
        variable.value = "Hello"; // `String` ===> `String`
        expect(variable.value).to.be.equal("Hello");
        variable.value = 32; // `Number` =~=> `String`
        expect(variable.value).to.be.equal("32");
        expect(() => {
            variable.value = {}; // `Object` =/=> `String`
        }).to.throw();
    });
    it("should bind a block to a graph variable", () => {
        const graph = new Graph();
        const variable = new Variable({
            "name": "Hello",
            "valueType": "string"
        });
        graph.addVariable(variable);
        let block = new VariableBlock({
            "name": "Hello"
        });
        graph.addBlock(block);
        expect(variable.block).to.be.equal(block);
        expect(graph.blocks).to.have.lengthOf(1);
        expect(() => {
            graph.addBlock(new VariableBlock({
                "name": "Hello" // Duplicate block for Hello
            }));
        }).to.throw();
        graph.removeBlock(block);
        expect(variable.block).to.be.null;
        expect(graph.blocks).to.have.lengthOf(0);
        block = new VariableBlock({
            "name": "Hello"
        });
        graph.addBlock(block);
        expect(variable.block).to.be.equal(block);
        expect(graph.blocks).to.have.lengthOf(1);
        graph.removeVariable(variable); // Should remove all related blocks
        expect(graph.blocks).to.have.lengthOf(0);
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
        const point = new Point(false, {"name": "out", "valueType": "number"});
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
        const point = new Point(false, {"name": "out", "valueType": "number"});
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
        const point = new Point(false, {"name": "out", "valueType": "number"});
        graph.addBlock(block);
        block.addPoint(point);
        graph.on("point-value-type-change", graphSpy);
        point.on("value-type-change", pointSpy);
        point.valueType = "string";
        sinon.assert.calledWith(graphSpy, point, "string", "number");
        sinon.assert.calledWith(pointSpy, "string", "number");
    });
    it("should test point-value-change", () => {
        const graphSpy = sinon.spy();
        const pointSpy = sinon.spy();
        const graph = new Graph();
        const block = new Block();
        const point = new Point(false, {"name": "out", "valueType": "number"});
        graph.addBlock(block);
        block.addPoint(point);
        graph.on("point-value-change", graphSpy);
        point.on("value-change", pointSpy);
        point.value = 42;
        sinon.assert.calledWith(graphSpy, point, 42, null);
        sinon.assert.calledWith(pointSpy, 42, null);
    });
    it("should test point-connect", () => {
        const graphSpy = sinon.spy();
        const pointSpy = sinon.spy();
        const graph = new Graph();
        const block1 = new Block();
        const block2 = new Block();
        const point1 = new Point(false, {"name": "out", "valueType": "number"});
        const point2 = new Point(true, {"name": "in", "valueType": "number"});
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
        const point1 = new Point(false, {"name": "out", "valueType": "number"});
        const point2 = new Point(true, {"name": "in", "valueType": "number"});
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
            "templates": {
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
            "name": "variable",
            "valueType": "string"
        });
        graph.on("variable-add", spy);
        graph.addVariable(variable);
        sinon.assert.calledWith(spy, variable);
    });
    it("should test variable-remove", () => {
        const spy = sinon.spy();
        const graph = new Graph();
        const variable = new Variable({
            "name": "variable",
            "valueType": "string"
        });
        graph.on("variable-remove", spy);
        graph.addVariable(variable);
        graph.removeVariable(variable);
        sinon.assert.calledWith(spy, variable);
    });
});
