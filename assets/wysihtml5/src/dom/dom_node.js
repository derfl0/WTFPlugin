// TODO: Refactor dom tree traversing here
(function(wysihtml5) {
  wysihtml5.dom.domNode = function(node) {
    var defaultNodeTypes = [wysihtml5.ELEMENT_NODE, wysihtml5.TEXT_NODE];

    return {

      is: {
        emptyTextNode: function(ignoreWhitespace) {
          var regx = ignoreWhitespace ? (/^\s*$/g) : (/^[\r\n]*$/g);
          return node.nodeType === wysihtml5.TEXT_NODE && (regx).test(node.data);
        },

        visible: function() {
          var isVisible = !(/^\s*$/g).test(wysihtml5.dom.getTextContent(node));

          if (!isVisible) {
            if (node.nodeType === 1 && node.querySelector('img, br, hr, object, embed, canvas, input, textarea')) {
              isVisible = true;
            }
          }
          return isVisible;
        }
      },

      // var node = wysihtml5.dom.domNode(element).prev({nodeTypes: [1,3], ignoreBlankTexts: true});
      prev: function(options) {
        var prevNode = node.previousSibling,
            types = (options && options.nodeTypes) ? options.nodeTypes : defaultNodeTypes;
        
        if (!prevNode) {
          return null;
        }

        if (
          (!wysihtml5.lang.array(types).contains(prevNode.nodeType)) || // nodeTypes check.
          (options && options.ignoreBlankTexts && wysihtml5.dom.domNode(prevNode).is.emptyTextNode(true)) // Blank text nodes bypassed if set
        ) {
          return wysihtml5.dom.domNode(prevNode).prev(options);
        }
        
        return prevNode;
      },

      // var node = wysihtml5.dom.domNode(element).next({nodeTypes: [1,3], ignoreBlankTexts: true});
      next: function(options) {
        var nextNode = node.nextSibling,
            types = (options && options.nodeTypes) ? options.nodeTypes : defaultNodeTypes;
        
        if (!nextNode) {
          return null;
        }

        if (
          (!wysihtml5.lang.array(types).contains(nextNode.nodeType)) || // nodeTypes check.
          (options && options.ignoreBlankTexts && wysihtml5.dom.domNode(nextNode).is.emptyTextNode(true)) // blank text nodes bypassed if set
        ) {
          return wysihtml5.dom.domNode(nextNode).next(options);
        }
        
        return nextNode;
      },

      // Traverses a node for last children and their chidren (including itself), and finds the last node that has no children.
      // Array of classes for forced last-leaves (ex: uneditable-container) can be defined (options = {leafClasses: [...]})
      // Useful for finding the actually visible element before cursor
      lastLeafNode: function(options) {
        var lastChild;

        // Returns non-element nodes
        if (node.nodeType !== 1) {
          return node;
        }

        // Returns if element is leaf
        lastChild = node.lastChild;
        if (!lastChild) {
          return node;
        }

        // Returns if element is of of options.leafClasses leaf
        if (options && options.leafClasses) {
          for (var i = options.leafClasses.length; i--;) {
            if (wysihtml5.dom.hasClass(node, options.leafClasses[i])) {
              return node;
            }
          }
        }

        return wysihtml5.dom.domNode(lastChild).lastLeafNode(options);
      },

      // Splits element at childnode and extracts the childNode out of the element context
      // Example:
      //   var node = wysihtml5.dom.domNode(node).escapeParent(parentNode);
      escapeParent: function(element, newWrapper) {
        var parent, split2, nodeWrap,
            curNode = node;
        
        // Stop if node is not a descendant of element
        if (!wysihtml5.dom.contains(element, node)) {
          throw new Error("Child is not a descendant of node.");
        }

        // Climb up the node tree untill node is reached
        do {
          // Get current parent of node
          parent = curNode.parentNode;

          // Move after nodes to new clone wrapper
          split2 = parent.cloneNode(false);
          while (parent.lastChild && parent.lastChild !== curNode) {
            split2.insertBefore(parent.lastChild, split2.firstChild);
          }

          // Move node up a level. If parent is not yet the container to escape, clone the parent around node, so inner nodes are escaped out too
          if (parent !== element) {
            nodeWrap = parent.cloneNode(false);
            nodeWrap.appendChild(curNode);
            curNode = nodeWrap;
          }
          parent.parentNode.insertBefore(curNode, parent.nextSibling);

          // Add after nodes (unless empty)
          if (split2.innerHTML !== '') {
            // if contents are empty insert without wrap
            if ((/^\s+$/).test(split2.innerHTML)) {
              while (split2.lastChild) {
                parent.parentNode.insertBefore(split2.lastChild, curNode.nextSibling);
              }
            } else {
              parent.parentNode.insertBefore(split2, curNode.nextSibling);
            }
          }

          // If the node left behind before the split (parent) is now empty then remove
          if (parent.innerHTML === '') {
            parent.parentNode.removeChild(parent);
          } else if ((/^\s+$/).test(parent.innerHTML)) {
            while (parent.firstChild) {
              parent.parentNode.insertBefore(parent.firstChild, parent);
            }
            parent.parentNode.removeChild(parent);
          }

        } while (parent && parent !== element);

        if (newWrapper && curNode) {
          curNode.parentNode.insertBefore(newWrapper, curNode);
          newWrapper.appendChild(curNode);
        }
      },

      /*
        Tests a node against properties, and returns true if matches.
        Tests on principle that all properties defined must have at least one match.
        styleValue parameter works in context of styleProperty and has no effect otherwise.
        Returns true if element matches and false if it does not.
        
        Properties for filtering element:
        {
          query: selector string,
          nodeName: string (uppercase),
          className: string,
          classRegExp: regex,
          styleProperty: string or [],
          styleValue: string, [] or regex
        }

        Example:
        var node = wysihtml5.dom.domNode(element).test({})
      */
      test: function(properties) {
        var prop;

        // retuern false if properties object is not defined
        if (!properties) {
          return false;
        }

        // Only element nodes can be tested for these properties
        if (node.nodeType !== 1) {
          return false;
        }

        if (properties.query) {
          if (!node.matches(properties.query)) {
            return false;
          }
        }

        if (properties.nodeName && node.nodeName !== properties.nodeName) {
          return false;
        }

        if (properties.className && !node.classList.contains(properties.className)) {
          return false;
        }

        // classRegExp check (useful for classname begins with logic)
        if (properties.classRegExp) {
          var matches = (node.className || "").match(properties.classRegExp) || [];
          if (matches.length === 0) {
            return false;
          }
        }

        // styleProperty check
        if (properties.styleProperty && properties.styleProperty.length > 0) {
          var hasOneStyle = false,
              styles = (Array.isArray(properties.styleProperty)) ? properties.styleProperty : [properties.styleProperty];
          for (var j = 0, maxStyleP = styles.length; j < maxStyleP; j++) {
            // Some old IE-s have different property name for cssFloat
            prop = wysihtml5.browser.fixStyleKey(styles[j]);
            if (node.style[prop]) {
              if (properties.styleValue) {
                // Style value as additional parameter
                if (properties.styleValue instanceof RegExp) {
                  // style value as Regexp
                  if (node.style[prop].trim().match(properties.styleValue).length > 0) {
                    hasOneStyle = true;
                    break;
                  }
                } else if (Array.isArray(properties.styleValue)) {
                  // style value as array
                  if (properties.styleValue.indexOf(node.style[prop].trim())) {
                    hasOneStyle = true;
                    break;
                  }
                } else {
                  // style value as string
                  if (properties.styleValue === node.style[prop].trim().replace(/, /g, ",")) {
                    hasOneStyle = true;
                    break;
                  }
                }
              } else {
                hasOneStyle = true;
                break;
              }
            }
            if (!hasOneStyle) {
              return false;
            }
          }
        }

        if (properties.attribute) {
          var attr = wysihtml5.dom.getAttributes(node),
              attrList = [],
              hasOneAttribute = false;

          if (Array.isArray(properties.attribute)) {
            attrList = properties.attribute;
          } else {
            attrList[properties.attribute] = properties.attributeValue;
          }

          for (var a in attrList) {
            if (attrList.hasOwnProperty(a)) {
              if (typeof attrList[a] === "undefined") {
                if (typeof attr[a] !== "undefined") {
                  hasOneAttribute = true;
                  break;
                }
              } else if (attr[a] === attrList[a]) {
                hasOneAttribute = true;
                break;
              }
            }
          }

          if (!hasOneAttribute) {
            return false;
          }

        }

        return true;
      }

    };
  };
})(wysihtml5);
