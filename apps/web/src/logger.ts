import adze, { setup } from 'adze';

// Set our active level to 'info' which is equivalent to 3
setup({
  activeLevel: 'info',
});

export const logger = adze.withEmoji.timestamp.seal();
