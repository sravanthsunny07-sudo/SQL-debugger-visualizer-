export const sqlTopics = [
  {
    category: "SQL Fundamentals",
    topics: [
      {
        title: "What is SQL",
        description: "SQL is used to query and manage data stored in relational tables.",
        query: "SELECT * FROM users;"
      },
      {
        title: "Selecting Specific Columns",
        description: "Choose only the columns you need instead of returning every field.",
        query: "SELECT id, name FROM users;"
      }
    ]
  },
  {
    category: "Data Types",
    topics: [
      {
        title: "Inspect Table Column Types",
        description: "Use PRAGMA to view the column definitions and data types in a table.",
        query: "PRAGMA table_info(users);"
      }
    ]
  },
  {
    category: "SQL Commands",
    topics: [
      {
        title: "Read Data with SELECT",
        description: "SELECT retrieves rows from a table without modifying the stored data.",
        query: "SELECT * FROM orders;"
      }
    ]
  },
  {
    category: "Filtering & Sorting",
    topics: [
      {
        title: "Filter Rows with WHERE",
        description: "WHERE limits results to rows that satisfy a condition.",
        query: "SELECT * FROM users WHERE age > 25;"
      },
      {
        title: "Sort Results",
        description: "ORDER BY arranges the returned rows in ascending or descending order.",
        query: "SELECT * FROM users ORDER BY age DESC;"
      }
    ]
  },
  {
    category: "Functions",
    topics: [
      {
        title: "Aggregate with COUNT",
        description: "COUNT returns the number of rows in a result set.",
        query: "SELECT COUNT(*) AS total_users FROM users;"
      }
    ]
  },
  {
    category: "GROUP BY & HAVING",
    topics: [
      {
        title: "Group Orders by User",
        description: "GROUP BY combines rows that share a value so aggregates can be calculated per group.",
        query: "SELECT user_id, COUNT(*) AS total_orders FROM orders GROUP BY user_id HAVING COUNT(*) >= 1;"
      }
    ]
  },
  {
    category: "Joins",
    topics: [
      {
        title: "Inner Join Basics",
        description: "INNER JOIN combines rows from two tables when the join condition matches.",
        query: "SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id;"
      }
    ]
  },
  {
    category: "Subqueries",
    topics: [
      {
        title: "Use a Subquery in WHERE",
        description: "A subquery can feed values into the outer query for filtering.",
        query: "SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);"
      }
    ]
  },
  {
    category: "Constraints",
    topics: [
      {
        title: "Inspect Constraints",
        description: "PRAGMA table_info helps reveal not-null rules and primary key information.",
        query: "PRAGMA table_info(orders);"
      }
    ]
  },
  {
    category: "Indexes",
    topics: [
      {
        title: "List Table Indexes",
        description: "PRAGMA index_list shows the indexes currently defined for a table.",
        query: "PRAGMA index_list('users');"
      }
    ]
  },
  {
    category: "Views",
    topics: [
      {
        title: "Inspect Existing Views",
        description: "Query sqlite_master to see whether any views are currently available.",
        query: "SELECT name, sql FROM sqlite_master WHERE type = 'view';"
      }
    ]
  },
  {
    category: "Stored Procedures",
    topics: [
      {
        title: "Stored Procedure Support",
        description: "SQLite does not support stored procedures natively, but you can still document that with a simple query.",
        query: "SELECT 'SQLite does not support stored procedures natively.' AS note;"
      }
    ]
  },
  {
    category: "Triggers",
    topics: [
      {
        title: "Inspect Triggers",
        description: "Query sqlite_master to review any trigger definitions in the database.",
        query: "SELECT name, sql FROM sqlite_master WHERE type = 'trigger';"
      }
    ]
  },
  {
    category: "Transactions",
    topics: [
      {
        title: "Transaction Status Example",
        description: "This example returns a message instead of mutating data, keeping the learning flow safe.",
        query: "SELECT 'Transactions group multiple statements into a single unit of work.' AS note;"
      }
    ]
  },
  {
    category: "Normalization",
    topics: [
      {
        title: "Normalized Data Through Joins",
        description: "Related data is often split across tables and recombined through joins.",
        query: "SELECT users.name, orders.product FROM users INNER JOIN orders ON users.id = orders.user_id;"
      }
    ]
  },
  {
    category: "Advanced SQL",
    topics: [
      {
        title: "CASE Expression",
        description: "CASE lets you derive readable labels from raw values in a query.",
        query: "SELECT name, CASE WHEN age >= 30 THEN '30 and above' ELSE 'Under 30' END AS age_group FROM users;"
      }
    ]
  }
];
