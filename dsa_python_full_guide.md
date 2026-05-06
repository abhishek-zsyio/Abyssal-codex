# DSA + Python: The Complete Interview-Ready Guide
### For Working Developers | JS/React Background | Beginner to Interview-Ready

---

> **A note before you begin:** This guide is written like a book, not like a cheat sheet. It is meant to be read slowly, coded along with, and revisited. Every explanation is intentional. Every analogy is chosen carefully. This is not a collection of definitions — it's a learning journey designed for someone exactly like you: experienced in JavaScript, rusty on Python, and weak on DSA. Let's fix all three.

---

# 0. How to Use This Guide

## The Right Mindset First

Most developers fail DSA preparation not because they lack intelligence, but because they approach it wrong. They read a solution, think "I understand it", close the tab, and move on. Three days later, they can't reproduce it.

**Understanding is not the same as being able to do.**

This guide is built around a simple principle: **you only truly learn DSA when you can write the code from scratch, explain it out loud, and trace it step-by-step without looking at notes.**

## How to Study Daily

You have limited time. That's okay. Consistency beats intensity every time.

**Recommended daily schedule:**

- **Day 1–7 (Python Refresh Week):** 30–45 minutes per day. Read one section of Chapter 1, then practice the exercises at the bottom of each topic without looking at the code above.
- **Day 8–14 (Complexity + Arrays):** 45–60 minutes. Study complexity, then solve the array problems. For each problem: first try it yourself for 15 minutes, then read the explanation.
- **Day 15 onward (DSA chapters):** 1 hour per day. One new topic + 1–2 LeetCode problems.

**The golden rule:** Never move on until you can write the current topic's code from a blank file.

## The 4-Step Problem Method

For every problem you encounter, follow this exactly:

**Step 1 — Understand (5 minutes):** Read the problem. Write down in plain English what the input is, what the output should be, and try 2 examples by hand on paper.

**Step 2 — Brute Force (10 minutes):** Write the dumbest, most obvious solution first. Don't optimize. Just make it work. This trains your "problem decomposition" skill.

**Step 3 — Optimize (10–15 minutes):** Ask: "What's slow about my solution? What am I computing repeatedly? What data structure could speed this up?" Then write the optimized version.

**Step 4 — Dry Run (5 minutes):** Trace through your code with a small example manually. Line by line. Don't assume it works — verify it.

## Mistakes to Avoid

**Mistake 1: Copying solutions without thinking.**
It feels productive. It isn't. Every time you copy a solution, ask: "Can I reproduce this without looking in 24 hours?" If not, you haven't learned it.

**Mistake 2: Skipping the brute force.**
Brute force teaches you to understand the problem. The optimized solution is just a refined brute force.

**Mistake 3: Practicing too many topics at once.**
Pick one topic. Master it. Move on. "I did 5 topics today" is worse than "I deeply understood 1 topic today."

**Mistake 4: Not writing code by hand.**
This is controversial but real: occasionally write code on paper or a whiteboard. Interviews often require this, and it forces you to know syntax deeply.

**Mistake 5: Ignoring time complexity.**
Every solution you write must come with a complexity analysis. This is non-negotiable in interviews.

## How to Use LeetCode Alongside This Guide

At the end of relevant chapters, there are LeetCode problem recommendations. The strategy:

- If you can solve it in under 20 minutes: good, move on.
- If you're stuck after 15 minutes: look at the hints only, not the solution.
- If you're stuck after 30 minutes: read the explanation, code it yourself from scratch, wait 2 days, try again.

---

# 1. Python Refresher (Focused for DSA)

## Why Python for DSA?

If you already know JavaScript, Python will feel clean and readable. Python is the dominant language for DSA interviews at most companies (Google, Meta, Amazon, etc.) because:

1. Less boilerplate than Java/C++
2. Built-in data structures are powerful and concise
3. The syntax reads almost like pseudocode
4. Interviewers expect Python developers to write clean, Pythonic code

The goal of this chapter is not to teach you all of Python — it's to give you exactly what you need for DSA interviews. Think of it as a targeted refresh.

---

## 1.1 Python Basics (Fast but Clear)

### Variables and Data Types

In JavaScript you write:
```javascript
let x = 10;
const name = "Alice";
var isValid = true;
```

In Python, there is no `let`, `const`, or `var`. You just write:
```python
x = 10
name = "Alice"
is_valid = True   # Note: Capital T for True/False in Python
```

Python uses **snake_case** for variable names (not camelCase like JS). This is a convention that's universally followed in the Python community. Ignore it and your code looks non-Pythonic.

**Core data types:**
```python
# Integer
age = 25

# Float
price = 19.99

# String
greeting = "Hello"

# Boolean — capital T and F
is_active = True
is_done = False

# None — Python's equivalent of null/undefined
result = None

# Check type
print(type(age))      # <class 'int'>
print(type(price))    # <class 'float'>
print(type(greeting)) # <class 'str'>
```

**Important difference from JS:** Python is dynamically typed (like JS) but much stricter about certain operations. For example:

```python
# This works in JS but FAILS in Python
x = "5" + 3  # TypeError: can only concatenate str (not "int") to str

# You must convert explicitly
x = int("5") + 3   # = 8
x = "5" + str(3)   # = "53"
```

**Type conversions you'll use constantly in DSA:**
```python
int("42")       # String to integer → 42
str(42)         # Integer to string → "42"
float("3.14")   # String to float → 3.14
list("abc")     # String to list of chars → ['a', 'b', 'c']
ord('a')        # Character to ASCII number → 97
chr(97)         # ASCII number to character → 'a'
```

The last two (`ord` and `chr`) are used constantly in string problems. For example, to find the position of a letter in the alphabet:
```python
position = ord('c') - ord('a')  # = 2 (0-indexed)
```

### Numbers and Math Operations

```python
# Basic arithmetic — same as JS
print(10 + 3)   # 13
print(10 - 3)   # 7
print(10 * 3)   # 30
print(10 / 3)   # 3.3333... (always returns float in Python 3)
print(10 // 3)  # 3  ← Integer division (floor division) — very useful in DSA
print(10 % 3)   # 1  ← Modulo (remainder)
print(2 ** 10)  # 1024 ← Exponentiation (JS uses Math.pow or **)

# Absolute value
print(abs(-5))  # 5

# Min and max
print(min(3, 7, 1))  # 1
print(max(3, 7, 1))  # 7

# Infinity — used in DSA for initial comparisons
import math
print(math.inf)   # Infinity
print(-math.inf)  # Negative infinity

# Example: finding minimum in array
min_val = math.inf
for num in [3, 1, 4, 1, 5]:
    if num < min_val:
        min_val = num
print(min_val)  # 1
```

**The `//` operator is critically important for DSA.** You use it for:
- Binary search midpoint: `mid = (left + right) // 2`
- Dividing problems in halves
- Counting items per group

### Strings

Strings in Python are **immutable** (you cannot change a character in place). This is different from arrays.

```python
s = "hello"

# Accessing characters — same as JS arrays
print(s[0])    # 'h'
print(s[-1])   # 'o'  ← Negative indexing (from the end!)
print(s[-2])   # 'l'

# Slicing — extremely powerful
print(s[1:4])  # 'ell'  (index 1 up to but NOT including 4)
print(s[:3])   # 'hel'  (from start up to index 3)
print(s[2:])   # 'llo'  (from index 2 to end)
print(s[::-1]) # 'olleh' (reverse the string!)

# Length
print(len(s))  # 5

# String methods
print("hello".upper())       # 'HELLO'
print("HELLO".lower())       # 'hello'
print("  hello  ".strip())   # 'hello' (removes whitespace)
print("hello world".split()) # ['hello', 'world']
print(",".join(["a", "b", "c"])) # 'a,b,c'
print("hello".replace("l", "r")) # 'herro'

# Check containment
print("ell" in "hello")  # True

# f-strings (modern string formatting — use this always)
name = "Alice"
age = 30
print(f"My name is {name} and I am {age} years old.")
```

**Important:** Since strings are immutable, if you need to build a string character by character, use a list and then join:
```python
# SLOW (creates new string each time):
result = ""
for char in "hello":
    result += char  # Don't do this in a loop

# FAST (build list, then join):
chars = []
for char in "hello":
    chars.append(char)
result = "".join(chars)  # 'hello'
```

This matters because string concatenation in a loop is O(n²) — it creates a new string object each time. The list approach is O(n).

### Conditionals and Loops

```python
# if/elif/else — cleaner than JS (no curly braces!)
x = 15

if x > 20:
    print("big")
elif x > 10:
    print("medium")  # This prints
else:
    print("small")

# Ternary operator (inline if)
result = "even" if x % 2 == 0 else "odd"

# Comparison operators
print(5 == 5)   # True (equality)
print(5 != 3)   # True (not equal)
print(5 > 3)    # True
print(5 >= 5)   # True
print(5 < 3)    # False
print(5 <= 5)   # True

# Logical operators — NOTE: Python uses words, not symbols
print(True and False)   # False  (not &&)
print(True or False)    # True   (not ||)
print(not True)         # False  (not !)

# IMPORTANT: Python allows chained comparisons
x = 5
print(1 < x < 10)  # True — checks both at once!
```

```python
# For loops
for i in range(5):         # 0, 1, 2, 3, 4
    print(i)

for i in range(1, 6):     # 1, 2, 3, 4, 5
    print(i)

for i in range(10, 0, -2): # 10, 8, 6, 4, 2 (countdown by 2)
    print(i)

# Iterating over a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# While loop
count = 0
while count < 5:
    print(count)
    count += 1

# Break and continue (same as JS)
for i in range(10):
    if i == 3:
        continue  # Skip 3
    if i == 7:
        break     # Stop at 7
    print(i)  # Prints: 0, 1, 2, 4, 5, 6
```

### Functions

```python
# Basic function
def greet(name):
    return f"Hello, {name}!"

print(greet("Alice"))  # Hello, Alice!

# Default parameters
def power(base, exponent=2):
    return base ** exponent

print(power(3))     # 9  (uses default exponent=2)
print(power(3, 3))  # 27 (overrides default)

# Multiple return values — this is very Pythonic
def min_max(numbers):
    return min(numbers), max(numbers)

smallest, largest = min_max([3, 1, 4, 1, 5])
print(smallest)  # 1
print(largest)   # 5

# Lambda (anonymous functions) — used with sorted(), filter(), map()
square = lambda x: x ** 2
print(square(5))  # 25

# Practical use: sorting
pairs = [(1, 'b'), (3, 'a'), (2, 'c')]
pairs.sort(key=lambda pair: pair[0])  # Sort by first element
print(pairs)  # [(1, 'b'), (2, 'c'), (3, 'a')]
```

---

### Lists (Python's Array)

A Python `list` is like a JavaScript array but with superpowers.

```python
# Creating lists
nums = [3, 1, 4, 1, 5, 9]
empty = []
mixed = [1, "hello", True, 3.14]  # Can mix types (though rarely done in DSA)

# Accessing elements
print(nums[0])   # 3 (first)
print(nums[-1])  # 9 (last)
print(nums[-2])  # 5 (second to last)

# Modifying
nums[0] = 99
print(nums)  # [99, 1, 4, 1, 5, 9]

# Adding elements
nums.append(7)       # Add to end → [99, 1, 4, 1, 5, 9, 7]
nums.insert(0, 100)  # Insert at index 0 → [100, 99, 1, 4, 1, 5, 9, 7]

# Removing elements
nums.pop()       # Remove and return last element
nums.pop(0)      # Remove and return element at index 0
nums.remove(4)   # Remove first occurrence of value 4

# Useful list functions
print(len(nums))       # Length
print(sum([1,2,3]))    # 6
print(min([3,1,2]))    # 1
print(max([3,1,2]))    # 3
print(sorted([3,1,2])) # [1, 2, 3] — creates NEW sorted list
[3,1,2].sort()         # Sorts IN PLACE (modifies original)

# Check membership
print(4 in [1, 2, 3, 4])  # True
print(5 in [1, 2, 3, 4])  # False

# Count occurrences
print([1,1,2,3,1].count(1))  # 3

# Index of element
print([10, 20, 30].index(20))  # 1
```

**Creating 2D lists (matrices) — crucial for grid problems:**
```python
# Create a 3x3 grid filled with zeros
# WRONG WAY (don't do this):
grid = [[0] * 3] * 3  # All rows are the SAME object — bug!

# RIGHT WAY:
grid = [[0] * 3 for _ in range(3)]  # Each row is independent

grid[0][0] = 1
print(grid)  # [[1, 0, 0], [0, 0, 0], [0, 0, 0]] ← Correct
```

This is a very common Python bug. Always use list comprehension for 2D arrays.

### Tuples

A tuple is like a list but **immutable** (cannot be changed). Use it when you need a fixed collection.

```python
point = (3, 5)          # x=3, y=5
rgb = (255, 128, 0)

# Access same as lists
print(point[0])  # 3
print(point[1])  # 5

# Unpacking
x, y = point
print(x)  # 3
print(y)  # 5

# Tuples as dictionary keys (lists can't be dict keys!)
visited = {(0, 0): True, (1, 2): True}

# Named tuple (nice for readability)
from collections import namedtuple
Point = namedtuple('Point', ['x', 'y'])
p = Point(3, 5)
print(p.x)  # 3
print(p.y)  # 5
```

In DSA, tuples are used heavily for:
- Storing coordinates `(row, col)` in grid problems
- Returning multiple values from functions
- As keys in dictionaries (since tuples are hashable)

### Dictionaries (Hash Maps)

Dictionaries are hash maps. They are one of the most important data structures for DSA. In Python, they are incredibly fast and easy to use.

```python
# Creating dictionaries
person = {"name": "Alice", "age": 30, "city": "NYC"}
empty = {}
empty = dict()

# Accessing values
print(person["name"])        # "Alice"
print(person.get("age"))     # 30
print(person.get("phone"))   # None (safe — doesn't raise error)
print(person.get("phone", "N/A"))  # "N/A" (default value)

# Adding and updating
person["email"] = "alice@email.com"  # Add new key
person["age"] = 31                   # Update existing key

# Removing
del person["city"]              # Delete key (raises error if not found)
person.pop("city", None)        # Safe delete (no error if missing)

# Checking keys
print("name" in person)    # True
print("phone" in person)   # False

# Iterating
for key in person:
    print(key)

for key, value in person.items():
    print(f"{key}: {value}")

for value in person.values():
    print(value)

# Length
print(len(person))  # Number of key-value pairs
```

**The most common pattern in DSA — frequency counting:**
```python
# Count character frequency
word = "hello"
freq = {}
for char in word:
    freq[char] = freq.get(char, 0) + 1
print(freq)  # {'h': 1, 'e': 1, 'l': 2, 'o': 1}

# Pythonic way — using defaultdict
from collections import defaultdict
freq = defaultdict(int)
for char in word:
    freq[char] += 1  # No KeyError if key doesn't exist!
```

### Sets

A set is an unordered collection of **unique** elements. Think of it like a dictionary with only keys, no values.

```python
# Creating sets
unique = {1, 2, 3, 4, 5}
empty_set = set()           # NOT {} — that creates an empty dict!

# Add and remove
unique.add(6)
unique.remove(1)       # Raises error if not found
unique.discard(99)     # Safe — no error if not found

# Membership check — O(1) time!
print(3 in unique)  # True
print(99 in unique) # False

# Set operations
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a | b)    # {1, 2, 3, 4, 5, 6} — Union
print(a & b)    # {3, 4}             — Intersection
print(a - b)    # {1, 2}             — Difference (in a but not b)
print(a ^ b)    # {1, 2, 5, 6}       — Symmetric difference

# Convert list to set to remove duplicates
nums = [1, 2, 2, 3, 3, 3, 4]
unique_nums = list(set(nums))  # [1, 2, 3, 4] (order may vary)
```

**When to use sets in DSA:**
- Check if an element has been visited: `visited = set(); visited.add((row, col))`
- Find duplicate elements
- Check if two arrays have common elements
- Store values where order doesn't matter and uniqueness does

---

### Small Exercises — Section 1.1

Try these without looking back at the material:

1. Write a function that takes a string and returns the number of vowels in it.
2. Write a function that takes a list of numbers and returns a new list with duplicates removed, preserving order.
3. Write a function that takes two lists and returns True if they share any common elements.
4. Write a function that counts how many times each word appears in a sentence (return a dictionary).

**Solutions:**
```python
# 1. Count vowels
def count_vowels(s):
    vowels = set("aeiouAEIOU")
    return sum(1 for char in s if char in vowels)

# 2. Remove duplicates preserving order
def unique_preserve_order(nums):
    seen = set()
    result = []
    for num in nums:
        if num not in seen:
            seen.add(num)
            result.append(num)
    return result

# 3. Common elements
def has_common(a, b):
    return len(set(a) & set(b)) > 0
    # or: return bool(set(a) & set(b))

# 4. Word count
def word_count(sentence):
    freq = {}
    for word in sentence.split():
        freq[word] = freq.get(word, 0) + 1
    return freq
```

---

## 1.2 Python for DSA (Very Important)

This section covers the Python features that appear in almost every single DSA problem. Learn these cold.

### List Slicing — The Superpower

Slicing creates a **new** sub-list (or substring) from an existing one.

```
original[start : end : step]
```

- `start`: Where to begin (inclusive, default 0)
- `end`: Where to stop (exclusive, default len)
- `step`: How many to skip (default 1)

```python
arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

# Basic slicing
print(arr[2:5])    # [2, 3, 4]
print(arr[:4])     # [0, 1, 2, 3]
print(arr[6:])     # [6, 7, 8, 9]
print(arr[:])      # [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] (full copy)

# Step
print(arr[::2])    # [0, 2, 4, 6, 8] (every other)
print(arr[1::2])   # [1, 3, 5, 7, 9]
print(arr[::-1])   # [9, 8, 7, 6, 5, 4, 3, 2, 1, 0] (reversed!)

# Negative indices
print(arr[-3:])    # [7, 8, 9] (last 3)
print(arr[:-3])    # [0, 1, 2, 3, 4, 5, 6] (everything except last 3)
```

**Slicing in DSA context:**
```python
# Check if first half equals reverse of second half (palindrome check concept)
s = "racecar"
mid = len(s) // 2
print(s[:mid])          # 'rac'
print(s[mid + len(s) % 2:]) # 'car' (handles odd length)

# Reverse a string
print(s[::-1])  # 'racecar' — same (it's a palindrome)

# Split array into two halves for merge sort
arr = [3, 1, 4, 1, 5, 9]
left = arr[:len(arr)//2]   # [3, 1, 4]
right = arr[len(arr)//2:]  # [1, 5, 9]
```

### List Comprehensions

List comprehension is one of Python's most powerful features. It lets you create lists in a clean, readable one-liner.

**Basic syntax:** `[expression for item in iterable if condition]`

```python
# Traditional loop approach
squares = []
for i in range(10):
    squares.append(i ** 2)

# List comprehension — same result, cleaner
squares = [i ** 2 for i in range(10)]
print(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

# With condition (filter)
even_squares = [i ** 2 for i in range(10) if i % 2 == 0]
print(even_squares)  # [0, 4, 16, 36, 64]

# Nested — creating 2D grid
matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]
# [[1, 2, 3], [2, 4, 6], [3, 6, 9]]

# Transform list of strings
words = ["hello", "world", "python"]
upper_words = [w.upper() for w in words]  # ['HELLO', 'WORLD', 'PYTHON']

# Extract characters meeting a condition
s = "Hello World 123"
only_letters = [c for c in s if c.isalpha()]  # ['H','e','l','l','o','W','o','r','l','d']
```

**Dictionary comprehension** (similar concept):
```python
# Create a dictionary mapping number to its square
squares = {i: i**2 for i in range(5)}  # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# Invert a dictionary
original = {'a': 1, 'b': 2, 'c': 3}
inverted = {v: k for k, v in original.items()}  # {1: 'a', 2: 'b', 3: 'c'}
```

**Set comprehension:**
```python
unique_lengths = {len(word) for word in ["cat", "dog", "elephant", "ox"]}
# {2, 3, 8}
```

### enumerate() — Index + Value Together

In JavaScript you write:
```javascript
for (let i = 0; i < arr.length; i++) {
    console.log(i, arr[i]);
}
```

In Python, use `enumerate`:
```python
fruits = ["apple", "banana", "cherry"]

for i, fruit in enumerate(fruits):
    print(f"Index {i}: {fruit}")
# Index 0: apple
# Index 1: banana
# Index 2: cherry

# Start from a different index
for i, fruit in enumerate(fruits, start=1):
    print(f"{i}. {fruit}")
# 1. apple
# 2. banana
# 3. cherry
```

**In DSA, you'll use this constantly:**
```python
# Find index of maximum element
nums = [3, 7, 1, 9, 4]
max_idx = 0
for i, num in enumerate(nums):
    if num > nums[max_idx]:
        max_idx = i
print(max_idx)  # 3 (index of 9)
```

### zip() — Combine Multiple Iterables

`zip` pairs up elements from multiple lists:

```python
names = ["Alice", "Bob", "Charlie"]
scores = [95, 87, 92]

for name, score in zip(names, scores):
    print(f"{name}: {score}")
# Alice: 95
# Bob: 87
# Charlie: 92

# Create a dictionary from two lists
name_score = dict(zip(names, scores))
# {'Alice': 95, 'Bob': 87, 'Charlie': 92}

# Zip two lists together
pairs = list(zip(names, scores))
# [('Alice', 95), ('Bob', 87), ('Charlie', 92)]
```

**In DSA — comparing two strings:**
```python
def is_anagram_naive(s, t):
    # Compare character by character
    if len(s) != len(t):
        return False
    for c1, c2 in zip(sorted(s), sorted(t)):
        if c1 != c2:
            return False
    return True
```

### sorted() and sort() — Deep Understanding

```python
nums = [3, 1, 4, 1, 5, 9, 2, 6]

# sorted() — returns NEW list, original unchanged
new = sorted(nums)          # [1, 1, 2, 3, 4, 5, 6, 9]
reversed_sorted = sorted(nums, reverse=True)  # [9, 6, 5, 4, 3, 2, 1, 1]

# sort() — sorts IN PLACE, returns None
nums.sort()
nums.sort(reverse=True)

# Custom sorting with key parameter — THIS IS CRUCIAL
words = ["banana", "pie", "apple", "cherry"]
words.sort(key=len)  # Sort by string length
print(words)  # ['pie', 'apple', 'banana', 'cherry']

# Sort by multiple criteria (tuples)
students = [("Alice", 90), ("Bob", 85), ("Charlie", 90), ("Dave", 85)]
students.sort(key=lambda x: (-x[1], x[0]))  # Sort by score desc, then name asc
# [('Alice', 90), ('Charlie', 90), ('Bob', 85), ('Dave', 85)]
```

**Interview tip:** When asked to sort with custom logic, always use `key=`. For complex comparisons, use `functools.cmp_to_key` (rare but good to know).

### collections.Counter

`Counter` is a dictionary subclass for counting hashable objects. It is used so frequently in DSA that you need it memorized.

```python
from collections import Counter

# Count characters in a string
s = "hello world"
char_count = Counter(s)
print(char_count)
# Counter({'l': 3, 'o': 2, 'h': 1, 'e': 1, ' ': 1, 'w': 1, 'r': 1, 'd': 1})

# Count elements in a list
nums = [1, 2, 3, 1, 2, 1, 4]
num_count = Counter(nums)
print(num_count)  # Counter({1: 3, 2: 2, 3: 1, 4: 1})

# Most common elements
print(num_count.most_common(2))  # [(1, 3), (2, 2)] — top 2 most common

# Access like a dictionary
print(num_count[1])   # 3
print(num_count[99])  # 0 — doesn't raise KeyError! Returns 0 for missing keys

# Arithmetic operations on counters
c1 = Counter("aab")
c2 = Counter("abc")
print(c1 + c2)  # Counter({'a': 3, 'b': 2, 'c': 1})
print(c1 - c2)  # Counter({'a': 1}) — subtracts, keeps only positive counts

# Common DSA pattern: check if t is an anagram of s
def is_anagram(s, t):
    return Counter(s) == Counter(t)
```

### collections.deque — Efficient Double-Ended Queue

A `deque` (pronounced "deck") is like a list but optimized for adding/removing from BOTH ends in O(1) time. Regular Python lists have O(n) for operations at the front.

```python
from collections import deque

# Create
q = deque()
q = deque([1, 2, 3])  # Deque from list

# Add to both ends
q.append(4)       # Add to right: deque([1, 2, 3, 4])
q.appendleft(0)   # Add to left:  deque([0, 1, 2, 3, 4])

# Remove from both ends
q.pop()           # Remove from right → returns 4
q.popleft()       # Remove from left  → returns 0

# Access
print(q[0])   # Leftmost element
print(q[-1])  # Rightmost element
print(len(q)) # Number of elements

# Use as a queue (FIFO — First In, First Out)
queue = deque()
queue.append("first")
queue.append("second")
queue.append("third")
print(queue.popleft())  # "first"  ← FIFO behavior

# Use as a stack (LIFO — Last In, First Out)
stack = deque()
stack.append("first")
stack.append("second")
stack.append("third")
print(stack.pop())  # "third" ← LIFO behavior

# Rotate
d = deque([1, 2, 3, 4, 5])
d.rotate(2)   # Rotate right by 2: deque([4, 5, 1, 2, 3])
d.rotate(-2)  # Rotate left by 2: deque([1, 2, 3, 4, 5]) (back to original)
```

**Why deque over list for queue operations?**

Imagine a list of 1 million items. When you do `list.pop(0)` (remove from front), Python has to shift ALL remaining elements one position to the left — that's O(n). With `deque.popleft()`, it's O(1). For BFS (Breadth-First Search), this difference can be the difference between passing and TLE (Time Limit Exceeded) on LeetCode.

### heapq — Priority Queue (Min-Heap)

A heap is a special tree-based data structure that always gives you the minimum (or maximum) element in O(log n) time. Python's `heapq` module implements a min-heap.

```python
import heapq

nums = [3, 1, 4, 1, 5, 9, 2, 6]

# Convert list to heap (min-heap) — modifies in place
heapq.heapify(nums)
print(nums)  # [1, 1, 2, 6, 5, 9, 4, 3] (heap order — not sorted, but heap valid)

# Get smallest element
print(nums[0])  # 1 — smallest is always at index 0

# Add element
heapq.heappush(nums, 0)

# Remove and return smallest element
smallest = heapq.heappop(nums)  # Returns 0

# Useful shortcut: n smallest/largest elements
data = [5, 3, 8, 1, 9, 2, 7]
print(heapq.nsmallest(3, data))  # [1, 2, 3]
print(heapq.nlargest(3, data))   # [9, 8, 7]

# MAX HEAP: Python only has min-heap
# Trick: negate all values to simulate max-heap
max_heap = []
for num in [3, 1, 4, 1, 5]:
    heapq.heappush(max_heap, -num)  # Store negated values

largest = -heapq.heappop(max_heap)  # Negate back when retrieving
print(largest)  # 5
```

---

## 1.3 Writing Clean Python

### The Most Common Patterns in DSA

**Pattern 1: Two Pointers**
```python
def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True
```

**Pattern 2: Sliding Window**
```python
def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]  # Slide window
        max_sum = max(max_sum, window_sum)
    return max_sum
```

**Pattern 3: Frequency Map**
```python
def find_duplicates(nums):
    freq = {}
    result = []
    for num in nums:
        freq[num] = freq.get(num, 0) + 1
        if freq[num] == 2:  # First time we see it twice
            result.append(num)
    return result
```

**Pattern 4: Early Return**
```python
# Instead of complex nested if-else:
def process(x):
    if x < 0:
        return "negative"
    if x == 0:
        return "zero"
    if x > 100:
        return "too large"
    return "valid"
```

### Beginner Mistakes to Avoid

**Mistake 1: Modifying a list while iterating over it**
```python
# WRONG:
nums = [1, 2, 3, 4, 5]
for num in nums:
    if num % 2 == 0:
        nums.remove(num)  # BUG! Skips elements

# RIGHT:
nums = [num for num in nums if num % 2 != 0]
# or
nums = [1, 2, 3, 4, 5]
to_remove = set()
for num in nums:
    if num % 2 == 0:
        to_remove.add(num)
nums = [n for n in nums if n not in to_remove]
```

**Mistake 2: Using `is` instead of `==`**
```python
# is checks identity (same object in memory)
# == checks equality (same value)
a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)   # True  ← use this
print(a is b)   # False ← they're different objects

# Exception: use `is` for None
if result is None:  # Correct
    pass
if result == None:  # Works but not Pythonic
    pass
```

**Mistake 3: Mutable default arguments**
```python
# WRONG — the list is shared across all calls:
def add_item(item, my_list=[]):
    my_list.append(item)
    return my_list

print(add_item(1))  # [1]
print(add_item(2))  # [1, 2] — BUG! Should be [2]

# RIGHT:
def add_item(item, my_list=None):
    if my_list is None:
        my_list = []
    my_list.append(item)
    return my_list
```

**Mistake 4: Not using `get()` for dictionaries**
```python
# WRONG — will raise KeyError if key doesn't exist:
d = {"a": 1}
val = d["b"]  # KeyError!

# RIGHT:
val = d.get("b")        # Returns None
val = d.get("b", 0)     # Returns 0 (default)
```

**Mistake 5: Forgetting that list assignment is by reference**
```python
a = [1, 2, 3]
b = a          # b is NOT a copy — it points to same list!
b.append(4)
print(a)       # [1, 2, 3, 4] — a was also modified!

# To copy:
b = a[:]           # Shallow copy using slicing
b = a.copy()       # Shallow copy using method
b = list(a)        # Another way
import copy
b = copy.deepcopy(a)  # Deep copy (for nested lists)
```

---

# 2. Complexity (Core Thinking Skill)

## Why This Chapter Matters More Than Any Other

You can know every algorithm in the book, but if you can't analyze complexity, you can't compare solutions or justify your choices in an interview. Every interviewer expects you to answer: "What's the time and space complexity of your solution?"

The good news: complexity analysis is a learnable skill, not a talent. By the end of this chapter, you'll have a mental model that lets you analyze any code quickly.

## The Core Idea: How Does Running Time Grow?

Imagine you're sorting a deck of cards. With 10 cards, it takes 10 seconds. With 100 cards, how long does it take?

- If you use insertion sort: it might take 100 seconds (linear... wait, no — let's think)
- Actually with insertion sort: 10² = 100 times slower → 1000 seconds
- With merge sort: only ~7x slower (100 × log₂(100) / 10 × log₂(10))

This is what Big-O notation measures: **how the running time (or memory) scales as the input size grows.**

We don't care about exact seconds. We care about the *shape* of growth.

## Big-O Notation

Big-O describes the **worst case** performance of an algorithm as a function of input size `n`.

The rules:
1. Drop constants: O(2n) → O(n)
2. Drop lower-order terms: O(n² + n) → O(n²)
3. We care about the dominant term as n → infinity

**The complexity hierarchy (from fast to slow):**

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Array access by index |
| O(log n) | Logarithmic | Binary search |
| O(n) | Linear | Single loop through array |
| O(n log n) | Log-linear | Merge sort, Heap sort |
| O(n²) | Quadratic | Nested loops |
| O(2ⁿ) | Exponential | Recursive fibonacci |
| O(n!) | Factorial | Generating all permutations |

**Intuition for each:**

- **O(1):** Doesn't matter how big n is, it takes the same time. Looking up a name in a phone book if you know the page number.
- **O(log n):** Every step cuts the problem in half. Like finding a name in a phone book by opening to the middle each time.
- **O(n):** You visit each element once. Reading every page in a book.
- **O(n log n):** Sort-of like sorting by splitting and merging. Efficient.
- **O(n²):** Every element compared to every other element. Slow for large inputs.
- **O(2ⁿ):** Doubles with each additional element. Impossible for n > 30.

## How to Analyze Code: Step-by-Step

### Rule 1: Sequence = Add complexities

```python
# Block 1: O(n)
for i in range(n):
    print(i)

# Block 2: O(n²)
for i in range(n):
    for j in range(n):
        print(i, j)

# Total: O(n) + O(n²) = O(n²)  ← Keep the dominant term
```

### Rule 2: Nested Loops = Multiply

```python
# O(n) × O(n) = O(n²)
for i in range(n):      # n iterations
    for j in range(n):  # n iterations for EACH outer iteration
        print(i, j)     # Runs n × n = n² times total
```

```python
# O(n) × O(m) = O(n×m) — different loop bounds
for i in range(n):
    for j in range(m):
        print(i, j)
```

### Rule 3: Conditional = Max of branches

```python
if condition:
    # O(n) work
    for i in range(n):
        print(i)
else:
    # O(n²) work
    for i in range(n):
        for j in range(n):
            print(i, j)

# Complexity: O(n²) — take the worst case
```

### Rule 4: Recognize Logarithmic Patterns

If you're halving the input at each step, it's O(log n):

```python
# Binary search — O(log n)
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1   # Cut right half
        else:
            right = mid - 1  # Cut left half
    return -1
```

Why O(log n)? Start with n elements. After 1 step: n/2. After 2 steps: n/4. After k steps: n/2^k. We stop when n/2^k = 1, so k = log₂(n).

### Examples with Full Analysis

**Example 1:**
```python
def example_one(nums):
    result = 0                  # O(1)
    for num in nums:            # O(n) — runs n times
        result += num           # O(1) per iteration
    return result               # O(1)

# Total: O(1) + O(n) × O(1) + O(1) = O(n)
```

**Example 2:**
```python
def example_two(nums):
    for i in range(len(nums)):           # O(n)
        for j in range(i + 1, len(nums)): # O(n) worst case (inner varies, avg n/2)
            if nums[i] + nums[j] == 0:
                return True
    return False

# Total: O(n²) — classic two-nested-loops pattern
```

**Example 3:**
```python
def example_three(n):
    i = 1
    while i < n:   # How many times does this run?
        print(i)
        i *= 2     # i doubles each time: 1, 2, 4, 8, 16...

# i goes: 1, 2, 4, 8, ..., n
# Number of steps = log₂(n)
# Total: O(log n)
```

**Example 4: Recursive Fibonacci (don't use this in production!)**
```python
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

# Each call spawns 2 more calls
# Tree of calls: 2^n nodes
# Total: O(2ⁿ) — exponential!
```

Drawing the call tree for fib(5):
```
                fib(5)
              /        \
          fib(4)       fib(3)
          /    \       /    \
       fib(3) fib(2) fib(2) fib(1)
       / \    / \    / \
    f(2) f(1) f(1)f(0) f(1)f(0)
    / \
 f(1) f(0)
```
Notice how `fib(3)` is computed twice, `fib(2)` three times! This redundancy is exactly what makes it exponential.

## Space Complexity

Space complexity measures how much **extra memory** your algorithm uses (not counting the input itself).

```python
# O(1) space — fixed number of variables regardless of input
def sum_array(nums):
    total = 0        # Single variable
    for num in nums:
        total += num
    return total

# O(n) space — creates a result array of size n
def double_all(nums):
    result = []      # Grows with input size
    for num in nums:
        result.append(num * 2)
    return result

# O(n) space — recursion uses call stack
def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)  # n frames on the call stack

# O(n²) space — 2D grid
def create_grid(n):
    return [[0] * n for _ in range(n)]  # n × n cells
```

## Quick Complexity Reference for Common Operations

```
Python List:
  - Access by index: O(1)
  - Append to end: O(1) amortized
  - Insert at beginning: O(n)
  - Remove from beginning: O(n)
  - Search (in operator): O(n)
  - Sort: O(n log n)

Python Dictionary:
  - Get/Set/Delete by key: O(1) average
  - Search: O(1) average

Python Set:
  - Add/Remove/Lookup: O(1) average

deque:
  - appendleft/popleft: O(1)
  - append/pop: O(1)

Heap (heapq):
  - heappush: O(log n)
  - heappop: O(log n)
  - heapify: O(n)
```

---

# 3. Arrays & Hashing

## The Mental Model

Arrays are the foundation of almost all DSA problems. Even when you're working with linked lists, trees, or graphs, your solutions often involve array manipulation underneath.

The key insight: **most array problems want you to go from O(n²) to O(n) by trading space for time using a hash map (dictionary).**

This trade-off appears over and over. The moment you see "find two elements that..." or "check if exists...", reach for a dictionary.

## Core Concepts

### Arrays in Memory

Think of an array as a row of numbered mailboxes. Box 0, Box 1, Box 2... Each box holds one value. Because boxes are numbered consecutively, you can jump to any box in O(1) time — that's why array access is so fast.

The downside: inserting or deleting in the middle requires shifting all subsequent elements.

### Hash Maps (Dictionaries) — The Magic Tool

A hash map stores key-value pairs where looking up by key is O(1). Internally, Python converts your key to a number using a "hash function" and uses that as an index in an internal array. This is why dictionary lookups are so fast.

**The Trade-off Principle:**
> If an O(n²) solution exists (usually two nested loops), there's often an O(n) solution using a hash map to cache seen values.

---

## Pattern 1: Two Sum

### Problem Statement
Given an array of integers `nums` and a target, return the indices of two numbers that add up to the target.

**Input:** `nums = [2, 7, 11, 15], target = 9`  
**Output:** `[0, 1]` (because nums[0] + nums[1] = 2 + 7 = 9)

### Brute Force Solution — O(n²)

The obvious approach: try every pair.

```python
def two_sum_brute(nums, target):
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):     # j starts from i+1 to avoid using same element
            if nums[i] + nums[j] == target:
                return [i, j]
    return []  # No solution found
```

**Dry Run with `nums = [2, 7, 11, 15], target = 9`:**
```
i=0, j=1: 2 + 7 = 9 ✓ → return [0, 1]
```

**Why it's O(n²):** Two nested loops. For n=10,000 elements, we do ~50 million comparisons.

### Optimized Solution — O(n)

The insight: for each element `x`, we need to find if `target - x` exists in the array.

Instead of searching every time (O(n) each search = O(n²) total), we store seen values in a dictionary for O(1) lookup.

```python
def two_sum(nums, target):
    seen = {}  # Maps value → index
    
    for i, num in enumerate(nums):
        complement = target - num  # What we're looking for
        
        if complement in seen:  # O(1) lookup
            return [seen[complement], i]
        
        seen[num] = i  # Store current element for future lookups
    
    return []
```

**Dry Run with `nums = [2, 7, 11, 15], target = 9`:**
```
i=0, num=2:  complement = 9-2 = 7,  is 7 in seen? seen={},       No  → seen = {2:0}
i=1, num=7:  complement = 9-7 = 2,  is 2 in seen? seen={2:0},    YES → return [seen[2], 1] = [0, 1]
```

**Why it's O(n):** Single loop + O(1) dictionary operations = O(n) total.

**Space complexity:** O(n) — we store at most n elements in `seen`.

**Interview tip:** Always explain the brute force first, then say "We can optimize this by observing that..." It shows you understand the problem at multiple levels.

**Common mistake:** Adding the current element to `seen` BEFORE checking for complement. This would incorrectly allow using the same element twice.

---

## Pattern 2: Prefix Sum

### Concept

A prefix sum array is a preprocessing technique where `prefix[i]` stores the sum of all elements from index 0 to i.

```
arr    = [3, 1, 4, 1, 5, 9]
prefix = [3, 4, 8, 9, 14, 23]
```

**Key formula:**
- `prefix[i] = prefix[i-1] + arr[i]`
- Sum of subarray `[l, r]` = `prefix[r] - prefix[l-1]`

### Why It Matters

Without prefix sum, computing the sum of a subarray takes O(n) each time.
With prefix sum, we precompute O(n) once, and then each query is O(1).

### Example Problem: Range Sum Query

**Problem:** Given an array, answer multiple queries: "What is the sum of elements from index l to r?"

```python
def range_sum(nums, queries):
    n = len(nums)
    prefix = [0] * (n + 1)  # Extra 0 at start makes formula cleaner
    
    # Build prefix sum
    for i in range(n):
        prefix[i + 1] = prefix[i] + nums[i]
    
    # Answer queries in O(1)
    results = []
    for l, r in queries:
        # Sum from l to r inclusive
        range_total = prefix[r + 1] - prefix[l]
        results.append(range_total)
    
    return results

# Example
nums = [3, 1, 4, 1, 5, 9]
queries = [(1, 3), (0, 5), (2, 4)]
print(range_sum(nums, queries))  # [6, 23, 10]
```

**Dry Run:**
```
nums    = [3, 1, 4, 1, 5, 9]
prefix  = [0, 3, 4, 8, 9, 14, 23]
          (indices: 0  1  2  3  4   5   6)

Query (1, 3): prefix[4] - prefix[1] = 9 - 3 = 6  ✓ (1+4+1=6)
Query (0, 5): prefix[6] - prefix[0] = 23 - 0 = 23 ✓
Query (2, 4): prefix[5] - prefix[2] = 14 - 4 = 10 ✓ (4+1+5=10)
```

---

## Pattern 3: Sliding Window

### Concept

The sliding window technique converts an O(n²) "try all subarrays" approach into O(n) by maintaining a window that slides across the array, updating the result as it goes rather than recomputing from scratch.

**Analogy:** Imagine looking through a physical window at a long street. As the window slides, you don't re-examine the entire street — you just observe what enters and exits the window.

**Two types:**
1. **Fixed-size window:** Window size is given (e.g., "subarray of length k")
2. **Variable-size window:** Window size changes based on conditions

### Fixed Window: Maximum Sum Subarray of Size K

```python
def max_sum_k(nums, k):
    # Build initial window
    window_sum = sum(nums[:k])
    max_sum = window_sum
    
    # Slide the window
    for i in range(k, len(nums)):
        # Add new element on right, remove old element on left
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    
    return max_sum
```

**Dry Run with `nums = [2, 1, 5, 1, 3, 2], k = 3`:**
```
Initial window: [2, 1, 5] → sum = 8, max = 8

i=3: Add nums[3]=1, Remove nums[0]=2 → sum = 8 + 1 - 2 = 7, max = max(8,7) = 8
     Window is now: [1, 5, 1]

i=4: Add nums[4]=3, Remove nums[1]=1 → sum = 7 + 3 - 1 = 9, max = max(8,9) = 9
     Window is now: [5, 1, 3]

i=5: Add nums[5]=2, Remove nums[2]=5 → sum = 9 + 2 - 5 = 6, max = max(9,6) = 9
     Window is now: [1, 3, 2]

Result: 9
```

### Variable Window: Longest Substring Without Repeating Characters

```python
def length_of_longest_substring(s):
    char_index = {}  # Maps character → last seen index
    max_length = 0
    left = 0  # Left boundary of window
    
    for right in range(len(s)):
        char = s[right]
        
        # If character is already in window, shrink from left
        if char in char_index and char_index[char] >= left:
            left = char_index[char] + 1  # Move left past the duplicate
        
        # Update character's last seen position
        char_index[char] = right
        
        # Update max length
        max_length = max(max_length, right - left + 1)
    
    return max_length
```

**Dry Run with `s = "abcabcbb"`:**
```
left=0, char_index={}

right=0, char='a': not in window → char_index={a:0}, max=1, window=[a]
right=1, char='b': not in window → char_index={a:0,b:1}, max=2, window=[ab]
right=2, char='c': not in window → char_index={a:0,b:1,c:2}, max=3, window=[abc]
right=3, char='a': in window! (char_index[a]=0 >= left=0) → left=1
                    char_index={a:3,b:1,c:2}, max=3, window=[bca]
right=4, char='b': in window! (char_index[b]=1 >= left=1) → left=2
                    char_index={a:3,b:4,c:2}, max=3, window=[cab]
right=5, char='c': in window! (char_index[c]=2 >= left=2) → left=3
                    char_index={a:3,b:4,c:5}, max=3, window=[abc]
right=6, char='b': in window! (char_index[b]=4 >= left=3) → left=5
                    char_index={a:3,b:6,c:5}, max=3, window=[cb]
right=7, char='b': in window! (char_index[b]=6 >= left=5) → left=7
                    char_index={a:3,b:7,c:5}, max=3, window=[b]

Result: 3 ✓
```

**Interview tip:** Sliding window pattern is triggered when you see phrases like "maximum/minimum subarray/substring" or "subarray satisfying some condition". It almost always converts O(n²) brute force to O(n).

---

# 4. Linked Lists

## Structure and Memory Model

A linked list is a collection of nodes where each node stores:
1. A value (data)
2. A pointer to the next node

Unlike an array (which is a contiguous block of memory), linked list nodes can be anywhere in memory — they're connected only by pointers.

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
```

**Visualizing a linked list:**
```
[3] → [7] → [1] → [9] → None
 ↑
head
```

In Python, you build it like this:
```python
# Building: 3 → 7 → 1 → 9
head = ListNode(3)
head.next = ListNode(7)
head.next.next = ListNode(1)
head.next.next.next = ListNode(9)
```

### Traversing a Linked List

```python
def traverse(head):
    current = head
    while current is not None:
        print(current.val)
        current = current.next
```

**Mental model:** Think of it like a treasure hunt. Each clue (node) tells you where the next clue is. You follow the trail until there is no "next" clue (None).

---

## Problem 1: Reverse a Linked List

### Problem Statement
Reverse `1 → 2 → 3 → 4 → 5` to get `5 → 4 → 3 → 2 → 1`.

### The Key Insight

You need to reverse the direction of each pointer. The challenge is that when you change `current.next`, you lose track of the next node — so you must save it first.

You need three pointers: `prev`, `current`, and `next`.

```python
def reverse_list(head):
    prev = None
    current = head
    
    while current is not None:
        next_node = current.next   # Save next before breaking the link
        current.next = prev        # Reverse the pointer
        prev = current             # Move prev forward
        current = next_node        # Move current forward
    
    return prev  # prev is now the new head
```

**Dry Run with `1 → 2 → 3 → None`:**
```
Initial: prev=None, current=1

Step 1:
  next_node = 2
  current.next = None    (1 → None)
  prev = 1
  current = 2
  State: None ← 1   2 → 3 → None

Step 2:
  next_node = 3
  current.next = 1   (2 → 1)
  prev = 2
  current = 3
  State: None ← 1 ← 2   3 → None

Step 3:
  next_node = None
  current.next = 2   (3 → 2)
  prev = 3
  current = None
  State: None ← 1 ← 2 ← 3

Loop ends (current is None)
Return prev = 3  (which is: 3 → 2 → 1 → None)
```

**Recursive version (shows the elegance of recursion):**
```python
def reverse_list_recursive(head):
    # Base case: empty list or single node
    if head is None or head.next is None:
        return head
    
    # Recursively reverse the rest
    new_head = reverse_list_recursive(head.next)
    
    # Reverse the current link
    head.next.next = head  # The node after us should point back to us
    head.next = None       # We now point to None (we're the new tail)
    
    return new_head
```

---

## Problem 2: Detect a Cycle (Floyd's Algorithm)

### Problem Statement
Given a linked list, determine if it contains a cycle (where a node points back to an earlier node).

### Brute Force: Hash Set — O(n) time, O(n) space

```python
def has_cycle_set(head):
    seen = set()
    current = head
    while current is not None:
        if id(current) in seen:  # id() gives memory address of object
            return True
        seen.add(id(current))
        current = current.next
    return False
```

### Optimized: Floyd's Tortoise and Hare — O(n) time, O(1) space

**The Insight:** Use two pointers moving at different speeds. If there's a cycle, the fast pointer will eventually "lap" the slow pointer and they'll meet.

Imagine two runners on a circular track. If one runs twice as fast as the other, they'll eventually meet.

```python
def has_cycle(head):
    slow = head
    fast = head
    
    while fast is not None and fast.next is not None:
        slow = slow.next         # Moves 1 step
        fast = fast.next.next    # Moves 2 steps
        
        if slow == fast:  # They met — cycle detected!
            return True
    
    return False  # fast reached None — no cycle
```

**Dry Run with cycle: `1 → 2 → 3 → 4 → 2` (4 points back to 2):**
```
Start: slow=1, fast=1

Step 1: slow=2, fast=3
Step 2: slow=3, fast=2 (fast went 3→4→2)
Step 3: slow=4, fast=4 (fast went 2→3→4, slow went 3→4)
        slow == fast → return True!
```

**Why O(1) space?** We only use two extra pointers, regardless of list size.

---

# 5. Stack & Queue

## Stack — LIFO (Last In, First Out)

**Real-world analogy:** A stack of plates. You add to the top, remove from the top. The last plate you put on is the first one you take off.

**Real programming uses:**
- Browser back/forward buttons
- Undo/redo in text editors
- Function call stack
- Parsing expressions (parentheses matching)

In Python, use a regular list for stack (append/pop are O(1)):

```python
stack = []

# Push
stack.append(1)
stack.append(2)
stack.append(3)
print(stack)  # [1, 2, 3]

# Pop
top = stack.pop()  # Returns 3, stack = [1, 2]

# Peek (look at top without removing)
top = stack[-1]  # 2

# Check empty
is_empty = len(stack) == 0
```

### Classic Problem: Valid Parentheses

**Problem:** Given a string of `()[]{}`, determine if it's valid (every opener has a matching closer in the right order).

```
"()" → True
"()[]{}" → True
"(]" → False
"([)]" → False
"({[]})" → True
```

```python
def is_valid(s):
    stack = []
    matching = {')': '(', ']': '[', '}': '{'}
    
    for char in s:
        if char in "([{":
            stack.append(char)  # Push opener
        elif char in ")]}":
            # Must have a matching opener on top of stack
            if not stack or stack[-1] != matching[char]:
                return False
            stack.pop()  # Matched — remove opener
    
    return len(stack) == 0  # Valid only if no unmatched openers remain
```

**Dry Run with `"({[]})":`**
```
char='(':  Push → stack=['(']
char='{':  Push → stack=['(', '{']
char='[':  Push → stack=['(', '{', '[']
char=']':  Closer! matching[']']='[', stack[-1]='[' ✓ → pop → stack=['(', '{']
char='}':  Closer! matching['}']='{', stack[-1]='{' ✓ → pop → stack=['(']
char=')':  Closer! matching[')']='(', stack[-1]='(' ✓ → pop → stack=[]

stack is empty → return True ✓
```

## Queue — FIFO (First In, First Out)

**Real-world analogy:** A line at a coffee shop. First person in line gets served first.

**Real programming uses:**
- BFS (Breadth-First Search)
- Task scheduling
- Print queues
- Message queues

Use `collections.deque` for O(1) enqueue and dequeue:

```python
from collections import deque

queue = deque()

# Enqueue (add to back)
queue.append(1)
queue.append(2)
queue.append(3)

# Dequeue (remove from front)
front = queue.popleft()  # Returns 1

# Peek
front = queue[0]
```

### Classic Problem: BFS Level Order Traversal (Preview)

We'll see this fully in the Trees chapter, but here's the queue pattern:

```python
def bfs(start_node):
    queue = deque([start_node])
    visited = set([start_node])
    
    while queue:
        node = queue.popleft()
        print(node.val)
        
        for neighbor in node.neighbors:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```

### Monotonic Stack — Advanced Pattern

A monotonic stack maintains elements in increasing or decreasing order. Useful for problems involving "next greater element".

**Problem: Next Greater Element**
For each element, find the next element to its right that is greater.

```python
def next_greater(nums):
    result = [-1] * len(nums)  # Default: -1 if no greater element
    stack = []  # Stores indices of elements waiting for their "next greater"
    
    for i, num in enumerate(nums):
        # Pop all elements that found their next greater
        while stack and nums[stack[-1]] < num:
            idx = stack.pop()
            result[idx] = num  # Current num is the next greater for idx
        stack.append(i)
    
    return result

# Example
print(next_greater([4, 1, 2, 5, 3]))  # [5, 2, 5, -1, -1]
```

---

# 6. Recursion (Deep Focus)

## Why Recursion Feels Hard

Recursion is the concept that trips up almost every developer starting DSA. The reason: we're used to thinking step-by-step (imperatively). Recursion requires a different mental model — **trust.**

You need to trust that:
1. The base case handles the smallest version correctly
2. If the recursive case works for a smaller version, it works for the current version

This is called **inductive thinking** — the same logic used in mathematical proofs.

## The Call Stack Visualization

When a function calls itself, Python creates a new **stack frame** for each call. Each frame has its own local variables. The frames stack up until a base case is reached, then they "unwind" (return their results back up).

**Example: Factorial**

```python
def factorial(n):
    if n == 0:     # Base case
        return 1
    return n * factorial(n - 1)  # Recursive case
```

**Tracing `factorial(4)`:**
```
factorial(4)
  → 4 * factorial(3)
        → 3 * factorial(2)
              → 2 * factorial(1)
                    → 1 * factorial(0)
                          → 1          ← BASE CASE REACHED

Now unwind:
  1 * 1 = 1
  2 * 1 = 2
  3 * 2 = 6
  4 * 6 = 24

factorial(4) = 24
```

**Call stack visualization:**
```
Frame 5: factorial(0) → returns 1
Frame 4: factorial(1) → 1 * 1 = 1
Frame 3: factorial(2) → 2 * 1 = 2
Frame 2: factorial(3) → 3 * 2 = 6
Frame 1: factorial(4) → 4 * 6 = 24
```

## The Three Questions for Any Recursive Problem

Before writing recursive code, answer these:
1. **What is the base case?** (smallest valid input that has a direct answer)
2. **What is the recursive case?** (how does the problem decompose?)
3. **Where is the return value used?** (what does each recursive call return, and what do you do with it?)

## Example 1: Sum of an Array

```python
def array_sum(nums):
    # Base case: empty array sums to 0
    if len(nums) == 0:
        return 0
    
    # Recursive case: first element + sum of the rest
    return nums[0] + array_sum(nums[1:])

# Trace: array_sum([1, 2, 3, 4])
# = 1 + array_sum([2, 3, 4])
#       = 2 + array_sum([3, 4])
#             = 3 + array_sum([4])
#                   = 4 + array_sum([])
#                         = 0
# = 1 + (2 + (3 + (4 + 0))) = 10
```

## Example 2: Power Function

```python
def power(base, exp):
    # Base case
    if exp == 0:
        return 1
    
    # Optimization: if exp is even, use squaring
    if exp % 2 == 0:
        half = power(base, exp // 2)
        return half * half  # base^exp = (base^(exp/2))²
    
    # Odd exponent
    return base * power(base, exp - 1)

# Without optimization: O(n) — this one is O(log n)
```

## Example 3: Fibonacci (Naive and Memoized)

```python
# Naive — O(2ⁿ) — terrible!
def fib_naive(n):
    if n <= 1:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)

# Memoized — O(n) — much better
def fib_memo(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]

# Cleaner memoization using functools
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)
```

## Example 4: Merge Sort — Recursion on Arrays

```python
def merge_sort(arr):
    # Base case: array of 0 or 1 element is already sorted
    if len(arr) <= 1:
        return arr
    
    # Split in half
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])   # Sort left half
    right = merge_sort(arr[mid:])  # Sort right half
    
    # Merge two sorted halves
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    # Pick smaller element from each half
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    # Add remaining elements
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Time: O(n log n) | Space: O(n)
```

**Trace for `merge_sort([3, 1, 4, 1, 5])`:**
```
merge_sort([3, 1, 4, 1, 5])
├── merge_sort([3, 1])
│   ├── merge_sort([3]) → [3]
│   └── merge_sort([1]) → [1]
│   merge([3], [1]) → [1, 3]
└── merge_sort([4, 1, 5])
    ├── merge_sort([4]) → [4]
    └── merge_sort([1, 5])
        ├── merge_sort([1]) → [1]
        └── merge_sort([5]) → [5]
        merge([1], [5]) → [1, 5]
    merge([4], [1, 5]) → [1, 4, 5]
merge([1, 3], [1, 4, 5]) → [1, 1, 3, 4, 5]
```

## Common Recursion Mistakes

**Mistake 1: No base case → Infinite recursion → Stack overflow**
```python
# WRONG:
def countdown(n):
    print(n)
    countdown(n - 1)  # Never stops!

# RIGHT:
def countdown(n):
    if n <= 0:        # Base case
        return
    print(n)
    countdown(n - 1)
```

**Mistake 2: Wrong base case**
```python
# WRONG: returns 0 for n=1
def factorial(n):
    if n == 1:
        return 0  # Should be 1!
    return n * factorial(n - 1)
```

**Mistake 3: Not returning the recursive result**
```python
# WRONG:
def sum_list(nums):
    if not nums:
        return 0
    nums[0] + sum_list(nums[1:])  # Forgot return!

# RIGHT:
def sum_list(nums):
    if not nums:
        return 0
    return nums[0] + sum_list(nums[1:])
```

---

# 7. Trees

## Why Trees Matter So Much

Trees appear in a huge percentage of interview questions — binary trees, BSTs, tries, segment trees. But most tree problems reduce to one of two things:
1. A traversal (visit all nodes in some order)
2. A recursive decomposition (solve for left subtree + right subtree + root)

Master these two and you can handle most tree problems.

## Binary Tree Structure

```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
```

**Building a tree:**
```
        1
       / \
      2   3
     / \
    4   5
```

```python
root = TreeNode(1)
root.left = TreeNode(2)
root.right = TreeNode(3)
root.left.left = TreeNode(4)
root.left.right = TreeNode(5)
```

## The Three Traversals

These are the backbone of tree problems. Learn their order cold.

### Inorder (Left → Root → Right)

```python
def inorder(root):
    if root is None:
        return
    inorder(root.left)    # Visit left subtree
    print(root.val)        # Visit root
    inorder(root.right)   # Visit right subtree

# For BST: inorder gives sorted order!
```

**Result for our tree:** 4, 2, 5, 1, 3

### Preorder (Root → Left → Right)

```python
def preorder(root):
    if root is None:
        return
    print(root.val)        # Visit root FIRST
    preorder(root.left)
    preorder(root.right)
```

**Result:** 1, 2, 4, 5, 3

### Postorder (Left → Right → Root)

```python
def postorder(root):
    if root is None:
        return
    postorder(root.left)
    postorder(root.right)
    print(root.val)        # Visit root LAST
```

**Result:** 4, 5, 2, 3, 1

### Level Order (BFS — Level by Level)

```python
from collections import deque

def level_order(root):
    if root is None:
        return []
    
    result = []
    queue = deque([root])
    
    while queue:
        level_size = len(queue)  # Nodes at current level
        level = []
        
        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.val)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        result.append(level)
    
    return result

# Returns: [[1], [2, 3], [4, 5]]
```

## The Recursion Pattern for Trees

Nearly all tree problems follow this template:

```python
def solve(root):
    # Base case
    if root is None:
        return <base_value>
    
    # Recurse on children
    left_result = solve(root.left)
    right_result = solve(root.right)
    
    # Combine results at current node
    return <combine(left_result, right_result, root.val)>
```

### Example: Maximum Depth of Binary Tree

```python
def max_depth(root):
    if root is None:
        return 0
    
    left_depth = max_depth(root.left)
    right_depth = max_depth(root.right)
    
    return 1 + max(left_depth, right_depth)
```

**Trace:**
```
max_depth(1)
├── max_depth(2) = 1 + max(max_depth(4), max_depth(5))
│   ├── max_depth(4) = 1 + max(0, 0) = 1
│   └── max_depth(5) = 1 + max(0, 0) = 1
│   = 1 + max(1, 1) = 2
└── max_depth(3) = 1 + max(0, 0) = 1

max_depth(1) = 1 + max(2, 1) = 3
```

### Example: Symmetric Tree

```python
def is_symmetric(root):
    def is_mirror(left, right):
        if left is None and right is None:
            return True
        if left is None or right is None:
            return False
        return (left.val == right.val and
                is_mirror(left.left, right.right) and  # Outer edges
                is_mirror(left.right, right.left))      # Inner edges
    
    return is_mirror(root.left, root.right)
```

### Binary Search Tree (BST)

A BST has a special property:
- Every node in the **left subtree** has a value **less than** the root
- Every node in the **right subtree** has a value **greater than** the root

This property holds recursively for every subtree.

```
        5
       / \
      3   8
     / \ / \
    1  4 7  9
```

**BST Search — O(log n) average:**
```python
def search_bst(root, target):
    if root is None:
        return None
    
    if target == root.val:
        return root
    elif target < root.val:
        return search_bst(root.left, target)   # Go left
    else:
        return search_bst(root.right, target)  # Go right
```

**Validate BST:**
```python
def is_valid_bst(root, min_val=float('-inf'), max_val=float('inf')):
    if root is None:
        return True
    
    if root.val <= min_val or root.val >= max_val:
        return False
    
    # Left subtree: all values must be less than root.val
    # Right subtree: all values must be greater than root.val
    return (is_valid_bst(root.left, min_val, root.val) and
            is_valid_bst(root.right, root.val, max_val))
```

---

# 8. Searching & Sorting

## Binary Search — Deep Understanding

Binary search is one of the most important algorithms to master. It's simple in concept but surprisingly tricky to implement correctly (off-by-one errors are notorious).

### Core Idea

You have a sorted array. Instead of checking every element (O(n)), you:
1. Look at the middle element
2. If it's your target, done
3. If target is smaller, search the left half
4. If target is larger, search the right half

Each step eliminates half the remaining elements. Total steps: log₂(n).

```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = left + (right - left) // 2  # Prevents integer overflow (safer than (l+r)//2)
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1    # Search right half
        else:
            right = mid - 1   # Search left half
    
    return -1  # Not found
```

**Dry Run with `arr = [1, 3, 5, 7, 9, 11], target = 7`:**
```
left=0, right=5
mid = (0+5)//2 = 2, arr[2]=5 < 7 → left = 3

left=3, right=5
mid = (3+5)//2 = 4, arr[4]=9 > 7 → right = 3

left=3, right=3
mid = (3+3)//2 = 3, arr[3]=7 == 7 → return 3 ✓
```

### Variations of Binary Search

**Find first occurrence of target:**
```python
def find_first(arr, target):
    left, right = 0, len(arr) - 1
    result = -1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            result = mid       # Found, but keep searching left for earlier occurrence
            right = mid - 1
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return result
```

**Find last occurrence:**
```python
def find_last(arr, target):
    left, right = 0, len(arr) - 1
    result = -1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            result = mid       # Found, but keep searching right for later occurrence
            left = mid + 1
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return result
```

**Search in rotated sorted array:**
```python
def search_rotated(nums, target):
    left, right = 0, len(nums) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if nums[mid] == target:
            return mid
        
        # Check which half is sorted
        if nums[left] <= nums[mid]:   # Left half is sorted
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        else:                          # Right half is sorted
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1
    
    return -1
```

## Sorting Algorithms

### Bubble Sort — O(n²)

The most basic sort. Repeatedly swaps adjacent elements if they're in the wrong order.

```python
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr
```

Not used in practice, but understanding it builds intuition.

### Selection Sort — O(n²)

Find the minimum in the unsorted portion and swap it to the front.

```python
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
```

### Quick Sort — O(n log n) average, O(n²) worst

Pick a pivot, partition elements around it, recursively sort each side.

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quick_sort(left) + middle + quick_sort(right)
```

### Python's Built-in Sort

In interviews, you'll almost always use Python's built-in `sort()` or `sorted()`. These use **Timsort**, an O(n log n) hybrid algorithm.

```python
# Sort ascending
arr.sort()

# Sort descending
arr.sort(reverse=True)

# Sort by custom key
words.sort(key=len)  # Sort by length

# Sort list of tuples — sort by second element
pairs.sort(key=lambda x: x[1])

# Sort stability: Python's sort is stable (preserves relative order of equal elements)
```

---

# 9. Dynamic Programming (Beginner Friendly)

## What Is Dynamic Programming?

Dynamic Programming (DP) is a technique for solving problems by:
1. Breaking them into smaller subproblems
2. Solving each subproblem only **once**
3. **Storing** the results to avoid redundant computation

**The DP Mantra:** "I've solved this smaller version before. Let me use that stored answer."

DP is applicable when a problem has two properties:
1. **Overlapping subproblems:** The same smaller problems are solved repeatedly
2. **Optimal substructure:** The optimal solution to the big problem can be built from optimal solutions to subproblems

**DP is NOT about memorizing formulas.** It's about recognizing when you're recomputing the same thing and storing the result.

## Two Approaches to DP

### Approach 1: Memoization (Top-Down)

Start with recursion, add a cache. Natural to write — just add a dictionary to store computed results.

```python
# Fibonacci with memoization
def fib(n, memo={}):
    if n in memo:
        return memo[n]      # Already computed — return cached value
    if n <= 1:
        return n
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]
```

### Approach 2: Tabulation (Bottom-Up)

Start with the smallest subproblems, fill a table (usually an array) working up to the answer.

```python
# Fibonacci with tabulation
def fib_table(n):
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[0] = 0
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]  # Build from previously stored values
    
    return dp[n]
```

**Which to use?**
- Memoization: easier to code, follows natural recursion
- Tabulation: usually more efficient (no function call overhead), required when recursion depth is large

## Classic DP Problem 1: Climbing Stairs

**Problem:** You can climb 1 or 2 stairs at a time. How many distinct ways to climb n stairs?

**Think about it:** To reach stair n, you either came from stair n-1 (took 1 step) or stair n-2 (took 2 steps). So: `ways(n) = ways(n-1) + ways(n-2)`. This is Fibonacci!

```python
def climb_stairs(n):
    if n <= 2:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1   # 1 way to reach stair 1
    dp[2] = 2   # 2 ways to reach stair 2: (1+1) or (2)
    
    for i in range(3, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    
    return dp[n]

# For n=5: dp = [0, 1, 2, 3, 5, 8] → 8 ways
```

## Classic DP Problem 2: Coin Change

**Problem:** Given coins of different denominations and a total amount, find the minimum number of coins needed to make that amount. Return -1 if impossible.

**Example:** `coins = [1, 5, 10], amount = 11` → `2` (10 + 1)

**State:** `dp[i]` = minimum coins needed to make amount `i`

**Transition:** For each coin, `dp[i] = min(dp[i], dp[i - coin] + 1)` (use one of this coin + solution for remaining amount)

```python
def coin_change(coins, amount):
    # dp[i] = minimum coins to make amount i
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0  # Base case: 0 coins needed to make amount 0
    
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:  # Can we use this coin?
                dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1
```

**Dry Run with `coins = [1, 5], amount = 6`:**
```
dp = [0, inf, inf, inf, inf, inf, inf]
       0   1    2    3    4    5    6

i=1: coin=1: dp[1] = min(inf, dp[0]+1) = 1
     coin=5: 5 > 1, skip
     dp[1] = 1

i=2: coin=1: dp[2] = min(inf, dp[1]+1) = 2
     coin=5: 5 > 2, skip
     dp[2] = 2

...

i=5: coin=1: dp[5] = min(inf, dp[4]+1) = 5
     coin=5: dp[5] = min(5, dp[0]+1) = min(5,1) = 1
     dp[5] = 1

i=6: coin=1: dp[6] = min(inf, dp[5]+1) = 2
     coin=5: dp[6] = min(2, dp[1]+1) = min(2,2) = 2
     dp[6] = 2

Result: 2 ✓ (5 + 1)
```

## Classic DP Problem 3: Longest Common Subsequence (LCS)

**Problem:** Given two strings, find the length of their longest common subsequence.

A subsequence doesn't need to be contiguous — "ACE" is a subsequence of "ABCDE".

**Example:** `s1 = "ABCDE"`, `s2 = "ACE"` → LCS length = 3 ("ACE")

**State:** `dp[i][j]` = LCS length of `s1[:i]` and `s2[:j]`

**Transition:**
- If `s1[i-1] == s2[j-1]`: `dp[i][j] = dp[i-1][j-1] + 1`
- Else: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`

```python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    
    # Create (m+1) × (n+1) table, all zeros
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i-1] == s2[j-1]:       # Characters match
                dp[i][j] = dp[i-1][j-1] + 1
            else:                          # Don't match — take best of excluding either char
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    
    return dp[m][n]
```

## DP Thinking Framework

When you see a problem, ask these questions in order:

1. **Can I define the problem in terms of a smaller version of itself?** (Is there recursive structure?)
2. **Are there overlapping subproblems?** (Would naive recursion recompute the same thing?)
3. **What's my "state"?** (What information do I need to define a subproblem uniquely?)
4. **What's my "transition"?** (How do I compute the answer for a state from smaller states?)
5. **What's my base case?** (What's the smallest state I can answer directly?)

---

# 10. Pattern Recognition (Very Important)

## How to Identify Problem Types

This is the skill that separates intermediate from advanced DSA practitioners. Given an unknown problem, can you recognize which technique to apply?

Here's a battle-tested guide:

## Pattern 1: Frequency / Count
**Keywords:** "most frequent", "k most common", "appeared more than n/2 times", "duplicate", "anagram"

**Tool:** `Counter` or `defaultdict`

**Example problems:**
- Two strings are anagrams?
- Find all duplicates in array
- Top K frequent elements

```python
# Template
from collections import Counter
freq = Counter(nums)  # or freq = Counter(s)
```

## Pattern 2: Two Pointers
**Keywords:** "sorted array", "pair that sums to", "reverse", "palindrome", "remove duplicates"

**Tool:** Left and right pointers moving toward each other

**Example problems:**
- Two Sum on sorted array
- Valid palindrome
- 3Sum
- Remove duplicates from sorted array

```python
# Template
left, right = 0, len(arr) - 1
while left < right:
    # do something
    if condition_to_move_left:
        left += 1
    else:
        right -= 1
```

## Pattern 3: Sliding Window
**Keywords:** "subarray/substring", "longest/shortest", "exactly k", "at most k", "window"

**Tool:** Two pointers (window boundaries) + some tracking variable

**Example problems:**
- Longest substring without repeating characters
- Maximum sum subarray of size k
- Minimum window substring

```python
# Template (variable window)
left = 0
for right in range(len(arr)):
    # Add arr[right] to window
    
    while window_is_invalid:
        # Remove arr[left] from window
        left += 1
    
    # Update answer with current valid window
    result = max(result, right - left + 1)
```

## Pattern 4: Fast & Slow Pointers
**Keywords:** "cycle in linked list", "middle of linked list", "find duplicate number"

**Tool:** Two pointers at different speeds

```python
# Template
slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    if slow == fast:
        # Cycle detected
```

## Pattern 5: BFS (Breadth-First Search)
**Keywords:** "level order", "shortest path", "minimum steps", "spread", "ripple"

**Tool:** Queue

**Use when:** You need the shortest path OR need to process nodes level by level

```python
# Template
from collections import deque
queue = deque([start])
visited = set([start])

while queue:
    node = queue.popleft()
    for neighbor in get_neighbors(node):
        if neighbor not in visited:
            visited.add(neighbor)
            queue.append(neighbor)
```

## Pattern 6: DFS (Depth-First Search)
**Keywords:** "all paths", "exhaustive search", "combinations", "permutations", "backtracking"

**Tool:** Recursion (or stack)

**Use when:** You need to explore all possibilities

```python
# Template
def dfs(node, visited):
    if is_base_case(node):
        return
    visited.add(node)
    for neighbor in get_neighbors(node):
        if neighbor not in visited:
            dfs(neighbor, visited)
```

## Pattern 7: Binary Search
**Keywords:** "sorted array", "find target", "minimum/maximum X such that condition holds", "search in"

**Use when:**
- Array is sorted (or can be modeled as sorted)
- You need O(log n) search
- "What's the minimum X such that some condition holds?"

```python
# Template — finding boundary (first True in [F,F,F,T,T,T])
left, right = 0, n
while left < right:
    mid = (left + right) // 2
    if condition(mid):
        right = mid
    else:
        left = mid + 1
return left
```

## Pattern 8: Merge Intervals
**Keywords:** "overlapping intervals", "meeting rooms", "merge", "schedule"

**Tool:** Sort by start time, then sweep

```python
# Template
intervals.sort(key=lambda x: x[0])
merged = [intervals[0]]

for start, end in intervals[1:]:
    if start <= merged[-1][1]:  # Overlapping
        merged[-1][1] = max(merged[-1][1], end)
    else:
        merged.append([start, end])
```

## Pattern 9: Dynamic Programming
**Keywords:** "minimum/maximum", "number of ways", "optimal", "can you", "count all"

**Signal questions:**
- Can I break this into smaller subproblems?
- Does recursion lead to repeated work?

```python
# Template
dp = [base_case] * (n + 1)
for i in range(1, n + 1):
    dp[i] = f(dp[i-1], dp[i-2], ...)  # Transition
return dp[n]
```

## Pattern 10: Heap / Priority Queue
**Keywords:** "k largest", "k smallest", "kth element", "top k", "stream"

**Tool:** `heapq`

```python
# K largest elements
import heapq
heap = []
for num in nums:
    heapq.heappush(heap, num)
    if len(heap) > k:
        heapq.heappop(heap)  # Remove smallest — keeps k largest

# OR simpler:
return heapq.nlargest(k, nums)
```

---

## Decision Tree for Any Problem

```
Read the problem carefully
        ↓
Is the array SORTED?
  YES → Binary Search or Two Pointers
  NO  ↓

Does it involve finding SUBARRAYS or SUBSTRINGS?
  YES → Sliding Window or Prefix Sum
  NO  ↓

Does it involve COUNTING FREQUENCY or LOOKUP?
  YES → Hash Map / Set
  NO  ↓

Is it a LINKED LIST?
  YES → Two Pointers (Fast/Slow) or Reversal
  NO  ↓

Is it a TREE?
  YES → DFS (recursive) or BFS (queue)
  NO  ↓

Does it ask for ALL COMBINATIONS or PATHS?
  YES → DFS + Backtracking
  NO  ↓

Does it ask for MINIMUM, MAXIMUM, or COUNT of WAYS?
  YES → Dynamic Programming
  NO  ↓

Does it involve INTERVALS?
  YES → Sort + Merge
  NO  ↓

Does it need K-th LARGEST/SMALLEST?
  YES → Heap
```

---

# 11. Practice Roadmap (For Working Developers)

## The 30-Day Plan

This plan assumes 45–60 minutes per day, 5 days a week, 2 lighter days on weekends. It's designed for a working developer who is serious but time-constrained.

**Legend:**
- 🟢 Easy — focus on clarity and clean code
- 🟡 Medium — core of interview prep
- 🔴 Hard — stretch goals only

---

### Week 1: Python Solidification + Arrays

**Day 1 (Mon):** Read Chapter 1.1. Write code for all examples. No problems yet — just building muscle memory.

**Day 2 (Tue):** Read Chapter 1.2. Practice `Counter`, `deque`, slicing. Write the 4 exercises at the end of 1.1 from scratch.

**Day 3 (Wed):** Read Chapter 2 (Complexity). For every code block, estimate complexity before reading the answer.

**Day 4 (Thu) — LeetCode:**
- 🟢 Two Sum (#1)
- 🟢 Contains Duplicate (#217)

**Day 5 (Fri) — LeetCode:**
- 🟢 Valid Anagram (#242)
- 🟢 Maximum Subarray (#53) — use sliding window thinking

**Weekend:**
- Review the 4 problems you did this week. Can you code each from scratch in 5 minutes?
- 🟢 Best Time to Buy and Sell Stock (#121)

---

### Week 2: Hashing + Linked Lists + Stack

**Day 8 (Mon):**
- 🟢 Group Anagrams (#49) — uses Counter + dictionary
- 🟢 Longest Common Prefix (#14)

**Day 9 (Tue):** Read Chapter 4 (Linked Lists). Implement your own linked list from scratch.

**Day 10 (Wed):**
- 🟢 Reverse Linked List (#206)
- 🟢 Merge Two Sorted Lists (#21)

**Day 11 (Thu):** Read Chapter 5 (Stack & Queue).
- 🟢 Valid Parentheses (#20)
- 🟢 Min Stack (#155)

**Day 12 (Fri):**
- 🟡 Linked List Cycle (#141)
- 🟡 Remove Nth Node From End of List (#19)

**Weekend:**
- 🟡 Daily Temperatures (#739) — monotonic stack
- Dry run all this week's problems on paper

---

### Week 3: Recursion + Trees

**Day 15 (Mon):** Read Chapter 6 (Recursion). Trace every example on paper.

**Day 16 (Tue):**
- 🟢 Fibonacci (implement 3 ways: naive, memoized, iterative)
- 🟢 Power of Two (#231)

**Day 17 (Wed):** Read Chapter 7 (Trees). Code all traversals from scratch.
- 🟢 Maximum Depth of Binary Tree (#104)
- 🟢 Symmetric Tree (#101)

**Day 18 (Thu):**
- 🟢 Invert Binary Tree (#226)
- 🟡 Binary Tree Level Order Traversal (#102)

**Day 19 (Fri):**
- 🟡 Validate Binary Search Tree (#98)
- 🟡 Lowest Common Ancestor of BST (#235)

**Weekend:**
- 🟡 Path Sum (#112)
- 🟡 Diameter of Binary Tree (#543)

---

### Week 4: Sorting + Binary Search + DP Intro

**Day 22 (Mon):** Read Chapter 8 (Searching & Sorting). Implement binary search 5 times without looking.

**Day 23 (Tue):**
- 🟢 Binary Search (#704)
- 🟡 Search in Rotated Sorted Array (#33)

**Day 24 (Wed):** Read Chapter 9 (DP). Trace Fibonacci DP table by hand.
- 🟢 Climbing Stairs (#70)
- 🟢 House Robber (#198)

**Day 25 (Thu):**
- 🟡 Coin Change (#322)
- 🟡 Longest Increasing Subsequence (#300)

**Day 26 (Fri):**
- 🟡 Jump Game (#55)
- 🟡 Product of Array Except Self (#238) — great arrays problem

**Weekend:**
- Full mock interview session: set a 45-minute timer, pick 2 problems you haven't seen, and solve them as if in a real interview (explain as you code).

---

### Days 27–30: Consolidation

Use these days to:
1. Re-solve problems you struggled with
2. Time yourself solving "easy" problems — should be under 15 minutes each
3. For each medium problem: can you identify the pattern within 5 minutes?

**Target metrics by Day 30:**
- Easy problems: solved in < 15 minutes
- Medium problems: identified pattern in < 5 minutes, coded in < 30 minutes
- Zero googling for syntax — all Python patterns memorized

---

## The 1–2 Problem Daily Strategy

On any given day, follow this sequence:

**Morning (before work — 20 minutes if possible):**
Review yesterday's problem without code. Can you explain the approach and complexity? If not, re-read it.

**Evening (45 minutes):**
1. (5 min) Read the problem carefully. Write input/output examples.
2. (10 min) Think about brute force. What would you do naively?
3. (5 min) Identify the pattern. Use the decision tree.
4. (15 min) Code the solution. Don't Google.
5. (5 min) Trace through with an example.
6. (5 min) Analyze time and space complexity.

**The rule:** If you can't start after 15 minutes of thinking, read only the problem hints, not the solution. Try again.

---

## Interview Tips for Python

**1. Say your approach first.** "My approach is to use a sliding window because we're looking for a subarray..." Interviewers want to hear your thinking.

**2. Know your built-ins cold:**
```python
# These must be instant:
len(), sum(), min(), max(), sorted(), enumerate(), zip()
range(), list(), dict(), set(), tuple()
Counter(), deque(), defaultdict()
```

**3. Handle edge cases early:**
```python
def solution(nums):
    if not nums:  # Empty array
        return []
    if len(nums) == 1:  # Single element
        return [nums[0]]
    # ... main logic
```

**4. Python-specific interview patterns:**

```python
# Swap variables (no temp needed)
a, b = b, a

# Multiple assignment
x = y = z = 0

# Check if list/string is non-empty
if my_list:  # Pythonic
if len(my_list) > 0:  # Also fine but verbose

# Get key from dict with default
count = freq.get(char, 0)

# Check if key exists before using
if key in my_dict:
    # safe to use my_dict[key]
```

**5. Complexity communication template:**
"This solution has a time complexity of O(n log n) because [brief explanation]. The space complexity is O(n) because [brief explanation]."

---

## LeetCode Problems Organized by Pattern

### Two Pointers
- Two Sum II (sorted array) — #167 🟢
- Valid Palindrome — #125 🟢
- 3Sum — #15 🟡
- Container With Most Water — #11 🟡

### Sliding Window
- Longest Substring Without Repeating Characters — #3 🟡
- Minimum Window Substring — #76 🔴
- Permutation in String — #567 🟡

### Prefix Sum
- Subarray Sum Equals K — #560 🟡
- Product of Array Except Self — #238 🟡

### Linked List
- Reverse Linked List — #206 🟢
- Linked List Cycle — #141 🟢
- Find the Duplicate Number — #287 🟡
- Reorder List — #143 🟡

### Stack
- Valid Parentheses — #20 🟢
- Daily Temperatures — #739 🟡
- Largest Rectangle in Histogram — #84 🔴

### Trees
- Maximum Depth of Binary Tree — #104 🟢
- Invert Binary Tree — #226 🟢
- Binary Tree Level Order Traversal — #102 🟡
- Serialize and Deserialize Binary Tree — #297 🔴

### Binary Search
- Binary Search — #704 🟢
- Find First and Last Position — #34 🟡
- Search in Rotated Sorted Array — #33 🟡
- Koko Eating Bananas — #875 🟡 (great binary search on answer)

### Dynamic Programming
- Climbing Stairs — #70 🟢
- House Robber — #198 🟢
- Coin Change — #322 🟡
- Longest Increasing Subsequence — #300 🟡
- Word Break — #139 🟡
- Unique Paths — #62 🟡

### Heap
- Kth Largest Element in Array — #215 🟡
- Top K Frequent Elements — #347 🟡
- Merge K Sorted Lists — #23 🔴

---

## Final Words

If you've read this far and coded along, you're already ahead of most people who start DSA prep. The hardest part isn't learning the algorithms — it's showing up consistently.

Some days you'll be stuck on a "easy" problem for 40 minutes. That's normal. That frustration is your brain forming new pathways.

Some days you'll instantly see the pattern and solve a medium in 10 minutes. That's progress. Celebrate it.

The goal isn't perfection. The goal is to become the kind of engineer who, when handed an unknown problem, has a systematic way to approach it, break it down, and reason through it clearly.

That's what this guide was designed to build.

---

### Quick Reference Cards

#### Python Data Structure Operations Cheat Sheet

```python
# LIST
lst = [1, 2, 3]
lst.append(4)          # O(1)
lst.insert(0, 0)       # O(n)
lst.pop()              # O(1) — from end
lst.pop(0)             # O(n) — from front
lst.remove(2)          # O(n) — removes first occurrence
lst[i]                 # O(1) — access
len(lst)               # O(1)
x in lst               # O(n)
lst.sort()             # O(n log n)

# DICT
d = {}
d[key] = val           # O(1)
d.get(key, default)    # O(1)
del d[key]             # O(1)
key in d               # O(1)

# SET
s = set()
s.add(x)              # O(1)
s.remove(x)           # O(1)
x in s                # O(1)

# DEQUE
from collections import deque
dq = deque()
dq.append(x)          # O(1) — right
dq.appendleft(x)      # O(1) — left
dq.pop()              # O(1)
dq.popleft()          # O(1)

# HEAP
import heapq
h = []
heapq.heappush(h, x)  # O(log n)
heapq.heappop(h)       # O(log n) — removes minimum
h[0]                   # O(1) — peek minimum
heapq.heapify(lst)     # O(n)
```

#### Complexity Quick Reference

```
O(1)       < O(log n) < O(n)    < O(n log n) < O(n²) < O(2ⁿ) < O(n!)
Constant     Binary      Linear    Merge Sort    Nested   Recur.  Perms
             Search                             Loops    Fib
```

#### Most Common Interview Mistakes

1. Not clarifying the problem (can nums be negative? can input be empty?)
2. Not stating time/space complexity
3. Forgetting edge cases (empty input, single element, duplicates)
4. Starting to code immediately without a plan
5. Not testing with an example

#### Interview Code Template

```python
def solution(input):
    # Step 1: Handle edge cases
    if not input:
        return <default>
    
    # Step 2: Initialize data structures
    
    
    # Step 3: Main logic
    
    
    # Step 4: Return answer
    return result

# Time: O(?)
# Space: O(?)
```

---

*This guide was designed for a developer who knows JavaScript, is rediscovering Python, and wants to become DSA interview-ready. If you've worked through it consistently, you're ready to tackle the majority of LeetCode Easy and Medium problems.*

*Good luck — and remember: the best DSA solution is the one you can explain clearly, not just the one that runs fast.*
