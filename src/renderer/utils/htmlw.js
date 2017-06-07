const _namespaces = {
    "xhtml": "http://www.w3.org/1999/xhtml",
    "svg": "http://www.w3.org/2000/svg",
    "math": "http://www.w3.org/1998/Math/MathML"
};
const _namespace = name => {
    const pair = name.split(":");
    if (pair.length > 1 && typeof _namespaces[pair[0]] === "undefined") {
        throw new Error(pair[0] + " is not a valid namespace, valid namespaces are", _namespaces);
    }
    return {
        "URI": pair.length > 1 ? _namespaces[pair[0]] : null,
        "localName": pair.length > 1 ? pair[1] : name
    };
};
const _element = Symbol("element");

export default class HTMLWrapper {

    /**
     * Creates an HTML wrapper for the specified element
     * @param {Element} element - specifies the element
     */
    constructor(element) {
        this[_element] = element;
    }

    /**
     * Returns this wrapped HTML element
     * @returns {Element}
     */
    get element() { return this[_element]; }

    /**
     * Returns this element index in its parent
     * @returns {number}
     */
    get index() { return Array.prototype.indexOf.call(this[_element].parentNode.childNodes, this[_element]); }

    /**
     * Returns the child element corresponding to the specified selector
     * @param {string} selector - specifies the selector
     * @returns {HTMLWrapper|undefined}
     */
    select(selector) {
        const element = this[_element].querySelector(selector);
        if (typeof element !== "undefined") {
            return new HTMLWrapper(element);
        }
        return undefined;
    }

    /**
     * Returns the children elements corresponding to the specified selector
     * @param {string} selector - specifies the selector
     * @returns {Array<HTMLWrapper>}
     */
    selectAll(selector) {
        const wrappedElements = [];
        const elements = this[_element].querySelectorAll(selector);
        for (const element of elements) {
            wrappedElements.push(new HTMLWrapper(element));
        }
        return wrappedElements;
    }

    /**
     * Appends an html element of the specified qualified name into this element
     * @param {string} name - specifies the name
     * @returns {HTMLWrapper}
     */
    append(name) {
        const namespace = _namespace(name);
        const element = namespace.URI !== null ?
            document.createElementNS(namespace.URI, namespace.localName) :
            document.createElement(namespace.localName);
        this[_element].appendChild(element);
        return new HTMLWrapper(element);
    }

    /**
     * Prepends an html element of the specified qualified name into this element
     * @param {string} name - specifies the name
     * @returns {HTMLWrapper}
     */
    prepend(name) {
        const namespace = _namespace(name);
        const element = namespace.URI !== null ?
            document.createElementNS(namespace.URI, namespace.localName) :
            document.createElement(namespace.localName);
        this[_element].insertBefore(element, this[_element].firstChild);
        return new HTMLWrapper(element);
    }

    /**
     * Removes this element from DOM
     */
    remove() {
        if (typeof this[_element].parentNode !== "undefined") {
            this[_element].parentNode.removeChild(this[_element]);
        }
    }

    /**
     * Sets this element textContent to the specified text
     * @param {string|Function} text - specifies the text
     */
    text(text) {
        this[_element].textContent = typeof text === "function" ? text() : text;
    }

    /**
     * Sets this element specified attribute qualified name to the specified value
     * @param {string} name - specifies the qualified name
     * @param {number|string|Function|null} value - specifies the value
     * @returns {HTMLWrapper} - returns this for chained method calls
     */
    attr(name, value) {
        const namespace = _namespace(name);
        const rvalue = typeof value === "function" ? value() : value;
        if (rvalue === null) {
            if (namespace.URI !== null) {
                this[_element].removeAttributeNS(namespace.URI, namespace.localName, rvalue);
            } else {
                this[_element].removeAttribute(namespace.localName, rvalue);
            }
        } else {
            if (namespace.URI !== null) {
                this[_element].setAttributeNS(namespace.URI, namespace.localName, rvalue);
            } else {
                this[_element].setAttribute(namespace.localName, rvalue);
            }
        }
        return this;
    }

    /**
     * Adds a class to this element of the specified class name
     * @param {string} className - specifies the class name
     * @param {boolean} classed - specifies whether to add or remove the specified class name
     * @returns {HTMLWrapper} - returns this for chained method calls
     */
    classed(className, classed = true) {
        if (typeof classed === "undefined" || classed === true) {
            this[_element].classList.add(className);
        } else if (classed === false) {
            this[_element].classList.remove(className);
        }
        return this;
    }

}
