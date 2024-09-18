import _ from '../src/index.js';

test('simple get', () => {
    const obj = { a: { a: "test1", b: "test2" } };
    expect(_.get(obj, "a.b")).toBe('test2');
});

test('simple set', () => {
    const obj = { a: { a: "test1", b: "test2" } };
    _.set(obj, "a.b", "test3");
    expect(_.get(obj, "a.b")).toBe('test3');
});