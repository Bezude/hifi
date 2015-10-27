//
//  whiteBoardSpawner.js
//  examples/painting/whiteboard
//
//  Created by Eric Levina on 10/12/15.
//  Copyright 2015 High Fidelity, Inc.
//
//  Run this script to spawn a whiteboard that one can paint on
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/*global print, MyAvatar, Entities, AnimationCache, SoundCache, Scene, Camera, Overlays, Audio, HMD, AvatarList, AvatarManager, Controller, UndoStack, Window, Account, GlobalServices, Script, ScriptDiscoveryService, LODManager, Menu, Vec3, Quat, AudioDevice, Paths, Clipboard, Settings, XMLHttpRequest, pointInExtents, vec3equal, setEntityCustomData, getEntityCustomData */
// Script specific
/*global hexToRgb */

Script.include("../../libraries/utils.js");
var scriptURL = Script.resolvePath("whiteboardEntityScript.js");
//var modelURL = "https://hifi-public.s3.amazonaws.com/ozan/support/for_eric/whiteboard/whiteboard.fbx";
var modelURL = "http://localhost:8080/whiteboard.fbx?v1" + Math.random();
var rotation = Quat.safeEulerAngles(Camera.getOrientation());
rotation = Quat.fromPitchYawRollDegrees(0, rotation.y, 0);
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(rotation)));

var whiteboardDimensions, colorIndicator, eraseAllText
var colorBoxes = [];

var colors = [
    hexToRgb("#66CCB3"),
    hexToRgb("#A43C37"),
    hexToRgb("#491849"),
    hexToRgb("#6AB03B"),
    hexToRgb("#993369"),
    hexToRgb("#9B47C2")
];
var whiteboard = Entities.addEntity({
    type: "Model",
    modelURL: modelURL,
    name: "whiteboard",
    position: center,
    rotation: rotation,
    script: scriptURL,
    color: {
        red: 255,
        green: 255,
        blue: 255
    }
});

Script.setTimeout(function() {
    whiteboardDimensions = Entities.getEntityProperties(whiteboard, "naturalDimensions").naturalDimensions;
    setUp();
}, 500)


function setUp() {
    // COLOR INDICATOR BOX
    var colorIndicatorDimensions = {
        x: whiteboardDimensions.x,
        y: 0.05,
        z: 0.02
    };
    scriptURL = Script.resolvePath("colorIndicatorEntityScript.js");
    var colorIndicatorPosition = Vec3.sum(center, {
        x: 0,
        y: whiteboardDimensions.y / 2 + colorIndicatorDimensions.y / 2,
        z: 0
    });
    colorIndicatorBox = Entities.addEntity({
        type: "Box",
        name: "Color Indicator",
        color: colors[0],
        rotation: rotation,
        position: colorIndicatorPosition,
        dimensions: colorIndicatorDimensions,
        script: scriptURL,
        userData: JSON.stringify({
            whiteboard: whiteboard
        })
    });

    Entities.editEntity(whiteboard, {
        userData: JSON.stringify({
            color: {
                currentColor: colors[0]
            },
            colorIndicator: colorIndicatorBox
        })
    });

    //COLOR BOXES
    var direction = Quat.getRight(rotation);
    var colorBoxPosition = Vec3.subtract(center, Vec3.multiply(direction, whiteboardDimensions.x / 2));
    var colorSquareDimensions = {
        x: 0.1,
        y: 0.1,
        z: 0.002
    };
    colorBoxPosition.y += whiteboardDimensions.y / 2 + colorIndicatorDimensions.y + colorSquareDimensions.y / 2;
    var spaceBetweenColorBoxes = Vec3.multiply(direction, colorSquareDimensions.x * 2);
    var scriptURL = Script.resolvePath("colorSelectorEntityScript.js");
    for (var i = 0; i < colors.length; i++) {
        var colorBox = Entities.addEntity({
            type: "Box",
            name: "Color Selector",
            position: colorBoxPosition,
            dimensions: colorSquareDimensions,
            rotation: rotation,
            color: colors[i],
            script: scriptURL,
            userData: JSON.stringify({
                whiteboard: whiteboard,
                colorIndicator: colorIndicatorBox
            })
        });
        colorBoxes.push(colorBox);
        colorBoxPosition = Vec3.sum(colorBoxPosition, spaceBetweenColorBoxes);
    }



    var eraseBoxDimensions = {
        x: 0.5,
        y: 0.1,
        z: 0.01
    };


    var eraseBoxPosition = Vec3.sum(center, Vec3.multiply(direction, whiteboardDimensions.x / 2 + eraseBoxDimensions.x / 2 + 0.01));
    eraseBoxPosition.y += 0.3;
    scriptURL = Script.resolvePath("eraseBoardEntityScript.js");
    eraseAllText = Entities.addEntity({
        type: "Text",
        position: eraseBoxPosition,
        name: "Eraser",
        script: scriptURL,
        rotation: rotation,
        dimensions: eraseBoxDimensions,
        backgroundColor: {
            red: 0,
            green: 60,
            blue: 0
        },
        textColor: {
            red: 255,
            green: 10,
            blue: 10
        },
        text: "ERASE BOARD",
        lineHeight: 0.07,
        userData: JSON.stringify({
            whiteboard: whiteboard
        })
    });



}

function cleanup() {
    Entities.deleteEntity(whiteboard);
    Entities.deleteEntity(eraseAllText);
    Entities.deleteEntity(colorIndicatorBox);
    colorBoxes.forEach(function(colorBox) {
        Entities.deleteEntity(colorBox);
    });
}



// Uncomment this line to delete whiteboard and all associated entity on script close
Script.scriptEnding.connect(cleanup);