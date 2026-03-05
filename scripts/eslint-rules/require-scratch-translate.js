/**
 * ESLint rule: require-scratch-translate
 *
 * Errors when `name` (extension name) or `text` (block label) properties
 * inside a `getInfo()` method body contain a plain string literal instead of
 * a `Scratch.translate('…')` call.
 *
 * @example Incorrect
 *   getInfo() { return { name: 'My Extension', blocks: [{ text: 'say hi' }] }; }
 *
 * @example Correct
 *   getInfo() { return { name: Scratch.translate('My Extension'), blocks: [{ text: Scratch.translate('say hi') }] }; }
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        "Require Scratch.translate() for block text and extension name inside getInfo()",
    },
    fixable: 'code',
    schema: [],
    messages: {
      requireTranslate:
        "Use Scratch.translate('…') instead of a plain string literal for '{{property}}'.",
    },
  },

  create(context) {
    /**
     * Stack tracking whether each enclosing function is the `getInfo` handler.
     * Pushed on function entry, popped on exit.
     */
    const getInfoStack = [];

    /** Returns true when the current position is inside a getInfo() body. */
    function insideGetInfo() {
      return getInfoStack.some(Boolean);
    }

    /**
     * Returns true when `node` is the function body of a method/property
     * named `getInfo`.
     */
    function isGetInfoFunction(node) {
      // standalone function declaration:  function getInfo() { … }
      if (
        node.type === 'FunctionDeclaration' &&
        node.id?.name === 'getInfo'
      ) {
        return true;
      }

      const parent = node.parent;
      if (!parent) return false;

      // class method:  getInfo() { … }
      if (
        parent.type === 'MethodDefinition' &&
        parent.key.type === 'Identifier' &&
        parent.key.name === 'getInfo'
      ) {
        return true;
      }

      // object-literal method:  { getInfo() { … } }  or  { getInfo: function() { … } }
      if (
        parent.type === 'Property' &&
        parent.key.type === 'Identifier' &&
        parent.key.name === 'getInfo'
      ) {
        return true;
      }

      return false;
    }

    function enterFunction(node) {
      getInfoStack.push(isGetInfoFunction(node));
    }

    function exitFunction() {
      getInfoStack.pop();
    }

    return {
      FunctionDeclaration: enterFunction,
      FunctionExpression: enterFunction,
      ArrowFunctionExpression: enterFunction,
      'FunctionDeclaration:exit': exitFunction,
      'FunctionExpression:exit': exitFunction,
      'ArrowFunctionExpression:exit': exitFunction,

      Property(node) {
        if (!insideGetInfo()) return;

        // Determine the property key name
        const key = node.key;
        const keyName =
          key.type === 'Identifier'
            ? key.name
            : key.type === 'Literal'
              ? String(key.value)
              : null;

        if (keyName !== 'name' && keyName !== 'text') return;

        // Only flag non-empty string literals
        if (
          node.value.type === 'Literal' &&
          typeof node.value.value === 'string' &&
          node.value.value.length > 0
        ) {
          context.report({
            node: node.value,
            messageId: 'requireTranslate',
            data: { property: keyName },
            fix(fixer) {
              // JSON.stringify handles all special characters (newlines, tabs,
              // unicode escapes, etc.).  We then convert from the double-quoted
              // form to single-quoted: unescape \" and escape any ' instead.
              const inner = JSON.stringify(node.value.value).slice(1, -1);
              const escaped = inner.replace(/\\"/g, '"').replace(/'/g, "\\'");
              return fixer.replaceText(
                node.value,
                `Scratch.translate('${escaped}')`
              );
            },
          });
        }
      },
    };
  },
};
