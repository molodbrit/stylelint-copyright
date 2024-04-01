const stylelint = require('stylelint');
const fs = require('fs');

const ruleName = 'copyright-notice';
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: 'Missing copyright in the header comment',
});

const commentBracesRegex = /(\/\*\n\s)|(\n\s\*\/\n)/gm;

const rule =
  (primaryOption, secondaryOption, context) => (root, result) => {
    stylelint.utils.validateOptions(
      result,
      ruleName,
      {
        actual: primaryOption,
        possible: [true, false],
      },
      {
        actual: secondaryOption,
        possible: (v) => typeof v?.source === 'string',
      },
    );

    try {
      if (secondaryOption?.source) {
        const copyright = fs.readFileSync(secondaryOption.source, 'utf8');
        const copyrightText = copyright.replace(commentBracesRegex, '');

        const hasCommentAtTop =
          root.first &&
          root.first.type === 'comment' &&
          root.first.source?.start?.column === 1;

        if (hasCommentAtTop) {
          const { text } = root.first;
    
          if (text === copyrightText) {
            return;
          }
        }
        if (context.fix) {
          const hasCopyrightComment = hasCommentAtTop && root.first.text?.startsWith('* Copyright');

          if (hasCopyrightComment) {
            root.first?.remove();
          }

          root.first?.before(copyright);
          return;
        }
      }
  
    } catch (err) {
      console.error(err);
    }
    
    stylelint.utils.report({
      message: messages.rejected,
      node: root,
      result,
      ruleName,
    });
  };

module.exports = stylelint.createPlugin(ruleName, rule);
module.exports.ruleName = ruleName;
module.exports.messages = messages;
