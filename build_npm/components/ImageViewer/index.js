"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var styled_components_1 = require("styled-components");
var linalg_1 = require("../../utils/linalg");
var number_aware_compare_1 = require("../../utils/number-aware-compare");
var fullscreen_1 = require("../../utils/fullscreen");
var HelpScreen_1 = require("./HelpScreen");
var Layer_1 = require("../../layers/Layer");
var ImageFrameWithLoading_1 = require("../ImageFrameWithLoading");
var navigation_1 = require("./navigation");
var MainDiv = styled_components_1.default.div(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n  background-color: #333;\n  font-size: .9em;\n  position: absolute;\n  top: 0; bottom: 0; left: 0; right: 0;\n  display: flex;\n  flex-direction: column;\n  color: #AAA;\n"], ["\n  background-color: #333;\n  font-size: .9em;\n  position: absolute;\n  top: 0; bottom: 0; left: 0; right: 0;\n  display: flex;\n  flex-direction: column;\n  color: #AAA;\n"])));
var ImageArea = styled_components_1.default.div(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  flex-grow: 1;\n  position: relative;\n"], ["\n  flex-grow: 1;\n  position: relative;\n"])));
// A little hack to allow detecting shift click
var SHIFT_IS_DOWN = false;
document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Shift') {
        SHIFT_IS_DOWN = true;
    }
});
document.addEventListener('keyup', function (ev) {
    if (ev.key === 'Shift') {
        SHIFT_IS_DOWN = false;
    }
});
var ImageViewer = /** @class */ (function (_super) {
    __extends(ImageViewer, _super);
    function ImageViewer(props) {
        var _this = _super.call(this, props) || this;
        _this.menuData = _this.props.data;
        if (props.sortMenu) {
            _this.menuData = _this.sortMenuRows(_this.menuData);
        }
        // Set the initial state
        _this.state = {
            activeRow: 0,
            selection: _this.getDefaultSelection(_this.menuData).slice(1),
            viewTransform: { default: 0.0 },
            exposure: { default: 1.0 },
            helpIsOpen: false,
            defaultTransformation: linalg_1.Matrix4x4.create(),
            transformationNeedsUpdate: true,
            hasFocus: false,
            isPlaying: false,
            playbackPosition: 0,
            framerateIndex: 6,
        };
        // Make sure 'this' is available in the keyboard handler when assigned to the keyup event
        _this.keyboardHandler = _this.keyboardHandler.bind(_this);
        _this.setFocus = _this.setFocus.bind(_this);
        _this.unsetFocus = _this.unsetFocus.bind(_this);
        return _this;
    }
    ImageViewer.prototype.componentDidMount = function () {
        this.mainContainer.setAttribute('tabindex', '1');
        this.mainContainer.addEventListener('keydown', this.keyboardHandler);
        this.mainContainer.addEventListener('focus', this.setFocus);
        this.mainContainer.addEventListener('focusout', this.unsetFocus);
    };
    ImageViewer.prototype.componentDidUpdate = function () {
        if (this.imageFrame && this.state.transformationNeedsUpdate) {
            this.imageFrame.setTransformation(this.state.defaultTransformation);
            this.setState({ transformationNeedsUpdate: false });
        }
    };
    ImageViewer.prototype.componentWillReceiveProps = function (nextProps) {
        this.menuData = nextProps.data;
        if (this.props.sortMenu) {
            this.menuData = this.sortMenuRows(this.menuData);
        }
        this.validateSelection(this.state.selection, this.state.activeRow);
    };
    ImageViewer.prototype.componentWillUnmount = function () {
        this.mainContainer.removeEventListener('keydown', this.keyboardHandler);
    };
    ImageViewer.prototype.setTransformation = function (transformation) {
        if (this.imageFrame != null) {
            this.imageFrame.setTransformation(transformation);
        }
        this.setState({ defaultTransformation: transformation });
    };
    ImageViewer.prototype.render = function () {
        var _this = this;
        var rows = this.activeRows(this.menuData, this.state.selection);
        var imageSpec = this.imageSpec();
        return (React.createElement(MainDiv, { ref: function (div) { return _this.mainContainer = div; }, className: "jeri-main" },
            React.createElement("div", null, rows.map(function (row, i) { return (React.createElement(navigation_1.NavRow, { key: row.title, row: row, selection: _this.state.selection[i], handleClick: _this.navigateTo.bind(_this, rows, i), removeCommonPrefix: _this.props.removeCommonPrefix ? _this.props.removeCommonPrefix : false, active: _this.state.activeRow === i })); })),
            React.createElement(ImageArea, { className: "jeri-image-area" },
                React.createElement(ImageFrameWithLoading_1.default, { viewTransform: this.state.viewTransform[imageSpec.tonemapGroup], clearColor: this.props.clearColor ? this.props.clearColor : [0, 0, 0], exposure: this.state.exposure[imageSpec.tonemapGroup] || 1.0, gamma: 1.0, offset: 0.0, imageSpec: imageSpec, ref: function (frame) { return _this.imageFrame = (frame != null) ? frame.imageFrame : null; }, allowMovement: true, enableMouseEvents: this.state.hasFocus }),
                this.state.helpIsOpen ? React.createElement(HelpScreen_1.default, null) : null)));
    };
    /**
     * Select the active rows from the navigation data tree, according to the given selection
     *
     * @param tree navigation datastructure
     * @param selection array of the titles of selected items from top to bottom
     */
    ImageViewer.prototype.activeRows = function (tree, selection) {
        if (selection.length === 0) {
            // Base case of the recursion
            return [];
        }
        else {
            // Find the child with this name
            if (!tree.hasOwnProperty('children')) {
                throw new Error("Can't find match for " + selection);
            }
            var node = tree;
            var res = node.children.find(function (child) { return child.title === selection[0]; });
            if (res == null) {
                throw new Error("Failed to find a match for " + selection);
            }
            else {
                return [node].concat(this.activeRows(res, selection.slice(1)));
            }
        }
    };
    /**
     * Recursively sort the input data
     *
     * It's a bit smart, for example bathroom-32 will come before bathroom-128,
     * and the word Color always goes first.
     * @param tree to be sored
     */
    ImageViewer.prototype.sortMenuRows = function (tree) {
        var _this = this;
        if (tree.hasOwnProperty('children')) {
            var node = tree;
            var children = node.children.map(function (child) { return _this.sortMenuRows(child); });
            children.sort(function (a, b) {
                if (a.title === b.title) {
                    return 0;
                }
                else if (a.title === 'Color') {
                    return -1;
                }
                else if (b.title === 'Color') {
                    return 1;
                }
                else {
                    return number_aware_compare_1.default(a.title, b.title);
                }
            });
            return {
                title: node.title,
                children: children,
            };
        }
        else {
            return tree;
        }
    };
    /**
     * Find the image to be shown based on the current selection
     */
    ImageViewer.prototype.currentImage = function (currentSelection) {
        if (currentSelection === void 0) { currentSelection = this.state.selection; }
        var selection = currentSelection.slice();
        var tree = this.menuData;
        var _loop_1 = function () {
            var entry = selection.shift();
            tree = tree.children.find(function (item) { return item.title === entry; });
        };
        while (selection.length > 0) {
            _loop_1();
        }
        return tree; // tslint:disable-line
    };
    /**
     * Return a string from an array of strings at a given position.
     * If the first argument is a string (not an array), then it will return the string.
     */
    ImageViewer.prototype.getStringAtPos = function (input, position) {
        if (Array.isArray(input)) {
            return this.props.baseUrl + input[position % input.length];
        }
        else {
            return this.props.baseUrl + input;
        }
    };
    /**
     * Specification for the current image to load
     */
    ImageViewer.prototype.imageSpec = function (currentSelection) {
        if (currentSelection === void 0) { currentSelection = this.state.selection; }
        var img = this.currentImage(currentSelection);
        if (img.hasOwnProperty('lossMap')) {
            var config = img;
            return {
                type: 'Difference',
                lossFunction: Layer_1.lossFunctionFromString(config.lossMap.function),
                urlA: this.getStringAtPos(config.lossMap.imageA, this.state.playbackPosition),
                urlB: this.getStringAtPos(config.lossMap.imageB, this.state.playbackPosition),
                tonemapGroup: config.tonemapGroup || 'default',
            };
        }
        else {
            return {
                type: 'Url',
                url: this.getStringAtPos(img.image, this.state.playbackPosition),
                tonemapGroup: img.tonemapGroup || 'default',
            };
        }
    };
    /**
     * Navigate to a particular image
     *
     * @param rows: a list of the rows currently visible
     * @param rowIndex: the index of the row in which to switch tabs
     * @param title: the title of the requested node
     *
     * For rows > rowIndex, we select children matching the current selection titles
     * if they exist. Otherwise, we resort to the default selection (first elements).
     */
    ImageViewer.prototype.navigateTo = function (rows, rowIndex, title) {
        var selection = this.state.selection.slice();
        selection[rowIndex] = title;
        var activeRow = this.state.activeRow;
        if (SHIFT_IS_DOWN) {
            // Set active row on shift click
            activeRow = rowIndex;
        }
        this.validateSelection(selection, activeRow);
    };
    /**
     * Make sure that the current selection is valid given the current menuData
     *
     * If a title in the selection does not exist in the respective row, take the default
     * (first) element of the row.
     * @param wishes the desired selection, which might not be valid given the selected menu items
     */
    ImageViewer.prototype.validateSelection = function (wishes, activeRow) {
        var selection = [];
        var i = 0;
        var root = this.menuData;
        while (root.hasOwnProperty('children')) {
            var candidate = root.children.find(function (row) { return row.title === wishes[i]; });
            if (candidate) {
                root = candidate;
                selection.push(candidate.title);
            }
            else {
                root = root.children[0]; // resort to the first
                selection.push(root.title);
            }
            i++;
        }
        this.setState({
            selection: selection,
            activeRow: Math.min(activeRow, selection.length - 1),
        });
    };
    /**
     * Return the titles of the first items of a sorted tree
     * @param tree a sorted navigation data structure
     */
    ImageViewer.prototype.getDefaultSelection = function (tree) {
        if (tree.hasOwnProperty('children')) {
            var node = tree;
            if (node.children.length > 0) {
                return [node.title].concat(this.getDefaultSelection(node.children[0]));
            }
            else {
                return [node.title];
            }
        }
        else {
            return [tree.title];
        }
    };
    ImageViewer.prototype.dumpTransformation = function () {
        if (this.imageFrame != null) {
            var transformation = this.imageFrame.getTransformation();
            console.log(transformation.data);
        }
    };
    ImageViewer.prototype.advanceAnimationFrame = function (currentPos) {
        if (this.state.isPlaying) {
            var pos = this.state.playbackPosition;
            // This condition prevents multiple timers advancing the position
            if (currentPos === pos) {
                var delay = 1.0 / 30.0;
                if (this.props.framerates) {
                    delay = 1.0 / this.props.framerates[this.state.framerateIndex] * 1000;
                }
                var advanceF = this.advanceAnimationFrame.bind(this);
                setTimeout(advanceF, delay, pos + 1);
                this.setState({ playbackPosition: pos + 1 });
            }
        }
    };
    ImageViewer.prototype.keyboardHandler = function (event) {
        var _this = this;
        var key = event.key;
        var actions = {};
        var actionsUnderShift = {};
        // Number keys
        var goToNumber = function (i) { return function () {
            var rows = _this.activeRows(_this.menuData, _this.state.selection);
            var activeRow = _this.state.activeRow;
            var goTo = rows[activeRow].children[i];
            if (goTo != null) {
                _this.navigateTo(rows, activeRow, goTo.title);
            }
        }; };
        actions['0'] = goToNumber(9);
        for (var i = 1; i <= 9; ++i) {
            actions[i.toString()] = goToNumber(i - 1);
        }
        // Arrows
        var moveInLine = function (offset) { return function () {
            var rows = _this.activeRows(_this.menuData, _this.state.selection);
            var activeRow = _this.state.activeRow;
            var currentTitle = _this.state.selection[activeRow];
            var currentIndex = rows[activeRow].children.findIndex(function (n) { return n.title === currentTitle; });
            var nextIndex = (currentIndex + offset + rows[activeRow].children.length) % rows[activeRow].children.length;
            var goTo = rows[activeRow].children[nextIndex];
            _this.navigateTo(rows, activeRow, goTo.title);
        }; };
        actionsUnderShift.ArrowLeft = moveInLine(-1);
        actionsUnderShift.ArrowRight = moveInLine(1);
        actions['-'] = moveInLine(-1);
        actions['='] = moveInLine(1);
        var moveUpDown = function (offset) { return function () {
            var nextRow = _this.state.activeRow + offset;
            if (nextRow < 0) {
                nextRow = 0;
            }
            if (nextRow >= _this.state.selection.length - 1) {
                nextRow = _this.state.selection.length - 1;
            }
            _this.setState({ activeRow: nextRow });
        }; };
        actionsUnderShift.ArrowUp = moveUpDown(-1);
        actionsUnderShift.ArrowDown = moveUpDown(1);
        actions['['] = moveUpDown(-1);
        actions[']'] = moveUpDown(1);
        // ViewTransform controls
        var changeViewTransform = function () { return function () {
            var _a;
            var tonemapGroup = _this.imageSpec().tonemapGroup;
            var viewTransform = __assign({}, _this.state.viewTransform, (_a = {}, _a[tonemapGroup] = (Math.abs(_this.state.viewTransform[tonemapGroup] - 1)), _a));
            _this.setState({ viewTransform: viewTransform });
        }; };
        actions.t = changeViewTransform();
        // Exposure controls
        var changeExposure = function (multiplier) { return function () {
            var _a;
            var tonemapGroup = _this.imageSpec().tonemapGroup;
            var exposure = __assign({}, _this.state.exposure, (_a = {}, _a[tonemapGroup] = multiplier * (_this.state.exposure[tonemapGroup] || 1.0), _a));
            _this.setState({ exposure: exposure });
        }; };
        actions.e = changeExposure(1.1);
        actions.E = changeExposure(1.0 / 1.1);
        // Reset
        actions.r = function () {
            _this.setState({ viewTransform: { default: 0.0 } });
            _this.setState({ exposure: { default: 1.0 } });
            if (_this.imageFrame) {
                _this.imageFrame.reset();
            }
        };
        // Toggle help
        actions['/'] = actions['?'] = function () {
            _this.setState({ helpIsOpen: !_this.state.helpIsOpen });
        };
        actions.Escape = function () {
            _this.setState({ helpIsOpen: false });
        };
        // Go fullscreen
        actions.f = function () { return fullscreen_1.default(_this.mainContainer); };
        // Dump the current transformation
        actions.d = function () { return _this.dumpTransformation(); };
        actions[' '] = function () {
            var isPlaying = !_this.state.isPlaying;
            _this.setState({ isPlaying: isPlaying });
            _this.advanceAnimationFrame(_this.state.playbackPosition);
        };
        actions['<'] = function () {
            if (_this.props.framerates) {
                var newIndex = _this.state.framerateIndex - 1 > 0 ?
                    _this.state.framerateIndex - 1 : 0;
                console.log('Framerate:', _this.props.framerates[newIndex]);
                _this.setState({ framerateIndex: newIndex });
            }
        };
        actions['>'] = function () {
            if (_this.props.framerates) {
                var newIndex = _this.state.framerateIndex + 1 < _this.props.framerates.length ?
                    _this.state.framerateIndex + 1 : _this.state.framerateIndex;
                console.log('Framerate:', _this.props.framerates[newIndex]);
                _this.setState({ framerateIndex: newIndex });
            }
        };
        actions[','] = function () {
            _this.setState({
                isPlaying: false,
                playbackPosition: _this.state.playbackPosition - 1
            });
        };
        actions['.'] = function () {
            _this.setState({
                isPlaying: false,
                playbackPosition: _this.state.playbackPosition + 1
            });
        };
        if (actions.hasOwnProperty(key) && !event.metaKey && !event.altKey && !event.ctrlKey) {
            event.preventDefault();
            actions[key]();
            return;
        }
        if (actionsUnderShift.hasOwnProperty(key) && event.shiftKey) {
            event.preventDefault();
            actionsUnderShift[key]();
            return;
        }
    };
    ImageViewer.prototype.setFocus = function () {
        this.setState({ hasFocus: true });
    };
    ImageViewer.prototype.unsetFocus = function () {
        this.setState({ hasFocus: false });
    };
    ImageViewer.defaultProps = {
        baseUrl: '',
        sortMenu: false,
        removeCommonPrefix: false,
        clearColor: [0.25, 0.25, 0.25],
        framerates: [1, 2, 5, 10, 15, 24, 30, 48, 60, 90, 120],
    };
    return ImageViewer;
}(React.Component));
exports.default = ImageViewer;
var templateObject_1, templateObject_2;
//# sourceMappingURL=index.js.map