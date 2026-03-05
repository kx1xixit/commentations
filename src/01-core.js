class Commentations {
  getInfo() {
    return {
      id: 'kxCommentations',
      name: Scratch.translate('Commentations'),
      color1: '#607D8B',
      color2: '#455A64',
      color3: '#455A64',
      blocks: [
        {
          opcode: 'annotate',
          blockType: Scratch.BlockType.COMMAND,
          text: Scratch.translate('[TYPE] [TEXT]'),
          arguments: {
            TYPE: {
              type: Scratch.ArgumentType.STRING,
              menu: 'annotationType',
            },
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'your text here',
            },
          },
        },
        '---',
        {
          opcode: 'blockAnnotate',
          blockType: Scratch.BlockType.CONDITIONAL,
          text: Scratch.translate('[TYPE] [TEXT]'),
          branchCount: 1,
          arguments: {
            TYPE: {
              type: Scratch.ArgumentType.STRING,
              menu: 'blockAnnotationType',
            },
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'reason',
            },
          },
        },
        '---',
        {
          opcode: 'explainValue',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('[VALUE] comment: [TEXT]'),
          arguments: {
            VALUE: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: '10',
            },
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'pixels per step',
            },
          },
        },
        {
          opcode: 'explainBoolean',
          blockType: Scratch.BlockType.BOOLEAN,
          text: Scratch.translate('[VALUE] comment: [TEXT]'),
          arguments: {
            VALUE: {
              type: Scratch.ArgumentType.BOOLEAN,
              defaultValue: false,
            },
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'is touching wall',
            },
          },
        },
      ],
      menus: {
        annotationType: {
          acceptReporters: false,
          items: [
            { text: Scratch.translate('comment:'), value: 'comment:' },
            { text: Scratch.translate('note:'), value: 'note:' },
            { text: Scratch.translate('to-do:'), value: 'to-do:' },
            { text: Scratch.translate('warning:'), value: 'warning:' },
            { text: Scratch.translate('fixme:'), value: 'fixme:' },
            { text: Scratch.translate('new section:'), value: 'new section:' },
          ],
        },
        blockAnnotationType: {
          acceptReporters: false,
          items: [
            { text: Scratch.translate('disable code:'), value: 'disable code:' },
            { text: Scratch.translate('deprecated, use:'), value: 'deprecated, use:' },
          ],
        },
      },
    };
  }

  annotate(_args) {
    // Does nothing, purely for annotation
    return;
  }

  blockAnnotate(_args) {
    // Returns false so the code inside the C-block never runs
    return false;
  }

  explainValue(args) {
    // Returns the value input, ignores the text input.
    // This allows you to comment on specific numbers/strings.
    return args.VALUE;
  }

  explainBoolean(args) {
    // Returns the boolean value input, ignores the text input.
    // This allows you to comment on specific boolean conditions.
    return args.VALUE;
  }
}

Scratch.extensions.register(new Commentations());
