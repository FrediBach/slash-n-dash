import _ from "lodash";

// New Lodash Path Methods:

/**
 * Resolves a wildcard path to multiple concrete paths.
 * @param {Object} object - The object to traverse.
 * @param {string|string[]} path - The path with potential wildcards.
 * @returns {string[]} An array of concrete paths.
 */
_.resolveWildcardPath = (object, path) => {
  const parts = _.toPath(path);
  let current = [{ obj: object, path: "" }];
  const results = [];

  const traverseDeep = (obj, currentPath) => {
    let paths = [];
    if (_.isObject(obj)) {
      for (const key in obj) {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        paths.push({ obj: obj[key], path: newPath });
        paths = paths.concat(traverseDeep(obj[key], newPath));
      }
    }
    return paths;
  };

  parts.forEach((part, index) => {
    if (part === "**") {
      current = current.flatMap(({ obj, path }) => traverseDeep(obj, path));
    } else if (part === "*") {
      current = current.flatMap(({ obj, path }) =>
        _.isObject(obj)
          ? Object.keys(obj).map((key) => ({
              obj: obj[key],
              path: path ? `${path}.${key}` : key,
            }))
          : []
      );
    } else if (part.includes("*!")) {
      const [wildcard, excludedKeysString] = part.split("!");
      const excludedKeys = excludedKeysString.split(',').map(key => key.trim());
      current = current.flatMap(({ obj, path }) =>
        _.isObject(obj)
          ? Object.keys(obj)
              .filter((key) => !excludedKeys.includes(key))
              .map((key) => ({
                obj: obj[key],
                path: path ? `${path}.${key}` : key,
              }))
          : []
      );
    } else if (part.includes("|")) {
      const keys = part.split("|");
      current = current.flatMap(({ obj, path }) =>
        keys
          .map((key) => ({
            obj: _.get(obj, key),
            path: path ? `${path}.${key}` : key,
          }))
          .filter(({ obj }) => obj !== undefined)
      );
    } else {
      current = current
        .map(({ obj, path }) => ({
          obj: _.get(obj, part),
          path: path ? `${path}.${part}` : part,
        }))
        .filter(({ obj }) => obj !== undefined);
    }

    if (index === parts.length - 1) {
      results.push(...current.map(({ path }) => path));
    }
  });

  return results;
};

/**
 * Gets the value at path of object, supporting wildcards.
 * If the path is a wildcard path, it returns an array of values.
 * @param {Object} object The object to query.
 * @param {string|string[]} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for undefined resolved values.
 * @returns {*} Returns the resolved value or an array of resolved values.
 */
_.getWildcard = (object, path, defaultValue) => {
  const paths = _.resolveWildcardPath(object, path);
  if (paths.length === 1) {
    return _.get(object, paths[0], defaultValue);
  }
  return paths.map(p => _.get(object, p, defaultValue));
};

/**
 * Sets the value at path of object, supporting wildcards.
 * If the path is a wildcard path, it sets the value for all matching paths.
 * @param {Object} object The object to modify.
 * @param {string|string[]} path The path of the property to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the modified object.
 */
_.setWildcard = (object, path, value) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach(p => _.set(object, p, value));
  return object;
};

/**
 * Removes properties from an object at the specified path, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path of the property to remove, supporting wildcards.
 * @returns {Object} The modified object.
 */
_.removeByPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach(p => {
    const pathArray = _.toPath(p);
    const lastKey = pathArray.pop();
    const parentObj = _.get(object, pathArray);

    if (parentObj && typeof parentObj === "object") {
      delete parentObj[lastKey];
    }
  });

  return object;
};

/**
 * Pushes a value to arrays at the specified paths, supporting wildcards.
 * @param {Object} object - The object containing the arrays.
 * @param {string|string[]} path - The path to the arrays, supporting wildcards.
 * @param {*} value - The value to push to the arrays.
 * @returns {Object} The modified object.
 * @throws {Error} If any resolved path does not lead to an array.
 */
_.pushToArrayByPath = (object, path, value) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach(p => {
    const array = _.get(object, p);
    if (!Array.isArray(array)) {
      throw new Error(`Path ${p} does not lead to an array`);
    }
    array.push(value);
  });
  return object;
};

/**
 * Removes and returns the last element from arrays at the specified paths, supporting wildcards.
 * @param {Object} object - The object containing the arrays.
 * @param {string|string[]} path - The path to the arrays, supporting wildcards.
 * @returns {*|Array} The popped value or an array of popped values if multiple arrays are affected.
 * @throws {Error} If any resolved path does not lead to an array.
 */
_.popFromArrayByPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  const poppedValues = paths.map(p => {
    const array = _.get(object, p);
    if (!Array.isArray(array)) {
      throw new Error(`Path ${p} does not lead to an array`);
    }
    return array.pop();
  });

  return poppedValues.length === 1 ? poppedValues[0] : poppedValues;
};

/**
 * Adds one or more elements to the beginning of arrays at the specified paths, supporting wildcards.
 * @param {Object} object - The object containing the arrays.
 * @param {string|string[]} path - The path to the arrays, supporting wildcards.
 * @param {...*} values - The values to add to the beginning of the arrays.
 * @returns {number|number[]} The new length of the array, or an array of new lengths if multiple arrays are affected.
 * @throws {Error} If any resolved path does not lead to an array.
 */
_.unshiftToArrayByPath = (object, path, ...values) => {
  const paths = _.resolveWildcardPath(object, path);
  const newLengths = paths.map(p => {
    const array = _.get(object, p);
    if (!Array.isArray(array)) {
      throw new Error(`Path ${p} does not lead to an array`);
    }
    return array.unshift(...values);
  });

  return newLengths.length === 1 ? newLengths[0] : newLengths;
};

/**
 * Removes and returns the first element from arrays at the specified paths, supporting wildcards.
 * @param {Object} object - The object containing the arrays.
 * @param {string|string[]} path - The path to the arrays, supporting wildcards.
 * @returns {*|Array} The shifted value or an array of shifted values if multiple arrays are affected.
 * @throws {Error} If any resolved path does not lead to an array.
 */
_.shiftFromArrayByPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  const shiftedValues = paths.map(p => {
    const array = _.get(object, p);
    if (!Array.isArray(array)) {
      throw new Error(`Path ${p} does not lead to an array`);
    }
    return array.shift();
  });

  return shiftedValues.length === 1 ? shiftedValues[0] : shiftedValues;
};

/**
 * Inserts a value at a specific index in arrays at the specified paths, supporting wildcards.
 * @param {Object} object - The object containing the arrays.
 * @param {string|string[]} path - The path to the arrays, supporting wildcards.
 * @param {*} value - The value to insert.
 * @param {number} index - The index at which to insert the value.
 * @returns {Object} The modified object.
 * @throws {Error} If any resolved path does not lead to an array.
 */
_.insertAtIndexByPath = (object, path, value, index) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach(p => {
    const array = _.get(object, p);
    if (Array.isArray(array)) {
      array.splice(index, 0, value);
      _.set(object, p, array);
    } else {
      throw new Error(`Path ${p} does not lead to an array`);
    }
  });
  return object;
};

/**
 * Removes and returns elements at a specific index from arrays at the specified paths, supporting wildcards.
 * @param {Object} object - The object containing the arrays.
 * @param {string|string[]} path - The path to the arrays, supporting wildcards.
 * @param {number} index - The index of the elements to remove.
 * @returns {{object: Object, removedValues: Array}} The modified object and an array of removed values.
 * @throws {Error} If any resolved path does not lead to an array.
 */
_.removeAtIndexByPath = (object, path, index) => {
  const paths = _.resolveWildcardPath(object, path);
  const removedValues = [];

  paths.forEach(p => {
    const array = _.get(object, p);
    if (Array.isArray(array)) {
      if (index >= 0 && index < array.length) {
        const removedValue = array.splice(index, 1)[0];
        _.set(object, p, array);
        removedValues.push(removedValue);
      }
    } else {
      throw new Error(`Path ${p} does not lead to an array`);
    }
  });

  return { object, removedValues };
};

/**
 * Checks if a value exists at the specified path.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to check.
 * @returns {boolean} True if the path has a value, false otherwise.
 */
_.hasPathValue = (object, path) => {
  return _.get(object, path) !== undefined;
};

/**
 * Toggles a boolean value at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the boolean value.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not a boolean.
 */
_.toggleBooleanByPath = (object, path) => {
  const currentValue = _.get(object, path);
  if (!_.isBoolean(currentValue)) {
    throw new Error(`Value at path ${path} is not a boolean`);
  }
  return _.set(object, path, !currentValue);
};

/**
 * Merges a source object into the object at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the target object.
 * @param {Object} sourceObject - The object to merge.
 * @returns {Object} The modified object.
 */
_.mergeByPath = (object, path, sourceObject) => {
  const targetObject = _.get(object, path) || {};
  const mergedObject = _.merge({}, targetObject, sourceObject);
  return _.set(object, path, mergedObject);
};

/**
 * Increments a number at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the number.
 * @param {number} [amount=1] - The amount to increment by.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not a number.
 */
_.incrementByPath = (object, path, amount = 1) => {
  const currentValue = _.get(object, path);
  if (typeof currentValue !== "number") {
    throw new Error(`Value at path ${path} is not a number`);
  }
  return _.set(object, path, currentValue + amount);
};

/**
 * Decrements a number at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the number.
 * @param {number} [amount=1] - The amount to decrement by.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not a number.
 */
_.decrementByPath = (object, path, amount = 1) => {
  const currentValue = _.get(object, path);
  if (typeof currentValue !== "number") {
    throw new Error(`Value at path ${path} is not a number`);
  }
  return _.set(object, path, currentValue - amount);
};

/**
 * Appends a string to the string at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the string.
 * @param {string} string - The string to append.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not a string.
 */
_.appendStringByPath = (object, path, string) => {
  const currentValue = _.get(object, path);
  if (typeof currentValue !== "string") {
    throw new Error(`Value at path ${path} is not a string`);
  }
  return _.set(object, path, currentValue + string);
};

/**
 * Renames a key in an object at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the key to rename.
 * @param {string} newKey - The new key name.
 * @returns {Object} The modified object.
 * @throws {Error} If the parent at the path is not an object or the key doesn't exist.
 */
_.renameKeyByPath = (object, path, newKey) => {
  const parentPath = path.split(".").slice(0, -1).join(".");
  const oldKey = path.split(".").pop();
  const parentObject = _.get(object, parentPath);

  if (!_.isObject(parentObject)) {
    throw new Error(`Parent at path ${parentPath} is not an object`);
  }

  if (!(oldKey in parentObject)) {
    throw new Error(
      `Key ${oldKey} does not exist in object at path ${parentPath}`
    );
  }

  parentObject[newKey] = parentObject[oldKey];
  delete parentObject[oldKey];

  return object;
};

/**
 * Filters an object at the specified path using a predicate function.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the object to filter.
 * @param {Function} predicate - The function to test each property.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not an object.
 */
_.filterObjectByPath = (object, path, predicate) => {
  const targetObject = _.get(object, path);
  if (!_.isObject(targetObject)) {
    throw new Error(`Value at path ${path} is not an object`);
  }
  const filteredObject = _.pickBy(targetObject, predicate);
  return _.set(object, path, filteredObject);
};

/**
 * Maps an object at the specified path using a mapper function.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the object to map.
 * @param {Function} mapper - The function to map each property.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not an object.
 */
_.mapObjectByPath = (object, path, mapper) => {
  const targetObject = _.get(object, path);
  if (!_.isObject(targetObject)) {
    throw new Error(`Value at path ${path} is not an object`);
  }
  const mappedObject = _.mapValues(targetObject, mapper);
  return _.set(object, path, mappedObject);
};

/**
 * Picks specified properties from an object at the given path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the object to pick from.
 * @param {string[]} keys - The keys to pick.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not an object.
 */
_.pickByPath = (object, path, keys) => {
  const targetObject = _.get(object, path);
  if (!_.isObject(targetObject)) {
    throw new Error(`Value at path ${path} is not an object`);
  }
  const pickedObject = _.pick(targetObject, keys);
  return _.set(object, path, pickedObject);
};

/**
 * Omits specified properties from an object at the given path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the object to omit from.
 * @param {string[]} keys - The keys to omit.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not an object.
 */
_.omitByPath = (object, path, keys) => {
  const targetObject = _.get(object, path);
  if (!_.isObject(targetObject)) {
    throw new Error(`Value at path ${path} is not an object`);
  }
  const omittedObject = _.omit(targetObject, keys);
  return _.set(object, path, omittedObject);
};

/**
 * Sets a default value at the specified path if it doesn't exist.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to set the default value.
 * @param {*} defaultValue - The default value to set.
 * @returns {Object} The modified object.
 */
_.setDefaultByPath = (object, path, defaultValue) => {
  if (!_.hasPathValue(object, path)) {
    return _.set(object, path, defaultValue);
  }
  return object;
};

/**
 * Toggles between two properties in an object at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the object containing the properties.
 * @param {string} prop1 - The first property to toggle.
 * @param {string} prop2 - The second property to toggle.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not an object or neither property exists.
 */
_.togglePropertyByPath = (object, path, prop1, prop2) => {
  const targetObject = _.get(object, path);
  if (!_.isObject(targetObject)) {
    throw new Error(`Value at path ${path} is not an object`);
  }
  if (targetObject.hasOwnProperty(prop1)) {
    targetObject[prop2] = targetObject[prop1];
    delete targetObject[prop1];
  } else if (targetObject.hasOwnProperty(prop2)) {
    targetObject[prop1] = targetObject[prop2];
    delete targetObject[prop2];
  } else {
    throw new Error(
      `Neither ${prop1} nor ${prop2} exist in object at path ${path}`
    );
  }
  return object;
};

/**
 * Counts the number of properties in an object at the specified path.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to the object to count properties.
 * @returns {number} The number of properties.
 * @throws {Error} If the value at the path is not an object.
 */
_.countPropertiesByPath = (object, path) => {
  const targetObject = _.get(object, path);
  if (!_.isObject(targetObject)) {
    throw new Error(`Value at path ${path} is not an object`);
  }
  return Object.keys(targetObject).length;
};

/**
 * Unflattens an object at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the object to unflatten.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not an object.
 */
_.unflattenObjectByPath = (object, path, flatObject) => {
  if (!_.isObject(flatObject)) {
    throw new Error(`Value at path ${path} is not an object`);
  }
  const unflatten = (obj) => {
    const result = {};
    for (const key in obj) {
      const keys = key.split(".");
      keys.reduce((acc, k, i) => {
        if (i === keys.length - 1) {
          acc[k] = obj[key];
        } else {
          acc[k] = acc[k] || {};
        }
        return acc[k];
      }, result);
    }
    return result;
  };
  const unflattenedObject = unflatten(flatObject);
  return _.set(object, path, unflattenedObject);
};

/**
 * Swaps values between two paths in an object.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path1 - The first path.
 * @param {string|string[]} path2 - The second path.
 * @returns {Object} The modified object.
 * @throws {Error} If both paths do not exist in the object.
 */
_.swapValuesByPath = (object, path1, path2) => {
  const value1 = _.get(object, path1);
  const value2 = _.get(object, path2);

  if (value1 === undefined && value2 === undefined) {
    throw new Error(
      `Both paths ${path1} and ${path2} do not exist in the object`
    );
  }

  // Use _.set to ensure the paths are created if they don't exist
  _.set(object, path1, value2);
  _.set(object, path2, value1);

  return object;
};

/**
 * Sorts an array at the specified path using a comparator function.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the array to sort.
 * @param {Function} comparator - The comparator function to use for sorting.
 * @returns {Object} The modified object.
 * @throws {Error} If the path does not lead to an array.
 */
_.sortArrayByPath = (object, path, comparator) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  const sortedArray = [...array].sort(comparator);
  return _.set(object, path, sortedArray);
};

/**
 * Sorts the keys of an object at the specified path using a comparator function.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the object to sort keys.
 * @param {Function} comparator - The comparator function to use for sorting keys.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not an object.
 */
_.sortObjectKeysByPath = (object, path, comparator) => {
  const targetObject = _.get(object, path);
  if (!_.isObject(targetObject)) {
    throw new Error(`Value at path ${path} is not an object`);
  }
  const sortedKeys = Object.keys(targetObject).sort(comparator);
  const sortedObject = {};
  sortedKeys.forEach((key) => {
    sortedObject[key] = targetObject[key];
  });
  return _.set(object, path, sortedObject);
};

/**
 * Sorts an array or object values at the specified path using a comparator function.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the array or object to sort.
 * @param {Function} comparator - The comparator function to use for sorting.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is neither an array nor an object.
 */
_.sortObjectValuesByPath = (object, path, comparator) => {
  const value = _.get(object, path);
  
  if (Array.isArray(value)) {
    // If it's an array, sort it directly
    const sortedArray = [...value].sort(comparator);
    return _.set(object, path, sortedArray);
  } else if (_.isObject(value)) {
    // If it's an object, sort its values
    const entries = Object.entries(value);
    entries.sort((a, b) => comparator(a[1], b[1]));
    const sortedObject = Object.fromEntries(entries);
    return _.set(object, path, sortedObject);
  } else {
    throw new Error(`Value at path ${path} is neither an array nor an object`);
  }
};

/**
 * Reverses an array or string at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the array or string to reverse.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is neither an array nor a string.
 */
_.reverseByPath = (object, path) => {
  const value = _.get(object, path);
  if (Array.isArray(value)) {
    return _.set(object, path, value.slice().reverse());
  } else if (typeof value === "string") {
    return _.set(object, path, value.split("").reverse().join(""));
  } else {
    throw new Error(`Value at path ${path} is neither an array nor a string`);
  }
};

/**
 * Gets the type of the value at the specified path.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to the value.
 * @returns {string} The type of the value.
 */
_.typeOfByPath = (object, path) => {
  const value = _.get(object, path);
  return typeof value;
};

/**
 * Checks if the value at the specified path is an array.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to the value.
 * @returns {boolean} True if the value is an array, false otherwise.
 */
_.isArrayByPath = (object, path) => {
  return Array.isArray(_.get(object, path));
};

/**
 * Converts the value at the specified path to an integer.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the value.
 * @returns {Object} The modified object.
 */
_.toIntByPath = (object, path) => {
  const value = _.get(object, path);
  return _.set(object, path, parseInt(value, 10));
};

/**
 * Converts the value at the specified path to a float.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the value.
 * @returns {Object} The modified object.
 */
_.toFloatByPath = (object, path) => {
  const value = _.get(object, path);
  return _.set(object, path, parseFloat(value));
};

/**
 * Checks if the value at the specified path is a number.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to the value.
 * @returns {boolean} True if the value is a number, false otherwise.
 */
_.isNumberByPath = (object, path) => {
  return _.isNumber(_.get(object, path));
};

/**
 * Checks if the value at the specified path is a string.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to the value.
 * @returns {boolean} True if the value is a string, false otherwise.
 */
_.isStringByPath = (object, path) => {
  return _.isString(_.get(object, path));
};

/**
 * Checks if the value at the specified path is an object.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to the value.
 * @returns {boolean} True if the value is an object, false otherwise.
 */
_.isObjectByPath = (object, path) => {
  return _.isObject(_.get(object, path));
};

/**
 * Checks if the value at the specified path is null or undefined.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to the value.
 * @returns {boolean} True if the value is null or undefined, false otherwise.
 */
_.isNilByPath = (object, path) => {
  return _.isNil(_.get(object, path));
};

/**
 * Converts the value at the specified path to a boolean.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the value.
 * @returns {Object} The modified object.
 */
_.toBooleanByPath = (object, path) => {
  const value = _.get(object, path);
  return _.set(object, path, Boolean(value));
};

/**
 * Gets the length of the value at the specified path.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to the value.
 * @returns {number} The length of the value, or 0 if not applicable.
 */
_.getLengthByPath = (object, path) => {
  const value = _.get(object, path);
  return value && value.length ? value.length : 0;
};

/**
 * Checks if the value at the specified path is empty.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to the value.
 * @returns {boolean} True if the value is empty, false otherwise.
 */
_.isEmptyByPath = (object, path) => {
  return _.isEmpty(_.get(object, path));
};

/**
 * Trims the string at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the string.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not a string.
 */
_.trimByPath = (object, path) => {
  const value = _.get(object, path);
  if (!_.isString(value)) {
    throw new Error(`Value at path ${path} is not a string`);
  }
  return _.set(object, path, value.trim());
};

/**
 * Converts the value at the specified path to uppercase.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the string.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not a string.
 */
_.toUpperCaseByPath = (object, path) => {
  const value = _.get(object, path);
  if (!_.isString(value)) {
    throw new Error(`Value at path ${path} is not a string`);
  }
  return _.set(object, path, value.toUpperCase());
};

/**
 * Converts the value at the specified path to lowercase.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the string.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not a string.
 */
_.toLowerCaseByPath = (object, path) => {
  const value = _.get(object, path);
  if (!_.isString(value)) {
    throw new Error(`Value at path ${path} is not a string`);
  }
  return _.set(object, path, value.toLowerCase());
};

/**
 * Checks if the value at the specified path is a function.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to the value.
 * @returns {boolean} True if the value is a function, false otherwise.
 */
_.isFunctionByPath = (object, path) => {
  return _.isFunction(_.get(object, path));
};

/**
 * Checks if the value at the specified path is a Date object.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to the value.
 * @returns {boolean} True if the value is a Date object, false otherwise.
 */
_.isDateByPath = (object, path) => {
  return _.isDate(_.get(object, path));
};

/**
 * Deep clones a value at the specified path.
 * @param {Object} object - The object to clone from.
 * @param {string|string[]} path - The path to the value to clone.
 * @returns {*} The deep cloned value.
 */
_.cloneDeepByPath = (object, path) => {
  return _.cloneDeep(_.get(object, path));
};

/**
 * Compares values at two different paths for equality.
 * @param {Object} object - The object to compare in.
 * @param {string|string[]} path1 - The first path.
 * @param {string|string[]} path2 - The second path.
 * @returns {boolean} True if the values are equal, false otherwise.
 */
_.isEqualByPath = (object, path1, path2) => {
  return _.isEqual(_.get(object, path1), _.get(object, path2));
};

/**
 * Assigns default properties deeply at a specific path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to assign defaults.
 * @param {Object} defaults - The default properties to assign.
 * @returns {Object} The modified object.
 */
_.defaultsDeepByPath = (object, path, defaults) => {
  const current = _.get(object, path, {});
  const result = _.defaultsDeep({}, current, defaults);
  return _.set(object, path, result);
};

/**
 * Finds an element in an array at a specific path that satisfies a predicate.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @param {Function} predicate - The function invoked per iteration.
 * @returns {*} Returns the matched element, else undefined.
 * @throws {Error} If the path does not lead to an array.
 */
_.findByPath = (object, path, predicate) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.find(array, predicate);
};

/**
 * Finds the index of an element in an array at a specific path that satisfies a predicate.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @param {Function} predicate - The function invoked per iteration.
 * @returns {number} Returns the index of the found element, else -1.
 * @throws {Error} If the path does not lead to an array.
 */
_.findIndexByPath = (object, path, predicate) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.findIndex(array, predicate);
};

/**
 * Gets values at the specified path, supporting wildcards.
 * @param {Object} object - The object to query.
 * @param {string|string[]} path - The path to get, supporting wildcards.
 * @returns {Array} An array of values found at the paths.
 */
_.getByWildcardPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  return paths.map((p) => _.get(object, p));
};

/**
 * Sets values at the specified path, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to set, supporting wildcards.
 * @param {*} value - The value to set.
 * @returns {Object} The modified object.
 */
_.setByWildcardPath = (object, path, value) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => _.set(object, p, value));
  return object;
};

/**
 * Removes properties at the specified path, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to remove, supporting wildcards.
 * @returns {Object} The modified object.
 */
_.removeByWildcardPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => _.unset(object, p));
  return object;
};

/**
 * Increments numbers at the specified paths, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the numbers, supporting wildcards.
 * @param {number} [amount=1] - The amount to increment by.
 * @returns {Object} The modified object.
 */
_.incrementByWildcardPath = (object, path, amount = 1) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => {
    const currentValue = _.get(object, p);
    if (typeof currentValue === "number") {
      _.set(object, p, currentValue + amount);
    }
  });
  return object;
};

/**
 * Toggles boolean values at the specified paths, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the boolean values, supporting wildcards.
 * @returns {Object} The modified object.
 */
_.toggleBooleanByWildcardPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => {
    const currentValue = _.get(object, p);
    if (typeof currentValue === "boolean") {
      _.set(object, p, !currentValue);
    }
  });
  return object;
};

/**
 * Gets values at the specified path, supporting wildcards.
 * @param {Object} object - The object to query.
 * @param {string|string[]} path - The path to get, supporting wildcards.
 * @returns {Array} An array of values found at the paths.
 */
_.getByWildcardPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  return paths.map((p) => _.get(object, p));
};

/**
 * Sets values at the specified path, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to set, supporting wildcards.
 * @param {*} value - The value to set.
 * @returns {Object} The modified object.
 */
_.setByWildcardPath = (object, path, value) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => _.set(object, p, value));
  return object;
};

/**
 * Removes properties at the specified path, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to remove, supporting wildcards.
 * @returns {Object} The modified object.
 */
_.removeByWildcardPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => _.unset(object, p));
  return object;
};

/**
 * Increments numbers at the specified paths, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the numbers, supporting wildcards.
 * @param {number} [amount=1] - The amount to increment by.
 * @returns {Object} The modified object.
 */
_.incrementByWildcardPath = (object, path, amount = 1) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => {
    const currentValue = _.get(object, p);
    if (typeof currentValue === "number") {
      _.set(object, p, currentValue + amount);
    }
  });
  return object;
};

/**
 * Toggles boolean values at the specified paths, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the boolean values, supporting wildcards.
 * @returns {Object} The modified object.
 */
_.toggleBooleanByWildcardPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => {
    const currentValue = _.get(object, p);
    if (typeof currentValue === "boolean") {
      _.set(object, p, !currentValue);
    }
  });
  return object;
};

/**
 * Gets unique elements from an array at a specific path.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @returns {Array} Returns the new duplicate free array.
 * @throws {Error} If the path does not lead to an array.
 */
_.uniqueByPath = (object, path) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.uniq(array);
};

/**
 * Groups elements of an array at a specific path based on a given criteria.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @param {Function|string} iteratee - The iteratee to transform keys.
 * @returns {Object} Returns the composed aggregate object.
 * @throws {Error} If the path does not lead to an array.
 */
_.groupByPath = (object, path, iteratee) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.groupBy(array, iteratee);
};

/**
 * Sums numeric values in an array at a specific path.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @returns {number} Returns the sum.
 * @throws {Error} If the path does not lead to an array.
 */
_.sumByPath = (object, path) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.sum(array);
};

/**
 * Gets the maximum value from an array at a specific path.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @returns {*} Returns the maximum value.
 * @throws {Error} If the path does not lead to an array.
 */
_.maxByPath = (object, path) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.max(array);
};

/**
 * Gets the minimum value from an array at a specific path.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @returns {*} Returns the minimum value.
 * @throws {Error} If the path does not lead to an array.
 */
_.minByPath = (object, path) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.min(array);
};

/**
 * Creates an object from two arrays at specific paths (keys and values).
 * @param {Object} object - The object containing the arrays.
 * @param {string|string[]} keysPath - The path to the keys array.
 * @param {string|string[]} valuesPath - The path to the values array.
 * @returns {Object} Returns the new object.
 * @throws {Error} If either path does not lead to an array.
 */
_.zipObjectByPath = (object, keysPath, valuesPath) => {
  const keys = _.get(object, keysPath);
  const values = _.get(object, valuesPath);
  if (!Array.isArray(keys) || !Array.isArray(values)) {
    throw new Error("Both paths must lead to arrays");
  }
  return _.zipObject(keys, values);
};

/**
 * Gets values at the specified path, supporting wildcards.
 * @param {Object} object - The object to query.
 * @param {string|string[]} path - The path to get, supporting wildcards.
 * @returns {Array} An array of values found at the paths.
 */
_.getWildcard = (object, path, defaultValue) => {
  const paths = _.resolveWildcardPath(object, path);
  if (paths.length === 1) {
    return _.get(object, paths[0], defaultValue);
  }
  return paths.map(p => _.get(object, p, defaultValue));
};

/**
 * Sets values at the specified path, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to set, supporting wildcards.
 * @param {*} value - The value to set.
 * @returns {Object} The modified object.
 */
_.setWildcard = (object, path, value) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach(p => _.set(object, p, value));
  return object;
};

/**
 * Deep freezes an object at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the object to freeze.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not an object.
 */
_.deepFreezeByPath = (object, path) => {
  const targetObject = _.get(object, path);
  if (!_.isObject(targetObject)) {
    throw new Error(`Value at path ${path} is not an object`);
  }
  
  const deepFreeze = (obj) => {
    Object.keys(obj).forEach(prop => {
      if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) 
        deepFreeze(obj[prop]);
    });
    return Object.freeze(obj);
  };
  
  return _.set(object, path, deepFreeze(targetObject));
};

/**
 * Flattens an object at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the object to flatten.
 * @returns {Object} The modified object with the specified path flattened.
 * @throws {Error} If the value at the path is not an object.
 */
_.flattenObjectByPath = (object, path) => {
  const targetObject = _.get(object, path);
  if (!_.isObject(targetObject)) {
    throw new Error(`Value at path ${path} is not an object`);
  }
  
  const flatten = (obj, prefix = "") => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + "." : "";
      if (
        typeof obj[k] === "object" &&
        obj[k] !== null &&
        !Array.isArray(obj[k])
      ) {
        Object.assign(acc, flatten(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  };

  const flattenedObject = flatten(targetObject);
  
  // Remove the original nested object
  _.unset(object, path);

  // Set the flattened key-value pairs
  _.set(object, path, flattenedObject);

  return object;
};

/**
 * Checks if the value at the specified path is a Date object.
 * @param {Object} object - The object to check.
 * @param {string|string[]} path - The path to the value.
 * @returns {boolean} True if the value is a Date object, false otherwise.
 */
_.isDateByPath = (object, path) => {
  return _.isDate(_.get(object, path));
};

/**
 * Deep clones a value at the specified path.
 * @param {Object} object - The object to clone from.
 * @param {string|string[]} path - The path to the value to clone.
 * @returns {*} The deep cloned value.
 */
_.cloneDeepByPath = (object, path) => {
  return _.cloneDeep(_.get(object, path));
};

/**
 * Compares values at two different paths for equality.
 * @param {Object} object - The object to compare in.
 * @param {string|string[]} path1 - The first path.
 * @param {string|string[]} path2 - The second path.
 * @returns {boolean} True if the values are equal, false otherwise.
 */
_.isEqualByPath = (object, path1, path2) => {
  return _.isEqual(_.get(object, path1), _.get(object, path2));
};

/**
 * Assigns default properties deeply at a specific path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to assign defaults.
 * @param {Object} defaults - The default properties to assign.
 * @returns {Object} The modified object.
 */
_.defaultsDeepByPath = (object, path, defaults) => {
  const current = _.get(object, path, {});
  const result = _.defaultsDeep({}, current, defaults);
  return _.set(object, path, result);
};

/**
 * Finds an element in an array at a specific path that satisfies a predicate.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @param {Function} predicate - The function invoked per iteration.
 * @returns {*} Returns the matched element, else undefined.
 * @throws {Error} If the path does not lead to an array.
 */
_.findByPath = (object, path, predicate) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.find(array, predicate);
};

/**
 * Finds the index of an element in an array at a specific path that satisfies a predicate.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @param {Function} predicate - The function invoked per iteration.
 * @returns {number} Returns the index of the found element, else -1.
 * @throws {Error} If the path does not lead to an array.
 */
_.findIndexByPath = (object, path, predicate) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.findIndex(array, predicate);
};

/**
 * Gets values at the specified path, supporting wildcards.
 * @param {Object} object - The object to query.
 * @param {string|string[]} path - The path to get, supporting wildcards.
 * @returns {Array} An array of values found at the paths.
 */
_.getByWildcardPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  return paths.map((p) => _.get(object, p));
};

/**
 * Sets values at the specified path, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to set, supporting wildcards.
 * @param {*} value - The value to set.
 * @returns {Object} The modified object.
 */
_.setByWildcardPath = (object, path, value) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => _.set(object, p, value));
  return object;
};

/**
 * Removes properties at the specified path, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to remove, supporting wildcards.
 * @returns {Object} The modified object.
 */
_.removeByWildcardPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => _.unset(object, p));
  return object;
};

/**
 * Increments numbers at the specified paths, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the numbers, supporting wildcards.
 * @param {number} [amount=1] - The amount to increment by.
 * @returns {Object} The modified object.
 */
_.incrementByWildcardPath = (object, path, amount = 1) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => {
    const currentValue = _.get(object, p);
    if (typeof currentValue === "number") {
      _.set(object, p, currentValue + amount);
    }
  });
  return object;
};

/**
 * Toggles boolean values at the specified paths, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the boolean values, supporting wildcards.
 * @returns {Object} The modified object.
 */
_.toggleBooleanByWildcardPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => {
    const currentValue = _.get(object, p);
    if (typeof currentValue === "boolean") {
      _.set(object, p, !currentValue);
    }
  });
  return object;
};

/**
 * Gets values at the specified path, supporting wildcards.
 * @param {Object} object - The object to query.
 * @param {string|string[]} path - The path to get, supporting wildcards.
 * @returns {Array} An array of values found at the paths.
 */
_.getByWildcardPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  return paths.map((p) => _.get(object, p));
};

/**
 * Sets values at the specified path, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to set, supporting wildcards.
 * @param {*} value - The value to set.
 * @returns {Object} The modified object.
 */
_.setByWildcardPath = (object, path, value) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => _.set(object, p, value));
  return object;
};

/**
 * Removes properties at the specified path, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to remove, supporting wildcards.
 * @returns {Object} The modified object.
 */
_.removeByWildcardPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => _.unset(object, p));
  return object;
};

/**
 * Increments numbers at the specified paths, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the numbers, supporting wildcards.
 * @param {number} [amount=1] - The amount to increment by.
 * @returns {Object} The modified object.
 */
_.incrementByWildcardPath = (object, path, amount = 1) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => {
    const currentValue = _.get(object, p);
    if (typeof currentValue === "number") {
      _.set(object, p, currentValue + amount);
    }
  });
  return object;
};

/**
 * Toggles boolean values at the specified paths, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the boolean values, supporting wildcards.
 * @returns {Object} The modified object.
 */
_.toggleBooleanByWildcardPath = (object, path) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach((p) => {
    const currentValue = _.get(object, p);
    if (typeof currentValue === "boolean") {
      _.set(object, p, !currentValue);
    }
  });
  return object;
};

/**
 * Gets unique elements from an array at a specific path.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @returns {Array} Returns the new duplicate free array.
 * @throws {Error} If the path does not lead to an array.
 */
_.uniqueByPath = (object, path) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.uniq(array);
};

/**
 * Groups elements of an array at a specific path based on a given criteria.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @param {Function|string} iteratee - The iteratee to transform keys.
 * @returns {Object} Returns the composed aggregate object.
 * @throws {Error} If the path does not lead to an array.
 */
_.groupByPath = (object, path, iteratee) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.groupBy(array, iteratee);
};

/**
 * Sums numeric values in an array at a specific path.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @returns {number} Returns the sum.
 * @throws {Error} If the path does not lead to an array.
 */
_.sumByPath = (object, path) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.sum(array);
};

/**
 * Gets the maximum value from an array at a specific path.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @returns {*} Returns the maximum value.
 * @throws {Error} If the path does not lead to an array.
 */
_.maxByPath = (object, path) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.max(array);
};

/**
 * Gets the minimum value from an array at a specific path.
 * @param {Object} object - The object containing the array.
 * @param {string|string[]} path - The path to the array.
 * @returns {*} Returns the minimum value.
 * @throws {Error} If the path does not lead to an array.
 */
_.minByPath = (object, path) => {
  const array = _.get(object, path);
  if (!Array.isArray(array)) {
    throw new Error(`Path ${path} does not lead to an array`);
  }
  return _.min(array);
};

/**
 * Creates an object from two arrays at specific paths (keys and values).
 * @param {Object} object - The object containing the arrays.
 * @param {string|string[]} keysPath - The path to the keys array.
 * @param {string|string[]} valuesPath - The path to the values array.
 * @returns {Object} Returns the new object.
 * @throws {Error} If either path does not lead to an array.
 */
_.zipObjectByPath = (object, keysPath, valuesPath) => {
  const keys = _.get(object, keysPath);
  const values = _.get(object, valuesPath);
  if (!Array.isArray(keys) || !Array.isArray(values)) {
    throw new Error("Both paths must lead to arrays");
  }
  return _.zipObject(keys, values);
};

/**
 * Gets values at the specified path, supporting wildcards.
 * @param {Object} object - The object to query.
 * @param {string|string[]} path - The path to get, supporting wildcards.
 * @returns {Array} An array of values found at the paths.
 */
_.getWildcard = (object, path, defaultValue) => {
  const paths = _.resolveWildcardPath(object, path);
  if (paths.length === 1) {
    return _.get(object, paths[0], defaultValue);
  }
  return paths.map(p => _.get(object, p, defaultValue));
};

/**
 * Sets values at the specified path, supporting wildcards.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to set, supporting wildcards.
 * @param {*} value - The value to set.
 * @returns {Object} The modified object.
 */
_.setWildcard = (object, path, value) => {
  const paths = _.resolveWildcardPath(object, path);
  paths.forEach(p => _.set(object, p, value));
  return object;
};

/**
 * Deep freezes an object at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the object to freeze.
 * @returns {Object} The modified object.
 * @throws {Error} If the value at the path is not an object.
 */
_.deepFreezeByPath = (object, path) => {
  const targetObject = _.get(object, path);
  if (!_.isObject(targetObject)) {
    throw new Error(`Value at path ${path} is not an object`);
  }
  
  const deepFreeze = (obj) => {
    Object.keys(obj).forEach(prop => {
      if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) 
        deepFreeze(obj[prop]);
    });
    return Object.freeze(obj);
  };
  
  return _.set(object, path, deepFreeze(targetObject));
};

/**
 * Flattens an object at the specified path.
 * @param {Object} object - The object to modify.
 * @param {string|string[]} path - The path to the object to flatten.
 * @returns {Object} The modified object with the specified path flattened.
 * @throws {Error} If the value at the path is not an object.
 */
_.flattenObjectByPath = (object, path) => {
  const targetObject = _.get(object, path);
  if (!_.isObject(targetObject)) {
    throw new Error(`Value at path ${path} is not an object`);
  }
  
  const flatten = (obj, prefix = "") => {
    return Object.keys(obj).reduce((acc, k) => {
      const pre = prefix.length ? prefix + "." : "";
      if (
        typeof obj[k] === "object" &&
        obj[k] !== null &&
        !Array.isArray(obj[k])
      ) {
        Object.assign(acc, flatten(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  };

  const flattenedObject = flatten(targetObject);
  
  // Remove the original nested object
  _.unset(object, path);

  // Set the flattened key-value pairs
  _.set(object, path, flattenedObject);

  return object;
};

export default _;
