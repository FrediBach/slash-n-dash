# slash-n-dash

Path based extensions for Lodash, for all that love directly manipulating objects and arrays by path. Allows doing stuff like:

## Usage

`npm i slash-n-dash`

`import _ from "slash-n-dash";`

## Path Selectors

- `*` - Matches any number of characters in one path part
- `**` - Matches any number of characters in one or more path parts
- `*!` - Excludes the specified keys from a path part
- `|` - OR selector, matches any of the specified keys.

### Examples

- `a.*.c` - Matches a.a.c, a.b.c, a.c.c ...
- `a.**` - Matches a, a.a, a.b, a.b.a ... basically anything under a.
- `a.*!b` - Matches a.a, a.c ... anything under a that isn't a.b
- `a.b|c` - Matches a.b, a.c ... so only the path parts listed in the selector are matched

## Methods

### Array Operations

- `pushToArrayByPath(object, path, value)`: Pushes a value to an array at the specified path.
- `popFromArrayByPath(object, path)`: Removes and returns the last element from an array at the specified path.
- `unshiftToArrayByPath(object, path, ...values)`: Adds one or more elements to the beginning of an array at the specified path.
- `shiftFromArrayByPath(object, path)`: Removes and returns the first element from an array at the specified path.
- `insertAtIndexByPath(object, path, value, index)`: Inserts a value at a specific index in an array at the specified path.
- `removeAtIndexByPath(object, path, index)`: Removes and returns an element at a specific index from an array at the specified path.
- `sortArrayByPath(object, path, comparator)`: Sorts an array at the specified path using a comparator function.
- `reverseByPath(object, path)`: Reverses an array or string at the specified path.
- `uniqueByPath(object, path)`: Gets unique elements from an array at a specific path.
- `findByPath(object, path, predicate)`: Finds an element in an array at a specific path that satisfies a predicate.
- `findIndexByPath(object, path, predicate)`: Finds the index of an element in an array at a specific path that satisfies a predicate.

### Object Operations
- `removeByPath(object, path)`: Removes a property from an object at the specified path.
- `mergeByPath(object, path, sourceObject)`: Merges a source object into the object at the specified path.
- `renameKeyByPath(object, path, newKey)`: Renames a key in an object at the specified path.
- `filterObjectByPath(object, path, predicate)`: Filters an object at the specified path using a predicate function.
- `mapObjectByPath(object, path, mapper)`: Maps an object at the specified path using a mapper function.
- `pickByPath(object, path, keys)`: Picks specified properties from an object at the given path.
- `omitByPath(object, path, keys)`: Omits specified properties from an object at the given path.
- `deepFreezeByPath(object, path)`: Deep freezes an object at the specified path.
- `togglePropertyByPath(object, path, prop1, prop2)`: Toggles between two properties in an object at the specified path.
- `countPropertiesByPath(object, path)`: Counts the number of properties in an object at the specified path.
- `flattenObjectByPath(object, path)`: Flattens an object at the specified path.
- `unflattenObjectByPath(object, path)`: Unflattens an object at the specified path.
- `sortObjectKeysByPath(object, path, comparator)`: Sorts the keys of an object at the specified path using a comparator function.
- `sortObjectValuesByPath(object, path, comparator)`: Sorts the values of an object at the specified path using a comparator function.

### Value Operations
- `incrementByPath(object, path, amount)`: Increments a number at the specified path.
- `decrementByPath(object, path, amount)`: Decrements a number at the specified path.
- `appendStringByPath(object, path, string)`: Appends a string to the string at the specified path.
- `toggleBooleanByPath(object, path)`: Toggles a boolean value at the specified path.
- `setDefaultByPath(object, path, defaultValue)`: Sets a default value at the specified path if it doesn't exist.
- `swapValuesByPath(object, path1, path2)`: Swaps values between two paths in an object.
- `trimByPath(object, path)`: Trims the string at the specified path.
- `toUpperCaseByPath(object, path)`: Converts the string at the specified path to uppercase.
- `toLowerCaseByPath(object, path)`: Converts the string at the specified path to lowercase.

### Type Checking and Conversion
- `typeOfByPath(object, path)`: Gets the type of the value at the specified path.
- `isArrayByPath(object, path)`: Checks if the value at the specified path is an array.
- `toIntByPath(object, path)`: Converts the value at the specified path to an integer.
- `toFloatByPath(object, path)`: Converts the value at the specified path to a float.
- `isNumberByPath(object, path)`: Checks if the value at the specified path is a number.
- `isStringByPath(object, path)`: Checks if the value at the specified path is a string.
- `isObjectByPath(object, path)`: Checks if the value at the specified path is an object.
- `isNilByPath(object, path)`: Checks if the value at the specified path is null or undefined.
- `toBooleanByPath(object, path)`: Converts the value at the specified path to a boolean.
- `isFunctionByPath(object, path)`: Checks if the value at the specified path is a function.
- `isDateByPath(object, path)`: Checks if the value at the specified path is a Date object.

### Utility Methods
- `hasPathValue(object, path)`: Checks if a value exists at the specified path.
- `getLengthByPath(object, path)`: Gets the length of the value at the specified path.
- `isEmptyByPath(object, path)`: Checks if the value at the specified path is empty.
- `cloneDeepByPath(object, path)`: Deep clones a value at the specified path.
- `isEqualByPath(object, path1, path2)`: Compares values at two different paths for equality.
- `defaultsDeepByPath(object, path, defaults)`: Assigns default properties deeply at a specific path.
- `groupByPath(object, path, iteratee)`: Groups elements of an array at a specific path based on a given criteria.
- `sumByPath(object, path)`: Sums numeric values in an array at a specific path.
- `maxByPath(object, path)`: Gets the maximum value from an array at a specific path.
- `minByPath(object, path)`: Gets the minimum value from an array at a specific path.
- `zipObjectByPath(object, keysPath, valuesPath)`: Creates an object from two arrays at specific paths (keys and values).