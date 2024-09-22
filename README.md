# slash-n-dash

Path based extensions for Lodash, for all that love directly manipulating objects and arrays by path. Allows doing stuff like:

```js
import _ from "slash-n-dash";

const testObject = {
  products: [
    {
      id: "1234",
      name: "Product XY"
    },
    {
      id: "1235",
      name: "Product Z"
    },
  ],
  categories: [
    {
        id: "123",
        label: "Category A"
    }
  ],
  users: [
    {
        id: "987",
        name: "John Doe"
    }
  ]
};

// Renames all name and label properties to title, except in the users array:
_.path.renameKey(testObject, "*!users[*].name|label", "title");

```

## Usage

`npm i slash-n-dash`

`import _ from "slash-n-dash";`

## Path Selectors

- `*` - Matches any number of characters in one path part
- `**` - Matches any number of characters in one or more path parts
- `*!` - Excludes the specified keys from a path part
- `|` - OR selector, matches any of the specified keys.
- `[*]` - Matches every array element
- `[0-9]` - Matches the first ten array elements
- `[!0]` - Matches all but the first array element
- `[0|1]` - Matches the first and second array elements
- `[type=reply]` - Matches all array elements where the object has a type property with the value "reply"
### Examples

- `a.*.c` - Matches a.a.c, a.b.c, a.c.c ...
- `a.**` - Matches a, a.a, a.b, a.b.a ... basically anything under a.
- `a.*!b` - Matches a.a, a.c ... anything under a that isn't a.b
- `a.b|c` - Matches a.b, a.c ... so only the path parts listed in the selector are matched

## Methods

All methods are now under the `_.path` namespace.

### Array Operations

- `_.path.push(object, path, value)`: Pushes a value to an array at the specified path.
- `_.path.pop(object, path)`: Removes and returns the last element from an array at the specified path.
- `_.path.unshift(object, path, ...values)`: Adds one or more elements to the beginning of an array at the specified path.
- `_.path.shift(object, path)`: Removes and returns the first element from an array at the specified path.
- `_.path.insertAtIndex(object, path, value, index)`: Inserts a value at a specific index in an array at the specified path.
- `_.path.removeAtIndex(object, path, index)`: Removes and returns an element at a specific index from an array at the specified path.
- `_.path.sortArray(object, path, comparator)`: Sorts an array at the specified path using a comparator function.
- `_.path.reverse(object, path)`: Reverses an array or string at the specified path.
- `_.path.unique(object, path)`: Gets unique elements from an array at a specific path.
- `_.path.find(object, path, predicate)`: Finds an element in an array at a specific path that satisfies a predicate.
- `_.path.findIndex(object, path, predicate)`: Finds the index of an element in an array at a specific path that satisfies a predicate.

### Object Operations
- `_.path.remove(object, path)`: Removes a property from an object at the specified path.
- `_.path.merge(object, path, sourceObject)`: Merges a source object into the object at the specified path.
- `_.path.renameKey(object, path, newKey)`: Renames a key in an object at the specified path.
- `_.path.filterObject(object, path, predicate)`: Filters an object at the specified path using a predicate function.
- `_.path.mapObject(object, path, mapper)`: Maps an object at the specified path using a mapper function.
- `_.path.pick(object, path, keys)`: Picks specified properties from an object at the given path.
- `_.path.omit(object, path, keys)`: Omits specified properties from an object at the given path.
- `_.path.deepFreeze(object, path)`: Deep freezes an object at the specified path.
- `_.path.toggleProperty(object, path, prop1, prop2)`: Toggles between two properties in an object at the specified path.
- `_.path.countProperties(object, path)`: Counts the number of properties in an object at the specified path.
- `_.path.flatten(object, path)`: Flattens an object at the specified path.
- `_.path.unflatten(object, path)`: Unflattens an object at the specified path.
- `_.path.sortObjectKeys(object, path, comparator)`: Sorts the keys of an object at the specified path using a comparator function.
- `_.path.sortObjectValues(object, path, comparator)`: Sorts the values of an object at the specified path using a comparator function.

### Value Operations
- `_.path.increment(object, path, amount)`: Increments a number at the specified path.
- `_.path.decrement(object, path, amount)`: Decrements a number at the specified path.
- `_.path.appendString(object, path, string)`: Appends a string to the string at the specified path.
- `_.path.toggleBoolean(object, path)`: Toggles a boolean value at the specified path.
- `_.path.setDefault(object, path, defaultValue)`: Sets a default value at the specified path if it doesn't exist.
- `_.path.swapValues(object, path1, path2)`: Swaps values between two paths in an object.
- `_.path.trim(object, path)`: Trims the string at the specified path.
- `_.path.toUpperCase(object, path)`: Converts the string at the specified path to uppercase.
- `_.path.toLowerCase(object, path)`: Converts the string at the specified path to lowercase.

### Type Checking and Conversion
- `_.path.typeOf(object, path)`: Gets the type of the value at the specified path.
- `_.path.isArray(object, path)`: Checks if the value at the specified path is an array.
- `_.path.toInt(object, path)`: Converts the value at the specified path to an integer.
- `_.path.toFloat(object, path)`: Converts the value at the specified path to a float.
- `_.path.isNumber(object, path)`: Checks if the value at the specified path is a number.
- `_.path.isString(object, path)`: Checks if the value at the specified path is a string.
- `_.path.isObject(object, path)`: Checks if the value at the specified path is an object.
- `_.path.isNil(object, path)`: Checks if the value at the specified path is null or undefined.
- `_.path.toBoolean(object, path)`: Converts the value at the specified path to a boolean.
- `_.path.isFunction(object, path)`: Checks if the value at the specified path is a function.
- `_.path.isDate(object, path)`: Checks if the value at the specified path is a Date object.

### Utility Methods
- `_.path.hasValue(object, path)`: Checks if a value exists at the specified path.
- `_.path.getLength(object, path)`: Gets the length of the value at the specified path.
- `_.path.isEmpty(object, path)`: Checks if the value at the specified path is empty.
- `_.path.cloneDeep(object, path)`: Deep clones a value at the specified path.
- `_.path.isEqual(object, path1, path2)`: Compares values at two different paths for equality.
- `_.path.defaultsDeep(object, path, defaults)`: Assigns default properties deeply at a specific path.
- `_.path.group(object, path, iteratee)`: Groups elements of an array at a specific path based on a given criteria.
- `_.path.sum(object, path)`: Sums numeric values in an array at a specific path.
- `_.path.max(object, path)`: Gets the maximum value from an array at a specific path.
- `_.path.min(object, path)`: Gets the minimum value from an array at a specific path.
- `_.path.zipObject(object, keysPath, valuesPath)`: Creates an object from two arrays at specific paths (keys and values).