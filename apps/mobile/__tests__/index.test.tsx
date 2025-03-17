import IndexScreen from '@/app/(authenticated)/index';
import { mockApiCall } from './mock-api';
import { render } from './utils';

describe('<IndexScreen />', () => {
  test('shows response from healthz check', async () => {
    mockApiCall({
      requestMatches: (args) => args.route.path === '/healthz',
      response: () => ({
        status: 200,
        body: { message: 'Fake Response' },
      }),
    });

    const screen = render(<IndexScreen />);
    await screen.findByText('200 - Fake Response');
    screen.unmount();
  });
});
