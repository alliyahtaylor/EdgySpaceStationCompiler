//-----------------------------------------
// treeDemo.ts
//
// Adapted from work by Alan G. Labouseur, based on the 2009
// work by Michael Ardizzone and Tim Smith.
//-----------------------------------------
var TSC;
(function (TSC) {
    function Tree() {
        // ----------
        // Attributes
        // ----------
        this.root = null; // Note the NULL root node of this tree.
        this.cur = {}; // Note the EMPTY current node of the tree we're building.
        // -- ------- --
        // -- Methods --
        // -- ------- --
        // Add a node: kind in {branch, leaf}.
        this.addNode = function (name, kind, position, program) {
            // Construct the node object.
            var node = {
                name: name,
                kind: kind,
                position: position,
                program: program,
                children: [],
                parent: {}
            };
            // Check to see if it needs to be the root node.
            if ((this.root == null) || (!this.root)) {
                // We are the root node.
                this.root = node;
            }
            else {
                // We are the children.
                // Make our parent the CURrent node...
                node.parent = this.cur;
                // ... and add ourselves (via the unfrotunately-named
                // "push" function) to the children array of the current node.
                this.cur.children.push(node);
            }
            // If we are an interior/branch node, then...
            if (kind == "branch") {
                // ... update the CURrent node pointer to ourselves.
                this.cur = node;
            }
        };
        // Note that we're done with this branch of the tree...
        this.endChildren = function () {
            // ... by moving "up" to our parent node (if possible).
            if ((this.cur.parent !== null) && (this.cur.parent.name !== undefined)) {
                this.cur = this.cur.parent;
            }
            else {
                // TODO: Some sort of error logging.
                // This really should not happen, but it will, of course.
            }
        };
        // Return a string representation of the tree.
        this.toCSTString = function () {
            // Initialize the result string.
            var traversalResult = "";
            var traversalLog = "";
            // Recursive function to handle the expansion of the nodes.
            function expand(node, depth) {
                // Space out based on the current depth so
                // this looks at least a little tree-like.
                for (var i = 0; i < depth; i++) {
                    traversalResult += "-";
                }
                // If there are no children (i.e., leaf nodes)...
                if (!node.children || node.children.length === 0) {
                    // ... note the leaf node.
                    traversalResult += "[" + node.name + "]";
                    traversalResult += "\n";
                    traversalLog += "current depth is" + depth + "node is" + node.name + "parent is" + node.parent.name;
                    traversalLog += "\n";
                    //console.log(node.name);
                }
                else {
                    // There are children, so note these interior/branch nodes and ...
                    traversalResult += "<" + node.name + "> \n";
                    // .. recursively expand them.
                    for (var i = 0; i < node.children.length; i++) {
                        expand(node.children[i], depth + 1);
                        traversalLog += "current depth is" + depth + "node is" + node.name + "parent is" + node.parent.name;
                        traversalLog += "\n";
                    }
                }
            }
            // Make the initial call to expand from the root.
            expand(this.root, 0);
            // Return the result.
            //console.log(traversalLog);
            return traversalResult;
        };
    }
    TSC.Tree = Tree;
    function scopeTree() {
        // ----------
        // Attributes
        // ----------
        this.root = null; // Note the NULL root node of this tree.
        this.cur = {}; // Note the EMPTY current node of the tree we're building.
        this.symbolArray = [];
        // -- ------- --
        // -- Methods --
        // -- ------- --
        // Add a node: kind in {branch, leaf}.
        this.addNode = function (name, kind) {
            // Construct the node object.
            var node = {
                name: name,
                kind: kind,
                children: [],
                parent: {},
                symbols: [],
            };
            // Check to see if it needs to be the root node.
            this.symbols = [];
            if ((this.root == null) || (!this.root)) {
                // We are the root node.
                this.root = node;
            }
            else {
                // We are the children.
                // Make our parent the CURrent node...
                node.parent = this.cur;
                // ... and add ourselves (via the unfrotunately-named
                // "push" function) to the children array of the current node.
                this.cur.children.push(node);
            }
            // If we are an interior/branch node, then...
            if (kind == "branch") {
                // ... update the CURrent node pointer to ourselves.
                this.cur = node;
            }
        };
        // Note that we're done with this branch of the tree...
        this.endChildren = function () {
            // ... by moving "up" to our parent node (if possible).
            if ((this.cur.parent !== null) && (this.cur.parent.name !== undefined)) {
                this.cur = this.cur.parent;
            }
            else {
                // TODO: Some sort of error logging.
                // This really should not happen, but it will, of course.
            }
        };
        // Return a string representation of the tree.
        this.toScopeString = function () {
            // Initialize the result string.
            var traversalResult = "";
            // Recursive function to handle the expansion of the nodes.
            function expand(node, depth) {
                // Space out based on the current depth so
                // this looks at least a little tree-like.
                for (var i = 0; i < depth; i++) {
                    traversalResult += "-";
                }
                // If there are no children (i.e., leaf nodes)...
                if (!node.children || node.children.length === 0) {
                    // ... note the leaf node.
                    traversalResult += "[" + node.name + "]";
                    for (i = 0; i < node.symbols.length; i++) {
                        traversalResult += " " + node.symbols[i].type + " " + node.symbols[i].id;
                    }
                    traversalResult += "\n";
                    //console.log(node.name);
                }
                else {
                    // There are children, so note these interior/branch nodes and ...
                    traversalResult += "[" + node.name + "] \n";
                    // .. recursively expand them.
                    for (i = 0; i < node.symbols.length; i++) {
                        traversalResult += " " + node.symbols[i].type + " " + node.symbols[i].id;
                    }
                    for (var i = 0; i < node.children.length; i++) {
                        expand(node.children[i], depth + 1);
                    }
                }
            }
            // Make the initial call to expand from the root.
            expand(this.root, 0);
            // Return the result.
            return traversalResult;
        };
        this.findSyms = function (node) {
            if (!node.children || node.children.length === 0) {
                for (i = 0; i < node.symbols.length; i++) {
                    this.symbolArray.push(node.symbols[i]);
                }
                //traversalResult += "\n";
                //console.log(node.name);
            }
            else {
                // There are children, so note these interior/branch nodes and ...
                // traversalResult += "[" + node.name + "] \n";
                // .. recursively expand them.
                for (i = 0; i < node.symbols.length; i++) {
                    // traversalResult+= " " + node.symbols[i].type + " " + node.symbols[i].id ;
                    this.symbolArray.push(node.symbols[i]);
                }
                for (var i = 0; i < node.children.length; i++) {
                    this.findSyms(node.children[i]);
                }
            }
            // Make the initial call to expand from the root.
            //findSyms(this.root);
            // Return the result.
            return this.symbolArray;
        };
    }
    TSC.scopeTree = scopeTree;
})(TSC || (TSC = {}));
