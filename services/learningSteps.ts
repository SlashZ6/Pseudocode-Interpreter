export interface LearningStep {
  title: string;
  content: string;
  targetId?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  code?: string;
}

export interface LearningTopicGuide {
  topic: string;
  description: string;
  steps: LearningStep[];
}

export const learningGuides: LearningTopicGuide[] = [
  {
    topic: 'Introduction',
    description: 'Get acquainted with the environment and basic program structure.',
    steps: [
      {
        title: 'The Code Editor',
        targetId: 'code-editor',
        position: 'right',
        content: "This is the **Code Editor**. It's where you'll type your instructions. Think of it as a blueprint for your program. We'll start with the most basic structure.",
        code: `// Your code goes here!`
      },
      {
        title: 'The Console',
        targetId: 'console-panel',
        position: 'top',
        content: "This is the **Console**. It's where your program will display messages and ask for input. It’s how your program communicates with you.",
      },
      {
        title: 'Running Your Code',
        targetId: 'run-button',
        position: 'bottom',
        content: "The **Run** button executes your code from top to bottom. Press it to bring your pseudocode to life.",
      },
      {
        title: 'Program Structure',
        targetId: 'code-editor',
        position: 'right',
        content: "Every program is built inside a main module. All your code must be written between `Module main()` and `End Module`. This is the starting point of your program.",
        code: `Module main()
    // Your instructions will go here
End Module`,
      },
      {
        title: 'Displaying Messages',
        targetId: 'code-editor',
        position: 'right',
        content: "Use the `Display` command to show text in the console. Text, also known as a 'String', must be enclosed in double quotes.",
        code: `Module main()
    Display "Hello, World!"
End Module`,
      },
      {
        title: 'Comments',
        targetId: 'code-editor',
        position: 'right',
        content: "Lines starting with `//` are **comments**. The computer ignores them. They are notes for you and other programmers to understand the code.",
        code: `Module main()
    // This is a comment. It will not be executed.
    Display "This line will be displayed."
End Module`,
      },
    ]
  },
  {
    topic: 'Variables & Input',
    description: 'Learn to store data, perform calculations, and get input from a user.',
    steps: [
      {
        title: 'What Are Variables?',
        position: 'center',
        content: "Variables are named storage locations in memory. Think of them as **labeled boxes** where you can keep information to use later. First, you must create (or 'Declare') a variable.",
        code: `// We will declare a variable in the next step.`
      },
      {
        title: 'Declaring Variables',
        targetId: 'code-editor',
        position: 'right',
        content: "Use the `Declare` keyword, followed by a data type and a name. Common types are `Integer` for whole numbers, `Real` for decimal numbers, and `String` for text.",
        code: `Module main()
    // Create a variable to hold a whole number
    Declare Integer age

    // Create a variable to hold text
    Declare String name
End Module`,
      },
      {
        title: 'Assigning Values',
        targetId: 'code-editor',
        position: 'right',
        content: "Use the `Set` command to store a value in a variable. This is called 'assignment'.",
        code: `Module main()
    Declare Integer score
    
    // Assign the value 100 to the score variable
    Set score = 100

    Display "The score is: ", score
End Module`,
      },
      {
        title: 'Getting User Input',
        targetId: 'console-panel',
        position: 'top',
        content: "Use the `Input` command to pause the program and wait for the user to type something. The value entered is then stored in the specified variable.",
        code: `Module main()
    Declare String userName
    
    Display "What is your name?"
    Input userName
    
    Display "Hello, ", userName, "!"
End Module`,
      },
      {
        title: 'Calculations',
        targetId: 'code-editor',
        position: 'right',
        content: "You can perform math operations and assign the result to a variable. The expression on the right is calculated first, then its result is stored in the variable on the left.",
        code: `Module main()
    Declare Real grossPay, hours, payRate
    
    Display "Enter the number of hours"
    Input hours
    
    Display "Enter the hourly pay rate"
    Input payRate
    
    Set grossPay = hours * payRate
    
    Display "The gross pay is $", grossPay
End Module`,
      },
    ]
  },
  {
    topic: 'Conditional Logic',
    description: 'Enable your program to make decisions.',
    steps: [
      {
        title: 'The If-Then Statement',
        targetId: 'code-editor',
        position: 'right',
        content: "An `If` statement runs a block of code only if a certain condition is true. The condition is a question that results in a True or False answer.",
        code: `Module main()
    Declare Integer temperature = 30
    
    // This code only runs if temperature is less than 40
    If temperature < 40 Then
        Display "A little cold, isn't it?"
    End If
End Module`,
      },
      {
        title: 'The If-Then-Else Statement',
        targetId: 'code-editor',
        position: 'right',
        content: "Add an `Else` block to run code when the condition is false. The program will choose one of the two paths.",
        code: `Module main()
    Declare Integer temperature
    Input temperature
    
    If temperature < 40 Then
        Display "A little cold, isn't it?"
    Else
        Display "Nice weather we're having."
    End If
End Module`,
      },
      {
        title: 'Nested Decisions',
        targetId: 'code-editor',
        position: 'right',
        content: "You can place `If` statements inside other `If` statements to test for multiple conditions.",
        code: `Module main()
    Declare Real salary
    Declare Integer yearsOnJob
    
    Input salary
    Input yearsOnJob

    If salary >= 30000 Then
        If yearsOnJob >= 2 Then
            Display "You qualify for the loan."
        Else
            Display "You must have been on your job for at least two years."
        End If
    Else
        Display "You must earn at least $30,000."
    End If
End Module`,
      },
      {
        title: 'Logical Operators',
        targetId: 'code-editor',
        position: 'right',
        content: "Use `AND` and `OR` to combine conditions. With `AND`, both conditions must be true. With `OR`, only one needs to be true.",
        code: `Module main()
    Declare Integer temperature
    Input temperature
    
    // Using AND
    If temperature < 20 And temperature > 0 Then
        Display "It's chilly, but not freezing."
    End If
    
    // Using OR
    If temperature <= 0 Or temperature >= 100 Then
        Display "It's either freezing or boiling!"
    End If
End Module`,
      },
    ]
  },
  {
    topic: 'Repetition Structures',
    description: 'Learn how to repeat blocks of code using loops.',
    steps: [
      {
        title: 'The While Loop',
        targetId: 'code-editor',
        position: 'right',
        content: "A `While` loop repeats code as long as a condition is true. The condition is checked **before** each iteration.",
        code: `Module main()
    Declare String keepGoing = "y"
    
    While keepGoing == "y"
        Display "I'm looping!"
        Display "Loop again? (Enter y for yes)"
        Input keepGoing
    End While
End Module`,
      },
      {
        title: 'The Do-While Loop',
        targetId: 'code-editor',
        position: 'right',
        content: "A `Do-While` loop is a 'post-test' loop. It executes the code block once, and **then** checks the condition to see if it should repeat. This guarantees the code runs at least once.",
        code: `Module main()
    Declare String keepGoing
    
    Do
        Display "I'm looping!"
        Display "Loop again? (Enter y for yes)"
        Input keepGoing
    While keepGoing == "y"
End Module`
      },
      {
        title: 'The For Loop',
        targetId: 'code-editor',
        position: 'right',
        content: "A `For` loop is a 'count-controlled' loop that repeats a specific number of times. It uses a counter variable that automatically increments.",
        code: `Module main()
    Declare Integer counter
    
    For counter = 1 To 5
        Display "Hello world"
    End For
End Module`,
      },
      {
        title: 'Calculating a Running Total',
        targetId: 'code-editor',
        position: 'right',
        content: "Loops are great for accumulating a total. You initialize a variable to 0, and then add to it inside the loop.",
        code: `Module main()
    Declare Integer total = 0
    Declare Integer counter, number
    
    For counter = 1 To 5
        Display "Enter a number."
        Input number
        Set total = total + number
    End For
    
    Display "The total is ", total
End Module`,
      },
    ]
  },
  {
    topic: 'Modules',
    description: 'Organize your code into reusable blocks called modules.',
    steps: [
      {
        title: 'Defining and Calling',
        targetId: 'code-editor',
        position: 'right',
        content: "A module is a group of statements that performs a specific task. You define it once, and then `Call` it whenever you need it. This helps simplify code and promotes reuse.",
        code: `Module showMessage()
    Display "Hello world."
End Module

Module main()
    Display "I have a message for you."
    Call showMessage()
    Display "That's all, folks!"
End Module`,
      },
      {
        title: 'Passing Arguments',
        targetId: 'code-editor',
        position: 'right',
        content: "You can pass data into a module. The data you send is an 'argument', and the variable in the module that receives it is a 'parameter'.",
        code: `Module showSum(Integer num1, Integer num2)
    Declare Integer result
    Set result = num1 + num2
    Display result
End Module

Module main()
    Display "The sum of 12 and 45 is:"
    Call showSum(12, 45)
End Module`,
      },
      {
        title: 'Pass by Reference',
        targetId: 'code-editor',
        position: 'right',
        content: "Normally, a module gets a copy of an argument's value. To allow a module to **modify the original variable**, you must pass it by reference using the `Ref` keyword. This creates a two-way communication link.",
        code: `Module getFeet(Integer Ref inputFeet)
    Display "Enter number of feet: "
    Input inputFeet
End Module

Module main()
    Declare Integer feet
    
    // getFeet will modify the 'feet' variable directly
    Call getFeet(feet)
    
    Display "You entered ", feet, " feet."
End Module`,
      },
    ]
  },
  {
    topic: 'Functions',
    description: 'Create special modules that calculate and return a value.',
    steps: [
      {
        title: 'What is a Function?',
        position: 'center',
        content: "A function is a module that **returns a value** back to the part of the program that called it. This is useful for calculations where you need a result to use in another expression.",
      },
      {
        title: 'Defining a Function',
        targetId: 'code-editor',
        position: 'right',
        content: "A function definition specifies the data type of the value it will return, its name, and its parameters. It uses a `Return` statement to send the value back.",
        code: `// This function accepts two numbers and
// returns their sum as an Integer.
Function Integer sum(Integer num1, Integer num2)
    Declare Integer result
    Set result = num1 + num2
    Return result
End Function

Module main()
    Declare Integer firstAge, secondAge, total
    
    Input firstAge
    Input secondAge
    
    // The function's return value is assigned to 'total'
    Set total = sum(firstAge, secondAge)
    
    Display "Together you are ", total, " years old."
End Module`
      },
      {
        title: 'Library Functions',
        targetId: 'code-editor',
        position: 'right',
        content: "Most languages provide built-in 'library functions' for common tasks. This interpreter includes functions like `random`, `power`, `sqrt`, `length`, and more. You don't have to write them yourself!",
        code: `Module main()
    Declare Real result, area
    
    Set result = sqrt(16)
    Display "The square root of 16 is ", result
    
    Set area = power(4, 2)
    Display "4 to the power of 2 is ", area
End Module`
      },
    ]
  },
  {
    topic: 'Arrays & Recursion',
    description: 'Explore advanced topics for handling data and solving problems.',
    steps: [
      {
        title: 'Arrays',
        position: 'center',
        content: "An array is a variable that can store a list of values of the same type. This is useful for managing collections of data, like a list of scores or names.",
      },
      {
        title: 'Declaring and Using Arrays',
        targetId: 'code-editor',
        position: 'right',
        content: "You declare an array with a size in square brackets. You access individual elements using an index, which **always starts at 0**.",
        code: `Module main()
    // Declare an array that can hold 3 integers
    Declare Integer scores[3]
    
    // Assign values to elements
    Set scores[0] = 85
    Set scores[1] = 90
    Set scores[2] = 78
    
    // Display the second element (at index 1)
    Display "The second score is: ", scores[1]
End Module`,
      },
      {
        title: 'What is Recursion?',
        position: 'center',
        content: "Recursion is a technique where a module or function calls itself to solve a problem. It's a different way of thinking about repetition, breaking a problem into smaller, identical versions of itself.",
      },
      {
        title: 'Recursive Example',
        targetId: 'code-editor',
        position: 'right',
        content: "A recursive function must have a 'base case'—a condition that stops the recursion. Here, the base case is `If n == 0`. Otherwise, the function calls itself with a smaller value (`n - 1`), until it reaches the base case.",
        code: `Function Integer factorial(Integer n)
    If n == 0 Then
        // Base case
        Return 1
    Else
        // Recursive step
        Return n * factorial(n - 1)
    End If
End Function

Module main()
    Declare Integer number = 4
    Display "The factorial of 4 is ", factorial(number)
End Module`,
      },
    ]
  },
  {
    topic: 'Debugging',
    description: 'Learn how to find and fix errors in your code.',
    steps: [
      {
        title: 'Finding Mistakes',
        targetId: 'debug-button',
        position: 'bottom',
        content: "Errors in code are called 'bugs'. The **Debugger** is your primary tool for finding them. It lets you execute your program one line at a time to see exactly what's happening.",
      },
      {
        title: 'Stepping Through Code',
        targetId: 'debug-button',
        position: 'bottom',
        content: "Click 'Debug' to start. A blue line highlights the *next* line to be executed. Press 'Step Over' to run just that line. You can walk through your entire program this way.",
        code: `Module main()
    Declare Integer x = 5
    Set x = x + 10
    Set x = x * 2
    Display x
End Module`
      },
      {
        title: 'Watching Variables',
        targetId: 'console-panel',
        position: 'top',
        content: "The real power of debugging is watching your variables. While stepping through code, click the **Debugger** tab in this panel. It shows a live list of all variables and their current values, letting you see exactly when something goes wrong.",
        code: `Module main()
    Declare Integer x = 5
    Set x = x + 10 // After this step, x will be 15
    Set x = x * 2  // After this step, x will be 30
    Display x
End Module`
      },
    ]
  }
];
