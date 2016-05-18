import {expect} from "chai";
import sinon from "sinon";
import {Graph, Block, Point, PointPolicy, Variable} from "../dude-graph-es6";
import {AssignationBlock, VariableBlock, StreamPoint} from "../dude-graph-es6";

describe("dude-graph api", () => {
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
    it("create graph", () => {
        var graph = new Graph();
        expect(graph.graphBlocks).to.have.length(0);
        expect(graph.graphConnections).to.have.length(0);
        expect(graph.valueTypeByName("Number")).to.be.not.null;
        expect(graph.valueTypeByName("String")).to.be.not.null;
        expect(graph.valueTypeByName("Boolean")).to.be.not.null;
        expect(graph.valueTypeByName("Object")).to.be.not.null;
        expect(graph.valueTypeByName("Array")).to.be.not.null;
    });
    it("create block", () => {
        var block = new Block({
            "blockId": "testId",
            "blockName": "Test",
            "blockTemplates": {
                "ValueType": ["Number", "String"]
            }
        });
        expect(block.blockId).to.be.equal("testId");
        expect(block.blockType).to.be.equal("Block");
        expect(block.blockName).to.be.equal("Test");
        expect(block.blockTemplates).to.be.eql({
            "ValueType": ["Number", "String"]
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
                "ValueType": ["Number", "String"]
            }
        });
    });
    it("graph blocksByName and blocksByType", () => {
        var graph = new Graph();
        expect(graph.blocksByName("AssignationBlock")).to.have.length(0);
        expect(graph.blocksByType(AssignationBlock)).to.have.length(0);
        var block = new AssignationBlock();
        graph.addBlock(block);
        expect(graph.blocksByName("AssignationBlock")).to.have.length(1);
        expect(graph.blocksByType(AssignationBlock)).to.have.length(1);
    });
    it("create block unique ids", () => {
        var graph = new Graph();
        var ids = {};
        for (var i = 0; i < 5000; i++) {
            var id = graph.nextBlockId();
            if (typeof ids[id] !== "undefined") {
                console.log(ids);
                throw new Error();
            }
            ids[id] = true;
        }
    });
    it("create graph block", () => {
        var graph = new Graph();
        var block = new Block();
        expect(block.blockId).to.be.null;
        graph.addBlock(block);
        expect(block.blockId).to.be.not.null;
        expect(graph.graphBlocks[0]).to.be.equal(block);
        // Cannot add the same block again
        expect(() => {
            graph.addBlock(block);
        }).to.throw();
    });
    it("create point", () => {
        var outputPoint = new Point(true, {
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
        var inputPoint = new Point(false, {
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
                "pointValueType": "String",
                "pointPolicy": ["UNKNOWN_POLICY"] // Unknown point policy
            });
        }).to.throw();
        expect(() => {
            var graph = new Graph();
            var block = new Block();
            graph.addBlock(block);
            block.addPoint(new Point(false, {
                "pointName": "input2",
                "pointValueType": "WhateverAgain"
            }));
        }).to.throw();
        expect(() => {
            var graph = new Graph();
            var block = new Block();
            graph.addBlock(block);
            block.addPoint(new Point(false, {
                "pointName": "input2",
                "pointValueType": "String",
                "pointValue": Object
            }));
        }).to.throw();
        expect(() => {
            var graph = new Graph();
            var block = new Block({});
            graph.addBlock(block);
            block.addPoint(new Point(false, {
                "pointName": "input2",
                "pointTemplate": "Whatever template"
            }));
        }).to.throw();
    });
    it("create block point", () => {
        var graph = new Graph();
        var block = new Block();
        var outputPoint = new Point(true, {
            "pointName": "output",
            "pointValueType": "String"
        });
        expect(() => {
            block.addPoint(outputPoint); // The block must be added to the graph to accept points
        }).to.throw();
        graph.addBlock(block);
        block.addPoint(outputPoint);
        expect(block.blockOutputs).to.have.length(1);
        expect(block.blockInputs).to.have.length(0);
        expect(() => {
            block.addPoint(new Point(true, {
                "pointName": "output", // Cannot add 2 outputs with the same name
                "pointValueType": "String"
            }));
        }).to.throw();
        block.addPoint(new Point(false, {
            "pointName": "output", // But can add an input with the same name as an output
            "pointValueType": "String"
        }));
        expect(block.blockOutputs).to.have.length(1);
        expect(block.blockInputs).to.have.length(1);
        expect(() => {
            block.addPoint(new Point(false, {
                "pointName": "output", // But still cannot add 2 inputs with the same name
                "pointValueType": "String"
            }));
        }).to.throw();
        expect(() => {
            block.addPoint(new Point(false, {
                "pointName": "unknown_type", // But still cannot add 2 inputs with the same name
                "pointValueType": "UnknownType"
            }));
        }).to.throw();
    });
    it("create block point at positions", () => {
        var graph = new Graph();
        var block = new Block();
        graph.addBlock(block);
        var outputPoint1 = new Point(true, {
            "pointName": "out1",
            "pointValueType": "Number"
        });
        var outputPoint2 = new Point(true, {
            "pointName": "out2",
            "pointValueType": "Number"
        });
        var outputPoint3 = new Point(true, {
            "pointName": "out3",
            "pointValueType": "Number"
        });
        var outputPoint4 = new Point(true, {
            "pointName": "out4",
            "pointValueType": "Number"
        });
        var outputPoint5 = new Point(true, {
            "pointName": "out5",
            "pointValueType": "Number"
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
    it("point value", () => {
        var graph = new Graph();
        var block = new Block();
        var inputPoint = new Point(true, {
            "pointName": "in",
            "pointValueType": "Number"
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
        var inputPoint2 = new Point(true, {
            "pointName": "in2",
            "pointValueType": "String",
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
                "pointValueType": "Number",
                "pointValue": "NaN" // "NaN" =/=> `Number`
            }));
        }).to.throw();
    });
    it("point value type", () => {
        var graph = new Graph();
        var block = new Block();
        var inputPoint = new Point(true, {
            "pointName": "in",
            "pointValueType": "Number"
        });
        graph.addBlock(block);
        block.addPoint(inputPoint);
        inputPoint.pointValue = 32;
        inputPoint.pointValueType = "String";
        expect(inputPoint.pointValueType).to.be.equal("String");
        expect(inputPoint.pointValue).to.be.equal("32");
        expect(() => {
            inputPoint.pointValueType = "Array";
        }).to.throw();
        inputPoint.pointValue = null;
        inputPoint.pointValueType = "Array";
        expect(inputPoint.pointValueType).to.be.equal("Array");
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
                "typeConvert": _.noop
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
        inputPoint.pointValueType = "String";
        expect(inputPoint.pointValue).to.be.equal("ThisIsACorrectNewValue");
        inputPoint.pointValue = "NewValue";
        expect(inputPoint.pointValue).to.be.equal("NewValue");
        // Reconvert to `NewType` as "NewValue" is acceptable as `NewType`
        inputPoint.pointValueType = "NewType";
        expect(inputPoint.pointValueType).to.be.equal("NewType");
        expect(inputPoint.pointValue).to.be.equal("ThisIsACorrectNewValue");
    });
    it("connect points of same type", () => {
        var graph = new Graph();
        var block1 = new Block();
        var block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        var outputPoint1 = new Point(true, {
            "pointName": "out",
            "pointValueType": "Number"
        });
        var inputPoint2 = new Point(false, {
            "pointName": "in",
            "pointValueType": "Number"
        });
        expect(() => {
            outputPoint1.connect(inputPoint2); // The points are not bound to blocks
        }).to.throw();
        block1.addPoint(outputPoint1);
        expect(() => {
            outputPoint1.connect(inputPoint2); // inputPoint2 is not bound to a block
        }).to.throw();
        block2.addPoint(inputPoint2);
        var connection = outputPoint1.connect(inputPoint2);
        expect(graph.graphConnections).to.have.length(1);
        expect(outputPoint1.pointConnections).to.have.length(1);
        expect(inputPoint2.pointConnections).to.have.length(1);
        expect(graph.graphConnections[0]).to.be.equal(connection);
        expect(outputPoint1.pointConnections[0]).to.be.equal(connection);
        expect(inputPoint2.pointConnections[0]).to.be.equal(connection);
        expect(connection.connectionOutputPoint).to.be.equal(outputPoint1);
        expect(connection.connectionInputPoint).to.be.equal(inputPoint2);
    });
    it("disconnect points of same type", () => {
        var graph = new Graph();
        var block1 = new Block();
        var block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        var outputPoint1 = new Point(true, {
            "pointName": "out",
            "pointValueType": "Number"
        });
        var inputPoint2 = new Point(false, {
            "pointName": "in",
            "pointValueType": "Number"
        });
        expect(() => {
            outputPoint1.disconnect(inputPoint2); // The points are not bound to blocks
        }).to.throw();
        block1.addPoint(outputPoint1);
        expect(() => {
            outputPoint1.disconnect(inputPoint2); // inputPoint2 is not bound to a block
        }).to.throw();
        block2.addPoint(inputPoint2);
        expect(() => {
            outputPoint1.disconnect(inputPoint2); // Cannot disconnect non connected points
        }).to.throw();
        expect(() => {
            inputPoint2.disconnect(outputPoint1); // Cannot disconnect non connected points
        }).to.throw();
        outputPoint1.connect(inputPoint2);
        expect(graph.graphConnections).to.have.length(1);
        outputPoint1.disconnect(inputPoint2);
        expect(graph.graphConnections).to.have.length(0);
        expect(outputPoint1.pointConnections).to.have.length(0);
        expect(inputPoint2.pointConnections).to.have.length(0);
    });
    it("connect/disconnect commutativity", () => {
        var graph = new Graph();
        var block1 = new Block();
        var block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        var outputPoint1 = new Point(true, {
            "pointName": "out",
            "pointValueType": "Number"
        });
        var inputPoint2 = new Point(false, {
            "pointName": "in",
            "pointValueType": "Number"
        });
        block1.addPoint(outputPoint1);
        block2.addPoint(inputPoint2);
        outputPoint1.connect(inputPoint2);
        expect(graph.graphConnections).to.have.length(1);
        expect(outputPoint1.pointConnections).to.have.length(1);
        expect(inputPoint2.pointConnections).to.have.length(1);
        outputPoint1.disconnect(inputPoint2);
        expect(graph.graphConnections).to.have.length(0);
        expect(outputPoint1.pointConnections).to.have.length(0);
        expect(inputPoint2.pointConnections).to.have.length(0);
        inputPoint2.connect(outputPoint1);
        expect(graph.graphConnections).to.have.length(1);
        expect(outputPoint1.pointConnections).to.have.length(1);
        expect(inputPoint2.pointConnections).to.have.length(1);
        inputPoint2.disconnect(outputPoint1);
        expect(graph.graphConnections).to.have.length(0);
        expect(outputPoint1.pointConnections).to.have.length(0);
        expect(inputPoint2.pointConnections).to.have.length(0);
        outputPoint1.connect(inputPoint2);
        expect(graph.graphConnections).to.have.length(1);
        expect(outputPoint1.pointConnections).to.have.length(1);
        expect(inputPoint2.pointConnections).to.have.length(1);
        inputPoint2.disconnect(outputPoint1);
        expect(graph.graphConnections).to.have.length(0);
        expect(outputPoint1.pointConnections).to.have.length(0);
        expect(inputPoint2.pointConnections).to.have.length(0);
        inputPoint2.connect(outputPoint1);
        expect(graph.graphConnections).to.have.length(1);
        expect(outputPoint1.pointConnections).to.have.length(1);
        expect(inputPoint2.pointConnections).to.have.length(1);
        outputPoint1.disconnect(inputPoint2);
        expect(graph.graphConnections).to.have.length(0);
        expect(outputPoint1.pointConnections).to.have.length(0);
        expect(inputPoint2.pointConnections).to.have.length(0);
    });
    it("connect compatible types", () => {
        var graph = new Graph();
        var block1 = new Block();
        var block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        var outputPoint1_Number = new Point(true, {
            "pointName": "out",
            "pointValueType": "Number"
        });
        var outputPoint1_Boolean = new Point(true, {
            "pointName": "out3",
            "pointValueType": "Boolean"
        });
        var outputPoint1_String = new Point(true, {
            "pointName": "out4",
            "pointValueType": "String"
        });
        var inputPoint2_Number = new Point(false, {
            "pointName": "in",
            "pointValueType": "Number"
        });
        var inputPoint2_Boolean = new Point(false, {
            "pointName": "in2",
            "pointValueType": "Boolean"
        });
        var inputPoint2_String = new Point(false, {
            "pointName": "in3",
            "pointValueType": "String"
        });
        block1.addPoint(outputPoint1_Number);
        block1.addPoint(outputPoint1_Boolean);
        block1.addPoint(outputPoint1_String);
        block2.addPoint(inputPoint2_Number);
        block2.addPoint(inputPoint2_Boolean);
        block2.addPoint(inputPoint2_String);
        // Direct connection
        outputPoint1_Number.connect(inputPoint2_Number); // `Number` ===> `Number`
        outputPoint1_Number.disconnect(inputPoint2_Number);
        outputPoint1_Boolean.connect(inputPoint2_Boolean); // `Boolean` ===> `Boolean`
        outputPoint1_Boolean.disconnect(inputPoint2_Boolean);
        outputPoint1_String.connect(inputPoint2_String); // `String` ===> `String`
        outputPoint1_String.disconnect(inputPoint2_String);
        // Convert connection
        outputPoint1_Number.connect(inputPoint2_String); // `Number` =~=> `String`
        outputPoint1_Number.disconnect(inputPoint2_String);
        outputPoint1_Boolean.connect(inputPoint2_Number); // `Boolean` =~=> `Number`
        outputPoint1_Boolean.disconnect(inputPoint2_Number);
        outputPoint1_Number.connect(inputPoint2_Boolean); // `Number` =~=> `Boolean`
        outputPoint1_Number.disconnect(inputPoint2_Boolean);
        // Impossible connection
        expect(() => {
            outputPoint1_String.connect(inputPoint2_Number); // `String` =/=> `Number`
        }).to.throw();
        expect(() => {
            outputPoint1_String.connect(inputPoint2_Boolean); // `String` =/=> `Boolean`
        }).to.throw();
    });
    it("cannot mix connect and point value", () => {
        var graph = new Graph();
        var block1 = new Block();
        var block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        var outputPoint = new Point(true, {
            "pointName": "out",
            "pointValueType": "Number"
        });
        var inputPoint = new Point(false, {
            "pointName": "in",
            "pointValueType": "Number"
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
    it("connect and value type", () => {
        var graph = new Graph();
        var block1 = new Block();
        var block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        var outputPoint1_1 = new Point(true, {
            "pointName": "out",
            "pointValueType": "Number",
            "pointSingleConnection": false
        });
        var inputPoint2_1 = new Point(false, {
            "pointName": "in",
            "pointValueType": "Number"
        });
        var inputPoint2_2 = new Point(false, {
            "pointName": "in2",
            "pointValueType": "Boolean"
        });
        block1.addPoint(outputPoint1_1);
        block2.addPoint(inputPoint2_1);
        block2.addPoint(inputPoint2_2);
        outputPoint1_1.connect(inputPoint2_1); // `Number` => `Boolean`
    });
    it("connect multiple points and disconnectAll", () => {
        var graph = new Graph();
        var block1 = new Block();
        var outputPoint1 = new Point(true, {
            "pointName": "out",
            "pointValueType": "Number",
            "pointSingleConnection": false,
            "pointPolicy": ["VALUE", "MULTIPLE_CONNECTIONS", "CONVERSION"]
        });
        expect(outputPoint1.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.false;
        var outputPoint2 = new Point(true, {
            "pointName": "out2",
            "pointValueType": "Number",
            "pointPolicy": ["VALUE", "SINGLE_CONNECTION", "CONVERSION"]
        });
        expect(outputPoint2.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.true;
        graph.addBlock(block1);
        block1.addPoint(outputPoint1);
        var block2 = new Block();
        var inputPoint1 = new Point(false, {
            "pointName": "in",
            "pointValueType": "Number"
        });
        expect(inputPoint1.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.true;
        var inputPoint2 = new Point(false, {
            "pointName": "in2",
            "pointValueType": "Number"
        });
        expect(inputPoint2.hasPolicy(PointPolicy.SINGLE_CONNECTION)).to.be.true;
        graph.addBlock(block2);
        block2.addPoint(inputPoint1);
        block2.addPoint(inputPoint2);
        outputPoint1.connect(inputPoint1);
        outputPoint1.connect(inputPoint2);
        expect(graph.graphConnections).to.have.length(2);
        expect(outputPoint1.pointConnections).to.have.length(2);
        expect(() => {
            inputPoint2.connect(outputPoint2);
        }).to.throw();
        outputPoint1.disconnectAll();
        expect(graph.graphConnections).to.have.length(0);
        expect(outputPoint1.pointConnections).to.have.length(0);
        outputPoint1.connect(inputPoint1);
        outputPoint1.connect(inputPoint2);
        expect(graph.graphConnections).to.have.length(2);
        expect(outputPoint1.pointConnections).to.have.length(2);
        outputPoint1.disconnect(inputPoint2);
        expect(graph.graphConnections).to.have.length(1);
        expect(outputPoint1.pointConnections).to.have.length(1);
    });
    it("remove block points", () => {
        var graph = new Graph();
        var block1 = new Block();
        var block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        var outputPoint1 = new Point(true, {
            "pointName": "out",
            "pointValueType": "Number"
        });
        var inputPoint2 = new Point(false, {
            "pointName": "in",
            "pointValueType": "Number"
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
        var connection = outputPoint1.connect(inputPoint2);
        expect(graph.graphConnections).to.have.length(1);
        expect(outputPoint1.pointConnections).to.have.length(1);
        expect(inputPoint2.pointConnections).to.have.length(1);
        expect(graph.graphConnections[0]).to.be.equal(connection);
        expect(outputPoint1.pointConnections[0]).to.be.equal(connection);
        expect(inputPoint2.pointConnections[0]).to.be.equal(connection);
        expect(connection.connectionOutputPoint).to.be.equal(outputPoint1);
        expect(connection.connectionInputPoint).to.be.equal(inputPoint2);
        block1.removePoint(outputPoint1);
        expect(graph.graphConnections).to.have.length(0);
        expect(inputPoint2.pointConnections).to.have.length(0);
    });
    it("remove all block points", () => {
        var graph = new Graph();
        var block = new Block();
        graph.addBlock(block);
        block.addPoint(new Point(true, {
            "pointName": "out",
            "pointValueType": "Number"
        }));
        block.addPoint(new Point(true, {
            "pointName": "out2",
            "pointValueType": "Number"
        }));
        block.addPoint(new Point(true, {
            "pointName": "out3",
            "pointValueType": "Number"
        }));
        block.addPoint(new Point(true, {
            "pointName": "out4",
            "pointValueType": "Number"
        }));
        block.addPoint(new Point(true, {
            "pointName": "out5",
            "pointValueType": "Number"
        }));
        block.addPoint(new Point(false, {
            "pointName": "in",
            "pointValueType": "Number"
        }));
        block.addPoint(new Point(false, {
            "pointName": "in2",
            "pointValueType": "Number"
        }));
        block.addPoint(new Point(false, {
            "pointName": "in3",
            "pointValueType": "Number"
        }));
        expect(block.blockOutputs).to.have.length(5);
        expect(block.blockInputs).to.have.length(3);
        block.removePoints();
        expect(block.blockOutputs).to.have.length(0);
        expect(block.blockInputs).to.have.length(0);
    });
    it("block templates", () => {
        var graph = new Graph();
        expect(() => {
            var badBlock = new Block({
                "blockTemplates": {
                    "TemplateName": {} // `valueType` is required, `templates` is required
                }
            });
            graph.addBlock(badBlock);
        }).to.throw();
        expect(() => {
            var badBlock = new Block({
                "blockTemplates": {
                    "TemplateName": {
                        "valueType": "Number"
                        // `templates` is required
                    }
                }
            });
            graph.addBlock(badBlock);
        }).to.throw();
        expect(() => {
            var badBlock = new Block({
                "blockTemplates": {
                    "TemplateName": {
                        // `valueType` is required
                        "templates": ["Number"]
                    }
                }
            });
            graph.addBlock(badBlock);
        }).to.throw();
        expect(() => {
            var badBlock = new Block({
                "blockTemplates": {
                    "TemplateName": {
                        "valueType": "String",
                        "templates": ["Number", "Boolean"] // `valueType` must be included in `templates`
                    }
                }
            });
            graph.addBlock(badBlock);
        }).to.throw();
        expect(() => {
            var badBlock = new Block({
                "blockTemplates": {
                    "TemplateName": {
                        "valueType": "UnknownType", // `valueType` must be a graph known type
                        "templates": ["UnknownType"]
                    }
                }
            });
            graph.addBlock(badBlock);
        }).to.throw();
        var block = new Block({
            "blockTemplates": {
                "TemplateTest": {
                    "valueType": "Number",
                    "templates": ["Number", "String"]
                }
            }
        });
        expect(() => {
            block.templateByName("TemplateTest"); // Cannot manipulate templates while not bound to a graph
        }).to.throw();
        expect(() => {
            block.changeTemplate("TemplateTest", "String"); // Cannot manipulate templates while not bound to a graph
        }).to.throw();
        graph.addBlock(block);
        block.changeTemplate("TemplateTest", "String");
        expect(block.templateByName("TemplateTest").valueType).to.equals("String");
        expect(block.templateByName("TemplateTest").templates).to.eql(["Number", "String"]);
        block.changeTemplate("TemplateTest", "Number");
        expect(block.templateByName("TemplateTest").valueType).to.equals("Number");
        expect(block.templateByName("TemplateTest").templates).to.eql(["Number", "String"]);
        block.changeTemplate("TemplateTest", "String");
        expect(block.templateByName("TemplateTest").valueType).to.equals("String");
        expect(block.templateByName("TemplateTest").templates).to.eql(["Number", "String"]);
        expect(() => {
            block.changeTemplate("TemplateTest", "Boolean"); // `TemplateTest` has no template `Boolean`
        }).to.throw();
    });
    it("point templates", () => {
        var graph = new Graph();
        var block = new Block({
            "blockTemplates": {
                "TemplateTest": {
                    "valueType": "Number",
                    "templates": ["Number", "String"]
                }
            }
        });
        graph.addBlock(block);
        var inputPoint1_1 = new Point(false, {
            "pointName": "in",
            "pointTemplate": "TemplateTest",
            "pointValueType": null
        });
        var inputPoint1_2 = new Point(false, {
            "pointName": "in2",
            "pointTemplate": "TemplateTest",
            "pointValueType": null
        });
        block.addPoint(inputPoint1_1);
        block.addPoint(inputPoint1_2);
        expect(inputPoint1_1.pointValueType).to.be.equals("Number");
        expect(inputPoint1_2.pointValueType).to.be.equals("Number");
        block.changeTemplate("TemplateTest", "String");
        expect(inputPoint1_1.pointValueType).to.be.equals("String");
        expect(inputPoint1_2.pointValueType).to.be.equals("String");
        inputPoint1_1.pointValue = "I'm a String, and NotANumber";
        inputPoint1_2.pointValue = "Me neither";
        expect(() => {
            block.changeTemplate("TemplateTest", "Number"); // All points cannot safely be transformed to `Number`
        }).to.throw();
        inputPoint1_1.pointValue = "64";
        inputPoint1_2.pointValue = "32";
        block.changeTemplate("TemplateTest", "Number"); // Now they can be transformed to `Number`
        expect(inputPoint1_1.pointValue);
    });
    it("point templates and connections", () => {
        var graph = new Graph();
        var block1 = new Block({
            "blockTemplates": {
                "TemplateTest": {
                    "valueType": "Number",
                    "templates": ["Number", "String", "Boolean"]
                }
            }
        });
        graph.addBlock(block1);
        var inputPoint1_1 = new Point(false, {
            "pointName": "in",
            "pointTemplate": "TemplateTest"
        });
        var inputPoint1_2 = new Point(false, {
            "pointName": "in2",
            "pointTemplate": "TemplateTest"
        });
        var inputPoint1_3 = new Point(false, {
            "pointName": "in3",
            "pointTemplate": "TemplateTest"
        });
        block1.addPoint(inputPoint1_1);
        expect(inputPoint1_1.pointValueType).to.be.equals("Number");
        block1.addPoint(inputPoint1_2);
        expect(inputPoint1_2.pointValueType).to.be.equals("Number");
        block1.addPoint(inputPoint1_3);
        expect(inputPoint1_3.pointValueType).to.be.equals("Number");
        var block2 = new Block();
        graph.addBlock(block2);
        var outputPointNumber = new Point(true, {
            "pointName": "out",
            "pointValueType": "Number"
        });
        var outputPointString = new Point(true, {
            "pointName": "out2",
            "pointValueType": "String"
        });
        var outputPointBoolean = new Point(true, {
            "pointName": "out3",
            "pointValueType": "Boolean"
        });
        var outputPointArray = new Point(true, {
            "pointName": "out4",
            "pointValueType": "Array"
        });
        block2.addPoint(outputPointNumber);
        block2.addPoint(outputPointString);
        block2.addPoint(outputPointBoolean);
        block2.addPoint(outputPointArray);
        expect(() => {
            outputPointArray.connect(inputPoint1_1); // `Array` =/=> `TemplateTest:Number`
        }).to.throw();
        outputPointNumber.connect(inputPoint1_1); // `Number` ===> `TemplateTest:Number`
        outputPointNumber.disconnect(inputPoint1_1);
        inputPoint1_2.pointValue = 32;
        block1.changeTemplate("TemplateTest", "String"); // inputPoint1_2 `TemplateTest:Number` =~=> `String`
        expect(inputPoint1_1.pointValueType).to.be.equal("String");
        expect(inputPoint1_2.pointValueType).to.be.equal("String");
        expect(inputPoint1_3.pointValueType).to.be.equal("String");
        expect(inputPoint1_2.pointValue).to.be.equal("32");
        inputPoint1_2.pointValue = null;
        outputPointBoolean.connect(inputPoint1_1); // inputPoint1_1 `Boolean` =~=> `TemplateTest:String`
        inputPoint1_2.pointValue = false;
        inputPoint1_3.pointValue = true;
        expect(inputPoint1_1.pointValueType).to.be.equal("String");
        expect(inputPoint1_2.pointValueType).to.be.equal("String");
        expect(inputPoint1_3.pointValueType).to.be.equal("String");
        expect(inputPoint1_2.pointValue).to.be.equal("false");
        expect(inputPoint1_3.pointValue).to.be.equal("true");
    });
    it("point templates and connections w/o conversion", () => {
        var graph = new Graph();
        var block1 = new Block({
            "blockTemplates": {
                "TemplateTest": {
                    "valueType": "String",
                    "templates": ["Number", "String", "Boolean"]
                }
            }
        });
        graph.addBlock(block1);
        var inputPoint1_1 = new Point(false, {
            "pointName": "in",
            "pointTemplate": "TemplateTest"
        });
        var inputPoint1_2 = new Point(false, {
            "pointName": "in2",
            "pointTemplate": "TemplateTest"
        });
        var inputPoint1_3 = new Point(false, {
            "pointName": "in3",
            "pointTemplate": "TemplateTest"
        });
        block1.addPoint(inputPoint1_1);
        expect(inputPoint1_1.pointValueType).to.be.equals("String");
        block1.addPoint(inputPoint1_2);
        expect(inputPoint1_2.pointValueType).to.be.equals("String");
        block1.addPoint(inputPoint1_3);
        expect(inputPoint1_3.pointValueType).to.be.equals("String");
        var block2 = new Block();
        graph.addBlock(block2);
        var outputPointNumberConversion = new Point(true, {
            "pointName": "out1",
            "pointValueType": "Number"
        });
        var outputPointNumberNoConversion = new Point(true, {
            "pointName": "out2",
            "pointValueType": "Number",
            "pointPolicy": ["VALUE", "SINGLE_CONNECTION"]
        });
        var outputPointArrayNoConversion = new Point(true, {
            "pointName": "out3",
            "pointValueType": "Array",
            "pointPolicy": ["VALUE", "SINGLE_CONNECTION"]
        });
        block2.addPoint(outputPointNumberConversion);
        expect(outputPointNumberConversion.pointValueType).to.be.equals("Number");
        block2.addPoint(outputPointNumberNoConversion);
        expect(outputPointNumberNoConversion.pointValueType).to.be.equals("Number");
        block2.addPoint(outputPointArrayNoConversion);
        expect(outputPointArrayNoConversion.pointValueType).to.be.equals("Array");
        outputPointNumberConversion.connect(inputPoint1_1);
        expect(block1.templateByName("TemplateTest").valueType).to.be.equals("String");
        expect(outputPointNumberConversion.pointValueType).to.be.equals("Number");
        expect(inputPoint1_1.pointValueType).to.be.equals("String");
        outputPointNumberNoConversion.connect(inputPoint1_2);
        expect(block1.templateByName("TemplateTest").valueType).to.be.equals("Number");
        expect(outputPointNumberConversion.pointValueType).to.be.equals("Number");
        expect(inputPoint1_1.pointValueType).to.be.equals("Number");
        expect(inputPoint1_2.pointValueType).to.be.equals("Number");
        expect(inputPoint1_3.pointValueType).to.be.equals("Number");
        expect(() => {
            outputPointArrayNoConversion.connect(inputPoint1_3);
        }).to.throw();
    });
    it("point policy", () => {
        var graph = new Graph();
        var block1 = new Block();
        var block2 = new Block();
        var inputPoint1 = new Point(false, {
            "pointName": "in1",
            "pointValueType": "String"
        });
        var inputPoint2 = new Point(false, {
            "pointName": "in2",
            "pointValueType": "String",
            "pointPolicy": ["VALUE"]
        });
        var inputPoint3 = new Point(false, {
            "pointName": "in3",
            "pointValueType": "String",
            "pointPolicy": ["SINGLE_CONNECTION"]
        });
        var inputPoint4 = new Point(false, {
            "pointName": "in4",
            "pointValueType": "String",
            "pointPolicy": ["MULTIPLE_CONNECTIONS"]
        });
        var inputPoint5 = new Point(false, {
            "pointName": "in5",
            "pointValueType": "String",
            "pointPolicy": ["VALUE", "SINGLE_CONNECTION"]
        });
        var inputPoint6 = new Point(false, {
            "pointName": "in6",
            "pointValueType": "String",
            "pointPolicy": ["VALUE", "MULTIPLE_CONNECTIONS"]
        });
        var outputPoint1 = new Point(true, {
            "pointName": "out1",
            "pointValueType": "String"
        });
        var outputPoint2 = new Point(true, {
            "pointName": "out2",
            "pointValueType": "String"
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
                "pointValueType": "String",
                "pointPolicy": ["SINGLE_CONNECTION", "MULTIPLE_CONNECTIONS"]
            });
        }).to.throw();
    });
    it("remove block", () => {
        var graph = new Graph();
        var block1 = new Block({
            "blockTemplates": {
                "TemplateTest": {
                    "valueType": "Number",
                    "templates": ["Number", "String"]
                }
            }
        });
        var block2 = new Block();
        graph.addBlock(block1);
        graph.addBlock(block2);
        var inputPoint1 = new Point(false, {
            "pointName": "in",
            "pointTemplate": "TemplateTest",
            "pointValueType": null
        });
        block1.addPoint(inputPoint1);
        var outputPoint2 = new Point(true, {
            "pointName": "out",
            "pointValueType": "Number"
        });
        block2.addPoint(outputPoint2);
        outputPoint2.connect(inputPoint1);
        expect(graph.graphBlocks).to.have.length(2);
        expect(graph.blockById(block1.blockId)).to.be.equals(block1);
        expect(graph.blockById(block2.blockId)).to.be.equals(block2);
        expect(graph.graphConnections).to.have.length(1);
        expect(block1.blockInputs).to.have.length(1);
        expect(block2.blockOutputs).to.have.length(1);
        expect(outputPoint2.pointConnections).to.have.length(1);
        graph.removeBlock(block1);
        expect(graph.graphBlocks).to.have.length(1);
        expect(graph.blockById(block1.blockId)).to.be.null;
        expect(graph.blockById(block2.blockId)).to.be.equals(block2);
        expect(graph.graphConnections).to.have.length(0);
        expect(block1.blockInputs).to.have.length(0);
        expect(block2.blockOutputs).to.have.length(1);
        expect(outputPoint2.pointConnections).to.have.length(0);
    });
    it("custom block and custom point", () => {
        var graph = new Graph();
        var assignationBlock = new AssignationBlock();
        graph.addBlock(assignationBlock);
        assignationBlock.addPoint(new StreamPoint(false, {"pointName": "in", "pointValueType": "Stream"}));
        assignationBlock.addPoint(new Point(false, {"pointName": "variable", "pointValueType": "Object"}));
        assignationBlock.addPoint(new Point(false, {"pointName": "value", "pointValueType": "Object"}));
        expect(() => {
            assignationBlock.validatePoints(); // Missing output "out `StreamPoint`"
        }).to.throw();
        assignationBlock.addPoint(new StreamPoint(true, {"pointName": "out", "pointValueType": "Stream"}));
        assignationBlock.validatePoints();
        expect(graph.blockById(assignationBlock.blockId) instanceof AssignationBlock).to.be.true;
        expect(assignationBlock.inputByName("in") instanceof StreamPoint).to.be.true;
        var pointValueChangedSpy = sinon.spy();
        var pointConnectedSpy = sinon.spy();
        var pointDisconnectedSpy = sinon.spy();
        var blockRemovedSpy = sinon.spy();
        var CustomBlock = class extends Block {
            pointValueChanged() { pointValueChangedSpy.apply(this, arguments); };
            pointConnected() { pointConnectedSpy.apply(this, arguments); };
            pointDisconnected() { pointDisconnectedSpy.apply(this, arguments); };
            removed() { blockRemovedSpy.apply(this, arguments); };
        };
        var customBlock = new CustomBlock();
        graph.addBlock(customBlock);
        var point1 = new Point(false, {"pointName": "in", "pointValueType": "Stream"});
        var point2 = new Point(false, {"pointName": "number", "pointValueType": "Number"});
        customBlock.addPoint(point1);
        customBlock.addPoint(point2);
        point1.connect(assignationBlock.outputByName("out"));
        sinon.assert.calledWith(pointConnectedSpy, point1, assignationBlock.outputByName("out"));
        point2.pointValue = 32;
        sinon.assert.calledWith(pointValueChangedSpy, point2, 32, null);
        point1.disconnectAll();
        sinon.assert.calledWith(pointDisconnectedSpy, point1, assignationBlock.outputByName("out"));
        graph.removeBlock(customBlock);
        sinon.assert.called(blockRemovedSpy);
    });
    it("create/remove variable", () => {
        var graph = new Graph();
        var variable = new Variable({
            "variableName": "Hello",
            "variableValueType": "String"
        });
        graph.addVariable(variable);
        expect(graph.graphVariables).to.have.length(1);
        expect(graph.variableByName("Hello")).to.be.equal(variable);
        expect(() => {
            graph.addVariable(variable); // Duplicate name
        }).to.throw();
        graph.removeVariable(variable);
        expect(() => {
            graph.removeVariable(variable); // Already removed
        }).to.throw();
        expect(graph.graphVariables).to.have.length(0);
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
                "variableValueType": "String"
            }));
        }).to.throw();
        expect(() => {
            //noinspection JSCheckFunctionSignatures
            graph.addVariable(new Variable({
                // variableName is missing
                "variableValueType": "String"
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
    it("variable value", () => {
        var graph = new Graph();
        var variable = new Variable({
            "variableName": "Hello",
            "variableValueType": "String"
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
    it("bind VariableBlock to graph variable", () => {
        var graph = new Graph();
        var variable = new Variable({
            "variableName": "Hello",
            "variableValueType": "String"
        });
        graph.addVariable(variable);
        var variableBlock = new VariableBlock({
            "blockName": "Hello"
        });
        graph.addBlock(variableBlock);
        expect(variable.variableBlock).to.be.equal(variableBlock);
        expect(graph.graphBlocks).to.have.length(1);
        expect(() => {
            graph.addBlock(new VariableBlock({
                "blockName": "Hello" // Duplicate VariableBlock for Hello
            }));
        }).to.throw();
        graph.removeBlock(variableBlock);
        expect(variable.variableBlock).to.be.null;
        expect(graph.graphBlocks).to.have.length(0);
        variableBlock = new VariableBlock({
            "blockName": "Hello"
        });
        graph.addBlock(variableBlock);
        expect(variable.variableBlock).to.be.equal(variableBlock);
        expect(graph.graphBlocks).to.have.length(1);
        graph.removeVariable(variable); // Should remove all related blocks
        expect(graph.graphBlocks).to.have.length(0);
    });
});
describe("dude-graph events", () => {
    it("block-add", () => {
        var spy = sinon.spy();
        var graph = new Graph();
        var block = new Block();
        graph.on("block-add", spy);
        graph.addBlock(block);
        sinon.assert.calledWith(spy, block);
    });
    it("block-remove", () => {
        var spy = sinon.spy();
        var graph = new Graph();
        var block = new Block();
        graph.on("block-remove", spy);
        graph.addBlock(block);
        graph.removeBlock(block);
        sinon.assert.calledWith(spy, block);
    });
    it("point-add", () => {
        var graphSpy = sinon.spy();
        var blockSpy = sinon.spy();
        var graph = new Graph();
        var block = new Block();
        var point = new Point(true, {"pointName": "out", "pointValueType": "Number"});
        graph.on("block-point-add", graphSpy);
        block.on("point-add", blockSpy);
        graph.addBlock(block);
        block.addPoint(point);
        sinon.assert.calledWith(graphSpy, block, point);
        sinon.assert.calledWith(blockSpy, point);
    });
    it("point-remove", () => {
        var graphSpy = sinon.spy();
        var blockSpy = sinon.spy();
        var graph = new Graph();
        var block = new Block();
        var point = new Point(true, {"pointName": "out", "pointValueType": "Number"});
        graph.on("block-point-remove", graphSpy);
        block.on("point-remove", blockSpy);
        graph.addBlock(block);
        block.addPoint(point);
        block.removePoint(point);
        sinon.assert.calledWith(graphSpy, block, point);
        sinon.assert.calledWith(blockSpy, point);
    });
    it("point-value-type-change", () => {
        var graphSpy = sinon.spy();
        var pointSpy = sinon.spy();
        var graph = new Graph();
        var block = new Block();
        var point = new Point(true, {"pointName": "out", "pointValueType": "Number"});
        graph.addBlock(block);
        block.addPoint(point);
        graph.on("point-value-type-change", graphSpy);
        point.on("value-type-change", pointSpy);
        point.pointValueType = "String";
        sinon.assert.calledWith(graphSpy, point, "String", "Number");
        sinon.assert.calledWith(pointSpy, "String", "Number");
    });
    it("point-value-change", () => {
        var graphSpy = sinon.spy();
        var pointSpy = sinon.spy();
        var graph = new Graph();
        var block = new Block();
        var point = new Point(true, {"pointName": "out", "pointValueType": "Number"});
        graph.addBlock(block);
        block.addPoint(point);
        graph.on("point-value-change", graphSpy);
        point.on("value-change", pointSpy);
        point.pointValue = 42;
        sinon.assert.calledWith(graphSpy, point, 42, null);
        sinon.assert.calledWith(pointSpy, 42, null);
    });
    it("point-connect", () => {
        var graphSpy = sinon.spy();
        var pointSpy = sinon.spy();
        var graph = new Graph();
        var block1 = new Block();
        var block2 = new Block();
        var point1 = new Point(true, {"pointName": "out", "pointValueType": "Number"});
        var point2 = new Point(false, {"pointName": "in", "pointValueType": "Number"});
        graph.addBlock(block1);
        graph.addBlock(block2);
        block1.addPoint(point1);
        block2.addPoint(point2);
        graph.on("point-connect", graphSpy);
        point1.on("connect", pointSpy);
        var connection = point1.connect(point2);
        sinon.assert.calledWith(graphSpy, point1, connection);
        sinon.assert.calledWith(pointSpy, connection);
    });
    it("point-disconnect", () => {
        var graphSpy = sinon.spy();
        var pointSpy = sinon.spy();
        var graph = new Graph();
        var block1 = new Block();
        var block2 = new Block();
        var point1 = new Point(true, {"pointName": "out", "pointValueType": "Number"});
        var point2 = new Point(false, {"pointName": "in", "pointValueType": "Number"});
        graph.addBlock(block1);
        graph.addBlock(block2);
        block1.addPoint(point1);
        block2.addPoint(point2);
        graph.on("point-disconnect", graphSpy);
        point1.on("disconnect", pointSpy);
        var connection = point1.connect(point2);
        point1.disconnect(point2);
        sinon.assert.calledWith(graphSpy, point1, connection);
        sinon.assert.calledWith(pointSpy, connection);
    });
    it("block-template-update", () => {
        var graphSpy = sinon.spy();
        var blockSpy = sinon.spy();
        var graph = new Graph();
        var block = new Block({
            "blockTemplates": {
                "Test": {
                    "valueType": "Number",
                    "templates": ["Number", "String"]
                }
            }
        });
        graph.addBlock(block);
        graph.on("block-template-update", graphSpy);
        block.on("template-update", blockSpy);
        block.changeTemplate("Test", "String");
        sinon.assert.calledWith(graphSpy, block, "Test", "String", "Number");
        sinon.assert.calledWith(blockSpy, "Test", "String", "Number");
    });
    it("variable-add", () => {
        var spy = sinon.spy();
        var graph = new Graph();
        var variable = new Variable({
            "variableName": "variable",
            "variableValueType": "String"
        });
        graph.on("variable-add", spy);
        graph.addVariable(variable);
        sinon.assert.calledWith(spy, variable);
    });
    it("variable-remove", () => {
        var spy = sinon.spy();
        var graph = new Graph();
        var variable = new Variable({
            "variableName": "variable",
            "variableValueType": "String"
        });
        graph.on("variable-remove", spy);
        graph.addVariable(variable);
        graph.removeVariable(variable);
        sinon.assert.calledWith(spy, variable);
    });
});
