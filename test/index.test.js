import _ from "../src/index.js";

test("simple get", () => {
  const obj = { a: { a: "test1", b: "test2" } };
  expect(_.path.get(obj, "a.b")).toBe("test2");
});

test("simple set", () => {
  const obj = { a: { a: "test1", b: "test2" } };
  _.path.set(obj, "a.b", "test3");
  expect(_.path.get(obj, "a.b")).toBe("test3");
});

describe("Lodash Extended Methods", () => {
  let testObject;

  beforeEach(() => {
    testObject = {
      a: {
        b: {
          c: 1,
          d: "test",
        },
        e: [1, 2, 3],
        f: true,
      },
      g: {
        h: {
          i: "value",
        },
      },
    };
  });

  test("resolve", () => {
    expect(_.path.resolve(testObject, "a.*.c")).toEqual(["a.b.c"]);
    expect(_.path.resolve(testObject, "a.**")).toEqual([
      "a.b",
      "a.b.c",
      "a.b.d",
      "a.e",
      "a.e.0",
      "a.e.1",
      "a.e.2",
      "a.f",
    ]);
    expect(_.path.resolve(testObject, "a.e.*")).toEqual([
      "a.e.0",
      "a.e.1",
      "a.e.2",
    ]);
    
    // OR selector test
    expect(_.path.resolve(testObject, "a.b|e.*")).toEqual(["a.b.c", "a.b.d", "a.e.0", "a.e.1", "a.e.2"]);

    // Exclusion selector test
    expect(_.path.resolve(testObject, "a.*!e")).toEqual(["a.b", "a.f"]);
  });

  test("get", () => {
    expect(_.path.get(testObject, "a.b.c")).toBe(1);
    expect(_.path.get(testObject, "a.*.c")).toEqual(1);
    expect(_.path.get(testObject, "a.e.*")).toEqual([1, 2, 3]);

    // OR selector test
    expect(_.path.get(testObject, "a.e|f")).toEqual([[1, 2, 3], true]);

    // Exclusion selector test
    expect(_.path.get(testObject, "a.*!e")).toEqual([
        { "c": 1, "d": "test" },
        true
    ]);
  });

  test("set", () => {
    _.path.set(testObject, "a.*.c", 5);
    expect(testObject.a.b.c).toBe(5);

    _.path.set(testObject, "a.e.*", 0);
    expect(testObject.a.e).toEqual([0, 0, 0]);
  });

  test("remove", () => {
    _.path.remove(testObject, "a.b.c");
    expect(testObject.a.b.c).toBeUndefined();

    _.path.remove(testObject, "a.e");
    expect(testObject.a.e).toBeUndefined();
  });

  test("push", () => {
    _.path.push(testObject, "a.e", 4);
    expect(testObject.a.e).toEqual([1, 2, 3, 4]);

    expect(() => _.path.push(testObject, "a.b", 5)).toThrow();
  });

  test("pop", () => {
    expect(_.path.pop(testObject, "a.e")).toBe(3);
    expect(testObject.a.e).toEqual([1, 2]);

    expect(() => _.path.pop(testObject, "a.b")).toThrow();
  });

  test("unshift", () => {
    expect(_.path.unshift(testObject, "a.e", 0)).toBe(4);
    expect(testObject.a.e).toEqual([0, 1, 2, 3]);

    expect(() => _.path.unshift(testObject, "a.b", 5)).toThrow();
  });

  test("shift", () => {
    expect(_.path.shift(testObject, "a.e")).toBe(1);
    expect(testObject.a.e).toEqual([2, 3]);

    expect(() => _.path.shift(testObject, "a.b")).toThrow();
  });

  test("insertAtIndex", () => {
    _.path.insertAtIndex(testObject, "a.e", 4, 1);
    expect(testObject.a.e).toEqual([1, 4, 2, 3]);

    expect(() => _.path.insertAtIndex(testObject, "a.b", 5, 0)).toThrow();
  });

  test("removeAtIndex", () => {
    const result = _.path.removeAtIndex(testObject, "a.e", 1);
    expect(result.removedValues).toEqual([2]);
    expect(testObject.a.e).toEqual([1, 3]);

    expect(() => _.path.removeAtIndex(testObject, "a.b", 0)).toThrow();
  });

  test("hasValue", () => {
    expect(_.path.hasValue(testObject, "a.b.c")).toBe(true);
    expect(_.path.hasValue(testObject, "a.b.x")).toBe(false);
  });

  test("toggleBoolean", () => {
    _.path.toggleBoolean(testObject, "a.f");
    expect(testObject.a.f).toBe(false);
  });

  test("merge", () => {
    _.path.merge(testObject, "a.b", { x: 10 });
    expect(testObject.a.b).toEqual({ c: 1, d: "test", x: 10 });
  });

  test("increment", () => {
    _.path.increment(testObject, "a.b.c");
    expect(testObject.a.b.c).toBe(2);

    _.path.increment(testObject, "a.b.c", 5);
    expect(testObject.a.b.c).toBe(7);
  });

  test("decrement", () => {
    _.path.decrement(testObject, "a.b.c");
    expect(testObject.a.b.c).toBe(0);

    _.path.decrement(testObject, "a.b.c", 5);
    expect(testObject.a.b.c).toBe(-5);

    expect(() => _.path.decrement(testObject, "a.b.d")).toThrow();
  });

  test("appendString", () => {
    _.path.appendString(testObject, "a.b.d", " appended");
    expect(testObject.a.b.d).toBe("test appended");

    expect(() =>
      _.path.appendString(testObject, "a.b.c", " appended")
    ).toThrow();
  });

  test("renameKey", () => {
    _.path.renameKey(testObject, "a.b.c", "x");
    expect(testObject.a.b.x).toBe(1);
    expect(testObject.a.b.c).toBeUndefined();

    expect(() => _.path.renameKey(testObject, "a.b.y", "z")).toThrow();
  });

  test("filterObject", () => {
    _.path.filterObject(
      testObject,
      "a.b",
      (value) => typeof value === "string"
    );
    expect(testObject.a.b).toEqual({ d: "test" });
  });

  test("mapObject", () => {
    _.path.mapObject(testObject, "a.b", (value) =>
      typeof value === "number" ? value * 2 : value
    );
    expect(testObject.a.b).toEqual({ c: 2, d: "test" });
  });

  test("pick", () => {
    _.path.pick(testObject, "a.b", ["c"]);
    expect(testObject.a.b).toEqual({ c: 1 });
  });

  test("omit", () => {
    _.path.omit(testObject, "a.b", ["c"]);
    expect(testObject.a.b).toEqual({ d: "test" });
  });

  test("deepFreeze", () => {
    _.path.deepFreeze(testObject, "a.b");
    expect(() => {
      testObject.a.b.c = 2;
    }).toThrow();
  });

  test("setDefault", () => {
    _.path.setDefault(testObject, "a.b.x", 10);
    expect(testObject.a.b.x).toBe(10);

    _.path.setDefault(testObject, "a.b.c", 10);
    expect(testObject.a.b.c).toBe(1);
  });

  test("toggleProperty", () => {
    _.path.toggleProperty(testObject, "a.b", "c", "x");
    expect(testObject.a.b.x).toBe(1);
    expect(testObject.a.b.c).toBeUndefined();

    _.path.toggleProperty(testObject, "a.b", "x", "c");
    expect(testObject.a.b.c).toBe(1);
    expect(testObject.a.b.x).toBeUndefined();

    expect(() => _.path.toggleProperty(testObject, "a.b", "y", "z")).toThrow();
  });

  test("countProperties", () => {
    expect(_.path.countProperties(testObject, "a.b")).toBe(2);
    expect(_.path.countProperties(testObject, "a.e")).toBe(3);
  });

  test("flatten", () => {
    const flattened = _.path.flatten(testObject, "a");
    expect(flattened).toEqual({
      a: {
        "b.c": 1,
        "b.d": "test",
        e: [1, 2, 3],
        f: true,
      },
      g: {
        h: {
          i: "value",
        },
      },
    });
  });

  test("unflatten", () => {
    const flatObject = {
        "x.y.z": 1,
        "x.y.w": 2,
        "x.a": 3,
    };
    _.path.unflatten(testObject, "h", flatObject);
    expect(testObject.h).toEqual({
      x: {
        y: {
          z: 1,
          w: 2,
        },
        a: 3,
      },
    });
  });

  test("swapValues", () => {
    _.path.swapValues(testObject, "a.b.c", "g.h.i");
    expect(testObject.a.b.c).toBe("value");
    expect(testObject.g.h.i).toBe(1);
  });

  test("sortArray", () => {
    _.path.sortArray(testObject, "a.e", (a, b) => b - a);
    expect(testObject.a.e).toEqual([3, 2, 1]);
  });

  test("sortObjectKeys", () => {
    _.path.sortObjectKeys(testObject, "a.b", (a, b) => b.localeCompare(a));
    expect(Object.keys(testObject.a.b)).toEqual(["d", "c"]);
  });

  test("sortObjectValues", () => {
    _.path.sortObjectValues(testObject, "a.b", (a, b) => a - b);
    expect(Object.values(testObject.a.b)).toEqual([1, "test"]);
  });

  test("reverse", () => {
    _.path.reverse(testObject, "a.e");
    expect(testObject.a.e).toEqual([3, 2, 1]);

    _.path.reverse(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe("tset");
  });

  test("typeOf", () => {
    expect(_.path.typeOf(testObject, "a.b.c")).toBe("number");
    expect(_.path.typeOf(testObject, "a.b.d")).toBe("string");
    expect(_.path.typeOf(testObject, "a.e")).toBe("object");
  });

  test("isArray", () => {
    expect(_.path.isArray(testObject, "a.e")).toBe(true);
    expect(_.path.isArray(testObject, "a.b")).toBe(false);
  });

  test("toInt", () => {
    testObject.a.b.d = "42";
    _.path.toInt(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe(42);
  });

  test("toFloat", () => {
    testObject.a.b.d = "3.14";
    _.path.toFloat(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe(3.14);
  });

  test("isNumber", () => {
    expect(_.path.isNumber(testObject, "a.b.c")).toBe(true);
    expect(_.path.isNumber(testObject, "a.b.d")).toBe(false);
  });

  test("isString", () => {
    expect(_.path.isString(testObject, "a.b.d")).toBe(true);
    expect(_.path.isString(testObject, "a.b.c")).toBe(false);
  });

  test("isObject", () => {
    expect(_.path.isObject(testObject, "a.b")).toBe(true);
    expect(_.path.isObject(testObject, "a.b.c")).toBe(false);
  });

  test("isNil", () => {
    expect(_.path.isNil(testObject, "a.b.x")).toBe(true);
    expect(_.path.isNil(testObject, "a.b.c")).toBe(false);
  });

  test("toBoolean", () => {
    _.path.toBoolean(testObject, "a.b.c");
    expect(testObject.a.b.c).toBe(true);

    _.path.toBoolean(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe(true);

    testObject.a.b.x = 0;
    _.path.toBoolean(testObject, "a.b.x");
    expect(testObject.a.b.x).toBe(false);
  });

  test("getLength", () => {
    expect(_.path.getLength(testObject, "a.e")).toBe(3);
    expect(_.path.getLength(testObject, "a.b.d")).toBe(4);
    expect(_.path.getLength(testObject, "a.b.c")).toBe(0);
  });

  test("isEmpty", () => {
    expect(_.path.isEmpty(testObject, "a.b")).toBe(false);
    expect(_.path.isEmpty(testObject, "a.b.x")).toBe(true);
  });

  test("trim", () => {
    testObject.a.b.d = "  test  ";
    _.path.trim(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe("test");
  });

  test("toUpperCase", () => {
    _.path.toUpperCase(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe("TEST");
  });

  test("toLowerCase", () => {
    testObject.a.b.d = "TEST";
    _.path.toLowerCase(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe("test");
  });

  test("isFunction", () => {
    testObject.a.b.func = () => {};
    expect(_.path.isFunction(testObject, "a.b.func")).toBe(true);
    expect(_.path.isFunction(testObject, "a.b.c")).toBe(false);
  });

  test("isDate", () => {
    testObject.a.b.date = new Date();
    expect(_.path.isDate(testObject, "a.b.date")).toBe(true);
    expect(_.path.isDate(testObject, "a.b.c")).toBe(false);
  });

  test("cloneDeep", () => {
    const cloned = _.path.cloneDeep(testObject, "a.b");
    expect(cloned).toEqual(testObject.a.b);
    expect(cloned).not.toBe(testObject.a.b);
  });

  test("isEqual", () => {
    expect(_.path.isEqual(testObject, "a.b.c", "a.b.c")).toBe(true);
    expect(_.path.isEqual(testObject, "a.b.c", "a.b.d")).toBe(false);
  });

  test("defaultsDeep", () => {
    _.path.defaultsDeep(testObject, "a.b", { x: 10, y: 20 });
    expect(testObject.a.b).toEqual({ c: 1, d: "test", x: 10, y: 20 });
  });

  test("find", () => {
    const result = _.path.find(testObject, "a.e", (num) => num > 1);
    expect(result).toBe(2);
  });

  test("findIndex", () => {
    const index = _.path.findIndex(testObject, "a.e", (num) => num > 1);
    expect(index).toBe(1);
  });

  test("unique", () => {
    testObject.a.e = [1, 2, 2, 3, 3, 4];
    const unique = _.path.unique(testObject, "a.e");
    expect(unique).toEqual([1, 2, 3, 4]);
  });

  test("group", () => {
    testObject.a.e = [1.1, 2.1, 2.3, 3.4];
    const grouped = _.path.group(testObject, "a.e", Math.floor);
    expect(grouped).toEqual({ 1: [1.1], 2: [2.1, 2.3], 3: [3.4] });
  });

  test("sum", () => {
    const sum = _.path.sum(testObject, "a.e");
    expect(sum).toBe(6);
  });

  test("max", () => {
    const max = _.path.max(testObject, "a.e");
    expect(max).toBe(3);
  });

  test("min", () => {
    const min = _.path.min(testObject, "a.e");
    expect(min).toBe(1);
  });

  test("zipObject", () => {
    testObject.keys = ["a", "b", "c"];
    testObject.values = [1, 2, 3];
    const zipped = _.path.zipObject(testObject, "keys", "values");
    expect(zipped).toEqual({ a: 1, b: 2, c: 3 });
  });
});
