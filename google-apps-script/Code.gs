const SHEET_NAME = 'todos';
const HEADERS = ['id', 'title', 'content', 'due_date', 'created_at', 'updated_at'];
const TITLE_MAX = 100;
const CONTENT_MAX = 1000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      switch (body.action) {
        case 'list':
          return respond({ ok: true, data: listTodos() });
        case 'create':
          return respond({ ok: true, data: createTodo(validateInput(body)) });
        case 'update':
          return respond({ ok: true, data: updateTodo(body.id, validateInput(body)) });
        default:
          return respond({ ok: false, error: '不明な操作です' });
      }
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return respond({ ok: false, error: String(err.message || err) });
  }
}

function respond(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function validateInput(body) {
  const title = String(body.title || '').trim();
  const content = String(body.content || '').trim();
  const dueDate = String(body.due_date || '').trim();
  if (!title) throw new Error('タイトルを入力してください');
  if (title.length > TITLE_MAX) throw new Error('タイトルが長すぎます');
  if (content.length > CONTENT_MAX) throw new Error('内容が長すぎます');
  if (dueDate && !DATE_PATTERN.test(dueDate)) throw new Error('期日の形式が正しくありません');
  return { title: title, content: content, due_date: dueDate };
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).setNumberFormat('@');
  }
  return sheet;
}

function listTodos() {
  const sheet = getSheet();
  const last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet
    .getRange(2, 1, last - 1, HEADERS.length)
    .getValues()
    .filter(function (row) {
      return row[0] !== '';
    })
    .map(rowToTodo);
}

function createTodo(input) {
  const sheet = getSheet();
  const now = new Date().toISOString();
  const todo = {
    id: Utilities.getUuid(),
    title: input.title,
    content: input.content,
    due_date: input.due_date,
    created_at: now,
    updated_at: now,
  };
  sheet.appendRow(toRow(todo));
  return todo;
}

function updateTodo(id, input) {
  const sheet = getSheet();
  const last = sheet.getLastRow();
  const ids = last < 2
    ? []
    : sheet.getRange(2, 1, last - 1, 1).getValues().map(function (row) {
        return String(row[0]);
      });
  const index = ids.indexOf(String(id));
  if (index === -1) throw new Error('対象のやることが見つかりません');

  const rowNumber = index + 2;
  const range = sheet.getRange(rowNumber, 1, 1, HEADERS.length);
  const existing = rowToTodo(range.getValues()[0]);
  const todo = Object.assign({}, existing, input, { updated_at: new Date().toISOString() });
  range.setValues([toRow(todo)]);
  return todo;
}

function rowToTodo(row) {
  return {
    id: String(row[0]),
    title: String(row[1]),
    content: String(row[2]),
    due_date: String(row[3]),
    created_at: String(row[4]),
    updated_at: String(row[5]),
  };
}

function toRow(todo) {
  return [todo.id, todo.title, todo.content, todo.due_date, todo.created_at, todo.updated_at];
}
