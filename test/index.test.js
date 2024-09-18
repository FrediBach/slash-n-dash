import _ from "../src/index.js";

test("simple get", () => {
  const obj = { a: { a: "test1", b: "test2" } };
  expect(_.get(obj, "a.b")).toBe("test2");
});

test("simple set", () => {
  const obj = { a: { a: "test1", b: "test2" } };
  _.set(obj, "a.b", "test3");
  expect(_.get(obj, "a.b")).toBe("test3");
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

  test("resolveWildcardPath", () => {
    expect(_.resolveWildcardPath(testObject, "a.*.c")).toEqual(["a.b.c"]);
    expect(_.resolveWildcardPath(testObject, "a.**")).toEqual([
      "a.b",
      "a.b.c",
      "a.b.d",
      "a.e",
      "a.e.0",
      "a.e.1",
      "a.e.2",
      "a.f",
    ]);
    expect(_.resolveWildcardPath(testObject, "a.e.*")).toEqual([
      "a.e.0",
      "a.e.1",
      "a.e.2",
    ]);
    
    // OR selector test
    expect(_.resolveWildcardPath(testObject, "a.b|e.*")).toEqual(["a.b.c", "a.b.d", "a.e.0", "a.e.1", "a.e.2"]);

    // Exclusion selector test
    expect(_.resolveWildcardPath(testObject, "a.*!e")).toEqual(["a.b", "a.f"]);
  });

  test("getWildcard", () => {
    expect(_.getWildcard(testObject, "a.b.c")).toBe(1);
    expect(_.getWildcard(testObject, "a.*.c")).toEqual(1);
    expect(_.getWildcard(testObject, "a.e.*")).toEqual([1, 2, 3]);

    // OR selector test
    expect(_.getWildcard(testObject, "a.e|f")).toEqual([[1, 2, 3], true]);

    // Exclusion selector test
    expect(_.getWildcard(testObject, "a.*!e")).toEqual([
        { "c": 1, "d": "test" },
        true
    ]);
  });

  test("setWildcard", () => {
    _.setWildcard(testObject, "a.*.c", 5);
    expect(testObject.a.b.c).toBe(5);

    _.setWildcard(testObject, "a.e.*", 0);
    expect(testObject.a.e).toEqual([0, 0, 0]);
  });

  test("removeByPath", () => {
    _.removeByPath(testObject, "a.b.c");
    expect(testObject.a.b.c).toBeUndefined();

    _.removeByPath(testObject, "a.e");
    expect(testObject.a.e).toBeUndefined();
  });

  test("pushToArrayByPath", () => {
    _.pushToArrayByPath(testObject, "a.e", 4);
    expect(testObject.a.e).toEqual([1, 2, 3, 4]);

    expect(() => _.pushToArrayByPath(testObject, "a.b", 5)).toThrow();
  });

  test("popFromArrayByPath", () => {
    expect(_.popFromArrayByPath(testObject, "a.e")).toBe(3);
    expect(testObject.a.e).toEqual([1, 2]);

    expect(() => _.popFromArrayByPath(testObject, "a.b")).toThrow();
  });

  test("unshiftToArrayByPath", () => {
    expect(_.unshiftToArrayByPath(testObject, "a.e", 0)).toBe(4);
    expect(testObject.a.e).toEqual([0, 1, 2, 3]);

    expect(() => _.unshiftToArrayByPath(testObject, "a.b", 5)).toThrow();
  });

  test("shiftFromArrayByPath", () => {
    expect(_.shiftFromArrayByPath(testObject, "a.e")).toBe(1);
    expect(testObject.a.e).toEqual([2, 3]);

    expect(() => _.shiftFromArrayByPath(testObject, "a.b")).toThrow();
  });

  test("insertAtIndexByPath", () => {
    _.insertAtIndexByPath(testObject, "a.e", 4, 1);
    expect(testObject.a.e).toEqual([1, 4, 2, 3]);

    expect(() => _.insertAtIndexByPath(testObject, "a.b", 5, 0)).toThrow();
  });

  test("removeAtIndexByPath", () => {
    const result = _.removeAtIndexByPath(testObject, "a.e", 1);
    expect(result.removedValue).toBe(2);
    expect(testObject.a.e).toEqual([1, 3]);

    expect(() => _.removeAtIndexByPath(testObject, "a.b", 0)).toThrow();
  });

  test("hasPathValue", () => {
    expect(_.hasPathValue(testObject, "a.b.c")).toBe(true);
    expect(_.hasPathValue(testObject, "a.b.x")).toBe(false);
  });

  test("toggleBooleanByPath", () => {
    _.toggleBooleanByPath(testObject, "a.f");
    expect(testObject.a.f).toBe(false);

    expect(() => _.toggleBooleanByPath(testObject, "a.b.c")).toThrow();
  });

  test("mergeByPath", () => {
    _.mergeByPath(testObject, "a.b", { x: 10 });
    expect(testObject.a.b).toEqual({ c: 1, d: "test", x: 10 });
  });

  test("incrementByPath", () => {
    _.incrementByPath(testObject, "a.b.c");
    expect(testObject.a.b.c).toBe(2);

    _.incrementByPath(testObject, "a.b.c", 5);
    expect(testObject.a.b.c).toBe(7);

    expect(() => _.incrementByPath(testObject, "a.b.d")).toThrow();
  });

  test("decrementByPath", () => {
    _.decrementByPath(testObject, "a.b.c");
    expect(testObject.a.b.c).toBe(0);

    _.decrementByPath(testObject, "a.b.c", 5);
    expect(testObject.a.b.c).toBe(-5);

    expect(() => _.decrementByPath(testObject, "a.b.d")).toThrow();
  });

  test("appendStringByPath", () => {
    _.appendStringByPath(testObject, "a.b.d", " appended");
    expect(testObject.a.b.d).toBe("test appended");

    expect(() =>
      _.appendStringByPath(testObject, "a.b.c", " appended")
    ).toThrow();
  });

  test("renameKeyByPath", () => {
    _.renameKeyByPath(testObject, "a.b.c", "x");
    expect(testObject.a.b.x).toBe(1);
    expect(testObject.a.b.c).toBeUndefined();

    expect(() => _.renameKeyByPath(testObject, "a.b.y", "z")).toThrow();
  });

  test("filterObjectByPath", () => {
    _.filterObjectByPath(
      testObject,
      "a.b",
      (value) => typeof value === "string"
    );
    expect(testObject.a.b).toEqual({ d: "test" });
  });

  test("mapObjectByPath", () => {
    _.mapObjectByPath(testObject, "a.b", (value) =>
      typeof value === "number" ? value * 2 : value
    );
    expect(testObject.a.b).toEqual({ c: 2, d: "test" });
  });

  test("pickByPath", () => {
    _.pickByPath(testObject, "a.b", ["c"]);
    expect(testObject.a.b).toEqual({ c: 1 });
  });

  test("omitByPath", () => {
    _.omitByPath(testObject, "a.b", ["c"]);
    expect(testObject.a.b).toEqual({ d: "test" });
  });

  test("deepFreezeByPath", () => {
    _.deepFreezeByPath(testObject, "a.b");
    expect(() => {
      testObject.a.b.c = 2;
    }).toThrow();
  });

  test("setDefaultByPath", () => {
    _.setDefaultByPath(testObject, "a.b.x", 10);
    expect(testObject.a.b.x).toBe(10);

    _.setDefaultByPath(testObject, "a.b.c", 10);
    expect(testObject.a.b.c).toBe(1);
  });

  test("togglePropertyByPath", () => {
    _.togglePropertyByPath(testObject, "a.b", "c", "x");
    expect(testObject.a.b.x).toBe(1);
    expect(testObject.a.b.c).toBeUndefined();

    _.togglePropertyByPath(testObject, "a.b", "x", "c");
    expect(testObject.a.b.c).toBe(1);
    expect(testObject.a.b.x).toBeUndefined();

    expect(() => _.togglePropertyByPath(testObject, "a.b", "y", "z")).toThrow();
  });

  test("countPropertiesByPath", () => {
    expect(_.countPropertiesByPath(testObject, "a.b")).toBe(2);
    expect(_.countPropertiesByPath(testObject, "a.e")).toBe(3);
  });

  test("flattenObjectByPath", () => {
    const flattened = _.flattenObjectByPath(testObject, "a");
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

  test("unflattenObjectByPath", () => {
    const flatObject = {
        "x.y.z": 1,
        "x.y.w": 2,
        "x.a": 3,
    };
    _.unflattenObjectByPath(testObject, "h", flatObject);
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

  test("swapValuesByPath", () => {
    _.swapValuesByPath(testObject, "a.b.c", "g.h.i");
    expect(testObject.a.b.c).toBe("value");
    expect(testObject.g.h.i).toBe(1);
  });

  test("sortArrayByPath", () => {
    _.sortArrayByPath(testObject, "a.e", (a, b) => b - a);
    expect(testObject.a.e).toEqual([3, 2, 1]);
  });

  test("sortObjectKeysByPath", () => {
    _.sortObjectKeysByPath(testObject, "a.b", (a, b) => b.localeCompare(a));
    expect(Object.keys(testObject.a.b)).toEqual(["d", "c"]);
  });

  test("sortObjectValuesByPath", () => {
    _.sortObjectValuesByPath(testObject, "a.b", (a, b) => a - b);
    expect(Object.values(testObject.a.b)).toEqual([1, "test"]);
  });

  test("reverseByPath", () => {
    _.reverseByPath(testObject, "a.e");
    expect(testObject.a.e).toEqual([3, 2, 1]);

    _.reverseByPath(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe("tset");
  });

  test("typeOfByPath", () => {
    expect(_.typeOfByPath(testObject, "a.b.c")).toBe("number");
    expect(_.typeOfByPath(testObject, "a.b.d")).toBe("string");
    expect(_.typeOfByPath(testObject, "a.e")).toBe("object");
  });

  test("isArrayByPath", () => {
    expect(_.isArrayByPath(testObject, "a.e")).toBe(true);
    expect(_.isArrayByPath(testObject, "a.b")).toBe(false);
  });

  test("toIntByPath", () => {
    testObject.a.b.d = "42";
    _.toIntByPath(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe(42);
  });

  test("toFloatByPath", () => {
    testObject.a.b.d = "3.14";
    _.toFloatByPath(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe(3.14);
  });

  test("isNumberByPath", () => {
    expect(_.isNumberByPath(testObject, "a.b.c")).toBe(true);
    expect(_.isNumberByPath(testObject, "a.b.d")).toBe(false);
  });

  test("isStringByPath", () => {
    expect(_.isStringByPath(testObject, "a.b.d")).toBe(true);
    expect(_.isStringByPath(testObject, "a.b.c")).toBe(false);
  });

  test("isObjectByPath", () => {
    expect(_.isObjectByPath(testObject, "a.b")).toBe(true);
    expect(_.isObjectByPath(testObject, "a.b.c")).toBe(false);
  });

  test("isNilByPath", () => {
    expect(_.isNilByPath(testObject, "a.b.x")).toBe(true);
    expect(_.isNilByPath(testObject, "a.b.c")).toBe(false);
  });

  test("toBooleanByPath", () => {
    _.toBooleanByPath(testObject, "a.b.c");
    expect(testObject.a.b.c).toBe(true);

    _.toBooleanByPath(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe(true);

    testObject.a.b.x = 0;
    _.toBooleanByPath(testObject, "a.b.x");
    expect(testObject.a.b.x).toBe(false);
  });

  test("getLengthByPath", () => {
    expect(_.getLengthByPath(testObject, "a.e")).toBe(3);
    expect(_.getLengthByPath(testObject, "a.b.d")).toBe(4);
    expect(_.getLengthByPath(testObject, "a.b.c")).toBe(0);
  });

  test("isEmptyByPath", () => {
    expect(_.isEmptyByPath(testObject, "a.b")).toBe(false);
    expect(_.isEmptyByPath(testObject, "a.b.x")).toBe(true);
  });

  test("trimByPath", () => {
    testObject.a.b.d = "  test  ";
    _.trimByPath(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe("test");
  });

  test("toUpperCaseByPath", () => {
    _.toUpperCaseByPath(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe("TEST");
  });

  test("toLowerCaseByPath", () => {
    testObject.a.b.d = "TEST";
    _.toLowerCaseByPath(testObject, "a.b.d");
    expect(testObject.a.b.d).toBe("test");
  });

  test("isFunctionByPath", () => {
    testObject.a.b.func = () => {};
    expect(_.isFunctionByPath(testObject, "a.b.func")).toBe(true);
    expect(_.isFunctionByPath(testObject, "a.b.c")).toBe(false);
  });

  test("isDateByPath", () => {
    testObject.a.b.date = new Date();
    expect(_.isDateByPath(testObject, "a.b.date")).toBe(true);
    expect(_.isDateByPath(testObject, "a.b.c")).toBe(false);
  });

  test("cloneDeepByPath", () => {
    const cloned = _.cloneDeepByPath(testObject, "a.b");
    expect(cloned).toEqual(testObject.a.b);
    expect(cloned).not.toBe(testObject.a.b);
  });

  test("isEqualByPath", () => {
    expect(_.isEqualByPath(testObject, "a.b.c", "a.b.c")).toBe(true);
    expect(_.isEqualByPath(testObject, "a.b.c", "a.b.d")).toBe(false);
  });

  test("defaultsDeepByPath", () => {
    _.defaultsDeepByPath(testObject, "a.b", { x: 10, y: 20 });
    expect(testObject.a.b).toEqual({ c: 1, d: "test", x: 10, y: 20 });
  });

  test("findByPath", () => {
    const result = _.findByPath(testObject, "a.e", (num) => num > 1);
    expect(result).toBe(2);
  });

  test("findIndexByPath", () => {
    const index = _.findIndexByPath(testObject, "a.e", (num) => num > 1);
    expect(index).toBe(1);
  });

  test("uniqueByPath", () => {
    testObject.a.e = [1, 2, 2, 3, 3, 4];
    const unique = _.uniqueByPath(testObject, "a.e");
    expect(unique).toEqual([1, 2, 3, 4]);
  });

  test("groupByPath", () => {
    testObject.a.e = [1.1, 2.1, 2.3, 3.4];
    const grouped = _.groupByPath(testObject, "a.e", Math.floor);
    expect(grouped).toEqual({ 1: [1.1], 2: [2.1, 2.3], 3: [3.4] });
  });

  test("sumByPath", () => {
    const sum = _.sumByPath(testObject, "a.e");
    expect(sum).toBe(6);
  });

  test("maxByPath", () => {
    const max = _.maxByPath(testObject, "a.e");
    expect(max).toBe(3);
  });

  test("minByPath", () => {
    const min = _.minByPath(testObject, "a.e");
    expect(min).toBe(1);
  });

  test("zipObjectByPath", () => {
    testObject.keys = ["a", "b", "c"];
    testObject.values = [1, 2, 3];
    const zipped = _.zipObjectByPath(testObject, "keys", "values");
    expect(zipped).toEqual({ a: 1, b: 2, c: 3 });
  });
});
