import { minimatch } from 'minimatch';

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require the usage of just-in-time packages by disallowing the "build" directory inside package.json exports.',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          buildOutputDirectories: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    return {
      Document(node) {
        if (!context.filename.endsWith('package.json')) {
          // only process package.json files
          return;
        }

        const option = context.options[0];
        const buildOutputDirectories = option && option.buildOutputDirectories;
        if (!buildOutputDirectories) {
          // no configured paths so nothing will ever match, exit early
          return;
        }

        const checkExportPaths = (member) => {
          if (member.type === 'Member') {
            checkExportPaths(member.value);
          } else if (member.type === 'Object') {
            member.members.forEach(checkExportPaths);
          } else if (member.type === 'String') {
            const matchingGlob = buildOutputDirectories.find((glob) =>
              minimatch(member.value, glob),
            );
            if (matchingGlob) {
              context.report({
                loc: member.loc,
                message:
                  'Export path "{{path}}" must not include build outputs such as files found in "{{glob}}"',
                data: {
                  path: member.value,
                  glob: matchingGlob,
                },
              });
            }
          }
        };

        node.body.members
          .filter((member) => member.name.value === 'exports')
          .forEach(checkExportPaths);
      },
    };
  },
};
