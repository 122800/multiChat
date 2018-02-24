"use strict";

// singleton
const ContextMenu = {

    $el: null,

    currentMenu: null,
    visible: false,

    /**
     * Initializes singleton
     * @param {HTMLElement} $el - the DOM element that will contain the context menu.
     */
    init: function ($el) {
        this.$el = $el;

        this.registerListeners();
    },

    /**
     * Displays a customized context menu on the screen.
     * @param {string} type - Type of ContextMenu to display
     * @param {object} properties - the 'properties' parameter from a vis.js EventListener.
     */
    displayMenu: function (type, properties) {
        this.currentMenu = this.menuTypes[type];
        this.currentMenu.init(properties, this.$el);
        this.toggleMenu(true);
    },

    //

    /**
     * @private
     * Hides or displays the context menu.
     * @param bool - leave empty to toggle
     */
    toggleMenu: function (bool) {
        this.visible = (bool == null) ? !this.visible : bool;
        this.$el.style.display = this.visible ? "initial" : "none";
    },

    clickedOnSelf: function (event) {
        return this.$el.contains(event.target);
    },
    
    registerListeners: function () {
        // close context menu on mouseclick
        addEventListener("mousedown", function(e) {
            if(!this.clickedOnSelf(e)) this.toggleMenu(false);// clicked outside
        }.bind(this));
        addEventListener("mouseup", function(e) {
            if(this.clickedOnSelf(e)) {
                const closeMenu = this.currentMenu.mousedown(e);
                if(closeMenu) this.toggleMenu(false);
            }
        }.bind(this));

        // close context menu on keydown ESC
        addEventListener("keydown", function(e) {
            if(e.keyCode === 27) this.toggleMenu(false);
        }.bind(this));
    }
};

ContextMenu.menuTypes = {

    "WYSIWYG": {

        $el: null,
        wysiwygNode: null,
        clickedNodeId: null,

        /**
         *
         * @param properties
         * @param {HTMLElement} $el
         */
        init: function(properties, $el) {
            this.$el = $el;// memorize html container
            this.clickedNodeId = getIdUnderCursor(properties);
            this.spawnWysiwygNode();
        },

        /**
         * @param event
         * @returns {boolean} action complete - the context menu should be closed if true.
         */
        mousedown: function (event) {
            if(event.target.attributes["data-unicode"]) {
                const unicode = event.target.attributes["data-unicode"].value;
                this.spawnIconNode(unicode);
                return true;
            }
            return false;
        },

        /**
         * @private
         */
        spawnWysiwygNode: function() {
            const data = {
                id : getDate() + "_" + getUserId() + "wysiwygNode",
                // type: "icon",
                author: getUserId(),
                parentMessageId: this.clickedNodeId
            };

            addToRoom("wysiwyg", JSON.stringify(data));
        }


    },

    "ADD_REACTION": {
        clickedNodeId: null,

        /**
         *
         * @param {object} event
         * @returns {boolean} action complete - the context menu should be closed if true.
         */
        mousedown: function (event) {
            if(event.target.attributes["data-unicode"]) {
                const unicode = event.target.attributes["data-unicode"].value;
                this.spawnIconNode(unicode);
                return true;
            }
            return false;
        },

        /**
         * @private
         * @param unicode
         */
        spawnIconNode: function (unicode) {

            const data = {
                id : getDate() + "_" + getUserId() + "iconNode",
                type: "icon",
                author: getUserId(),
                parentMessageId: this.clickedNodeId,
                unicode : unicode
            };

            addToRoom("icon", JSON.stringify(data));

            //sends to db


            // sends to RTC
            sendData("icon", data)

        },

        /**
         *
         * @param properties
         * @param {HTMLElement} $el
         */
        init: function(properties, $el) {
            properties.event.preventDefault();

            this.clickedNodeId = getIdUnderCursor(properties);
            if(this.clickedNodeId === null) alert("ContextMenu error clickedNodeId not defined, don't know what was clicked on");

            const html =
                "<h3>Add a reaction</h3>" +
                "<hr/>" +
                "<div id='ctx-addReaction'>" +
                    this.loadIcons() +
                "</div>";

            const coords = properties.pointer.DOM;
            $el.style.left = coords.x + "px";
            $el.style.top = coords.y + "px";
            $el.innerHTML = html;
        },

        icons: {
            "smile-o":      "\uf118",
            "meh-o":        "\uf11a",
            "frown-o":      "\uf119",
            "handshake-o":  "\uf2b5",
            "bath":         "\uf2cd",
            "blind":        "\uf29d",
            "copyright":    "\uf1f9",
            "check":        "\uf00c",
            "times":        "\uf00d",
            "ban":          "\uf05e",
            "cube":         "\uf1b2",
            "eye":          "\uf06e"
        },

        /**
         * @private
         * @returns {string}
         */
        loadIcons: function() {
            var name;
            var unicode;
            var output = "";
            for(name in this.icons) {
                unicode = this.icons[name];

                output +=
                    "<span class='item'>" +
                        "<span class='fa fa-"+name+" fa-fw' data-unicode='"+unicode+"'></span>" +
                    "</span>";
            }
            return output;
        }
    }
};

ContextMenu.init(document.getElementById("contextMenu"));