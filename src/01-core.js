class Commentations {
  getInfo() {
    return {
      id: 'kbCommentations',
      name: 'Commentations',
      color1: '#607D8B',
      color2: '#455A64',
      color3: '#455A64',
      blocks: [
        {
          opcode: 'label',
          blockType: Scratch.BlockType.COMMAND,
          text: 'new section: [TEXT]',
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'section label',
            },
          },
        },
        {
          opcode: 'note',
          blockType: Scratch.BlockType.COMMAND,
          text: 'note: [TEXT]',
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'an important note',
            },
          },
        },
        {
          opcode: 'comment',
          blockType: Scratch.BlockType.COMMAND,
          text: 'comment: [TEXT]',
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'comment',
            },
          },
        },
        {
          opcode: 'todo',
          blockType: Scratch.BlockType.COMMAND,
          text: 'to-do: [TEXT]',
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'fix this bug',
            },
          },
        },
        '---',
        {
          opcode: 'disableCode',
          blockType: Scratch.BlockType.CONDITIONAL,
          text: 'disable code with reason: [TEXT]',
          branchCount: 1,
          arguments: {
            TEXT: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'reason for disabling',
            },
          },
        },
        '---',
        {
          opcode: 'explainValue',
          blockType: Scratch.BlockType.REPORTER,
          text: '[VALUE] comment: [TEXT]',
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
      ],
    };
  }

  label(_args) {
    // Does nothing, just a label
    return;
  }

  comment(_args) {
    // Does nothing, just a comment
    return;
  }

  note(_args) {
    // I wish I could go lazy-bones mode and just use comment() for the note block,
    // but I guess we can never have any good things in life
    return;
  }

  todo(_args) {
    // Does nothing, just a to-do marker
    return;
  }

  disableCode(_args) {
    // Returns false so the code inside the C-block never runs
    return false;
  }

  explainValue(args) {
    // Returns the value input, ignores the text input.
    // This allows you to comment on specific numbers/strings.
    return args.VALUE;
  }
}

Scratch.extensions.register(new Commentations());
