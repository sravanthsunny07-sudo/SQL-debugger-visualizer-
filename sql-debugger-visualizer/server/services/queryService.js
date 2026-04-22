import databaseManager from "../db/databaseManager.js";

function toSafeMessage(error) {
  if (!(error instanceof Error) || !error.message) {
    return "Unable to execute the SQL query.";
  }

  return error.message.replace(/^SqliteError:\s*/i, "");
}

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function getDatabase() {
  return databaseManager.getCurrentDatabase();
}

function normalizeValue(rawValue) {
  const value = rawValue.trim().replace(/;$/, "");

  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
  }

  const numericValue = Number(value);

  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }

  return value;
}

function parseDatabaseCommand(query) {
  const normalizedQuery = query.trim().replace(/;$/, "");

  let match = normalizedQuery.match(/^CREATE\s+DATABASE\s+([a-zA-Z_][\w]*)$/i);

  if (match) {
    return {
      type: "CREATE_DATABASE",
      databaseName: match[1]
    };
  }

  match = normalizedQuery.match(/^USE\s+([a-zA-Z_][\w]*)$/i);

  if (match) {
    return {
      type: "USE_DATABASE",
      databaseName: match[1]
    };
  }

  if (/^SHOW\s+DATABASES$/i.test(normalizedQuery)) {
    return {
      type: "SHOW_DATABASES"
    };
  }

  return null;
}

function parseSimpleSelectQuery(query) {
  const normalizedQuery = query.trim().replace(/;$/, "");
  const match = normalizedQuery.match(
    /^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z_][\w]*)(?:\s+WHERE\s+([a-zA-Z_][\w]*)\s*(=|!=|<>|>=|<=|>|<)\s*(.+))?$/i
  );

  if (!match) {
    return null;
  }

  const [, rawColumns, tableName, whereColumn, operator, rawWhereValue] = match;
  const columns =
    rawColumns.trim() === "*"
      ? "*"
      : rawColumns.split(",").map((column) => column.trim()).filter(Boolean);

  if (Array.isArray(columns) && columns.length === 0) {
    return null;
  }

  return {
    tableName,
    columns,
    where: whereColumn
      ? {
          column: whereColumn.trim(),
          operator,
          value: normalizeValue(rawWhereValue)
        }
      : null
  };
}

function parseInnerJoinQuery(query) {
  const normalizedQuery = query.trim().replace(/;$/, "");
  const match = normalizedQuery.match(
    /^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z_][\w]*)\s+INNER\s+JOIN\s+([a-zA-Z_][\w]*)\s+ON\s+([a-zA-Z_][\w]*)\.([a-zA-Z_][\w]*)\s*=\s*([a-zA-Z_][\w]*)\.([a-zA-Z_][\w]*)$/i
  );

  if (!match) {
    return null;
  }

  const [
    ,
    rawColumns,
    leftTable,
    rightTable,
    leftAlias,
    leftColumn,
    rightAlias,
    rightColumn
  ] = match;

  const columns =
    rawColumns.trim() === "*"
      ? "*"
      : rawColumns.split(",").map((column) => column.trim()).filter(Boolean);

  if (Array.isArray(columns) && columns.length === 0) {
    return null;
  }

  if (
    leftAlias.toLowerCase() !== leftTable.toLowerCase() ||
    rightAlias.toLowerCase() !== rightTable.toLowerCase()
  ) {
    throw new Error("Only direct table.column INNER JOIN conditions are supported.");
  }

  return {
    columns,
    leftTable,
    rightTable,
    on: {
      leftTable,
      leftColumn,
      rightTable,
      rightColumn
    }
  };
}

function compareValues(left, operator, right) {
  switch (operator) {
    case "=":
      return left === right;
    case "!=":
    case "<>":
      return left !== right;
    case ">":
      return left > right;
    case "<":
      return left < right;
    case ">=":
      return left >= right;
    case "<=":
      return left <= right;
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

function applyWhereClause(rows, whereClause) {
  if (!whereClause) {
    return rows;
  }

  const { column, operator, value } = whereClause;

  return rows.filter((row) => {
    if (!(column in row)) {
      throw new Error(`Unknown column in WHERE clause: ${column}`);
    }

    return compareValues(row[column], operator, value);
  });
}

function applySelectClause(rows, columns) {
  if (columns === "*") {
    return cloneRows(rows);
  }

  return rows.map((row) => {
    const projectedRow = {};

    for (const column of columns) {
      if (!(column in row)) {
        throw new Error(`Unknown column in SELECT clause: ${column}`);
      }

      projectedRow[column] = row[column];
    }

    return projectedRow;
  });
}

function describeWhereClause(whereClause) {
  if (!whereClause) {
    return null;
  }

  const value =
    typeof whereClause.value === "string" ? `'${whereClause.value}'` : String(whereClause.value);

  return `Filter rows where ${whereClause.column} ${whereClause.operator} ${value}`;
}

function buildQualifiedRow(tableName, row) {
  const qualifiedRow = {};

  for (const [key, value] of Object.entries(row)) {
    qualifiedRow[`${tableName}.${key}`] = value;
  }

  return qualifiedRow;
}

function applyJoinSelectClause(rows, columns) {
  if (columns === "*") {
    return cloneRows(rows);
  }

  return rows.map((row) => {
    const projectedRow = {};

    for (const column of columns) {
      if (!(column in row)) {
        throw new Error(`Unknown column in SELECT clause: ${column}`);
      }

      projectedRow[column] = row[column];
    }

    return projectedRow;
  });
}

function executeInnerJoinQuery(parsedQuery) {
  const database = getDatabase();
  const leftRows = database.prepare(`SELECT * FROM ${parsedQuery.leftTable}`).all();
  const rightRows = database.prepare(`SELECT * FROM ${parsedQuery.rightTable}`).all();
  const joinedRows = [];
  const matches = [];

  for (const leftRow of leftRows) {
    if (!(parsedQuery.on.leftColumn in leftRow)) {
      throw new Error(`Unknown column in JOIN condition: ${parsedQuery.on.leftTable}.${parsedQuery.on.leftColumn}`);
    }

    for (const rightRow of rightRows) {
      if (!(parsedQuery.on.rightColumn in rightRow)) {
        throw new Error(
          `Unknown column in JOIN condition: ${parsedQuery.on.rightTable}.${parsedQuery.on.rightColumn}`
        );
      }

      if (leftRow[parsedQuery.on.leftColumn] === rightRow[parsedQuery.on.rightColumn]) {
        joinedRows.push({
          ...buildQualifiedRow(parsedQuery.leftTable, leftRow),
          ...buildQualifiedRow(parsedQuery.rightTable, rightRow)
        });
        matches.push({
          leftId: leftRow.id ?? null,
          rightId: rightRow.id ?? null,
          leftValue: leftRow[parsedQuery.on.leftColumn],
          rightValue: rightRow[parsedQuery.on.rightColumn]
        });
      }
    }
  }

  const finalRows = applyJoinSelectClause(joinedRows, parsedQuery.columns);

  return {
    data: finalRows,
    steps: [
      {
        name: "LOAD_USERS",
        description: `Load table ${parsedQuery.leftTable}`,
        data: cloneRows(leftRows),
        tableName: parsedQuery.leftTable
      },
      {
        name: "LOAD_ORDERS",
        description: `Load table ${parsedQuery.rightTable}`,
        data: cloneRows(rightRows),
        tableName: parsedQuery.rightTable
      },
      {
        name: "JOIN",
        description: `Matching ${parsedQuery.on.leftTable}.${parsedQuery.on.leftColumn} with ${parsedQuery.on.rightTable}.${parsedQuery.on.rightColumn}`,
        data: cloneRows(finalRows),
        joinPreview: {
          leftTable: parsedQuery.leftTable,
          rightTable: parsedQuery.rightTable,
          leftRows: cloneRows(leftRows),
          rightRows: cloneRows(rightRows),
          leftKey: parsedQuery.on.leftColumn,
          rightKey: parsedQuery.on.rightColumn,
          matches
        }
      }
    ],
    final: finalRows
  };
}

function executeSimpleSelectQuery(parsedQuery) {
  const database = getDatabase();
  const baseRows = database.prepare(`SELECT * FROM ${parsedQuery.tableName}`).all();
  const steps = [
    {
      name: "FROM",
      description: `Load table ${parsedQuery.tableName}`,
      data: cloneRows(baseRows)
    }
  ];

  const filteredRows = applyWhereClause(baseRows, parsedQuery.where);

  if (parsedQuery.where) {
    steps.push({
      name: "WHERE",
      description: describeWhereClause(parsedQuery.where),
      data: cloneRows(filteredRows)
    });
  }

  const finalRows = applySelectClause(filteredRows, parsedQuery.columns);

  steps.push({
    name: "SELECT",
    description: "Final result",
    data: cloneRows(finalRows)
  });

  return {
    data: finalRows,
    steps,
    final: finalRows
  };
}

function executeDatabaseCommand(command) {
  switch (command.type) {
    case "CREATE_DATABASE": {
      const result = databaseManager.createDatabase(command.databaseName);

      return {
        data: [],
        steps: [],
        final: [],
        message: result.created
          ? `Database '${result.name}' created`
          : `Database '${result.name}' already exists`
      };
    }
    case "USE_DATABASE":
      databaseManager.useDatabase(command.databaseName);

      return {
        data: [],
        steps: [],
        final: [],
        message: `Using database '${command.databaseName}'`
      };
    case "SHOW_DATABASES":
      return {
        data: databaseManager.listDatabases(),
        steps: [],
        final: databaseManager.listDatabases()
      };
    default:
      throw new Error("Unsupported database command");
  }
}

export function executeQuery(query) {
  if (typeof query !== "string" || query.trim().length === 0) {
    throw new Error("Query must be a non-empty string.");
  }

  try {
    const databaseCommand = parseDatabaseCommand(query);

    if (databaseCommand) {
      return executeDatabaseCommand(databaseCommand);
    }

    const parsedJoinQuery = parseInnerJoinQuery(query);

    if (parsedJoinQuery) {
      return executeInnerJoinQuery(parsedJoinQuery);
    }

    const parsedQuery = parseSimpleSelectQuery(query);

    if (parsedQuery) {
      return executeSimpleSelectQuery(parsedQuery);
    }

    const statement = getDatabase().prepare(query);

    if (statement.reader) {
      const rows = statement.all();

      return {
        data: rows,
        steps: [],
        final: rows
      };
    }

    statement.run();
    return {
      data: [],
      steps: [],
      final: []
    };
  } catch (error) {
    throw new Error(toSafeMessage(error));
  }
}
