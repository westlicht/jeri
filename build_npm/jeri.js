"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var ImageFrame_1 = require("./components/ImageFrame");
exports.ImageFrame = ImageFrame_1.default;
var ImageViewer_1 = require("./components/ImageViewer");
exports.ImageViewer = ImageViewer_1.default;
var ImageLayer_1 = require("./layers/ImageLayer");
exports.ImageLayer = ImageLayer_1.default;
var TextLayer_1 = require("./layers/TextLayer");
exports.TextLayer = TextLayer_1.default;
var MouseLayer_1 = require("./layers/MouseLayer");
exports.MouseLayer = MouseLayer_1.default;
var image_loading_1 = require("./utils/image-loading");
exports.loadImage = image_loading_1.loadImage;
exports.ImageCache = image_loading_1.ImageCache;
var linalg_1 = require("./utils/linalg");
exports.Matrix4x4 = linalg_1.Matrix4x4;
exports.Vector4 = linalg_1.Vector4;
function renderViewer(elem, data, baseUrl, sortMenu, removeCommonPrefix, clearColor, framerates) {
    if (baseUrl === void 0) { baseUrl = ''; }
    if (sortMenu === void 0) { sortMenu = false; }
    if (removeCommonPrefix === void 0) { removeCommonPrefix = false; }
    if (clearColor === void 0) { clearColor = [0.25, 0.25, 0.25]; }
    if (framerates === void 0) { framerates = [1, 2, 5, 10, 15, 24, 30, 48, 60, 90, 120]; }
    var component = (React.createElement(ImageViewer_1.default, { data: data, baseUrl: baseUrl, sortMenu: sortMenu, removeCommonPrefix: removeCommonPrefix, clearColor: clearColor, framerates: framerates }));
    return ReactDOM.render(component, elem);
}
exports.renderViewer = renderViewer;
exports.default = ImageViewer_1.default;
//# sourceMappingURL=jeri.js.map