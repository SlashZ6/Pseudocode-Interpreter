export interface Example {
  title: string;
  description: string;
  code: string;
  category: 'Basics' | 'Conditionals' | 'Loops' | 'Functions & Modules' | 'Recursion & Arrays';
}

export const examples: Example[] = [
  // Basics
  {
    title: 'Hello World',
    description: 'The simplest program to display a message.',
    category: 'Basics',
    code: `Module main()
    Display "Hello, World!"
End Module`
  },
  {
    title: 'Variables & IO',
    description: 'Declare variables, get user input, and display the result.',
    category: 'Basics',
    code: `Module main()
    Declare String name
    Declare Integer age

    Display "Please enter your name: "
    Input name
    
    Display "Please enter your age: "
    Input age
    
    Display "Hello, ", name, "! You are ", age, " years old."
End Module`
  },
  {
    title: 'Constants',
    description: 'Define and use constants for values that do not change, like PI.',
    category: 'Basics',
    code: `Module main()
    Constant Real PI = 3.14159
    Declare Real radius, area
    
    Display "Enter the radius of a circle: "
    Input radius
    
    Set area = PI * (radius * radius)
    
    Display "The area of the circle is: ", area
End Module`
  },
  {
    title: 'Simple Calculator',
    description: 'Performs basic arithmetic operations on two numbers.',
    category: 'Basics',
    code: `Module main()
    Declare Real num1, num2
    
    Display "Enter the first number: "
    Input num1
    
    Display "Enter the second number: "
    Input num2
    
    Display num1, " + ", num2, " = ", (num1 + num2)
    Display num1, " - ", num2, " = ", (num1 - num2)
    Display num1, " * ", num2, " = ", (num1 * num2)
    Display num1, " / ", num2, " = ", (num1 / num2)
End Module`
  },
  // Conditionals
  {
    title: 'If-Else Statement',
    description: 'Check a condition to determine if a number is positive or non-positive.',
    category: 'Conditionals',
    code: `Module main()
    Declare Integer number
    
    Display "Enter a number: "
    Input number
    
    If number > 0 Then
        Display "The number is positive."
    Else
        Display "The number is zero or negative."
    End If
End Module`
  },
  {
    title: 'Else-If Statement',
    description: 'Determine a letter grade based on a score.',
    category: 'Conditionals',
    code: `Module main()
    Declare Integer score
    
    Display "Enter your score (0-100): "
    Input score
    
    If score >= 90 Then
        Display "Your grade is A."
    Else If score >= 80 Then
        Display "Your grade is B."
    Else If score >= 70 Then
        Display "Your grade is C."
    Else If score >= 60 Then
        Display "Your grade is D."
    Else
        Display "Your grade is F."
    End If
End Module`
  },
  {
    title: 'Nested If Statements',
    description: 'Demonstrates nesting If statements to check multiple criteria.',
    category: 'Conditionals',
    code: `Module main()
    Declare Integer age
    Declare String hasLicense
    
    Display "Enter your age: "
    Input age
    
    If age >= 16 Then
        Display "Do you have a driver's license? (yes/no)"
        Input hasLicense
        
        If hasLicense == "yes" Then
            Display "You are old enough and licensed to drive."
        Else
            Display "You are old enough to drive, but need a license."
        End If
    Else
        Display "You are too young to drive."
    End If
End Module`
  },
  {
    title: 'Logical Operators',
    description: 'Use AND, OR, and NOT to create complex conditions.',
    category: 'Conditionals',
    code: `Module main()
    Declare Integer temperature
    
    Display "Enter the current temperature: "
    Input temperature
    
    // Use AND
    If temperature > 0 And temperature < 30 Then
        Display "The weather is pleasant."
    End If
    
    // Use OR
    If temperature <= 0 Or temperature >= 30 Then
        Display "The weather is extreme (either too cold or too hot)."
    End If
End Module`
  },
  // Loops
  {
    title: 'For Loop',
    description: 'Calculate the sum of numbers from 1 to a user-defined limit.',
    category: 'Loops',
    code: `Module main()
    Declare Integer limit, sum, i
    Set sum = 0
    
    Display "Enter a positive integer limit: "
    Input limit
    
    For i = 1 To limit
        Set sum = sum + i
    End For
    
    Display "The sum of numbers from 1 to ", limit, " is ", sum, "."
End Module`
  },
  {
    title: 'While Loop',
    description: 'A simple countdown from 5 to 1.',
    category: 'Loops',
    code: `Module main()
    Declare Integer counter
    Set counter = 5
    
    While counter > 0
        Display "Countdown: ", counter
        Set counter = counter - 1
    End While
    
    Display "Blast off!"
End Module`
  },
  {
    title: 'Do-Until Loop',
    description: 'Prompt the user for a password until they enter the correct one.',
    category: 'Loops',
    code: `Module main()
    Declare String password
    
    Do
        Display "Enter the password: "
        Input password
    Until password == "secret"
    
    Display "Access granted."
End Module`
  },
  {
    title: 'Factorial Calculation',
    description: 'Calculate the factorial of a number using a For loop.',
    category: 'Loops',
    code: `Module main()
    Declare Integer number, factorial, i
    Set factorial = 1
    
    Display "Enter a non-negative integer: "
    Input number
    
    If number < 0 Then
        Display "Factorial is not defined for negative numbers."
    Else
        For i = 1 To number
            Set factorial = factorial * i
        End For
        Display "The factorial of ", number, " is ", factorial, "."
    End If
End Module`
  },
  {
    title: 'Input Validation',
    description: 'Use a Do-While loop to ensure the user enters a valid number.',
    category: 'Loops',
    code: `Module main()
    Declare Integer number
    
    Do
        Display "Enter a number between 1 and 10: "
        Input number
        If number < 1 Or number > 10 Then
            Display "Invalid input. Please try again."
        End If
    While number < 1 Or number > 10
    
    Display "You entered a valid number: ", number
End Module`
  },
  // Functions & Modules
  {
    title: 'Function Call',
    description: 'Use a function to calculate the area of a rectangle.',
    category: 'Functions & Modules',
    code: `Function Real calculateArea(Real length, Real width)
    Return length * width
End Function

Module main()
    Declare Real area, len, w
    Set len = 10.5
    Set w = 4.0
    
    Set area = calculateArea(len, w)
    
    Display "The area of a rectangle with length ", len, " and width ", w, " is ", area, "."
End Module`
  },
  {
    title: 'Module Call',
    description: 'Use a separate module to display a welcome message.',
    category: 'Functions & Modules',
    code: `Module showWelcome()
    Display "--------------------------"
    Display "Welcome to the program!"
    Display "--------------------------"
End Module

Module main()
    Call showWelcome()
    
    Declare String name
    Display "What is your name?"
    Input name
    Display "Nice to meet you, ", name, "."
End Module`
  },
  {
    title: 'Pass by Reference',
    description: 'Modify a variable inside a function using a reference parameter.',
    category: 'Functions & Modules',
    code: `Module swap(Ref Integer num1, Ref Integer num2)
    Declare Integer temp
    Set temp = num1
    Set num1 = num2
    Set num2 = temp
End Module

Module main()
    Declare Integer a, b
    Set a = 10
    Set b = 20
    
    Display "Before swap: a = ", a, ", b = ", b
    
    Call swap(a, b)
    
    Display "After swap: a = ", a, ", b = ", b
End Module`
  },
  {
    title: 'Math Functions',
    description: 'Demonstrates built-in functions like random, power, and sqrt.',
    category: 'Functions & Modules',
    code: `Module main()
    Declare Integer randomNumber
    Declare Real squareRoot, numPower
    
    // Generate a random number between 1 and 100
    Set randomNumber = random(1, 100)
    Display "A random number between 1 and 100 is: ", randomNumber
    
    // Calculate the square root
    Set squareRoot = sqrt(randomNumber)
    Display "The square root of that number is: ", squareRoot
    
    // Calculate a number to a power
    Set numPower = power(2, 8)
    Display "2 to the power of 8 is: ", numPower
End Module`
  },
  {
    title: 'String Manipulation',
    description: 'Use built-in functions for string operations like length, toupper, and substring.',
    category: 'Functions & Modules',
    code: `Module main()
    Declare String text
    Set text = "Pseudocode is fun!"
    
    Display "Original string: '", text, "'"
    
    // Get length
    Display "Length: ", length(text)
    
    // Convert to uppercase
    Display "Uppercase: ", toUpper(text)
    
    // Check for substring
    If contains(text, "code") Then
        Display "The string contains the word 'code'."
    End If
    
    // Extract a substring (index starts at 0)
    Display "Substring from index 11 to 13: '", substring(text, 11, 14), "'"
End Module`
  },
  // Recursion & Arrays
  {
    title: 'Recursive Factorial',
    description: 'Calculates the factorial of a number using a recursive function.',
    category: 'Recursion & Arrays',
    code: `// The factorial function uses recursion to
// calculate the factorial of its argument.
Function Integer factorial(Integer n)
    If n == 0 Then
        Return 1
    Else
        Return n * factorial(n - 1)
    End If
End Function

Module main()
    Declare Integer number, result
    
    Display "Enter a non-negative integer."
    Input number
    
    Set result = factorial(number)
    
    Display "The factorial of ", number, " is ", result
End Module`
  },
  {
    title: 'Fibonacci Series (Recursive)',
    description: 'Generates the first 10 numbers in the Fibonacci sequence using recursion.',
    category: 'Recursion & Arrays',
    code: `// The fib function returns the nth number
// in the Fibonacci series.
Function Integer fib(Integer n)
    If n == 0 Then
        Return 0
    Else If n == 1 Then
        Return 1
    Else
        Return fib(n - 1) + fib(n - 2)
    End If
End Function

Module main()
    Declare Integer i
    
    Display "The first 10 numbers in the Fibonacci series are:"
    For i = 0 To 9
        Display fib(i)
    End For
End Module`
  },
  {
    title: 'Sum Array Elements (Recursive)',
    description: 'Uses recursion to sum a range of elements in an integer array.',
    category: 'Recursion & Arrays',
    code: `// The rangeSum function returns the sum of a specified
// range of elements in an array.
Function Integer rangeSum(Integer array[], Integer start, Integer end)
    If start > end Then
        Return 0
    Else
        Return array[start] + rangeSum(array, start + 1, end)
    End If
End Function

Module main()
    Constant Integer SIZE = 9
    Declare Integer numbers[SIZE] = 1, 2, 3, 4, 5, 6, 7, 8, 9
    Declare Integer sum
    
    // Get the sum of elements from index 2 through 5.
    // (3 + 4 + 5 + 6) = 18
    Set sum = rangeSum(numbers, 2, 5)
    
    Display "The sum of elements 2 through 5 is ", sum
End Module`
  },
  {
    title: 'Recursive Multiplication',
    description: 'Performs multiplication by using repeated addition recursively.',
    category: 'Recursion & Arrays',
    code: `// The multiply function accepts two integers and
// returns their product using recursion.
Function Integer multiply(Integer x, Integer y)
    If x == 0 Or y == 0 Then
        Return 0
    Else If y > 0 Then
        Return x + multiply(x, y - 1)
    Else
        // Handle negative y
        Return -multiply(x, -y)
    End If
End Function

Module main()
    Declare Integer first, second
    
    Display "Enter a number: "
    Input first
    
    Display "Enter another number: "
    Input second
    
    Display first, " times ", second, " equals ", multiply(first, second)
End Module`
  },
];

export const exampleCodes = new Set(examples.map(e => e.code));
