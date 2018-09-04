'use strict';

const messages = {
  ONLY_USE_MODULE: 'Only module can be invoked; imported from qunit',
  TESTS_SHOULD_BE_NESTED: 'Test should only be invoked nested within module()',
};

module.exports = {
  meta: {
    docs: {
      description: 'Enforce use of module in tests',
      category: 'Testing',
      recommended: false,
    },
    fixable: null,
    messages,
  },

  create(context) {
    const isFileInTest = context.getFilename().indexOf('tests') > -1;
    let moduleIsImportedFromQunit = false;
    let qunitImportIdentifier;

    if (!isFileInTest) {
      return {};
    }

    return {
      'ImportDeclaration[source.value = "qunit"]': function (node) {
        node.specifiers.forEach((specifier) => {
          if (specifier.type === 'ImportDefaultSpecifier') {
            qunitImportIdentifier = specifier.local.name;
          } else if (specifier.local.name === 'module') {
            moduleIsImportedFromQunit = true;
          }
        });
      },

      'Program > ExpressionStatement > CallExpression': function (node) {
        if (node.callee.name === 'module' && moduleIsImportedFromQunit) {
          return;
        }

        if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'module' && qunitImportIdentifier === node.callee.object.name) {
          return;
        }

        if (node.callee.name === 'test') {
          context.report(node.callee, messages.TESTS_SHOULD_BE_NESTED);
        } else {
          context.report(node.callee, messages.ONLY_USE_MODULE);
        }
      },
    };
  },
};