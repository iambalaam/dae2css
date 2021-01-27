import { greeting } from './index';

it('Says hello', () => {
    expect(greeting.toLowerCase()).toContain('hello');
})