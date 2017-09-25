import { MeanPushServerPage } from './app.po';

describe('mean-push-server App', () => {
  let page: MeanPushServerPage;

  beforeEach(() => {
    page = new MeanPushServerPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
